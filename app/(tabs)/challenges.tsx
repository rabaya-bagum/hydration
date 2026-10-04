import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { ChallengeCard } from '@/components/ChallengeCard';
import { EmptyState } from '@/components/EmptyState';
import { LevelCard } from '@/components/LevelCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { CHALLENGES } from '@/content/challenges';
import { spacing } from '@/design/tokens';
import { useChallenges } from '@/hooks/useChallenges';
import { useProgress } from '@/hooks/useProgress';
import { useTheme } from '@/design/theme';

const CATEGORY_COLOR = { consistency: '#1B6AD6', caffeine: '#9A6236', morning: '#E39B16', evening: '#3B4BA8', infused: '#4FA36B', bottle: '#17907A' } as const;

export default function ChallengesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const progress = useProgress();
  const views = useChallenges();
  const open = (id: string) => router.push({ pathname: '/challenge/[id]', params: { id } });
  const group = (states: string[]) => CHALLENGES.filter((c) => states.includes(views[c.id]!.state));
  const active = group(['active']);
  const available = group(['new', 'ended']);
  const done = group(['done']);
  const card = (id: string) => {
    const def = CHALLENGES.find((c) => c.id === id)!;
    return <ChallengeCard key={id} def={def} state={views[id]!.state} status={views[id]!.status} color={CATEGORY_COLOR[def.category]} onPress={() => open(id)} />;
  };
  return (
    <Screen>
      <ScreenHeader title="Challenges" subtitle="Small habits, real momentum." />
      <LevelCard p={progress} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button label="Badges" kind="secondary" onPress={() => router.push('/achievements')} style={{ flex: 1 }} testID="open-achievements" />
        <Button label="Companions" kind="secondary" onPress={() => router.push('/characters')} style={{ flex: 1 }} testID="open-characters" />
      </View>
      <View style={{ gap: spacing.md }}>
        <Text variant="title" accessibilityRole="header">Active</Text>
        {active.length ? active.map((c) => card(c.id)) : <Card flat><EmptyState glyph="🚩" title="Pick a challenge to start building momentum." body="Choose one below. Missing a day is fine, you can always begin again." /></Card>}
      </View>
      {available.length ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="title" accessibilityRole="header">Available</Text>
          {available.map((c) => card(c.id))}
        </View>
      ) : null}
      {done.length ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="title" accessibilityRole="header" color={colors.success}>Completed</Text>
          {done.map((c) => card(c.id))}
        </View>
      ) : null}
    </Screen>
  );
}
