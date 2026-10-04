import { View } from 'react-native';
import { ProgressBar } from '@/components/ProgressBar';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import type { RangeStats } from '@/domain/analytics';
import type { UnitSystem } from '@/domain/types';
import { formatVolume } from '@/domain/units';
import { useSettingsStore } from '@/store/settingsStore';

export function Breakdown({ stats, unit }: { stats: RangeStats; unit: UnitSystem }) {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  if (!stats.byDrink.length) return null;
  return (
    <View style={{ gap: spacing.md }}>
      {stats.byDrink.map((b) => {
        const d = drinkTypes.find((x) => x.id === b.drinkTypeId);
        const label = `${d?.name ?? 'Drink'}: ${formatVolume(b.ml, unit)}, ${Math.round(b.share * 100)} percent`;
        return (
          <View key={b.drinkTypeId} style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text bold>{d?.icon} {d?.name ?? 'Drink'}</Text>
              <Text muted>{formatVolume(b.ml, unit)} · {Math.round(b.share * 100)}%</Text>
            </View>
            <ProgressBar value={b.share} label={label} />
          </View>
        );
      })}
    </View>
  );
}
