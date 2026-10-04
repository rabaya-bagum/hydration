import { Pressable, View } from 'react-native';
import { radius } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import type { DayStrength } from '@/domain/streaks';
import { Text } from './Text';

interface Props { day: number; strength: DayStrength; today?: boolean; selected?: boolean; onPress: () => void; accessibilityLabel: string }

const alphaHex: Record<DayStrength, string> = { none: '00', started: '40', half: '80', almost: 'C0', complete: 'FF' };

/** Intensity + glyph (✓ complete, ◐ partial) so completion is never color-only. */
export function CalendarDay({ day, strength, today, selected, onPress, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const complete = strength === 'complete';
  const solid = strength === 'almost' || complete;
  return (
    <Pressable
      accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ selected: !!selected }} onPress={onPress}
      style={{ flex: 1, aspectRatio: 1, margin: 2, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', minHeight: 40, backgroundColor: strength === 'none' ? colors.surfaceAlt : `${colors.primary}${alphaHex[strength]}`, borderWidth: selected ? 3 : today ? 2 : 0, borderColor: colors.text }}
    >
      <Text variant="small" bold color={solid ? colors.onPrimary : colors.text}>{day}</Text>
      <Text variant="caption" color={solid ? colors.onPrimary : colors.textMuted}>{complete ? '✓' : strength === 'none' ? '·' : '◐'}</Text>
    </Pressable>
  );
}

export const CalendarSpacer = () => <View style={{ flex: 1, margin: 2 }} />;
