import { minutesOfDay, type DayKey } from './dates';
import type { DailySummary } from './types';

export interface RangeStats {
  days: number;
  loggedDays: number;
  totalMl: number;
  avgMl: number; // average over days in range (days with no entries count as 0, future days excluded by caller)
  daysReached: number;
  completionRate: number; // 0..1
  avgGoalReachedMinute?: number; // minutes since midnight, averaged over days that reached goal
  byDrink: { drinkTypeId: string; ml: number; share: number }[];
}

/** Stats over an explicit list of day keys (caller supplies only days up to today). */
export function rangeStats(summaries: Map<DayKey, DailySummary>, days: DayKey[], tz: string): RangeStats {
  let total = 0, logged = 0, reached = 0, minuteSum = 0;
  const drinks: Record<string, number> = {};
  for (const d of days) {
    const s = summaries.get(d);
    if (!s) continue;
    total += s.totalMl;
    logged += s.entryCount > 0 ? 1 : 0;
    if (s.totalMl >= s.goalMl && s.goalMl > 0) {
      reached++;
      if (s.goalReachedAt) minuteSum += minutesOfDay(s.goalReachedAt, tz);
    }
    for (const [k, v] of Object.entries(s.byDrink)) drinks[k] = (drinks[k] ?? 0) + v;
  }
  const grand = Object.values(drinks).reduce((a, b) => a + b, 0);
  return {
    days: days.length, loggedDays: logged, totalMl: total,
    avgMl: days.length ? Math.round(total / days.length) : 0,
    daysReached: reached,
    completionRate: days.length ? reached / days.length : 0,
    avgGoalReachedMinute: reached ? Math.round(minuteSum / reached) : undefined,
    byDrink: Object.entries(drinks).map(([drinkTypeId, ml]) => ({ drinkTypeId, ml, share: grand ? ml / grand : 0 })).sort((a, b) => b.ml - a.ml),
  };
}

/** Plain-language, non-medical summary. */
export function weekSummary(stats: RangeStats): string {
  if (stats.loggedDays === 0) return 'No drinks logged yet this week. Your first sip will show up here.';
  return `You hit your goal ${stats.daysReached} of the last ${stats.days} days.`;
}
