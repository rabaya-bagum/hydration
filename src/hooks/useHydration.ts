import { useMemo } from 'react';
import { dayKey, deviceTimeZone, type DayKey } from '@/domain/dates';
import { buildSummaries, emptySummary } from '@/domain/progress';
import { computeStreaks } from '@/domain/streaks';
import type { DailySummary, DrinkLog } from '@/domain/types';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useNow } from './useNow';

export interface HydrationState {
  today: DayKey;
  tz: string;
  goalMl: number;
  summaries: Map<DayKey, DailySummary>;
  todaySummary: DailySummary;
  todayLogs: DrinkLog[]; // newest first
  streak: { current: number; longest: number };
}

/** Derived, memoised view of logs + settings. UI reads this; it never recomputes totals itself. */
export function useHydration(): HydrationState {
  const logs = useLogsStore((s) => s.logs);
  const weighting = useSettingsStore((s) => s.weighting);
  const goalHistory = useSettingsStore((s) => s.goalHistory);
  const goalMlSetting = useSettingsStore((s) => s.goalMl);
  const goalFor = useSettingsStore((s) => s.goalFor);
  const now = useNow();
  const tz = deviceTimeZone();
  const today = dayKey(now, tz);

  const summaries = useMemo(
    () => buildSummaries(logs, { weighting, goalFor }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logs, weighting, goalHistory, goalMlSetting, goalFor],
  );
  const goalMl = goalFor(today);
  const todaySummary = summaries.get(today) ?? emptySummary(today, goalMl);
  const todayLogs = useMemo(
    () => logs.filter((l) => !l.deletedAt && dayKey(l.loggedAt, l.tz) === today).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)),
    [logs, today],
  );
  const streak = useMemo(() => computeStreaks(summaries, today), [summaries, today]);
  return { today, tz, goalMl, summaries, todaySummary, todayLogs, streak };
}
