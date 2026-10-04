import { Pressable, Switch, View } from 'react-native';
import { spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { Text } from './Text';

interface Props { label: string; value?: string; onPress?: () => void; toggle?: { value: boolean; onChange: (v: boolean) => void }; danger?: boolean; hint?: string; testID?: string }

export function SettingRow({ label, value, onPress, toggle, danger, hint, testID }: Props) {
  const { colors } = useTheme();
  const body = (
    <View style={{ minHeight: touch.large, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
      <View style={{ flex: 1 }}>
        <Text bold color={danger ? colors.danger : undefined}>{label}</Text>
        {hint ? <Text variant="caption" muted>{hint}</Text> : null}
      </View>
      {value ? <Text muted>{value}</Text> : null}
      {toggle ? <Switch value={toggle.value} onValueChange={toggle.onChange} accessibilityLabel={label} trackColor={{ true: colors.primary }} /> : onPress ? <Text muted>›</Text> : null}
    </View>
  );
  if (!onPress) return body;
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={value ? `${label}, ${value}` : label} onPress={onPress}>{body}</Pressable>;
}
