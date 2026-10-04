import { View } from 'react-native';
import { Mascot } from '@/components/Mascot';
import { Text } from '@/components/Text';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { APP_NAME, TAGLINE } from '@/content/brand';

export function SplashView() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md }} accessible accessibilityLabel={`${APP_NAME}. ${TAGLINE}`}>
      <Mascot characterId="otto" mood="awake" size={120} />
      <Text variant="h1">{APP_NAME}</Text>
      <Text muted>{TAGLINE}</Text>
    </View>
  );
}
