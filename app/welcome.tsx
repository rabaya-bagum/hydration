import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Mascot } from '@/components/Mascot';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { APP_NAME, TAGLINE } from '@/content/brand';
import { spacing } from '@/design/tokens';

export default function Welcome() {
  const router = useRouter();
  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: spacing.lg }}>
        <Mascot characterId="otto" mood="awake" size={160} />
        <Text variant="h1" center accessibilityRole="header">{APP_NAME}</Text>
        <Text variant="title" center>Make drinking enough a little game you actually enjoy.</Text>
        <Text muted center>{TAGLINE}</Text>
      </View>
      <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
        <Button label="Get started" onPress={() => router.push('/onboarding')} testID="get-started" />
        <Button label="I already have an account" kind="ghost" onPress={() => router.push('/auth')} />
      </View>
    </Screen>
  );
}
