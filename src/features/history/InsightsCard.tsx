import { View } from 'react-native';
import { Card } from '@/components/Card';
import { ProgressBar } from '@/components/ProgressBar';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { formatDayLabel } from '@/domain/dates';
import { DAY_PARTS, changeVsPrevious, type DayPart } from '@/domain/insights';
import type { DailySummary, UnitSystem } from '@/domain/types';
import { formatVolume } from '@/domain/units';

interface Props { unit: UnitSystem; avgMl: number; prevAvgMl: number; shares: Record<DayPart, number>; best?: DailySummary; periodLabel: string }

/** Plain-language patterns. Observations only, never health interpretations. */
export function InsightsCard({ unit, avgMl, prevAvgMl, shares, best, periodLabel }: Props) {
  const change = changeVsPrevious(avgMl, prevAvgMl);
  const topPart = DAY_PARTS.map((p) => ({ ...p, share: shares[p.id] })).sort((a, b) => b.share - a.share)[0]!;
  const hasData = DAY_PARTS.some((p) => shares[p.id] > 0);
  if (!hasData) return null;
  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="title" accessibilityRole="header">Patterns</Text>
      <Text>You drink most in the {topPart.label.toLowerCase()} ({Math.round(topPart.share * 100)}% of your volume).</Text>
      {change !== undefined ? <Text>Your daily average is {Math.abs(change)}% {change >= 0 ? 'higher' : 'lower'} than the previous {periodLabel}.</Text> : null}
      {best ? <Text>Biggest day: {formatDayLabel(best.day)} with {formatVolume(best.totalMl, unit)}.</Text> : null}
      <View style={{ gap: spacing.sm }}>
        {DAY_PARTS.map((p) => (
          <View key={p.id} style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="small">{p.label}</Text><Text variant="small" muted>{Math.round(shares[p.id] * 100)}%</Text></View>
            <ProgressBar value={shares[p.id]} label={`${p.label}: ${Math.round(shares[p.id] * 100)} percent of your drinks`} color="#17907A" height={8} />
          </View>
        ))}
      </View>
    </Card>
  );
}
