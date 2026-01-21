🌩️

**DRIWET**

_Weather-Intelligent Navigation for Latin America_

**Product Roadmap & Technical Specification**

MVP Development Guide

B2C Mobile App → B2B Fleet Platform

| **Document Version:** 1.0<br><br>**Date:** January 21, 2026 | **Author:** Lucas<br><br>**Status:** Planning Phase |
| --- | --- |

# 1\. Executive Summary

DRIWET (consumer brand: Advia) is a weather-intelligent navigation platform designed to protect drivers during severe weather events. The app combines real-time weather data, AI-powered route analysis, and dynamic shelter discovery to guide users to safety during storms, tornadoes, and other dangerous conditions.

**Market Opportunity:** Latin America experiences frequent severe weather events, with Argentina's Pampas region having tornado frequency comparable to North America's Tornado Alley. Despite this, no consumer app currently offers integrated weather-aware routing with shelter guidance in Spanish for the LATAM market.

**Business Model:** Phase 1 (B2C) targets individual drivers with freemium mobile app. Phase 2 (B2B) expands to fleet management and logistics companies with SaaS dashboard and API access.

# 2\. Product Vision

## 2.1 Core Value Proposition

- **Weather-Aware Routing:** See weather conditions along your entire route before and during travel
- **Dynamic Shelter Discovery:** Automatically find safe locations (gas stations, covered parking, sturdy buildings) when storms approach
- **AI Copilot:** Conversational assistant that understands weather context and provides actionable guidance
- **Proactive Alerts:** Push notifications before dangerous weather impacts your route, not just your location

## 2.2 Target Users

**B2C (Phase 1):**

- Daily commuters in storm-prone regions of Argentina
- Road trippers and long-distance travelers
- Parents concerned about family safety during travel
- Outdoor enthusiasts visiting beaches, rivers, and recreational areas

**B2B (Phase 2):**

- Logistics and trucking companies
- Delivery fleet operators (last-mile, food delivery)
- Field service companies with mobile workforce
- Insurance companies seeking driver safety tools

# 3\. Current State Analysis

## 3.1 What Exists Today

Based on the current codebase, the following features are already implemented:

| **Component** | **Status** | **Tech Stack** |
| --- | --- | --- |
| Expo Mobile App | ✅ Basic structure | Expo, React Native |
| Mapbox Integration | ✅ Working | @rnmapbox/maps |
| Tomorrow.io Weather | ✅ Basic alerts | REST API |
| Authentication | ✅ Implemented | better-auth |
| i18n (EN/ES) | ✅ Working | expo-localization |
| Bottom Sheet Chat UI | ✅ Basic UI | react-native-bottom-sheet |
| AI Chat Backend | ⚠️ Partial | Needs enhancement |
| Route Weather Display | ❌ Not started | Pending |
| Shelter Discovery | ❌ Not started | Pending |
| CarPlay/Android Auto | ❌ Not started | Future phase |

## 3.2 Technical Debt & Limitations

- **Expo Go Dependency:** Current setup requires Expo Go which limits native module access. Need to migrate to Development Builds for full Mapbox SDK capabilities.
- **Static Weather Display:** Weather shown for current location only, not along planned routes.
- **No Shelter Database:** No infrastructure for discovering and storing safe locations.
- **Basic AI Integration:** Chat exists but lacks weather context and actionable capabilities.

# 4\. MVP Requirements (B2C)

## 4.1 Core Features

### Feature 1: Weather-Aware Route Display

**Description:** Display real-time weather conditions along the user's planned or active route, with visual indicators for hazardous segments.

**Acceptance Criteria:**

- Route line color changes based on weather severity (green/yellow/red)
- Weather icons displayed at key points along route
- ETA adjusts based on expected weather delays
- Updates every 60 seconds during active navigation

**Technical Implementation:**

- Tomorrow.io Route Weather API for weather along path
- Mapbox Directions API for route geometry
- Custom Mapbox layer with interpolated colors based on weather risk score

### Feature 2: Dynamic Shelter Discovery

**Description:** Automatically identify and display safe shelter locations when dangerous weather is detected on or near the user's route.

**Acceptance Criteria:**

- Shelters displayed as pins on map when alert triggered
- Shelter types: gas stations, covered parking, sturdy commercial buildings
- One-tap navigation to nearest shelter via deep link to Waze/Google Maps
- Shelter cards show distance, ETA, and type

**Technical Implementation:**

- Google Places API for POI discovery (type filters: gas_station, parking, etc.)
- Custom scoring algorithm: distance + structure type + reviews
- expo-linking for deep links to navigation apps

### Feature 3: Proactive Weather Alerts

**Description:** Push notifications that warn users before dangerous weather impacts their route, not just their current location.

**Acceptance Criteria:**

- Alerts triggered 15-30 minutes before weather impact
- Alert includes: weather type, severity, time until impact, suggested action
- Critical alerts override Do Not Disturb (with user permission)
- Integration with SMN Argentina official alerts

**Technical Implementation:**

- Tomorrow.io Alerts API with custom thresholds
- Expo Notifications for push delivery
- Background location tracking for route-aware alerts

### Feature 4: AI Weather Copilot

**Description:** Conversational AI assistant in bottom sheet that understands weather context and provides actionable recommendations.

**Acceptance Criteria:**

- Natural language queries: "Is it safe to drive to Mar del Plata today?"
- Context-aware responses using current location, planned route, and weather data
- Quick actions: "Find shelter", "Show weather on route", "Alert family"
- Last 3 conversations visible in collapsed state

**Technical Implementation:**

- Claude/Gemini API with system prompt including weather context
- Function calling for actions (find_shelter, calculate_route, etc.)
- TanStack Query for conversation state management

# 5\. Technical Architecture

## 5.1 Technology Stack

| **Layer** | **Technology** | **Purpose** |
| --- | --- | --- |
| Mobile App | Expo + React Native | Cross-platform iOS/Android |
| Maps | @rnmapbox/maps | Interactive maps with custom layers |
| Navigation | Mapbox Directions API | Route calculation |
| Weather Data | Tomorrow.io API | Forecasts, alerts, route weather |
| Shelter POIs | Google Places API | Points of interest discovery |
| AI Backend | Claude/Gemini API | Conversational intelligence |
| State Management | TanStack Query + Zustand | Data fetching and local state |
| Backend API | Next.js 15 API Routes | Server endpoints |
| Database | NeonDB (PostgreSQL) | User data, shelters, history |
| ORM | Drizzle ORM | Type-safe database access |
| Auth | better-auth | Authentication flows |
| Monorepo | Turborepo | Shared code between apps |

## 5.2 System Architecture Diagram

┌─────────────────────────────────────────────────────────────────┐ │ MOBILE APP (Expo) │ ├─────────────────────────────────────────────────────────────────┤ │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│ │ │ Map │ │ Weather │ │ Shelter │ │ AI Chat ││ │ │ Screen │ │ Overlay │ │ Finder │ │ Bottom Sheet ││ │ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘│ │ │ │ │ │ │ │ └─────────────┴─────────────┴──────────────────┘ │ │ │ │ │ ┌─────────┴─────────┐ │ │ │ API Layer │ │ │ │ (TanStack Query) │ │ │ └─────────┬─────────┘ │ └──────────────────────────────┼──────────────────────────────────┘ │ ┌──────────┴──────────┐ │ Next.js Backend │ │ (API Routes) │ └──────────┬──────────┘ │ ┌──────────────────────┼──────────────────────┐ │ │ │ ┌───────┴───────┐ ┌────────┴────────┐ ┌───────┴───────┐ │ Tomorrow.io │ │ Google Places │ │ Claude/ │ │ Weather API │ │ API │ │ Gemini API │ └───────────────┘ └─────────────────┘ └───────────────┘

## 5.3 Data Flow

- **Route Creation:** User enters destination → Mapbox calculates route → Tomorrow.io fetches weather for route segments
- **Weather Monitoring:** Background job polls Tomorrow.io every 60s → Compares against thresholds → Triggers alerts if dangerous
- **Shelter Discovery:** Alert triggered → Find danger point on route → Query Google Places for POIs in 5km radius → Score and rank → Display to user
- **AI Interaction:** User message → Inject context (location, route, weather) → Send to LLM → Parse response for actions → Execute or display

# 6\. Development Phases

## Phase 1: Foundation (Weeks 1-4)

**Goal:** Migrate to development builds and establish weather routing infrastructure

| **Task** | **Effort** | **Priority** |
| --- | --- | --- |
| Setup EAS Build + Development Builds | 2 days | P0 - Critical |
| Configure @rnmapbox/maps with dev builds | 2 days | P0 - Critical |
| Implement Tomorrow.io Route Weather API | 3 days | P0 - Critical |
| Create weather overlay layer for Mapbox | 3 days | P0 - Critical |
| Design and implement new Map Screen UI | 4 days | P1 - High |
| Setup NeonDB + Drizzle ORM schemas | 2 days | P1 - High |

**Deliverables:**

- Working development build on iOS and Android simulators
- Route with weather conditions displayed as colored line
- Database schema for users, routes, and weather history

## Phase 2: Core Features (Weeks 5-8)

**Goal:** Implement shelter discovery and enhanced alert system

| **Task** | **Effort** | **Priority** |
| --- | --- | --- |
| Integrate Google Places API for shelter POIs | 3 days | P0 - Critical |
| Build shelter scoring algorithm | 2 days | P0 - Critical |
| Implement shelter card UI and map pins | 3 days | P0 - Critical |
| Deep linking to Waze/Google Maps | 2 days | P0 - Critical |
| Enhanced push notification system | 4 days | P1 - High |
| Background location tracking | 3 days | P1 - High |
| Route-aware alert triggering | 3 days | P1 - High |

**Deliverables:**

- Shelter pins appear when dangerous weather detected
- One-tap navigation to shelter via external apps
- Proactive alerts 15+ minutes before weather impacts route

## Phase 3: AI Integration (Weeks 9-12)

**Goal:** Implement AI copilot with weather context and function calling

| **Task** | **Effort** | **Priority** |
| --- | --- | --- |
| Design AI system prompt with weather context | 2 days | P0 - Critical |
| Implement function calling for shelter/route actions | 4 days | P0 - Critical |
| Redesign bottom sheet chat UI | 3 days | P0 - Critical |
| Conversation history (last 3 visible) | 2 days | P1 - High |
| Quick action buttons in chat | 2 days | P1 - High |
| Voice input integration | 3 days | P2 - Medium |

## Phase 4: Polish & Launch (Weeks 13-16)

**Goal:** Finalize MVP, testing, and launch preparation

| **Task** | **Effort** | **Priority** |
| --- | --- | --- |
| End-to-end testing and bug fixes | 5 days | P0 - Critical |
| Performance optimization | 3 days | P0 - Critical |
| App Store / Play Store submission prep | 3 days | P0 - Critical |
| Onboarding flow and tutorials | 3 days | P1 - High |
| Analytics integration (Mixpanel/Amplitude) | 2 days | P1 - High |
| Beta testing with 50 users | 5 days | P1 - High |

# 7\. B2B Platform (Phase 2)

Following successful B2C launch and validation, expand to fleet and logistics market.

## 7.1 B2B Product Features

- **Fleet Dashboard (Next.js Web App):** Real-time view of all vehicles with weather overlay, bulk route optimization, weather-based dispatch recommendations
- **Driver Mobile Companion:** Simplified version of B2C app for fleet drivers, integrated with company dispatch system
- **Alerting & Communication:** WhatsApp/SMS alerts to drivers, escalation to dispatch, automated safety protocols
- **Analytics & Reporting:** Weather delay tracking, storms avoided, estimated cost savings, compliance reports
- **API Access:** RESTful API for integration with existing TMS, ERP, and fleet management systems

## 7.2 B2B Technical Stack

| **Component** | **Technology** |
| --- | --- |
| Dashboard Frontend | Next.js 15 + shadcn/ui + TanStack Table |
| Real-time Updates | WebSockets / Server-Sent Events |
| Map Visualization | Mapbox GL JS with fleet tracking |
| Authentication | better-auth with organization support |
| Multi-tenancy | Row-level security in NeonDB |
| API Layer | oRPC for type-safe client-server |
| Notifications | Twilio (SMS), WhatsApp Business API |
| Background Jobs | Inngest or Trigger.dev |

## 7.3 B2B Pricing Model

| **Tier** | **Price** | **Features** |
| --- | --- | --- |
| Starter | \$5/vehicle/month | Up to 25 vehicles, basic dashboard, alerts |
| Professional | \$10/vehicle/month | Up to 100 vehicles, API access, analytics |
| Enterprise | Custom pricing | Unlimited vehicles, SLA, dedicated support |

# 8\. Cost Estimates

## 8.1 API Costs (Monthly, 10K MAU)

| **Service** | **Free Tier** | **Est. Usage** | **Cost** |
| --- | --- | --- | --- |
| Mapbox Maps | 50K loads/mo | ~30K loads | \$0 |
| Mapbox Directions | Free tier | ~50K requests | ~\$50 |
| Tomorrow.io | 500 calls/day | ~100K/mo | ~\$100 |
| Google Places | \$200 credit | ~20K requests | ~\$50 |
| Claude API | N/A | ~500K tokens | ~\$15 |
| NeonDB | Free tier | Basic usage | \$0 |
| Vercel Hosting | Hobby tier | Included | \$0 |
| Push Notifications | Free tier | ~50K/mo | \$0 |
|     |     | **TOTAL** | **~\$215/mo** |

## 8.2 Development Resources

- **Solo Developer (You):** Full-stack development, 16 weeks estimated
- **Claude Code Skills:** Leverage AI assistance for Expo, Next.js, TypeScript development
- **Testing Devices:** iOS Simulator, Android Emulator, 1 physical device each platform

# 9\. Success Metrics

## 9.1 MVP Launch Targets (3 months post-launch)

| **Metric** | **Target** | **Stretch Goal** |
| --- | --- | --- |
| App Downloads | 5,000 | 10,000 |
| Daily Active Users (DAU) | 500 | 1,000 |
| Alerts Sent / Month | 10,000 | 25,000 |
| Shelter Navigations / Month | 500 | 1,000 |
| App Store Rating | 4.0+ | 4.5+ |
| Free to Premium Conversion | 2%  | 5%  |
| User Retention (30-day) | 25% | 40% |

## 9.2 Key Performance Indicators

- **Alert Accuracy:** % of alerts that corresponded to actual severe weather events
- **Shelter Utilization:** % of shelter recommendations that were actually navigated to
- **AI Engagement:** Average conversations per user, satisfaction ratings
- **Safety Impact:** User-reported storm avoidance, qualitative feedback

# 10\. Appendix: Claude Code Skills Reference

The following skills and patterns should be leveraged when developing with Claude Code assistance:

## 10.1 Expo / React Native Patterns

- Use Expo Router for file-based navigation
- Implement EAS Build for development builds (required for Mapbox)
- Use expo-location for background location tracking
- Implement expo-notifications for push notifications
- Use expo-linking for deep links to external apps

## 10.2 Next.js 15 Patterns

- Use App Router with Server Components by default
- Implement API routes in app/api/ directory
- Use Server Actions for mutations where appropriate
- Implement proper error boundaries and loading states

## 10.3 TypeScript Best Practices

- Define strict types for all API responses
- Use Zod for runtime validation of external data
- Leverage Drizzle ORM for type-safe database queries
- Use oRPC or tRPC for end-to-end type safety

## 10.4 Key Dependencies

// Mobile App (Expo) @rnmapbox/maps // Mapbox integration @tanstack/react-query // Data fetching zustand // State management expo-location // GPS tracking expo-notifications // Push notifications react-native-bottom-sheet // Backend (Next.js) drizzle-orm // Database ORM @neondatabase/serverless better-auth // Authentication orpc // Type-safe API zod // Validation // Shared (Turborepo) typescript eslint prettier

**Ready to Build the #1 Weather Navigation App in LATAM**

🌩️ DRIWET / Advia 🌩️

**Next Steps:**

- Setup EAS Build environment
- Configure Mapbox with development builds
- Implement Tomorrow.io Route Weather integration
- Begin Phase 1 development sprint