import { Card } from './Card';
import { Button } from './Button';
import { Text } from './Text';
import { spacing } from '@/design/tokens';

export function PremiumTeaser({ title, body, onPress }: { title: string; body: string; onPress: () => void }) {
  return (
    <Card style={{ gap: spacing.sm }}>
      <Text variant="title">🔒 {title}</Text>
      <Text muted>{body}</Text>
      <Button label="See Premium" kind="secondary" onPress={onPress} testID="premium-teaser" />
    </Card>
  );
}
