import { ScrollView, View } from 'react-native';
import { Card } from '@/components/Card';
import { PremiumTeaser } from '@/components/PremiumTeaser';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { WidgetPreview } from '@/components/WidgetPreview';
import { spacing } from '@/design/tokens';
import { useWidgetSnapshotData } from '@/hooks/useWidgetSnapshot';
import { usePremium } from '@/hooks/usePremium';
import { hasWidgetBridge } from '@/services/widgetBridge';

export default function WidgetSettings() {
  const snap = useWidgetSnapshotData();
  const { premium, gate } = usePremium();
  return (
    <Screen>
      <ScreenHeader back title="Widgets" subtitle="Home-screen widgets" />
      <Card flat style={{ gap: spacing.xs }}>
        <Text bold>{hasWidgetBridge() ? 'Widgets are connected.' : 'Native widgets need a development build.'}</Text>
        <Text variant="small" muted>
          {hasWidgetBridge()
            ? 'Add Plink from your home screen widget gallery.'
            : 'Below is exactly what they will show. Plink already prepares the data they read, and quick-add links like plink://log?ml=250 work today.'}
        </Text>
      </Card>
      <Text variant="title" accessibilityRole="header">Small</Text>
      <WidgetPreview size="small" snap={snap} />
      <Text variant="title" accessibilityRole="header">Medium</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}><WidgetPreview size="medium" snap={snap} /></ScrollView>
      <Text variant="title" accessibilityRole="header">Large</Text>
      {premium ? <ScrollView horizontal showsHorizontalScrollIndicator={false}><WidgetPreview size="large" snap={snap} /></ScrollView>
        : <PremiumTeaser title="Large widget" body="Progress, quick-add buttons, a 7-day trend and your companion on your home screen." onPress={() => gate('widget-large')} />}
      <View><Text variant="caption" muted>Widgets only show percentages, totals and your streak. No name or drink history.</Text></View>
    </Screen>
  );
}
