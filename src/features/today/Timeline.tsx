import { Pressable, View } from 'react-native';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Text } from '@/components/Text';
import { useTheme } from '@/design/theme';
import { spacing, touch } from '@/design/tokens';
import { formatClock } from '@/domain/dates';
import { formatVolume, spokenVolume } from '@/domain/units';
import type { DrinkLog } from '@/domain/types';
import { useSettingsStore } from '@/store/settingsStore';

interface Props { logs: DrinkLog[]; onSelect: (log: DrinkLog) => void; emptyTitle?: string; emptyBody?: string }

export function Timeline({ logs, onSelect, emptyTitle = 'Your first sip will appear here.', emptyBody = 'Tap a quick-add button to log a drink.' }: Props) {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const unit = useSettingsStore((s) => s.unitSystem);
  const hour12 = useSettingsStore((s) => s.hour12);
  const { colors } = useTheme();
  if (!logs.length) return <Card flat><EmptyState title={emptyTitle} body={emptyBody} /></Card>;
  return (
    <Card style={{ paddingVertical: spacing.xs }}>
      {logs.map((l, i) => {
        const d = drinkTypes.find((x) => x.id === l.drinkTypeId);
        const time = formatClock(l.loggedAt, l.tz, hour12);
        return (
          <Pressable
            key={l.id} testID={`log-${i}`} accessibilityRole="button" accessibilityLabel={`${d?.name ?? 'Drink'}, ${spokenVolume(l.volumeMl, unit)}, at ${time}`} accessibilityHint="Opens edit, duplicate and delete"
            onPress={() => onSelect(l)}
            style={{ minHeight: touch.large, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}
          >
            <Text variant="small" muted style={{ width: 52 }}>{time}</Text>
            <Text variant="title">{d?.icon ?? '💧'}</Text>
            <Text bold style={{ flex: 1 }}>{d?.name ?? 'Drink'}</Text>
            <Text bold>{formatVolume(l.volumeMl, unit)}</Text>
          </Pressable>
        );
      })}
    </Card>
  );
}
