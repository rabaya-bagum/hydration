import { View } from 'react-native';
import { spacing } from '@/design/tokens';
import { IconButton } from './IconButton';
import { Text } from './Text';

interface Props { value: string; label: string; onDec: () => void; onInc: () => void; big?: boolean }

/** − / + control with the current value spoken as the adjustable's label. */
export function Stepper({ value, label, onDec, onInc, big }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }} accessible={false}>
      <IconButton glyph="−" label={`Decrease ${label}`} onPress={onDec} filled />
      <Text variant={big ? 'display' : 'h2'} accessibilityLiveRegion="polite" accessibilityLabel={`${label}: ${value}`} style={{ minWidth: 120, textAlign: 'center' }}>{value}</Text>
      <IconButton glyph="+" label={`Increase ${label}`} onPress={onInc} filled />
    </View>
  );
}
