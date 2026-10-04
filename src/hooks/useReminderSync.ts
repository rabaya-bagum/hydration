import { useEffect } from 'react';
import { rescheduleReminders } from '@/services/notifications';
import { useSettingsStore } from '@/store/settingsStore';
import { useHydration } from './useHydration';

const DEBOUNCE_MS = 1500;

/** Keeps scheduled local notifications consistent with prefs, goal and today's intake. */
export function useReminderSync() {
  const prefs = useSettingsStore((s) => s.reminders);
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const { goalMl, todaySummary, today } = useHydration();
  const consumed = todaySummary.totalMl;
  useEffect(() => {
    const t = setTimeout(() => { rescheduleReminders({ prefs, goalMl, consumedMl: consumed, unitSystem }).catch(() => {}); }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [prefs, goalMl, consumed, unitSystem, today]);
}
