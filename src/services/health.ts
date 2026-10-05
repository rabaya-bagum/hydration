import { planHealthSync } from '@/domain/healthSync';
import type { DrinkLog } from '@/domain/types';
import { useHealthStore } from '@/store/healthStore';

/**
 * Boundary to Apple Health / Health Connect. Native adapters (HealthKit, Health Connect) need a development
 * build and implement this interface; they are registered at startup. Plink only ever WRITES water volume.
 */
export interface HealthProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  requestAuthorization(): Promise<boolean>;
  writeWater(entry: { id: string; volumeMl: number; at: string }): Promise<void>;
  deleteWater(id: string): Promise<void>;
}

export const unavailableHealth: HealthProvider = {
  name: 'none',
  async isAvailable() { return false; },
  async requestAuthorization() { return false; },
  async writeWater() { throw new Error('Health integration is not available in this build.'); },
  async deleteWater() { throw new Error('Health integration is not available in this build.'); },
};

let provider: HealthProvider = unavailableHealth;
export const getHealthProvider = () => provider;
export const registerHealthProvider = (p: HealthProvider) => { provider = p; };

/** Apply the pending diff. Failures are left for the next run; successes are recorded so nothing is written twice. */
export async function runHealthSync(logs: DrinkLog[], p: HealthProvider = provider): Promise<{ written: number; deleted: number; failed: number }> {
  const store = useHealthStore.getState();
  const result = { written: 0, deleted: 0, failed: 0 };
  for (const op of planHealthSync(logs, store.exported)) {
    try {
      if (op.op === 'write') {
        await p.writeWater({ id: op.log.id, volumeMl: op.log.volumeMl, at: op.log.loggedAt });
        useHealthStore.getState().markExported(op.log.id, op.log.updatedAt);
        result.written++;
      } else {
        await p.deleteWater(op.id);
        useHealthStore.getState().unmark(op.id);
        result.deleted++;
      }
    } catch {
      result.failed++;
    }
  }
  return result;
}
