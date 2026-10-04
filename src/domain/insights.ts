import { dayKey, minutesOfDay, weekdayIndex, type DayKey } from './dates';
import type { DailySummary, DrinkLog } from './types';

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';
export const DAY_PARTS: { id: DayPart; label: string; fromMin: number; toMin: number }[] = [
  { id: 'morning', label: 'Morning', fromMin: 5 * 60, toMin: 12 * 60 },
  { id: 'afternoon', label: 'Afternoon', fromMin: 12 * 60, toMin: 17 * 60 },
  { id: 'evening', label: 'Evening', fromMin: 17 * 60, toMin: 22 * 60 },
  { id: 'night', label: 'Night', fromMin: 22 * 60, toMin: 29 * 60 }, // wraps to 05:00
];

export function dayPartOf(minute: number): DayPart {
  const m = minute < 5 * 60 ? minute + 24 * 60 : minute;
  return DAY_PARTS.find((p) => m >= p.fromMin && m < p.toMin)!.id;
}

/** Share of volume by part of day over the given days. */
export function timeOfDayShares(logs: DrinkLog[], days: Set<DayKey>): Record<DayPart, number> {
  const out: Record<DayPart, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  let total = 0;
  for (const l of logs) {
    if (l.deletedAt || !days.has(dayKey(l.loggedAt, l.tz))) continue;
    out[dayPartOf(minutesOfDay(l.loggedAt, l.tz))] += l.volumeMl;
    total += l.volumeMl;
  }
  if (total) for (const k of Object.keys(out) as DayPart[]) out[k] = out[k] / total;
  return out;
}

/** Average intake by weekday (0 = Mon) across days that have entries. */
export function weekdayAverages(summaries: Map<DayKey, DailySummary>, days: DayKey[]): (number | undefined)[] {
  const sums = Array(7).fill(0) as number[];
  const counts = Array(7).fill(0) as number[];
  for (const d of days) {
    const s = summaries.get(d);
    if (!s || !s.entryCount) continue;
    sums[weekdayIndex(d)]! += s.totalMl;
    counts[weekdayIndex(d)]! += 1;
  }
  return sums.map((v, i) => (counts[i] ? Math.round(v / counts[i]!) : undefined));
}

export function bestDay(summaries: Map<DayKey, DailySummary>, days: DayKey[]): DailySummary | undefined {
  let best: DailySummary | undefined;
  for (const d of days) { const s = summaries.get(d); if (s && (!best || s.totalMl > best.totalMl)) best = s; }
  return best && best.totalMl > 0 ? best : undefined;
}

/** Percent change of average intake vs the previous equal-length period; undefined when there is nothing to compare. */
export function changeVsPrevious(current: number, previous: number): number | undefined {
  return previous > 0 ? Math.round(((current - previous) / previous) * 100) : undefined;
}
