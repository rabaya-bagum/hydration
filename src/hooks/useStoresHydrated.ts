import { useSyncExternalStore } from 'react';
import { useLogsStore } from '@/store/logsStore';
import { useRewardsStore } from '@/store/rewardsStore';
import { useSettingsStore } from '@/store/settingsStore';

const ready = () => useLogsStore.persist.hasHydrated() && useSettingsStore.persist.hasHydrated() && useRewardsStore.persist.hasHydrated();

function subscribe(onChange: () => void) {
  const a = useLogsStore.persist.onFinishHydration(onChange);
  const b = useSettingsStore.persist.onFinishHydration(onChange);
  const c = useRewardsStore.persist.onFinishHydration(onChange);
  return () => { a(); b(); c(); };
}

/** True once both persisted stores have loaded from disk. */
export function useStoresHydrated(): boolean {
  return useSyncExternalStore(subscribe, ready, () => false);
}
