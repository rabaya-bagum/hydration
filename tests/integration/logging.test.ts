import { flushPending, type RemoteLogApi } from '@/data/sync';
import { logDrink, removeLogWithUndo } from '@/features/logging/logActions';
import { buildSummaries } from '@/domain/progress';
import type { DrinkLog } from '@/domain/types';
import { runHealthSync, type HealthProvider } from '@/services/health';
import { useHealthStore } from '@/store/healthStore';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';

const today = () => {
  const { logs } = useLogsStore.getState();
  const { weighting, goalFor } = useSettingsStore.getState();
  return [...buildSummaries(logs, { weighting, goalFor }).values()].reduce((s, d) => s + d.totalMl, 0);
};

function fakeRemote(opts: { fail?: boolean } = {}) {
  const rows = new Map<string, DrinkLog>();
  const api: RemoteLogApi & { rows: Map<string, DrinkLog>; calls: number; fail: boolean } = {
    rows, calls: 0, fail: !!opts.fail,
    async upsertLogs(logs) {
      api.calls++;
      if (api.fail) throw new Error('offline');
      for (const l of logs) { const cur = rows.get(l.id); if (!cur || l.updatedAt >= cur.updatedAt) rows.set(l.id, l); }
    },
    async fetchLogsSince() { return [...rows.values()]; },
  };
  return api;
}

beforeEach(async () => {
  await useLogsStore.persist.rehydrate();
  await useSettingsStore.persist.rehydrate();
  useLogsStore.getState().clear();
  useSettingsStore.getState().resetAll();
  useSettingsStore.getState().patch({ goalMl: 2000 });
  useUiStore.setState({ toast: undefined, celebrate: undefined });
});

describe('logging', () => {
  it('logs in one call, updates totals instantly and queues sync', () => {
    logDrink({ drinkTypeId: 'water', volumeMl: 350 });
    expect(today()).toBe(350);
    expect(useLogsStore.getState().pendingSync).toHaveLength(1);
    expect(useUiStore.getState().toast?.message).toMatch(/left/);
  });
  it('edits, deletes (with undo) and duplicates', () => {
    const log = logDrink({ drinkTypeId: 'water', volumeMl: 300 });
    useLogsStore.getState().updateLog(log.id, { volumeMl: 500, hydrationMl: 500 });
    expect(today()).toBe(500);
    removeLogWithUndo(log.id);
    expect(today()).toBe(0);
    useUiStore.getState().toast?.onAction?.();
    expect(today()).toBe(500);
    useLogsStore.getState().duplicateLog(log.id);
    expect(today()).toBe(1000);
  });
  it('celebrates exactly once on crossing the goal', () => {
    logDrink({ drinkTypeId: 'water', volumeMl: 1900 });
    expect(useUiStore.getState().celebrate).toBeUndefined();
    logDrink({ drinkTypeId: 'water', volumeMl: 200 });
    const id = useUiStore.getState().celebrate?.id;
    expect(id).toBeDefined();
    useUiStore.getState().endCelebration();
    logDrink({ drinkTypeId: 'water', volumeMl: 200 });
    expect(useUiStore.getState().celebrate).toBeUndefined();
  });
  it('applies hydration factor to non-water drinks', () => {
    const log = logDrink({ drinkTypeId: 'coffee', volumeMl: 200 });
    expect(log.hydrationMl).toBe(180);
  });
  it('mid-day goal change keeps logs and re-evaluates progress', () => {
    logDrink({ drinkTypeId: 'water', volumeMl: 1500 });
    const day = new Date().toISOString().slice(0, 10);
    useSettingsStore.getState().setGoal(1500, day);
    const { logs } = useLogsStore.getState();
    const s = buildSummaries(logs, { weighting: false, goalFor: useSettingsStore.getState().goalFor });
    expect([...s.values()][0]!.goalReachedAt).toBeDefined();
  });
});

describe('offline sync', () => {
  it('keeps the queue while offline, then syncs without duplicates', async () => {
    const remote = fakeRemote({ fail: true });
    const a = logDrink({ drinkTypeId: 'water', volumeMl: 250 });
    logDrink({ drinkTypeId: 'tea', volumeMl: 200 });
    await expect(flushPending(remote)).rejects.toThrow('offline');
    expect(useLogsStore.getState().pendingSync).toHaveLength(2);
    expect(today()).toBe(450); // still fully usable offline

    useLogsStore.getState().updateLog(a.id, { volumeMl: 300, hydrationMl: 300 });
    expect(useLogsStore.getState().pendingSync).toHaveLength(2); // edit does not queue twice

    remote.fail = false;
    expect(await flushPending(remote)).toBe(2);
    expect(useLogsStore.getState().pendingSync).toHaveLength(0);
    expect(remote.rows.size).toBe(2);
    expect(remote.rows.get(a.id)!.volumeMl).toBe(300);

    // retrying with nothing pending is a no-op; re-upserting is idempotent
    expect(await flushPending(remote)).toBe(0);
    useLogsStore.getState().markSynced([], {});
    expect(remote.rows.size).toBe(2);
  });
  it('syncs deletions as soft deletes', async () => {
    const remote = fakeRemote();
    const l = logDrink({ drinkTypeId: 'water', volumeMl: 250 });
    await flushPending(remote);
    removeLogWithUndo(l.id);
    await flushPending(remote);
    expect(remote.rows.get(l.id)!.deletedAt).toBeDefined();
  });
  it('an edit made during upload stays queued', async () => {
    const remote = fakeRemote();
    const l = logDrink({ drinkTypeId: 'water', volumeMl: 250 });
    const origUpsert = remote.upsertLogs.bind(remote);
    remote.upsertLogs = async (logs) => {
      await origUpsert(logs);
      await new Promise((r) => setTimeout(r, 2));
      useLogsStore.getState().updateLog(l.id, { volumeMl: 400, hydrationMl: 400 });
    };
    await flushPending(remote);
    expect(useLogsStore.getState().pendingSync).toContain(l.id);
  });
  it('merging remote data does not clobber newer local edits', () => {
    const l = logDrink({ drinkTypeId: 'water', volumeMl: 250 });
    useLogsStore.getState().mergeRemote([{ ...l, volumeMl: 999, updatedAt: '2000-01-01T00:00:00.000Z' }]);
    expect(useLogsStore.getState().logs.find((x) => x.id === l.id)!.volumeMl).toBe(250);
  });
});


describe('health sync', () => {
  const fake = (fail = false) => {
    const written = new Map<string, number>();
    const p: HealthProvider & { written: Map<string, number>; fail: boolean } = {
      name: 'fake', written, fail,
      isAvailable: async () => true, requestAuthorization: async () => true,
      writeWater: async (e) => { if (p.fail) throw new Error('denied'); written.set(e.id, e.volumeMl); },
      deleteWater: async (id) => { if (p.fail) throw new Error('denied'); written.delete(id); },
    };
    return p;
  };
  beforeEach(() => { useHealthStore.getState().clear(); });

  it('mirrors water once, ignores coffee, and removes deleted logs', async () => {
    const p = fake();
    const w = logDrink({ drinkTypeId: 'water', volumeMl: 300 });
    logDrink({ drinkTypeId: 'coffee', volumeMl: 200 });
    expect(await runHealthSync(useLogsStore.getState().logs, p)).toEqual({ written: 1, deleted: 0, failed: 0 });
    expect(await runHealthSync(useLogsStore.getState().logs, p)).toEqual({ written: 0, deleted: 0, failed: 0 });
    expect([...p.written.values()]).toEqual([300]);
    removeLogWithUndo(w.id);
    expect(await runHealthSync(useLogsStore.getState().logs, p)).toEqual({ written: 0, deleted: 1, failed: 0 });
    expect(p.written.size).toBe(0);
  });
  it('keeps failures for retry', async () => {
    const p = fake(true);
    logDrink({ drinkTypeId: 'water', volumeMl: 300 });
    expect((await runHealthSync(useLogsStore.getState().logs, p)).failed).toBe(1);
    p.fail = false;
    expect((await runHealthSync(useLogsStore.getState().logs, p)).written).toBe(1);
  });
});
