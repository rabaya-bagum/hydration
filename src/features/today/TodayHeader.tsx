import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/Text';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { greetingFor } from '@/domain/dates';
import { IconButton } from '@/components/IconButton';

interface Props { name: string; hour: number; streak: number }

export function TodayHeader({ name, hour, streak }: Props) {
  const router = useRouter();
  const { colors } = useTheme();
  const greeting = `${greetingFor(hour)}${name ? `, ${name}` : ''}`;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text variant="h2" accessibilityRole="header">{greeting}</Text>
        <View
          accessible accessibilityLabel={streak > 0 ? `${streak} day streak` : 'No streak yet. Reach your goal today to start one.'}
          style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: spacing.xs, alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, minHeight: 28 }}
        >
          <Text variant="small" bold color={colors.primary}>{streak > 0 ? `🔥 ${streak} day streak` : '🌱 Start a streak today'}</Text>
        </View>
      </View>
      <IconButton glyph="⚙️" label="Settings and profile" onPress={() => router.push('/profile')} filled testID="open-profile" />
    </View>
  );
}
