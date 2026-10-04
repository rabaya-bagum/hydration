import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { IconButton } from '@/components/IconButton';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { StatCard } from '@/components/StatCard';
import { Text } from '@/components/Text';
import { spacing } from '@/design/tokens';
import { Breakdown } from '@/features/history/Breakdown';
import { MonthCalendar } from '@/features/history/MonthCalendar';
import { WeekChart } from '@/features/history/WeekChart';
import { EntrySheet } from '@/features/logging/EntrySheet';
import { Timeline } from '@/features/today/Timeline';
import { useHydration } from '@/hooks/useHydration';
import { rangeStats, weekSummary } from '@/domain/analytics';
import { addDays, dayKey, formatClock, formatDayLabel, startOfWeek, type DayKey } from '@/domain/dates';
import { percentOf } from '@/domain/progress';
import type { DrinkLog } from '@/domain/types';
import { formatVolume } from '@/domain/units';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';

type Mode = 'day' | 'week' | 'month';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function shiftMonth(day: DayKey, delta: number): DayKey {
  const [y, m] = day.split('-').map(Number) as [number, number];
  const idx = y * 12 + (m - 1) + delta;
  return `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}-01`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { today, tz, summaries, streak, goalMl } = useHydration();
  const unit = useSettingsStore((s) => s.unitSystem);
  const hour12 = useSettingsStore((s) => s.hour12);
  const logs = useLogsStore((s) => s.logs);
  const [mode, setMode] = useState<Mode>('week');
  const [selected, setSelected] = useState<DayKey>(today);
  const [entry, setEntry] = useState<DrinkLog | undefined>();

  const hasAny = logs.some((l) => !l.deletedAt);
  const weekStart = startOfWeek(selected);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const [y, m] = selected.split('-').map(Number) as [number, number];
  const monthDays = useMemo(() => {
    const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Array.from({ length: n }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
  }, [y, m]);

  const rangeDays = (mode === 'month' ? monthDays : weekDays).filter((d) => d <= today);
  const stats = useMemo(() => rangeStats(summaries, rangeDays, tz), [summaries, rangeDays, tz]);
  const dayLogs = useMemo(() => logs.filter((l) => !l.deletedAt && dayKey(l.loggedAt, l.tz) === selected).sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)), [logs, selected]);
  const daySummary = summaries.get(selected);
  const dayGoal = daySummary?.goalMl ?? goalMl;

  const step = (dir: -1 | 1) => {
    const next = mode === 'day' ? addDays(selected, dir) : mode === 'week' ? addDays(selected, dir * 7) : shiftMonth(selected, dir);
    if (dir === 1 && startOfWeek(next) > today && mode !== 'month') return;
    if (dir === 1 && mode === 'month' && next > today) return;
    setSelected(next > today ? today : next);
  };
  const atEnd = mode === 'day' ? selected >= today : mode === 'week' ? addDays(weekStart, 7) > today : shiftMonth(selected, 1) > today;

  const title = mode === 'day' ? (selected === today ? 'Today' : formatDayLabel(selected)) : mode === 'week' ? `${formatDayLabel(weekDays[0]!)} – ${formatDayLabel(weekDays[6]!)}` : `${MONTHS[m - 1]} ${y}`;
  const avgTime = stats.avgGoalReachedMinute !== undefined
    ? formatClock(new Date(Date.UTC(2000, 0, 1, 0, stats.avgGoalReachedMinute)).toISOString(), 'UTC', hour12)
    : '—';

  if (!hasAny) {
    return (
      <Screen>
        <ScreenHeader title="History" />
        <Card><EmptyState title="Your first sip will appear here." body="Log a drink and your days, weeks and months will start to fill in." actionLabel="Log a drink" onAction={() => router.push('/today')} /></Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="History" />
      <Segmented<Mode> value={mode} onChange={(v) => { setMode(v); }} options={[{ value: 'day', label: 'Daily' }, { value: 'week', label: 'Weekly' }, { value: 'month', label: 'Monthly' }]} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton glyph="‹" label={`Previous ${mode}`} onPress={() => step(-1)} filled />
        <Text variant="title" accessibilityLiveRegion="polite">{title}</Text>
        <View style={{ opacity: atEnd ? 0.3 : 1 }}><IconButton glyph="›" label={`Next ${mode}`} onPress={() => !atEnd && step(1)} filled /></View>
      </View>

      {mode === 'day' ? (
        <>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <ProgressRing value={(daySummary?.totalMl ?? 0) / dayGoal} size={88} stroke={10} label={`${percentOf(daySummary?.totalMl ?? 0, dayGoal)} percent of daily goal`} />
            <View style={{ flex: 1 }}>
              <Text variant="h2">{formatVolume(daySummary?.totalMl ?? 0, unit)}</Text>
              <Text muted>of {formatVolume(dayGoal, unit)} goal</Text>
              {daySummary && daySummary.totalMl >= dayGoal ? <Text bold color="#12806A">✓ Goal reached</Text> : null}
            </View>
          </Card>
          <Timeline logs={dayLogs} onSelect={setEntry} emptyTitle="Nothing logged this day." emptyBody="Fresh start whenever you're ready." />
        </>
      ) : (
        <>
          <Card style={{ gap: spacing.md }}>
            {mode === 'week'
              ? <WeekChart days={weekDays} summaries={summaries} goalMl={goalMl} unit={unit} today={today} onSelect={(d) => { setSelected(d); setMode('day'); }} />
              : <MonthCalendar year={y} month={m} summaries={summaries} today={today} selected={selected} onSelect={(d) => { setSelected(d); setMode('day'); }} unit={unit} />}
            <Text bold>{mode === 'week' ? weekSummary(stats) : `You hit your goal ${stats.daysReached} of ${stats.days} days so far this month.`}</Text>
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
            <StatCard label="Average intake" value={formatVolume(stats.avgMl, unit)} hint="per day" />
            <StatCard label="Goal completion" value={`${Math.round(stats.completionRate * 100)}%`} hint={`${stats.daysReached} of ${stats.days} days`} />
            <StatCard label="Current streak" value={`${streak.current} day${streak.current === 1 ? '' : 's'}`} glyph="🔥" />
            <StatCard label="Longest streak" value={`${streak.longest} day${streak.longest === 1 ? '' : 's'}`} />
            <StatCard label="Avg goal time" value={avgTime} hint="when goal was reached" />
          </View>
          {stats.byDrink.length ? (
            <Card style={{ gap: spacing.md }}>
              <Text variant="title" accessibilityRole="header">What you drank</Text>
              <Breakdown stats={stats} unit={unit} />
            </Card>
          ) : null}
        </>
      )}
      <EntrySheet log={entry} onClose={() => setEntry(undefined)} />
    </Screen>
  );
}
