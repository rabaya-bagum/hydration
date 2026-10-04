import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { radius, shadow, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { haptics } from '@/services/haptics';
import { Text } from './Text';

type Kind = 'primary' | 'secondary' | 'ghost' | 'danger';
interface Props {
  label: string; onPress: () => void; kind?: Kind; disabled?: boolean; loading?: boolean; icon?: string;
  accessibilityHint?: string; style?: ViewStyle; testID?: string;
}

export function Button({ label, onPress, kind = 'primary', disabled, loading, icon, accessibilityHint, style, testID }: Props) {
  const { colors } = useTheme();
  const bg = { primary: colors.primary, secondary: colors.primarySoft, ghost: 'transparent', danger: colors.danger }[kind];
  const fg = { primary: colors.onPrimary, secondary: colors.primary, ghost: colors.primary, danger: '#FFFFFF' }[kind];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={() => { haptics.tap(); onPress(); }}
      style={({ pressed }) => [
        styles.base, { backgroundColor: bg, opacity: disabled ? 0.45 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        kind === 'primary' && shadow.button, style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <View style={styles.row}>
          {icon ? <Text color={fg} variant="title">{icon}</Text> : null}
          <Text color={fg} bold variant="body">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: touch.large, borderRadius: radius.pill, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
