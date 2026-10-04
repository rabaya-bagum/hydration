import { calculateGoal, clampGoal, GOAL_CONFIG } from '@/domain/hydrationGoal';

describe('goal engine', () => {
  it('computes baseline + adjustments, rounded to 50', () => {
    const r = calculateGoal({ weightKg: 70, activity: 'moderate', climate: 'mild', exerciseDaysPerWeek: 3 });
    // 70*33=2310 +250 +120 = 2680 -> 2700
    expect(r.baselineMl).toBe(2310);
    expect(r.totalMl).toBe(2700);
    expect(r.adjustments.map((a) => a.key)).toEqual(['activity', 'exercise']);
  });
  it('uses a default weight when unknown', () => {
    expect(calculateGoal({ activity: 'low', climate: 'mild' }).baselineMl).toBe(Math.round(GOAL_CONFIG.defaultWeightKg * GOAL_CONFIG.mlPerKg));
  });
  it('clamps to safe bounds', () => {
    const low = calculateGoal({ weightKg: 30, activity: 'low', climate: 'cool' });
    expect(low.totalMl).toBe(GOAL_CONFIG.minMl);
    expect(low.clamped).toBe(true);
    const high = calculateGoal({ weightKg: 200, activity: 'very_high', climate: 'hot', exerciseDaysPerWeek: 7, caffeineCupsPerDay: 6 });
    expect(high.totalMl).toBe(GOAL_CONFIG.maxMl);
  });
  it('adds caffeine only above threshold', () => {
    const base = { weightKg: 60, activity: 'low', climate: 'mild' } as const;
    expect(calculateGoal({ ...base, caffeineCupsPerDay: 3 }).adjustments).toHaveLength(0);
    expect(calculateGoal({ ...base, caffeineCupsPerDay: 4 }).adjustments[0]?.key).toBe('caffeine');
  });
  it('accepts custom config (formula is swappable)', () => {
    const r = calculateGoal({ weightKg: 100, activity: 'low', climate: 'mild' }, { ...GOAL_CONFIG, mlPerKg: 20 });
    expect(r.totalMl).toBe(2000);
  });
  it('clampGoal', () => { expect(clampGoal(99999)).toBe(GOAL_CONFIG.maxMl); });
});
