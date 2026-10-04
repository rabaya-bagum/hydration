import { View } from 'react-native';
import { spacing } from '@/design/tokens';
import { Button } from './Button';
import { Text } from './Text';

interface Props { glyph?: string; title: string; body?: string; actionLabel?: string; onAction?: () => void }

export function EmptyState({ glyph = '💧', title, body, actionLabel, onAction }: Props) {
  return (
    <View style={{ alignItems: 'center', gap: spacing.sm, padding: spacing.xl }} accessible accessibilityLabel={`${title}. ${body ?? ''}`}>
      <Text variant="display" accessibilityElementsHidden importantForAccessibility="no">{glyph}</Text>
      <Text variant="title" center>{title}</Text>
      {body ? <Text muted center>{body}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.sm }} /> : null}
    </View>
  );
}
