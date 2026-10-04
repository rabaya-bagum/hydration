# Design system

Tokens live in `src/design/tokens.ts` (single source of truth): colors (light/dark), spacing (4pt scale), radius, font sizes/weights, shadows, motion durations (fast 150 / base 250 / slow 400 / celebrate 1200 ms).

Components (`src/components`): Button, IconButton, Card, ProgressRing, ProgressBar, HydrationHero, PondScene, Mascot, DrinkButton, ContainerChip, BeverageChip, StatCard, CalendarDay, BottomSheet, Toast, EmptyState, Skeleton, ScreenHeader. Phase 2/3 add ChallengeCard, AchievementBadge, MascotCard, ReminderCard, ArticleCard.

A11y: min touch 44pt, `accessibilityLabel/Role` on every control, progress announced as text ("1.4 of 2.3 litres, 61 percent"), state never color-only (percentage + icon + text), Reduce Motion disables loops/celebration.

## Today wireframe
```
┌─────────────────────────────┐
│ Good morning, Alex   🔥6  ⚙ │
│        ┌ pond scene ┐       │
│        │  Otto  ~~~ │       │
│        │ 1.4 L / 2.3 L      │
│        └   61 %     ┘       │
│   900 mL left today         │
│ [+250][+350][+500][ + ]     │
│ Water Tea Coffee Juice ...  │
│ Today                       │
│ 08:20 💧 Water   350 mL     │
│ 10:40 ☕ Coffee   250 mL    │
└ Today History Chall Learn Me┘
```
