import Svg, { Circle } from 'react-native-svg';
import { View } from 'react-native';
import { useTheme } from '@/design/theme';
import { Text } from './Text';

interface Props { value: number; size?: number; stroke?: number; label: string; center?: string }

export function ProgressRing({ value, size = 72, stroke = 8, label, center }: Props) {
  const { colors } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(v * 100) }} style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.primary} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${c * v} ${c}`} />
      </Svg>
      <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="small" bold>{center ?? `${Math.round(v * 100)}%`}</Text>
      </View>
    </View>
  );
}
