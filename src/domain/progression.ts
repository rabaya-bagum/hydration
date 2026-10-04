/** XP and levels. Level n needs xpForLevel(n) cumulative XP: 0, 100, 300, 600, 1000, ... (triangular). */
export const LEVEL_BASE_XP = 100;
export const MAX_LEVEL = 30;

export const XP_VALUES = { goalDay: 20, article: 5 } as const;

export const xpForLevel = (level: number): number => (LEVEL_BASE_XP * (level - 1) * level) / 2;

export interface LevelInfo { level: number; xp: number; xpIntoLevel: number; xpForNext: number; progress: number }

export function levelFromXp(xp: number): LevelInfo {
  const safe = Math.max(0, xp);
  let level = 1;
  while (level < MAX_LEVEL && safe >= xpForLevel(level + 1)) level++;
  const floor = xpForLevel(level);
  const span = level >= MAX_LEVEL ? 0 : xpForLevel(level + 1) - floor;
  return { level, xp: safe, xpIntoLevel: safe - floor, xpForNext: span, progress: span ? (safe - floor) / span : 1 };
}
