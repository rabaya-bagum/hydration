import { useState } from 'react';
import { Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { buildExport } from '@/data/exportData';
import { supabase } from '@/data/supabase';
import { spacing } from '@/design/tokens';
import { useLogsStore } from '@/store/logsStore';
import { useRewardsStore } from '@/store/rewardsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';

export default function DataSettings() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const exportData = async () => {
    try {
      const json = JSON.stringify(buildExport(useSettingsStore.getState(), useLogsStore.getState().logs, useRewardsStore.getState()), null, 2);
      await Share.share({ title: 'Plink data export', message: json });
    } catch {
      useUiStore.getState().showToast('Could not open the share sheet.');
    }
  };

  const deleteEverything = async () => {
    setBusy(true);
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { error } = await supabase.functions.invoke('delete-account');
        if (error) { setBusy(false); useUiStore.getState().showToast("Couldn't delete your cloud account. Nothing was removed."); return; }
        await supabase.auth.signOut();
      }
    }
    useLogsStore.getState().clear();
    useRewardsStore.getState().clear();
    useSettingsStore.getState().resetAll();
    setBusy(false);
    router.replace('/welcome');
  };

  return (
    <Screen>
      <ScreenHeader back title="Privacy & data" />
      <Card style={{ gap: spacing.sm }}>
        <Text variant="title">Your data is yours</Text>
        <Text muted>Drinks, goals and settings are stored on this device. If you sign in, they are also saved to your private cloud account, visible only to you. We don't sell data, and analytics never include your drink amounts, weight or goal.</Text>
        <Text muted>Notifications keep amounts off the lock screen unless you turn that on.</Text>
      </Card>
      <Card style={{ gap: spacing.md }}>
        <Text variant="title">Export</Text>
        <Text muted>Get a JSON copy of your settings and every drink you've logged.</Text>
        <Button label="Export my data" kind="secondary" onPress={exportData} testID="export-data" />
      </Card>
      <Card style={{ gap: spacing.md }}>
        <Text variant="title">Delete</Text>
        <Text muted>Removes all drinks and settings from this device and deletes your cloud account if you're signed in. This can't be undone.</Text>
        {confirming ? (
          <>
            <Text bold accessibilityLiveRegion="polite">Delete everything? This can't be undone.</Text>
            <Button label="Yes, delete everything" kind="danger" onPress={deleteEverything} loading={busy} testID="confirm-delete" />
            <Button label="Cancel" kind="ghost" onPress={() => setConfirming(false)} />
          </>
        ) : <Button label="Delete my data & account" kind="danger" onPress={() => setConfirming(true)} testID="delete-data" />}
      </Card>
    </Screen>
  );
}
