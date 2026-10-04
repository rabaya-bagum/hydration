import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { motion, radius, shadow, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { Text } from './Text';

interface Props { title: string; subtitle?: string; onPress: () => void; accessibilityLabel: string; accent?: boolean; testID?: string }

/** One-tap quick-add tile. Springy press feedback, 56pt tall. */
export function DrinkButton({ title, subtitle, onPress, accessibilityLabel, accent, testID }: Props) {
  const { colors } = useTheme();
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      <Pressable
        testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel}
        onPress={() => { s.value = withSequence(withTiming(0.92, { duration: 80 }), withTiming(1, { duration: motion.base })); onPress(); }}
        style={[styles.base, shadow.button, { backgroundColor: accent ? colors.primary : colors.surface, borderColor: accent ? colors.primary : colors.border }]}
      >
        <Text variant="title" bold color={accent ? colors.onPrimary : colors.primary}>{title}</Text>
        {subtitle ? <Text variant="caption" color={accent ? colors.onPrimary : colors.textMuted}>{subtitle}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: touch.large + 12, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm },
});
