import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/data/supabase';
import { createSupabaseLogApi } from '@/data/supabaseRemote';
import { flushPending, pullRemote, type RemoteLogApi } from '@/data/sync';
import { useSession } from '@/services/auth';
import { useLogsStore } from '@/store/logsStore';
import { useUiStore } from '@/store/uiStore';

/** Tracks connectivity and, when signed in to a configured backend, syncs the offline queue. */
export function useSyncEngine() {
  const session = useSession();
  const pending = useLogsStore((s) => s.pendingSync.length);
  const online = useUiStore((s) => s.online);
  const setOnline = useUiStore((s) => s.setOnline);
  const setSyncing = useUiStore((s) => s.setSyncing);

  useEffect(() => NetInfo.addEventListener((s) => setOnline(s.isConnected !== false && s.isInternetReachable !== false)), [setOnline]);

  const userId = session?.user.id;
  useEffect(() => {
    if (!supabase || !userId || !online) return;
    const remote: RemoteLogApi = createSupabaseLogApi(supabase, userId);
    let cancelled = false;
    setSyncing(true);
    (async () => {
      try {
        await flushPending(remote);
        if (!cancelled) await pullRemote(remote);
      } catch {
        // stays queued; retried on next change or reconnect
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId, online, pending, setSyncing]);
}
