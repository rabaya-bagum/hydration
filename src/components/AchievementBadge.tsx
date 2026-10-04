import { View } from 'react-native';
import { radius, spacing } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import type { Achievement } from '@/domain/achievements';
import { Text } from './Text';

/** Locked state is shown with a 🔒 glyph and text, not just a faded color. */
export function AchievementBadge({ a, earned }: { a: Achievement; earned: boolean }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={`${a.title}. ${a.description} ${earned ? 'Earned.' : 'Locked.'} ${a.xp} XP.`}
      style={{ width: '47.5%', backgroundColor: earned ? colors.primarySoft : colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.xs, alignItems: 'center', borderWidth: 1.5, borderColor: earned ? colors.primary : colors.border }}>
      <Text variant="h1" style={{ opacity: earned ? 1 : 0.35 }}>{a.glyph}</Text>
      <Text bold center variant="small">{a.title}</Text>
      <Text variant="caption" muted center>{a.description}</Text>
      <Text variant="caption" bold color={earned ? colors.success : colors.textMuted}>{earned ? `✓ Earned · +${a.xp} XP` : `🔒 ${a.xp} XP`}</Text>
    </View>
  );
}
