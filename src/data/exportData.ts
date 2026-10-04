import type { DrinkLog } from '@/domain/types';
import type { SettingsState } from '@/store/settingsStore';

/** User-owned export: settings + every non-deleted log. Plain JSON, no tracking ids. */
export function buildExport(settings: SettingsState, logs: DrinkLog[], rewards?: { ledger: unknown; challenges: unknown; readArticles: string[]; bookmarks: string[] }, now = new Date()) {
  const {
    patch: _p, setGoal: _s, goalFor: _g, patchReminders: _r, upsertContainer: _u, removeContainer: _x, addCustomDrink: _a, resetAll: _ra, ...data
  } = settings;
  return {
    app: 'Plink', version: 1, exportedAt: now.toISOString(),
    settings: data,
    rewards: rewards ? { ledger: rewards.ledger, challenges: rewards.challenges, readArticles: rewards.readArticles, bookmarks: rewards.bookmarks } : undefined,
    logs: logs.filter((l) => !l.deletedAt).map(({ deletedAt: _d, ...l }) => l),
  };
}
