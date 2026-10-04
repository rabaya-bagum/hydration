import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CONTAINERS, DEFAULT_DRINK_TYPES } from '@/content/drinks';
import { clampGoal } from '@/domain/hydrationGoal';
import { goalForDay, setGoalFromDay, type GoalHistoryEntry } from '@/domain/progress';
import { DEFAULT_REMINDER_PREFS, type ReminderPrefs } from '@/domain/reminders';
import type { ActivityLevel, AgeRange, Climate, Container, DrinkType, UnitSystem } from '@/domain/types';
import type { DayKey } from '@/domain/dates';
import { newId } from '@/services/uuid';
import { jsonStorage } from './storage';

export interface SettingsState {
  onboarded: boolean;
  name: string;
  ageRange: AgeRange;
  heightCm?: number;
  weightKg?: number;
  activity: ActivityLevel;
  climate: Climate;
  exerciseDays: number;
  caffeineCups: number;
  unitSystem: UnitSystem;
  goalMl: number;
  goalHistory: GoalHistoryEntry[];
  weighting: boolean; // hydration weighting off by default: plain volume tracking
  containers: Container[];
  drinkTypes: DrinkType[];
  favoriteDrinkIds: string[];
  characterId: string;
  accessoryId: string;
  sceneId: string;
  reminders: ReminderPrefs;
  hour12: boolean;

  patch: (p: Partial<Omit<SettingsState, 'patch'>>) => void;
  setGoal: (ml: number, today: DayKey) => void;
  goalFor: (day: DayKey) => number;
  patchReminders: (p: Partial<ReminderPrefs>) => void;
  upsertContainer: (c: Omit<Container, 'id'> & { id?: string }) => void;
  removeContainer: (id: string) => void;
  addCustomDrink: (name: string, icon: string) => DrinkType;
  resetAll: () => void;
}

const initial = {
  onboarded: false, name: '', ageRange: 'unspecified' as AgeRange, activity: 'moderate' as ActivityLevel,
  climate: 'mild' as Climate, exerciseDays: 2, caffeineCups: 1, unitSystem: 'metric' as UnitSystem,
  goalMl: 2200, goalHistory: [] as GoalHistoryEntry[], weighting: false, containers: DEFAULT_CONTAINERS,
  drinkTypes: DEFAULT_DRINK_TYPES, favoriteDrinkIds: ['water', 'tea', 'coffee', 'juice'], characterId: 'otto', accessoryId: 'none', sceneId: 'day',
  reminders: DEFAULT_REMINDER_PREFS, hour12: false,
};

/** Exported for tests. Adds any built-in drink types and cosmetic defaults missing from older saves. */
export function migrateSettings(old: Partial<SettingsState>): SettingsState {
  const have = new Set((old.drinkTypes ?? []).map((d) => d.id));
  const missing = DEFAULT_DRINK_TYPES.filter((d) => !have.has(d.id));
  return { ...initial, ...old, drinkTypes: [...(old.drinkTypes ?? DEFAULT_DRINK_TYPES), ...missing], accessoryId: old.accessoryId ?? 'none', sceneId: old.sceneId ?? 'day' } as SettingsState;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...initial,
      patch: (p) => set(p),
      setGoal: (ml, today) => {
        const goalMl = clampGoal(ml);
        set((s) => ({ goalMl, goalHistory: setGoalFromDay(s.goalHistory, today, goalMl) }));
      },
      goalFor: (day) => goalForDay(get().goalHistory, day, get().goalMl),
      patchReminders: (p) => set((s) => ({ reminders: { ...s.reminders, ...p } })),
      upsertContainer: (c) =>
        set((s) => {
          const id = c.id ?? newId();
          const next: Container = { id, name: c.name, volumeMl: c.volumeMl, favorite: c.favorite };
          const exists = s.containers.some((x) => x.id === id);
          return { containers: exists ? s.containers.map((x) => (x.id === id ? next : x)) : [...s.containers, next] };
        }),
      removeContainer: (id) => set((s) => ({ containers: s.containers.filter((c) => c.id !== id) })),
      addCustomDrink: (name, icon) => {
        const drink: DrinkType = { id: newId(), name: name.trim(), icon, hydrationFactor: 0.9, caffeinated: false, custom: true };
        set((s) => ({ drinkTypes: [...s.drinkTypes, drink] }));
        return drink;
      },
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'plink.settings.v1',
      storage: jsonStorage,
      version: 2,
      // v1 -> v2: new built-in drinks and cosmetics for users who already have saved settings
      migrate: (persisted) => migrateSettings(persisted as Partial<SettingsState>),
      partialize: ({ patch: _p, setGoal: _s, goalFor: _g, patchReminders: _r, upsertContainer: _u, removeContainer: _x, addCustomDrink: _a, resetAll: _ra, ...data }) => data,
    },
  ),
);
