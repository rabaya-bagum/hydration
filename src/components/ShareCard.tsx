import { forwardRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { paletteFor } from '@/content/themes';
import { APP_NAME, TAGLINE } from '@/content/brand';
import type { ShareContent } from '@/domain/shareCards';
import { useSettingsStore } from '@/store/settingsStore';
import { Mascot } from './Mascot';
import { Text } from './Text';

export const SHARE_CARD_W = 320;
export const SHARE_CARD_H = 400; // 4:5, exported at 1080x1350

/** Share image. Always light palette so it reads the same wherever it is posted. Original art only. */
export const ShareCard = forwardRef<View, { content: ShareContent }>(function ShareCard({ content }, ref) {
  const characterId = useSettingsStore((s) => s.characterId);
  const accessoryId = useSettingsStore((s) => s.accessoryId);
  const themeId = useSettingsStore((s) => s.themeId);
  const p = paletteFor(themeId, false);
  const ink = '#102A43';
  return (
    <View ref={ref} collapsable={false} accessible accessibilityRole="image"
      accessibilityLabel={`Share card. ${content.headline} ${content.stat} ${content.statLabel}.${content.detail ? ` ${content.detail}.` : ''}${content.from ? ` From ${content.from}.` : ''}`}
      style={{ width: SHARE_CARD_W, height: SHARE_CARD_H, overflow: 'hidden', borderRadius: 24, backgroundColor: p.skyBottom }}>
      <Svg width={SHARE_CARD_W} height={SHARE_CARD_H} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={p.skyTop} /><Stop offset="1" stopColor={p.skyBottom} /></LinearGradient>
          <LinearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={p.waterTop} /><Stop offset="1" stopColor={p.waterBottom} /></LinearGradient>
        </Defs>
        <Rect width={SHARE_CARD_W} height={SHARE_CARD_H} fill="url(#sky)" />
        <Circle cx={270} cy={60} r={26} fill={p.sun} opacity={0.85} />
        <Path d={`M0 300 Q40 286 80 300 T160 300 T240 300 T320 300 V${SHARE_CARD_H} H0 Z`} fill="url(#sea)" />
        <Circle cx={40} cy={250} r={5} fill="#fff" opacity={0.6} /><Circle cx={290} cy={230} r={7} fill="#fff" opacity={0.5} />
      </Svg>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 22 }}>
        <Text variant="title" center color={ink}>{content.glyph} {content.headline}</Text>
        <View style={{ marginTop: 6 }}><Mascot characterId={characterId} mood="cheer" size={110} idle={false} accessoryId={accessoryId} /></View>
        <Text style={{ fontSize: 44, fontWeight: '800', marginTop: 4 }} color={ink} center numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1}>{content.stat}</Text>
        <Text variant="small" color={ink} center maxFontSizeMultiplier={1}>{content.statLabel}</Text>
        {content.detail ? <Text variant="small" bold color={ink} center maxFontSizeMultiplier={1} style={{ marginTop: 4 }}>{content.detail}</Text> : null}
        {content.from ? <Text variant="small" color={ink} center maxFontSizeMultiplier={1} style={{ marginTop: 2 }}>— {content.from}</Text> : null}
      </View>
      <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' }}>
        <Text variant="small" bold color="#fff" maxFontSizeMultiplier={1}>💧 {APP_NAME}</Text>
        <Text variant="caption" color="#fff" maxFontSizeMultiplier={1}>{TAGLINE}</Text>
      </View>
    </View>
  );
});
