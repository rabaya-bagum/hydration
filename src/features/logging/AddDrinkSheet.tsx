import { BottomSheet } from '@/components/BottomSheet';
import { DrinkForm } from './DrinkForm';
import { logDrink } from './logActions';

export function AddDrinkSheet({ visible, tz, onClose }: { visible: boolean; tz: string; onClose: () => void }) {
  if (!visible) return null;
  return (
    <BottomSheet visible title="Add a drink" onClose={onClose}>
      <DrinkForm tz={tz} submitLabel="Log drink" onSubmit={(v) => { logDrink({ ...v, source: 'manual' }); onClose(); }} />
    </BottomSheet>
  );
}
