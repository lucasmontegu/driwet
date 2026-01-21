# Gowai MVP: AI-First Storm Advisor

**Fecha:** 2025-01-17
**Autor:** Lucas
**Estado:** En Progreso
**Duración estimada:** 4 semanas
**Última actualización:** 2025-01-17

---

## Progreso General

| Semana | Descripción | Estado |
|--------|-------------|--------|
| Semana 1 | Fundación + Mapa | ✅ Completada |
| Semana 2 | Chat AI + Tools | 🟡 En progreso |
| Semana 3 | Push Notifications + LATAM | ⏳ Pendiente |
| Semana 4 | Detección de Manejo + Polish | ⏳ Pendiente |

---

## Visión

Una app móvil AI-first donde el usuario interactúa con un agente inteligente a través de chat/voz. El agente alerta sobre clima peligroso, responde preguntas sobre rutas, y muestra información visualmente en el mapa.

---

## Arquitectura de UI

```
┌─────────────────────────────────────────┐
│                                         │
│              MAPBOX MAP                 │
│         (fullscreen, 70% altura)        │
│                                         │
│         📍 Usuario                      │
│         ⚠️ Zonas de alerta (polígonos)  │
│                                         │
├─────────────────────────────────────────┤
│  💬 Chat fijo (30% altura)              │
│  ┌─────────────────────────────────────┐│
│  │ Mensajes del agente + usuario       ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ 🎤  Escribe o habla...        [→]  ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Flujo de interacción
1. Usuario abre la app → ve mapa centrado en su ubicación
2. El agente automáticamente chequea alertas y las muestra
3. Usuario puede preguntar: "¿Es seguro ir a Córdoba?" o "¿Dónde me refugio?"
4. El agente responde y actualiza el mapa (markers, rutas, zonas)

---

## AI Agent Tools

```typescript
// Tools disponibles para el agente:

getWeatherAlerts
→ Obtiene alertas de NOAA/SMN para una ubicación
→ Input: { lat, lng, radius }
→ Output: { alerts[], severity, instructions }

getUserLocation
→ Obtiene la ubicación actual del usuario
→ Output: { lat, lng, city, country }

showAlertOnMap
→ Dibuja un polígono de alerta en el mapa
→ Input: { polygon, severity, title }
→ El mapa se actualiza visualmente

analyzeRoute
→ Analiza si una ruta tiene clima peligroso
→ Input: { origin, destination }
→ Output: { safe: boolean, warnings[], recommendation }
```

---

## Arquitectura Técnica

```
┌─────────────────────────────────────────────────────────────┐
│                      GOWAI MVP ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  apps/native (Expo)                                          │
│  ├── MapScreen (Mapbox)                                      │
│  ├── ChatPanel (useChat from AI SDK)                         │
│  ├── DriveDetect (Background location)                       │
│  └── expo-notifications (Push)                               │
│                                                              │
│  apps/platform (Next.js)                                          │
│  ├── /api/chat (AI SDK + Tools)                              │
│  ├── /api/alerts (NOAA/SMN integration)                      │
│  └── /api/push (Expo Push Service)                           │
│                                                              │
│  packages/db (Drizzle + Neon)                                │
│  └── users, push_tokens, user_locations, alert_history       │
│                                                              │
│  External Services                                           │
│  ├── Google AI (Gemini 2.5 Flash for chat)                   │
│  ├── Mapbox (Maps)                                           │
│  ├── NOAA (US weather alerts)                                │
│  └── Tomorrow.io (LATAM weather alerts)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Nuevas tablas)

### push_tokens ✅
| Column | Type | Description |
|--------|------|-------------|
| id | text | PK |
| user_id | text | FK → user.id |
| token | text | Expo push token (unique) |
| platform | text | 'ios' \| 'android' |
| created_at | timestamp | |
| updated_at | timestamp | |

### user_locations ✅
| Column | Type | Description |
|--------|------|-------------|
| id | text | PK |
| user_id | text | FK → user.id |
| name | text | 'Casa', 'Trabajo' |
| lat | numeric | |
| lng | numeric | |
| is_primary | boolean | |
| notify_alerts | boolean | |
| created_at | timestamp | |
| updated_at | timestamp | |

### alert_history ✅
| Column | Type | Description |
|--------|------|-------------|
| id | text | PK |
| user_id | text | FK → user.id |
| alert_type | text | 'hail', 'tornado', 'storm' |
| severity | text | 'extreme', 'severe', 'moderate' |
| title | text | |
| description | text | |
| source | text | 'noaa', 'smn', 'tomorrow' |
| lat | numeric | |
| lng | numeric | |
| polygon | jsonb | GeoJSON del área afectada |
| notified_at | timestamp | |
| expires_at | timestamp | |
| created_at | timestamp | |

### chat_sessions ✅
| Column | Type | Description |
|--------|------|-------------|
| id | text | PK |
| user_id | text | FK → user.id |
| messages | jsonb | Array de mensajes |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## Roadmap de 4 Semanas

### Semana 1: Fundación + Mapa ✅ COMPLETADA

**Día 1-2: Setup Mapbox**
- [x] Crear cuenta Mapbox, obtener API keys
- [x] Instalar @rnmapbox/maps en apps/native
- [x] Configurar permisos de ubicación (iOS/Android)
- [x] Pantalla básica con mapa + ubicación usuario

**Día 3-4: Esquema DB + API base**
- [x] Crear tablas nuevas (push_tokens, user_locations, etc.)
- [x] Ejecutar migraciones con Drizzle
- [x] Endpoint GET /api/alerts
- [x] Integrar NOAA API (USA)

**Día 5: Mostrar alertas en mapa**
- [x] Fetch alertas desde API
- [x] Dibujar polígonos de alerta en Mapbox
- [x] Colores por severidad (rojo/naranja/amarillo)

### Semana 2: Chat AI + Tools 🟡 EN PROGRESO

**Día 1-2: Setup AI SDK**
- [x] Instalar ai, @ai-sdk/react, @ai-sdk/google
- [x] Crear /api/chat endpoint con tools
- [x] Implementar useChat en native con expoFetch
- [x] UI del chat panel (input + mensajes)

**Día 3-4: Implementar Tools**
- [x] Tool: getWeatherAlerts
- [x] Tool: getUserLocation
- [x] Tool: showAlertOnMap (actualiza estado del mapa)
- [x] Tool: analyzeRoute (básico)

**Día 5: Integración mapa ↔ chat**
- [ ] Chat puede comandar el mapa
- [ ] Respuestas del agente con contexto visual
- [ ] Testing del flujo completo

### Semana 3: Push Notifications + LATAM ⏳ PENDIENTE

**Día 1-2: Push Notifications**
- [ ] Configurar expo-notifications
- [ ] Endpoint para registrar push tokens
- [ ] Servicio de envío de push (Expo Push API)
- [ ] Trigger: nueva alerta severa → push

**Día 3-4: Weather APIs LATAM**
- [ ] Integrar Tomorrow.io (free tier)
- [ ] Integrar SMN Argentina (CAP format)
- [ ] Unificar formato de alertas
- [ ] Detectar región del usuario automáticamente

**Día 5: Testing + Polish**
- [ ] Test push en dispositivo real
- [ ] Test alertas USA vs LATAM
- [ ] Mejorar prompts del agente

### Semana 4: Detección de Manejo + Polish ⏳ PENDIENTE

**Día 1-2: Driving Detection**
- [ ] Background location tracking
- [ ] Detectar velocidad > 15 km/h
- [ ] Activar modo conducción automáticamente
- [ ] UI simplificada para conducción

**Día 3-4: Voice + UX**
- [ ] Input por voz (expo-speech o similar)
- [ ] Respuestas TTS del agente
- [ ] Animaciones y transiciones
- [ ] Manejo de errores y estados de carga

**Día 5: Release Beta**
- [ ] Build para TestFlight (iOS)
- [ ] Build para Play Console (Android)
- [ ] Testing con usuarios reales
- [ ] Documentación básica

---

## Dependencias Requeridas

### Cuentas y API Keys
| Servicio | Propósito | Costo | Estado |
|----------|-----------|-------|--------|
| Mapbox | Mapas + geocoding | Free tier | ✅ Configurado |
| Google AI | Gemini 2.5 Flash para el agente | Pay per use | ⏳ Necesita API key |
| NOAA | Alertas clima USA | Gratis | ✅ Integrado |
| Tomorrow.io | Alertas clima LATAM | Free tier | ⏳ Pendiente |
| Expo (EAS) | Push notifications + builds | Free tier | ⏳ Pendiente |

### Variables de Entorno
```bash
# Mapbox (apps/native/.env)
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx  # ✅ Configurado

# Google AI (apps/platform/.env)
GOOGLE_GENERATIVE_AI_API_KEY=xxx  # ⏳ Necesita configurar

# Weather APIs
TOMORROW_IO_API_KEY=xxx  # ⏳ Pendiente

# Expo
EXPO_ACCESS_TOKEN=xxx  # ⏳ Pendiente
```

### Paquetes Instalados
```bash
# apps/native ✅
@rnmapbox/maps
expo-location
@ai-sdk/react
ai

# apps/platform ✅
ai
@ai-sdk/google

# Pendientes
expo-notifications
expo-speech
```

---

## Decisiones Técnicas

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| UI Pattern | Mapa + Chat fijo | AI-first experience |
| AI Framework | Vercel AI SDK | Soporte nativo Expo, tools built-in |
| LLM | Gemini 2.5 Flash | Balance costo/calidad, mejor para español |
| Maps | Mapbox | Offline support futuro, customización |
| Weather US | NOAA | Gratis, datos oficiales |
| Weather LATAM | Tomorrow.io | Cobertura global, free tier |
| Push | Expo Push | Integrado con Expo, simple |
| Background | expo-location | Geofencing + speed detection |

---

## Archivos Creados/Modificados

### Base de Datos
- `packages/db/src/schema/push-tokens.ts` ✅
- `packages/db/src/schema/user-locations.ts` ✅
- `packages/db/src/schema/alert-history.ts` ✅
- `packages/db/src/schema/chat-sessions.ts` ✅
- `packages/db/src/migrations/0000_amazing_kate_bishop.sql` ✅

### API Endpoints
- `apps/platform/src/app/api/alerts/route.ts` ✅
- `apps/platform/src/app/api/chat/route.ts` ✅

### Servicios
- `apps/platform/src/lib/weather/noaa.ts` ✅
- `apps/platform/src/lib/weather/index.ts` ✅

### Componentes Native
- `apps/native/components/map-view.tsx` ✅
- `apps/native/components/chat-panel.tsx` ✅
- `apps/native/hooks/use-location.ts` ✅
- `apps/native/app/(drawer)/(tabs)/index.tsx` ✅

---

## Fuera del Alcance MVP

- CarPlay / Android Auto
- Critical Alerts (requiere aprobación Apple)
- Búsqueda de refugios/shelters
- Modo offline completo
- ElectricSQL sync
- Subscripciones/monetización
- Dashboard B2B
