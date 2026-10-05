import { darkPalette, lightPalette, type Palette } from '@/design/tokens';

export interface AppTheme {
  id: string;
  name: string;
  glyph: string;
  premium: boolean;
  light: Partial<Palette>;
  dark: Partial<Palette>;
}

/**
 * Themes only override accent and scene colors. Text/background pairs stay on the base palette,
 * so contrast is preserved (accent on white >= 4.5:1 for text use, checked in tests).
 */
export const THEMES: AppTheme[] = [
  { id: 'lagoon', name: 'Lagoon', glyph: '🌊', premium: false, light: {}, dark: {} },
  {
    id: 'sunset', name: 'Sunset', glyph: '🌇', premium: true,
    light: { primary: '#C2410C', primarySoft: '#FFE9DC', waterTop: '#FFA977', waterBottom: '#D9480F', skyTop: '#FFD9B8', skyBottom: '#FFF1E3' },
    dark: { primary: '#FF9B6B', onPrimary: '#2B1004', primarySoft: '#3B2217', waterTop: '#F08A5D', waterBottom: '#B5420F', skyTop: '#2E1C14', skyBottom: '#3A2519' },
  },
  {
    id: 'forest', name: 'Forest', glyph: '🌲', premium: true,
    light: { primary: '#1F7A4D', primarySoft: '#DDF3E6', waterTop: '#6FD0A0', waterBottom: '#1F7A4D', skyTop: '#D3EFD9', skyBottom: '#EEF9F0' },
    dark: { primary: '#5FD39A', onPrimary: '#052214', primarySoft: '#173326', waterTop: '#4BBF86', waterBottom: '#16694A', skyTop: '#112A1E', skyBottom: '#17382A' },
  },
  {
    id: 'orchid', name: 'Orchid', glyph: '🪻', premium: true,
    light: { primary: '#6D3FD8', primarySoft: '#ECE4FD', waterTop: '#B79BFF', waterBottom: '#6D3FD8', skyTop: '#E6DCFF', skyBottom: '#F6F1FF' },
    dark: { primary: '#B79BFF', onPrimary: '#150A33', primarySoft: '#2A1F4B', waterTop: '#9B7DF0', waterBottom: '#5A31BF', skyTop: '#1E1637', skyBottom: '#2A1F4B' },
  },
];

export type Appearance = 'system' | 'light' | 'dark';

export const getTheme = (id: string): AppTheme => THEMES.find((t) => t.id === id) ?? THEMES[0]!;

export function paletteFor(themeId: string, dark: boolean): Palette {
  const t = getTheme(themeId);
  return { ...(dark ? darkPalette : lightPalette), ...(dark ? t.dark : t.light) };
}
