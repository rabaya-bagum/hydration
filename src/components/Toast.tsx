import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, shadow, spacing, touch } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { useUiStore } from '@/store/uiStore';
import { Text } from './Text';

const DURATION_MS = 4000;

/** Non-blocking feedback. Announced via accessibilityLiveRegion; auto-dismisses. */
export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, DURATION_MS);
    return () => clearTimeout(t);
  }, [toast, hide]);
  if (!toast) return null;
  return (
    <Animated.View
      key={toast.id} entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(150)}
      accessibilityLiveRegion="polite" accessibilityRole="alert"
      style={[styles.wrap, shadow.button, { bottom: insets.bottom + 88, backgroundColor: colors.text }]}
    >
      <Text color={colors.bg} bold style={{ flex: 1 }}>{toast.message}</Text>
      {toast.actionLabel ? (
        <Pressable accessibilityRole="button" accessibilityLabel={toast.actionLabel} onPress={() => { toast.onAction?.(); hide(); }} style={styles.action}>
          <Text color={colors.sun} bold>{toast.actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, borderRadius: radius.md, paddingLeft: spacing.lg, paddingRight: spacing.sm, minHeight: touch.min, flexDirection: 'row', alignItems: 'center', alignSelf: 'center', maxWidth: 560 },
  action: { minHeight: touch.min, minWidth: touch.min, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
});
