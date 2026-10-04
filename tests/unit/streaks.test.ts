import { computeStreaks, crossedMilestone, dayStrength } from '@/domain/streaks';
import type { DailySummary } from '@/domain/types';

const day = (d: string, total: number, goal = 2000): [string, DailySummary] => [d, { day: d, totalMl: total, goalMl: goal, entryCount: 1, byDrink: {} }];

describe('streaks', () => {
  it('counts consecutive goal days ending today', () => {
    const s = new Map([day('2024-05-01', 2000), day('2024-05-02', 2500), day('2024-05-03', 2000)]);
    expect(computeStreaks(s, '2024-05-03')).toMatchObject({ current: 3, longest: 3 });
  });
  it('does not break while today is still in progress', () => {
    const s = new Map([day('2024-05-01', 2000), day('2024-05-02', 2100), day('2024-05-03', 500)]);
    expect(computeStreaks(s, '2024-05-03').current).toBe(2);
  });
  it('a missed day resets current but keeps longest', () => {
    const s = new Map([day('2024-05-01', 2000), day('2024-05-02', 2000), day('2024-05-03', 100), day('2024-05-04', 2000)]);
    expect(computeStreaks(s, '2024-05-04')).toMatchObject({ current: 1, longest: 2 });
    expect(computeStreaks(s, '2024-05-06').current).toBe(0);
  });
  it('respects per-day goals', () => {
    const s = new Map([day('2024-05-01', 1800, 1800), day('2024-05-02', 1800, 2200)]);
    expect(computeStreaks(s, '2024-05-02').current).toBe(1); // today unfinished; yesterday counted
    expect(computeStreaks(s, '2024-05-03').current).toBe(0); // goal rose to 2200 on 05-02 and was missed
  });
  it('works across month/DST boundaries', () => {
    const s = new Map([day('2024-03-09', 2000), day('2024-03-10', 2000), day('2024-03-11', 2000)]);
    expect(computeStreaks(s, '2024-03-11').current).toBe(3);
  });
  it('milestones', () => {
    expect(crossedMilestone(6, 7)).toBe(7);
    expect(crossedMilestone(7, 8)).toBeUndefined();
    expect(crossedMilestone(0, 3)).toBe(3);
  });
  it('day strength', () => {
    expect(dayStrength(undefined)).toBe('none');
    expect(dayStrength(day('d', 1000)[1])).toBe('half');
    expect(dayStrength(day('d', 2000)[1])).toBe('complete');
  });
});
