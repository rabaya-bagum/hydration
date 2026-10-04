import Constants from 'expo-constants';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { APP_NAME, TAGLINE, WELLNESS_DISCLAIMER } from '@/content/brand';
import { spacing } from '@/design/tokens';

export default function About() {
  return (
    <Screen>
      <ScreenHeader back title="Help & about" />
      <Card style={{ gap: spacing.sm }}>
        <Text variant="title">{APP_NAME}</Text>
        <Text muted>{TAGLINE}</Text>
        <Text variant="small" muted>Version {Constants.expoConfig?.version ?? '0.1.0'}</Text>
      </Card>
      <Card style={{ gap: spacing.sm }}>
        <Text variant="title">How it works</Text>
        <Text muted>Tap a quick-add button on Today to log a drink. Tap any entry to edit, duplicate or delete it. History shows your days, weeks and months. Your streak counts days you reach your goal; a missed day just starts a fresh run.</Text>
      </Card>
      <Card style={{ gap: spacing.sm }}>
        <Text variant="title">A note on health</Text>
        <Text muted>{WELLNESS_DISCLAIMER}</Text>
        <Text muted>More water isn't always better. Drink to thirst and your goal, and speak with a health professional about anything specific to you.</Text>
      </Card>
    </Screen>
  );
}
