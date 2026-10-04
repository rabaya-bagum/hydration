import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '@/design/a11y';
import { useTheme } from '@/design/theme';
import { motion, radius, spacing } from '@/design/tokens';
import { formatVolume } from '@/domain/units';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { getCharacter } from '@/content/characters';
import { Mascot } from './Mascot';
import { Text } from './Text';

const PIECES = 18;
const SHOW_MS = 2600;

function Drop({ index, reduce }: { index: number; reduce: boolean }) {
  const { colors } = useTheme();
  const y = useSharedValue(-40);
  useEffect(() => { if (!reduce) y.value = withDelay(index * 60, withTiming(900, { duration: 1800, easing: Easing.in(Easing.quad) })); }, [index, reduce, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const palette = [colors.primary, colors.mint, colors.sun, colors.coral, colors.lilac];
  if (reduce) return null;
  return <Animated.View style={[{ position: 'absolute', top: 0, left: `${(index * 53) % 100}%`, width: 10, height: 14, borderRadius: radius.pill, backgroundColor: palette[index % palette.length] }, style]} />;
}

/** Brief full-screen goal celebration. Tap to dismiss; auto-closes. Reduce Motion: static card only. */
export function Celebration() {
  const c = useUiStore((s) => s.celebrate);
  const end = useUiStore((s) => s.endCelebration);
  const unit = useSettingsStore((s) => s.unitSystem);
  const characterId = useSettingsStore((s) => s.characterId);
  const reduce = useReduceMotion();
  const { colors } = useTheme();
  useEffect(() => {
    if (!c) return;
    const t = setTimeout(end, SHOW_MS);
    return () => clearTimeout(t);
  }, [c, end]);
  if (!c) return null;
  return (
    <Animated.View key={c.id} entering={FadeIn.duration(motion.base)} exiting={FadeOut.duration(motion.base)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center' }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss celebration" onPress={end} style={StyleSheet.absoluteFill} />
      {Array.from({ length: PIECES }, (_, i) => <Drop key={i} index={i} reduce={reduce} />)}
      <View accessibilityLiveRegion="assertive" accessible accessibilityLabel={`Goal reached! ${formatVolume(c.goalMl, unit)} done for today.`} style={{ backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.xl }} pointerEvents="none">
        <Mascot characterId={characterId} mood="cheer" size={120} />
        <Text variant="h1" center>Goal reached!</Text>
        <Text muted center>{formatVolume(c.goalMl, unit)} done. {getCharacter(characterId).name} is doing a happy dance.</Text>
      </View>
    </Animated.View>
  );
}
