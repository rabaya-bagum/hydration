import { Pressable, View } from 'react-native';
import { Mascot } from '@/components/Mascot';
import { Text } from '@/components/Text';
import { CHARACTERS } from '@/content/characters';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { StepFrame } from './StepFrame';

interface Props { value: string; onChange: (id: string) => void }

export function CharacterPicker({ value, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={{ gap: spacing.md }}>
      {CHARACTERS.filter((c) => c.starter).map((c) => {
        const sel = c.id === value;
        return (
          <Pressable key={c.id} testID={`character-${c.id}`} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`${c.name}, ${c.species}. ${c.personality}. ${c.description}`} onPress={() => onChange(c.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.surface }}>
            <Mascot characterId={c.id} mood={sel ? 'cheer' : 'awake'} size={72} idle={sel} />
            <View style={{ flex: 1 }}>
              <Text bold>{c.name} {sel ? '✓' : ''}</Text>
              <Text variant="small" muted>{c.species} · {c.personality}</Text>
              <Text variant="small" muted>{c.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CharacterStep({ value, onChange }: Props) {
  return <StepFrame title="Meet your companion" subtitle="They'll cheer you on. You'll unlock more as you build streaks."><CharacterPicker value={value} onChange={onChange} /></StepFrame>;
}
