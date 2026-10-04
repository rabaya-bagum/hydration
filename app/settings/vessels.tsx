import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Section } from '@/components/Section';
import { SettingRow } from '@/components/SettingRow';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { formatVolume, parseVolumeInput } from '@/domain/units';
import { useSettingsStore } from '@/store/settingsStore';

const MAX_QUICK = 3;
const MAX_VESSEL_ML = 5000;

export default function VesselSettings() {
  const containers = useSettingsStore((s) => s.containers);
  const unit = useSettingsStore((s) => s.unitSystem);
  const upsert = useSettingsStore((s) => s.upsertContainer);
  const remove = useSettingsStore((s) => s.removeContainer);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const ml = parseVolumeInput(amount, unit);
  const favCount = containers.filter((c) => c.favorite).length;
  const valid = name.trim().length > 0 && ml !== null && ml <= MAX_VESSEL_ML;

  return (
    <Screen>
      <ScreenHeader back title="Vessels" subtitle={`Up to ${MAX_QUICK} favorites show as quick-add buttons.`} />
      <Section>
        {containers.map((c) => (
          <View key={c.id} style={{ borderBottomWidth: 0 }}>
            <SettingRow label={c.name} hint={c.favorite ? 'Quick-add favorite' : undefined} value={formatVolume(c.volumeMl, unit)}
              toggle={{ value: c.favorite, onChange: (favorite) => { if (favorite && favCount >= MAX_QUICK) return; upsert({ ...c, favorite }); } }} />
            {containers.length > 1 ? <Button label={`Remove ${c.name}`} kind="ghost" onPress={() => remove(c.id)} style={{ alignSelf: 'flex-start', minHeight: 44 }} /> : null}
          </View>
        ))}
      </Section>
      <Card style={{ gap: spacing.md }}>
        <Text variant="title">Add a vessel</Text>
        <TextField label="Name" value={name} onChangeText={setName} maxLength={20} testID="vessel-name" />
        <TextField label={`Size (${unit === 'imperial' ? 'fl oz' : 'mL'})`} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" testID="vessel-size" error={amount && !valid && ml === null ? 'Enter a size greater than zero.' : ml && ml > MAX_VESSEL_ML ? 'That seems too large.' : undefined} />
        <Button label="Add vessel" disabled={!valid} onPress={() => { upsert({ name: name.trim(), volumeMl: ml!, favorite: favCount < MAX_QUICK }); setName(''); setAmount(''); }} testID="vessel-add" />
      </Card>
    </Screen>
  );
}
