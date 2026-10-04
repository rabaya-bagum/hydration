import { rangeStats, weekSummary } from '@/domain/analytics';
import type { DailySummary } from '@/domain/types';

const s = (day: string, total: number, goal: number, reachedAt?: string, drinks: Record<string, number> = { water: total }): [string, DailySummary] =>
  [day, { day, totalMl: total, goalMl: goal, entryCount: total ? 1 : 0, goalReachedAt: reachedAt, byDrink: drinks }];

describe('range stats', () => {
  const map = new Map([
    s('2024-05-01', 2000, 2000, '2024-05-01T15:00:00Z'),
    s('2024-05-02', 1000, 2000),
    s('2024-05-03', 2400, 2000, '2024-05-03T17:00:00Z', { water: 2000, coffee: 400 }),
  ]);
  const days = ['2024-05-01', '2024-05-02', '2024-05-03', '2024-05-04'];
  const r = rangeStats(map, days, 'UTC');
  it('averages across the whole range, counting empty days', () => { expect(r.avgMl).toBe(1350); });
  it('completion', () => { expect(r.daysReached).toBe(2); expect(r.completionRate).toBe(0.5); expect(r.loggedDays).toBe(3); });
  it('average goal-reached time', () => { expect(r.avgGoalReachedMinute).toBe(16 * 60); });
  it('beverage breakdown sums to 100%', () => {
    expect(r.byDrink[0]).toMatchObject({ drinkTypeId: 'water' });
    expect(r.byDrink.reduce((a, b) => a + b.share, 0)).toBeCloseTo(1);
  });
  it('summary text is non-medical and plain', () => {
    expect(weekSummary({ ...r, days: 7, daysReached: 5 })).toBe('You hit your goal 5 of the last 7 days.');
    expect(weekSummary(rangeStats(new Map(), days, 'UTC'))).toMatch(/first sip/);
  });
});
