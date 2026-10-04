import { useEffect } from 'react';
import { newlyUnlocked } from '@/content/unlockables';
import { getAchievement } from '@/domain/achievements';
import { evaluateChallenge } from '@/domain/challenges';
import { CHALLENGES, getChallenge } from '@/content/challenges';
import { levelFromXp } from '@/domain/progression';
import { computeAwards, ledgerStreak, type Award } from '@/domain/rewards';
import { analytics } from '@/services/analytics';
import { haptics } from '@/services/haptics';
import { totalXp, useRewardsStore } from '@/store/rewardsStore';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { useHydration } from './useHydration';

const BATCH_SUMMARY_THRESHOLD = 3;
/** Wait for the log toast (with its Undo button) to finish before showing a reward toast. */
const AFTER_LOG_TOAST_MS = 4300;
const later = (fn: () => void) => { setTimeout(fn, AFTER_LOG_TOAST_MS); };

function announce(fresh: Award[], beforeXp: number, afterXp: number, beforeStreak: number, afterStreak: number) {
  const ui = useUiStore.getState();
  const gained = fresh.reduce((s, a) => s + a.xp, 0);
  const before = levelFromXp(beforeXp).level;
  const after = levelFromXp(afterXp).level;
  const unlocked = newlyUnlocked({ level: before, longestStreak: beforeStreak }, { level: after, longestStreak: afterStreak });
  const unlockText = unlocked.length ? ` Unlocked: ${unlocked.map((u) => u.name).join(', ')}.` : '';
  const notable = fresh.find((a) => a.kind === 'achievement' || a.kind === 'challenge');
  const streakAward = fresh.find((a) => a.id.startsWith('ach:streak-'));

  let content: { title: string; body: string; glyph?: string } | undefined;
  if (after > before) content = { title: `Level ${after}!`, body: `+${gained} XP.${unlockText}`, glyph: '⭐' };
  else if (streakAward) content = { title: streakAward.title, body: `Streak secured. +${gained} XP.${unlockText}`, glyph: getAchievement(streakAward.id.slice(4))?.glyph };
  else if (notable?.kind === 'challenge') content = { title: 'Challenge complete!', body: `${notable.title}. +${notable.xp} XP.${unlockText}`, glyph: '🚩' };
  else if (fresh.length > BATCH_SUMMARY_THRESHOLD) content = { title: 'Rewards unlocked', body: `${fresh.length} rewards, +${gained} XP in total.${unlockText}`, glyph: '🎁' };

  if (streakAward) analytics.track('streak_milestone', { days: Number(streakAward.id.slice('ach:streak-'.length)) });
  if (content) {
    if (ui.celebrate) later(() => useUiStore.getState().showToast(`${content.glyph ?? ''} ${content.title} ${content.body}`.trim()));
    else { haptics.success(); ui.triggerCelebration(content); }
  } else if (notable) later(() => useUiStore.getState().showToast(`${getAchievement(notable.id.slice(4))?.glyph ?? '🏅'} ${notable.title} · +${notable.xp} XP`));
}

/** Keeps challenge completions, XP awards, level-ups and unlocks in sync with logs. Idempotent. */
export function useRewardSync() {
  const { summaries, today, streak } = useHydration();
  const logs = useLogsStore((s) => s.logs);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const challenges = useRewardsStore((s) => s.challenges);
  const readArticles = useRewardsStore((s) => s.readArticles);

  useEffect(() => {
    const store = useRewardsStore.getState();
    const live = logs.filter((l) => !l.deletedAt);
    const env = { logs: live, summaries, caffeinatedDrinkIds: new Set(drinkTypes.filter((d) => d.caffeinated).map((d) => d.id)) };

    for (const def of CHALLENGES) {
      const run = challenges[def.id];
      if (run && !run.completedOn && evaluateChallenge(def, run.startedOn, today, env).done) {
        store.completeChallenge(def.id, today);
        analytics.track('challenge_completed', { id: def.id });
      }
    }
    const runs = useRewardsStore.getState().challenges;
    const completedChallenges = Object.entries(runs).filter(([, r]) => r.completedOn).flatMap(([id]) => {
      const d = getChallenge(id);
      return d ? [{ id, title: d.title, xp: d.rewardXp }] : [];
    });
    const awards = computeAwards({ summaries, logs: live, longestStreak: streak.longest, articlesRead: readArticles.length, challengesCompleted: completedChallenges.length, completedChallenges, readArticleIds: readArticles });

    const ledgerBefore = useRewardsStore.getState().ledger;
    const beforeXp = totalXp(ledgerBefore);
    const fresh = store.applyAwards(awards);
    if (!fresh.length) return;
    const ledgerAfter = useRewardsStore.getState().ledger;
    announce(fresh, beforeXp, totalXp(ledgerAfter), ledgerStreak(ledgerBefore), Math.max(0, ledgerStreak(ledgerAfter)));
  }, [logs, summaries, today, streak.longest, drinkTypes, challenges, readArticles]);
}
