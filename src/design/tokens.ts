/** Single source of truth for visual constants. Screens must not hard-code colors, sizes or durations. */
export interface Palette {
  bg: string; surface: string; surfaceAlt: string; text: string; textMuted: string; border: string;
  primary: string; onPrimary: string; primarySoft: string;
  mint: string; sun: string; coral: string; lilac: string; danger: string; success: string;
  waterTop: string; waterBottom: string; skyTop: string; skyBottom: string; scrim: string;
}

export const lightPalette: Palette = {
  bg: '#F3F8FC', surface: '#FFFFFF', surfaceAlt: '#E7F0F8', text: '#102A43', textMuted: '#4F6479', border: '#D5E2EE',
  primary: '#1B6AD6', onPrimary: '#FFFFFF', primarySoft: '#E1EDFC',
  mint: '#17907A', sun: '#FFC857', coral: '#E4553F', lilac: '#6F5BEA', danger: '#C93B2B', success: '#12806A',
  waterTop: '#62C0FF', waterBottom: '#1B6AD6', skyTop: '#CFE9FB', skyBottom: '#EAF6FF', scrim: 'rgba(16,42,67,0.45)',
};

export const darkPalette: Palette = {
  bg: '#0A1520', surface: '#13232F', surfaceAlt: '#1B3040', text: '#EAF3FA', textMuted: '#A3B8C9', border: '#27414F',
  primary: '#6AAEFF', onPrimary: '#06182A', primarySoft: '#17324D',
  mint: '#4FD1B5', sun: '#FFD36E', coral: '#FF8A78', lilac: '#A599FF', danger: '#FF8A78', success: '#4FD1B5',
  waterTop: '#4FB4F5', waterBottom: '#1E5FC0', skyTop: '#12293A', skyBottom: '#183246', scrim: 'rgba(0,0,0,0.6)',
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;
export const fontSize = { caption: 12, small: 14, body: 16, title: 20, h2: 24, h1: 32, display: 48 } as const;
export const fontWeight = { regular: '400', medium: '500', semibold: '600', bold: '700', heavy: '800' } as const;
export const touch = { min: 44, large: 56 } as const;
export const motion = { fast: 150, base: 250, slow: 450, fill: 700, celebrate: 1600 } as const;

export const shadow = {
  card: { shadowColor: '#0B2540', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  button: { shadowColor: '#0B2540', shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
} as const;
