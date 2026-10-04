import { isUnlocked, type UnlockState } from '@/domain/unlocks';
import { CHARACTERS, COSMETICS } from './characters';

export interface UnlockedItem { id: string; name: string; kind: 'character' | 'accessory' | 'scene' }

/** Items that are locked in `before` and unlocked in `after`. */
export function newlyUnlocked(before: UnlockState, after: UnlockState): UnlockedItem[] {
  const out: UnlockedItem[] = [];
  for (const c of CHARACTERS) if (!isUnlocked(c.unlock, before) && isUnlocked(c.unlock, after)) out.push({ id: c.id, name: c.name, kind: 'character' });
  for (const c of COSMETICS) if (!isUnlocked(c.unlock, before) && isUnlocked(c.unlock, after)) out.push({ id: c.id, name: c.name, kind: c.kind });
  return out;
}
