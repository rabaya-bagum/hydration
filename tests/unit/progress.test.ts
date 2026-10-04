import { buildSummaries, goalForDay, percentOf, setGoalFromDay } from '@/domain/progress';
import type { DrinkLog } from '@/domain/types';

const mk = (id: string, loggedAt: string, volumeMl: number, tz = 'UTC', extra: Partial<DrinkLog> = {}): DrinkLog => ({
  id, drinkTypeId: 'water', volumeMl, hydrationMl: volumeMl, loggedAt, tz, source: 'manual', createdAt: loggedAt, updatedAt: loggedAt, ...extra,
});

describe('summaries', () => {
  it('totals per day and records when goal was reached', () => {
    const s = buildSummaries([mk('a', '2024-05-01T08:00:00Z', 1000), mk('b', '2024-05-01T12:00:00Z', 1200), mk('c', '2024-05-01T15:00:00Z', 300)], { weighting: false, goalFor: () => 2000 });
    const d = s.get('2024-05-01')!;
    expect(d.totalMl).toBe(2500);
    expect(d.goalReachedAt).toBe('2024-05-01T12:00:00Z');
    expect(d.entryCount).toBe(3);
  });
  it('ignores soft-deleted logs', () => {
    const s = buildSummaries([mk('a', '2024-05-01T08:00:00Z', 500), mk('b', '2024-05-01T09:00:00Z', 500, 'UTC', { deletedAt: '2024-05-01T10:00:00Z' })], { weighting: false, goalFor: () => 2000 });
    expect(s.get('2024-05-01')!.totalMl).toBe(500);
  });
  it('deduplicates nothing silently: identical ids upstream are the sync layer concern, distinct logs add up', () => {
    const s = buildSummaries([mk('a', '2024-05-01T08:00:00Z', 250), mk('b', '2024-05-01T08:00:00Z', 250)], { weighting: false, goalFor: () => 2000 });
    expect(s.get('2024-05-01')!.totalMl).toBe(500);
  });
  it('uses each log\'s own timezone for the day (travel/timezone change)', () => {
    const s = buildSummaries(
      [mk('a', '2024-05-01T23:00:00Z', 300, 'America/Los_Angeles'), mk('b', '2024-05-02T02:00:00Z', 300, 'Asia/Dhaka')],
      { weighting: false, goalFor: () => 2000 },
    );
    expect(s.get('2024-05-01')!.totalMl).toBe(300); // 16:00 PDT on May 1
    expect(s.get('2024-05-02')!.totalMl).toBe(300); // 08:00 BDT on May 2
  });
  it('hydration weighting is opt-in', () => {
    const logs = [mk('a', '2024-05-01T08:00:00Z', 400, 'UTC', { hydrationMl: 360 })];
    expect(buildSummaries(logs, { weighting: false, goalFor: () => 2000 }).get('2024-05-01')!.totalMl).toBe(400);
    expect(buildSummaries(logs, { weighting: true, goalFor: () => 2000 }).get('2024-05-01')!.totalMl).toBe(360);
  });
});

describe('goal history (mid-day change)', () => {
  it('past days keep their goal; today and future use the new one', () => {
    let h = setGoalFromDay([], '2024-05-01', 2000);
    h = setGoalFromDay(h, '2024-05-03', 2500);
    expect(goalForDay(h, '2024-05-02', 9)).toBe(2000);
    expect(goalForDay(h, '2024-05-03', 9)).toBe(2500);
    expect(goalForDay(h, '2024-05-09', 9)).toBe(2500);
    // changing again on the same day replaces rather than stacks
    h = setGoalFromDay(h, '2024-05-03', 2300);
    expect(h).toHaveLength(2);
    expect(goalForDay(h, '2024-05-03', 9)).toBe(2300);
  });
  it('recomputes goal-reached when goal drops mid-day', () => {
    const logs = [mk('a', '2024-05-03T08:00:00Z', 1500), mk('b', '2024-05-03T10:00:00Z', 600)];
    const hi = buildSummaries(logs, { weighting: false, goalFor: () => 2500 }).get('2024-05-03')!;
    const lo = buildSummaries(logs, { weighting: false, goalFor: () => 2000 }).get('2024-05-03')!;
    expect(hi.goalReachedAt).toBeUndefined();
    expect(lo.goalReachedAt).toBe('2024-05-03T10:00:00Z');
  });
  it('percentOf', () => { expect(percentOf(1650, 2300)).toBe(72); expect(percentOf(1, 0)).toBe(0); });
});
