export type UnlockRule =
  | { kind: 'starter' }
  | { kind: 'level'; level: number }
  | { kind: 'streak'; days: number };

export interface UnlockState { level: number; longestStreak: number }

export const isUnlocked = (rule: UnlockRule, s: UnlockState): boolean =>
  rule.kind === 'starter' || (rule.kind === 'level' ? s.level >= rule.level : s.longestStreak >= rule.days);

export const describeUnlock = (rule: UnlockRule): string =>
  rule.kind === 'starter' ? 'Starter companion' : rule.kind === 'level' ? `Reach level ${rule.level}` : `Reach a ${rule.days}-day streak`;
