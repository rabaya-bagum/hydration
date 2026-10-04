import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/design/theme';
import { radius, spacing, touch } from '@/design/tokens';
import { haptics } from '@/services/haptics';
import { StepFrame } from './StepFrame';

export interface Option<T extends string> { value: T; glyph: string; title: string; body: string }

interface Props<T extends string> { title: string; subtitle?: string; options: Option<T>[]; value: T; onChange: (v: T) => void }

/** Large single-choice cards used for activity and climate. */
export function OptionStep<T extends string>({ title, subtitle, options, value, onChange }: Props<T>) {
  const { colors } = useTheme();
  return (
    <StepFrame title={title} subtitle={subtitle}>
      <View accessibilityRole="radiogroup" style={{ gap: spacing.md }}>
        {options.map((o) => {
          const sel = o.value === value;
          return (
            <Pressable
              key={o.value} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`${o.title}. ${o.body}`}
              onPress={() => { haptics.tap(); onChange(o.value); }} testID={`option-${o.value}`}
              style={{ minHeight: touch.large + 16, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.surface }}
            >
              <Text variant="h2">{o.glyph}</Text>
              <View style={{ flex: 1 }}><Text bold>{o.title}</Text><Text variant="small" muted>{o.body}</Text></View>
              <Text bold color={colors.primary}>{sel ? '✓' : ''}</Text>
            </Pressable>
          );
        })}
      </View>
    </StepFrame>
  );
}
