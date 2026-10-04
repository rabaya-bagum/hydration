import { bestDay, changeVsPrevious, dayPartOf, timeOfDayShares, weekdayAverages } from '@/domain/insights';
import { ARTICLES, ARTICLE_CATEGORIES } from '@/content/articles';
import { CHALLENGES } from '@/content/challenges';
import { CHARACTERS, COSMETICS } from '@/content/characters';
import { DEFAULT_DRINK_TYPES } from '@/content/drinks';
import { migrateSettings } from '@/store/settingsStore';
import type { DailySummary, DrinkLog } from '@/domain/types';

const S = (day: string, total: number): [string, DailySummary] => [day, { day, totalMl: total, goalMl: 2000, entryCount: total ? 1 : 0, byDrink: {} }];
const L = (at: string, ml: number): DrinkLog => ({ id: at, drinkTypeId: 'water', volumeMl: ml, hydrationMl: ml, loggedAt: at, tz: 'UTC', source: 'manual', createdAt: at, updatedAt: at });

describe('insights', () => {
  it('day parts, including night wrapping past midnight', () => {
    expect([6 * 60, 13 * 60, 19 * 60, 23 * 60, 2 * 60].map(dayPartOf)).toEqual(['morning', 'afternoon', 'evening', 'night', 'night']);
  });
  it('time-of-day shares sum to 1 and respect the day set', () => {
    const logs = [L('2024-05-01T08:00:00Z', 300), L('2024-05-01T19:00:00Z', 100), L('2024-05-09T08:00:00Z', 999)];
    const r = timeOfDayShares(logs, new Set(['2024-05-01']));
    expect(r.morning).toBeCloseTo(0.75);
    expect(r.evening).toBeCloseTo(0.25);
  });
  it('weekday averages and best day', () => {
    const m = new Map([S('2024-05-06', 2000), S('2024-05-13', 1000), S('2024-05-07', 500)]); // two Mondays + a Tuesday
    const avg = weekdayAverages(m, [...m.keys()]);
    expect(avg[0]).toBe(1500);
    expect(avg[1]).toBe(500);
    expect(avg[2]).toBeUndefined();
    expect(bestDay(m, [...m.keys()])?.day).toBe('2024-05-06');
    expect(bestDay(new Map(), ['2024-05-06'])).toBeUndefined();
  });
  it('change vs previous', () => { expect(changeVsPrevious(1500, 1000)).toBe(50); expect(changeVsPrevious(500, 0)).toBeUndefined(); });
});

describe('content integrity', () => {
  it('has at least 12 articles with valid categories, 1-3 min reads and unique ids', () => {
    expect(ARTICLES.length).toBeGreaterThanOrEqual(12);
    const cats = new Set(ARTICLE_CATEGORIES.map((c) => c.id));
    expect(new Set(ARTICLES.map((a) => a.id)).size).toBe(ARTICLES.length);
    for (const a of ARTICLES) { expect(cats.has(a.category)).toBe(true); expect(a.readMinutes).toBeGreaterThanOrEqual(1); expect(a.readMinutes).toBeLessThanOrEqual(3); expect(a.body.length).toBeGreaterThan(1); }
    for (const c of ARTICLE_CATEGORIES) expect(ARTICLES.some((a) => a.category === c.id)).toBe(true);
  });
  it('avoids medical claim language', () => {
    const text = ARTICLES.flatMap((a) => [a.title, a.summary, ...a.body]).join(' ').toLowerCase();
    expect(text).not.toMatch(/\b(cure|cures|prevent|prevents|detox|treatment|guarantee|guaranteed|toxins|heal|heals)\b/);
  });
  it('challenges, characters and cosmetics are consistent', () => {
    expect(new Set(CHALLENGES.map((c) => c.id)).size).toBe(CHALLENGES.length);
    for (const c of CHALLENGES) expect(c.targetDays).toBeLessThanOrEqual(c.windowDays);
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(CHARACTERS.length);
    expect(CHARACTERS.filter((c) => c.starter).length).toBeGreaterThanOrEqual(3);
    expect(COSMETICS.some((c) => c.kind === 'scene')).toBe(true);
  });
});

describe('settings migration', () => {
  it('adds new built-in drinks without dropping custom ones', () => {
    const old = { drinkTypes: DEFAULT_DRINK_TYPES.filter((d) => d.id !== 'infused').concat({ id: 'x', name: 'Mine', icon: '✨', hydrationFactor: 1, caffeinated: false, custom: true }), goalMl: 2600 };
    const m = migrateSettings(old);
    expect(m.drinkTypes.some((d) => d.id === 'infused')).toBe(true);
    expect(m.drinkTypes.some((d) => d.id === 'x')).toBe(true);
    expect(m.goalMl).toBe(2600);
    expect(m.accessoryId).toBe('none');
  });
});
