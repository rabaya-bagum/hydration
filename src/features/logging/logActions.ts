import { deviceTimeZone, dayKey } from '@/domain/dates';
import { encouragement } from '@/domain/messages';
import { getCharacter } from '@/content/characters';
import { formatVolume } from '@/domain/units';
import { buildSummaries, countedMl } from '@/domain/progress';
import type { DrinkLog, LogSource } from '@/domain/types';
import { analytics } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';

export interface LogDrinkInput {
  drinkTypeId: string;
  volumeMl: number;
  containerId?: string;
  loggedAt?: string;
  source?: LogSource;
}

/** Total counted for a day from current store state. */
function totalForDay(day: string): number {
  const { logs } = useLogsStore.getState();
  const { weighting, goalFor } = useSettingsStore.getState();
  return buildSummaries(logs, { weighting, goalFor }).get(day)?.totalMl ?? 0;
}

/**
 * The one entry point for adding a drink: stores locally first (offline-safe),
 * then haptics, toast and celebration. Never opens a modal.
 */
export function logDrink(input: LogDrinkInput): DrinkLog {
  const settings = useSettingsStore.getState();
  const tz = deviceTimeZone();
  const drink = settings.drinkTypes.find((d) => d.id === input.drinkTypeId);
  const when = input.loggedAt ?? new Date().toISOString();
  const day = dayKey(when, tz);
  const before = totalForDay(day);

  const log = useLogsStore.getState().addLog({
    drinkTypeId: input.drinkTypeId, volumeMl: input.volumeMl, hydrationFactor: drink?.hydrationFactor ?? 1,
    containerId: input.containerId, loggedAt: input.loggedAt, tz, source: input.source ?? 'quick_add',
  });

  const after = totalForDay(day);
  const goal = settings.goalFor(day);
  const ui = useUiStore.getState();
  analytics.track('drink_logged', { drink: input.drinkTypeId, source: log.source });
  if (before < goal && after >= goal) {
    haptics.success();
    analytics.track('goal_reached');
    ui.triggerCelebration({ title: 'Goal reached!', body: `${formatVolume(goal, settings.unitSystem)} done. ${getCharacter(settings.characterId).name} is doing a happy dance.` });
  } else {
    haptics.log();
  }
  ui.showToast(encouragement(before, after, goal, settings.unitSystem), {
    label: 'Undo',
    run: () => useLogsStore.getState().deleteLog(log.id),
  });
  return log;
}

export function removeLogWithUndo(id: string) {
  const store = useLogsStore.getState();
  store.deleteLog(id);
  analytics.track('drink_deleted');
  useUiStore.getState().showToast('Entry deleted', { label: 'Undo', run: () => useLogsStore.getState().restoreLog(id) });
}

export { countedMl };
