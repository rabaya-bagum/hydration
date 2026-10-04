import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Section } from '@/components/Section';
import { Segmented } from '@/components/Segmented';
import { SettingRow } from '@/components/SettingRow';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { formatMinutes } from '@/domain/dates';
import { fromMinutes, planReminders, REMINDER_LIMITS, toMinutes, type ReminderMode } from '@/domain/reminders';
import { useHydration } from '@/hooks/useHydration';
import { analytics } from '@/services/analytics';
import { notificationsSupported, requestPermission } from '@/services/notifications';
import { useSettingsStore } from '@/store/settingsStore';

const STEP = 30;
const wrap = (m: number) => (m + 1440) % 1440;

export default function ReminderSettings() {
  const r = useSettingsStore((s) => s.reminders);
  const patch = useSettingsStore((s) => s.patchReminders);
  const hour12 = useSettingsStore((s) => s.hour12);
  const { goalMl, todaySummary, today } = useHydration();
  const [note, setNote] = useState<string | undefined>();
  const fmt = (hhmm: string) => formatMinutes(toMinutes(hhmm), hour12);
  const preview = useMemo(() => planReminders({ ...r, enabled: true }, { day: today, nowMin: null, consumedMl: todaySummary.totalMl, goalMl }), [r, today, todaySummary.totalMl, goalMl]);

  const toggle = async (on: boolean) => {
    if (!on) { patch({ enabled: false }); return; }
    if (!notificationsSupported) { setNote('Reminders work on iOS and Android devices.'); return; }
    const ok = await requestPermission();
    patch({ enabled: ok });
    if (ok) analytics.track('reminder_enabled');
    setNote(ok ? undefined : 'Notifications are blocked. Enable them in your phone settings to get reminders.');
  };
  const shiftTime = (key: 'wake' | 'bed' | 'quietStart' | 'quietEnd', d: number) => patch({ [key]: fromMinutes(wrap(toMinutes(r[key]) + d)) });

  return (
    <Screen>
      <ScreenHeader back title="Reminders" />
      <Section>
        <SettingRow label="Enable reminders" toggle={{ value: r.enabled, onChange: toggle }} />
      </Section>
      {note ? <Text muted accessibilityLiveRegion="polite">{note}</Text> : null}
      {r.enabled ? (
        <>
          <Card style={{ gap: spacing.md }}>
            <Text variant="title">Style</Text>
            <Segmented<ReminderMode> value={r.mode} onChange={(mode) => patch({ mode })} options={[{ value: 'smart', label: 'Smart' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'interval', label: 'Interval' }]} />
            <Text variant="small" muted>
              {r.mode === 'smart' ? 'We space reminders between wake-up and bedtime based on what is left to drink.' : r.mode === 'scheduled' ? 'Reminders at the exact times you choose.' : 'A reminder every set number of minutes while you are awake.'}
            </Text>
            {r.mode === 'interval' ? <Stepper label="interval" value={`${r.intervalMinutes} min`} onDec={() => patch({ intervalMinutes: Math.max(REMINDER_LIMITS.minGapMinutes, r.intervalMinutes - 15) })} onInc={() => patch({ intervalMinutes: Math.min(240, r.intervalMinutes + 15) })} /> : null}
            {r.mode === 'scheduled' ? (
              <View style={{ gap: spacing.sm }}>
                {r.scheduledTimes.map((t, idx) => (
                  <Stepper key={idx} label={`reminder ${idx + 1} time`} value={fmt(t)} onDec={() => patch({ scheduledTimes: r.scheduledTimes.map((x, j) => (j === idx ? fromMinutes(wrap(toMinutes(x) - STEP)) : x)) })} onInc={() => patch({ scheduledTimes: r.scheduledTimes.map((x, j) => (j === idx ? fromMinutes(wrap(toMinutes(x) + STEP)) : x)) })} />
                ))}
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <SettingRow label="Add a time" onPress={() => r.scheduledTimes.length < REMINDER_LIMITS.maxPerDay && patch({ scheduledTimes: [...r.scheduledTimes, '14:00'] })} />
                  {r.scheduledTimes.length > 1 ? <SettingRow label="Remove last" onPress={() => patch({ scheduledTimes: r.scheduledTimes.slice(0, -1) })} /> : null}
                </View>
              </View>
            ) : null}
          </Card>
          <Card style={{ gap: spacing.md }}>
            <Text variant="title">Your day</Text>
            <Text variant="small" bold muted>Wake time</Text>
            <Stepper label="wake time" value={fmt(r.wake)} onDec={() => shiftTime('wake', -STEP)} onInc={() => shiftTime('wake', STEP)} />
            <Text variant="small" bold muted>Bedtime</Text>
            <Stepper label="bedtime" value={fmt(r.bed)} onDec={() => shiftTime('bed', -STEP)} onInc={() => shiftTime('bed', STEP)} />
            <Text variant="small" bold muted>Quiet hours start</Text>
            <Stepper label="quiet hours start" value={fmt(r.quietStart)} onDec={() => shiftTime('quietStart', -STEP)} onInc={() => shiftTime('quietStart', STEP)} />
            <Text variant="small" bold muted>Quiet hours end</Text>
            <Stepper label="quiet hours end" value={fmt(r.quietEnd)} onDec={() => shiftTime('quietEnd', -STEP)} onInc={() => shiftTime('quietEnd', STEP)} />
          </Card>
          <Section title="Limits & privacy">
            <View style={{ paddingVertical: spacing.md, gap: spacing.sm }}>
              <Text bold>Max reminders per day</Text>
              <Stepper label="max reminders per day" value={`${r.maxPerDay}`} onDec={() => patch({ maxPerDay: Math.max(1, r.maxPerDay - 1) })} onInc={() => patch({ maxPerDay: Math.min(REMINDER_LIMITS.maxPerDay, r.maxPerDay + 1) })} />
            </View>
            <SettingRow label="Weekdays only" toggle={{ value: r.weekdaysOnly, onChange: (weekdaysOnly) => patch({ weekdaysOnly }) }} />
            <SettingRow label="Skip once goal is reached" toggle={{ value: r.skipWhenGoalReached, onChange: (skipWhenGoalReached) => patch({ skipWhenGoalReached }) }} />
            <SettingRow label="Show amounts in notifications" hint="Off keeps your numbers off the lock screen." toggle={{ value: r.showAmounts, onChange: (showAmounts) => patch({ showAmounts }) }} />
          </Section>
          <Card flat>
            <Text variant="small" bold>Today's plan</Text>
            <Text variant="small" muted>{preview.length ? preview.map((m) => formatMinutes(m, hour12)).join(' · ') : 'No more reminders today.'}</Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
