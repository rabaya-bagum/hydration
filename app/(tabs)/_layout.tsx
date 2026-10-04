import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/design/theme';
import { touch } from '@/design/tokens';

function TabIcon({ glyph, focused }: { glyph: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{glyph}</Text>;
}
const icon = (glyph: string) => function Icon({ focused }: { focused: boolean }) { return <TabIcon glyph={glyph} focused={focused} />; };

/** Today, History, Challenges, Learn, Profile. */
export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' }, tabBarAllowFontScaling: false,
        tabBarItemStyle: { paddingHorizontal: 0 }, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: touch.large + 8 + insets.bottom, paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today', tabBarIcon: icon('💧'), tabBarButtonTestID: 'tab-today' }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('📅'), tabBarButtonTestID: 'tab-history' }} />
      <Tabs.Screen name="challenges" options={{ title: 'Challenges', tabBarIcon: icon('🚩'), tabBarButtonTestID: 'tab-challenges' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarIcon: icon('📖'), tabBarButtonTestID: 'tab-learn' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('🙂'), tabBarButtonTestID: 'tab-profile' }} />
    </Tabs>
  );
}
