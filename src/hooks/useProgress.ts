import { useMemo } from 'react';
import { levelFromXp, type LevelInfo } from '@/domain/progression';
import { ledgerStreak } from '@/domain/rewards';
import type { UnlockState } from '@/domain/unlocks';
import { totalXp, useRewardsStore } from '@/store/rewardsStore';
import { useHydration } from './useHydration';

export interface Progress extends LevelInfo { unlock: UnlockState; longestStreak: number }

export function useProgress(): Progress {
  const ledger = useRewardsStore((s) => s.ledger);
  const { streak } = useHydration();
  return useMemo(() => {
    const info = levelFromXp(totalXp(ledger));
    const longestStreak = Math.max(streak.longest, ledgerStreak(ledger));
    return { ...info, longestStreak, unlock: { level: info.level, longestStreak } };
  }, [ledger, streak.longest]);
}
