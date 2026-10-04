import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { Segmented } from '@/components/Segmented';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { formatHeight, formatWeight, kgToLb, lbToKg } from '@/domain/units';
import type { AgeRange } from '@/domain/types';
import { StepFrame } from './StepFrame';
import type { StepProps } from './draft';

const AGES: { value: AgeRange; label: string }[] = [
  { value: '18-24', label: '18–24' }, { value: '25-34', label: '25–34' }, { value: '35-44', label: '35–44' },
  { value: '45-54', label: '45–54' }, { value: '55+', label: '55+' }, { value: 'unspecified', label: 'Prefer not to say' },
];

export function ProfileStep({ draft, set }: StepProps) {
  const imperial = draft.unitSystem === 'imperial';
  const bumpWeight = (d: number) => {
    const cur = draft.weightKg ?? 70;
    const next = imperial ? lbToKg(Math.round(kgToLb(cur)) + d) : cur + d;
    set({ weightKg: Math.min(250, Math.max(30, Math.round(next * 10) / 10)) });
  };
  const bumpHeight = (d: number) => {
    const cur = draft.heightCm ?? 170;
    set({ heightCm: Math.min(230, Math.max(120, imperial ? Math.round((Math.round(cur / 2.54) + d) * 2.54) : cur + d)) });
  };
  return (
    <StepFrame title="About you" subtitle="Only used to suggest a daily goal. Everything stays on your device unless you sign in.">
      <TextField label="What should we call you? (optional)" value={draft.name} onChangeText={(name) => set({ name })} maxLength={24} autoCapitalize="words" testID="name-input" />
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Units</Text>
        <Segmented value={draft.unitSystem} onChange={(unitSystem) => set({ unitSystem })} options={[{ value: 'metric', label: 'mL / L' }, { value: 'imperial', label: 'fl oz' }]} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Age range</Text>
        <Segmented value={draft.ageRange} onChange={(ageRange) => set({ ageRange })} options={AGES} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Weight</Text>
        {draft.weightKg === undefined ? <Text muted>We'll use a typical default for your goal.</Text> : (
          <Stepper label="weight" value={formatWeight(draft.weightKg, draft.unitSystem)} onDec={() => bumpWeight(-1)} onInc={() => bumpWeight(1)} />
        )}
        <Chip label="Prefer not to say" selected={draft.weightKg === undefined} onPress={() => set({ weightKg: draft.weightKg === undefined ? 70 : undefined })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Height (optional)</Text>
        {draft.heightCm === undefined ? null : <Stepper label="height" value={formatHeight(draft.heightCm, draft.unitSystem)} onDec={() => bumpHeight(-1)} onInc={() => bumpHeight(1)} />}
        <Chip label="Prefer not to say" selected={draft.heightCm === undefined} onPress={() => set({ heightCm: draft.heightCm === undefined ? 170 : undefined })} />
      </View>
    </StepFrame>
  );
}
