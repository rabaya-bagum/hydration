import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Section } from '@/components/Section';
import { Segmented } from '@/components/Segmented';
import { SettingRow } from '@/components/SettingRow';
import { Text } from '@/components/Text';
import { getCharacter } from '@/content/characters';
import { spacing } from '@/design/tokens';
import { formatVolume } from '@/domain/units';
import { useHydration } from '@/hooks/useHydration';
import { useProgress } from '@/hooks/useProgress';
import { authService, useSession } from '@/services/auth';
import { useTier } from '@/store/subscriptionStore';
import { useSettingsStore } from '@/store/settingsStore';

const MODE_LABEL = { smart: 'Smart', scheduled: 'Scheduled', interval: 'Interval' } as const;

export default function ProfileScreen() {
  const router = useRouter();
  const s = useSettingsStore();
  const { goalMl } = useHydration();
  const session = useSession();
  const progress = useProgress();
  const tier = useTier();
  const c = getCharacter(s.characterId);
  return (
    <Screen>
      <ScreenHeader title="Profile" />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
        <Mascot characterId={s.characterId} mood="awake" size={72} />
        <View style={{ flex: 1 }}>
          <Text variant="title">{s.name || 'Hydration friend'}</Text>
          <Text muted>{c.name} is your companion</Text>
          <Text muted>Goal: {formatVolume(goalMl, s.unitSystem)}</Text>
        </View>
      </Card>

      <Section title="Hydration">
        <SettingRow label="Daily goal" value={formatVolume(goalMl, s.unitSystem)} onPress={() => router.push('/settings/goal')} testID="row-goal" />
        <SettingRow label="Vessels" value={`${s.containers.length}`} onPress={() => router.push('/settings/vessels')} />
        <SettingRow label="Favorite drinks" onPress={() => router.push('/settings/drinks')} />
        <SettingRow label="Count hydration factor" hint="Off: every drink counts at full volume. On: coffee, soda etc. count slightly less (a rough estimate)." toggle={{ value: s.weighting, onChange: (weighting) => s.patch({ weighting }) }} />
      </Section>

      <Section title="Units & display">
        <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
          <Text bold>Units</Text>
          <Segmented value={s.unitSystem} onChange={(unitSystem) => s.patch({ unitSystem })} options={[{ value: 'metric', label: 'mL / L' }, { value: 'imperial', label: 'fl oz' }]} />
        </View>
        <SettingRow label="12-hour clock" toggle={{ value: s.hour12, onChange: (hour12) => s.patch({ hour12 }) }} />
      </Section>

      <Section title="Plink Premium">
        <SettingRow label="Subscription" value={tier === 'premium' ? 'Premium' : 'Free'} onPress={() => router.push({ pathname: '/paywall', params: { source: 'profile' } })} testID="row-subscription" />
        <SettingRow label="Appearance & themes" onPress={() => router.push('/settings/appearance')} testID="row-appearance" />
        <SettingRow label="Widgets" onPress={() => router.push('/settings/widgets')} testID="row-widgets" />
        <SettingRow label="Health integrations" onPress={() => router.push('/settings/health')} testID="row-health" />
      </Section>

      <Section title="Reminders">
        <SettingRow label="Reminders" value={s.reminders.enabled ? MODE_LABEL[s.reminders.mode] : 'Off'} onPress={() => router.push('/settings/reminders')} testID="row-reminders" />
      </Section>

      <Section title="Progress">
        <SettingRow label="Level & badges" value={`Level ${progress.level}`} onPress={() => router.push('/achievements')} testID="row-badges" />
        <SettingRow label="Companions & cosmetics" value={c.name} onPress={() => router.push('/characters')} testID="row-characters" />
      </Section>

      <Section title="Account & privacy">
        {session ? <SettingRow label="Signed in" value={session.user.email ?? ''} /> : <SettingRow label="Sign in or create account" hint={authService.available ? 'Back up and sync your drinks' : 'Cloud sync is not set up in this build'} onPress={() => router.push('/auth')} />}
        {session ? <SettingRow label="Sign out" onPress={() => authService.signOut()} /> : null}
        <SettingRow label="Privacy, export & delete data" onPress={() => router.push('/settings/data')} testID="row-data" />
        <SettingRow label="Help & about" onPress={() => router.push('/settings/about')} />
      </Section>
    </Screen>
  );
}
