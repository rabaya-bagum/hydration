import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion, radius } from '@/design/tokens';
import { useReduceMotion } from '@/design/a11y';
import { useTheme } from '@/design/theme';

interface Props { value: number; label: string; height?: number; color?: string }

/** value 0..1. Announced as text; never conveys state by color alone. */
export function ProgressBar({ value, label, height = 10, color }: Props) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const w = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, value));
  useEffect(() => { w.value = reduce ? clamped : withTiming(clamped, { duration: motion.slow }); }, [clamped, reduce, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View
      accessible accessibilityRole="progressbar" accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height, borderRadius: radius.pill, backgroundColor: color ?? colors.primary }, style]} />
    </View>
  );
}
