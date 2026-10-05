import { useSyncExternalStore } from 'react';
import { useLogsStore } from '@/store/logsStore';
import { useRewardsStore } from '@/store/rewardsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useHealthStore } from '@/store/healthStore';
import { useSettingsStore } from '@/store/settingsStore';

const ready = () => useLogsStore.persist.hasHydrated() && useSettingsStore.persist.hasHydrated() && useRewardsStore.persist.hasHydrated() && useSubscriptionStore.persist.hasHydrated() && useHealthStore.persist.hasHydrated();

function subscribe(onChange: () => void) {
  const a = useLogsStore.persist.onFinishHydration(onChange);
  const b = useSettingsStore.persist.onFinishHydration(onChange);
  const c = useRewardsStore.persist.onFinishHydration(onChange);
  const d = useSubscriptionStore.persist.onFinishHydration(onChange);
  const e = useHealthStore.persist.onFinishHydration(onChange);
  return () => { a(); b(); c(); d(); e(); };
}

/** True once both persisted stores have loaded from disk. */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, ready, () => false);
}
