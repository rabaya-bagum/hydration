import { DEFAULT_REMINDER_PREFS, isQuiet, planReminders, REMINDER_LIMITS, type ReminderPrefs } from '@/domain/reminders';

const prefs = (p: Partial<ReminderPrefs> = {}): ReminderPrefs => ({ ...DEFAULT_REMINDER_PREFS, enabled: true, ...p });
const ctx = { day: '2024-05-06', nowMin: 0 as number | null, consumedMl: 0, goalMl: 2400 }; // Monday

describe('reminder planner', () => {
  it('is empty when disabled', () => { expect(planReminders(prefs({ enabled: false }), ctx)).toEqual([]); });
  it('skips when goal reached', () => {
    expect(planReminders(prefs(), { ...ctx, consumedMl: 2400 })).toEqual([]);
    expect(planReminders(prefs({ skipWhenGoalReached: false }), { ...ctx, consumedMl: 2400 }).length).toBeGreaterThan(0);
  });
  it('quiet hours wrap midnight', () => {
    expect(isQuiet(23 * 60, '22:00', '07:00')).toBe(true);
    expect(isQuiet(3 * 60, '22:00', '07:00')).toBe(true);
    expect(isQuiet(12 * 60, '22:00', '07:00')).toBe(false);
  });
  it('never exceeds the daily cap and keeps a minimum gap', () => {
    for (const mode of ['smart', 'interval', 'scheduled'] as const) {
      const t = planReminders(prefs({ mode, maxPerDay: 3, intervalMinutes: 60 }), ctx);
      expect(t.length).toBeLessThanOrEqual(3);
      for (let i = 1; i < t.length; i++) expect(t[i]! - t[i - 1]!).toBeGreaterThanOrEqual(REMINDER_LIMITS.minGapMinutes);
    }
  });
  it('smart mode avoids quiet hours and the past', () => {
    const t = planReminders(prefs({ mode: 'smart' }), { ...ctx, nowMin: 14 * 60 });
    expect(t.every((m) => m >= 14 * 60 + 15 && !isQuiet(m, '22:00', '07:00'))).toBe(true);
  });
  it('smart mode sends fewer when little is left', () => {
    const many = planReminders(prefs({ mode: 'smart', maxPerDay: 8 }), ctx);
    const few = planReminders(prefs({ mode: 'smart', maxPerDay: 8 }), { ...ctx, consumedMl: 2200 });
    expect(few.length).toBeLessThan(many.length);
  });
  it('weekdays only skips weekends', () => {
    expect(planReminders(prefs({ weekdaysOnly: true }), { ...ctx, day: '2024-05-11' })).toEqual([]);
    expect(planReminders(prefs({ weekdaysOnly: true }), ctx).length).toBeGreaterThan(0);
  });
  it('interval mode honours the interval', () => {
    const t = planReminders(prefs({ mode: 'interval', intervalMinutes: 120, maxPerDay: 10 }), ctx);
    expect(t.slice(0, 2)).toEqual([9 * 60, 11 * 60]);
  });
});
