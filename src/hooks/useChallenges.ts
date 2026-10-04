import { useMemo } from 'react';
import { CHALLENGES } from '@/content/challenges';
import { evaluateChallenge, type ChallengeStatus } from '@/domain/challenges';
import { challengeState, type ChallengeState } from '@/components/ChallengeCard';
import { useLogsStore } from '@/store/logsStore';
import { useRewardsStore } from '@/store/rewardsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useHydration } from './useHydration';

export interface ChallengeView { id: string; state: ChallengeState; status?: ChallengeStatus; startedOn?: string }

export function useChallenges(): Record<string, ChallengeView> {
  const { summaries, today } = useHydration();
  const logs = useLogsStore((s) => s.logs);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const runs = useRewardsStore((s) => s.challenges);
  return useMemo(() => {
    const env = { logs: logs.filter((l) => !l.deletedAt), summaries, caffeinatedDrinkIds: new Set(drinkTypes.filter((d) => d.caffeinated).map((d) => d.id)) };
    return Object.fromEntries(CHALLENGES.map((def) => {
      const run = runs[def.id];
      const status = run ? evaluateChallenge(def, run.startedOn, today, env) : undefined;
      return [def.id, { id: def.id, status, startedOn: run?.startedOn, state: challengeState(run, status) } satisfies ChallengeView];
    }));
  }, [logs, summaries, drinkTypes, runs, today]);
}
