import type { WidgetSnapshot } from '@/domain/widgetSnapshot';

/**
 * Boundary to native home-screen widgets. A native module (iOS App Group via WidgetKit,
 * Android SharedPreferences via Glance) implements `publish` and is registered at startup.
 * Until then publishing is a no-op, so the app never depends on native widget code.
 */
export interface WidgetBridge { publish(snapshot: WidgetSnapshot): Promise<void> }

let bridge: WidgetBridge | null = null;
export const registerWidgetBridge = (b: WidgetBridge | null) => { bridge = b; };
export const hasWidgetBridge = () => bridge !== null;
export const publishWidgetSnapshot = (s: WidgetSnapshot) => (bridge ? bridge.publish(s) : Promise.resolve());
