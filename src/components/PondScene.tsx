import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useReduceMotion } from '@/design/a11y';
import { useTheme } from '@/design/theme';
import { motion, radius } from '@/design/tokens';
import { Mascot, moodForProgress } from './Mascot';

const H = 210;
const MAX_WATER = 150; // px of water at 100%
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

function Fade({ show, children }: { show: boolean; children: React.ReactNode }) {
  const reduce = useReduceMotion();
  const o = useSharedValue(show ? 1 : 0);
  useEffect(() => { o.value = reduce ? (show ? 1 : 0) : withTiming(show ? 1 : 0, { duration: motion.slow }); }, [show, reduce, o]);
  const props = useAnimatedProps(() => ({ opacity: o.value }));
  return <AnimatedG animatedProps={props}>{children}</AnimatedG>;
}

interface Props { ratio: number; characterId: string; width: number }

/**
 * The living pond: water rises with intake and scenery appears at 25/50/75/100%.
 * Purely decorative (hidden from a11y tree): the numeric progress is announced by HydrationHero.
 */
export function PondScene({ ratio, characterId, width }: Props) {
  const { colors } = useTheme();
  const reduce = useReduceMotion();
  const level = useSharedValue(0);
  const phase = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, ratio));

  useEffect(() => { level.value = reduce ? clamped : withTiming(clamped, { duration: motion.fill, easing: Easing.out(Easing.cubic) }); }, [clamped, reduce, level]);
  useEffect(() => {
    if (reduce) { phase.value = 0; return; }
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 3200, easing: Easing.linear }), -1, false);
  }, [reduce, phase]);

  const waveProps = useAnimatedProps(() => {
    const top = H - 28 - level.value * MAX_WATER;
    let d = `M0 ${top}`;
    for (let x = 0; x <= width; x += 10) d += ` L${x} ${top + Math.sin((x / width) * Math.PI * 3 + phase.value) * 4}`;
    return { d: `${d} L${width} ${H} L0 ${H} Z` };
  });
  const mascotStyle = useAnimatedStyle(() => ({ transform: [{ translateY: H - 28 - level.value * MAX_WATER - 78 }] }));

  const [lilyX] = useState(() => [0.2, 0.78]);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: H, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.skyBottom }}>
      <Svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.skyTop} /><Stop offset="1" stopColor={colors.skyBottom} /></LinearGradient>
          <LinearGradient id="water" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={colors.waterTop} stopOpacity={0.95} /><Stop offset="1" stopColor={colors.waterBottom} /></LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={H} fill="url(#sky)" />
        <Fade show={clamped >= 0.5}><Circle cx={width - 46} cy={42} r={22} fill={colors.sun} opacity={0.9} /></Fade>
        <Fade show={clamped >= 0.5}>
          <G><Path d={`M${width * 0.08} ${H - 28} q6 -26 12 0`} stroke="#3E9C6B" strokeWidth={3} fill="none" /><Circle cx={width * 0.08 + 6} cy={H - 56} r={6} fill={colors.coral} /></G>
        </Fade>
        <AnimatedPath animatedProps={waveProps} fill="url(#water)" />
        <Fade show={clamped >= 0.25}>
          {lilyX.map((p, i) => <Ellipse key={i} cx={width * p} cy={H - 28 - clamped * MAX_WATER + 8 + i * 14} rx={16} ry={5} fill="#3E9C6B" />)}
        </Fade>
        <Fade show={clamped >= 0.75}>
          <G><Ellipse cx={width * 0.3} cy={H - 40} rx={9} ry={5} fill={colors.sun} /><Path d={`M${width * 0.3 + 8} ${H - 40} l8 -5 v10 z`} fill={colors.sun} /></G>
        </Fade>
        <Fade show={clamped >= 1}>
          <G fill={colors.sun}><Circle cx={width * 0.15} cy={30} r={3} /><Circle cx={width * 0.5} cy={20} r={2.5} /><Circle cx={width * 0.85} cy={70} r={3} /></G>
        </Fade>
      </Svg>
      <Animated.View style={[{ position: 'absolute', left: width / 2 - 48 }, mascotStyle]}>
        <Mascot characterId={characterId} mood={moodForProgress(clamped)} size={96} />
      </Animated.View>
    </View>
  );
}
