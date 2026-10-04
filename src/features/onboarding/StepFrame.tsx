import { View } from 'react-native';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';

export function StepFrame({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="h1" accessibilityRole="header">{title}</Text>
        {subtitle ? <Text muted>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}
