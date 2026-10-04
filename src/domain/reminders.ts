import { weekdayIndex, type DayKey } from './dates';

export type ReminderMode = 'smart' | 'scheduled' | 'interval';

export interface ReminderPrefs {
  enabled: boolean;
  mode: ReminderMode;
  intervalMinutes: number;
  scheduledTimes: string[]; // "HH:mm"
  quietStart: string;
  quietEnd: string;
  weekdaysOnly: boolean;
  maxPerDay: number; // hard rate limit
  skipWhenGoalReached: boolean;
  showAmounts: boolean; // lock-screen privacy: amounts hidden unless enabled
  wake: string;
  bed: string;
}

export const REMINDER_LIMITS = { maxPerDay: 10, minGapMinutes: 45, smartSipMl: 300, smartMinCount: 2 } as const;

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  enabled: false, mode: 'smart', intervalMinutes: 90, scheduledTimes: ['09:00', '12:30', '15:30', '18:30'],
  quietStart: '22:00', quietEnd: '07:00', weekdaysOnly: false, maxPerDay: 6,
  skipWhenGoalReached: true, showAmounts: false, wake: '07:00', bed: '23:00',
};

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
export const fromMinutes = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Quiet window may wrap midnight (e.g. 22:00–07:00). */
export function isQuiet(min: number, start: string, end: string): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === e) return false;
  return s < e ? min >= s && min < e : min >= s || min < e;
}

export interface PlanContext {
  day: DayKey;
  /** Minutes past local midnight "now", or null when planning a future day. */
  nowMin: number | null;
  consumedMl: number;
  goalMl: number;
}

/** Returns sorted minutes-of-day at which to remind on `ctx.day`. Pure, rate-limited. */
export function planReminders(prefs: ReminderPrefs, ctx: PlanContext): number[] {
  if (!prefs.enabled) return [];
  if (prefs.weekdaysOnly && weekdayIndex(ctx.day) >= 5) return [];
  if (prefs.skipWhenGoalReached && ctx.consumedMl >= ctx.goalMl) return [];

  const wake = toMinutes(prefs.wake);
  const bed = Math.min(toMinutes(prefs.bed) || 1439, 1439);
  const earliest = ctx.nowMin === null ? 0 : ctx.nowMin + 15;
  let candidates: number[] = [];

  if (prefs.mode === 'scheduled') {
    candidates = prefs.scheduledTimes.map(toMinutes); // explicit user times are honoured, even in quiet hours
  } else if (prefs.mode === 'interval') {
    const step = Math.max(prefs.intervalMinutes, REMINDER_LIMITS.minGapMinutes);
    for (let t = wake + step; t < bed; t += step) candidates.push(t);
    candidates = candidates.filter((t) => !isQuiet(t, prefs.quietStart, prefs.quietEnd));
  } else {
    const remaining = Math.max(ctx.goalMl - ctx.consumedMl, 0);
    const start = Math.max(wake + 60, earliest);
    const end = bed - 60;
    const count = Math.min(prefs.maxPerDay, Math.max(REMINDER_LIMITS.smartMinCount, Math.ceil(remaining / REMINDER_LIMITS.smartSipMl)));
    if (end > start) {
      const gap = (end - start) / Math.max(count - 1, 1);
      for (let i = 0; i < count; i++) candidates.push(Math.round((start + gap * i) / 5) * 5);
    }
    candidates = candidates.filter((t) => !isQuiet(t, prefs.quietStart, prefs.quietEnd));
  }

  const out: number[] = [];
  for (const t of [...new Set(candidates)].filter((t) => t >= earliest && t < 1440).sort((a, b) => a - b)) {
    const last = out[out.length - 1];
    if (last === undefined || t - last >= REMINDER_LIMITS.minGapMinutes) out.push(t);
  }
  return out.slice(0, Math.min(prefs.maxPerDay, REMINDER_LIMITS.maxPerDay));
}
