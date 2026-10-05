import type { DrinkLog } from './types';

/** Only plain water is mirrored to Health apps; coffee, soda etc. are not "water" there. */
export const HEALTH_DRINK_IDS = new Set(['water', 'infused']);

export type HealthOp = { op: 'write'; log: DrinkLog } | { op: 'delete'; id: string };

/**
 * Diff local logs against what was already exported (id -> updatedAt exported).
 * New or changed live logs are (re)written, deleted/edited-away logs are removed.
 * Pure: the caller performs the ops and records successes.
 */
export function planHealthSync(logs: DrinkLog[], exported: Record<string, string>): HealthOp[] {
  const ops: HealthOp[] = [];
  const live = new Map<string, DrinkLog>();
  for (const l of logs) if (!l.deletedAt && HEALTH_DRINK_IDS.has(l.drinkTypeId)) live.set(l.id, l);
  for (const l of live.values()) if (exported[l.id] !== l.updatedAt) ops.push({ op: 'write', log: l });
  for (const id of Object.keys(exported)) if (!live.has(id)) ops.push({ op: 'delete', id });
  return ops;
}
