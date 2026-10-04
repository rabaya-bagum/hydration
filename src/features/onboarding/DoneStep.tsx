import { View } from 'react-native';
import { Mascot } from '@/components/Mascot';
import { Text } from '@/components/Text';
import { getCharacter } from '@/content/characters';
import { spacing } from '@/design/tokens';
import { formatVolume } from '@/domain/units';
import { finalGoal, type Draft } from './draft';

export function DoneStep({ draft }: { draft: Draft }) {
  const c = getCharacter(draft.characterId);
  return (
    <View style={{ alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl }} accessible accessibilityLabel={`You're all set. Your goal is ${formatVolume(finalGoal(draft), draft.unitSystem)}.`}>
      <Mascot characterId={draft.characterId} mood="cheer" size={160} />
      <Text variant="h1" center>You're all set{draft.name ? `, ${draft.name}` : ''}!</Text>
      <Text muted center>Your goal is {formatVolume(finalGoal(draft), draft.unitSystem)}. {c.name} is ready — your first sip is one tap away.</Text>
    </View>
  );
}
