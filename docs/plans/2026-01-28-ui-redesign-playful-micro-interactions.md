# UI Redesign: Playful Micro-Interactions

**Date:** 2026-01-28
**Status:** Approved
**Scope:** Home, Onboarding, Profile, Routes + Bottom Navbar

## Overview

Full UI redesign to transform Driwet from functional to delightful. The goal is a **modern & playful** experience inspired by Duolingo and Headspace—bouncy animations, rounded elements, and satisfying micro-interactions that make weather protection feel approachable.

---

## 1. Micro-Interaction Design System

Every interaction follows consistent motion principles.

### Animation Tokens

| Token | Config | Use Case |
|-------|--------|----------|
| `bouncy` | `{ damping: 12, stiffness: 180 }` | Tap feedback, selections |
| `smooth` | `{ damping: 20, stiffness: 120 }` | Transitions, morphing |
| `snappy` | `{ damping: 18, stiffness: 200 }` | Quick responses, toggles |

### Core Interaction Patterns

#### Tap Feedback
Every tappable element:
- Scale down to `0.95` on press (snappy spring)
- Scale up to `1.05` then settle to `1.0` on release (bouncy spring)
- Haptic: `impactLight`

#### Selection State
When something becomes active:
- Icon morphs from stroke to solid (200ms)
- Gentle scale pulse: `1.0 → 1.15 → 1.0` (bouncy)
- Background pill fades in with blur

#### Loading States
Never static spinners:
- Pulsing dot sequences (3 dots, staggered opacity)
- Skeleton shimmer with playful wave motion
- Icon micro-animations (cloud floating, etc.)

#### Success Moments
Celebrate completions:
- Checkmark draws on with spring overshoot
- Confetti particles for major wins
- Subtle screen shake for warnings

---

## 2. Bottom Tab Bar (Non-Floating)

A docked navbar with icon morphing. Uses HugeIcons stroke/solid variants.

### Structure

```
┌─────────────────────────────────────────────────┐
│                                                 │
│    🏠          ⚠️          🛣️          👤       │
│   Home       Alerts      Routes      Profile    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Visual Specs

- **Height:** 72px + safe area bottom inset
- **Background:** `card` color with 1px top border (`muted/20%`)
- **Icons:** 26px inactive, 28px active
- **Labels:** 11px, `Inter_500Medium`, primary color when active
- **Active pill:** `primary/10%` background, 16px border-radius

### Icon Mapping (HugeIcons)

| Tab | Inactive | Active |
|-----|----------|--------|
| Home | `Home01Icon` | `Home01SolidIcon` |
| Alerts | `Alert01Icon` | `Alert01SolidIcon` |
| Routes | `Route01Icon` | `Route01SolidIcon` |
| Profile | `User01Icon` | `User01SolidIcon` |

### Morphing Animation

**Inactive → Active:**
1. Icon morphs stroke → solid (200ms ease-out)
2. Icon scales `1.0 → 1.15 → 1.05` (bouncy spring)
3. Label slides up from below with fade-in (smooth, 150ms delay)
4. Background pill fades in behind icon+label
5. Haptic: `impactLight`

**Active → Inactive:**
1. Label slides down and fades out (snappy, 100ms)
2. Icon morphs back to stroke (200ms)
3. Scale returns to `1.0` (smooth)
4. Background pill fades out

---

## 3. Home Screen

### Location Chips

The personality centerpiece of the app.

#### Design

```
┌──────────────────────────────────────┐
│  📍  From: Current Location      ✕   │
└──────────────────────────────────────┘
           ⋮ (animated connector dots)
┌──────────────────────────────────────┐
│  🎯  To: Where are you going?    🔍  │
└──────────────────────────────────────┘
```

#### Empty State Behavior
- Destination chip "breathes" (scale `1.0 ↔ 1.02`, 2s loop)
- Placeholder text pulses opacity (`0.5 ↔ 0.8`)
- Connector dots animate upward sequentially

#### On Tap
- Chip scales to `0.96` with `impactLight` haptic
- Background shifts to `primary/15%`
- Icon does rotation wiggle (±5°, bouncy)

#### Search Modal Entry
- Chip "expands" into modal (shared element feel)
- Input auto-focuses with cursor bounce
- Recent locations slide in staggered (50ms delays)

#### Location Selected
- Chip glows primary (shadow pulse outward)
- Icon morphs: `Location01Icon` → `Location01SolidIcon`
- Haptic: `notificationSuccess`
- Destination chip auto-bounces if origin was just set

#### Connector Dots Animation
- **Idle:** gentle sequential pulse (wave going up)
- **Calculating:** faster pulse, dots turn primary
- **Route ready:** dots morph into mini route line with animated dash

### Route Info Pills

```
┌─────────┐  ┌─────────┐  ┌───────┐
│ 🚗 45min│  │ 📏 32km │  │  ✕    │
└─────────┘  └─────────┘  └───────┘
```

#### Entry Animation
- Pills slide in from left, staggered 80ms
- Each bounces on landing
- Icons animate: car "drives" in, ruler "extends"

#### Weather Badge
When route has weather concerns:
- Storm icon pulses amber on duration pill
- Badge scales in with bounce

### Ambient Map Life

#### Weather Presence
- Alert polygons: subtle edge shimmer (animated gradient)
- Storm areas: breathing opacity (`0.3 ↔ 0.4`)
- Safe sections: faint sparkle particles (every 3-4s)

#### User Location Puck
- Pulsing ring expands outward
- Heading arrow with smooth rotation
- Moving: faint trail that fades (5s of path)

#### Camera Transitions
- Route fitting uses spring animation
- Slight overshoot then settle
- Parallax: UI overlays move slower than map

---

## 4. Onboarding

### Progress Bar: Driving Car

```
Step 1:  🚗━━━━━━━━━━━━━━━━━━━━━━
Step 3:  ━━━━━━━━━🚗━━━━━━━━━━━━
Step 5:  ━━━━━━━━━━━━━━━━━━━━━🚗 🎉
```

- Small car icon drives along progress bar
- Car bounces on each step completion
- Road dashes scroll beneath car
- Final step: car does celebratory wiggle

### Screen Transitions

- Current screen slides out left with rotation (-2°)
- New screen slides in from right with rotation (+2°)
- Creates playful "card stack" feel
- Spring physics with overshoot

### Personalization Cards

- Unselected cards float (bob up/down 4px)
- Press: card tilts toward touch point (3D perspective)
- Selection: card "stamps" down with thud haptic
- Checkmark draws on with spring
- Multiple selections: staggered "collection" feel

### Signup Screen

- Input fields scale `1.02` on focus
- Labels float up with spring
- Password strength: bouncy segment fill
- CTA button: idle shimmer (gradient sweep)

---

## 5. Profile Screen

### User Identity Card

```
┌─────────────────────────────────────────┐
│      ┌───────────┐                      │
│      │   🧑‍💼    │  ← avatar with ring  │
│      └───────────┘                      │
│        Lucas M.                         │
│    lucas@email.com                      │
│   ┌─────────────────────────────────┐   │
│   │ ⚡️ 12 days left on trial       │   │
│   │         Upgrade →               │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Avatar Animation
- Ring pulses gently with primary color
- Tap: playful wiggle (±8° rotation)
- Premium users: rotating gradient ring

#### Trial Banner
- Countdown pulses when <5 days
- "Upgrade" arrow bounces horizontally (every 4s)
- Tap: satisfying press feedback

### Stats Section

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│   🌩️   │  │   💰    │  │   🛣️   │
│    7    │  │  $240   │  │  1,432  │
│ Storms  │  │  Saved  │  │   km    │
│ Avoided │  │         │  │         │
└─────────┘  └─────────┘  └─────────┘
```

#### Entry Animation
- Cards slide up staggered (100ms apart)
- Numbers count up from 0 (800ms)
- Icons bounce when count completes
- Milestones trigger confetti

#### Interaction
- Tap: expand into detail sheet with history graph
- Long press: share achievement card

### Settings List

- Row icons animate on appear (gear rotates, bell swings)
- Tap: background ripples from touch point
- Toggles use spring with overshoot
- Logout: subtle shake warning

---

## 6. Routes Screen

### Saved Routes Cards

```
┌─────────────────────────────────────────┐
│  ┌────┐                                 │
│  │ 🗺️ │  Work Commute            ⭐️    │
│  └────┘  Home → Office                  │
│          ─────────────────────          │
│          ⏰ Mon-Fri 8:00 AM      →      │
└─────────────────────────────────────────┘
```

#### Card Interactions
- Map thumbnail shows animated route dash
- Favorite star: burst of tiny stars + scale bounce
- Scheduled badge: pulse when <2 hours away
- Swipe left: red delete with spring slide
- Long press: card lifts for reorder

#### Entry Animation
- Cards cascade from bottom (60ms stagger)
- Slight rotation that corrects on land (±2°)
- "Dealt cards" feel

### Empty State

```
┌─────────────────────────────────────────┐
│            🛣️                           │
│        (road with animated car)         │
│                                         │
│      Your routes will appear here       │
│   ┌─────────────────────────────────┐   │
│   │     + Add your first route      │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

- Simple road illustration with car driving loop
- Car leaves dust particles
- CTA button "breathes" (scale animation)

### Trip History

- Vertical timeline connecting trip dots
- Nodes pulse when scrolled into view
- Storm-avoided: lightning icon flashes once
- Savings count up in green

---

## 7. Component Architecture

### New Components

```
components/
├── ui/
│   ├── animated-pressable.tsx    # Base pressable with scale + haptic
│   ├── morphing-icon.tsx         # Stroke ↔ solid transitions
│   ├── animated-pill.tsx         # Pills with spring entry
│   ├── count-up-text.tsx         # Number animation utility
│   ├── confetti-burst.tsx        # Celebration particles
│   └── shimmer-skeleton.tsx      # Playful loading states
├── navigation/
│   └── bottom-tab-bar.tsx        # New morphing navbar
├── home/
│   ├── location-chips.tsx        # Enhanced with animations
│   ├── route-info-pills.tsx      # New component
│   └── connector-dots.tsx        # Animated chip connector
├── onboarding/
│   └── driving-progress.tsx      # Car progress indicator
└── profile/
    └── stat-card.tsx             # Animated stat display
```

### Animation Utilities

```typescript
// hooks/use-animation-tokens.ts
export const springs = {
  bouncy: { damping: 12, stiffness: 180 },
  smooth: { damping: 20, stiffness: 120 },
  snappy: { damping: 18, stiffness: 200 },
} as const;

// hooks/use-press-animation.ts
export function usePressAnimation() {
  const scale = useSharedValue(1);

  const onPressIn = () => {
    scale.value = withSpring(0.95, springs.snappy);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { onPressIn, onPressOut, animatedStyle };
}
```

---

## 8. Implementation Order

| Phase | Scope | Dependencies |
|-------|-------|--------------|
| 1 | Animation tokens & base components | None |
| 2 | Bottom tab bar | Phase 1 |
| 3 | Home screen (chips, pills, ambient) | Phases 1-2 |
| 4 | Profile (stats, settings) | Phases 1-2 |
| 5 | Routes (cards, empty states) | Phases 1-2 |
| 6 | Onboarding (progress, transitions) | Phases 1-2 |

---

## 9. Technical Notes

### Dependencies
- `react-native-reanimated` ^3.x (already installed)
- `expo-haptics` (already installed)
- `@hugeicons/core-free-icons` (already installed)

### Performance Considerations
- All animations run on UI thread via Reanimated worklets
- Use `useAnimatedStyle` for transform/opacity only (GPU-accelerated)
- Memoize animation configs to prevent recreation
- Debounce rapid interactions (e.g., fast tab switching)

### Accessibility
- Respect `reduceMotion` preference
- Provide fallback static states
- Haptics optional (user preference)
- All interactive elements have proper labels

---

## Appendix: HugeIcons Reference

Icons used from `@hugeicons/core-free-icons`:

| Purpose | Stroke | Solid |
|---------|--------|-------|
| Home tab | `Home01Icon` | `Home01SolidIcon` |
| Alerts tab | `Alert01Icon` | `Alert01SolidIcon` |
| Routes tab | `Route01Icon` | `Route01SolidIcon` |
| Profile tab | `UserIcon` | `UserSolidIcon` |
| Location | `Location01Icon` | `Location01SolidIcon` |
| Search | `Search01Icon` | `Search01SolidIcon` |
| Star | `Star01Icon` | `Star01SolidIcon` |
| Clock | `Clock01Icon` | `Clock01SolidIcon` |
| Settings | `Settings01Icon` | `Settings01SolidIcon` |
| Storm | `CloudLightningIcon` | - |
| Money | `MoneyBag01Icon` | - |
| Distance | `RulerIcon` | - |
| Car | `Car01Icon` | - |
