import { useEffect } from 'react';
import { runHealthSync } from '@/services/health';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';

const DEBOUNCE_MS = 2000;

/** When enabled and a provider exists, mirrors water logs to the Health app (idempotent). */
export function useHealthSync() {
  const enabled = useSettingsStore((s) => s.healthSync);
  const logs = useLogsStore((s) => s.logs);
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => { runHealthSync(logs).catch(() => {}); }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [enabled, logs]);
}
