import { View } from 'react-native';
import { AchievementBadge } from '@/components/AchievementBadge';
import { Card } from '@/components/Card';
import { LevelCard } from '@/components/LevelCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { ACHIEVEMENTS } from '@/domain/achievements';
import { STREAK_MILESTONES } from '@/domain/streaks';
import { useHydration } from '@/hooks/useHydration';
import { useProgress } from '@/hooks/useProgress';
import { useRewardsStore } from '@/store/rewardsStore';

export default function AchievementsScreen() {
  const ledger = useRewardsStore((s) => s.ledger);
  const progress = useProgress();
  const { streak } = useHydration();
  const next = STREAK_MILESTONES.find((m) => m > streak.current);
  const earnedCount = ACHIEVEMENTS.filter((a) => ledger[`ach:${a.id}`]).length;
  return (
    <Screen>
      <ScreenHeader back title="Badges" subtitle={`${earnedCount} of ${ACHIEVEMENTS.length} earned`} />
      <LevelCard p={progress} />
      <Card style={{ gap: spacing.xs }} accessible accessibilityLabel={`Current streak ${streak.current} days. Longest ${streak.longest}.${next ? ` Next milestone ${next} days.` : ''}`}>
        <Text variant="title">🔥 Streak</Text>
        <Text>Current {streak.current} · Longest {streak.longest}</Text>
        <Text variant="small" muted>{next ? `Next milestone: ${next} days.` : 'You have passed every milestone!'} A missed day just starts a fresh run.</Text>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' }}>
        {ACHIEVEMENTS.map((a) => <AchievementBadge key={a.id} a={a} earned={!!ledger[`ach:${a.id}`]} />)}
      </View>
    </Screen>
  );
}
