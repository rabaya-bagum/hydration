# Plink — Product Spec (PRD, journeys, IA, screens)

> Working brand. "Plink" = the sound of a drop landing. Tagline: **"Small sips, big streaks."**

## 1. Vision & differentiation
Hydration as a calm daily game. Differentiators vs. category: (1) an **original living-pond ecosystem** that fills with life as you hydrate (not a bottle/liquid-only gauge); (2) **never guilt-driven** copy and no loss-aversion streak mechanics (streak "rests", never "breaks in shame"); (3) **safety-minded** — progress above goal is shown neutrally, never encouraged; (4) 1-tap logging, offline-first.

## 2. Brand
- **Name:** Plink. Alternates considered: Sipwell, Dewdle, Tidely, Brooklet.
- **Mascot:** *Otto*, a cheerful river otter (hydration-adjacent, playful, not a llama). Personality: upbeat, a bit goofy, loves tiny rituals, celebrates quietly when you're behind and loudly only at goal.
- **Starter companions:** Otto (otter, free), Mossy (forest spirit, free), Nimbo (cloud, free). Unlockables: Pixel (tiny robot), Koi (aquatic), Bubbles (rare, level 10) etc.
- **Icon concept:** rounded-square aqua gradient with a single white droplet whose highlight forms an otter's smile.
- **Palette (5 primary):** Lagoon `#1E88E5`-family aqua-blue, Mint `#2EC4A6`, Sun `#FFC857`, Coral `#FF7A6B`, Lilac `#8E7CF8`. Neutrals: ink `#102A43` → mist `#F4F8FB`.
- **Type:** rounded display (Nunito-like, system rounded fallback) for numbers/titles; system sans for body. Hierarchy in `src/design/tokens.ts`.
- **Illustration direction:** flat shapes, soft shadows, 2-tone fills, round terminals. Rendered as `react-native-svg` components (no raster assets, no third-party art).
- **Voice:** encouraging, clever, light. Say "350 mL to go", "Fresh start tomorrow". Never "failed"/"didn't drink enough".

## 3. Feature map & MVP vs V2
| Area | Phase 1 (MVP) | Phase 2 | Phase 3 |
|---|---|---|---|
| Auth | Supabase email auth abstraction + guest/local mode | — | — |
| Onboarding | 10-step flow, skippable | — | — |
| Goal engine | baseline + activity/climate/exercise adj., clamps | weather adj. | — |
| Today | hero pond, quick add, drink types, timeline, edit/delete/duplicate/undo | challenge card | widgets |
| Logging | favorites, custom amount, time, offline queue | — | HealthKit abstraction |
| History | day/week/month, calendar, avg, completion | richer analytics | — |
| Reminders | smart/scheduled/interval, quiet hours, rate limit | — | — |
| Retention | — | streaks, achievements, XP, challenges, characters, Learn | — |
| Growth | — | — | widgets, share cards, health, paywall |

## 4. Main user journey
Install → Welcome → profile → activity → climate → lifestyle → goal result (editable) → vessels → reminders (contextual permission) → companion → celebration → **Today** → tap `+350 mL` (1 tap) → pond animates + toast → History next day.

## 5. Information architecture
Bottom tabs: **Today · History · Challenges · Learn · Profile**. Stack routes: `welcome`, `onboarding/*`, `add-drink` (sheet), `edit-drink/[id]`, `challenge/[id]`, `article/[id]`, `achievements`, `characters`, `settings/*`, `paywall`, `share`.

## 6. Screen inventory
Each: purpose → hierarchy → states (loading/empty/error/offline) → a11y.
1. **Splash** — brand moment while store hydrates. Logo + droplet; reduce-motion = static.
2. **Welcome** — one-sentence benefit, CTA "Get started", "I have an account".
3. **Onboarding profile / lifestyle** — chips & steppers, "Prefer not to say" everywhere sensible.
4. **Goal result** — big number, −/+ editing, disclaimer "general wellness estimate, not medical advice", factor breakdown.
5. **Reminder setup** — mode picker, wake/bed times, permission request on tap only.
6. **Today** — header (greeting, streak, profile), HydrationHero (pond + ring-text), context message, quick-add row, drink-type chips, timeline, challenge card.
7. **Add drink sheet** — drink, amount, vessel, time; recents.
8. **History/Daily** — day list with entries; empty "Your first sip will appear here."
9. **Weekly stats** — Mon–Sun bars + goal line, summaries.
10. **Challenges / 11. Detail** — cards with progress/reward.
12. **Learn / 13. Article** — ≥12 seeded articles, bookmarks.
14. **Achievements / 15. Characters** — collection grid.
16. **Profile / 17. Settings** — goal, units, vessels, drinks, reminders, appearance, health, privacy, export, delete account, subscription, help, about.
18. **Paywall** — placeholder (Phase 3).

Wireframes (Today): see `docs/03-design-system.md`.

## 7. Acceptance criteria (MVP) — from the brief
Onboarding completes; personalised goal; goal editable; ≤2 taps to log water; instant progress; other beverages; timeline; edit; delete (+undo); persistence; history; reminders; mL/fl oz; offline logging; 100% celebration; phone sizes; a11y labels on core actions. Tracked in `docs/05-roadmap.md`.

## 8. Risks & edge cases
- **Day boundaries:** a "day" is the user's *local* calendar day at log time; store `logged_at` (UTC ISO) + `tz` offset/IANA zone on the log so DST/timezone travel doesn't re-bucket history. Summaries computed by `dayKey(loggedAt, tz)`.
- **Goal changes mid-day:** history stores the goal *in effect that day* (`goal_ml` snapshot per day); changing goal affects today and future only.
- **Duplicates:** client-generated UUID v4 ids, idempotent upsert on sync.
- **Health claims:** copy reviewed; goal clamped 1.2–4.5 L; "over goal" neutral, with gentle note above 150% of goal.
- **Hydration weighting** off by default (volume tracking); optional coefficients labelled "estimate".
- **Notifications:** hard cap/day, quiet hours, skip when goal reached; privacy-safe text (no volumes on lock screen unless enabled).
- **Backend lock-in:** all I/O behind `repositories/` interfaces.
