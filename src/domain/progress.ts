import { dayKey, type DayKey } from './dates';
import { GOAL_CONFIG } from './hydrationGoal';
import type { DailySummary, DrinkLog } from './types';

/** Volume that counts toward progress: plain volume unless weighting is enabled. */
export const countedMl = (log: DrinkLog, weighting: boolean) => (weighting ? log.hydrationMl : log.volumeMl);

export interface GoalHistoryEntry { fromDay: DayKey; goalMl: number }

/** Goal in effect on `day`: latest entry whose fromDay <= day (history keeps old days stable). */
export function goalForDay(history: GoalHistoryEntry[], day: DayKey, fallback: number): number {
  let best: GoalHistoryEntry | undefined;
  for (const e of history) if (e.fromDay <= day && (!best || e.fromDay >= best.fromDay)) best = e;
  return best?.goalMl ?? history.find((e) => e.fromDay > day)?.goalMl ?? fallback;
}

export function setGoalFromDay(history: GoalHistoryEntry[], day: DayKey, goalMl: number): GoalHistoryEntry[] {
  return [...history.filter((e) => e.fromDay !== day), { fromDay: day, goalMl }].sort((a, b) => a.fromDay.localeCompare(b.fromDay));
}

export interface SummaryOptions {
  weighting: boolean;
  goalFor: (day: DayKey) => number;
}

/** Group live (non-deleted) logs into per-day summaries keyed by each log's own timezone. */
export function buildSummaries(logs: DrinkLog[], { weighting, goalFor }: SummaryOptions): Map<DayKey, DailySummary> {
  const live = logs.filter((l) => !l.deletedAt).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
  const out = new Map<DayKey, DailySummary>();
  for (const log of live) {
    const day = dayKey(log.loggedAt, log.tz);
    let s = out.get(day);
    if (!s) {
      s = { day, totalMl: 0, goalMl: goalFor(day), entryCount: 0, byDrink: {} };
      out.set(day, s);
    }
    const ml = countedMl(log, weighting);
    s.totalMl += ml;
    s.entryCount += 1;
    s.byDrink[log.drinkTypeId] = (s.byDrink[log.drinkTypeId] ?? 0) + ml;
    if (!s.goalReachedAt && s.totalMl >= s.goalMl) s.goalReachedAt = log.loggedAt;
  }
  return out;
}

export const emptySummary = (day: DayKey, goalMl: number): DailySummary => ({ day, totalMl: 0, goalMl, entryCount: 0, byDrink: {} });

export const percentOf = (ml: number, goal: number) => (goal > 0 ? Math.round((ml / goal) * 100) : 0);
export const isOverGoalNote = (ml: number, goal: number) => ml >= goal * GOAL_CONFIG.overGoalNoteRatio;
