import { View } from 'react-native';
import { Card } from '@/components/Card';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { WELLNESS_DISCLAIMER } from '@/content/brand';
import { spacing } from '@/design/tokens';
import { formatVolume } from '@/domain/units';
import { StepFrame } from './StepFrame';
import { finalGoal, GOAL_STEP_ML, suggestedGoal, type StepProps } from './draft';
import { GOAL_CONFIG } from '@/domain/hydrationGoal';

export function GoalStep({ draft, set }: StepProps) {
  const s = suggestedGoal(draft);
  const goal = finalGoal(draft);
  const u = draft.unitSystem;
  return (
    <StepFrame title="Your suggested daily goal">
      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <Stepper big label="daily goal" value={formatVolume(goal, u)} onDec={() => goal > GOAL_CONFIG.minMl && set({ goalOffsetMl: draft.goalOffsetMl - GOAL_STEP_ML })} onInc={() => goal < GOAL_CONFIG.maxMl && set({ goalOffsetMl: draft.goalOffsetMl + GOAL_STEP_ML })} />
        <Text muted center>{draft.goalOffsetMl ? `Adjusted from ${formatVolume(s.totalMl, u)}` : 'Tap − or + to adjust. You can change this anytime.'}</Text>
      </Card>
      <Card flat style={{ gap: spacing.xs }}>
        <Text variant="small" bold>How we got there</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="small" muted>Baseline</Text><Text variant="small">{formatVolume(s.baselineMl, u)}</Text></View>
        {s.adjustments.map((a) => <View key={a.key} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="small" muted>{a.label}</Text><Text variant="small">+{formatVolume(a.ml, u)}</Text></View>)}
        {s.clamped ? <Text variant="caption" muted>Kept within a typical range.</Text> : null}
      </Card>
      <Text variant="small" muted>{WELLNESS_DISCLAIMER}</Text>
    </StepFrame>
  );
}
