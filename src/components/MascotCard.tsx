import { Pressable, View } from 'react-native';
import { radius, spacing } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import type { Character } from '@/content/characters';
import { describeUnlock } from '@/domain/unlocks';
import { Mascot } from './Mascot';
import { Text } from './Text';

interface Props { c: Character; unlocked: boolean; selected: boolean; onSelect: () => void }

export function MascotCard({ c, unlocked, selected, onSelect }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable testID={`character-${c.id}`} accessibilityRole="radio" accessibilityState={{ selected, disabled: !unlocked }}
      accessibilityLabel={`${c.name}, ${c.species}. ${c.personality}. ${unlocked ? (selected ? 'Selected.' : 'Tap to choose.') : `Locked. ${describeUnlock(c.unlock)}.`}`}
      onPress={() => unlocked && onSelect()}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primarySoft : colors.surface }}>
      <View style={{ opacity: unlocked ? 1 : 0.35 }}><Mascot characterId={c.id} mood={selected ? 'cheer' : 'awake'} size={72} idle={selected} /></View>
      <View style={{ flex: 1 }}>
        <Text bold>{c.name}{c.rare ? ' ✨ Rare' : ''}{selected ? ' ✓' : ''}</Text>
        <Text variant="small" muted>{c.species} · {c.personality}</Text>
        <Text variant="small" muted>{c.description}</Text>
        {!unlocked ? <Text variant="small" bold color={colors.textMuted}>🔒 {describeUnlock(c.unlock)}</Text> : null}
      </View>
    </Pressable>
  );
}
