import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { ProgressBar } from '@/components/ProgressBar';
import { useTheme } from '@/design/theme';
import { spacing } from '@/design/tokens';
import { analytics } from '@/services/analytics';
import { CharacterStep } from './CharacterStep';
import { ContainersStep } from './ContainersStep';
import { DoneStep } from './DoneStep';
import { GoalStep } from './GoalStep';
import { LifestyleStep } from './LifestyleStep';
import { OptionStep } from './OptionStep';
import { ProfileStep } from './ProfileStep';
import { RemindersStep } from './RemindersStep';
import { commitOnboarding } from './complete';
import { initialDraft, type Draft } from './draft';
import type { ActivityLevel, Climate } from '@/domain/types';

const ACTIVITY = [
  { value: 'low' as ActivityLevel, glyph: '🛋️', title: 'Low', body: 'Mostly seated, light movement' },
  { value: 'moderate' as ActivityLevel, glyph: '🚶', title: 'Moderate', body: 'On your feet or regular walks' },
  { value: 'high' as ActivityLevel, glyph: '🏃', title: 'High', body: 'Active job or frequent workouts' },
  { value: 'very_high' as ActivityLevel, glyph: '🏋️', title: 'Very high', body: 'Intense training most days' },
];
const CLIMATE = [
  { value: 'cool' as Climate, glyph: '🧥', title: 'Cool', body: 'Cold or air-conditioned most of the day' },
  { value: 'mild' as Climate, glyph: '🌤️', title: 'Mild', body: 'Comfortable temperatures' },
  { value: 'warm' as Climate, glyph: '☀️', title: 'Warm', body: 'Often warm or humid' },
  { value: 'hot' as Climate, glyph: '🔥', title: 'Hot', body: 'Hot most of the day' },
];

type StepId = 'profile' | 'activity' | 'climate' | 'lifestyle' | 'goal' | 'containers' | 'reminders' | 'character' | 'done';
const STEPS: { id: StepId; skippable: boolean }[] = [
  { id: 'profile', skippable: true }, { id: 'activity', skippable: true }, { id: 'climate', skippable: true }, { id: 'lifestyle', skippable: true },
  { id: 'goal', skippable: false }, { id: 'containers', skippable: true }, { id: 'reminders', skippable: true }, { id: 'character', skippable: false }, { id: 'done', skippable: false },
];

export function OnboardingFlow() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const set = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p, ...('weightKg' in p || 'activity' in p || 'climate' in p || 'exerciseDays' in p || 'caffeineCups' in p ? { goalOffsetMl: 0 } : {}) }));
  useEffect(() => { analytics.track('onboarding_started'); }, []);

  const step = STEPS[i]!;
  const last = i === STEPS.length - 1;
  const next = () => {
    if (last) { commitOnboarding(draft); router.replace('/today'); return; }
    setI(i + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing.sm }}>
      <View style={{ paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View style={{ width: 44 }}>{i > 0 && !last ? <IconButton glyph="←" label="Previous step" onPress={() => setI(i - 1)} /> : null}</View>
        <View style={{ flex: 1 }}><ProgressBar value={(i + 1) / STEPS.length} label={`Step ${i + 1} of ${STEPS.length}`} /></View>
        <View style={{ minWidth: 60, alignItems: 'flex-end' }}>
          {step.skippable ? <Button label="Skip" kind="ghost" onPress={next} style={{ minHeight: 44, paddingHorizontal: spacing.sm }} accessibilityHint="Uses sensible defaults for this step" /> : null}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl, width: '100%', maxWidth: 640, alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        {step.id === 'profile' && <ProfileStep draft={draft} set={set} />}
        {step.id === 'activity' && <OptionStep title="How active are you?" subtitle="Think of a typical day." options={ACTIVITY} value={draft.activity} onChange={(activity) => set({ activity })} />}
        {step.id === 'climate' && <OptionStep title="What's it like where you are?" subtitle="Heat and humidity change how much we sweat." options={CLIMATE} value={draft.climate} onChange={(climate) => set({ climate })} />}
        {step.id === 'lifestyle' && <LifestyleStep draft={draft} set={set} />}
        {step.id === 'goal' && <GoalStep draft={draft} set={set} />}
        {step.id === 'containers' && <ContainersStep draft={draft} set={set} />}
        {step.id === 'reminders' && <RemindersStep draft={draft} set={set} />}
        {step.id === 'character' && <CharacterStep value={draft.characterId} onChange={(characterId) => set({ characterId })} />}
        {step.id === 'done' && <DoneStep draft={draft} />}
      </ScrollView>
      <View style={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        <Button label={last ? 'Start hydrating' : step.id === 'goal' ? 'Looks good' : 'Continue'} onPress={next} testID="onboarding-next" />
      </View>
    </View>
  );
}
