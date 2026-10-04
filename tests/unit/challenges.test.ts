import { evaluateChallenge, type ChallengeDef, type ChallengeEnv } from '@/domain/challenges';
import { CHALLENGES } from '@/content/challenges';
import type { DailySummary, DrinkLog } from '@/domain/types';

const L = (id: string, at: string, ml: number, drink = 'water', containerId?: string): DrinkLog => ({ id, drinkTypeId: drink, volumeMl: ml, hydrationMl: ml, loggedAt: at, tz: 'UTC', source: 'manual', createdAt: at, updatedAt: at, containerId });
const env = (logs: DrinkLog[], summaries: [string, number, number][] = []): ChallengeEnv => ({
  logs, caffeinatedDrinkIds: new Set(['coffee', 'tea']),
  summaries: new Map(summaries.map(([d, t, g]) => [d, { day: d, totalMl: t, goalMl: g, entryCount: 1, byDrink: {} } as DailySummary])),
});
const def = (id: string) => CHALLENGES.find((c) => c.id === id) as ChallengeDef;

describe('challenge engine', () => {
  it('Morning Splash counts days with 300 mL before 10 AM (sum across entries)', () => {
    const logs = [L('1', '2024-05-01T08:00:00Z', 200), L('2', '2024-05-01T09:00:00Z', 150), L('3', '2024-05-02T11:00:00Z', 500), L('4', '2024-05-03T07:00:00Z', 300)];
    const s = evaluateChallenge(def('morning-splash'), '2024-05-01', '2024-05-03', env(logs));
    expect(s.qualifying).toEqual(['2024-05-01', '2024-05-03']);
    expect(s).toMatchObject({ progress: 2, target: 5, done: false, expired: false });
  });
  it('ignores days before start and after the window', () => {
    const logs = [L('0', '2024-04-30T08:00:00Z', 400), L('1', '2024-05-01T08:00:00Z', 400)];
    expect(evaluateChallenge(def('morning-splash'), '2024-05-01', '2024-05-02', env(logs)).progress).toBe(1);
  });
  it('completes and caps progress', () => {
    const logs = Array.from({ length: 6 }, (_, i) => L(String(i), `2024-05-0${i + 1}T08:00:00Z`, 400));
    const s = evaluateChallenge(def('morning-splash'), '2024-05-01', '2024-05-06', env(logs));
    expect(s).toMatchObject({ progress: 5, done: true, expired: false });
  });
  it('expires gently when the window passes unfinished', () => {
    const s = evaluateChallenge(def('morning-splash'), '2024-05-01', '2024-05-20', env([L('1', '2024-05-01T08:00:00Z', 400)]));
    expect(s).toMatchObject({ done: false, expired: true, progress: 1, daysLeft: 0 });
  });
  it('Seven-Day Flow needs consecutive goal days', () => {
    const days = ['01', '02', '03', '04', '05', '06', '07'].map((d) => [`2024-05-${d}`, 2000, 2000] as [string, number, number]);
    expect(evaluateChallenge(def('seven-day-flow'), '2024-05-01', '2024-05-07', env([], days)).done).toBe(true);
    const gap = days.map((d, i) => (i === 3 ? ([d[0], 100, 2000] as [string, number, number]) : d));
    expect(evaluateChallenge(def('seven-day-flow'), '2024-05-01', '2024-05-07', env([], gap))).toMatchObject({ done: false, progress: 3 });
  });
  it('Bottle Buddy uses bottle containers only', () => {
    const logs = [L('1', '2024-05-01T10:00:00Z', 500, 'water', 'bottle'), L('2', '2024-05-02T10:00:00Z', 250, 'water', 'glass'), L('3', '2024-05-03T10:00:00Z', 750, 'water', 'large-bottle')];
    expect(evaluateChallenge(def('bottle-buddy'), '2024-05-01', '2024-05-03', env(logs)).progress).toBe(2);
  });
  it('Caffeine Balance needs caffeine plus at least as much of other drinks', () => {
    const logs = [L('1', '2024-05-01T08:00:00Z', 250, 'coffee'), L('2', '2024-05-01T09:00:00Z', 300, 'water'), L('3', '2024-05-02T08:00:00Z', 250, 'coffee'), L('4', '2024-05-02T09:00:00Z', 100, 'water'), L('5', '2024-05-03T09:00:00Z', 900, 'water')];
    expect(evaluateChallenge(def('caffeine-balance'), '2024-05-01', '2024-05-03', env(logs)).qualifying).toEqual(['2024-05-01']);
  });
  it('Evening Wind-Down, Fruity Water and Steady Sipper', () => {
    expect(evaluateChallenge(def('evening-wind-down'), '2024-05-01', '2024-05-01', env([L('1', '2024-05-01T18:30:00Z', 250)])).progress).toBe(1);
    expect(evaluateChallenge(def('evening-wind-down'), '2024-05-01', '2024-05-01', env([L('1', '2024-05-01T22:30:00Z', 250)])).progress).toBe(0);
    expect(evaluateChallenge(def('fruity-water'), '2024-05-01', '2024-05-01', env([L('1', '2024-05-01T10:00:00Z', 300, 'infused')])).progress).toBe(1);
    const four = [8, 10, 12, 14].map((h, i) => L(String(i), `2024-05-01T${String(h).padStart(2, '0')}:00:00Z`, 200));
    expect(evaluateChallenge(def('steady-sipper'), '2024-05-01', '2024-05-01', env(four)).progress).toBe(1);
    expect(evaluateChallenge(def('steady-sipper'), '2024-05-01', '2024-05-01', env(four.slice(1))).progress).toBe(0);
  });
  it('uses the log timezone for time-of-day rules', () => {
    const l = { ...L('1', '2024-05-01T03:30:00Z', 400), tz: 'America/Los_Angeles' }; // 20:30 PDT on Apr 30
    expect(evaluateChallenge(def('morning-splash'), '2024-04-30', '2024-04-30', env([l])).progress).toBe(0);
    expect(evaluateChallenge(def('evening-wind-down'), '2024-04-30', '2024-04-30', env([l])).progress).toBe(1);
  });
});
