import { View } from 'react-native';
import { CalendarDay, CalendarSpacer } from '@/components/CalendarDay';
import { Text } from '@/components/Text';
import { monthGrid, type DayKey } from '@/domain/dates';
import { dayStrength } from '@/domain/streaks';
import type { DailySummary, UnitSystem } from '@/domain/types';
import { percentOf } from '@/domain/progress';

const HEADS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
interface Props { year: number; month: number; summaries: Map<DayKey, DailySummary>; today: DayKey; selected: DayKey; onSelect: (d: DayKey) => void; unit: UnitSystem }

export function MonthCalendar({ year, month, summaries, today, selected, onSelect }: Props) {
  const cells = monthGrid(year, month);
  const rows: (DayKey | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return (
    <View>
      <View style={{ flexDirection: 'row' }}>{HEADS.map((h, i) => <Text key={i} variant="caption" muted center style={{ flex: 1 }}>{h}</Text>)}</View>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {r.map((d, ci) => {
            if (!d) return <CalendarSpacer key={ci} />;
            const s = summaries.get(d);
            const future = d > today;
            return (
              <CalendarDay key={d} day={Number(d.slice(8))} strength={future ? 'none' : dayStrength(s)} today={d === today} selected={d === selected} onPress={() => onSelect(d)}
                accessibilityLabel={`${d}${d === today ? ', today' : ''}: ${future ? 'upcoming' : s?.totalMl ? `${percentOf(s.totalMl, s.goalMl)} percent of goal${s.totalMl >= s.goalMl ? ', goal reached' : ''}` : 'nothing logged'}`} />
            );
          })}
        </View>
      ))}
      <Text variant="caption" muted style={{ marginTop: 8 }}>✓ goal reached · ◐ partial · stronger color = closer to goal</Text>
    </View>
  );
}
