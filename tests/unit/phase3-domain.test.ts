import { buildWidgetSnapshot, snapshotKey } from '@/domain/widgetSnapshot';
import { resolveWidgetLog, WIDGET_LOG_COOLDOWN_MS } from '@/domain/widgetLink';
import { planHealthSync } from '@/domain/healthSync';
import { buildShareContent } from '@/domain/shareCards';
import type { Container, DailySummary, DrinkLog } from '@/domain/types';

const S = (day: string, total: number, goal = 2000): [string, DailySummary] => [day, { day, totalMl: total, goalMl: goal, entryCount: 1, byDrink: {} }];
const containers: Container[] = [
  { id: 'glass', name: 'Glass', volumeMl: 250, favorite: true }, { id: 'mug', name: 'Mug', volumeMl: 350, favorite: true },
  { id: 'bottle', name: 'Bottle', volumeMl: 500, favorite: true }, { id: 'litre', name: 'Litre', volumeMl: 1000, favorite: true },
];

describe('widget snapshot', () => {
  const snap = buildWidgetSnapshot({ summaries: new Map([S('2024-05-06', 1000), S('2024-05-07', 1500)]), today: '2024-05-07', goalMl: 2000, streak: 3, containers, unit: 'metric', characterId: 'otto', now: new Date('2024-05-07T10:00:00Z') });
  it('has small/medium/large data', () => {
    expect(snap).toMatchObject({ consumedMl: 1500, percent: 75, remainingMl: 500, streak: 3, characterId: 'otto' });
    expect(snap.trend).toHaveLength(7);
    expect(snap.trend[6]).toEqual({ day: '2024-05-07', percent: 75 });
    expect(snap.trend[5]).toEqual({ day: '2024-05-06', percent: 50 });
    expect(snap.trend[0]!.percent).toBe(0);
  });
  it('limits quick-add to 3 and links to the log URL', () => {
    expect(snap.quickAdd.map((q) => q.url)).toEqual(['plink://log?ml=250', 'plink://log?ml=350', 'plink://log?ml=500']);
  });
  it('contains no personal fields', () => {
    expect(Object.keys(snap).sort()).toEqual(['characterId', 'consumedMl', 'day', 'goalMl', 'percent', 'quickAdd', 'remainingMl', 'streak', 'trend', 'unit', 'updatedAt', 'version']);
  });
  it('key ignores the timestamp so unchanged data is not republished', () => {
    expect(snapshotKey(snap)).toBe(snapshotKey({ ...snap, updatedAt: 'later' }));
    expect(snapshotKey(snap)).not.toBe(snapshotKey({ ...snap, consumedMl: 1600 }));
  });
});

describe('widget deep link', () => {
  it('accepts only exact vessel sizes', () => {
    expect(resolveWidgetLog('250', containers, undefined, 0)).toEqual({ ok: true, volumeMl: 250, containerId: 'glass' });
    expect(resolveWidgetLog('300', containers, undefined, 0)).toEqual({ ok: false, reason: 'not-a-vessel' });
  });
  it('rejects junk', () => {
    for (const bad of [undefined, '', 'abc', '-5', '0', '250.5', '1e3']) expect(resolveWidgetLog(bad, containers, undefined, 0)).toEqual({ ok: false, reason: 'invalid' });
  });
  it('rate-limits repeats', () => {
    expect(resolveWidgetLog('250', containers, 1000, 1000 + WIDGET_LOG_COOLDOWN_MS - 1)).toEqual({ ok: false, reason: 'too-soon' });
    expect(resolveWidgetLog('250', containers, 1000, 1000 + WIDGET_LOG_COOLDOWN_MS).ok).toBe(true);
  });
});

const L = (id: string, drink: string, updatedAt = 't1', deletedAt?: string): DrinkLog => ({ id, drinkTypeId: drink, volumeMl: 250, hydrationMl: 250, loggedAt: 't', tz: 'UTC', source: 'manual', createdAt: 't', updatedAt, deletedAt });
describe('health sync plan', () => {
  it('writes new water logs only', () => {
    expect(planHealthSync([L('a', 'water'), L('b', 'coffee'), L('c', 'infused')], {})).toEqual([{ op: 'write', log: expect.objectContaining({ id: 'a' }) }, { op: 'write', log: expect.objectContaining({ id: 'c' }) }]);
  });
  it('is idempotent once exported', () => { expect(planHealthSync([L('a', 'water')], { a: 't1' })).toEqual([]); });
  it('rewrites edited logs and deletes removed ones', () => {
    expect(planHealthSync([L('a', 'water', 't2')], { a: 't1' })).toEqual([{ op: 'write', log: expect.objectContaining({ id: 'a' }) }]);
    expect(planHealthSync([L('a', 'water', 't2', 'x')], { a: 't1' })).toEqual([{ op: 'delete', id: 'a' }]);
    expect(planHealthSync([], { gone: 't1' })).toEqual([{ op: 'delete', id: 'gone' }]);
  });
  it('removes an export when a log is edited to a non-water drink', () => {
    expect(planHealthSync([L('a', 'coffee', 't2')], { a: 't1' })).toEqual([{ op: 'delete', id: 'a' }]);
  });
});

describe('share content privacy', () => {
  const base = { unit: 'metric' as const, name: 'Alex', includeName: false, includeAmounts: false };
  it('hides name and amounts by default', () => {
    const c = buildShareContent({ ...base, kind: 'daily', percent: 104, totalMl: 2400, goalMl: 2300 });
    expect(c.from).toBeUndefined();
    expect(c.detail).toBeUndefined();
    expect(JSON.stringify(c)).not.toMatch(/2400|2\.4|Alex/);
  });
  it('includes them only when opted in', () => {
    const c = buildShareContent({ ...base, includeName: true, includeAmounts: true, kind: 'daily', percent: 104, totalMl: 2400 });
    expect(c.from).toBe('Alex');
    expect(c.detail).toBe('2.4 L today');
  });
  it('streak, challenge and month variants', () => {
    expect(buildShareContent({ ...base, kind: 'streak', streakDays: 7 })).toMatchObject({ headline: '7-day streak!', stat: '7' });
    expect(buildShareContent({ ...base, kind: 'challenge', challengeTitle: 'Morning Splash' }).stat).toBe('Morning Splash');
    const m = buildShareContent({ ...base, kind: 'month', monthLabel: 'October', goalDays: 18, trackedDays: 30, avgMl: 2100 });
    expect(m).toMatchObject({ stat: '18/30', headline: 'October summary' });
    expect(m.detail).toBeUndefined();
  });
  it('ignores a blank name', () => { expect(buildShareContent({ ...base, includeName: true, name: '  ', kind: 'streak', streakDays: 3 }).from).toBeUndefined(); });
});
