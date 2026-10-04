import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { WELLNESS_DISCLAIMER } from '@/content/brand';
import { spacing } from '@/design/tokens';
import { calculateGoal, GOAL_CONFIG, GOAL_STEP_ML } from '@/domain/hydrationGoal';
import type { ActivityLevel, Climate } from '@/domain/types';
import { formatVolume } from '@/domain/units';
import { useHydration } from '@/hooks/useHydration';
import { analytics } from '@/services/analytics';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';

export default function GoalSettings() {
  const s = useSettingsStore();
  const { goalMl, today } = useHydration();
  const u = s.unitSystem;
  const suggestion = calculateGoal({ weightKg: s.weightKg, activity: s.activity, climate: s.climate, exerciseDaysPerWeek: s.exerciseDays, caffeineCupsPerDay: s.caffeineCups });
  const change = (ml: number) => { s.setGoal(ml, today); analytics.track('goal_changed'); };
  return (
    <Screen>
      <ScreenHeader back title="Daily goal" />
      <Card style={{ alignItems: 'center', gap: spacing.md }}>
        <Stepper big label="daily goal" value={formatVolume(goalMl, u)} onDec={() => goalMl > GOAL_CONFIG.minMl && change(goalMl - GOAL_STEP_ML)} onInc={() => goalMl < GOAL_CONFIG.maxMl && change(goalMl + GOAL_STEP_ML)} />
        <Text variant="small" muted center>Changes apply from today. Past days keep the goal they had.</Text>
      </Card>
      <Card style={{ gap: spacing.md }}>
        <Text variant="title">Suggestion: {formatVolume(suggestion.totalMl, u)}</Text>
        <Text variant="small" bold muted>Activity</Text>
        <Segmented<ActivityLevel> value={s.activity} onChange={(activity) => s.patch({ activity })} options={[{ value: 'low', label: 'Low' }, { value: 'moderate', label: 'Moderate' }, { value: 'high', label: 'High' }, { value: 'very_high', label: 'Very high' }]} />
        <Text variant="small" bold muted>Climate</Text>
        <Segmented<Climate> value={s.climate} onChange={(climate) => s.patch({ climate })} options={[{ value: 'cool', label: 'Cool' }, { value: 'mild', label: 'Mild' }, { value: 'warm', label: 'Warm' }, { value: 'hot', label: 'Hot' }]} />
        <Button label={`Use suggestion (${formatVolume(suggestion.totalMl, u)})`} kind="secondary" onPress={() => { change(suggestion.totalMl); useUiStore.getState().showToast('Goal updated'); }} />
      </Card>
      <Text variant="small" muted>{WELLNESS_DISCLAIMER}</Text>
    </Screen>
  );
}
