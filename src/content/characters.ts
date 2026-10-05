import type { UnlockRule } from '@/domain/unlocks';

export interface Character {
  id: string;
  name: string;
  species: string;
  personality: string;
  description: string;
  body: string;
  accent: string;
  starter: boolean;
  unlock: UnlockRule;
  rare?: boolean;
  premium?: boolean;
}

/** Original companions. Starters are free; the rest unlock through levels and streaks. */
export const CHARACTERS: Character[] = [
  { id: 'otto', name: 'Otto', species: 'River otter', personality: 'Upbeat and a little goofy', description: 'Loves tiny rituals and celebrates every sip.', body: '#9A6236', accent: '#F2D6B3', starter: true, unlock: { kind: 'starter' } },
  { id: 'mossy', name: 'Mossy', species: 'Forest spirit', personality: 'Calm and steady', description: 'Grows a new leaf whenever you stay on track.', body: '#4FA36B', accent: '#CDEBC8', starter: true, unlock: { kind: 'starter' } },
  { id: 'nimbo', name: 'Nimbo', species: 'Cloud creature', personality: 'Dreamy and gentle', description: 'Fluffs up happily when the day gets sunny.', body: '#DCE9F7', accent: '#FFFFFF', starter: true, unlock: { kind: 'starter' } },
  { id: 'pixel', name: 'Pixel', species: 'Tiny robot', personality: 'Curious and precise', description: 'Counts every sip and beeps when you hit your goal.', body: '#8FA4B8', accent: '#DDE7F0', starter: false, unlock: { kind: 'level', level: 5 } },
  { id: 'koi', name: 'Koi', species: 'Pond koi', personality: 'Serene and wise', description: 'Glides through long streaks with quiet confidence.', body: '#F28C3A', accent: '#FFE2C2', starter: false, unlock: { kind: 'streak', days: 14 }, premium: true },
  { id: 'bubbles', name: 'Bubbles', species: 'Rare water sprite', personality: 'Sparkly and bold', description: 'A rare sprite that only visits dedicated hydrators.', body: '#8E7CF8', accent: '#E3DEFF', starter: false, unlock: { kind: 'level', level: 10 }, rare: true, premium: true },
];

export const getCharacter = (id: string): Character => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]!;

export interface Cosmetic { id: string; name: string; glyph: string; unlock: UnlockRule; kind: 'accessory' | 'scene' }

/** Cosmetics: an accessory at level 3, a crown for a 30-day streak, and a sunset scene at level 8. */
export const COSMETICS: Cosmetic[] = [
  { id: 'none', name: 'No accessory', glyph: '·', unlock: { kind: 'starter' }, kind: 'accessory' },
  { id: 'bow', name: 'Bow tie', glyph: '🎀', unlock: { kind: 'level', level: 3 }, kind: 'accessory' },
  { id: 'crown', name: 'Streak crown', glyph: '👑', unlock: { kind: 'streak', days: 30 }, kind: 'accessory' },
  { id: 'day', name: 'Sunny pond', glyph: '☀️', unlock: { kind: 'starter' }, kind: 'scene' },
  { id: 'sunset', name: 'Sunset pond', glyph: '🌇', unlock: { kind: 'level', level: 8 }, kind: 'scene' },
];
