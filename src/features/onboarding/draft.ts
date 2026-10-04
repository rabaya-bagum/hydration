import { calculateGoal, clampGoal, GOAL_STEP_ML } from '@/domain/hydrationGoal';
import type { ActivityLevel, AgeRange, Climate, UnitSystem } from '@/domain/types';

export interface Draft {
  name: string;
  unitSystem: UnitSystem;
  ageRange: AgeRange;
  weightKg?: number; // undefined = prefer not to say
  heightCm?: number;
  activity: ActivityLevel;
  climate: Climate;
  exerciseDays: number;
  caffeineCups: number;
  wakeMin: number;
  bedMin: number;
  goalOffsetMl: number; // user edits relative to the calculated suggestion
  favoriteContainerIds: string[];
  remindersOn: boolean;
  characterId: string;
}

export const initialDraft: Draft = {
  name: '', unitSystem: 'metric', ageRange: 'unspecified', weightKg: 70, heightCm: 170, activity: 'moderate', climate: 'mild',
  exerciseDays: 2, caffeineCups: 1, wakeMin: 7 * 60, bedMin: 23 * 60, goalOffsetMl: 0,
  favoriteContainerIds: ['glass', 'mug', 'bottle'], remindersOn: false, characterId: 'otto',
};

export const suggestedGoal = (d: Draft) =>
  calculateGoal({ weightKg: d.weightKg, activity: d.activity, climate: d.climate, exerciseDaysPerWeek: d.exerciseDays, caffeineCupsPerDay: d.caffeineCups });

export const finalGoal = (d: Draft) => clampGoal(suggestedGoal(d).totalMl + d.goalOffsetMl);
export { GOAL_STEP_ML };

export interface StepProps { draft: Draft; set: (p: Partial<Draft>) => void }
