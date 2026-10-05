# Native integrations: widgets, Health, billing

Everything below the app-side boundary needs a **development build** (not Expo Go) and a physical device or simulator. The app-side contracts are implemented and tested; the native adapters are the remaining work.

## 1. Home-screen widgets
**Data contract** — `src/domain/widgetSnapshot.ts`, built by `useWidgetPublisher` and handed to `services/widgetBridge.ts`:
`{ version, day, consumedMl, goalMl, percent, remainingMl, streak, quickAdd[{ml,label,url}], trend[7], characterId, unit, updatedAt }`. No name, email or per-drink history.

| Size | Content |
|---|---|
| Small (2×2) | progress ring + percent, `consumed / goal` |
| Medium (4×2) | small + streak + one quick-add button |
| Large (4×4, premium) | medium + three quick-add buttons + 7-day trend bars + companion |

Live previews of each layout: Profile › Widgets (`src/components/WidgetPreview.tsx`).

**Quick-add** opens `plink://log?ml=<n>` (handled by `app/log.tsx`). It logs plain water only, only for a size that exactly matches one of the user's vessels, with a 10 s cooldown (`src/domain/widgetLink.ts`, unit-tested) because any app or web page can open the URL.

**Native steps**
1. iOS: add a WidgetKit extension (e.g. via an Expo config plugin such as `expo-apple-targets`), share an **App Group**, write the snapshot JSON to the group container from a native module registered with `registerWidgetBridge`, call `WidgetCenter.shared.reloadAllTimelines()`. Render with SwiftUI; use `Link(destination:)` for quick-add.
2. Android: a Glance (Jetpack Compose) `AppWidget` reading the snapshot from `SharedPreferences`; `actionStartActivity` with the deep link; `GlanceAppWidget.updateAll` after publish.
3. Large widget: check the `subscription` flag in the snapshot or hide the entry point for free users.

## 2. Apple Health / Health Connect
Contract: `services/health.ts` (`HealthProvider`) + `domain/healthSync.ts`. The app **only writes** water volume (plain water and infused water) and never reads health data. Exported ids are tracked in `healthStore`, so sync is idempotent and edits/deletes propagate.

Native steps: implement `HealthProvider` with `react-native-health` (iOS, `dietaryWater`) and `react-native-health-connect` (Android, `Hydration` record), add their config plugins and the permission strings, then `registerHealthProvider(adapter)` at startup. The Settings screen already shows an honest "not available" state until then.

## 3. Subscriptions
Contract: `services/purchases.ts` (`PurchasesProvider`) and `domain/entitlements.ts`. No real payments exist. A sandbox provider is only enabled with `EXPO_PUBLIC_SANDBOX_PURCHASES=1` (used by `npm run e2e`); otherwise the paywall says Premium is unavailable and nothing grants entitlement.

RevenueCat steps: install `react-native-purchases`, create entitlement `premium` with monthly and annual products, implement the interface (`getOfferings`, `purchase`, `restore`) and `registerPurchasesProvider`. Mirror status server-side through a RevenueCat webhook into `subscription_status` (the table is select-only for clients, so users cannot grant themselves premium).

**Gating rules** (`FEATURE_LABEL` in entitlements): premium = advanced analytics, Koi and Bubbles companions, extra themes, >2 custom drinks, scheduled/interval reminders, 3 extra challenges, large widget, CSV export. Always free: logging, goals, basic reminders, history, streaks, badges, starter companions, JSON export of your own data. Started or completed premium challenges remain usable if a plan lapses.
