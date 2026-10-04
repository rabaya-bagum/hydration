import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { radius } from '@/design/tokens';
import { useReduceMotion } from '@/design/a11y';
import { useTheme } from '@/design/theme';

export function Skeleton({ height = 20, width = '100%', r = radius.sm }: { height?: number; width?: number | `${number}%`; r?: number }) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const o = useSharedValue(0.5);
  useEffect(() => { if (!reduce) o.value = withRepeat(withTiming(1, { duration: 900 }), -1, true); }, [reduce, o]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View accessibilityLabel="Loading" style={[{ height, width, borderRadius: r, backgroundColor: colors.surfaceAlt }, style]} />;
}
