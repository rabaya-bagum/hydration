import { View } from 'react-native';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { formatVolume, spokenVolume } from '@/domain/units';
import type { WidgetSnapshot } from '@/domain/widgetSnapshot';
import { Mascot, moodForProgress } from './Mascot';
import { ProgressRing } from './ProgressRing';
import { Text } from './Text';

export type WidgetSize = 'small' | 'medium' | 'large';
export const WIDGET_DIMENSIONS: Record<WidgetSize, { w: number; h: number }> = { small: { w: 158, h: 158 }, medium: { w: 338, h: 158 }, large: { w: 338, h: 354 } };

/**
 * Faithful preview of the native widget layouts (spec in docs/06-widgets.md). It is a picture, not a control:
 * the real widgets open `plink://log?ml=…` from their quick-add buttons.
 */
export function WidgetPreview({ size, snap }: { size: WidgetSize; snap: WidgetSnapshot }) {
  const { colors } = useTheme();
  const { w, h } = WIDGET_DIMENSIONS[size];
  const label = `${size} widget preview. ${snap.percent} percent. ${spokenVolume(snap.consumedMl, snap.unit)} of ${spokenVolume(snap.goalMl, snap.unit)}.${size !== 'small' ? ` ${snap.streak} day streak.` : ''}`;
  const ring = <ProgressRing value={snap.percent / 100} size={size === 'small' ? 76 : 84} stroke={9} label={`${snap.percent} percent`} />;
  const numbers = <View><Text bold variant="title">{formatVolume(snap.consumedMl, snap.unit)}</Text><Text variant="caption" muted>of {formatVolume(snap.goalMl, snap.unit)}</Text></View>;
  const chips = snap.quickAdd.slice(0, size === 'medium' ? 1 : 3).map((q) => (
    <View key={q.ml} style={{ backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}><Text variant="small" bold color={colors.onPrimary}>+{formatVolume(q.ml, snap.unit)}</Text></View>
  ));
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={label} testID={`widget-${size}`}
      style={{ width: w, height: h, borderRadius: 28, padding: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: spacing.sm, justifyContent: 'space-between' }}>
      {size === 'small' ? (
        <View style={{ alignItems: 'center', gap: spacing.sm }}>{ring}{numbers}</View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {ring}
          <View style={{ flex: 1, gap: spacing.xs }}>{numbers}<Text variant="small" bold>🔥 {snap.streak} day streak</Text></View>
          {size === 'large' ? <Mascot characterId={snap.characterId} mood={moodForProgress(snap.percent / 100)} size={64} idle={false} /> : null}
        </View>
      )}
      {size !== 'small' ? <View style={{ flexDirection: 'row', gap: spacing.sm }}>{chips}</View> : null}
      {size === 'large' ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, height: 110 }}>
          {snap.trend.map((t) => (
            <View key={t.day} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 110 }}>
              <View style={{ width: '100%', height: Math.max(4, Math.min(t.percent, 100) * 1.0), borderRadius: radius.sm, backgroundColor: t.percent >= 100 ? colors.primary : colors.primarySoft, borderWidth: t.percent >= 100 ? 0 : 1.5, borderColor: colors.primary }} />
              <Text variant="caption" muted>{t.day.slice(8)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
