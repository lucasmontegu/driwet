# Driwet UX Redesign: AI Co-Pilot as Safety Guardian

**Date:** 2026-01-24
**Status:** Approved for Implementation
**Timeline:** 10 weeks (2.5 months)
**Target Markets:** US, Mexico, LATAM (simultaneous launch)

---

## Executive Summary

A comprehensive UX redesign centered on the **AI Co-Pilot as Safety Guardian** concept. The AI isn't just a feature—it's the brand identity. Every interaction reinforces: "Your AI co-pilot keeps you safe."

### Key Decisions

| Aspect | Decision |
|--------|----------|
| Primary UX Model | AI-first (chat/voice driven) |
| Brand Positioning | Safety guardian, not just navigation |
| Monetization | Freemium with 7-day trial |
| Key Differentiator | Proactive weather alerts + safe stop suggestions |
| Voice | Premium feature (ElevenLabs TTS) |

### Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding completion | >70% |
| Time to first route | <90 seconds |
| AI chat engagement | 3+ messages/session |
| Trial start rate | >25% of active users |
| Trial → Paid conversion | >40% |
| Week 1 retention | >30% |

---

## Part 1: Onboarding Flow

### Concept
A 5-screen flow introducing the AI as a protective companion. Goal: user feels "this app cares about my safety" before any paywall.

### Screen 1: The Hook (3 seconds)
- **Visual:** Dark background, rain animation, car silhouette, lightning flash
- **Text:** "Every year, 1.3 million people die in road accidents. Many could be prevented with better information."
- **Behavior:** Auto-advances after 3s or tap
- **Component:** Full-screen Lottie animation

### Screen 2: The Promise
- **Visual:** Sunrise breaking through clouds, calm atmosphere
- **Text:** "Meet your AI co-pilot. I watch the weather, so you can focus on the road."
- **Element:** AI avatar/waveform introduction
- **Component:** `HeroCard` centered, `CloudSun` Hugeicon

### Screen 3: Quick Personalization
- **Text:** "What kind of trips do you usually take?"
- **Options (multi-select):**
  - Daily commute
  - Road trips
  - Business travel
  - Long-haul driving
- **Component:** `HeroCheckboxGroup` or custom chips
- **Purpose:** Personalize AI suggestions + segment users

### Screen 4: Demo — The "Aha!" Moment
- **Visual:** Interactive mini-map showing route "Your City → Beach Town"
- **Animation sequence:**
  1. Route appears with weather icons every 50km
  2. Red storm icon pulses at km 120
  3. AI bubble: "Storm detected at km 120. I found a safe stop 15 minutes before—a gas station with shelter."
  4. Safe stop pin animates onto map
- **Component:** Static/Lottie map, `HeroAlert` for AI suggestion
- **Critical:** This is THE moment—user sees core value before signup

### Screen 5: Soft Commitment
- **Text:** "Ready to drive safer?"
- **CTA:** `HeroButton` — "Create Free Account"
- **Secondary:** "Continue as guest" (limited features)
- **Social proof:** "Join 10,000+ drivers staying safe" with `Star` icon

### Flow Timing
```
[Hook] → [Promise] → [Personalization] → [Demo] → [Signup]
   3s      tap          tap                 5s       tap

Total: ~45-60 seconds for engaged users
Skip option available after Screen 2
```

---

## Part 2: Home Screen

### Concept
Map-centric view with AI co-pilot always accessible. Unlike competitors showing just a map, Driwet shows **safety status** at a glance.

### Layout Structure
```
┌─────────────────────────────────────┐
│  [Status Bar]                       │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │  SAFETY CARD (collapsible)  │    │
│  │  "Good conditions today ✓"  │    │
│  └─────────────────────────────┘    │
│                                     │
│           MAPBOX MAP                │
│      (current location +            │
│       weather overlay)              │
│                                     │
│              ┌──────┐               │
│              │ 🎤 AI │  ← Floating  │
│              └──────┘    Co-pilot   │
├─────────────────────────────────────┤
│  [Tab Bar: Home | Routes | Profile] │
└─────────────────────────────────────┘
```

### Components

#### 1. Safety Status Card
- **Position:** Top, overlays map, collapsible with swipe
- **States:**

| Condition | Color | Icon | Text |
|-----------|-------|------|------|
| Safe | Green | `ShieldCheck` | "Clear conditions in your area" |
| Caution | Amber | `AlertCircle` | "Light rain expected at 3 PM" |
| Warning | Orange | `CloudLightning` | "Storm approaching—tap for details" |
| Danger | Red | `DangerTriangle` | "Severe weather alert active" |

- **Tap:** Expands to detailed weather + AI recommendation

#### 2. Map View
- User location (blue pulse)
- Weather overlay layer
- Alert polygons (colored zones)
- Recent/favorite routes as subtle lines
- Weather icons every ~50km along visible routes

#### 3. AI Co-Pilot Button
- **Position:** Bottom-right, above tab bar
- **States:**

| State | Visual | Behavior |
|-------|--------|----------|
| Idle | `MessageCircle` icon | Tap to open chat |
| Has suggestion | Pulsing glow + badge | Notification indicator |
| Listening | `Mic` icon + waveform | Voice input active |
| Speaking | Animated waveform | TTS playing |

- **Tap:** Opens chat bottom sheet
- **Long press:** Activates voice mode directly

#### 4. Quick Routes (Optional)
- Horizontal scroll of saved routes with safety status
- Example: `[ 🏠 Home → Office (25 min, ✓ safe) ]`

### Empty State (New User)
- **Visual:** AI avatar waving
- **Text:** "Hi! I'm your co-pilot. Tell me where you're going and I'll find the safest route."
- **CTA:** "Plan my first trip"

---

## Part 3: Route Planning

### Concept
Conversation-first planning. User talks to AI (text or voice), AI creates route with safety analysis built-in. Traditional origin→destination exists as fallback.

**Key differentiator:** Weather segments every 50km shown DURING planning, not after.

### Entry Points
1. **Chat-Based (Primary):** Tap AI button → "Take me to Monterrey tomorrow at 8 AM"
2. **Manual (Fallback):** Tap search bar → autocomplete → select destination

### Route Preview Screen Layout
```
┌─────────────────────────────────────┐
│  ← Back                     Share ↗ │
├─────────────────────────────────────┤
│           MAPBOX MAP                │
│    (route + weather markers)        │
├─────────────────────────────────────┤
│  WEATHER TIMELINE (horizontal)      │
│  [☀️ 0km] [🌤️ 50km] [⛈️ 100km]...    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │  AI SAFETY SUMMARY          │    │
│  │  "⚠️ Heavy rain at km 100"   │    │
│  │  "💡 Safe stop: Pemex km 95" │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  [Start Navigation]  [Save Route]   │
└─────────────────────────────────────┘
```

### Weather Timeline Component
Horizontal scrollable strip showing conditions at each 50km segment:

```
┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
│ ☀️ │→│ 🌤️ │→│ ⛈️ │→│ 🌧️ │→│ ☀️ │
│0 km│  │50km│  │100k│  │150k│  │200k│
│28°C│  │26°C│  │22°C│  │24°C│  │27°C│
│Safe│  │Safe│  │Risk│  │Caut│  │Safe│
└────┘  └────┘  └────┘  └────┘  └────┘
```

- **Tap segment:** Expands to detailed forecast + AI recommendation
- **Colors:** Green (safe), Amber (caution), Red (danger)

### Weather Segment Data Structure
```typescript
interface WeatherSegment {
  kmStart: number;
  kmEnd: number;
  coordinates: [number, number];
  weather: {
    condition: 'clear' | 'clouds' | 'rain' | 'storm' | 'fog';
    temperature: number;
    precipitation: number;
    windSpeed: number;
  };
  risk: 'safe' | 'caution' | 'warning' | 'danger';
  estimatedArrival: Date;
}
```

### AI Safety Summary Card
Always visible on route preview. Contains:
- Overall risk level
- Specific alerts (location, time, severity)
- Suggestions (safe stops, alternative routes)

### Route Alternatives
When multiple routes exist, show comparison cards:

| Route A (Recommended) | Route B |
|-----------------------|---------|
| 4h 15min, 380 km | 3h 55min, 365 km |
| 🟢 Low risk | 🟠 Medium risk |
| "Avoids storm near Querétaro" | "Faster but passes through rain" |

### Safe Stop Recommendations
When danger detected, show proactive suggestions:

```
┌─────────────────────────────────────┐
│ 💡 RECOMMENDED SAFE STOP            │
│                                     │
│ 📍 Pemex Station "El Descanso"      │
│    km 95 • 15 min before storm zone │
│                                     │
│ ✓ Fuel  ✓ Restrooms  ✓ Food         │
│ ✓ Covered parking                   │
│                                     │
│ "Wait here ~45 min for storm to     │
│  pass. I'll notify you when clear." │
│                                     │
│ [Add to Route]  [Find Alternatives] │
└─────────────────────────────────────┘
```

---

## Part 4: AI Chat Interface

### Concept
Persistent companion, not one-time query tool. Opens as bottom sheet over map, supports text and voice, transitions to Driving Mode during navigation.

### AI Personality
- **Calm:** Never alarmist, even in danger
- **Protective:** "I want to make sure you arrive safely"
- **Concise:** Short sentences, no fluff
- **Helpful:** Offers solutions, not just problems

### Example Responses

| Situation | AI Says |
|-----------|---------|
| Good weather | "Looking great! Clear skies all the way." |
| Light rain | "Some rain ahead, but nothing major. Drive safe!" |
| Storm detected | "I spotted a storm at km 120. Let me find you a safe place to wait." |
| User ignores warning | "Understood. I'll keep watching and update you if things change." |
| Route complete | "You made it! Nice driving. See you next time." |

### Chat Bottom Sheet Layout

**Collapsed:**
```
┌─────────────────────────────────────┐
│ ─────  (drag handle)                │
│  🤖 "Where would you like to go?"   │
│  [🎤]  [Type a message...    ] [➤]  │
└─────────────────────────────────────┘
```

**Expanded:**
```
┌─────────────────────────────────────┐
│ ─────  Co-pilot           [✕ Close] │
├─────────────────────────────────────┤
│  🤖 "Good morning! Weather looks    │
│      clear for your commute today." │
│                                     │
│           "Take me to the office" 👤│
│                                     │
│  🤖 "On it! 35 min, no stops        │
│      needed. Ready to go?"          │
│                                     │
│      [Start Navigation] [Edit]      │
├─────────────────────────────────────┤
│  [🎤]  [Type a message...    ] [➤]  │
└─────────────────────────────────────┘
```

### Message Types
1. **Text (User/AI):** Standard chat bubbles
2. **Route Card:** Embedded route summary with CTAs
3. **Safety Alert:** Warning card with add stop/ignore options
4. **Safe Stop Suggestion:** Location card with amenities

### Voice Interaction
- **Input:** Tap mic or long-press AI button
- **Visual:** Waveform animation + "Listening..."
- **Output:** AI messages show speaker icon, animated waveform during TTS

### Driving Mode
Simplified UI when navigation active:

```
┌─────────────────────────────────────┐
│  TURN LEFT in 500m                  │
│                                     │
│           [MAP VIEW]                │
│                                     │
├─────────────────────────────────────┤
│ 🤖 "All clear for the next 30km"    │
│                                     │
│        ┌─────────────┐              │
│        │   🎤 Talk   │  ← Large     │
│        └─────────────┘     target   │
└─────────────────────────────────────┘
```

Features:
- Large tap targets (thumb-friendly)
- Voice-first interaction
- AI proactively speaks alerts
- Minimal visual distraction

### Voice Commands (Driving Mode)
- "Hey co-pilot, how's the weather ahead?"
- "Find me a gas station"
- "How much longer?"
- "Cancel navigation"

### Premium vs Free

| Feature | Free | Premium |
|---------|------|---------|
| Text chat | ✓ | ✓ |
| Route planning | ✓ | ✓ |
| Weather segments | 3/route | Unlimited |
| Voice input | ✗ | ✓ |
| Voice output (TTS) | ✗ | ✓ |
| Proactive alerts | Basic | Advanced |
| Safe stop suggestions | ✗ | ✓ |
| Driving mode voice | ✗ | ✓ |

---

## Part 5: Conversion & Paywall

### Philosophy
**Show value 3 times before asking for money.** Users experience the "aha!" moment before seeing any paywall.

### Conversion Funnel
```
AWARENESS → ACTIVATION → ENGAGEMENT → CONVERSION
(Onboarding)  (First route)  (Feature gate)  (Paywall)
```

### Soft Upsell Moments

#### 1. After First Route Completion
```
🎉 Nice first trip!
Want your co-pilot to speak alerts out loud next time?
[Try Voice Free for 7 Days]
```

#### 2. Storm Detected (Free User)
```
🔒 PREMIUM FEATURE
I found 3 safe stops nearby, but this requires Premium.
[Unlock Safe Stops - 7 Day Trial]
[Show me anyway (just this once)]  ← Builds trust
```

#### 3. Voice Button Tap (Free User)
```
Voice mode is a Premium feature
Keep your eyes on the road—let your co-pilot speak to you.
[Start 7-Day Free Trial]
```

#### 4. Progress Indicator (After 2-3 routes)
```
📊 Your Safety Stats
Routes: 3 | Storms avoided: 1 | Safe km: 450
━━━━━━━━●━━━━━ 60% to next badge!
🏆 Premium drivers get exclusive safety badges
```

### Paywall Screen

```
┌─────────────────────────────────────┐
│         🛡️                          │
│   DRIVE WITH CONFIDENCE             │
│   "Your AI co-pilot, fully unlocked"│
├─────────────────────────────────────┤
│  ✓ Unlimited route planning         │
│  ✓ Voice co-pilot (hands-free)      │
│  ✓ Safe stop recommendations        │
│  ✓ Advanced weather alerts          │
│  ✓ Priority support                 │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ BEST VALUE          -60%   │    │
│  │ Yearly    $29.99/year      │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Monthly   $4.99/month      │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ Lifetime  $79.99 one-time  │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  [Start 7-Day Free Trial]           │
│                                     │
│  ⭐ "This app warned me 30 min      │
│      early. Worth it!" — Carlos M.  │
└─────────────────────────────────────┘
```

### Regional Pricing

| Region | Monthly | Yearly | Lifetime |
|--------|---------|--------|----------|
| US | $4.99 | $29.99 | $79.99 |
| Mexico | $2.99 (MXN 49) | $19.99 (MXN 349) | $49.99 (MXN 899) |
| LATAM | $1.99-2.49 | $14.99-17.99 | $39.99-49.99 |

### Trial Mechanics
- 7 days full Premium access
- No credit card required
- Countdown banner during trial
- Usage stats shown at day 5 (loss aversion)
- Win-back modal on expiration

---

## Part 6: Implementation Roadmap

### Phase Overview

| Phase | Weeks | Focus |
|-------|-------|-------|
| 1: Foundation | 1-2 | Onboarding, Home screen, UI components |
| 2: Core Features | 3-5 | Route planning, Weather segments, Safe stops |
| 3: AI & Voice | 6-8 | Chat interface, Voice I/O, Driving mode |
| 4: Polish | 9-10 | Analytics, A/B tests, Edge cases, CarPlay |

### Phase 1: Foundation (Week 1-2)

#### Week 1: Onboarding
- Rebuild 5-screen onboarding flow
- Add Lottie weather animations
- Create trip-type personalization
- Build static demo with weather markers

**New files:**
```
components/onboarding/
├── hook-screen.tsx
├── promise-screen.tsx
├── personalization-screen.tsx
├── demo-screen.tsx
└── signup-screen.tsx
```

#### Week 2: Home Screen
- Refactor Safety Status Card (collapsible)
- Create AI floating button with states
- Enhance quick route chips
- Design empty state

**New files:**
```
components/home/
├── safety-status-card.tsx
├── ai-copilot-button.tsx
├── quick-routes-bar.tsx
└── empty-state.tsx
```

### Phase 2: Core Features (Week 3-5)

#### Week 3: Route Planning
- Redesign route preview screen
- Create weather timeline component
- Build route comparison cards
- Add AI safety summary

**New files:**
```
components/route/
├── route-preview-screen.tsx
├── weather-timeline.tsx
├── weather-segment-card.tsx
├── route-comparison.tsx
├── ai-safety-summary.tsx
└── safe-stop-card.tsx
```

#### Week 4: Weather Segmentation
- Implement 50km segment calculation
- Batch weather API calls
- Create risk scoring algorithm
- Add map markers at segments

**New hook:** `hooks/use-route-weather.ts`

#### Week 5: Safe Stops & Paywall
- Integrate POI search (Mapbox Places)
- Build stop recommendation algorithm
- Redesign paywall with new layout
- Add feature gates

### Phase 3: AI & Voice (Week 6-8)

#### Week 6: Chat Interface
- Enhance chat bottom sheet
- Add route/alert/stop message cards
- Polish typing indicator
- Improve AI streaming UI

**Enhanced:** `components/ai-chat/`

#### Week 7: Voice Integration
- Enhance voice recording UI
- Integrate STT (Whisper/Google)
- Add ElevenLabs TTS for premium
- Build voice waveform animations

**New:** `lib/elevenlabs.ts`, `hooks/use-voice-elevenlabs.ts`

#### Week 8: Driving Mode
- Create simplified driving UI
- Implement proactive voice alerts
- Add large voice button
- Screen wake lock

**New files:**
```
components/navigation/
├── driving-mode-view.tsx
├── turn-indicator.tsx
├── voice-button-large.tsx
└── proactive-alert.tsx
```

### Phase 4: Polish (Week 9-10)

#### Week 9: Analytics & Testing
- Add conversion event tracking
- Set up A/B test framework
- Implement funnel tracking
- Add error boundaries

#### Week 10: Edge Cases & Launch
- Offline mode (cache routes/weather)
- Error handling (toasts, retry)
- Accessibility (VoiceOver testing)
- Localization verification
- Performance optimization

### Dependencies

```bash
# New
npx expo install lottie-react-native

# Existing (verify)
@rnmapbox/maps expo-av expo-speech

# Optional
npm install elevenlabs

# CarPlay (stretch)
npm install react-native-carplay
```

### File Structure Summary

```
apps/mobile/
├── app/
│   ├── (auth)/onboarding/     # NEW: 5-screen flow
│   └── (app)/
│       ├── route-preview.tsx  # NEW
│       └── driving.tsx        # NEW
├── components/
│   ├── home/                  # NEW
│   ├── route/                 # NEW
│   ├── ai-chat/               # ENHANCED
│   ├── navigation/            # NEW
│   └── onboarding/            # REBUILT
├── hooks/
│   ├── use-route-weather.ts   # NEW
│   ├── use-safe-stops.ts      # NEW
│   └── use-voice-elevenlabs.ts # NEW
└── lib/
    ├── elevenlabs.ts          # NEW
    └── analytics.ts           # ENHANCED
```

---

## Part 7: Analytics Events

```typescript
export const EVENTS = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Activation
  FIRST_ROUTE_PLANNED: 'first_route_planned',
  FIRST_ROUTE_COMPLETED: 'first_route_completed',

  // Engagement
  AI_CHAT_OPENED: 'ai_chat_opened',
  AI_MESSAGE_SENT: 'ai_message_sent',
  VOICE_INPUT_USED: 'voice_input_used',
  VOICE_OUTPUT_PLAYED: 'voice_output_played',
  SAFE_STOP_VIEWED: 'safe_stop_viewed',
  SAFE_STOP_ADDED: 'safe_stop_added',
  WEATHER_SEGMENT_TAPPED: 'weather_segment_tapped',

  // Conversion
  PAYWALL_VIEWED: 'paywall_viewed',
  PAYWALL_DISMISSED: 'paywall_dismissed',
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',

  // Feature Gates
  PREMIUM_FEATURE_BLOCKED: 'premium_feature_blocked',
  PREMIUM_FEATURE_SAMPLED: 'premium_feature_sampled', // "just this once"
};
```

---

## Part 8: A/B Test Candidates

| Test | Variants | Metric |
|------|----------|--------|
| Onboarding hook | Dramatic stats vs Calm intro | Completion rate |
| Demo route | Interactive vs Video | Time spent |
| Paywall timing | After 1st route vs After 3rd | Trial starts |
| Safe stop sampling | Show once free vs Hard gate | Conversion |
| Voice upsell | After route vs On mic tap | Trial starts |
| Pricing display | Local currency vs USD | Conversion |

---

## Appendix: Design Tokens

### Colors (Safety Theme)

```typescript
const safetyColors = {
  safe: {
    bg: '#ECFDF5',    // Light green
    text: '#065F46',  // Dark green
    icon: '#10B981',  // Green
  },
  caution: {
    bg: '#FFFBEB',    // Light amber
    text: '#92400E',  // Dark amber
    icon: '#F59E0B',  // Amber
  },
  warning: {
    bg: '#FFF7ED',    // Light orange
    text: '#9A3412',  // Dark orange
    icon: '#F97316',  // Orange
  },
  danger: {
    bg: '#FEF2F2',    // Light red
    text: '#991B1B',  // Dark red
    icon: '#EF4444',  // Red
  },
};
```

### Typography

- **Headlines:** Inter SemiBold (600)
- **Body:** Inter Regular (400)
- **Captions:** Inter Light (300)

### Spacing

- Base unit: 4px
- Component padding: 16px (4 units)
- Section spacing: 24px (6 units)
- Screen margins: 16px

---

**Document Version:** 1.0
**Last Updated:** 2026-01-24
**Author:** Claude + Lucas Montegu
