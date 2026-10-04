import { Pressable, StyleSheet } from 'react-native';
import { radius, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { haptics } from '@/services/haptics';
import { Text } from './Text';

interface Props { glyph: string; label: string; onPress: () => void; filled?: boolean; testID?: string }

/** `label` is required: icon-only controls must be named for screen readers. */
export function IconButton({ glyph, label, onPress, filled, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID} accessibilityRole="button" accessibilityLabel={label}
      hitSlop={4}
      onPress={() => { haptics.tap(); onPress(); }}
      style={({ pressed }) => [styles.base, { backgroundColor: filled ? colors.primarySoft : 'transparent', opacity: pressed ? 0.7 : 1 }]}
    >
      <Text variant="title">{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ base: { width: touch.min, height: touch.min, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' } });
