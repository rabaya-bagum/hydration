import { View } from 'react-native';
import { spacing } from '@/design/tokens';
import { Chip } from './Chip';

interface Props<T extends string> { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }

export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((o) => <Chip key={o.value} label={o.label} selected={o.value === value} onPress={() => onChange(o.value)} />)}
    </View>
  );
}
