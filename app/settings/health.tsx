import { useEffect, useState } from 'react';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Section } from '@/components/Section';
import { SettingRow } from '@/components/SettingRow';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { getHealthProvider } from '@/services/health';
import { useSettingsStore } from '@/store/settingsStore';

export default function HealthSettings() {
  const enabled = useSettingsStore((s) => s.healthSync);
  const patch = useSettingsStore((s) => s.patch);
  const [available, setAvailable] = useState<boolean | undefined>();
  const [note, setNote] = useState<string | undefined>();
  useEffect(() => { getHealthProvider().isAvailable().then(setAvailable).catch(() => setAvailable(false)); }, []);

  const toggle = async (on: boolean) => {
    if (!on) { patch({ healthSync: false }); return; }
    const ok = await getHealthProvider().requestAuthorization().catch(() => false);
    patch({ healthSync: ok });
    setNote(ok ? undefined : 'Permission was not granted. You can allow it in your phone’s Health settings.');
  };

  return (
    <Screen>
      <ScreenHeader back title="Health integrations" />
      <Card style={{ gap: spacing.xs }}>
        <Text bold>Apple Health & Health Connect</Text>
        <Text muted>When on, Plink writes your plain water entries to your phone's Health app. Plink never reads your health data, and other drinks are not shared.</Text>
      </Card>
      {available === false ? (
        <Card flat><Text bold>Not available in this build</Text><Text variant="small" muted>Health integration needs a native development build on iOS or Android. Your drinks are unaffected.</Text></Card>
      ) : (
        <Section><SettingRow label="Write water to Health" toggle={{ value: enabled, onChange: toggle }} /></Section>
      )}
      {note ? <Text muted accessibilityLiveRegion="polite">{note}</Text> : null}
    </Screen>
  );
}
