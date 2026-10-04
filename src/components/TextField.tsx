import { TextInput, View, type TextInputProps } from 'react-native';
import { fontSize, radius, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { Text } from './Text';

interface Props extends TextInputProps { label: string; error?: string }

export function TextField({ label, error, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="small" bold>{label}</Text>
      <TextInput
        accessibilityLabel={label} placeholderTextColor={colors.textMuted} maxFontSizeMultiplier={1.6}
        style={[{ minHeight: touch.large, borderRadius: radius.md, borderWidth: 1.5, borderColor: error ? colors.danger : colors.border, backgroundColor: colors.surface, color: colors.text, paddingHorizontal: spacing.lg, fontSize: fontSize.body }, style]}
        {...rest}
      />
      {error ? <Text variant="caption" color={colors.danger} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}
