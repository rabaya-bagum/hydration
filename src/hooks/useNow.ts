import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const TICK_MS = 30_000;

/** Current time, refreshed every 30s and on app foreground so midnight rollover updates "Today". */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && setNow(new Date()));
    return () => { clearInterval(id); sub.remove(); };
  }, []);
  return now;
}
