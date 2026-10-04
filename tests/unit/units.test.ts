import { flOzToMl, formatVolume, mlToFlOz, parseVolumeInput, splitVolume, spokenVolume } from '@/domain/units';

describe('units', () => {
  it('converts mL <-> fl oz', () => {
    expect(mlToFlOz(29.5735)).toBeCloseTo(1, 5);
    expect(flOzToMl(8)).toBe(237);
    expect(flOzToMl(mlToFlOz(500))).toBe(500);
  });
  it('formats metric', () => {
    expect(formatVolume(350, 'metric')).toBe('350 mL');
    expect(formatVolume(1650, 'metric')).toBe('1.65 L');
    expect(formatVolume(1000, 'metric')).toBe('1 L');
  });
  it('formats imperial', () => {
    expect(formatVolume(250, 'imperial')).toBe('8.5 fl oz');
    expect(formatVolume(100, 'imperial')).toBe('3.4 fl oz');
  });
  it('splits hero values', () => {
    expect(splitVolume(0, 'metric')).toEqual({ value: '0', unit: 'L' });
    expect(splitVolume(1400, 'metric')).toEqual({ value: '1.4', unit: 'L' });
    expect(splitVolume(2000, 'imperial')).toEqual({ value: '68', unit: 'fl oz' });
  });
  it('parses input in active unit', () => {
    expect(parseVolumeInput('330', 'metric')).toBe(330);
    expect(parseVolumeInput('12', 'imperial')).toBe(355);
    expect(parseVolumeInput('abc', 'metric')).toBeNull();
    expect(parseVolumeInput('-5', 'metric')).toBeNull();
  });
  it('speaks volumes', () => {
    expect(spokenVolume(1400, 'metric')).toBe('1.4 litres');
  });
});
