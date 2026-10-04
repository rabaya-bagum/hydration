import { deviceTimeZone, dayKey } from '@/domain/dates';
import { analytics } from '@/services/analytics';
import { useSettingsStore } from '@/store/settingsStore';
import { fromMinutes } from '@/domain/reminders';
import { finalGoal, type Draft } from './draft';

/** Commit the onboarding draft to persistent settings. */
export function commitOnboarding(draft: Draft) {
  const s = useSettingsStore.getState();
  const today = dayKey(new Date(), deviceTimeZone());
  s.patch({
    onboarded: true, name: draft.name.trim(), unitSystem: draft.unitSystem, ageRange: draft.ageRange, weightKg: draft.weightKg, heightCm: draft.heightCm,
    activity: draft.activity, climate: draft.climate, exerciseDays: draft.exerciseDays, caffeineCups: draft.caffeineCups, characterId: draft.characterId,
    containers: s.containers.map((c) => ({ ...c, favorite: draft.favoriteContainerIds.includes(c.id) })),
  });
  s.setGoal(finalGoal(draft), today);
  s.patchReminders({ enabled: draft.remindersOn, wake: fromMinutes(draft.wakeMin), bed: fromMinutes(draft.bedMin) });
  analytics.track('onboarding_completed', { reminders: draft.remindersOn });
  if (draft.remindersOn) analytics.track('reminder_enabled');
}
