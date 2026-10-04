# Technical architecture

## Stack
Expo (SDK 57) · React Native · TypeScript (strict) · Expo Router · Zustand (+persist) · TanStack Query (server state, Phase 1 wiring for auth/sync) · Supabase (auth, Postgres, RLS, storage, edge fns) · Reanimated · `react-native-svg` · expo-notifications · expo-haptics · AsyncStorage · Zod.
Tradeoff note: the brief's stack is retained. Local persistence uses Zustand `persist` on AsyncStorage (simple, adequate for a day's logs and a few months of history; SQLite is the upgrade path behind the same `LogRepository` interface).

## Layering (UI ⟂ logic ⟂ backend)
```
app/            Expo Router routes (thin: compose components + hooks)
src/design/     tokens, theme, a11y helpers
src/components/ reusable UI (no business logic)
src/features/   feature modules: hooks + feature components
src/domain/     PURE TS: goal, units, streaks, summaries, messages, reminders, challenges (unit-tested)
src/data/       repositories (interfaces) + local/supabase impls, sync queue
src/store/      zustand stores (settings, profile, logs, reminders, ui)
src/services/   analytics, notifications, haptics, health(stub), purchases(stub)
src/content/    seeded articles, characters, challenges, achievements
supabase/       migrations (schema + RLS), seed
tests/          unit + integration
```
Rules: `domain/` imports nothing from RN. Screens never talk to Supabase directly; they use hooks → store/repositories.

## Offline-first logging
Source of truth on device: `logsStore` (persisted). `addLog` writes locally with client UUID + timestamps, enqueues `{op:'upsert'|'delete', id}` in `syncQueue`. `SyncEngine.flush(remote)` drains the queue when online, upserting by `id` (idempotent), last-writer-wins on `updated_at`; deletes are soft (`deleted_at`) so they sync reliably. Remote is a `RemoteLogApi` interface (Supabase impl + in-memory fake for tests).

## Goal engine
`src/domain/hydrationGoal.ts` (a.k.a. hydrationGoalService): `calculateGoal(input, config=GOAL_CONFIG)` → `{ baselineMl, adjustments[], totalMl }`. Weight-based baseline (≈33 mL/kg), adjustments for activity, climate, exercise frequency, caffeine; clamped to `[min,max]`. All constants exported. Not medical advice.

## Reminders
`domain/reminders.ts` pure planner: given prefs + now + consumed + goal returns the list of trigger times (rate-limited, quiet hours, weekday/weekend, skip if goal reached). `services/notifications.ts` applies the plan via expo-notifications (reschedule on changes/app foreground). Messages rotated from a bank.

## Analytics / Health / Purchases
Interfaces + no-op/console implementations (`analytics.track(event, props)` with an allow-listed, non-sensitive prop type). Health + RevenueCat are stubbed behind interfaces for Phase 3.

## Widgets (design for Phase 3)
Widget reads a small JSON snapshot `{dayKey, consumedMl, goalMl, streak, quickAddsMl[], trend7[], character}` written by `services/widgetSnapshot.ts` to a shared App Group / SharedPreferences location. Native widgets (WidgetKit / Glance) render from it; quick-add deep-links `plink://log?ml=350`. Expo doesn't ship widgets in managed workflow → requires config plugin / dev client; deferred.

## Testing
Jest (jest-expo) for domain + stores + sync; React Native Testing Library for key UI flows; edge-case suites (DST, midnight, tz change, duplicates, unit conversion, mid-day goal change).
