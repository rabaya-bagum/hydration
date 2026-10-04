export interface Character {
  id: string;
  name: string;
  species: string;
  personality: string;
  description: string;
  body: string;
  accent: string;
  starter: boolean;
}

/** Original companions. Starters are free; the rest unlock via levels/milestones in Phase 2. */
export const CHARACTERS: Character[] = [
  { id: 'otto', name: 'Otto', species: 'River otter', personality: 'Upbeat and a little goofy', description: 'Loves tiny rituals and celebrates every sip.', body: '#9A6236', accent: '#F2D6B3', starter: true },
  { id: 'mossy', name: 'Mossy', species: 'Forest spirit', personality: 'Calm and steady', description: 'Grows a new leaf whenever you stay on track.', body: '#4FA36B', accent: '#CDEBC8', starter: true },
  { id: 'nimbo', name: 'Nimbo', species: 'Cloud creature', personality: 'Dreamy and gentle', description: 'Fluffs up happily when the day gets sunny.', body: '#DCE9F7', accent: '#FFFFFF', starter: true },
];

export const getCharacter = (id: string): Character => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0]!;
