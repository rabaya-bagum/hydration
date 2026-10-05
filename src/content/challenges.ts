import type { ChallengeDef } from '@/domain/challenges';

const H = 60;

/** Copy avoids health claims: challenges are about habits, not outcomes. */
export const CHALLENGES: ChallengeDef[] = [
  { id: 'morning-splash', category: 'morning', title: 'Morning Splash', glyph: '🌅', description: 'Drink at least 300 mL before 10 AM on 5 days.', windowDays: 10, targetDays: 5, rewardXp: 60, rule: { kind: 'mlInWindow', fromMin: 0, toMin: 10 * H, ml: 300 } },
  { id: 'seven-day-flow', category: 'consistency', title: 'Seven-Day Flow', glyph: '🌊', description: 'Reach your daily goal 7 days in a row.', windowDays: 14, targetDays: 7, rewardXp: 120, rule: { kind: 'goalStreak' } },
  { id: 'bottle-buddy', category: 'bottle', title: 'Bottle Buddy', glyph: '🍶', description: 'Log a drink from your bottle on 5 days.', windowDays: 10, targetDays: 5, rewardXp: 50, rule: { kind: 'containerDays', containerIds: ['bottle', 'large-bottle'] } },
  { id: 'caffeine-balance', category: 'caffeine', title: 'Caffeine Balance', glyph: '☕', description: 'On 5 days with coffee, tea or soda, log at least as much of other drinks.', windowDays: 10, targetDays: 5, rewardXp: 50, rule: { kind: 'caffeineBalance' } },
  { id: 'evening-wind-down', category: 'evening', title: 'Evening Wind-Down', glyph: '🌙', description: 'Have a drink of at least 250 mL between 5 and 9 PM on 5 days.', windowDays: 10, targetDays: 5, rewardXp: 50, rule: { kind: 'mlInWindow', fromMin: 17 * H, toMin: 21 * H, ml: 250 } },
  { id: 'fruity-water', category: 'infused', title: 'Fruity Water', glyph: '🍋', description: 'Log infused water (fruit, herbs, cucumber) on 4 days.', windowDays: 10, targetDays: 4, rewardXp: 40, rule: { kind: 'drinkDays', drinkTypeId: 'infused' } },
  { id: 'steady-sipper', category: 'consistency', title: 'Steady Sipper', glyph: '🥤', description: 'Log at least 4 drinks a day on 5 days.', windowDays: 10, targetDays: 5, rewardXp: 50, rule: { kind: 'entriesPerDay', count: 4 } },
];

export const CATEGORY_LABEL: Record<ChallengeDef['category'], string> = {
  consistency: 'Consistency', caffeine: 'Caffeine awareness', morning: 'Morning routine', evening: 'Evening routine', infused: 'Fruit-infused water', bottle: 'Reusable bottle',
};

export const getChallenge = (id: string) => CHALLENGES.find((c) => c.id === id);

/** Challenges beyond the first four are premium. Already-started or completed ones stay usable. */
export const PREMIUM_CHALLENGE_IDS = new Set(['caffeine-balance', 'evening-wind-down', 'steady-sipper']);
