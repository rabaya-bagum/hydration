import { Text as RNText, type TextProps } from 'react-native';
import { fontSize, fontWeight } from '@/design/tokens';
import { useTheme } from '@/design/theme';

type Variant = 'display' | 'h1' | 'h2' | 'title' | 'body' | 'small' | 'caption';
const weightFor: Record<Variant, keyof typeof fontWeight> = { display: 'heavy', h1: 'heavy', h2: 'bold', title: 'bold', body: 'regular', small: 'medium', caption: 'medium' };
const sizeFor: Record<Variant, number> = { display: fontSize.display, h1: fontSize.h1, h2: fontSize.h2, title: fontSize.title, body: fontSize.body, small: fontSize.small, caption: fontSize.caption };

interface Props extends TextProps { variant?: Variant; muted?: boolean; color?: string; center?: boolean; bold?: boolean }

/** Respects the user's font scale (allowFontScaling default) with a sane upper bound. */
export function Text({ variant = 'body', muted, color, center, bold, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      style={[{ fontSize: sizeFor[variant], fontWeight: bold ? fontWeight.bold : fontWeight[weightFor[variant]], color: color ?? (muted ? colors.textMuted : colors.text) }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
