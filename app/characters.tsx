import { View } from 'react-native';
import { Chip } from '@/components/Chip';
import { LevelCard } from '@/components/LevelCard';
import { MascotCard } from '@/components/MascotCard';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { CHARACTERS, COSMETICS } from '@/content/characters';
import { spacing } from '@/design/tokens';
import { describeUnlock, isUnlocked } from '@/domain/unlocks';
import { useProgress } from '@/hooks/useProgress';
import { useSettingsStore } from '@/store/settingsStore';

export default function CharactersScreen() {
  const progress = useProgress();
  const s = useSettingsStore();
  const cosmetic = (kind: 'accessory' | 'scene') => COSMETICS.filter((c) => c.kind === kind);
  return (
    <Screen>
      <ScreenHeader back title="Companions" subtitle="Unlock more as you level up and build streaks." />
      <LevelCard p={progress} />
      <View accessibilityRole="radiogroup" style={{ gap: spacing.md }}>
        {CHARACTERS.map((c) => <MascotCard key={c.id} c={c} unlocked={isUnlocked(c.unlock, progress.unlock)} selected={s.characterId === c.id} onSelect={() => s.patch({ characterId: c.id })} />)}
      </View>
      {(['accessory', 'scene'] as const).map((kind) => (
        <View key={kind} style={{ gap: spacing.sm }}>
          <Text variant="title" accessibilityRole="header">{kind === 'accessory' ? 'Accessories' : 'Scenes'}</Text>
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {cosmetic(kind).map((c) => {
              const ok = isUnlocked(c.unlock, progress.unlock);
              const selected = (kind === 'accessory' ? s.accessoryId : s.sceneId) === c.id;
              return <Chip key={c.id} glyph={ok ? c.glyph : '🔒'} label={ok ? c.name : `${c.name} · ${describeUnlock(c.unlock)}`} selected={selected}
                onPress={() => ok && s.patch(kind === 'accessory' ? { accessoryId: c.id } : { sceneId: c.id })} accessibilityLabel={ok ? c.name : `${c.name}, locked. ${describeUnlock(c.unlock)}`} />;
            })}
          </View>
        </View>
      ))}
    </Screen>
  );
}
