# Roadmap & status

Legend: ✅ done and verified · 🟡 built, not fully verified · ⬜ not started

## Phase 1 — Core MVP
| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Project architecture | ✅ | layered: `domain` (pure) / `data` / `store` / `components` / `features` / `app` |
| 2 | Design system | ✅ | tokens + 25 components; light/dark; Reduce Motion aware |
| 3 | Authentication | 🟡 | Supabase email/password + guest mode implemented; **not exercised against a real Supabase project** (no keys in this environment) |
| 4 | Onboarding | ✅ | 9 screens + welcome; skippable; permission asked only on tap |
| 5 | Goal calculation | ✅ | `src/domain/hydrationGoal.ts`, unit-tested, constants exported |
| 6 | Today screen | ✅ | pond hero, quick add, drink chips, timeline |
| 7 | Drink logging | ✅ | quick add (1 tap), add sheet, edit, delete + undo, duplicate |
| 8 | Daily progress | ✅ | instant, announced to screen readers; past-goal note |
| 9 | Local persistence + offline queue | ✅ | persisted stores; idempotent sync queue (tested); remote = Supabase impl behind interface |
| 10 | History | ✅ | day / week / month, stats, breakdown |
| 11 | Basic reminders | 🟡 | planner unit-tested; scheduling via expo-notifications **not run on a device** |

### MVP acceptance checklist
- ✅ onboarding completes → personalised goal → editable (onboarding + Profile › Daily goal)
- ✅ water in 1 tap from Today; progress updates instantly
- ✅ other beverages; timeline; edit; delete (+undo); duplicate
- ✅ persistence after reload (e2e)
- ✅ history of previous days (unit tests for bucketing; e2e for UI)
- ✅ mL / fl oz switch
- ✅ celebration on reaching 100% (e2e)
- ✅ accessibility labels on core actions (hero, quick-add, timeline rows, chart bars, calendar days)
- 🟡 offline logging: store + sync logic tested with a fake remote; real network failure on a device not tested
- 🟡 phone sizes: verified at 390×844 in a browser only; iOS/Android simulators not available here
- 🟡 reminders configurable (UI complete); delivery not verified on a device

### Known gaps in Phase 1
- No iOS/Android native run (all UI verification was React Native Web in Chromium).
- Streak *display* exists (header, History); milestone rewards/badges are Phase 2.
- Only a Today-style empty/offline banner and History empty states are designed; there are no network *loading* skeletons because all reads are local. `Skeleton` is built for Phase 2 server content.
- Profile data (settings) is not yet synced to Supabase; only drink logs sync.
- `jest-expo` preset does not resolve on this SDK version, so logic tests run in plain Node; component tests use the browser e2e instead.

## Phase 2 — Retention (next)
12 Streak milestones + rewards · 13 Achievements · 14 Challenges · 15 Mascot progression/unlocks · 16 Richer analytics · 17 Learn (≥12 articles). Adds the Challenges and Learn tabs.

## Phase 3 — Growth
18 Widgets · 19 Share cards · 20 Health integration · 21 Subscription · 22 Premium themes
