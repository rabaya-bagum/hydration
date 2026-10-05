# Plink — hydration, played as a daily game

Small sips, big streaks. An original, offline-first hydration tracker built with Expo, React Native and TypeScript.

- Product spec: [`docs/01-product-spec.md`](docs/01-product-spec.md)
- Architecture: [`docs/02-technical-architecture.md`](docs/02-technical-architecture.md)
- Design system: [`docs/03-design-system.md`](docs/03-design-system.md)
- Database (Supabase, RLS): [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
- Roadmap & honest status: [`docs/05-roadmap.md`](docs/05-roadmap.md)
- Widgets, Health and billing (native steps): [`docs/06-widgets-health-billing.md`](docs/06-widgets-health-billing.md)

## Run
```bash
npm install
npx expo start            # scan with Expo Go / run a simulator
```
Optional cloud sync: copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`, then apply `supabase/migrations`. Without them the app runs fully locally.

## Quality checks
```bash
npm run typecheck   # tsc --noEmit (strict)
npm run lint
npm test            # domain, store and sync tests (Node)
npm run e2e         # exports the web build and drives it in Chromium (onboarding → log → edit → history)
```

## Layout
```
app/            Expo Router routes (thin)
src/domain/     pure logic: goal, units, dates, progress, streaks, reminders, analytics
src/data/       sync queue, Supabase client + remote, export
src/store/      zustand stores (persisted)
src/components/ design-system components
src/features/   screen-level building blocks
src/design/     tokens, theme, a11y hooks
```
Hydration goals are a general wellness estimate, not medical advice.
