# AGENTS.md

Guidance for AI agents working in the Driwet monorepo.

## Project Overview

Driwet is an AI-powered storm alert and shelter finder app for drivers. Target market: Argentina/LATAM regions with frequent hail storms.

**Stack:** Turborepo + pnpm workspaces, Expo 54 / React Native 0.81 (mobile), Next.js 16 (platform/landing), oRPC API, Drizzle ORM, Neon PostgreSQL, Better Auth, Tailwind v4.

**Current Status:** MVP Ready - High-quality mobile app with AI copilot, weather radar, route planning, and subscription management.

## Monorepo Structure

```
apps/
  mobile/     # Expo 54 / React Native 0.81 (iOS & Android)
  platform/   # Next.js 16 dashboard (port 3001)
  landing/    # Next.js 16 marketing site (port 3000)
packages/
  api/        # oRPC routers (user, locations, alerts, chat, weather, routes, places, subscription)
  auth/       # Better Auth config with Drizzle adapter
  db/         # Drizzle ORM schemas for Neon PostgreSQL
  env/        # T3-style environment validation with Zod
  i18n/       # i18next internationalization
```

## Commands

```bash
# Development
pnpm dev              # All apps in parallel
pnpm dev:mobile       # Mobile only (Expo)
pnpm dev:platform     # Platform only (port 3001)
pnpm dev:landing      # Landing only (port 3000)

# Database (Neon PostgreSQL + Drizzle)
pnpm db:push          # Push schema changes
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio

# Quality
pnpm check            # Biome format + lint (auto-fix)
pnpm check-types      # TypeScript type check
pnpm build            # Build all packages/apps
```

**Mobile-specific (from `apps/mobile/`):**
```bash
pnpm dev              # Start Metro with --clear
pnpm ios              # Build and run iOS
pnpm android          # Build and run Android
pnpm prebuild         # Generate native code
```

## Recent Major Improvements (Completed)

### 1. Premium UI/UX Overhaul
- **Location Chips Component** (`components/location-chips.tsx`)
  - Two elegant chips: "Desde" (From) and "Hasta" (To)
  - Modal search with Mapbox integration
  - "Use my current location" option
  - Clean design with shadows and spacing
  - Smooth animations

- **Floating Tab Bar** (`components/floating-tab-bar.tsx`)
  - Custom animated tab bar using Reanimated
  - 3 tabs: Mapa, Rutas, Perfil
  - Circular indicator with spring animation
  - Floating design with rounded corners
  - Integrated into tab layout

### 2. Enhanced Onboarding Flow
- **5-Step Onboarding** (`components/onboarding/enhanced-onboarding.tsx`)
  - Hook Screen: Emotional storytelling with hail statistics
  - Promise Screen: 3 main benefits with icons
  - Demo Screen: Interactive steps with auto-rotation
  - Personalization: Trip preferences (IKEA Effect)
  - Signup: Social proof + guest option
  - Progress indicators and smooth animations

### 3. AI Copilot Integration
- **Navigation Agent** (`agents/navigation-agent.ts`)
  - Tools for weather analysis, route checking, safe stops
  - Integration with Tomorrow.io and OpenWeather
  - Spanish-first responses with emojis
  - Safety-first recommendations

- **Chat Panel UI** (`components/chat-panel.tsx`)
  - Real-time chat interface
  - Message timestamps and animations
  - Quick action buttons: "🌤️ Clima ruta", "⚠️ Alertas", "⛽ Paradas"
  - Typing indicator with animated dots
  - Integrated with useNavigationChat hook

### 4. Route Weather Visualization
- **Route Weather Component** (`components/route-weather-visualization.tsx`)
  - Color-coded segments (green → yellow → orange → red)
  - Timeline with weather icons
  - Risk distribution bar
  - Temperature, wind, precipitation per segment
  - Overall risk summary with badge

### 5. Safe Stops Suggestions
- **Safe Stops Component** (`components/safe-stops-suggestions.tsx`)
  - Shows recommended stops during storms
  - Types: gas stations, restaurants, hotels, rest areas
  - Distance from route, ratings, amenities
  - Estimated wait time for storm to pass
  - Navigate button for selected stop

### 6. Suggestions Sheet Improvements
- **Fixed Issues:**
  - Added close button (X) in header
  - Added "Navegar en Driwet" button (placeholder for future)
  - Added "Editar ruta" button to close and edit
  - Enabled swipe-down to close
  - Made Google Maps and Waze buttons secondary
  - Better layout with clear visual hierarchy

### 7. RevenueCat Unification
- **Fixed:** Eliminated duplicate payment flows
- Premium screen now informational only
- Uses RevenueCat native paywall for checkout
- No more confusion between custom UI and native UI

### 8. Database Schema
- **Users Table** includes:
  - `revenuecat_customer_id` for subscription sync
  - `is_premium`, `subscription_status`, `subscription_product_id`
  - `onboarding_completed`, `trip_preferences`

## Code Style Guidelines

### Formatting (Biome)
- **Indentation:** Tabs (not spaces)
- **Quotes:** Double quotes
- **Line width:** 80 characters
- **Semicolons:** Required
- Run `pnpm check` to auto-fix formatting

### Import Organization
Biome organizes imports automatically. Order:
1. External packages (react, zod, etc.)
2. Internal workspace packages (@driwet/*)
3. Relative imports (../, ./)

Use `import type` for type-only imports.

### Naming Conventions
- **Components:** PascalCase (SignIn, ErrorBoundary)
- **Component files:** kebab-case (sign-in.tsx, error-boundary.tsx)
- **Database tables:** snake_case (users, user_locations)
- **Database columns:** snake_case (created_at, email_verified)
- **Routers:** camelCase with Router suffix (userRouter, alertsRouter)
- **Variables/functions:** camelCase
- **Constants:** UPPER_SNAKE_CASE

### TypeScript
- Strict mode enabled
- No unused variables/imports enforced
- Use explicit return types for exported functions
- Prefer `interface` over `type` for object shapes
- Use `satisfies` for inline type assertions

### Tailwind Classes
Biome sorts Tailwind classes automatically for functions: `clsx`, `cva`, `cn`.

### Error Handling
- Use try/catch in async handlers
- API errors: Use ORPC's `ORPCError` with appropriate error codes
- UI errors: Use ErrorBoundary components
- Return structured error objects with `message` field

### API Patterns (oRPC)
- Use `publicProcedure` for unauthenticated endpoints
- Use `protectedProcedure` for authenticated endpoints
- Context includes session from Better Auth
- Input validation with Zod schemas
- Routers export objects with procedure definitions

### Database Patterns (Drizzle)
- Tables in `packages/db/src/schema/`
- Use `pgTable()` for table definitions
- Column names: snake_case
- Always add indexes for foreign keys and frequently queried columns
- Use relations for defining table relationships
- Timestamps: `created_at`, `updated_at` with `defaultNow()` and `$onUpdate()`

### Component Patterns
- Use named exports: `export { ComponentName }`
- Props interface named `{ComponentName}Props`
- Prefer function declarations over arrow functions for components
- Use HeroUI Native components in mobile app
- Use HeroUI React components in platform app

## Mobile Development

- Expo Router for file-based navigation in `apps/mobile/app/`
- HeroUI Native components + Tailwind (uniwind)
- Mapbox requires `MAPBOX_DOWNLOAD_TOKEN` secret for EAS builds
- RevenueCat for subscriptions (react-native-purchases)
- Zustand for local state, TanStack Query for server state
- Reanimated for animations (already installed, no build issues)

## Key Components Architecture

### Main Screen Layout (app/(app)/(tabs)/index.tsx)
```
Top Section:
├── Trial Banner (if applicable)
├── Upcoming Trip Banner (if scheduled)
├── Safety Status Card (when no route)
└── Quick Routes Bar (saved routes)

Middle Section:
├── Location Chips (Desde/Hasta) - Always visible
├── Map with weather overlay
└── Suggestions FAB (when route active)

Bottom Section:
├── Route Info Chips (when route active)
├── Chat Panel (when route active)
└── Floating Tab Bar (always visible)
```

### Navigation Flow
1. User opens app → Onboarding (if first time)
2. Main screen → Select origin/destination via Location Chips
3. Route displayed on map with weather overlay
4. Suggestions sheet shows route details, alerts, stops
5. Chat Panel available for AI assistance
6. Can schedule trips with notifications

## Adding Features

1. **Schema change:** Edit `packages/db/src/schema/` → `pnpm db:generate` → `pnpm db:push`
2. **API endpoint:** Add to existing router or create new one in `packages/api/src/routers/`
3. **Frontend:** Consume via oRPC client with TanStack Query integration

## Environment Variables

Server needs: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TOMORROW_IO_API_KEY`
Mobile needs: `EXPO_PUBLIC_SERVER_URL`, `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

## External APIs

- **Tomorrow.io** - Primary weather data and alerts
- **OpenWeather** - Fallback weather
- **Mapbox** - Maps (RNMapbox) and places search
- **RevenueCat** - Mobile subscriptions
- **PostHog** - Analytics
- **Resend** - Transactional email

## Authentication

Better Auth with:
- Providers: email/password, Google OAuth, Apple OAuth
- Plugins: organizations, expo (mobile)
- 30-day sessions with daily refresh

## Roadmap / Next Steps

### Immediate (Pre-Launch)
- [ ] Test builds on iOS and Android devices
- [ ] Verify RevenueCat sandbox purchases
- [ ] Test push notifications for scheduled trips
- [ ] Analytics tracking verification

### Post-Launch (V1.1)
- [ ] In-app navigation (turn-by-turn)
- [ ] Real-time weather radar updates
- [ ] Community reports (user-submitted alerts)
- [ ] Voice commands for copilot
- [ ] Apple Watch companion app

### Future (V2.0)
- [ ] Fleet management for companies
- [ ] Integration with car systems (CarPlay/Android Auto)
- [ ] Predictive AI for storm avoidance
- [ ] Multi-stop route optimization
- [ ] Offline mode with cached maps

## Known Issues / Technical Debt

1. **Type Errors:** Some API type mismatches in `agents/navigation-agent.ts` (non-blocking)
2. **Icon Library:** Some icon names may need verification in `components/icons.tsx`
3. **Testing:** Need comprehensive E2E tests for critical paths

## MVP Status: READY FOR TESTING ✅

All core features implemented:
- ✅ User authentication
- ✅ Route planning with weather
- ✅ AI copilot chat
- ✅ Safe stop recommendations
- ✅ Trip scheduling with notifications
- ✅ Premium subscriptions
- ✅ Onboarding flow
- ✅ Premium UI/UX

**Ready for:**
- Device testing
- Beta testing with users
- App Store/Play Store submission prep
