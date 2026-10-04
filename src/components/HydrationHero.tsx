import { useState } from 'react';
import { View } from 'react-native';
import { spacing } from '@/design/tokens';
import { contextMessage } from '@/domain/messages';
import { isOverGoalNote, percentOf } from '@/domain/progress';
import { formatVolume, spokenVolume, splitVolume } from '@/domain/units';
import type { UnitSystem } from '@/domain/types';
import { Card } from './Card';
import { PondScene } from './PondScene';
import { Text } from './Text';

interface Props { totalMl: number; goalMl: number; unitSystem: UnitSystem; characterId: string }

/** Hero: animated pond + big numbers + message. State is conveyed by pond, number, percent AND text. */
export function HydrationHero({ totalMl, goalMl, unitSystem, characterId }: Props) {
  const [w, setW] = useState(300);
  const pct = percentOf(totalMl, goalMl);
  const big = splitVolume(totalMl, unitSystem);
  const summary = `${spokenVolume(totalMl, unitSystem)} of ${spokenVolume(goalMl, unitSystem)}, ${pct} percent. ${contextMessage(totalMl, goalMl, unitSystem)}`;
  return (
    <Card style={{ gap: spacing.md, padding: spacing.md }}>
      <View onLayout={(e) => setW(Math.max(200, Math.round(e.nativeEvent.layout.width)))}>
        <PondScene ratio={totalMl / goalMl} characterId={characterId} width={w} />
      </View>
      <View accessible accessibilityRole="progressbar" accessibilityLabel={summary} accessibilityValue={{ min: 0, max: 100, now: Math.min(pct, 100) }} style={{ alignItems: 'center', gap: spacing.xs }} testID="hero-summary">
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
          <Text variant="display">{big.value}</Text>
          <Text variant="title" muted>{big.unit}</Text>
        </View>
        <Text muted>of {formatVolume(goalMl, unitSystem)} · {pct}%</Text>
        <Text bold testID="hero-message">{contextMessage(totalMl, goalMl, unitSystem)}</Text>
        {isOverGoalNote(totalMl, goalMl) ? <Text variant="caption" muted center>You're well past your goal. No need to push further — listen to your body.</Text> : null}
      </View>
    </Card>
  );
}
