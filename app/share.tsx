import { useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { SettingRow } from '@/components/SettingRow';
import { ShareCard } from '@/components/ShareCard';
import { Text } from '@/components/Text';
import { getChallenge } from '@/content/challenges';
import { spacing } from '@/design/tokens';
import { rangeStats } from '@/domain/analytics';
import { percentOf } from '@/domain/progress';
import { buildShareContent, type ShareKind } from '@/domain/shareCards';
import { useHydration } from '@/hooks/useHydration';
import { analytics } from '@/services/analytics';
import { copyCard, saveCard, shareCard, type ActionResult } from '@/services/shareImage';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function ShareScreen() {
  const { kind, id, month } = useLocalSearchParams<{ kind?: ShareKind; id?: string; month?: string }>();
  const { today, tz, summaries, streak, todaySummary } = useHydration();
  const streakDays = streak.current;
  const name = useSettingsStore((s) => s.name);
  const unit = useSettingsStore((s) => s.unitSystem);
  const ref = useRef<View>(null);
  const [includeName, setIncludeName] = useState(false);
  const [includeAmounts, setIncludeAmounts] = useState(false);
  const [busy, setBusy] = useState(false);
  const k: ShareKind = kind ?? 'daily';

  const content = useMemo(() => {
    const base = { kind: k, unit, name, includeName, includeAmounts };
    if (k === 'streak') return buildShareContent({ ...base, streakDays });
    if (k === 'challenge') return buildShareContent({ ...base, challengeTitle: getChallenge(String(id))?.title });
    if (k === 'month') {
      const [y, m] = (month ?? today.slice(0, 7)).split('-').map(Number) as [number, number];
      const days = Array.from({ length: new Date(Date.UTC(y, m, 0)).getUTCDate() }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`).filter((d) => d <= today);
      const st = rangeStats(summaries, days, tz);
      return buildShareContent({ ...base, monthLabel: MONTHS[m - 1], goalDays: st.daysReached, trackedDays: st.days, avgMl: st.avgMl });
    }
    return buildShareContent({ ...base, percent: percentOf(todaySummary.totalMl, todaySummary.goalMl), totalMl: todaySummary.totalMl, goalMl: todaySummary.goalMl });
  }, [k, unit, name, includeName, includeAmounts, streakDays, id, month, today, summaries, tz, todaySummary]);

  const run = async (fn: typeof shareCard) => {
    setBusy(true);
    const r: ActionResult = await fn(ref);
    setBusy(false);
    if (r.ok) analytics.track('share_card_created', { kind: k });
    useUiStore.getState().showToast(r.message);
  };

  return (
    <Screen>
      <ScreenHeader back title="Share" subtitle="Your card only includes what you choose." />
      <View style={{ alignItems: 'center' }}><ShareCard ref={ref} content={content} /></View>
      <Card style={{ paddingVertical: spacing.xs }}>
        {name.trim() ? <SettingRow label="Include my name" toggle={{ value: includeName, onChange: setIncludeName }} /> : null}
        <SettingRow label="Show amounts" hint="Off by default. Percentages and streaks only." toggle={{ value: includeAmounts, onChange: setIncludeAmounts }} />
      </Card>
      <View style={{ gap: spacing.sm }}>
        <Button label="Share" onPress={() => run(shareCard)} loading={busy} testID="share-card" />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button label="Save image" kind="secondary" onPress={() => run(saveCard)} disabled={busy} style={{ flex: 1 }} testID="save-card" />
          <Button label="Copy" kind="secondary" onPress={() => run(copyCard)} disabled={busy} style={{ flex: 1 }} testID="copy-card" />
        </View>
      </View>
      <Text variant="caption" muted center>Weight, goal settings and drink times are never included.</Text>
    </Screen>
  );
}
