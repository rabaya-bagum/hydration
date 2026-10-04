import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius, spacing } from '@/design/tokens';
import { useTheme } from '@/design/theme';
import { Text } from './Text';

interface Props { visible: boolean; title: string; onClose: () => void; children: React.ReactNode }

export function BottomSheet({ visible, title, onClose, children }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <Pressable accessibilityLabel="Close" accessibilityRole="button" style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]} onPress={onClose} />
      <View style={{ flex: 1, justifyContent: 'flex-end', pointerEvents: 'box-none' }}>
        <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '88%', paddingBottom: insets.bottom + spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginTop: spacing.sm }} />
          <Text variant="title" style={{ padding: spacing.lg }} accessibilityRole="header">{title}</Text>
          <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}
