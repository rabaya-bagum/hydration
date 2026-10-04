import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Celebration } from '@/components/Celebration';
import { Toast } from '@/components/Toast';
import { SplashView } from '@/features/today/SplashView';
import { useRewardSync } from '@/hooks/useRewardSync';
import { useReminderSync } from '@/hooks/useReminderSync';
import { useStoresHydrated } from '@/hooks/useStoresHydrated';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import { useTheme } from '@/design/theme';

function Background() {
  useSyncEngine();
  useReminderSync();
  useRewardSync();
  return null;
}

export default function RootLayout() {
  const [client] = useState(() => new QueryClient());
  const hydrated = useStoresHydrated();
  const { colors, dark } = useTheme();
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        {hydrated ? (
          <>
            <Background />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade_from_bottom', animationDuration: 250 }} />
            <Toast />
            <Celebration />
          </>
        ) : (
          <SplashView />
        )}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
