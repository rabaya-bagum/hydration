import { useEffect, useRef } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { resolveWidgetLog } from '@/domain/widgetLink';
import { logDrink } from '@/features/logging/logActions';
import { useSettingsStore } from '@/store/settingsStore';
import { useUiStore } from '@/store/uiStore';

let lastWidgetLogAt: number | undefined;

/** Target of `plink://log?ml=250` (home-screen widget quick-add). Validated narrowly, then redirects to Today. */
export default function LogLink() {
  const { ml } = useLocalSearchParams<{ ml?: string }>();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const r = resolveWidgetLog(ml, useSettingsStore.getState().containers, lastWidgetLogAt, Date.now());
    if (r.ok) { lastWidgetLogAt = Date.now(); logDrink({ drinkTypeId: 'water', volumeMl: r.volumeMl, containerId: r.containerId, source: 'widget' }); }
    else if (r.reason === 'not-a-vessel') useUiStore.getState().showToast("That size isn't one of your vessels, so nothing was logged.");
  }, [ml]);
  return <Redirect href="/today" />;
}
