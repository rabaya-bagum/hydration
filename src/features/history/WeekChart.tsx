import { Pressable, View } from 'react-native';
import { Text } from '@/components/Text';
import { useTheme } from '@/design/theme';
import { radius, spacing } from '@/design/tokens';
import { weekdayIndex, type DayKey } from '@/domain/dates';
import type { DailySummary, UnitSystem } from '@/domain/types';
import { spokenVolume } from '@/domain/units';

const NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_AREA = 140;

interface Props { days: DayKey[]; summaries: Map<DayKey, DailySummary>; goalMl: number; unit: UnitSystem; today: DayKey; onSelect: (d: DayKey) => void }

/** 7 bars + dashed goal line. Each bar is labelled for screen readers; goal-met days also get a ✓ (not color-only). */
export function WeekChart({ days, summaries, goalMl, unit, today, onSelect }: Props) {
  const { colors } = useTheme();
  const max = Math.max(goalMl, ...days.map((d) => summaries.get(d)?.totalMl ?? 0)) * 1.1;
  const goalY = (goalMl / max) * BAR_AREA;
  return (
    <View accessibilityRole="summary" style={{ gap: spacing.sm }}>
      <View style={{ height: BAR_AREA, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
        {days.map((d) => {
          const s = summaries.get(d);
          const total = s?.totalMl ?? 0;
          const goal = s?.goalMl ?? goalMl;
          const reached = total >= goal && total > 0;
          const h = Math.max((total / max) * BAR_AREA, total ? 6 : 2);
          const future = d > today;
          return (
            <Pressable key={d} onPress={() => onSelect(d)} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: BAR_AREA }}
              accessibilityRole="button" accessibilityHint="Opens this day"
              accessibilityLabel={`${NAMES[weekdayIndex(d)]}: ${future ? 'upcoming' : total ? `${spokenVolume(total, unit)}, ${Math.round((total / goal) * 100)} percent of goal${reached ? ', goal reached' : ''}` : 'nothing logged'}`}
            >
              {reached ? <Text variant="caption" color={colors.success}>✓</Text> : null}
              <View style={{ width: '100%', height: h, borderRadius: radius.sm, backgroundColor: reached ? colors.primary : colors.primarySoft, borderWidth: reached ? 0 : 1.5, borderColor: colors.primary, opacity: future ? 0.3 : 1 }} />
            </Pressable>
          );
        })}
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: goalY, borderTopWidth: 2, borderStyle: 'dashed', borderColor: colors.coral }} />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {days.map((d) => <Text key={d} variant="caption" center muted={d !== today} bold={d === today} style={{ flex: 1 }}>{NAMES[weekdayIndex(d)]}</Text>)}
      </View>
      <Text variant="caption" muted>- - - Goal line · ✓ goal reached</Text>
    </View>
  );
}
