import { lastNDays, type DayKey } from './dates';
import { percentOf } from './progress';
import type { Container, DailySummary, UnitSystem } from './types';

export const WIDGET_SNAPSHOT_VERSION = 1;
export const WIDGET_QUICK_ADD_MAX = 3;
export const WIDGET_TREND_DAYS = 7;
/** Deep-link scheme the native widgets open. Handled by app/log.tsx. */
export const WIDGET_LOG_URL = (ml: number) => `plink://log?ml=${ml}`;

/**
 * Everything a native widget needs, as one small JSON blob written to shared storage
 * (iOS App Group / Android SharedPreferences). No name, email or drink-by-drink data.
 *
 * small  : percent, consumedMl / goalMl
 * medium : small + streak + quick-add button(s)
 * large  : medium + 7-day trend + mascot (premium)
 */
export interface WidgetSnapshot {
  version: typeof WIDGET_SNAPSHOT_VERSION;
  day: DayKey;
  consumedMl: number;
  goalMl: number;
  percent: number;
  remainingMl: number;
  streak: number;
  quickAdd: { ml: number; label: string; url: string }[];
  trend: { day: DayKey; percent: number }[];
  characterId: string;
  unit: UnitSystem;
  updatedAt: string;
}

interface Input {
  summaries: Map<DayKey, DailySummary>;
  today: DayKey;
  goalMl: number;
  streak: number;
  containers: Container[];
  unit: UnitSystem;
  characterId: string;
  now?: Date;
}

export function buildWidgetSnapshot(i: Input): WidgetSnapshot {
  const consumedMl = i.summaries.get(i.today)?.totalMl ?? 0;
  return {
    version: WIDGET_SNAPSHOT_VERSION,
    day: i.today, consumedMl, goalMl: i.goalMl, percent: percentOf(consumedMl, i.goalMl),
    remainingMl: Math.max(i.goalMl - consumedMl, 0), streak: i.streak,
    quickAdd: i.containers.filter((c) => c.favorite).slice(0, WIDGET_QUICK_ADD_MAX).map((c) => ({ ml: c.volumeMl, label: c.name, url: WIDGET_LOG_URL(c.volumeMl) })),
    trend: lastNDays(i.today, WIDGET_TREND_DAYS).map((d) => {
      const s = i.summaries.get(d);
      return { day: d, percent: s ? percentOf(s.totalMl, s.goalMl) : 0 };
    }),
    characterId: i.characterId, unit: i.unit, updatedAt: (i.now ?? new Date()).toISOString(),
  };
}

/** Stable key for "has anything the widget shows changed?" (ignores updatedAt). */
export const snapshotKey = (s: WidgetSnapshot) => JSON.stringify({ ...s, updatedAt: undefined });
