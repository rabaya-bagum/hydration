import { View } from 'react-native';
import { spacing } from '@/design/tokens';
import { Card } from './Card';
import { Text } from './Text';

export function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {title ? <Text variant="small" bold muted accessibilityRole="header" style={{ marginLeft: spacing.sm }}>{title.toUpperCase()}</Text> : null}
      <Card style={{ paddingVertical: spacing.xs, gap: 0 }}>{children}</Card>
    </View>
  );
}
