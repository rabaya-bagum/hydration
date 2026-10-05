import { formatVolume } from './units';
import type { UnitSystem } from './types';

export type ShareKind = 'daily' | 'streak' | 'challenge' | 'month';

export interface ShareInput {
  kind: ShareKind;
  unit: UnitSystem;
  name?: string; // only used when includeName
  includeName: boolean;
  includeAmounts: boolean;
  // kind-specific
  percent?: number;
  totalMl?: number;
  goalMl?: number;
  streakDays?: number;
  challengeTitle?: string;
  monthLabel?: string;
  goalDays?: number;
  trackedDays?: number;
  avgMl?: number;
}

export interface ShareContent {
  glyph: string;
  headline: string;
  stat: string;
  statLabel: string;
  detail?: string;
  from?: string;
}

/**
 * Pure content builder for share images. Privacy by default: no name and no volumes unless the user
 * switches them on for this card; nothing else (weight, goal settings, times) is ever included.
 */
export function buildShareContent(i: ShareInput): ShareContent {
  const from = i.includeName && i.name?.trim() ? i.name.trim() : undefined;
  const amount = (ml?: number) => (i.includeAmounts && ml !== undefined ? formatVolume(ml, i.unit) : undefined);
  switch (i.kind) {
    case 'daily':
      return { glyph: '🎯', headline: 'Daily goal reached!', stat: `${Math.min(i.percent ?? 100, 999)}%`, statLabel: 'of my goal', detail: amount(i.totalMl) && `${amount(i.totalMl)} today`, from };
    case 'streak':
      return { glyph: '🔥', headline: `${i.streakDays}-day streak!`, stat: `${i.streakDays}`, statLabel: i.streakDays === 1 ? 'day in a row' : 'days in a row', from };
    case 'challenge':
      return { glyph: '🚩', headline: 'Challenge complete!', stat: i.challengeTitle ?? 'Challenge', statLabel: 'finished', from };
    case 'month':
      return { glyph: '📅', headline: `${i.monthLabel} summary`, stat: `${i.goalDays}/${i.trackedDays}`, statLabel: 'goal days', detail: amount(i.avgMl) && `${amount(i.avgMl)} average per day`, from };
  }
}
