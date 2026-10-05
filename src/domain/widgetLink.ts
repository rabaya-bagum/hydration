import type { Container } from './types';

export const WIDGET_LOG_COOLDOWN_MS = 10_000;

export type WidgetLogResult =
  | { ok: true; volumeMl: number; containerId: string }
  | { ok: false; reason: 'invalid' | 'not-a-vessel' | 'too-soon' };

/**
 * `plink://log?ml=250` can be opened by any app or web page, so it is deliberately narrow: it only logs
 * plain water, only in the exact size of one of the user's own vessels, and at most once per cooldown.
 */
export function resolveWidgetLog(rawMl: string | undefined, containers: Container[], lastLoggedAt: number | undefined, now: number): WidgetLogResult {
  if (!rawMl || !/^\d{1,5}$/.test(rawMl)) return { ok: false, reason: 'invalid' };
  const ml = Number(rawMl);
  if (ml <= 0) return { ok: false, reason: 'invalid' };
  const vessel = containers.find((c) => c.volumeMl === ml);
  if (!vessel) return { ok: false, reason: 'not-a-vessel' };
  if (lastLoggedAt !== undefined && now - lastLoggedAt < WIDGET_LOG_COOLDOWN_MS) return { ok: false, reason: 'too-soon' };
  return { ok: true, volumeMl: ml, containerId: vessel.id };
}
