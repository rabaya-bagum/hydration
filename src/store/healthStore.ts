import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jsonStorage } from './storage';

interface HealthState {
  /** log id -> updatedAt that was last exported to the Health app. */
  exported: Record<string, string>;
  markExported: (id: string, updatedAt: string) => void;
  unmark: (id: string) => void;
  clear: () => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set) => ({
      exported: {},
      markExported: (id, updatedAt) => set((s) => ({ exported: { ...s.exported, [id]: updatedAt } })),
      unmark: (id) => set((s) => { const { [id]: _gone, ...rest } = s.exported; return { exported: rest }; }),
      clear: () => set({ exported: {} }),
    }),
    { name: 'plink.health.v1', storage: jsonStorage, partialize: (s) => ({ exported: s.exported }) },
  ),
);
