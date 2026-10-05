import { useColorScheme } from 'react-native';
import { getTheme, paletteFor } from '@/content/themes';
import { effectiveTier } from '@/domain/entitlements';
import { useSettingsStore } from '@/store/settingsStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import type { Palette } from './tokens';

/** Palette from the user's appearance + theme choice. A lapsed premium theme falls back to Lagoon. */
export function useTheme(): { colors: Palette; dark: boolean } {
  const system = useColorScheme();
  const appearance = useSettingsStore((s) => s.appearance);
  const themeId = useSettingsStore((s) => s.themeId);
  const sub = useSubscriptionStore((s) => s.sub);
  const dark = appearance === 'system' ? system === 'dark' : appearance === 'dark';
  const allowed = !getTheme(themeId).premium || effectiveTier(sub) === 'premium';
  return { colors: paletteFor(allowed ? themeId : 'lagoon', dark), dark };
}
