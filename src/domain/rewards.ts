import { ACHIEVEMENTS, type AchievementContext } from './achievements';
import { XP_VALUES } from './progression';

export type AwardKind = 'goal' | 'achievement' | 'challenge' | 'article';
export interface Award { id: string; kind: AwardKind; xp: number; title: string }

export interface RewardContext extends AchievementContext {
  completedChallenges: { id: string; title: string; xp: number }[];
  readArticleIds: string[];
}

/**
 * Everything the user should currently have been awarded. Ids are stable, so the store can diff
 * against its ledger: re-evaluating (after edits, undo, sync) never double-awards, and
 * deleting a log later never takes XP away.
 */
export function computeAwards(ctx: RewardContext): Award[] {
  const awards: Award[] = [];
  for (const s of ctx.summaries.values()) {
    if (s.goalMl > 0 && s.totalMl >= s.goalMl) awards.push({ id: `goal:${s.day}`, kind: 'goal', xp: XP_VALUES.goalDay, title: 'Goal day' });
  }
  for (const a of ACHIEVEMENTS) if (a.check(ctx)) awards.push({ id: `ach:${a.id}`, kind: 'achievement', xp: a.xp, title: a.title });
  for (const c of ctx.completedChallenges) awards.push({ id: `challenge:${c.id}`, kind: 'challenge', xp: c.xp, title: c.title });
  for (const id of ctx.readArticleIds) awards.push({ id: `article:${id}`, kind: 'article', xp: XP_VALUES.article, title: 'Article read' });
  return awards;
}

/** Longest streak milestone recorded in the ledger. Monotonic, so unlocks never re-lock after edits. */
export function ledgerStreak(ledger: Record<string, unknown>): number {
  return Math.max(0, ...Object.keys(ledger).map((k) => (k.startsWith('ach:streak-') ? Number(k.slice('ach:streak-'.length)) : 0)));
}
