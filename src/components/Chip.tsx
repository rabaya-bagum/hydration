import { Pressable, StyleSheet } from 'react-native';
import { radius, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { haptics } from '@/services/haptics';
import { Text } from './Text';

interface Props { label: string; glyph?: string; selected?: boolean; onPress: () => void; accessibilityLabel?: string; testID?: string }

/** Selection chip (BeverageChip / ContainerChip / option pickers). Selected state also shows a check. */
export function Chip({ label, glyph, selected, onPress, accessibilityLabel, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID} accessibilityRole="radio" accessibilityState={{ selected: !!selected }} accessibilityLabel={accessibilityLabel ?? label}
      onPress={() => { haptics.tap(); onPress(); }}
      style={[styles.base, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border }]}
    >
      {glyph ? <Text variant="body">{glyph}</Text> : null}
      <Text variant="small" bold color={selected ? colors.onPrimary : colors.text}>{selected ? '✓ ' : ''}{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: touch.min, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
