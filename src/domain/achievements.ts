import { minutesOfDay, type DayKey } from './dates';
import { STREAK_MILESTONES } from './streaks';
import type { DailySummary, DrinkLog } from './types';

export interface AchievementContext {
  summaries: Map<DayKey, DailySummary>;
  logs: DrinkLog[]; // live (non-deleted) only
  longestStreak: number;
  articlesRead: number;
  challengesCompleted: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  glyph: string;
  xp: number;
  check: (ctx: AchievementContext) => boolean;
}

const MILESTONE_XP: Record<number, number> = { 3: 30, 7: 75, 14: 150, 30: 300, 60: 500, 100: 800, 365: 2000 };
const MILESTONE_GLYPH: Record<number, string> = { 3: '🌱', 7: '🔥', 14: '🌊', 30: '🏅', 60: '💎', 100: '👑', 365: '🌟' };

const goalDays = (c: AchievementContext) => [...c.summaries.values()].filter((s) => s.goalMl > 0 && s.totalMl >= s.goalMl).length;
const EARLY_MIN = 8 * 60;

export const streakAchievementId = (days: number) => `streak-${days}`;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-sip', title: 'First sip', description: 'Log your first drink.', glyph: '💧', xp: 10, check: (c) => c.logs.length > 0 },
  { id: 'first-goal', title: 'Goal getter', description: 'Reach your daily goal once.', glyph: '🎯', xp: 25, check: (c) => goalDays(c) >= 1 },
  ...STREAK_MILESTONES.map((d) => ({
    id: streakAchievementId(d), title: `${d}-day streak`, description: `Reach your goal ${d} days in a row.`,
    glyph: MILESTONE_GLYPH[d]!, xp: MILESTONE_XP[d]!, check: (c: AchievementContext) => c.longestStreak >= d,
  })),
  { id: 'early-bird', title: 'Early bird', description: 'Log a drink before 8 AM.', glyph: '🌅', xp: 15, check: (c) => c.logs.some((l) => minutesOfDay(l.loggedAt, l.tz) < EARLY_MIN) },
  { id: 'variety', title: 'Taste explorer', description: 'Log 5 different kinds of drinks.', glyph: '🧃', xp: 20, check: (c) => new Set(c.logs.map((l) => l.drinkTypeId)).size >= 5 },
  { id: 'goals-10', title: 'Ten goal days', description: 'Reach your goal on 10 different days.', glyph: '🔟', xp: 50, check: (c) => goalDays(c) >= 10 },
  { id: 'goals-30', title: 'Thirty goal days', description: 'Reach your goal on 30 different days.', glyph: '🏆', xp: 150, check: (c) => goalDays(c) >= 30 },
  { id: 'reader', title: 'Curious mind', description: 'Read 3 articles in Learn.', glyph: '📖', xp: 20, check: (c) => c.articlesRead >= 3 },
  { id: 'challenger', title: 'Challenger', description: 'Complete your first challenge.', glyph: '🚩', xp: 40, check: (c) => c.challengesCompleted >= 1 },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
