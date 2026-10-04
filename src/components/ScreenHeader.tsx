import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/design/tokens';
import { IconButton } from './IconButton';
import { Text } from './Text';

interface Props { title: string; subtitle?: string; back?: boolean; right?: React.ReactNode }

export function ScreenHeader({ title, subtitle, back, right }: Props) {
  const router = useRouter();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      {back ? <IconButton glyph="←" label="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} /> : null}
      <View style={{ flex: 1 }}>
        <Text variant="h2" accessibilityRole="header">{title}</Text>
        {subtitle ? <Text variant="small" muted>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
