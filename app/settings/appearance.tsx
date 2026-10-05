import { Pressable, View } from 'react-native';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { THEMES, paletteFor, type Appearance } from '@/content/themes';
import { useTheme } from '@/design/theme';
import { radius, spacing, touch } from '@/design/tokens';
import { usePremium } from '@/hooks/usePremium';
import { useSettingsStore } from '@/store/settingsStore';

export default function AppearanceSettings() {
  const { dark, colors } = useTheme();
  const { premium, gate } = usePremium();
  const appearance = useSettingsStore((s) => s.appearance);
  const themeId = useSettingsStore((s) => s.themeId);
  const patch = useSettingsStore((s) => s.patch);
  return (
    <Screen>
      <ScreenHeader back title="Appearance" />
      <Card style={{ gap: spacing.md }}>
        <Text variant="title">Mode</Text>
        <Segmented<Appearance> value={appearance} onChange={(v) => patch({ appearance: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
      </Card>
      <View style={{ gap: spacing.md }} accessibilityRole="radiogroup">
        <Text variant="title" accessibilityRole="header">Theme</Text>
        {THEMES.map((t) => {
          const p = paletteFor(t.id, dark);
          const locked = t.premium && !premium;
          const sel = themeId === t.id && !locked;
          return (
            <Pressable key={t.id} testID={`theme-${t.id}`} accessibilityRole="radio" accessibilityState={{ selected: sel }}
              accessibilityLabel={`${t.name} theme${t.premium ? ', premium' : ''}${locked ? ', locked' : ''}`}
              onPress={() => { if (locked) { gate('theme'); return; } patch({ themeId: t.id }); }}
              style={{ minHeight: touch.large, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: sel ? colors.primary : colors.border, backgroundColor: colors.surface }}>
              <View style={{ flexDirection: 'row' }}>
                {[p.waterTop, p.primary, p.skyTop].map((c, i) => <View key={i} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, marginLeft: i ? -8 : 0, borderWidth: 2, borderColor: colors.surface }} />)}
              </View>
              <Text bold style={{ flex: 1 }}>{t.glyph} {t.name}</Text>
              <Text variant="small" bold color={locked ? colors.textMuted : colors.primary}>{sel ? '✓ Selected' : locked ? '🔒 Premium' : t.premium ? 'Premium' : 'Free'}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
