import { spacing } from '@/design/tokens';
import { Card } from './Card';
import { Text } from './Text';

interface Props { label: string; value: string; hint?: string; glyph?: string }

export function StatCard({ label, value, hint, glyph }: Props) {
  return (
    <Card style={{ flex: 1, minWidth: 140, gap: spacing.xs }} accessible accessibilityLabel={`${label}: ${value}${hint ? `. ${hint}` : ''}`}>
      <Text variant="caption" muted>{glyph ? `${glyph} ` : ''}{label}</Text>
      <Text variant="h2">{value}</Text>
      {hint ? <Text variant="caption" muted>{hint}</Text> : null}
    </Card>
  );
}
