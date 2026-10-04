import { addDays, dayKey, minutesOfDay, type DayKey } from './dates';
import type { DailySummary, DrinkLog } from './types';

export type ChallengeCategory = 'consistency' | 'caffeine' | 'morning' | 'evening' | 'infused' | 'bottle';

export type ChallengeRule =
  | { kind: 'mlInWindow'; fromMin: number; toMin: number; ml: number } // >= ml logged inside the time window that day
  | { kind: 'goalStreak' } // consecutive goal days
  | { kind: 'containerDays'; containerIds: string[] }
  | { kind: 'caffeineBalance' } // caffeinated drink logged AND at least as much non-caffeinated volume that day
  | { kind: 'entriesPerDay'; count: number }
  | { kind: 'drinkDays'; drinkTypeId: string };

export interface ChallengeDef {
  id: string;
  category: ChallengeCategory;
  title: string;
  description: string;
  glyph: string;
  /** Days you have to finish. A shorter streak of qualifying days than the window is fine; missing it just ends the attempt gently. */
  windowDays: number;
  /** Qualifying days (or consecutive days for goalStreak) needed. */
  targetDays: number;
  rewardXp: number;
  rule: ChallengeRule;
}

export interface ChallengeEnv {
  logs: DrinkLog[]; // live logs only
  summaries: Map<DayKey, DailySummary>;
  caffeinatedDrinkIds: Set<string>;
}

export interface ChallengeStatus {
  progress: number;
  target: number;
  done: boolean;
  expired: boolean;
  daysLeft: number;
  qualifying: DayKey[];
}

function qualifies(rule: ChallengeRule, day: DayKey, dayLogs: DrinkLog[], env: ChallengeEnv): boolean {
  switch (rule.kind) {
    case 'mlInWindow':
      return dayLogs.filter((l) => { const m = minutesOfDay(l.loggedAt, l.tz); return m >= rule.fromMin && m < rule.toMin; }).reduce((s, l) => s + l.volumeMl, 0) >= rule.ml;
    case 'goalStreak': {
      const s = env.summaries.get(day);
      return !!s && s.goalMl > 0 && s.totalMl >= s.goalMl;
    }
    case 'containerDays':
      return dayLogs.some((l) => l.containerId && rule.containerIds.includes(l.containerId));
    case 'caffeineBalance': {
      const caf = dayLogs.filter((l) => env.caffeinatedDrinkIds.has(l.drinkTypeId)).reduce((s, l) => s + l.volumeMl, 0);
      const other = dayLogs.filter((l) => !env.caffeinatedDrinkIds.has(l.drinkTypeId)).reduce((s, l) => s + l.volumeMl, 0);
      return caf > 0 && other >= caf;
    }
    case 'entriesPerDay':
      return dayLogs.length >= rule.count;
    case 'drinkDays':
      return dayLogs.some((l) => l.drinkTypeId === rule.drinkTypeId);
  }
}

export function evaluateChallenge(def: ChallengeDef, startedOn: DayKey, today: DayKey, env: ChallengeEnv): ChallengeStatus {
  const lastDay = addDays(startedOn, def.windowDays - 1);
  const end = today < lastDay ? today : lastDay;
  const byDay = new Map<DayKey, DrinkLog[]>();
  for (const l of env.logs) {
    const d = dayKey(l.loggedAt, l.tz);
    if (d < startedOn || d > end) continue;
    byDay.set(d, [...(byDay.get(d) ?? []), l]);
  }
  const qualifying: DayKey[] = [];
  for (let d = startedOn; d <= end; d = addDays(d, 1)) {
    if (qualifies(def.rule, d, byDay.get(d) ?? [], env)) qualifying.push(d);
  }
  let progress = qualifying.length;
  if (def.rule.kind === 'goalStreak') {
    let best = 0, run = 0, prev: DayKey | undefined;
    for (const d of qualifying) { run = prev && addDays(prev, 1) === d ? run + 1 : 1; best = Math.max(best, run); prev = d; }
    progress = best;
  }
  progress = Math.min(progress, def.targetDays);
  const done = progress >= def.targetDays;
  return { progress, target: def.targetDays, done, expired: !done && today > lastDay, daysLeft: Math.max(0, def.windowDays - (daysBetweenKeys(startedOn, today) + 1)), qualifying };
}

function daysBetweenKeys(a: DayKey, b: DayKey): number {
  const t = (k: DayKey) => { const [y, m, d] = k.split('-').map(Number) as [number, number, number]; return Date.UTC(y, m - 1, d); };
  return Math.round((t(b) - t(a)) / 86_400_000);
}
