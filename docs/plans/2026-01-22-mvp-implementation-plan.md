# DRIWET MVP Implementation Plan (B2C Phase 1)

> **Generated:** 2026-01-22
> **Status:** Execution-Ready
> **Timeline:** 16 weeks (4 phases)

---

## TL;DR - Start Here

```
Week 1-4:  EAS builds → Tomorrow.io route API → Map weather layer → Route UI
Week 5-8:  Google Places → Shelter UI → Push notifications → Background alerts
Week 9-12: AI context → Function calling → Chat UI → Polish
Week 13-16: Testing → Performance → App Store → Beta → Launch
```

**First command to run:**
```bash
cd apps/mobile && npx eas-cli build:configure
```

**Critical path:** EAS builds (day 1) → Route weather API (day 5) → Map layer (day 10) → Testable MVP

---

## Executive Summary

DRIWET MVP focuses on 4 core features: **Weather-Aware Route Display**, **Dynamic Shelter Discovery**, **Proactive Weather Alerts**, and **AI Weather Copilot**. The current codebase already has ~60% of the foundation (Expo app, Mapbox, Tomorrow.io basic integration, auth, i18n, bottom sheet chat UI). The critical blockers are:

1. **EAS Development Builds** - Required for full Mapbox SDK (currently limited by Expo Go)
2. **Tomorrow.io Route Weather API** - Not integrated (only basic alerts exist)
3. **Google Places API** - Not integrated for shelter discovery
4. **AI Context Enhancement** - Chat exists but lacks weather/location context

**Recommended approach:** Build vertically (end-to-end for one feature) rather than horizontally. Start with Weather-Aware Routing because it's the core differentiator and unblocks Shelter Discovery.

---

## Current State Assessment

| Component | Status | Gap |
|-----------|--------|-----|
| Expo Mobile App | ✅ Working | Needs EAS dev builds |
| Mapbox Integration | ✅ Basic | Needs custom weather layers |
| Tomorrow.io Weather | ⚠️ Partial | Missing route weather API |
| Authentication | ✅ Complete | Google/Apple/Magic Link ready |
| i18n (EN/ES) | ✅ Working | - |
| Bottom Sheet Chat | ✅ UI exists | Missing AI context |
| Route Weather Display | ❌ Missing | Core feature |
| Shelter Discovery | ❌ Missing | Core feature |
| Push Notifications | ⚠️ Partial | Needs background triggers |

---

## Epics & User Stories

### Epic 1: Infrastructure & Build System
**Goal:** Enable development builds for full Mapbox SDK access

**User Stories:**
- US1.1: As a developer, I can build the app locally without Expo Go limitations
- US1.2: As a developer, I can test Mapbox navigation features on physical devices
- US1.3: As a developer, I can run CI builds with EAS

### Epic 2: Weather-Aware Route Display
**Goal:** Show real-time weather along planned routes

**User Stories:**
- US2.1: As a driver, I can see my route colored by weather severity (green/yellow/red)
- US2.2: As a driver, I can see weather icons at key points along my route
- US2.3: As a driver, I can see adjusted ETA based on weather conditions
- US2.4: As a driver, the weather updates automatically every 60 seconds during navigation

### Epic 3: Dynamic Shelter Discovery
**Goal:** Find and navigate to safe locations during severe weather

**User Stories:**
- US3.1: As a driver, I see shelter pins on the map when dangerous weather is detected
- US3.2: As a driver, I can see shelter details (type, distance, ETA)
- US3.3: As a driver, I can one-tap navigate to a shelter via Waze/Google Maps
- US3.4: As a driver, shelters are ranked by relevance (distance + structure type)

### Epic 4: Proactive Weather Alerts
**Goal:** Warn users before weather impacts their route

**User Stories:**
- US4.1: As a driver, I receive alerts 15-30 min before weather impacts my route
- US4.2: As a driver, I see alert details (weather type, severity, time until impact)
- US4.3: As a driver, critical alerts can override Do Not Disturb (with permission)
- US4.4: As a driver, I receive SMN Argentina official alerts when available

### Epic 5: AI Weather Copilot
**Goal:** Conversational assistant with weather context

**User Stories:**
- US5.1: As a driver, I can ask "Is it safe to drive to [destination]?" and get contextual answers
- US5.2: As a driver, I can use quick actions ("Find shelter", "Show weather on route")
- US5.3: As a driver, I see my last 3 conversations in the collapsed chat state
- US5.4: As a driver, the AI understands my current location, route, and weather conditions

---

## Technical Tasks (Ordered by Build Sequence)

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: EAS Build Setup
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T1.1: Configure EAS Build for iOS | P0 | 4h | None |
| T1.2: Configure EAS Build for Android | P0 | 4h | None |
| T1.3: Create development build profiles | P0 | 2h | T1.1, T1.2 |
| T1.4: Configure @rnmapbox/maps with dev builds | P0 | 4h | T1.3 |
| T1.5: Verify Mapbox SDK full features work | P0 | 2h | T1.4 |
| T1.6: Document build process in README | P1 | 2h | T1.5 |

**Deliverable:** Working iOS/Android dev builds with full Mapbox SDK

#### Week 2: Database Schema & Tomorrow.io Route API
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T2.1: Design routes table schema | P0 | 2h | None |
| T2.2: Design weather_history table schema | P0 | 2h | None |
| T2.3: Create Drizzle migrations | P0 | 2h | T2.1, T2.2 |
| T2.4: Research Tomorrow.io Route Weather API | P0 | 4h | None |
| T2.5: Implement route weather service | P0 | 8h | T2.4 |
| T2.6: Create route weather API endpoint | P0 | 4h | T2.5 |
| T2.7: Write unit tests for weather service | P1 | 4h | T2.5 |

**Deliverable:** Backend can fetch weather along any route

#### Week 3: Map Weather Layer
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T3.1: Create weather risk scoring algorithm | P0 | 4h | T2.5 |
| T3.2: Create custom Mapbox line layer for weather | P0 | 8h | T3.1 |
| T3.3: Implement gradient color interpolation (green→yellow→red) | P0 | 4h | T3.2 |
| T3.4: Add weather icons at route waypoints | P1 | 4h | T3.2 |
| T3.5: Implement 60s polling for weather updates | P0 | 4h | T3.2 |
| T3.6: Add loading states during weather fetch | P1 | 2h | T3.2 |

**Deliverable:** Routes display with weather-colored segments

#### Week 4: Route Creation UI
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T4.1: Create route input component (origin/destination) | P0 | 6h | None |
| T4.2: Integrate Mapbox Directions API | P0 | 4h | T4.1 |
| T4.3: Display ETA with weather adjustment | P0 | 4h | T4.2, T3.1 |
| T4.4: Save route to database | P1 | 4h | T4.2, T2.3 |
| T4.5: Load saved routes on app start | P1 | 4h | T4.4 |
| T4.6: Create "Rutas" tab with saved routes list | P1 | 4h | T4.5 |

**Deliverable:** Users can create routes and see weather along them

---

### Phase 2: Core Features (Weeks 5-8)

#### Week 5: Google Places Integration
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T5.1: Set up Google Places API credentials | P0 | 2h | None |
| T5.2: Create shelters API service | P0 | 6h | T5.1 |
| T5.3: Implement shelter type filters (gas_station, parking, etc.) | P0 | 4h | T5.2 |
| T5.4: Create shelter scoring algorithm | P0 | 6h | T5.2 |
| T5.5: Create shelters API endpoint | P0 | 4h | T5.4 |
| T5.6: Cache shelter results (5min TTL) | P1 | 4h | T5.5 |

**Deliverable:** Backend can find and score shelters near any location

#### Week 6: Shelter UI & Deep Linking
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T6.1: Create shelter pin component for Mapbox | P0 | 4h | T5.5 |
| T6.2: Create shelter detail card component | P0 | 4h | T6.1 |
| T6.3: Implement shelter list view | P1 | 4h | T6.1 |
| T6.4: Add deep link to Waze navigation | P0 | 4h | T6.2 |
| T6.5: Add deep link to Google Maps navigation | P0 | 4h | T6.2 |
| T6.6: Auto-trigger shelter display on weather alert | P0 | 4h | T6.1 |

**Deliverable:** Shelter pins appear during alerts with one-tap navigation

#### Week 7: Push Notification System
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T7.1: Configure expo-notifications | P0 | 4h | None |
| T7.2: Create notification service | P0 | 6h | T7.1 |
| T7.3: Design notification payload schema | P0 | 2h | T7.2 |
| T7.4: Implement notification handlers (foreground/background) | P0 | 6h | T7.3 |
| T7.5: Request notification permissions on onboarding | P0 | 2h | T7.4 |
| T7.6: Add notification settings screen | P1 | 4h | T7.4 |

**Deliverable:** App can send and receive push notifications

#### Week 8: Background Location & Route-Aware Alerts
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T8.1: Configure expo-location background mode | P0 | 4h | None |
| T8.2: Implement background location tracking | P0 | 6h | T8.1 |
| T8.3: Create alert threshold configuration | P0 | 4h | T2.5 |
| T8.4: Implement route-aware alert triggering | P0 | 8h | T8.2, T8.3 |
| T8.5: Calculate time-to-impact for alerts | P0 | 4h | T8.4 |
| T8.6: Send proactive notifications 15-30 min before impact | P0 | 4h | T7.2, T8.5 |

**Deliverable:** Proactive alerts sent before weather impacts route

---

### Phase 3: AI Integration (Weeks 9-12)

#### Week 9: AI Context System
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T9.1: Design AI context schema (location, route, weather) | P0 | 4h | None |
| T9.2: Create context builder service | P0 | 6h | T9.1 |
| T9.3: Integrate current location into context | P0 | 4h | T9.2 |
| T9.4: Integrate active route into context | P0 | 4h | T9.2 |
| T9.5: Integrate current weather into context | P0 | 4h | T9.2 |
| T9.6: Integrate nearby shelters into context | P1 | 4h | T9.2 |

**Deliverable:** AI has full context for answering questions

#### Week 10: AI Function Calling
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T10.1: Design function calling schema | P0 | 4h | None |
| T10.2: Implement find_shelter function | P0 | 4h | T10.1, T5.5 |
| T10.3: Implement calculate_route function | P0 | 4h | T10.1, T4.2 |
| T10.4: Implement get_weather function | P0 | 4h | T10.1, T2.5 |
| T10.5: Implement navigate_to function | P0 | 4h | T10.1, T6.4 |
| T10.6: Connect functions to chat backend | P0 | 6h | T10.2-T10.5 |

**Deliverable:** AI can execute actions via function calling

#### Week 11: Chat UI Enhancement
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T11.1: Redesign bottom sheet chat UI | P0 | 8h | None |
| T11.2: Add quick action buttons | P0 | 4h | T11.1 |
| T11.3: Display last 3 conversations in collapsed state | P0 | 4h | T11.1 |
| T11.4: Add typing indicator | P1 | 2h | T11.1 |
| T11.5: Add message timestamps | P1 | 2h | T11.1 |
| T11.6: Handle function calling UI feedback | P0 | 4h | T11.1, T10.6 |

**Deliverable:** Polished chat UI with quick actions

#### Week 12: AI Polish
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T12.1: Write comprehensive AI system prompt | P0 | 4h | T9.6, T10.6 |
| T12.2: Add conversation history persistence | P1 | 4h | T11.3 |
| T12.3: Implement voice input (optional) | P2 | 6h | T11.1 |
| T12.4: Add error handling and retry logic | P0 | 4h | T10.6 |
| T12.5: Test AI responses in Spanish | P0 | 4h | T12.1 |
| T12.6: Add AI usage analytics | P1 | 4h | T10.6 |

**Deliverable:** AI copilot fully functional with Spanish support

---

### Phase 4: Polish & Launch (Weeks 13-16)

#### Week 13: Testing
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T13.1: Write integration tests for weather service | P0 | 8h | Phase 1-3 |
| T13.2: Write E2E tests for critical flows | P0 | 12h | Phase 1-3 |
| T13.3: Manual QA on iOS | P0 | 8h | Phase 1-3 |
| T13.4: Manual QA on Android | P0 | 8h | Phase 1-3 |
| T13.5: Fix critical bugs | P0 | 12h | T13.1-T13.4 |
| T13.6: Fix high-priority bugs | P1 | 8h | T13.5 |

#### Week 14: Performance & Optimization
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T14.1: Profile app performance | P0 | 4h | T13.5 |
| T14.2: Optimize map rendering | P0 | 8h | T14.1 |
| T14.3: Optimize API response times | P1 | 6h | T14.1 |
| T14.4: Reduce bundle size | P1 | 4h | T14.1 |
| T14.5: Implement list virtualization | P1 | 4h | T14.1 |
| T14.6: Add image/asset caching | P1 | 4h | T14.1 |

#### Week 15: App Store Prep
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T15.1: Create app icon and splash screen | P0 | 4h | None |
| T15.2: Write App Store description (ES/EN) | P0 | 4h | None |
| T15.3: Create App Store screenshots | P0 | 6h | Phase 1-3 |
| T15.4: Configure app.json for production | P0 | 4h | T15.1 |
| T15.5: Submit to App Store review | P0 | 2h | T15.1-T15.4 |
| T15.6: Submit to Google Play review | P0 | 2h | T15.1-T15.4 |

#### Week 16: Beta & Launch
| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| T16.1: Create onboarding flow | P0 | 8h | None |
| T16.2: Integrate analytics (Mixpanel/Amplitude) | P1 | 4h | None |
| T16.3: Recruit 50 beta testers | P0 | 4h | T15.5, T15.6 |
| T16.4: Run 5-day beta test | P0 | 8h | T16.3 |
| T16.5: Collect and prioritize feedback | P0 | 4h | T16.4 |
| T16.6: Final bug fixes | P0 | 8h | T16.5 |
| T16.7: Public launch | P0 | 2h | T16.6 |

---

## Risk & Mitigation

### High Risk

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Tomorrow.io Route API rate limits** | Routes stop working | Medium | Implement aggressive caching (5min), request quota increase early |
| **Google Places API cost overrun** | Budget exceeded | Medium | Cache results aggressively, implement daily usage limits, monitor with alerts |
| **EAS build failures** | Development blocked | Low-Medium | Test builds early, have fallback to local builds, document troubleshooting |
| **Mapbox rendering performance** | Poor UX | Medium | Profile early, use layer simplification, implement LOD (level of detail) |

### Medium Risk

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Background location battery drain** | Bad reviews | Medium | Implement significant motion filter, use geofencing, add battery optimization tips |
| **AI hallucinations in weather advice** | Safety concern | Low-Medium | Add guardrails in prompt, validate critical actions, show disclaimers |
| **Push notification delivery issues** | Missed alerts | Low | Test on multiple devices, implement fallback to in-app alerts |
| **App Store rejection** | Launch delay | Low | Review guidelines early, prepare compliance documentation |

### Low Risk

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **SMN Argentina API unavailable** | Missing official alerts | Low | Tomorrow.io alerts as primary, SMN as enhancement only |
| **Shelter data quality** | Poor recommendations | Low | Implement user feedback mechanism, manual curation for top cities |

---

## Assumptions

1. **Tomorrow.io API** provides route weather data with sufficient granularity (waypoints every 5-10km)
2. **Google Places API** returns shelters in Argentina with acceptable coverage
3. **User has active internet** during severe weather events
4. **GPS accuracy** is sufficient for route tracking (~10m)
5. **Team size:** Solo developer with AI assistance
6. **Budget:** ~$215/month for API costs at 10K MAU

---

## Dependencies & External Services

| Service | Purpose | Backup Plan |
|---------|---------|-------------|
| Tomorrow.io | Weather data | OpenWeatherMap (less accurate) |
| Google Places | Shelter discovery | OpenStreetMap Overpass API |
| Mapbox | Maps & routing | Google Maps SDK (more expensive) |
| Claude/Gemini | AI copilot | Downgrade to rule-based responses |
| NeonDB | Database | Supabase PostgreSQL |

---

## Success Criteria (MVP Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| App loads in < 3s | 95th percentile | Performance monitoring |
| Weather overlay renders < 1s | 95th percentile | Custom timing |
| Shelter results in < 2s | 95th percentile | API monitoring |
| Crash-free sessions | > 99% | Crashlytics |
| App Store rating | > 4.0 | Store reviews |
| Daily Active Users | 500 | Analytics |
| Alert accuracy | > 90% | Manual validation |

---

## Optimal Build Order Rationale

1. **EAS Builds first** - Everything else is blocked by Expo Go limitations
2. **Weather Route API second** - Core differentiator, needed for shelter triggering
3. **Map layer third** - Visual feedback for weather routing
4. **Shelter discovery fourth** - Depends on weather alerts being functional
5. **Push notifications fifth** - Parallel track, can be developed alongside shelters
6. **AI integration last** - Enhancement layer, app is usable without it

This order ensures a **testable MVP at week 4** (weather routing) and **core MVP at week 8** (routing + shelters + alerts), with AI as polish in weeks 9-12.

---

## Next Action

**Start with Task T1.1:** Configure EAS Build for iOS

```bash
cd apps/mobile
npx eas-cli build:configure
```

---

## Quick Reference: API Endpoints Needed

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/routes/weather` | POST | Get weather along route | P0 |
| `/api/shelters/nearby` | GET | Find shelters near point | P0 |
| `/api/alerts/active` | GET | Get active weather alerts | P0 |
| `/api/routes` | CRUD | Manage saved routes | P1 |
| `/api/chat` | POST | AI conversation | P0 |
| `/api/notifications/register` | POST | Register push token | P0 |

---

## Environment Variables Checklist

```env
# Tomorrow.io (Weather)
TOMORROW_IO_API_KEY=

# Google Places (Shelters)
GOOGLE_PLACES_API_KEY=

# Mapbox
MAPBOX_ACCESS_TOKEN=
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=

# AI (choose one)
ANTHROPIC_API_KEY=
# or
GOOGLE_GEMINI_API_KEY=

# Push Notifications
EXPO_ACCESS_TOKEN=

# Existing (already configured)
DATABASE_URL=
BETTER_AUTH_SECRET=
POLAR_ACCESS_TOKEN=
```

---

## Sprint Planning (Agile View)

### Sprint 1 (Week 1-2): Foundation
- [ ] T1.1-T1.6: EAS Build Setup
- [ ] T2.1-T2.7: Database & Tomorrow.io API
- **Demo:** Show working dev build + weather API response

### Sprint 2 (Week 3-4): Weather Routing
- [ ] T3.1-T3.6: Map Weather Layer
- [ ] T4.1-T4.6: Route Creation UI
- **Demo:** Create route, see weather overlay

### Sprint 3 (Week 5-6): Shelters
- [ ] T5.1-T5.6: Google Places Integration
- [ ] T6.1-T6.6: Shelter UI & Deep Linking
- **Demo:** Trigger alert, see shelters, navigate

### Sprint 4 (Week 7-8): Alerts
- [ ] T7.1-T7.6: Push Notifications
- [ ] T8.1-T8.6: Background Location & Alerts
- **Demo:** Receive proactive alert while driving

### Sprint 5 (Week 9-10): AI Core
- [ ] T9.1-T9.6: AI Context System
- [ ] T10.1-T10.6: AI Function Calling
- **Demo:** Ask AI "Is it safe to drive?" with context

### Sprint 6 (Week 11-12): AI Polish
- [ ] T11.1-T11.6: Chat UI Enhancement
- [ ] T12.1-T12.6: AI Polish
- **Demo:** Full AI copilot workflow

### Sprint 7 (Week 13-14): Quality
- [ ] T13.1-T13.6: Testing
- [ ] T14.1-T14.6: Performance
- **Demo:** Performance metrics dashboard

### Sprint 8 (Week 15-16): Launch
- [ ] T15.1-T15.6: App Store Prep
- [ ] T16.1-T16.7: Beta & Launch
- **Demo:** App live in stores

---

## Definition of Done

A task is complete when:
1. Code is written and compiles without errors
2. TypeScript types are correct (no `any`)
3. Works on both iOS and Android simulators
4. Error states are handled gracefully
5. Spanish translation exists for user-facing text
6. Committed with descriptive message
