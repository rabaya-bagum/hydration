import { addDays, type DayKey } from './dates';
import type { DailySummary } from './types';

export interface StreakResult { current: number; longest: number; lastGoalDay?: DayKey }

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 365] as const;

const reached = (s?: DailySummary) => !!s && s.goalMl > 0 && s.totalMl >= s.goalMl;

/**
 * A streak is consecutive goal-complete days. Today still in progress does NOT break it:
 * the run is counted up to yesterday until today reaches the goal. (No loss-aversion mechanics.)
 */
export function computeStreaks(summaries: Map<DayKey, DailySummary>, today: DayKey): StreakResult {
  const days = [...summaries.keys()].filter((d) => reached(summaries.get(d))).sort();
  let longest = 0;
  let run = 0;
  let prev: DayKey | undefined;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  let cursor = reached(summaries.get(today)) ? today : addDays(today, -1);
  let current = 0;
  while (reached(summaries.get(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest: Math.max(longest, current), lastGoalDay: days[days.length - 1] };
}

export const crossedMilestone = (before: number, after: number): number | undefined =>
  STREAK_MILESTONES.find((m) => before < m && after >= m);

export type DayStrength = 'none' | 'started' | 'half' | 'almost' | 'complete';
/** Calendar intensity. Also paired with an icon/text so state is never color-only. */
export function dayStrength(s?: DailySummary): DayStrength {
  if (!s || s.totalMl <= 0) return 'none';
  const r = s.totalMl / s.goalMl;
  return r >= 1 ? 'complete' : r >= 0.75 ? 'almost' : r >= 0.5 ? 'half' : 'started';
}
