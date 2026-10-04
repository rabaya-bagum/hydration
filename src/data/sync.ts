import type { DrinkLog } from '@/domain/types';
import { useLogsStore } from '@/store/logsStore';

/** Backend-agnostic remote. Swap the implementation without touching UI. */
export interface RemoteLogApi {
  /** Idempotent: rows are keyed by client id; remote keeps the row with the newest updatedAt. */
  upsertLogs(logs: DrinkLog[]): Promise<void>;
  fetchLogsSince(updatedAfter?: string): Promise<DrinkLog[]>;
}

let flushing: Promise<number> | null = null;

/** Drain the pending queue. Safe to call repeatedly; concurrent calls share one run. Returns uploaded count. */
export function flushPending(remote: RemoteLogApi, batchSize = 100): Promise<number> {
  if (flushing) return flushing;
  const run = (async () => {
    let total = 0;
    const attempted = new Set<string>(); // an id edited mid-upload stays queued but is retried on the next flush, not in a loop
    for (;;) {
      const { pendingSync, logs } = useLogsStore.getState();
      const ids = pendingSync.filter((id) => !attempted.has(id)).slice(0, batchSize);
      if (!ids.length) break;
      ids.forEach((id) => attempted.add(id));
      const byId = new Map(logs.map((l) => [l.id, l]));
      const batch = ids.map((id) => byId.get(id)).filter((l): l is DrinkLog => !!l);
      const versions = Object.fromEntries(batch.map((l) => [l.id, l.updatedAt]));
      if (batch.length) await remote.upsertLogs(batch);
      useLogsStore.getState().markSynced(ids, versions);
      // ids with no local row can never upload: drop them
      if (batch.length < ids.length) useLogsStore.setState((s) => ({ pendingSync: s.pendingSync.filter((i) => byId.has(i) || !ids.includes(i)) }));
      total += batch.length;
    }
    return total;
  })();
  flushing = run;
  const clear = () => { if (flushing === run) flushing = null; };
  run.then(clear, clear);
  return run;
}

export async function pullRemote(remote: RemoteLogApi, since?: string) {
  useLogsStore.getState().mergeRemote(await remote.fetchLogsSince(since));
}
