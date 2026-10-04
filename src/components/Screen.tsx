import { ScrollView, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/design/tokens';
import { useTheme } from '@/design/theme';

interface Props { children: React.ReactNode; scroll?: boolean; contentStyle?: ViewStyle; bottomInset?: boolean }

/** Standard page frame: safe area, 16pt gutter, readable max width on tablets. */
export function Screen({ children, scroll = true, contentStyle, bottomInset = true }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pad: ViewStyle = { paddingTop: insets.top + spacing.sm, paddingBottom: bottomInset ? insets.bottom + spacing.xl : spacing.lg, paddingHorizontal: spacing.lg, gap: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' };
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: colors.bg }, pad, contentStyle]}>{children}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[pad, contentStyle]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
