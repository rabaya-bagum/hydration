import { canAddCustomDrink, effectiveTier, FREE_CUSTOM_DRINK_LIMIT, hasFeature } from '@/domain/entitlements';
import { paletteFor, THEMES } from '@/content/themes';
import { buyPlan, createSandboxPurchases, restorePurchases, unavailablePurchases } from '@/services/purchases';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { CHARACTERS } from '@/content/characters';

const NOW = new Date('2024-06-01T00:00:00Z');

function luminance(hex: string) {
  const c = hex.replace('#', '').match(/../g)!.map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
}
const contrast = (a: string, b: string) => { const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m); return (x! + 0.05) / (y! + 0.05); };

describe('entitlements', () => {
  it('free vs premium features', () => {
    expect(hasFeature('free', 'advancedAnalytics')).toBe(false);
    expect(hasFeature('premium', 'advancedAnalytics')).toBe(true);
  });
  it('custom drink limit applies to free users only', () => {
    expect(canAddCustomDrink('free', FREE_CUSTOM_DRINK_LIMIT - 1)).toBe(true);
    expect(canAddCustomDrink('free', FREE_CUSTOM_DRINK_LIMIT)).toBe(false);
    expect(canAddCustomDrink('premium', 99)).toBe(true);
  });
  it('subscription lapses after expiry', () => {
    expect(effectiveTier({ tier: 'premium', expiresAt: '2024-06-02T00:00:00Z' }, NOW)).toBe('premium');
    expect(effectiveTier({ tier: 'premium', expiresAt: '2024-05-31T00:00:00Z' }, NOW)).toBe('free');
    expect(effectiveTier({ tier: 'free' }, NOW)).toBe('free');
  });
  it('keeps starter companions free', () => {
    expect(CHARACTERS.filter((c) => c.starter).every((c) => !c.premium)).toBe(true);
  });
});

describe('themes', () => {
  it('has a free default and premium extras', () => {
    expect(THEMES[0]!.premium).toBe(false);
    expect(THEMES.filter((t) => t.premium).length).toBeGreaterThanOrEqual(3);
  });
  it.each(THEMES.flatMap((t) => [[t.id, false], [t.id, true]] as [string, boolean][]))('%s (dark=%s) keeps readable accent contrast', (id, dark) => {
    const p = paletteFor(id, dark);
    expect(contrast(p.primary, p.surface)).toBeGreaterThanOrEqual(4.5); // accent text on cards
    expect(contrast(p.onPrimary, p.primary)).toBeGreaterThanOrEqual(4.5); // label on filled buttons
  });
});

describe('purchases', () => {
  beforeEach(() => useSubscriptionStore.getState().reset());
  it('sandbox purchase grants a dated premium plan', async () => {
    const p = createSandboxPurchases(() => NOW);
    expect(await buyPlan('annual', p)).toEqual({ ok: true });
    const s = useSubscriptionStore.getState().sub;
    expect(s).toMatchObject({ tier: 'premium', plan: 'annual', sandbox: true });
    expect(s.expiresAt).toBe('2025-06-01T00:00:00.000Z');
  });
  it('offers monthly and annual', async () => {
    expect((await createSandboxPurchases().getOfferings()).map((o) => o.plan)).toEqual(['monthly', 'annual']);
  });
  it('unavailable provider never grants premium and reports why', async () => {
    const r = await buyPlan('monthly', unavailablePurchases);
    expect(r).toMatchObject({ ok: false });
    expect(useSubscriptionStore.getState().sub.tier).toBe('free');
  });
  it('restore finds nothing, then finds an existing subscription', async () => {
    const p = createSandboxPurchases(() => NOW);
    expect(await restorePurchases(p)).toMatchObject({ ok: false });
    useSubscriptionStore.getState().set({ tier: 'premium', plan: 'monthly', expiresAt: '2030-01-01T00:00:00Z' });
    expect(await restorePurchases(p)).toEqual({ ok: true, restored: true });
  });
});
