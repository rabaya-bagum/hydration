import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrinkLog, LogSource } from '@/domain/types';
import { newId } from '@/services/uuid';
import { jsonStorage } from './storage';

export interface NewLogInput {
  drinkTypeId: string;
  volumeMl: number;
  hydrationFactor: number;
  containerId?: string;
  loggedAt?: string;
  tz: string;
  source: LogSource;
}

export interface LogsState {
  logs: DrinkLog[];
  /** Ids needing upload. A set (not an op list) so repeated edits never create duplicate remote rows. */
  pendingSync: string[];
  addLog: (input: NewLogInput) => DrinkLog;
  updateLog: (id: string, patch: Partial<Pick<DrinkLog, 'drinkTypeId' | 'volumeMl' | 'hydrationMl' | 'loggedAt' | 'containerId' | 'tz'>>) => void;
  deleteLog: (id: string) => void; // soft delete so it can sync and be undone
  restoreLog: (id: string) => void;
  duplicateLog: (id: string, nowIso?: string) => DrinkLog | undefined;
  markSynced: (ids: string[], syncedUpdatedAt: Record<string, string>) => void;
  mergeRemote: (remote: DrinkLog[]) => void;
  clear: () => void;
}

const nowIso = () => new Date().toISOString();
const enqueue = (pending: string[], id: string) => (pending.includes(id) ? pending : [...pending, id]);

export const useLogsStore = create<LogsState>()(
  persist(
    (set, get) => ({
      logs: [],
      pendingSync: [],
      addLog: (input) => {
        const ts = nowIso();
        const log: DrinkLog = {
          id: newId(), drinkTypeId: input.drinkTypeId, volumeMl: Math.round(input.volumeMl),
          hydrationMl: Math.round(input.volumeMl * input.hydrationFactor), containerId: input.containerId,
          loggedAt: input.loggedAt ?? ts, tz: input.tz, source: input.source, createdAt: ts, updatedAt: ts,
        };
        set((s) => ({ logs: [...s.logs, log], pendingSync: enqueue(s.pendingSync, log.id) }));
        return log;
      },
      updateLog: (id, patch) =>
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: nowIso() } : l)),
          pendingSync: enqueue(s.pendingSync, id),
        })),
      deleteLog: (id) =>
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, deletedAt: nowIso(), updatedAt: nowIso() } : l)),
          pendingSync: enqueue(s.pendingSync, id),
        })),
      restoreLog: (id) =>
        set((s) => ({
          logs: s.logs.map((l) => (l.id === id ? { ...l, deletedAt: undefined, updatedAt: nowIso() } : l)),
          pendingSync: enqueue(s.pendingSync, id),
        })),
      duplicateLog: (id, at) => {
        const src = get().logs.find((l) => l.id === id);
        if (!src) return undefined;
        const ts = at ?? nowIso();
        const copy: DrinkLog = { ...src, id: newId(), loggedAt: ts, createdAt: ts, updatedAt: ts, deletedAt: undefined, source: 'manual' };
        set((s) => ({ logs: [...s.logs, copy], pendingSync: enqueue(s.pendingSync, copy.id) }));
        return copy;
      },
      markSynced: (ids, syncedUpdatedAt) =>
        set((s) => {
          const byId = new Map(s.logs.map((l) => [l.id, l]));
          // keep ids whose log changed again while the upload was in flight
          return { pendingSync: s.pendingSync.filter((id) => !(ids.includes(id) && byId.get(id)?.updatedAt === syncedUpdatedAt[id])) };
        }),
      mergeRemote: (remote) =>
        set((s) => {
          const byId = new Map(s.logs.map((l) => [l.id, l]));
          for (const r of remote) {
            const local = byId.get(r.id);
            if (!local || (r.updatedAt > local.updatedAt && !s.pendingSync.includes(r.id))) byId.set(r.id, r);
          }
          return { logs: [...byId.values()] };
        }),
      clear: () => set({ logs: [], pendingSync: [] }),
    }),
    { name: 'plink.logs.v1', storage: jsonStorage, partialize: (s) => ({ logs: s.logs, pendingSync: s.pendingSync }) },
  ),
);
