import { View } from 'react-native';
import { spacing } from '@/design/tokens';
import type { Progress } from '@/hooks/useProgress';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';

export function LevelCard({ p }: { p: Progress }) {
  return (
    <Card style={{ gap: spacing.sm }} accessible accessibilityLabel={`Level ${p.level}. ${p.xp} XP total. ${p.xpForNext ? `${p.xpForNext - p.xpIntoLevel} XP to level ${p.level + 1}.` : 'Max level.'}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text variant="h2">⭐ Level {p.level}</Text>
        <Text muted>{p.xp} XP</Text>
      </View>
      <ProgressBar value={p.progress} label={`Progress to level ${p.level + 1}`} />
      <Text variant="small" muted>{p.xpForNext ? `${p.xpForNext - p.xpIntoLevel} XP to level ${p.level + 1}` : 'You reached the top level!'}</Text>
    </Card>
  );
}
