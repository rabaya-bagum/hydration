import type { GoalAdjustment, GoalInput, GoalResult } from './types';

/**
 * Daily goal engine — a general wellness ESTIMATE, not medical advice.
 *
 * Assumptions (all tweakable here, nothing else hard-codes numbers):
 * - Baseline: ~33 mL of total fluid per kg body weight, a commonly cited rule of thumb.
 * - Activity, climate, exercise and caffeine add modest fixed amounts.
 * - Biological sex is intentionally NOT used, so we do not need to collect it.
 * - Result is rounded to a friendly step and clamped to a conservative range.
 */
export const GOAL_CONFIG = {
  mlPerKg: 33,
  defaultWeightKg: 70, // used when weight is "prefer not to say"
  activityMl: { low: 0, moderate: 250, high: 500, very_high: 750 },
  climateMl: { cool: 0, mild: 0, warm: 250, hot: 500 },
  exerciseMlPerDay: 40, // per exercise day/week
  exerciseMaxMl: 280,
  caffeineThresholdCups: 3,
  caffeineMl: 150,
  roundToMl: 50,
  minMl: 1200,
  maxMl: 4500,
  /** Above this share of goal we stop celebrating extra volume and add a gentle note. */
  overGoalNoteRatio: 1.5,
} as const;

export type GoalConfig = typeof GOAL_CONFIG;

const ACTIVITY_LABEL = { low: 'Low activity', moderate: 'Moderate activity', high: 'High activity', very_high: 'Very high activity' } as const;
const CLIMATE_LABEL = { cool: 'Cool climate', mild: 'Mild climate', warm: 'Warm climate', hot: 'Hot climate' } as const;

export function calculateGoal(input: GoalInput, config: GoalConfig = GOAL_CONFIG): GoalResult {
  const weight = input.weightKg && input.weightKg > 0 ? input.weightKg : config.defaultWeightKg;
  const baselineMl = Math.round(weight * config.mlPerKg);
  const adjustments: GoalAdjustment[] = [];
  const add = (key: string, label: string, ml: number) => ml !== 0 && adjustments.push({ key, label, ml });

  add('activity', ACTIVITY_LABEL[input.activity], config.activityMl[input.activity]);
  add('climate', CLIMATE_LABEL[input.climate], config.climateMl[input.climate]);
  const days = Math.min(Math.max(input.exerciseDaysPerWeek ?? 0, 0), 7);
  add('exercise', `Exercise ${days}×/week`, Math.min(days * config.exerciseMlPerDay, config.exerciseMaxMl));
  if ((input.caffeineCupsPerDay ?? 0) > config.caffeineThresholdCups) add('caffeine', 'Caffeinated drinks', config.caffeineMl);

  const raw = baselineMl + adjustments.reduce((s, a) => s + a.ml, 0);
  const rounded = Math.round(raw / config.roundToMl) * config.roundToMl;
  const totalMl = clampGoal(rounded, config);
  return { baselineMl, adjustments, totalMl, clamped: totalMl !== rounded };
}

export const clampGoal = (ml: number, config: GoalConfig = GOAL_CONFIG) =>
  Math.min(config.maxMl, Math.max(config.minMl, ml));

/** Step used by the − / + goal editor. */
export const GOAL_STEP_ML = 100;
