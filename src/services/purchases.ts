import type { Plan, SubscriptionState } from '@/domain/entitlements';
import { useSubscriptionStore } from '@/store/subscriptionStore';

export interface Offering { plan: Plan; productId: string; priceLabel: string; perLabel: string; badge?: string }

/**
 * Billing boundary. A RevenueCat adapter (react-native-purchases, needs a development build) implements
 * this same interface and is registered with `registerPurchasesProvider`. No real payments exist yet.
 */
export interface PurchasesProvider {
  readonly name: string;
  /** True when no real money moves. The UI says so. */
  readonly sandbox: boolean;
  getOfferings(): Promise<Offering[]>;
  purchase(plan: Plan): Promise<SubscriptionState>;
  /** Returns the restored subscription, or null if none is found. */
  restore(): Promise<SubscriptionState | null>;
}

const DAY_MS = 86_400_000;
const PERIOD_DAYS: Record<Plan, number> = { monthly: 30, annual: 365 };

export function createSandboxPurchases(now: () => Date = () => new Date(), current: () => SubscriptionState = () => useSubscriptionStore.getState().sub): PurchasesProvider {
  return {
    name: 'sandbox', sandbox: true,
    async getOfferings() {
      return [
        { plan: 'monthly', productId: 'plink_premium_monthly', priceLabel: '$3.99', perLabel: 'per month' },
        { plan: 'annual', productId: 'plink_premium_annual', priceLabel: '$24.99', perLabel: 'per year', badge: 'Best value' },
      ];
    },
    async purchase(plan) {
      return { tier: 'premium', plan, sandbox: true, expiresAt: new Date(now().getTime() + PERIOD_DAYS[plan] * DAY_MS).toISOString() };
    },
    async restore() {
      const s = current();
      return s.tier === 'premium' ? s : null;
    },
  };
}

export const unavailablePurchases: PurchasesProvider = {
  name: 'unavailable', sandbox: false,
  async getOfferings() { return []; },
  async purchase() { throw new Error('Subscriptions are not available in this build yet.'); },
  async restore() { return null; },
};

let provider: PurchasesProvider = process.env.EXPO_PUBLIC_SANDBOX_PURCHASES === '1' ? createSandboxPurchases() : unavailablePurchases;

export const getPurchases = () => provider;
export const registerPurchasesProvider = (p: PurchasesProvider) => { provider = p; };

export type PurchaseOutcome = { ok: true; restored?: boolean } | { ok: false; message: string };

export async function buyPlan(plan: Plan, p: PurchasesProvider = provider): Promise<PurchaseOutcome> {
  try {
    useSubscriptionStore.getState().set(await p.purchase(plan));
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Purchase failed.' };
  }
}

export async function restorePurchases(p: PurchasesProvider = provider): Promise<PurchaseOutcome> {
  try {
    const restored = await p.restore();
    if (!restored) return { ok: false, message: 'No previous subscription found for this account.' };
    useSubscriptionStore.getState().set(restored);
    return { ok: true, restored: true };
  } catch {
    return { ok: false, message: 'Could not restore purchases. Check your connection and try again.' };
  }
}
