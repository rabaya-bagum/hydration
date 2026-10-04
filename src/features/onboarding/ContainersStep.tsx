import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { formatVolume } from '@/domain/units';
import { useSettingsStore } from '@/store/settingsStore';
import { StepFrame } from './StepFrame';
import type { StepProps } from './draft';

const MAX_FAVORITES = 3;

export function ContainersStep({ draft, set }: StepProps) {
  const containers = useSettingsStore((s) => s.containers);
  const toggle = (id: string) => {
    const has = draft.favoriteContainerIds.includes(id);
    if (!has && draft.favoriteContainerIds.length >= MAX_FAVORITES) return;
    set({ favoriteContainerIds: has ? draft.favoriteContainerIds.filter((x) => x !== id) : [...draft.favoriteContainerIds, id] });
  };
  return (
    <StepFrame title="What do you drink from?" subtitle={`Pick up to ${MAX_FAVORITES}. They become your one-tap quick-add buttons. Add custom sizes later in Profile.`}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {containers.map((c) => <Chip key={c.id} label={`${c.name} · ${formatVolume(c.volumeMl, draft.unitSystem)}`} selected={draft.favoriteContainerIds.includes(c.id)} onPress={() => toggle(c.id)} />)}
      </View>
      <Text variant="small" muted>{draft.favoriteContainerIds.length}/{MAX_FAVORITES} selected</Text>
    </StepFrame>
  );
}
