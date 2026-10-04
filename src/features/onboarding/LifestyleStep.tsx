import { View } from 'react-native';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { formatMinutes } from '@/domain/dates';
import { StepFrame } from './StepFrame';
import type { StepProps } from './draft';

const TIME_STEP = 30;
const wrap = (m: number) => (m + 1440) % 1440;

export function LifestyleStep({ draft, set }: StepProps) {
  return (
    <StepFrame title="Your day" subtitle="All optional. These help us time reminders and tune your goal.">
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Exercise days per week</Text>
        <Stepper label="exercise days" value={`${draft.exerciseDays}`} onDec={() => set({ exerciseDays: Math.max(0, draft.exerciseDays - 1) })} onInc={() => set({ exerciseDays: Math.min(7, draft.exerciseDays + 1) })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Caffeinated drinks per day</Text>
        <Stepper label="caffeinated drinks" value={`${draft.caffeineCups}`} onDec={() => set({ caffeineCups: Math.max(0, draft.caffeineCups - 1) })} onInc={() => set({ caffeineCups: Math.min(10, draft.caffeineCups + 1) })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Wake time</Text>
        <Stepper label="wake time" value={formatMinutes(draft.wakeMin)} onDec={() => set({ wakeMin: wrap(draft.wakeMin - TIME_STEP) })} onInc={() => set({ wakeMin: wrap(draft.wakeMin + TIME_STEP) })} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Bedtime</Text>
        <Stepper label="bedtime" value={formatMinutes(draft.bedMin)} onDec={() => set({ bedMin: wrap(draft.bedMin - TIME_STEP) })} onInc={() => set({ bedMin: wrap(draft.bedMin + TIME_STEP) })} />
      </View>
    </StepFrame>
  );
}
