import { formatVolume } from './units';
import type { UnitSystem } from './types';

/** Short, warm, never guilt-based. Picks by progress band; `seed` makes variation deterministic. */
export function contextMessage(totalMl: number, goalMl: number, system: UnitSystem): string {
  const left = Math.max(goalMl - totalMl, 0);
  if (totalMl <= 0) return 'Your first sip sets the tone.';
  if (left === 0) return totalMl >= goalMl * 1.5 ? "Goal done — you're all set for today." : 'Goal reached! Nicely done.';
  const pct = totalMl / goalMl;
  if (pct >= 0.75) return `Almost there — ${formatVolume(left, system)} to go.`;
  if (pct >= 0.5) return `Past halfway. ${formatVolume(left, system)} to go.`;
  return `${formatVolume(left, system)} left today.`;
}

/** Toast shown after a log; milestone crossings win over generic text. */
export function encouragement(beforeMl: number, afterMl: number, goalMl: number, system: UnitSystem): string {
  const b = beforeMl / goalMl;
  const a = afterMl / goalMl;
  if (b < 1 && a >= 1) return 'Goal reached!';
  if (b < 0.75 && a >= 0.75) return 'Three quarters in. One more glass gets you there.';
  if (b < 0.5 && a >= 0.5) return 'Halfway there.';
  if (b < 0.25 && a >= 0.25) return 'Otto just woke up. Nice start!';
  if (a >= 1) return 'Logged.';
  return `Nice! ${formatVolume(goalMl - afterMl, system)} left.`;
}

export const REMINDER_MESSAGES = [
  'Quick hydration check.',
  'Your bottle misses you.',
  'A small sip still counts.',
  'Time for a little refill?',
  'Otto is thirsty on your behalf.',
] as const;

export function reminderMessage(index: number, remainingMl: number, goalMl: number, system: UnitSystem): string {
  if (remainingMl > 0 && remainingMl <= goalMl * 0.3) return `${formatVolume(remainingMl, system)} finishes your day.`;
  return REMINDER_MESSAGES[index % REMINDER_MESSAGES.length]!;
}
