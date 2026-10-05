import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { useTheme } from '@/design/theme';
import { radius, spacing, touch } from '@/design/tokens';
import { FEATURE_LABEL, type Plan } from '@/domain/entitlements';
import { analytics } from '@/services/analytics';
import { buyPlan, getPurchases, restorePurchases, type Offering } from '@/services/purchases';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscriptionStore, useTier } from '@/store/subscriptionStore';

const FREE_FOREVER = ['Unlimited drink logging', 'Daily goal & reminders', 'History, streaks & badges', 'Starter companions & basic challenges', 'Export your data as JSON'];

export default function Paywall() {
  const { source } = useLocalSearchParams<{ source?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const tier = useTier();
  const sub = useSubscriptionStore((s) => s.sub);
  const characterId = useSettingsStore((s) => s.characterId);
  const provider = getPurchases();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [plan, setPlan] = useState<Plan>('annual');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => { analytics.track('paywall_viewed', { source: String(source ?? 'unknown') }); }, [source]);
  useEffect(() => { provider.getOfferings().then(setOfferings).catch(() => setOfferings([])); }, [provider]);

  const subscribe = async () => {
    setBusy(true);
    const r = await buyPlan(plan);
    setBusy(false);
    setMessage(r.ok ? undefined : r.message);
  };
  const restore = async () => {
    setBusy(true);
    const r = await restorePurchases();
    setBusy(false);
    setMessage(r.ok ? 'Purchases restored.' : r.message);
  };

  if (tier === 'premium') {
    return (
      <Screen>
        <ScreenHeader back title="Plink Premium" />
        <Card style={{ alignItems: 'center', gap: spacing.md }}>
          <Mascot characterId={characterId} mood="cheer" size={110} />
          <Text variant="h2">You're Premium 🎉</Text>
          <Text muted center>{sub.plan === 'annual' ? 'Annual' : 'Monthly'} plan{sub.expiresAt ? ` · renews or ends ${sub.expiresAt.slice(0, 10)}` : ''}{sub.sandbox ? ' · sandbox (no charge)' : ''}</Text>
        </Card>
        <Button label="Done" onPress={() => router.back()} />
        {sub.sandbox ? <Button label="End sandbox subscription" kind="ghost" onPress={() => useSubscriptionStore.getState().reset()} testID="end-sandbox" /> : null}
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader back title="Plink Premium" subtitle="More ways to enjoy the habit." />
      <Card style={{ alignItems: 'center', gap: spacing.sm }}>
        <Mascot characterId={characterId} mood="cheer" size={96} />
        <Text variant="title" center>Unlock everything Plink can do</Text>
      </Card>
      <Card style={{ gap: spacing.sm }}>
        {Object.values(FEATURE_LABEL).map((l) => <Text key={l}>✨ {l}</Text>)}
      </Card>
      <Card flat style={{ gap: spacing.xs }}>
        <Text variant="small" bold>Always free</Text>
        {FREE_FOREVER.map((l) => <Text key={l} variant="small" muted>✓ {l}</Text>)}
      </Card>

      {offerings.length ? (
        <View accessibilityRole="radiogroup" style={{ gap: spacing.sm }}>
          {offerings.map((o) => {
            const sel = o.plan === plan;
            return (
              <Pressable key={o.plan} testID={`plan-${o.plan}`} accessibilityRole="radio" accessibilityState={{ selected: sel }} accessibilityLabel={`${o.plan === 'annual' ? 'Annual' : 'Monthly'} plan, ${o.priceLabel} ${o.perLabel}${o.badge ? `, ${o.badge}` : ''}`}
                onPress={() => setPlan(o.plan)}
                style={{ minHeight: touch.large + 8, flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.surface }}>
                <View style={{ flex: 1 }}>
                  <Text bold>{sel ? '✓ ' : ''}{o.plan === 'annual' ? 'Annual' : 'Monthly'}</Text>
                  {o.badge ? <Text variant="caption" bold color={colors.success}>{o.badge}</Text> : null}
                </View>
                <View style={{ alignItems: 'flex-end' }}><Text bold variant="title">{o.priceLabel}</Text><Text variant="caption" muted>{o.perLabel}</Text></View>
              </Pressable>
            );
          })}
          <Button label="Start Premium" onPress={subscribe} loading={busy} testID="subscribe" />
          {provider.sandbox ? <Text variant="caption" muted center>Sandbox build: sample prices, no payment is taken.</Text> : null}
        </View>
      ) : (
        <Card flat><Text bold>Premium isn't available in this build yet.</Text><Text muted>Everything essential stays free, and nothing here charges you.</Text></Card>
      )}
      {message ? <Text accessibilityLiveRegion="polite" muted center>{message}</Text> : null}
      <Button label="Restore purchases" kind="secondary" onPress={restore} disabled={busy} testID="restore" />
      <Button label="Not now" kind="ghost" onPress={() => router.back()} testID="not-now" />
      <Text variant="caption" muted center>Subscriptions renew until cancelled in your store account. Terms and privacy policy links go here before launch.</Text>
    </Screen>
  );
}
