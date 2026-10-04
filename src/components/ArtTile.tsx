import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { radius } from '@/design/tokens';
import { Text } from './Text';

interface Props { glyph: string; color: string; size?: number }

/** Original card artwork: soft color field with drops and a glyph. No third-party art. */
export function ArtTile({ glyph, color, size = 72 }: Props) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: `${color}26`, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Svg width={size} height={size} viewBox="0 0 72 72" style={{ position: 'absolute' }}>
        <Circle cx={60} cy={12} r={14} fill={color} opacity={0.18} />
        <Circle cx={10} cy={62} r={18} fill={color} opacity={0.14} />
        <Path d="M54 50 q4 -8 8 0 a4.5 4.5 0 1 1 -8 0z" fill={color} opacity={0.35} />
      </Svg>
      <Text style={{ fontSize: size * 0.46 }}>{glyph}</Text>
    </View>
  );
}
