import { useEffect, useState } from 'react';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';

const ready = () => useLogsStore.persist.hasHydrated() && useSettingsStore.persist.hasHydrated();

export function useStoresHydrated(): boolean {
  const [ok, setOk] = useState(ready);
  useEffect(() => {
    if (ready()) { setOk(true); return; }
    const check = () => ready() && setOk(true);
    const a = useLogsStore.persist.onFinishHydration(check);
    const b = useSettingsStore.persist.onFinishHydration(check);
    check();
    return () => { a(); b(); };
  }, []);
  return ok;
}
