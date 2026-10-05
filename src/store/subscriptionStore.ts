import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { effectiveTier, type SubscriptionState, type Tier } from '@/domain/entitlements';
import { jsonStorage } from './storage';

interface SubscriptionStore {
  sub: SubscriptionState;
  set: (s: SubscriptionState) => void;
  reset: () => void;
}

const FREE: SubscriptionState = { tier: 'free' };

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist((set) => ({ sub: FREE, set: (sub) => set({ sub }), reset: () => set({ sub: FREE }) }), {
    name: 'plink.subscription.v1', storage: jsonStorage, partialize: (s) => ({ sub: s.sub }),
  }),
);

/** Current tier. Re-evaluated on every render so an expired plan lapses without a restart. */
export function useTier(): Tier {
  return effectiveTier(useSubscriptionStore((s) => s.sub));
}
