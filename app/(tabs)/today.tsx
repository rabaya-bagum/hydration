import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { HydrationHero } from '@/components/HydrationHero';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { AddDrinkSheet } from '@/features/logging/AddDrinkSheet';
import { EntrySheet } from '@/features/logging/EntrySheet';
import { QuickAdd } from '@/features/today/QuickAdd';
import { ChallengeTeaser } from '@/features/today/ChallengeTeaser';
import { Timeline } from '@/features/today/Timeline';
import { TodayHeader } from '@/features/today/TodayHeader';
import { useHydration } from '@/hooks/useHydration';
import { useNow } from '@/hooks/useNow';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import type { DrinkLog } from '@/domain/types';

export default function TodayScreen() {
  const router = useRouter();
  const { todaySummary, goalMl, todayLogs, streak, tz } = useHydration();
  const name = useSettingsStore((s) => s.name);
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const characterId = useSettingsStore((s) => s.characterId);
  const accessoryId = useSettingsStore((s) => s.accessoryId);
  const sceneId = useSettingsStore((s) => s.sceneId);
  const online = useUiStore((s) => s.online);
  const pending = useLogsStore((s) => s.pendingSync.length);
  const now = useNow();
  const [drinkId, setDrinkId] = useState('water');
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState<DrinkLog | undefined>();

  return (
    <Screen>
      <TodayHeader name={name} hour={now.getHours()} streak={streak.current} />
      {!online ? (
        <Card flat style={{ paddingVertical: spacing.sm }} accessibilityLiveRegion="polite">
          <Text variant="small" bold>Offline mode</Text>
          <Text variant="small" muted>Your drink is saved locally. We'll sync it when you're back online.{pending ? ` (${pending} waiting)` : ''}</Text>
        </Card>
      ) : null}
      <HydrationHero totalMl={todaySummary.totalMl} goalMl={goalMl} unitSystem={unitSystem} characterId={characterId} accessoryId={accessoryId} sceneId={sceneId} />
      {todaySummary.totalMl >= goalMl ? <Button label="Share today's win" kind="secondary" icon="📤" onPress={() => router.push({ pathname: '/share', params: { kind: 'daily' } })} testID="share-today" /> : null}
      <QuickAdd drinkId={drinkId} onDrinkChange={setDrinkId} onOpenAdd={() => setAdding(true)} />
      <View style={{ gap: spacing.sm }}>
        <Text variant="title" accessibilityRole="header">Today</Text>
        <Timeline logs={todayLogs} onSelect={setSelected} />
      </View>
      <ChallengeTeaser />
      <AddDrinkSheet visible={adding} tz={tz} onClose={() => setAdding(false)} />
      <EntrySheet log={selected} onClose={() => setSelected(undefined)} />
    </Screen>
  );
}
