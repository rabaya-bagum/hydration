import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ArtTile } from '@/components/ArtTile';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { STATE_LABEL } from '@/components/ChallengeCard';
import { Text } from '@/components/Text';
import { CATEGORY_LABEL, getChallenge } from '@/content/challenges';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { addDays, formatDayLabel } from '@/domain/dates';
import { useChallenges } from '@/hooks/useChallenges';
import { useHydration } from '@/hooks/useHydration';
import { analytics } from '@/services/analytics';
import { useRewardsStore } from '@/store/rewardsStore';

export default function ChallengeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const def = getChallenge(String(id));
  const view = useChallenges()[String(id)];
  const { today } = useHydration();
  const { colors } = useTheme();
  const store = useRewardsStore();
  if (!def || !view) return <Screen><ScreenHeader back title="Challenge" /><EmptyState title="Challenge not found" /></Screen>;

  const start = () => { store.startChallenge(def.id, today); analytics.track('challenge_started', { id: def.id }); };
  const progress = view.state === 'done' ? def.targetDays : view.status?.progress ?? 0;
  const days = view.startedOn ? Array.from({ length: def.windowDays }, (_, i) => addDays(view.startedOn!, i)) : [];
  const qual = new Set(view.status?.qualifying ?? []);

  return (
    <Screen>
      <ScreenHeader back title={def.title} subtitle={CATEGORY_LABEL[def.category]} />
      <Card style={{ gap: spacing.md, alignItems: 'center' }}>
        <ArtTile glyph={def.glyph} color={colors.primary} size={96} />
        <Text center>{def.description}</Text>
        <ProgressRing value={progress / def.targetDays} size={96} stroke={10} center={`${progress}/${def.targetDays}`} label={`${progress} of ${def.targetDays} days completed`} />
        <Text bold accessibilityLiveRegion="polite">{STATE_LABEL[view.state]}</Text>
        <Text variant="small" muted center>
          {def.windowDays}-day window · reward +{def.rewardXp} XP
          {view.state === 'active' && view.status ? ` · ${view.status.daysLeft} day${view.status.daysLeft === 1 ? '' : 's'} left` : ''}
        </Text>
      </Card>

      {days.length ? (
        <Card style={{ gap: spacing.sm }}>
          <Text variant="title" accessibilityRole="header">Your days</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {days.map((d) => {
              const ok = qual.has(d);
              const future = d > today;
              return (
                <View key={d} accessible accessibilityLabel={`${formatDayLabel(d)}: ${ok ? 'done' : future ? 'upcoming' : 'not yet'}`}
                  style={{ width: 52, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.md, backgroundColor: ok ? colors.primary : colors.surfaceAlt, opacity: future ? 0.5 : 1 }}>
                  <Text variant="caption" color={ok ? colors.onPrimary : colors.textMuted}>{formatDayLabel(d)}</Text>
                  <Text bold color={ok ? colors.onPrimary : colors.textMuted}>{ok ? '✓' : future ? '·' : '○'}</Text>
                </View>
              );
            })}
          </View>
        </Card>
      ) : null}

      {view.state === 'new' ? <Button label="Start challenge" onPress={start} testID="start-challenge" /> : null}
      {view.state === 'ended' ? <><Text muted center>This round has finished. A fresh start is one tap away.</Text><Button label="Start again" onPress={start} testID="restart-challenge" /></> : null}
      {view.state === 'active' ? <Button label="Stop challenge" kind="ghost" onPress={() => store.abandonChallenge(def.id)} /> : null}
      {view.state === 'done' ? <Text center bold color={colors.success}>Challenge complete! +{def.rewardXp} XP earned.</Text> : null}
    </Screen>
  );
}
