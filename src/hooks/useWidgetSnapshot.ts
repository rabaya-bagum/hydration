import { useEffect, useMemo, useRef } from 'react';
import { buildWidgetSnapshot, snapshotKey } from '@/domain/widgetSnapshot';
import { publishWidgetSnapshot } from '@/services/widgetBridge';
import { useSettingsStore } from '@/store/settingsStore';
import { useHydration } from './useHydration';

const DEBOUNCE_MS = 1000;

export function useWidgetSnapshotData() {
  const { summaries, today, goalMl, streak } = useHydration();
  const containers = useSettingsStore((s) => s.containers);
  const unit = useSettingsStore((s) => s.unitSystem);
  const characterId = useSettingsStore((s) => s.characterId);
  return useMemo(() => buildWidgetSnapshot({ summaries, today, goalMl, streak: streak.current, containers, unit, characterId }), [summaries, today, goalMl, streak.current, containers, unit, characterId]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Pushes a fresh snapshot to the registered widget bridge whenever what a widget shows changes. */
export function useWidgetPublisher() {
  const snapshot = useWidgetSnapshotData();
  const last = useRef<string>('');
  useEffect(() => {
    const key = snapshotKey(snapshot);
    if (key === last.current) return;
    const t = setTimeout(() => { last.current = key; publishWidgetSnapshot(snapshot).catch(() => { last.current = ''; }); }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [snapshot]);
}
