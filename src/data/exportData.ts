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

const csvCell = (v: string | number) => {
  const s = String(v);
  // quote fields containing separators/quotes/newlines; also neutralise spreadsheet formula injection
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Premium: one row per live log, local time of the log's own timezone. */
export function buildCsv(logs: DrinkLog[], drinkName: (id: string) => string): string {
  const header = ['logged_at_utc', 'timezone', 'drink', 'volume_ml', 'counted_ml', 'source'];
  const rows = logs.filter((l) => !l.deletedAt).sort((a, b) => a.loggedAt.localeCompare(b.loggedAt))
    .map((l) => [l.loggedAt, l.tz, drinkName(l.drinkTypeId), l.volumeMl, l.hydrationMl, l.source].map(csvCell).join(','));
  return [header.join(','), ...rows].join('\n');
}
