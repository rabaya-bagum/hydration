import { buildExport } from '@/data/exportData';
import { useSettingsStore } from '@/store/settingsStore';
import type { DrinkLog } from '@/domain/types';

const log = (id: string, deletedAt?: string): DrinkLog => ({ id, drinkTypeId: 'water', volumeMl: 250, hydrationMl: 250, loggedAt: '2024-01-01T00:00:00Z', tz: 'UTC', source: 'manual', createdAt: '', updatedAt: '', deletedAt });

it('exports settings data and only live logs, with no functions', () => {
  const out = buildExport(useSettingsStore.getState(), [log('a'), log('b', 'x')]);
  expect(out.logs.map((l) => l.id)).toEqual(['a']);
  expect(JSON.parse(JSON.stringify(out)).settings.goalMl).toBeDefined();
  expect(Object.values(out.settings).some((v) => typeof v === 'function')).toBe(false);
});
