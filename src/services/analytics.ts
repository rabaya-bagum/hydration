/**
 * Analytics abstraction. Props are restricted to coarse, non-sensitive values
 * (no raw volumes, weights, goals or timestamps of drinks).
 */
export type AnalyticsEvent =
  | 'onboarding_started' | 'onboarding_completed' | 'drink_logged' | 'drink_edited' | 'drink_deleted'
  | 'goal_changed' | 'goal_reached' | 'challenge_started' | 'challenge_completed' | 'streak_milestone'
  | 'reminder_enabled' | 'article_opened' | 'share_card_created' | 'paywall_viewed';

export type AnalyticsProps = Record<string, string | number | boolean>;

export interface AnalyticsSink { track(event: AnalyticsEvent, props?: AnalyticsProps): void }

const noop: AnalyticsSink = { track() {} };
let sink: AnalyticsSink = noop;

export const setAnalyticsSink = (s: AnalyticsSink) => { sink = s; };
export const analytics = { track: (e: AnalyticsEvent, p?: AnalyticsProps) => sink.track(e, p) };
