# Preparing and running a development build

A **development build** is your own app binary with `expo-dev-client` inside. It runs the real native modules (notifications, haptics, media library, clipboard) that Expo Go and the browser can't fully exercise, and loads JavaScript from your computer so you keep fast refresh.

## What is already prepared
| Area | State |
|---|---|
| Identity | `app.plink.hydration` (iOS bundle id + Android package), scheme `plink`, version `0.1.0`, build 1 / versionCode 1 |
| Assets | original icon, Android adaptive + themed icon, splash (light/dark), notification icon, favicon in `assets/` (regenerate with `npm run assets`) |
| Native config | `expo-dev-client`, splash, notifications (icon + accent), media library scoped to **save-only** |
| EAS | `eas.json` profiles: `development` (device), `development-simulator` (iOS simulator), `preview`, `production` |
| Checks | `npm run bundle:check` compiles the iOS + Android Hermes bundles; `npm run prebuild:check` generates both native projects in a scratch dir and asserts ids, URL scheme and permissions |
| CI | `.github/workflows/ci.yml` runs typecheck, lint, tests, bundle check and prebuild check; `dev-build.yml` is a manual cloud build (needs `EXPO_TOKEN`) |

Permissions requested (verified by `prebuild:check`): Android `INTERNET`, `VIBRATE`, notifications, and storage write for Android ≤ 12 only; iOS "add to photos" only. No camera, microphone, location, contacts or photo-library read. Health/Health Connect permissions are intentionally absent until the adapters exist.

Not verifiable from the cloud sandbox: `expo-doctor`'s two network checks (config schema, React Native Directory) were blocked; the other 19 checks passed. Re-run `npx expo-doctor` on your machine.

## One-time setup (you)
1. Accounts: [Expo](https://expo.dev), Apple Developer Program (iOS device builds), Google Play Console (only needed to publish, not to sideload a dev APK).
2. `npm i -g eas-cli && eas login`
3. From the repo: `eas init` (writes `extra.eas.projectId` into `app.json`; commit it) then `eas build:configure` if prompted.
4. Change the identifiers if `app.plink.hydration` isn't yours to use.
5. iOS devices: `eas device:create` to register each test phone's UDID; EAS creates provisioning profiles for you.

## Build and run
```bash
npm run build:dev:android     # installable .apk (internal distribution, QR link)
npm run build:dev:ios         # real iPhone (registered devices)
npm run build:dev:sim         # iOS simulator build (macOS)
npm run start:dev             # then open the installed "Plink" app and connect
```
Install the build from the EAS page link or QR code, run `npm run start:dev`, and open the app. The `development`/`preview` profiles set `EXPO_PUBLIC_SANDBOX_PURCHASES=1`, so the paywall works with fake purchases and no charge. **Never set this in `production`.**

Optional cloud sync: create a Supabase project, run `supabase/migrations/0001_init.sql`, deploy `supabase/functions/delete-account`, then store the public values as EAS environment variables (`eas env:create`) named `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Without them the app runs locally.

## First-device test checklist
Work top to bottom on one iPhone and one Android phone (ideally Android 13+).

**Core**
- [ ] Onboarding completes; goal editable; Today shows after.
- [ ] One-tap quick add updates the pond immediately; haptic feels right; Undo works.
- [ ] Edit, duplicate, delete; kill the app and reopen — data is still there.
- [ ] Airplane mode: log several drinks, re-enable network, nothing duplicates (needs Supabase configured to see sync).
- [ ] Midnight rollover and a time-zone change (Settings › Date & time) keep days sensible; try across a DST date if you can.

**Native-only features**
- [ ] Reminders: enable in onboarding or Profile › Reminders; permission prompt appears only on tap; notifications arrive at the planned times, stop after goal reached, respect quiet hours. Android 13+: confirm the notification permission dialog.
- [ ] Share card: **Share**, **Save image** (check it lands in Photos/Gallery — *Android 13/14 is the case to watch since permissions are save-only*), **Copy** (paste into Notes/Messages).
- [ ] Deep link quick-add: iOS `xcrun simctl openurl booted "plink://log?ml=250"`, Android `adb shell am start -a android.intent.action.VIEW -d "plink://log?ml=250"`. A size that isn't one of your vessels must be ignored.
- [ ] Appearance: system dark mode switches the app; splash shows correctly in light and dark; adaptive/themed icon looks right on Android.

**Accessibility**
- [ ] VoiceOver / TalkBack: hero announces "x of y, n percent"; quick-add buttons, timeline rows, chart bars and calendar days read sensibly; sheets trap focus.
- [ ] Largest system font size: no clipped quick-add tiles or tabs.
- [ ] Reduce Motion on: no looping animation, celebration is static.

**Performance**
- [ ] Today scrolls smoothly with the animated pond; no dropped frames when logging.

Report anything that fails with the device, OS version and a screenshot. The most likely first findings: the animated wave path on the pond, Android photo-save permission behaviour, and tab-bar label widths at large font sizes.

## Before a store release (not done)
- Real billing (RevenueCat adapter, store products) and remove sandbox purchases from every non-dev profile.
- Terms of service and privacy policy URLs (paywall, store listings, in-app About).
- Store privacy answers — what Plink does: stores drink logs, goal, optional name and profile on-device; optional account email and drink logs in Supabase if the user signs in; no ads, no third-party tracking, analytics are an interface with no vendor wired in. Apple "App Privacy" and Google "Data safety" must match whatever analytics/billing SDKs you add.
- Age rating questionnaire; health-wording review (the app states estimates are not medical advice).
- Screenshots (6.7" and 6.1" iPhone, 5.5" if needed, Android phone), store description, support URL.
- Native widgets and Health adapters (`docs/06-widgets-health-billing.md`), then add their permission strings.
- Increment `version` for each store release (`autoIncrement` handles build numbers in `production`).
