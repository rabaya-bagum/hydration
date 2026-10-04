export type UnitSystem = 'metric' | 'imperial';
export type ActivityLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type Climate = 'cool' | 'mild' | 'warm' | 'hot';
export type AgeRange = '18-24' | '25-34' | '35-44' | '45-54' | '55+' | 'unspecified';
export type LogSource = 'manual' | 'quick_add' | 'reminder' | 'widget' | 'health';

export interface DrinkType {
  id: string;
  name: string;
  icon: string; // emoji glyph; swap for SVG set later
  /** Share of volume that counts when hydration weighting is on. Rough estimate, not medical fact. */
  hydrationFactor: number;
  caffeinated: boolean;
  custom?: boolean;
}

export interface Container {
  id: string;
  name: string;
  volumeMl: number;
  favorite: boolean;
}

export interface DrinkLog {
  id: string; // client-generated UUID (idempotent sync)
  drinkTypeId: string;
  volumeMl: number;
  hydrationMl: number;
  containerId?: string;
  loggedAt: string; // ISO UTC instant
  tz: string; // IANA zone at log time; fixes the day the entry belongs to
  source: LogSource;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface GoalInput {
  weightKg?: number;
  activity: ActivityLevel;
  climate: Climate;
  exerciseDaysPerWeek?: number;
  caffeineCupsPerDay?: number;
}

export interface GoalAdjustment {
  key: string;
  label: string;
  ml: number;
}

export interface GoalResult {
  baselineMl: number;
  adjustments: GoalAdjustment[];
  totalMl: number;
  clamped: boolean;
}

export interface DailySummary {
  day: string; // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  entryCount: number;
  goalReachedAt?: string; // ISO instant when cumulative first reached goal
  byDrink: Record<string, number>;
}
