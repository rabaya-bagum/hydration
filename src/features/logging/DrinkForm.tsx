import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { Stepper } from '@/components/Stepper';
import { spacing } from '@/design/tokens';
import { dayKey, formatClock, localDate } from '@/domain/dates';
import { formatVolume, mlToFlOz, parseVolumeInput } from '@/domain/units';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';

export const MAX_SINGLE_LOG_ML = 3000;
const TIME_STEP_MIN = 15;

export interface DrinkFormValues { drinkTypeId: string; volumeMl: number; loggedAt: string; containerId?: string }
interface Props {
  initial?: Partial<DrinkFormValues> & { tz?: string };
  submitLabel: string;
  tz: string;
  onSubmit: (v: DrinkFormValues) => void;
}

const amountToText = (ml: number, imperial: boolean) => (imperial ? String(Number(mlToFlOz(ml).toFixed(1))) : String(ml));

/** Shared by Add and Edit. Pure form: parent decides what submit does. */
export function DrinkForm({ initial, submitLabel, tz, onSubmit }: Props) {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const containers = useSettingsStore((s) => s.containers);
  const unit = useSettingsStore((s) => s.unitSystem);
  const hour12 = useSettingsStore((s) => s.hour12);
  const addCustomDrink = useSettingsStore((s) => s.addCustomDrink);
  const logs = useLogsStore((s) => s.logs);
  const imperial = unit === 'imperial';

  const [drinkId, setDrinkId] = useState(initial?.drinkTypeId ?? 'water');
  const [containerId, setContainerId] = useState<string | undefined>(initial?.containerId);
  const [amountText, setAmountText] = useState(amountToText(initial?.volumeMl ?? 250, imperial));
  const [at, setAt] = useState(() => (initial?.loggedAt ? new Date(initial.loggedAt) : new Date()));
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const volumeMl = parseVolumeInput(amountText, unit);
  const amountError = volumeMl === null ? 'Enter an amount greater than zero.' : volumeMl > MAX_SINGLE_LOG_ML ? `That's a lot for one entry. Max ${formatVolume(MAX_SINGLE_LOG_ML, unit)}.` : undefined;

  const day = dayKey(initial?.loggedAt ?? new Date(), tz);
  const bounds = useMemo(() => ({ min: localDate(day, 0).getTime(), max: Math.min(Date.now(), localDate(day, 24 * 60).getTime() - 1) }), [day]);
  const shift = (mins: number) => setAt((d) => new Date(Math.min(bounds.max, Math.max(bounds.min, d.getTime() + mins * 60_000))));

  const recents = useMemo(() => {
    const seen = new Set<string>();
    return [...logs].filter((l) => !l.deletedAt).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)).filter((l) => {
      const k = `${l.drinkTypeId}:${l.volumeMl}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 4);
  }, [logs]);

  const commitCustom = () => {
    if (!customName.trim()) return;
    setDrinkId(addCustomDrink(customName, '✨').id);
    setCustomName('');
    setShowCustom(false);
  };

  return (
    <View style={{ gap: spacing.lg }}>
      {recents.length > 0 && !initial ? (
        <View style={{ gap: spacing.sm }}>
          <Text variant="small" bold muted>Recent</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {recents.map((l) => {
              const d = drinkTypes.find((x) => x.id === l.drinkTypeId);
              return <Chip key={`${l.drinkTypeId}:${l.volumeMl}`} glyph={d?.icon} label={formatVolume(l.volumeMl, unit)} accessibilityLabel={`Use recent: ${d?.name ?? 'Drink'}, ${formatVolume(l.volumeMl, unit)}`} onPress={() => { setDrinkId(l.drinkTypeId); setAmountText(amountToText(l.volumeMl, imperial)); setContainerId(l.containerId); }} />;
            })}
          </View>
        </View>
      ) : null}

      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Drink</Text>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {drinkTypes.map((d) => <Chip key={d.id} glyph={d.icon} label={d.name} selected={d.id === drinkId} onPress={() => setDrinkId(d.id)} />)}
          <Chip label="New drink" glyph="＋" onPress={() => setShowCustom((v) => !v)} />
        </View>
        {showCustom ? (
          <View style={{ gap: spacing.sm }}>
            <TextField label="Custom drink name" value={customName} onChangeText={setCustomName} maxLength={24} placeholder="e.g. Coconut water" />
            <Button label="Add drink" kind="secondary" onPress={commitCustom} disabled={!customName.trim()} />
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Vessel</Text>
        <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {containers.map((c) => (
            <Chip key={c.id} label={`${c.name} · ${formatVolume(c.volumeMl, unit)}`} selected={c.id === containerId} onPress={() => { setContainerId(c.id); setAmountText(amountToText(c.volumeMl, imperial)); }} />
          ))}
        </View>
        <TextField label={`Amount (${imperial ? 'fl oz' : 'mL'})`} value={amountText} onChangeText={(t) => { setAmountText(t); setContainerId(undefined); }} keyboardType="decimal-pad" error={amountError} testID="amount-input" />
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text variant="small" bold muted>Time</Text>
        <Stepper label="time" value={formatClock(at.toISOString(), tz, hour12)} onDec={() => shift(-TIME_STEP_MIN)} onInc={() => shift(TIME_STEP_MIN)} />
      </View>

      <Button label={submitLabel} testID="drink-submit" disabled={volumeMl === null || !!amountError} onPress={() => volumeMl !== null && onSubmit({ drinkTypeId: drinkId, volumeMl, loggedAt: at.toISOString(), containerId })} />
    </View>
  );
}
