import { levelFromXp, xpForLevel } from '@/domain/progression';
import { computeAwards, ledgerStreak } from '@/domain/rewards';
import { isUnlocked } from '@/domain/unlocks';
import { newlyUnlocked } from '@/content/unlockables';
import type { DailySummary, DrinkLog } from '@/domain/types';
import { ACHIEVEMENTS } from '@/domain/achievements';
import { useRewardsStore } from '@/store/rewardsStore';

describe('levels', () => {
  it('thresholds are triangular and monotonic', () => {
    expect([1, 2, 3, 4, 5, 10].map(xpForLevel)).toEqual([0, 100, 300, 600, 1000, 4500]);
  });
  it('maps xp to level and progress', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, progress: 0 });
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
    expect(levelFromXp(200)).toMatchObject({ level: 2, xpIntoLevel: 100, xpForNext: 200, progress: 0.5 });
    expect(levelFromXp(-5).xp).toBe(0);
    expect(levelFromXp(10_000_000).level).toBe(30);
  });
});

const summary = (day: string, total: number, goal = 2000): [string, DailySummary] => [day, { day, totalMl: total, goalMl: goal, entryCount: total ? 1 : 0, byDrink: {} }];
const log = (id: string, drink = 'water', at = '2024-05-01T10:00:00Z', ml = 250): DrinkLog => ({ id, drinkTypeId: drink, volumeMl: ml, hydrationMl: ml, loggedAt: at, tz: 'UTC', source: 'manual', createdAt: at, updatedAt: at });
const base = { summaries: new Map<string, DailySummary>(), logs: [] as DrinkLog[], longestStreak: 0, articlesRead: 0, challengesCompleted: 0, completedChallenges: [], readArticleIds: [] as string[] };

describe('awards', () => {
  it('awards goal days, achievements, challenges and articles with stable ids', () => {
    const ctx = { ...base, summaries: new Map([summary('2024-05-01', 2000), summary('2024-05-02', 500)]), logs: [log('a', 'water', '2024-05-01T06:00:00Z')], longestStreak: 1, completedChallenges: [{ id: 'morning-splash', title: 'Morning Splash', xp: 60 }], readArticleIds: ['why-fluids-matter'] };
    const ids = computeAwards(ctx).map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['goal:2024-05-01', 'ach:first-sip', 'ach:first-goal', 'ach:early-bird', 'challenge:morning-splash', 'article:why-fluids-matter']));
    expect(ids).not.toContain('goal:2024-05-02');
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('streak milestones become achievements at 3/7/14/30/60/100/365', () => {
    const ids = computeAwards({ ...base, longestStreak: 30 }).map((a) => a.id);
    expect(ids).toEqual(expect.arrayContaining(['ach:streak-3', 'ach:streak-7', 'ach:streak-14', 'ach:streak-30']));
    expect(ids).not.toContain('ach:streak-60');
    expect(ACHIEVEMENTS.filter((a) => a.id.startsWith('streak-')).map((a) => a.id)).toHaveLength(7);
  });
  it('variety needs 5 distinct drinks', () => {
    const four = ['water', 'tea', 'coffee', 'juice'].map((d, i) => log(String(i), d));
    expect(computeAwards({ ...base, logs: four }).map((a) => a.id)).not.toContain('ach:variety');
    expect(computeAwards({ ...base, logs: [...four, log('5', 'milk')] }).map((a) => a.id)).toContain('ach:variety');
  });
  it('ledgerStreak reads the highest streak badge', () => { expect(ledgerStreak({ 'ach:streak-3': 1, 'ach:streak-14': 1, 'goal:x': 1 })).toBe(14); expect(ledgerStreak({})).toBe(0); });
});

describe('rewards ledger', () => {
  beforeEach(() => useRewardsStore.getState().clear());
  it('is idempotent: re-applying awards never double-counts', () => {
    const a = [{ id: 'goal:d1', kind: 'goal' as const, xp: 20, title: 'Goal day' }];
    expect(useRewardsStore.getState().applyAwards(a)).toHaveLength(1);
    expect(useRewardsStore.getState().applyAwards(a)).toHaveLength(0);
    expect(useRewardsStore.getState().applyAwards([...a, ...a])).toHaveLength(0);
    expect(Object.keys(useRewardsStore.getState().ledger)).toHaveLength(1);
  });
  it('dedupes within one batch', () => {
    const a = { id: 'x', kind: 'goal' as const, xp: 5, title: 't' };
    expect(useRewardsStore.getState().applyAwards([a, a])).toHaveLength(1);
  });
  it('bookmarks and reads', () => {
    const s = useRewardsStore.getState();
    s.toggleBookmark('a'); s.markRead('a'); s.markRead('a');
    expect(useRewardsStore.getState().bookmarks).toEqual(['a']);
    expect(useRewardsStore.getState().readArticles).toEqual(['a']);
    useRewardsStore.getState().toggleBookmark('a');
    expect(useRewardsStore.getState().bookmarks).toEqual([]);
  });
});

describe('unlocks', () => {
  it('rules', () => {
    expect(isUnlocked({ kind: 'starter' }, { level: 1, longestStreak: 0 })).toBe(true);
    expect(isUnlocked({ kind: 'level', level: 5 }, { level: 4, longestStreak: 99 })).toBe(false);
    expect(isUnlocked({ kind: 'streak', days: 14 }, { level: 1, longestStreak: 14 })).toBe(true);
  });
  it('diffs newly unlocked items across a level-up and a streak', () => {
    expect(newlyUnlocked({ level: 2, longestStreak: 0 }, { level: 3, longestStreak: 0 }).map((u) => u.id)).toEqual(['bow']);
    expect(newlyUnlocked({ level: 4, longestStreak: 7 }, { level: 5, longestStreak: 14 }).map((u) => u.id).sort()).toEqual(['koi', 'pixel']);
    expect(newlyUnlocked({ level: 9, longestStreak: 0 }, { level: 10, longestStreak: 0 }).map((u) => u.id)).toEqual(['bubbles']);
  });
});
