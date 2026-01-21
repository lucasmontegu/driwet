# Driwet Mobile App Phase 2 - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove mocks and implement real data flow with oRPC APIs, i18n, Hugeicons, and UX improvements.

**Architecture:** Shared i18n package with i18next, TanStack Query with AsyncStorage persistence for offline-first data, oRPC streaming with ai-sdk-tools for chat, Hugeicons for consistent iconography.

**Tech Stack:** i18next, react-i18next, @hugeicons/react-native, @tanstack/react-query-persist-client, oRPC, ai-sdk-tools, Drizzle ORM.

**Reference:** `docs/plans/2026-01-20-mobile-app-phase2-design.md`

---

## Phase 1: i18n Package Setup

### Task 1.1: Create @driwet/i18n package structure

**Files:**
- Create: `packages/i18n/package.json`
- Create: `packages/i18n/tsconfig.json`
- Create: `packages/i18n/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@driwet/i18n",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    },
    "./locales/*": {
      "default": "./src/locales/*.json"
    }
  },
  "dependencies": {
    "i18next": "^24.2.2",
    "react-i18next": "^15.4.1"
  },
  "devDependencies": {
    "@driwet/config": "workspace:*",
    "typescript": "catalog:"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "@driwet/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create src/index.ts**

```typescript
// packages/i18n/src/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

export const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

export const defaultNS = 'translation';
export const fallbackLng = 'en';
export const supportedLngs = ['en', 'es'] as const;

export type SupportedLanguage = (typeof supportedLngs)[number];

export function initI18n(lng: SupportedLanguage = 'es') {
  return i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng,
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });
}

export { i18n };
export { useTranslation, Trans } from 'react-i18next';
```

**Step 4: Commit**

```bash
git add packages/i18n/
git commit -m "feat(i18n): create shared i18n package structure"
```

---

### Task 1.2: Create Spanish translations

**Files:**
- Create: `packages/i18n/src/locales/es.json`

**Step 1: Create es.json**

```json
{
  "common": {
    "continue": "Continuar",
    "cancel": "Cancelar",
    "save": "Guardar",
    "delete": "Eliminar",
    "loading": "Cargando...",
    "error": "Error",
    "retry": "Reintentar",
    "or": "o"
  },
  "welcome": {
    "tagline": "Tu co-piloto climático",
    "subtitle": "Evita tormentas. Llega seguro.",
    "startFree": "Comenzar gratis",
    "trialInfo": "3 días con todo incluido, sin cuenta",
    "haveAccount": "¿Ya tienes cuenta?",
    "signIn": "Inicia sesión"
  },
  "auth": {
    "signInTitle": "Inicia sesión",
    "signInSubtitle": "Sincroniza tus rutas y alertas en todos tus dispositivos",
    "continueWithGoogle": "Continuar con Google",
    "continueWithApple": "Continuar con Apple",
    "continueWithEmail": "Continuar con email",
    "enterEmail": "Ingresa tu email",
    "emailPlaceholder": "tu@email.com",
    "sendMagicLink": "Enviar magic link",
    "sending": "Enviando...",
    "checkEmail": "Revisa tu email",
    "magicLinkSent": "Enviamos un link de acceso a",
    "openEmailApp": "Abrir app de email",
    "useAnotherEmail": "Usar otro email",
    "connecting": "Conectando...",
    "back": "Volver",
    "enterEmailError": "Ingresa tu email",
    "sendError": "Error al enviar el link. Intenta de nuevo."
  },
  "tabs": {
    "map": "Mapa",
    "routes": "Rutas",
    "profile": "Perfil"
  },
  "map": {
    "myZone": "Mi zona",
    "chatPlaceholder": "Escribe un mensaje...",
    "chatPrompt": "¿A dónde vas hoy?",
    "suggestions": {
      "workRoute": "Mi ruta al trabajo",
      "nearbyAlerts": "Alertas cercanas",
      "willItRain": "¿Va a llover hoy?"
    }
  },
  "alerts": {
    "extreme": "Alerta extrema",
    "severe": "Alerta severa",
    "moderate": "Alerta moderada",
    "minor": "Alerta menor",
    "distance": "a {{distance}}"
  },
  "routes": {
    "title": "Mis Rutas",
    "addNew": "Agregar nueva ruta",
    "history": "Historial",
    "noAlerts": "Sin alertas",
    "clear": "Despejado",
    "rain": "Lluvia {{time}}",
    "avoidedStorm": "Evitaste tormenta",
    "safeRoute": "Ruta segura",
    "estimatedSavings": "Ahorro estimado: {{amount}}"
  },
  "profile": {
    "title": "Perfil",
    "stats": "Estadísticas",
    "stormsAvoided": "{{count}} tormentas evitadas",
    "moneySaved": "~${{amount}} ahorrados",
    "kmTraveled": "{{km}} km recorridos seguro",
    "settings": "Configuración",
    "notifications": "Notificaciones",
    "savedLocations": "Ubicaciones guardadas",
    "theme": "Tema",
    "themeAuto": "Auto",
    "language": "Idioma",
    "languageSpanish": "Español",
    "languageEnglish": "English",
    "help": "Ayuda y soporte",
    "logout": "Cerrar sesión",
    "trialRemaining": "Trial: {{days}} días restantes",
    "planPremium": "Plan: Premium",
    "upgrade": "Upgrade"
  },
  "premium": {
    "title": "Driwet Premium",
    "features": {
      "unlimitedRoutes": "Rutas ilimitadas",
      "realTimeAlerts": "Alertas en tiempo real",
      "noAds": "Sin anuncios",
      "refugeLocations": "Lugares de refugio",
      "fullHistory": "Historial completo",
      "multipleLocations": "Múltiples ubicaciones"
    },
    "monthly": "$4.99/mes",
    "yearly": "$39.99/año (ahorra 33%)",
    "cancelAnytime": "Cancela cuando quieras",
    "processedBy": "Pago procesado por Polar"
  },
  "loginIncentive": {
    "title": "Guarda tus datos",
    "subtitle": "Inicia sesión para sincronizar rutas y ubicaciones en todos tus dispositivos.",
    "continueWithoutAccount": "Continuar sin cuenta",
    "localDataOnly": "(datos solo locales)"
  },
  "chat": {
    "placeholder": "Escribe un mensaje...",
    "comingSoon": "Esta funcionalidad estará disponible pronto."
  }
}
```

**Step 2: Commit**

```bash
git add packages/i18n/src/locales/es.json
git commit -m "feat(i18n): add Spanish translations"
```

---

### Task 1.3: Create English translations

**Files:**
- Create: `packages/i18n/src/locales/en.json`

**Step 1: Create en.json**

```json
{
  "common": {
    "continue": "Continue",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "Error",
    "retry": "Retry",
    "or": "or"
  },
  "welcome": {
    "tagline": "Your climate co-pilot",
    "subtitle": "Avoid storms. Arrive safely.",
    "startFree": "Start for free",
    "trialInfo": "3 days with everything included, no account needed",
    "haveAccount": "Already have an account?",
    "signIn": "Sign in"
  },
  "auth": {
    "signInTitle": "Sign in",
    "signInSubtitle": "Sync your routes and alerts across all your devices",
    "continueWithGoogle": "Continue with Google",
    "continueWithApple": "Continue with Apple",
    "continueWithEmail": "Continue with email",
    "enterEmail": "Enter your email",
    "emailPlaceholder": "you@email.com",
    "sendMagicLink": "Send magic link",
    "sending": "Sending...",
    "checkEmail": "Check your email",
    "magicLinkSent": "We sent an access link to",
    "openEmailApp": "Open email app",
    "useAnotherEmail": "Use another email",
    "connecting": "Connecting...",
    "back": "Back",
    "enterEmailError": "Please enter your email",
    "sendError": "Error sending the link. Please try again."
  },
  "tabs": {
    "map": "Map",
    "routes": "Routes",
    "profile": "Profile"
  },
  "map": {
    "myZone": "My zone",
    "chatPlaceholder": "Type a message...",
    "chatPrompt": "Where are you going today?",
    "suggestions": {
      "workRoute": "My route to work",
      "nearbyAlerts": "Nearby alerts",
      "willItRain": "Will it rain today?"
    }
  },
  "alerts": {
    "extreme": "Extreme alert",
    "severe": "Severe alert",
    "moderate": "Moderate alert",
    "minor": "Minor alert",
    "distance": "{{distance}} away"
  },
  "routes": {
    "title": "My Routes",
    "addNew": "Add new route",
    "history": "History",
    "noAlerts": "No alerts",
    "clear": "Clear",
    "rain": "Rain at {{time}}",
    "avoidedStorm": "Avoided storm",
    "safeRoute": "Safe route",
    "estimatedSavings": "Estimated savings: {{amount}}"
  },
  "profile": {
    "title": "Profile",
    "stats": "Statistics",
    "stormsAvoided": "{{count}} storms avoided",
    "moneySaved": "~${{amount}} saved",
    "kmTraveled": "{{km}} km traveled safely",
    "settings": "Settings",
    "notifications": "Notifications",
    "savedLocations": "Saved locations",
    "theme": "Theme",
    "themeAuto": "Auto",
    "language": "Language",
    "languageSpanish": "Español",
    "languageEnglish": "English",
    "help": "Help & support",
    "logout": "Sign out",
    "trialRemaining": "Trial: {{days}} days remaining",
    "planPremium": "Plan: Premium",
    "upgrade": "Upgrade"
  },
  "premium": {
    "title": "Driwet Premium",
    "features": {
      "unlimitedRoutes": "Unlimited routes",
      "realTimeAlerts": "Real-time alerts",
      "noAds": "No ads",
      "refugeLocations": "Refuge locations",
      "fullHistory": "Full history",
      "multipleLocations": "Multiple locations"
    },
    "monthly": "$4.99/month",
    "yearly": "$39.99/year (save 33%)",
    "cancelAnytime": "Cancel anytime",
    "processedBy": "Payment processed by Polar"
  },
  "loginIncentive": {
    "title": "Save your data",
    "subtitle": "Sign in to sync routes and locations across all your devices.",
    "continueWithoutAccount": "Continue without account",
    "localDataOnly": "(local data only)"
  },
  "chat": {
    "placeholder": "Type a message...",
    "comingSoon": "This feature will be available soon."
  }
}
```

**Step 2: Commit**

```bash
git add packages/i18n/src/locales/en.json
git commit -m "feat(i18n): add English translations"
```

---

### Task 1.4: Install i18n dependencies and update pnpm workspace

**Step 1: Install dependencies in root**

```bash
cd /Users/lucasmontegu/apps/driwet && pnpm install
```

**Step 2: Commit lock file**

```bash
git add pnpm-lock.yaml
git commit -m "chore: update pnpm-lock after i18n package"
```

---

## Phase 2: Install Dependencies

### Task 2.1: Install native app dependencies

**Files:**
- Modify: `apps/native/package.json`

**Step 1: Add dependencies**

```bash
cd apps/native && pnpm add @hugeicons/react-native @hugeicons/core-free-icons @tanstack/query-async-storage-persister @tanstack/react-query-persist-client expo-localization@~16.0.0 react-i18next i18next @driwet/i18n
```

**Step 2: Commit**

```bash
git add apps/native/package.json pnpm-lock.yaml
git commit -m "deps(native): add hugeicons, query-persist, i18n dependencies"
```

---

### Task 2.2: Install web app i18n dependencies

**Files:**
- Modify: `apps/platform/package.json`

**Step 1: Add dependencies**

```bash
cd apps/platform && pnpm add react-i18next i18next @driwet/i18n
```

**Step 2: Commit**

```bash
git add apps/platform/package.json pnpm-lock.yaml
git commit -m "deps(web): add i18n dependencies"
```

---

### Task 2.3: Install API dependencies for chat

**Files:**
- Modify: `packages/api/package.json`

**Step 1: Add ai-sdk-tools**

```bash
cd packages/api && pnpm add ai-sdk-tools ai @ai-sdk/google
```

**Step 2: Commit**

```bash
git add packages/api/package.json pnpm-lock.yaml
git commit -m "deps(api): add ai-sdk-tools for chat memory"
```

---

## Phase 3: Configure i18n in Apps

### Task 3.1: Setup i18n in native app

**Files:**
- Create: `apps/native/lib/i18n.ts`
- Modify: `apps/native/app/_layout.tsx`

**Step 1: Create i18n setup file**

```typescript
// apps/native/lib/i18n.ts
import { initI18n, type SupportedLanguage } from '@driwet/i18n';
import * as Localization from 'expo-localization';

export function setupI18n() {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;
  const lng: SupportedLanguage = deviceLocale === 'es' ? 'es' : 'en';
  return initI18n(lng);
}

export { useTranslation, i18n } from '@driwet/i18n';
```

**Step 2: Initialize i18n in root layout**

Add to `apps/native/app/_layout.tsx` at the top of the file after imports:

```typescript
import { setupI18n } from '@/lib/i18n';

// Initialize i18n before app renders
setupI18n();
```

**Step 3: Commit**

```bash
git add apps/native/lib/i18n.ts apps/native/app/_layout.tsx
git commit -m "feat(native): configure i18n with device locale detection"
```

---

### Task 3.2: Setup i18n in web app

**Files:**
- Create: `apps/platform/src/lib/i18n.ts`
- Modify: `apps/platform/src/app/layout.tsx`

**Step 1: Create i18n setup file**

```typescript
// apps/platform/src/lib/i18n.ts
import { initI18n, type SupportedLanguage } from '@driwet/i18n';

export function setupI18n() {
  const browserLang = typeof navigator !== 'undefined'
    ? navigator.language.split('-')[0]
    : 'en';
  const lng: SupportedLanguage = browserLang === 'es' ? 'es' : 'en';
  return initI18n(lng);
}

export { useTranslation, i18n } from '@driwet/i18n';
```

**Step 2: Initialize in layout (create client component wrapper if needed)**

Add to `apps/platform/src/app/layout.tsx`:

```typescript
import { setupI18n } from '@/lib/i18n';

// Initialize i18n
setupI18n();
```

**Step 3: Commit**

```bash
git add apps/platform/src/lib/i18n.ts apps/platform/src/app/layout.tsx
git commit -m "feat(web): configure i18n with browser locale detection"
```

---

## Phase 4: Hugeicons Integration

### Task 4.1: Create icons component for native

**Files:**
- Create: `apps/native/components/icons.tsx`

**Step 1: Create icons wrapper**

```typescript
// apps/native/components/icons.tsx
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Map01Icon,
  Route01Icon,
  UserIcon,
  CloudLightning01Icon,
  DollarCircleIcon,
  Road01Icon,
  Notification01Icon,
  Location01Icon,
  PaintBoardIcon,
  LanguageCircleIcon,
  HelpCircleIcon,
  Logout01Icon,
  SentIcon,
  AnalyticsUpIcon,
  Settings01Icon,
  ArrowRight01Icon,
  Mail01Icon,
  Star01Icon,
  Cancel01Icon,
  Tick01Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  LockIcon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons';
import { useThemeColors } from '@/hooks/use-theme-colors';

export type IconName =
  | 'map'
  | 'route'
  | 'user'
  | 'storm'
  | 'money'
  | 'road'
  | 'notification'
  | 'location'
  | 'theme'
  | 'language'
  | 'help'
  | 'logout'
  | 'send'
  | 'stats'
  | 'settings'
  | 'arrowRight'
  | 'arrowLeft'
  | 'mail'
  | 'star'
  | 'close'
  | 'check'
  | 'checkCircle'
  | 'alert'
  | 'lock';

const iconMap = {
  map: Map01Icon,
  route: Route01Icon,
  user: UserIcon,
  storm: CloudLightning01Icon,
  money: DollarCircleIcon,
  road: Road01Icon,
  notification: Notification01Icon,
  location: Location01Icon,
  theme: PaintBoardIcon,
  language: LanguageCircleIcon,
  help: HelpCircleIcon,
  logout: Logout01Icon,
  send: SentIcon,
  stats: AnalyticsUpIcon,
  settings: Settings01Icon,
  arrowRight: ArrowRight01Icon,
  arrowLeft: ArrowLeft01Icon,
  mail: Mail01Icon,
  star: Star01Icon,
  close: Cancel01Icon,
  check: Tick01Icon,
  checkCircle: CheckmarkCircle01Icon,
  alert: Alert01Icon,
  lock: LockIcon,
} as const;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color, strokeWidth = 1.5 }: IconProps) {
  const colors = useThemeColors();
  const IconComponent = iconMap[name];

  return (
    <HugeiconsIcon
      icon={IconComponent}
      size={size}
      color={color || colors.foreground}
      strokeWidth={strokeWidth}
    />
  );
}
```

**Step 2: Commit**

```bash
git add apps/native/components/icons.tsx
git commit -m "feat(native): add Icon component with Hugeicons"
```

---

### Task 4.2: Update tab layout with Hugeicons

**Files:**
- Modify: `apps/native/app/(app)/(tabs)/_layout.tsx`

**Step 1: Replace emoji TabIcon with Hugeicons and move ad banner**

```typescript
// apps/native/app/(app)/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';
import { Icon, type IconName } from '@/components/icons';

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const colors = useThemeColors();
  return (
    <Icon
      name={name}
      size={24}
      color={focused ? colors.primary : colors.mutedForeground}
    />
  );
}

export default function TabLayout() {
  const colors = useThemeColors();
  const { isPremium } = useTrialStore();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontFamily: 'NunitoSans_600SemiBold',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="map" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Rutas',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="route" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="user" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
```

**Step 2: Commit**

```bash
git add apps/native/app/\(app\)/\(tabs\)/_layout.tsx
git commit -m "feat(native): replace emoji tabs with Hugeicons, remove ad from layout"
```

---

### Task 4.3: Create AdBanner component and update map screen

**Files:**
- Create: `apps/native/components/ad-banner.tsx`
- Modify: `apps/native/app/(app)/(tabs)/index.tsx`

**Step 1: Create AdBanner component**

```typescript
// apps/native/components/ad-banner.tsx
import { View, Text } from 'react-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';

export function AdBanner() {
  const colors = useThemeColors();
  const { isPremium } = useTrialStore();

  if (isPremium) return null;

  return (
    <View
      style={{
        height: 50,
        backgroundColor: colors.muted,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
        Ad Banner Placeholder
      </Text>
    </View>
  );
}
```

**Step 2: Update map screen to include AdBanner below header**

```typescript
// apps/native/app/(app)/(tabs)/index.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { MapViewComponent } from '@/components/map-view';
import { ChatBottomSheet } from '@/components/chat-bottom-sheet';
import { AlertBanner } from '@/components/alert-banner';
import { AdBanner } from '@/components/ad-banner';
import { Icon } from '@/components/icons';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';

export default function MapScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.card }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 20,
              color: colors.foreground,
            }}
          >
            Driwet
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="location" size={16} color={colors.mutedForeground} />
            <Text
              style={{
                fontFamily: 'NunitoSans_400Regular',
                fontSize: 14,
                color: colors.mutedForeground,
              }}
            >
              {t('map.myZone')}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Ad Banner - now below header */}
      <AdBanner />

      {/* Alert Banner (si hay alertas activas) */}
      <AlertBanner />

      {/* Map */}
      <View style={{ flex: 1 }}>
        <MapViewComponent alerts={alerts} />
      </View>

      {/* Chat Bottom Sheet */}
      <ChatBottomSheet />
    </View>
  );
}
```

**Step 3: Commit**

```bash
git add apps/native/components/ad-banner.tsx apps/native/app/\(app\)/\(tabs\)/index.tsx
git commit -m "feat(native): add AdBanner component, move to below header"
```

---

### Task 4.4: Update profile screen with Hugeicons and i18n

**Files:**
- Modify: `apps/native/app/(app)/(tabs)/profile.tsx`

**Step 1: Update profile with icons and translations**

```typescript
// apps/native/app/(app)/(tabs)/profile.tsx
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';
import { authClient } from '@/lib/auth-client';
import { Icon, type IconName } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';

type StatItem = {
  icon: IconName;
  labelKey: string;
  value: string | number;
};

type SettingItem = {
  icon: IconName;
  labelKey: string;
  route: string | null;
  valueKey?: string;
};

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { isPremium, getRemainingDays } = useTrialStore();
  const remainingDays = getRemainingDays();

  // TODO: Replace with real data from API
  const stats: StatItem[] = [
    { icon: 'storm', labelKey: 'profile.stormsAvoided', value: 12 },
    { icon: 'money', labelKey: 'profile.moneySaved', value: '2,400' },
    { icon: 'road', labelKey: 'profile.kmTraveled', value: 847 },
  ];

  const settings: SettingItem[] = [
    { icon: 'notification', labelKey: 'profile.notifications', route: '/notifications' },
    { icon: 'location', labelKey: 'profile.savedLocations', route: '/locations' },
    { icon: 'theme', labelKey: 'profile.theme', route: null, valueKey: 'profile.themeAuto' },
    { icon: 'language', labelKey: 'profile.language', route: null, valueKey: 'profile.languageSpanish' },
    { icon: 'help', labelKey: 'profile.help', route: '/help' },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/(auth)/welcome');
  };

  const handleUpgrade = () => {
    router.push('/(app)/premium');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 24,
          }}
        >
          {t('profile.title')}
        </Text>

        {/* User Card */}
        <Pressable
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.primary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="user" size={24} color={colors.primaryForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'NunitoSans_600SemiBold',
                  color: colors.foreground,
                  fontSize: 16,
                }}
              >
                usuario@email.com
              </Text>
              <Text
                style={{
                  fontFamily: 'NunitoSans_400Regular',
                  color: isPremium ? colors.primary : colors.mutedForeground,
                  fontSize: 14,
                }}
              >
                {isPremium
                  ? t('profile.planPremium')
                  : t('profile.trialRemaining', { days: remainingDays })}
              </Text>
            </View>
            {!isPremium && (
              <Pressable onPress={handleUpgrade}>
                <Text style={{ color: colors.primary, fontFamily: 'NunitoSans_600SemiBold' }}>
                  {t('profile.upgrade')}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>

        {/* Stats */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="stats" size={18} color={colors.mutedForeground} />
          <Text
            style={{
              fontFamily: 'NunitoSans_600SemiBold',
              fontSize: 16,
              color: colors.mutedForeground,
            }}
          >
            {t('profile.stats')}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
            gap: 12,
          }}
        >
          {stats.map((stat, index) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Icon name={stat.icon} size={20} color={colors.primary} />
              <Text
                style={{
                  fontFamily: 'NunitoSans_400Regular',
                  color: colors.foreground,
                }}
              >
                {t(stat.labelKey, { count: stat.value, amount: stat.value, km: stat.value })}
              </Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="settings" size={18} color={colors.mutedForeground} />
          <Text
            style={{
              fontFamily: 'NunitoSans_600SemiBold',
              fontSize: 16,
              color: colors.mutedForeground,
            }}
          >
            {t('profile.settings')}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 24,
          }}
        >
          {settings.map((setting, index) => (
            <Pressable
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: index < settings.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              <Icon name={setting.icon} size={20} color={colors.foreground} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontFamily: 'NunitoSans_400Regular',
                  color: colors.foreground,
                }}
              >
                {t(setting.labelKey)}
              </Text>
              {setting.valueKey && (
                <Text
                  style={{
                    fontFamily: 'NunitoSans_400Regular',
                    color: colors.mutedForeground,
                    marginRight: 8,
                  }}
                >
                  {t(setting.valueKey)}
                </Text>
              )}
              <Icon name="arrowRight" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 16,
          }}
        >
          <Icon name="logout" size={20} color={colors.destructive} />
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.destructive,
            }}
          >
            {t('profile.logout')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Step 2: Commit**

```bash
git add apps/native/app/\(app\)/\(tabs\)/profile.tsx
git commit -m "feat(native): update profile with Hugeicons and i18n"
```

---

## Phase 5: Welcome Screen & Trial Updates

### Task 5.1: Update trial duration to 3 days

**Files:**
- Modify: `apps/native/stores/trial-store.ts`

**Step 1: Change TRIAL_DURATION_DAYS from 7 to 3**

```typescript
// apps/native/stores/trial-store.ts - line 6
const TRIAL_DURATION_DAYS = 3;
```

**Step 2: Commit**

```bash
git add apps/native/stores/trial-store.ts
git commit -m "feat(native): change trial duration from 7 to 3 days"
```

---

### Task 5.2: Update welcome screen with new design and i18n

**Files:**
- Modify: `apps/native/app/(auth)/welcome.tsx`

**Step 1: Update welcome screen**

```typescript
// apps/native/app/(auth)/welcome.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTrialStore } from '@/stores/trial-store';
import { useTranslation } from '@/lib/i18n';

export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { startTrial } = useTrialStore();

  const handleStart = () => {
    startTrial();
    router.replace('/(app)/(tabs)');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 justify-center items-center px-8">
        {/* Logo */}
        <View className="mb-8">
          <Text
            style={{
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 48,
              color: colors.primary,
            }}
          >
            Driwet
          </Text>
        </View>

        {/* Tagline */}
        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 24,
            color: colors.foreground,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('welcome.tagline')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 48,
          }}
        >
          {t('welcome.subtitle')}
        </Text>

        {/* CTA */}
        <Button
          onPress={handleStart}
          className="w-full"
          size="lg"
        >
          <Button.Label>{t('welcome.startFree')}</Button.Label>
        </Button>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 14,
            color: colors.mutedForeground,
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {t('welcome.trialInfo')}
        </Text>

        {/* Divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 32,
            marginBottom: 24,
            width: '100%',
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text
            style={{
              marginHorizontal: 16,
              color: colors.mutedForeground,
              fontFamily: 'NunitoSans_400Regular',
            }}
          >
            {t('common.or')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Sign in link */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.mutedForeground,
            }}
          >
            {t('welcome.haveAccount')}{' '}
          </Text>
          <Pressable onPress={handleSignIn}>
            <Text
              style={{
                fontFamily: 'NunitoSans_600SemiBold',
                color: colors.primary,
              }}
            >
              {t('welcome.signIn')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
```

**Step 2: Commit**

```bash
git add apps/native/app/\(auth\)/welcome.tsx
git commit -m "feat(native): redesign welcome screen with i18n and sign-in link"
```

---

### Task 5.3: Update auth screens with i18n

**Files:**
- Modify: `apps/native/app/(auth)/sign-in.tsx`
- Modify: `apps/native/app/(auth)/email-input.tsx`
- Modify: `apps/native/app/(auth)/verify.tsx`

**Step 1: Update sign-in.tsx**

```typescript
// apps/native/app/(auth)/sign-in.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';

export default function SignInScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await authClient.signIn.social({ provider: 'google' });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading('apple');
    try {
      await authClient.signIn.social({ provider: 'apple' });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      console.error('Apple sign-in error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = () => {
    router.push('/(auth)/email-input');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 px-6 pt-4">
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="mb-8"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Icon name="arrowLeft" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 16 }}>{t('auth.back')}</Text>
        </Pressable>

        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 8,
          }}
        >
          {t('auth.signInTitle')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          {t('auth.signInSubtitle')}
        </Text>

        {/* Social buttons */}
        <View className="gap-3">
          <Button
            onPress={handleGoogleSignIn}
            variant="secondary"
            size="lg"
            isDisabled={isLoading !== null}
          >
            <Button.Label>
              {isLoading === 'google' ? t('auth.connecting') : t('auth.continueWithGoogle')}
            </Button.Label>
          </Button>

          <Button
            onPress={handleAppleSignIn}
            variant="secondary"
            size="lg"
            isDisabled={isLoading !== null}
          >
            <Button.Label>
              {isLoading === 'apple' ? t('auth.connecting') : t('auth.continueWithApple')}
            </Button.Label>
          </Button>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text
            style={{
              marginHorizontal: 16,
              color: colors.mutedForeground,
              fontFamily: 'NunitoSans_400Regular',
            }}
          >
            {t('common.or')}
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        {/* Email option */}
        <Button onPress={handleEmailSignIn} variant="ghost" size="lg">
          <Button.Label>{t('auth.continueWithEmail')}</Button.Label>
        </Button>
      </View>
    </SafeAreaView>
  );
}
```

**Step 2: Update email-input.tsx**

```typescript
// apps/native/app/(auth)/email-input.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextField } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';

export default function EmailInputScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      setError(t('auth.enterEmailError'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.magicLink({
        email: email.trim(),
        callbackURL: '/(app)/(tabs)',
      });
      router.push({
        pathname: '/(auth)/verify',
        params: { email: email.trim() },
      });
    } catch (err) {
      setError(t('auth.sendError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 px-6 pt-4">
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="mb-8"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Icon name="arrowLeft" size={16} color={colors.primary} />
          <Text style={{ color: colors.primary, fontSize: 16 }}>{t('auth.back')}</Text>
        </Pressable>

        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 28,
            color: colors.foreground,
            marginBottom: 8,
          }}
        >
          {t('auth.enterEmail')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            marginBottom: 32,
            lineHeight: 24,
          }}
        >
          {t('auth.magicLinkSent').replace('Enviamos', 'Te enviaremos')}
        </Text>

        {/* Email input */}
        <TextField className="mb-4">
          <TextField.Input
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
          />
        </TextField>

        {error && (
          <Text
            style={{
              color: colors.destructive,
              marginBottom: 16,
              fontFamily: 'NunitoSans_400Regular',
            }}
          >
            {error}
          </Text>
        )}

        <Button onPress={handleSendMagicLink} size="lg" isDisabled={isLoading}>
          <Button.Label>
            {isLoading ? t('auth.sending') : t('auth.sendMagicLink')}
          </Button.Label>
        </Button>
      </View>
    </SafeAreaView>
  );
}
```

**Step 3: Update verify.tsx**

```typescript
// apps/native/app/(auth)/verify.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from 'heroui-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';
import * as Linking from 'expo-linking';

export default function VerifyScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();

  const handleOpenEmail = async () => {
    await Linking.openURL('mailto:');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-1 justify-center items-center px-8">
        {/* Icon */}
        <View style={{ marginBottom: 24 }}>
          <Icon name="mail" size={64} color={colors.primary} />
        </View>

        {/* Header */}
        <Text
          style={{
            fontFamily: 'NunitoSans_700Bold',
            fontSize: 24,
            color: colors.foreground,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('auth.checkEmail')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_400Regular',
            fontSize: 16,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginBottom: 8,
            lineHeight: 24,
          }}
        >
          {t('auth.magicLinkSent')}
        </Text>

        <Text
          style={{
            fontFamily: 'NunitoSans_600SemiBold',
            fontSize: 16,
            color: colors.foreground,
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          {email}
        </Text>

        <Button
          onPress={handleOpenEmail}
          variant="secondary"
          size="lg"
          className="w-full mb-4"
        >
          <Button.Label>{t('auth.openEmailApp')}</Button.Label>
        </Button>

        <Pressable onPress={() => router.back()}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: 'NunitoSans_400Regular',
            }}
          >
            {t('auth.useAnotherEmail')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Step 4: Commit**

```bash
git add apps/native/app/\(auth\)/sign-in.tsx apps/native/app/\(auth\)/email-input.tsx apps/native/app/\(auth\)/verify.tsx
git commit -m "feat(native): update auth screens with Hugeicons and i18n"
```

---

## Phase 6: Login Incentive Modal

### Task 6.1: Create login incentive modal

**Files:**
- Create: `apps/native/app/(app)/login-incentive.tsx`

**Step 1: Create the modal screen**

```typescript
// apps/native/app/(app)/login-incentive.tsx
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@/components/icons';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';

export default function LoginIncentiveModal() {
  const colors = useThemeColors();
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    try {
      await authClient.signIn.social({ provider: 'google' });
      router.back();
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading('apple');
    try {
      await authClient.signIn.social({ provider: 'apple' });
      router.back();
    } catch (error) {
      console.error('Apple sign-in error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailSignIn = () => {
    router.push('/(auth)/email-input');
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 24 }}>
        {/* Close button */}
        <Pressable
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-end', padding: 8 }}
        >
          <Icon name="close" size={24} color={colors.mutedForeground} />
        </Pressable>

        {/* Content */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/* Icon */}
          <View style={{ marginBottom: 24 }}>
            <Icon name="lock" size={64} color={colors.primary} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 24,
              color: colors.foreground,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            {t('loginIncentive.title')}
          </Text>

          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              fontSize: 16,
              color: colors.mutedForeground,
              textAlign: 'center',
              marginBottom: 32,
              lineHeight: 24,
              paddingHorizontal: 16,
            }}
          >
            {t('loginIncentive.subtitle')}
          </Text>

          {/* Auth buttons */}
          <View style={{ width: '100%', gap: 12 }}>
            <Button
              onPress={handleGoogleSignIn}
              variant="secondary"
              size="lg"
              isDisabled={isLoading !== null}
            >
              <Button.Label>
                {isLoading === 'google' ? t('auth.connecting') : t('auth.continueWithGoogle')}
              </Button.Label>
            </Button>

            <Button
              onPress={handleAppleSignIn}
              variant="secondary"
              size="lg"
              isDisabled={isLoading !== null}
            >
              <Button.Label>
                {isLoading === 'apple' ? t('auth.connecting') : t('auth.continueWithApple')}
              </Button.Label>
            </Button>

            <Button onPress={handleEmailSignIn} variant="ghost" size="lg">
              <Button.Label>{t('auth.continueWithEmail')}</Button.Label>
            </Button>
          </View>
        </View>

        {/* Skip option */}
        <Pressable
          onPress={handleSkip}
          style={{ alignItems: 'center', paddingVertical: 16 }}
        >
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.mutedForeground,
            }}
          >
            {t('loginIncentive.continueWithoutAccount')}
          </Text>
          <Text
            style={{
              fontFamily: 'NunitoSans_400Regular',
              color: colors.mutedForeground,
              fontSize: 12,
            }}
          >
            {t('loginIncentive.localDataOnly')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Step 2: Add route to app layout**

Modify `apps/native/app/(app)/_layout.tsx` to include the modal:

```typescript
<Stack.Screen
  name="login-incentive"
  options={{
    presentation: 'modal',
    animation: 'slide_from_bottom',
  }}
/>
```

**Step 3: Commit**

```bash
git add apps/native/app/\(app\)/login-incentive.tsx apps/native/app/\(app\)/_layout.tsx
git commit -m "feat(native): add login incentive modal"
```

---

### Task 6.2: Create useRequireAuth hook

**Files:**
- Create: `apps/native/hooks/use-require-auth.ts`

**Step 1: Create the hook**

```typescript
// apps/native/hooks/use-require-auth.ts
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';

export function useRequireAuth() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const requireAuth = (callback: () => void) => {
    if (session?.user) {
      callback();
    } else {
      router.push('/(app)/login-incentive');
    }
  };

  const isAuthenticated = !!session?.user;

  return { requireAuth, isAuthenticated, session };
}
```

**Step 2: Commit**

```bash
git add apps/native/hooks/use-require-auth.ts
git commit -m "feat(native): add useRequireAuth hook for login incentive"
```

---

## Phase 7: TanStack Query Persistence Setup

### Task 7.1: Configure TanStack Query with persistence

**Files:**
- Create: `apps/native/lib/query-client.ts`
- Modify: `apps/native/app/_layout.tsx`

**Step 1: Create query client setup**

```typescript
// apps/native/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'driwet-query-cache',
});
```

**Step 2: Update root layout to use PersistQueryClientProvider**

Add to `apps/native/app/_layout.tsx`:

```typescript
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '@/lib/query-client';

// In the Layout component, wrap with:
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{ persister: asyncStoragePersister }}
>
  {/* existing providers */}
</PersistQueryClientProvider>
```

**Step 3: Commit**

```bash
git add apps/native/lib/query-client.ts apps/native/app/_layout.tsx
git commit -m "feat(native): configure TanStack Query with AsyncStorage persistence"
```

---

## Phase 8: oRPC API Routers

### Task 8.1: Create user router

**Files:**
- Create: `packages/api/src/routers/user.ts`

**Step 1: Create user router**

```typescript
// packages/api/src/routers/user.ts
import { z } from 'zod';
import { protectedProcedure } from '../index';
import { db } from '@driwet/db';
import { user } from '@driwet/db/schema/auth';
import { eq } from 'drizzle-orm';

export const userRouter = {
  getProfile: protectedProcedure.handler(async ({ context }) => {
    const userData = await db.query.user.findFirst({
      where: eq(user.id, context.session.user.id),
    });
    return userData;
  }),

  updateSettings: protectedProcedure
    .input(
      z.object({
        theme: z.enum(['light', 'dark', 'auto']).optional(),
        language: z.enum(['en', 'es']).optional(),
        notificationsEnabled: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      // TODO: Add settings columns to user table or create separate settings table
      return { success: true };
    }),

  getStats: protectedProcedure.handler(async ({ context }) => {
    // TODO: Calculate real stats from alert-history and routes
    return {
      stormsAvoided: 12,
      moneySaved: 2400,
      kmTraveled: 847,
    };
  }),
};
```

**Step 2: Commit**

```bash
git add packages/api/src/routers/user.ts
git commit -m "feat(api): add user router with profile and stats"
```

---

### Task 8.2: Create locations router

**Files:**
- Create: `packages/api/src/routers/locations.ts`

**Step 1: Create locations router**

```typescript
// packages/api/src/routers/locations.ts
import { z } from 'zod';
import { protectedProcedure } from '../index';
import { db } from '@driwet/db';
import { userLocation } from '@driwet/db/schema/user-locations';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const locationsRouter = {
  list: protectedProcedure.handler(async ({ context }) => {
    const locations = await db.query.userLocation.findMany({
      where: eq(userLocation.userId, context.session.user.id),
      orderBy: (locations, { desc }) => [desc(locations.isPrimary), desc(locations.createdAt)],
    });
    return locations;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        isPrimary: z.boolean().default(false),
        notifyAlerts: z.boolean().default(true),
      })
    )
    .handler(async ({ input, context }) => {
      const id = nanoid();

      // If this is primary, unset other primaries
      if (input.isPrimary) {
        await db
          .update(userLocation)
          .set({ isPrimary: false })
          .where(eq(userLocation.userId, context.session.user.id));
      }

      await db.insert(userLocation).values({
        id,
        userId: context.session.user.id,
        name: input.name,
        latitude: input.latitude.toString(),
        longitude: input.longitude.toString(),
        isPrimary: input.isPrimary,
        notifyAlerts: input.notifyAlerts,
      });

      return { id };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        notifyAlerts: z.boolean().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { id, ...data } = input;
      await db
        .update(userLocation)
        .set({
          ...data,
          latitude: data.latitude?.toString(),
          longitude: data.longitude?.toString(),
        })
        .where(
          and(
            eq(userLocation.id, id),
            eq(userLocation.userId, context.session.user.id)
          )
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      await db
        .delete(userLocation)
        .where(
          and(
            eq(userLocation.id, input.id),
            eq(userLocation.userId, context.session.user.id)
          )
        );
      return { success: true };
    }),

  setPrimary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Unset all primaries for this user
      await db
        .update(userLocation)
        .set({ isPrimary: false })
        .where(eq(userLocation.userId, context.session.user.id));

      // Set the new primary
      await db
        .update(userLocation)
        .set({ isPrimary: true })
        .where(
          and(
            eq(userLocation.id, input.id),
            eq(userLocation.userId, context.session.user.id)
          )
        );

      return { success: true };
    }),
};
```

**Step 2: Commit**

```bash
git add packages/api/src/routers/locations.ts
git commit -m "feat(api): add locations router with CRUD operations"
```

---

### Task 8.3: Create alerts router

**Files:**
- Create: `packages/api/src/routers/alerts.ts`

**Step 1: Create alerts router**

```typescript
// packages/api/src/routers/alerts.ts
import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../index';

const NOAA_API_BASE = 'https://api.weather.gov';

export const alertsRouter = {
  getActive: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .handler(async ({ input }) => {
      try {
        const response = await fetch(
          `${NOAA_API_BASE}/alerts/active?point=${input.latitude},${input.longitude}`,
          {
            headers: {
              'User-Agent': 'Driwet Weather App',
              Accept: 'application/geo+json',
            },
          }
        );

        if (!response.ok) {
          return { alerts: [] };
        }

        const data = await response.json();

        const alerts = data.features?.map((feature: any) => ({
          id: feature.id,
          type: feature.properties.event,
          severity: mapSeverity(feature.properties.severity),
          headline: feature.properties.headline,
          description: feature.properties.description,
          expires: feature.properties.expires,
          polygon: feature.geometry,
        })) || [];

        return { alerts };
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return { alerts: [] };
      }
    }),

  getHistory: protectedProcedure.handler(async ({ context }) => {
    // TODO: Implement from alert_history table
    return { alerts: [] };
  }),
};

function mapSeverity(noaaSeverity: string): 'extreme' | 'severe' | 'moderate' | 'minor' {
  switch (noaaSeverity?.toLowerCase()) {
    case 'extreme':
      return 'extreme';
    case 'severe':
      return 'severe';
    case 'moderate':
      return 'moderate';
    default:
      return 'minor';
  }
}
```

**Step 2: Commit**

```bash
git add packages/api/src/routers/alerts.ts
git commit -m "feat(api): add alerts router with NOAA integration"
```

---

### Task 8.4: Update main router to export all routers

**Files:**
- Modify: `packages/api/src/routers/index.ts`

**Step 1: Update router exports**

```typescript
// packages/api/src/routers/index.ts
import type { RouterClient } from '@orpc/server';

import { protectedProcedure, publicProcedure } from '../index';
import { userRouter } from './user';
import { locationsRouter } from './locations';
import { alertsRouter } from './alerts';

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return 'OK';
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: 'This is private',
      user: context.session?.user,
    };
  }),
  user: userRouter,
  locations: locationsRouter,
  alerts: alertsRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
```

**Step 2: Commit**

```bash
git add packages/api/src/routers/index.ts
git commit -m "feat(api): export all routers from main appRouter"
```

---

## Phase 9: Verification

### Task 9.1: Verify TypeScript compilation

**Step 1: Run type check on all packages**

```bash
cd /Users/lucasmontegu/apps/driwet && pnpm exec tsc --noEmit
```

**Step 2: Fix any type errors**

**Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve TypeScript errors"
```

---

### Task 9.2: Test native app starts

**Step 1: Start the native app**

```bash
cd apps/native && pnpm start
```

**Step 2: Verify no runtime errors**

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: phase 2 implementation complete"
```

---

## Summary

**Files Created:**
- `packages/i18n/` - Shared i18n package
- `apps/native/lib/i18n.ts` - Native i18n setup
- `apps/native/lib/query-client.ts` - TanStack Query persistence
- `apps/native/components/icons.tsx` - Hugeicons wrapper
- `apps/native/components/ad-banner.tsx` - Ad banner component
- `apps/native/app/(app)/login-incentive.tsx` - Login modal
- `apps/native/hooks/use-require-auth.ts` - Auth hook
- `apps/platform/src/lib/i18n.ts` - Web i18n setup
- `packages/api/src/routers/user.ts` - User API
- `packages/api/src/routers/locations.ts` - Locations API
- `packages/api/src/routers/alerts.ts` - Alerts API

**Files Modified:**
- `apps/native/stores/trial-store.ts` - 3-day trial
- `apps/native/app/_layout.tsx` - i18n + query provider
- `apps/native/app/(auth)/*.tsx` - i18n + icons
- `apps/native/app/(app)/(tabs)/*.tsx` - i18n + icons + real data
- `packages/api/src/routers/index.ts` - Export all routers

**Next Phase (not included):**
- Chat with ai-sdk-tools streaming
- Routes router with gamification stats
- Full native-to-API data binding
- Web i18n integration
