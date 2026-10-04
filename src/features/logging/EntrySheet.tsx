import { useState } from 'react';
import { View } from 'react-native';
import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { spacing } from '@/design/tokens';
import type { DrinkLog } from '@/domain/types';
import { analytics } from '@/services/analytics';
import { useLogsStore } from '@/store/logsStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';
import { DrinkForm } from './DrinkForm';
import { removeLogWithUndo } from './logActions';

/** Actions for an existing entry: edit (inline form), duplicate, delete (with undo toast). */
export function EntrySheet({ log, onClose }: { log?: DrinkLog; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const drinkTypes = useSettingsStore((s) => s.drinkTypes);
  if (!log) return null;
  const close = () => { setEditing(false); onClose(); };
  const name = drinkTypes.find((d) => d.id === log.drinkTypeId)?.name ?? 'Drink';

  return (
    <BottomSheet visible title={editing ? `Edit ${name}` : name} onClose={close}>
      {editing ? (
        <DrinkForm
          tz={log.tz} submitLabel="Save changes"
          initial={{ drinkTypeId: log.drinkTypeId, volumeMl: log.volumeMl, loggedAt: log.loggedAt, containerId: log.containerId }}
          onSubmit={(v) => {
            const factor = drinkTypes.find((d) => d.id === v.drinkTypeId)?.hydrationFactor ?? 1;
            useLogsStore.getState().updateLog(log.id, { drinkTypeId: v.drinkTypeId, volumeMl: v.volumeMl, hydrationMl: Math.round(v.volumeMl * factor), loggedAt: v.loggedAt, containerId: v.containerId });
            analytics.track('drink_edited');
            useUiStore.getState().showToast('Entry updated');
            close();
          }}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Button label="Edit" kind="secondary" icon="✎" onPress={() => setEditing(true)} testID="entry-edit" />
          <Button label="Duplicate" kind="secondary" icon="⧉" testID="entry-duplicate" onPress={() => { useLogsStore.getState().duplicateLog(log.id); useUiStore.getState().showToast('Added another one'); close(); }} />
          <Button label="Delete" kind="danger" icon="🗑" testID="entry-delete" onPress={() => { removeLogWithUndo(log.id); close(); }} />
        </View>
      )}
    </BottomSheet>
  );
}
