import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { ChallengeCard } from '@/components/ChallengeCard';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { CHALLENGES } from '@/content/challenges';
import { spacing } from '@/design/tokens';
import { useChallenges } from '@/hooks/useChallenges';

/** Small challenge card on Today: the first active challenge, or a gentle prompt to pick one. */
export function ChallengeTeaser() {
  const router = useRouter();
  const views = useChallenges();
  const def = CHALLENGES.find((c) => views[c.id]!.state === 'active');
  if (!def) {
    return (
      <Card flat style={{ gap: spacing.sm }}>
        <Text bold>Pick a challenge to start building momentum.</Text>
        <Button label="See challenges" kind="secondary" onPress={() => router.push('/challenges')} />
      </Card>
    );
  }
  return <ChallengeCard compact def={def} state="active" status={views[def.id]!.status} color="#1B6AD6" onPress={() => router.push({ pathname: '/challenge/[id]', params: { id: def.id } })} />;
}
