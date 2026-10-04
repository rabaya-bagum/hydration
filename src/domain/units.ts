import type { UnitSystem } from './types';

export const ML_PER_FL_OZ = 29.5735;
export const KG_PER_LB = 0.45359237;

export const mlToFlOz = (ml: number) => ml / ML_PER_FL_OZ;
export const flOzToMl = (oz: number) => Math.round(oz * ML_PER_FL_OZ);
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

const trim = (n: number, digits: number) => String(Number(n.toFixed(digits)));

/** Compact volume for chips and lists: "350 mL", "1.65 L", "12 fl oz". */
export function formatVolume(ml: number, system: UnitSystem): string {
  if (system === 'imperial') return `${trim(mlToFlOz(ml), mlToFlOz(ml) < 10 ? 1 : 0)} fl oz`;
  return ml >= 1000 ? `${trim(ml / 1000, 2)} L` : `${Math.round(ml)} mL`;
}

/** Big-number split for hero display: { value: "1.65", unit: "L" }. */
export function splitVolume(ml: number, system: UnitSystem): { value: string; unit: string } {
  if (system === 'imperial') return { value: trim(mlToFlOz(ml), 0), unit: 'fl oz' };
  return ml >= 1000 || ml === 0
    ? { value: trim(ml / 1000, 2), unit: 'L' }
    : { value: String(Math.round(ml)), unit: 'mL' };
}

/** Spoken form for screen readers. */
export function spokenVolume(ml: number, system: UnitSystem): string {
  if (system === 'imperial') return `${Math.round(mlToFlOz(ml))} fluid ounces`;
  return ml >= 1000 ? `${trim(ml / 1000, 2)} litres` : `${Math.round(ml)} millilitres`;
}

/** Parse a user-typed amount in the active unit into mL. Returns null if invalid. */
export function parseVolumeInput(text: string, system: UnitSystem): number | null {
  const n = Number(text.replace(',', '.').trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return system === 'imperial' ? flOzToMl(n) : Math.round(n);
}

export const formatWeight = (kg: number, system: UnitSystem) =>
  system === 'imperial' ? `${Math.round(kgToLb(kg))} lb` : `${Math.round(kg)} kg`;
