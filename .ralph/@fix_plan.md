# Ralph Fix Plan - DRIWET MVP

> **Last Updated:** 2026-01-22
> **Status:** Phase 1 nearly complete, starting Phase 2 features

---

## Current Sprint: Route Weather + Shelter Discovery

### P0 - Critical (This Sprint)
- [ ] Implement weather-colored route segments on map
- [ ] Add Google Places API for shelter POI discovery
- [ ] Complete Chat ↔ Map integration (tools update map state)
- [ ] Setup expo-notifications for push alerts

### P1 - High Priority (Next Sprint)
- [ ] Add shelter scoring algorithm (distance + structure + reviews)
- [ ] Deep linking to Waze/Google Maps for shelter navigation
- [ ] Background location tracking (battery-efficient)
- [ ] Route-aware alert triggering (15-30 min advance warning)

---

## ✅ Completed (Already Implemented)

### Infrastructure
- [x] EAS Build configuration (`eas.json` with dev/preview/production)
- [x] Mapbox integration (`@rnmapbox/maps` working)
- [x] Better Auth authentication (sign-in, sign-up, magic link)
- [x] Drizzle ORM + NeonDB schemas (all tables defined)
- [x] ORPC API architecture with protected procedures

### Weather Integrations
- [x] Tomorrow.io API integration (timelines, events, route analysis)
- [x] NOAA API integration (alerts by point, zone, national)
- [x] Weather caching (grid-based with dynamic TTL)
- [x] Risk calculation algorithm (low/moderate/high/extreme)
- [x] API quota tracking (500 calls/day limit)

### AI Chat
- [x] Gemini 2.0 Flash integration with Vercel AI SDK
- [x] Tool: getWeatherAlerts - query alerts by coordinates
- [x] Tool: showAlertOnMap - visualization with zoom
- [x] Tool: analyzeRoute - safety analysis (3-point sampling)
- [x] Tool: getUserLocation - request location context
- [x] Spanish-first responses with emoji support

### Mobile App
- [x] MapView component with alert polygon rendering
- [x] Chat panel UI (bottom sheet style)
- [x] Weather overlay component
- [x] Location permissions (foreground + background)
- [x] Tab navigation (home, routes, profile)
- [x] Dark/light theme support

### Database Schema
- [x] user, session, account tables (auth)
- [x] organization, org_member tables (B2B ready)
- [x] vehicle, fleet_alert_history (B2B fleet)
- [x] user_location, push_token (user data)
- [x] saved_route, trip_history (route tracking)
- [x] chat_session (with tool calls)
- [x] alert_history, weather_cache (weather)
- [x] route_weather_analysis, safe_places_cache
- [x] api_usage (quota tracking)

---

## Phase 2: Core Features (Current)

### Weather-Aware Route Display
**Goal:** Show weather conditions along route as colored line segments

**Tasks:**
1. [ ] Create `RouteWeatherLayer` component for Mapbox
2. [ ] Implement color interpolation (green→yellow→red) based on risk
3. [ ] Add weather icons at key points along route
4. [ ] Update every 60 seconds during active navigation

**Tech:** Mapbox LineLayer with data-driven styling

### Shelter Discovery
**Goal:** Find safe places when dangerous weather detected

**Tasks:**
1. [ ] Add Google Places API integration
2. [ ] Create shelter types filter (gas_station, parking, etc.)
3. [ ] Implement shelter card UI with distance/ETA
4. [ ] Add one-tap navigation via deep links

**Tech:** Google Places Nearby Search → expo-linking → Waze/Google Maps

### Push Notifications
**Goal:** Proactive alerts before weather impacts route

**Tasks:**
1. [ ] Configure expo-notifications
2. [ ] Create push token registration endpoint
3. [ ] Implement alert trigger service
4. [ ] Add critical alert support (override DND)

---

## Phase 3: AI Integration (Upcoming)

- [ ] Enhanced system prompt with full weather context
- [ ] Function calling for shelter/route actions
- [ ] Conversation history display (last 3)
- [ ] Quick action buttons
- [ ] Voice input (P2)

---

## Phase 4: Polish & Launch (Future)

- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] App Store / Play Store submission
- [ ] Onboarding flow
- [ ] Analytics (Mixpanel/Amplitude)
- [ ] Beta testing (50 users)

---

## Technical Debt

- [ ] Add proper error boundaries in native app
- [ ] Implement offline fallback for maps
- [ ] Add retry logic for weather API failures
- [ ] Optimize bundle size

---

## API Keys Status

| Service | Status | Notes |
|---------|--------|-------|
| Mapbox | ✅ Configured | Access token in env |
| Tomorrow.io | ✅ Configured | API key in env |
| Google AI (Gemini) | ✅ Configured | API key in env |
| NOAA | ✅ Working | No key required |
| Google Places | ⏳ Needed | For shelter discovery |
| Expo Push | ⏳ Needed | For notifications |

---

## Notes

- Focus on completing the weather-route display first - it's the core differentiator
- Shelter discovery requires Google Places API key
- Push notifications need Expo push token setup
- All B2B infrastructure (organizations, vehicles, fleet alerts) is already in place
