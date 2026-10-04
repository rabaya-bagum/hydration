import { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { spacing } from '@/design/tokens';
import { useSettingsStore } from '@/store/settingsStore';

const MAX_FAVORITES = 4;

export default function DrinkSettings() {
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  const favs = useSettingsStore((s) => s.favoriteDrinkIds);
  const patch = useSettingsStore((s) => s.patch);
  const addCustom = useSettingsStore((s) => s.addCustomDrink);
  const [name, setName] = useState('');
  const toggle = (id: string) => {
    if (favs.includes(id)) { if (favs.length > 1) patch({ favoriteDrinkIds: favs.filter((x) => x !== id) }); return; }
    if (favs.length < MAX_FAVORITES) patch({ favoriteDrinkIds: [...favs, id] });
  };
  return (
    <Screen>
      <ScreenHeader back title="Favorite drinks" subtitle={`Pick up to ${MAX_FAVORITES} for the Today screen.`} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {drinkTypes.map((d) => <Chip key={d.id} glyph={d.icon} label={d.name} selected={favs.includes(d.id)} onPress={() => toggle(d.id)} />)}
      </View>
      <Text variant="small" muted>{favs.length}/{MAX_FAVORITES} selected</Text>
      <Card style={{ gap: spacing.md }}>
        <Text variant="title">Add your own drink</Text>
        <TextField label="Name" value={name} onChangeText={setName} maxLength={24} />
        <Button label="Add drink" kind="secondary" disabled={!name.trim()} onPress={() => { const d = addCustom(name, '✨'); if (favs.length < MAX_FAVORITES) patch({ favoriteDrinkIds: [...favs, d.id] }); setName(''); }} />
      </Card>
    </Screen>
  );
}
