import { View } from 'react-native';
import { DrinkButton } from '@/components/DrinkButton';
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { formatVolume, spokenVolume } from '@/domain/units';
import { logDrink } from '@/features/logging/logActions';
import { useSettingsStore } from '@/store/settingsStore';

const MAX_QUICK = 3;

interface Props { drinkId: string; onDrinkChange: (id: string) => void; onOpenAdd: () => void }

/** Quick-add: tap a vessel to log the selected drink immediately (water by default → 1 tap). */
export function QuickAdd({ drinkId, onDrinkChange, onOpenAdd }: Props) {
  const containers = useSettingsStore((s) => s.containers);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const favIds = useSettingsStore((s) => s.favoriteDrinkIds);
  const unit = useSettingsStore((s) => s.unitSystem);
  const favorites = containers.filter((c) => c.favorite).slice(0, MAX_QUICK);
  const drink = drinkTypes.find((d) => d.id === drinkId) ?? drinkTypes[0]!;
  const chips = favIds.map((id) => drinkTypes.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d);

  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text variant="title" accessibilityRole="header">Quick add</Text>
        <Text variant="small" muted>Logging {drink.name.toLowerCase()}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {favorites.map((c, i) => (
          <DrinkButton key={c.id} testID={`quick-add-${c.volumeMl}`} title={`+${formatVolume(c.volumeMl, unit).replace(' ', ' ')}`} subtitle={c.name}
            accessibilityLabel={`Add ${spokenVolume(c.volumeMl, unit)} of ${drink.name}`} accent={i === 0} onPress={() => logDrink({ drinkTypeId: drink.id, volumeMl: c.volumeMl, containerId: c.id })} />
        ))}
        <DrinkButton testID="quick-add-custom" title="＋" subtitle="Custom" accessibilityLabel="Add a drink with custom details" onPress={onOpenAdd} />
      </View>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {chips.map((d) => <Chip key={d.id} glyph={d.icon} label={d.name} selected={d.id === drink.id} onPress={() => onDrinkChange(d.id)} testID={`drink-${d.id}`} />)}
        <Chip label="More" onPress={onOpenAdd} accessibilityLabel="More drinks" />
      </View>
    </View>
  );
}
