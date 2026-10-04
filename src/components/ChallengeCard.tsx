import { Pressable, View } from 'react-native';
import { radius, shadow, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import type { ChallengeDef, ChallengeStatus } from '@/domain/challenges';
import { ArtTile } from './ArtTile';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';

export type ChallengeState = 'new' | 'active' | 'done' | 'ended';
interface Props { def: ChallengeDef; state: ChallengeState; status?: ChallengeStatus; onPress: () => void; color: string; compact?: boolean }

export const STATE_LABEL: Record<ChallengeState, string> = { new: 'Not started', active: 'In progress', done: '✓ Completed', ended: 'Fresh start available' };

export function challengeState(run: { completedOn?: string } | undefined, status: ChallengeStatus | undefined): ChallengeState {
  if (!run) return 'new';
  if (run.completedOn) return 'done';
  return status?.expired ? 'ended' : 'active';
}

/** Artwork, title, description, duration, progress, reward and state in one tappable card. */
export function ChallengeCard({ def, state, status, onPress, color, compact }: Props) {
  const { colors } = useTheme();
  const progress = state === 'done' ? def.targetDays : status?.progress ?? 0;
  const label = `${def.title}. ${def.description} ${def.windowDays} day window. ${STATE_LABEL[state]}. ${progress} of ${def.targetDays} days. Reward ${def.rewardXp} XP.`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} testID={`challenge-${def.id}`}
      style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, minHeight: touch.large }, shadow.card]}>
      <ArtTile glyph={def.glyph} color={color} size={compact ? 56 : 72} />
      <View style={{ flex: 1, gap: spacing.xs }}>
        <Text bold variant="title">{def.title}</Text>
        {!compact ? <Text variant="small" muted>{def.description}</Text> : null}
        <ProgressBar value={progress / def.targetDays} label={`${progress} of ${def.targetDays} days`} color={state === 'done' ? colors.success : color} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" muted>{progress}/{def.targetDays} days · {def.windowDays}-day window</Text>
          <Text variant="caption" bold color={state === 'done' ? colors.success : colors.textMuted}>{state === 'new' ? `+${def.rewardXp} XP` : STATE_LABEL[state]}</Text>
        </View>
      </View>
    </Pressable>
  );
}
