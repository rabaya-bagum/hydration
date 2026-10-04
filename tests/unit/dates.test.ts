import { addDays, dayKey, daysBetween, lastNDays, minutesOfDay, monthGrid, weekdayIndex } from '@/domain/dates';

describe('dates', () => {
  it('buckets by the log timezone, not UTC', () => {
    const t = '2024-03-10T03:30:00Z';
    expect(dayKey(t, 'America/Los_Angeles')).toBe('2024-03-09');
    expect(dayKey(t, 'Asia/Dhaka')).toBe('2024-03-10');
    expect(dayKey(t, 'UTC')).toBe('2024-03-10');
  });
  it('midnight rollover is exact', () => {
    expect(dayKey('2024-06-01T23:59:59-07:00', 'America/Los_Angeles')).toBe('2024-06-01');
    expect(dayKey('2024-06-02T00:00:00-07:00', 'America/Los_Angeles')).toBe('2024-06-02');
  });
  it('handles DST spring-forward and fall-back days', () => {
    // US spring forward 2024-03-10: 23h day
    expect(dayKey('2024-03-10T09:59:00Z', 'America/New_York')).toBe('2024-03-10'); // 05:59 EDT
    expect(dayKey('2024-03-11T03:59:00Z', 'America/New_York')).toBe('2024-03-10'); // 23:59 EDT
    expect(dayKey('2024-03-11T04:00:00Z', 'America/New_York')).toBe('2024-03-11');
    // fall back 2024-11-03: 25h day
    expect(dayKey('2024-11-04T04:59:00Z', 'America/New_York')).toBe('2024-11-03'); // 23:59 EST
    expect(dayKey('2024-11-04T05:00:00Z', 'America/New_York')).toBe('2024-11-04');
    expect(minutesOfDay('2024-11-03T06:30:00Z', 'America/New_York')).toBe(60 + 30); // 01:30 EST
  });
  it('addDays crosses month/year/DST safely', () => {
    expect(addDays('2024-02-28', 2)).toBe('2024-03-01');
    expect(addDays('2024-12-31', 1)).toBe('2025-01-01');
    expect(addDays('2024-03-09', 2)).toBe('2024-03-11');
    expect(daysBetween('2024-03-09', '2024-03-11')).toBe(2);
  });
  it('weekday + grid', () => {
    expect(weekdayIndex('2024-03-04')).toBe(0); // Monday
    expect(weekdayIndex('2024-03-10')).toBe(6);
    const g = monthGrid(2024, 3);
    expect(g.length % 7).toBe(0);
    expect(g.filter(Boolean)).toHaveLength(31);
    expect(g[4]).toBe('2024-03-01'); // Friday
  });
  it('lastNDays', () => { expect(lastNDays('2024-03-10', 3)).toEqual(['2024-03-08', '2024-03-09', '2024-03-10']); });
});

import { formatDayLabel, formatMinutes } from '@/domain/dates';
describe('labels', () => {
  it('formats day and minute labels', () => {
    expect(formatDayLabel('2026-10-04')).toBe('4 Oct');
    expect(formatMinutes(7 * 60 + 5)).toBe('07:05');
    expect(formatMinutes(13 * 60, true)).toBe('1:00 PM');
    expect(formatMinutes(0, true)).toBe('12:00 AM');
  });
});
