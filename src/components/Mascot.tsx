import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { getCharacter } from '@/content/characters';
import { useReduceMotion } from '@/design/a11y';

export type MascotMood = 'sleepy' | 'awake' | 'cheer';
interface Props { characterId: string; mood: MascotMood; size?: number; idle?: boolean; accessoryId?: string }

const INK = '#2B1B12';

function Face({ mood }: { mood: MascotMood }) {
  return (
    <G>
      {mood === 'sleepy' && (<><Path d="M31 47 q6 5 12 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" /><Path d="M57 47 q6 5 12 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" /></>)}
      {mood === 'awake' && (<><Circle cx={37} cy={46} r={4.5} fill={INK} /><Circle cx={63} cy={46} r={4.5} fill={INK} /><Circle cx={38.5} cy={44.5} r={1.5} fill="#fff" /><Circle cx={64.5} cy={44.5} r={1.5} fill="#fff" /></>)}
      {mood === 'cheer' && (<><Path d="M31 49 q6 -8 12 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" /><Path d="M57 49 q6 -8 12 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" /></>)}
      <Circle cx={30} cy={58} r={4} fill="#FF9A8B" opacity={0.7} /><Circle cx={70} cy={58} r={4} fill="#FF9A8B" opacity={0.7} />
      <Ellipse cx={50} cy={55} rx={5.5} ry={3.8} fill={INK} />
      <Path d={mood === 'cheer' ? 'M41 62 q9 11 18 0 z' : 'M43 63 q7 6 14 0'} stroke={INK} strokeWidth={2.5} strokeLinecap="round" fill={mood === 'cheer' ? '#E4553F' : 'none'} />
    </G>
  );
}

/** Original character renderer: otter / forest spirit / cloud share a face system, differ in silhouette. */
export function Mascot({ characterId, mood, size = 96, idle = true, accessoryId = 'none' }: Props) {
  const c = getCharacter(characterId);
  const reduce = useReduceMotion();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (idle && !reduce) bob.value = withRepeat(withSequence(withTiming(-4, { duration: 1100 }), withTiming(0, { duration: 1100 })), -1, false);
    else bob.value = 0;
  }, [idle, reduce, bob]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  return (
    <Animated.View style={style} accessible accessibilityRole="image" accessibilityLabel={`${c.name} the ${c.species.toLowerCase()} looks ${mood === 'sleepy' ? 'sleepy' : mood === 'awake' ? 'awake' : 'delighted'}`}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {c.id === 'otto' && (<><Circle cx={26} cy={30} r={9} fill={c.body} /><Circle cx={74} cy={30} r={9} fill={c.body} /></>)}
        {c.id === 'mossy' && (<><Path d="M50 20 q-2 -14 12 -14 q2 12 -12 14z" fill="#2E7D4F" /><Path d="M50 20 q-12 -2 -14 -12 q12 -2 14 12z" fill="#6CC48A" /></>)}
        {c.id === 'pixel' && (<><Path d="M50 22 V10" stroke={c.body} strokeWidth={4} strokeLinecap="round" /><Circle cx={50} cy={9} r={5} fill="#FF7A6B" /></>)}
        {c.id === 'koi' && (<><Path d="M50 20 q-14 -2 -18 10 q12 0 18 -4 q6 4 18 4 q-4 -12 -18 -10z" fill="#E4553F" /><Path d="M14 56 q-10 -10 -8 -22 q14 6 20 18z" fill="#E4553F" /></>)}
        {c.id === 'bubbles' ? (
          <G><Path d="M50 6 C50 6 14 46 14 64 a36 28 0 0 0 72 0 C86 46 50 6 50 6z" fill={c.body} /><Ellipse cx={34} cy={70} rx={6} ry={9} fill={c.accent} opacity={0.6} /></G>
        ) : c.id === 'pixel' ? (
          <G><Path d="M30 22 H70 a16 16 0 0 1 16 16 V68 a16 16 0 0 1 -16 16 H30 a16 16 0 0 1 -16 -16 V38 a16 16 0 0 1 16 -16z" fill={c.body} /><Path d="M26 34 H74 a8 8 0 0 1 8 8 V66 a8 8 0 0 1 -8 8 H26 a8 8 0 0 1 -8 -8 V42 a8 8 0 0 1 8 -8z" fill={c.accent} /></G>
        ) : c.id === 'nimbo' ? (
          <G fill={c.body}><Circle cx={30} cy={52} r={20} /><Circle cx={50} cy={40} r={24} /><Circle cx={72} cy={52} r={20} /><Ellipse cx={50} cy={60} rx={36} ry={20} /></G>
        ) : (
          <Ellipse cx={50} cy={52} rx={36} ry={32} fill={c.body} />
        )}
        {c.id === 'otto' && <Ellipse cx={50} cy={63} rx={21} ry={15} fill={c.accent} />}
        {c.id === 'koi' && <Ellipse cx={50} cy={66} rx={22} ry={13} fill={c.accent} />}
        {c.id === 'mossy' && <Ellipse cx={50} cy={64} rx={20} ry={13} fill={c.accent} />}
        <Face mood={mood} />
        {accessoryId === 'bow' && (<G fill="#E4553F"><Path d="M50 84 L30 74 V94z" /><Path d="M50 84 L70 74 V94z" /><Circle cx={50} cy={84} r={5} fill="#B83A28" /></G>)}
        {accessoryId === 'crown' && <Path d="M30 22 L36 6 L44 18 L50 2 L56 18 L64 6 L70 22z" fill="#FFC857" stroke="#E39B16" strokeWidth={2} strokeLinejoin="round" />}
        {mood === 'cheer' && (<G fill="#FFC857"><Path d="M12 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" /><Path d="M86 14 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" /></G>)}
        {mood === 'sleepy' && <Path d="M72 22 h10 l-10 10 h10" stroke="#6F5BEA" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
    </Animated.View>
  );
}

export const moodForProgress = (ratio: number): MascotMood => (ratio >= 0.75 ? 'cheer' : ratio >= 0.25 ? 'awake' : 'sleepy');
