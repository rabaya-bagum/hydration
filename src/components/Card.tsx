import { View, type ViewProps } from 'react-native';
import { radius, shadow, spacing } from '@/design/tokens';
import { useTheme } from '@/design/theme';

export function Card({ style, children, flat, ...rest }: ViewProps & { flat?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg }, !flat && shadow.card, style]} {...rest}>
      {children}
    </View>
  );
}
