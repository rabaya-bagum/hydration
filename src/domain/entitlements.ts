export type Tier = 'free' | 'premium';

/**
 * Premium features. Core logging, goals, basic reminders, history, streaks and the starter
 * companions are NEVER gated. Basic JSON export of your own data is also always free.
 */
export type Feature =
  | 'advancedAnalytics'
  | 'premiumCompanions'
  | 'premiumThemes'
  | 'unlimitedCustomDrinks'
  | 'advancedReminders'
  | 'extraChallenges'
  | 'largeWidget'
  | 'csvExport';

export const FEATURE_LABEL: Record<Feature, string> = {
  advancedAnalytics: 'Advanced analytics',
  premiumCompanions: 'Expanded companion collection',
  premiumThemes: 'Premium themes',
  unlimitedCustomDrinks: 'Unlimited custom drinks',
  advancedReminders: 'Scheduled & interval reminders',
  extraChallenges: 'Extra challenges',
  largeWidget: 'Large home-screen widget',
  csvExport: 'CSV data export',
};

export const FREE_CUSTOM_DRINK_LIMIT = 2;

export const hasFeature = (tier: Tier, _feature: Feature): boolean => tier === 'premium';

export const canAddCustomDrink = (tier: Tier, existingCustom: number): boolean =>
  tier === 'premium' || existingCustom < FREE_CUSTOM_DRINK_LIMIT;

export type Plan = 'monthly' | 'annual';

export interface SubscriptionState { tier: Tier; plan?: Plan; expiresAt?: string; sandbox?: boolean }

/** Active when premium and not past its expiry (no expiry = lifetime/sandbox). */
export function effectiveTier(s: SubscriptionState, now = new Date()): Tier {
  if (s.tier !== 'premium') return 'free';
  return !s.expiresAt || new Date(s.expiresAt).getTime() > now.getTime() ? 'premium' : 'free';
}
