# Plan MVP Driwet - 4 Pasos para Producción

## 📋 Resumen Ejecutivo

Este plan detalla los 4 pasos críticos para llevar Driwet a un MVP de alto estándar listo para publicación en App Store y Play Store.

---

## 🎯 Paso 1: Unificar RevenueCat - Eliminar Flujo Duplicado

**Problema Actual:**
- `PaywallModal` usa RevenueCat UI nativo
- `PremiumScreen` tiene UI custom propia
- Usuario ve dos flujos diferentes (confusión)

**Solución:**
Usar **solo RevenueCat UI nativo** porque:
- ✅ Maneja todo el flujo de compra automáticamente
- ✅ Se actualiza desde el dashboard de RevenueCat
- ✅ Cumple con políticas de App Store/Play Store
- ✅ Maneja errores, restauraciones, etc.
- ✅ A/B testing de precios sin actualizar app

**Implementación:**
1. Eliminar `PremiumScreen` UI custom o convertirlo en "Beneficios Pro"
2. Mantener solo `PaywallModal` con RevenueCat UI
3. Botón "Upgrade" en todos lados debe disparar `PaywallModal`
4. Configurar offerings en dashboard de RevenueCat

**Tiempo estimado:** 2-3 horas

---

## 🤖 Paso 2: Integrar AI SDK - Copilot de Navegación Inteligente

**Objetivo:**
Crear un asistente de IA que:
- Analice la ruta completa
- Cruce datos de clima (Tomorrow.io + OpenWeather)
- Muestre radar visual por segmentos
- Sugiera paradas seguras para evitar tormentas

**Implementación:**

### 2.1 Crear Agente de Navegación (`agents/navigation-agent.ts`)
```typescript
// Herramientas del agente:
- analyzeRouteWeather(origin, destination, departureTime)
- findSafeStops(route, riskZones)
- suggestDepartureTime(route, weatherForecast)
- getAlternativeRoutes(origin, destination, weatherData)
```

### 2.2 UI de Chat Mejorada
- Streaming de respuestas en tiempo real
- Tarjetas visuales para:
  - Radar de clima por segmentos
  - Sugerencias de paradas
  - Horarios óptimos de salida
  - Rutas alternativas

### 2.3 Integración con Datos
- Conectar con API de clima existente
- Usar datos de rutas guardadas
- Histórico de viajes para ML

**Tiempo estimado:** 6-8 horas

---

## 🗺️ Paso 3: Radar de Clima por Segmentos - Visualización Intuitiva

**Objetivo:**
Mostrar el clima en cada momento del trayecto de forma visual y fácil de entender.

**Implementación:**

### 3.1 Segmentar la Ruta
```typescript
// Dividir ruta en segmentos cada 10-15km
interface RouteSegment {
  id: string;
  startKm: number;
  endKm: number;
  startPoint: Coordinates;
  endPoint: Coordinates;
  weather: WeatherData;
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  estimatedTime: Date;
}
```

### 3.2 Visualización en Mapa
- Colorear la ruta según riesgo (verde → amarillo → naranja → rojo)
- Iconos de clima en puntos clave
- Tooltip al tocar segmento con detalles

### 3.3 Timeline Visual
```
[Inicio]────[10km]────[25km]────[40km]────[Destino]
   🌤️         ⛈️         🌧️         🌤️
  10:00      10:30      11:00      11:30
   Safe     Caution    Warning     Safe
```

### 3.4 Predicción por Hora de Salida
- Si sale ahora: clima X
- Si sale en 1h: clima Y
- Si sale en 2h: clima Z
- Recomendación óptima

**Tiempo estimado:** 4-6 horas

---

## ⛽ Paso 4: Sugerencias de Paradas Seguras - Evitar Tormentas

**Objetivo:**
Encontrar lugares seguros (refugios) a lo largo de la ruta donde el usuario pueda esperar si hay tormentas.

**Implementación:**

### 4.1 Identificar Zonas de Riesgo
- Segmentos con riskLevel 'high' o 'extreme'
- Ventana de tiempo de la tormenta
- Duración estimada

### 4.2 Buscar Refugios Cercanos
Tipos de paradas:
- 🏪 Estaciones de servicio (YPF, Shell, etc.)
- 🍽️ Restaurantes/cafeterías
- 🏨 Hoteles/moteles
- 🛣️ Áreas de descanso
- 🏢 Centros comerciales

### 4.3 Algoritmo de Sugerencia
```typescript
interface SafeStopSuggestion {
  id: string;
  name: string;
  type: 'gas' | 'restaurant' | 'hotel' | 'rest_area';
  location: Coordinates;
  distanceFromRoute: number; // km
  estimatedArrival: Date;
  weatherWindow: {
    stormStart: Date;
    stormEnd: Date;
    safeToContinue: Date;
  };
  amenities: string[];
  rating?: number;
}
```

### 4.4 UI de Sugerencias
- Tarjetas con foto, nombre, distancia
- Tiempo de espera estimado
- Botón "Navegar a parada"
- Opción "Buscar alternativas"

### 4.5 Integración con Mapa
- Mostrar paradas sugeridas en el mapa
- Iconos diferenciados por tipo
- Ruta alternativa incluyendo la parada

**Tiempo estimado:** 5-7 horas

---

## 📊 Cronograma Total

| Paso | Tarea | Tiempo | Prioridad |
|------|-------|--------|-----------|
| 1 | Unificar RevenueCat | 2-3h | 🔴 Alta |
| 2 | AI SDK Copilot | 6-8h | 🔴 Alta |
| 3 | Radar por Segmentos | 4-6h | 🟡 Media |
| 4 | Paradas Seguras | 5-7h | 🟡 Media |
| | **Total** | **17-24h** | |

---

## 🚀 Checklist Pre-Lanzamiento

### RevenueCat
- [ ] Configurar products en App Store Connect
- [ ] Configurar products en Google Play Console
- [ ] Crear entitlements en RevenueCat dashboard
- [ ] Crear offerings con precios
- [ ] Test purchases en sandbox
- [ ] Webhooks configurados

### AI Copilot
- [ ] Agente navegación funcionando
- [ ] Streaming de mensajes
- [ ] Tarjetas UI renderizando
- [ ] Integración clima + rutas

### Mapa y Clima
- [ ] Ruta coloreada por riesgo
- [ ] Timeline visual funcionando
- [ ] Predicción por hora de salida
- [ ] Alertas en tiempo real

### Paradas Seguras
- [ ] Búsqueda de refugios funcionando
- [ ] Sugerencias relevantes
- [ ] Navegación a paradas
- [ ] UI de tarjetas completa

### General
- [ ] Onboarding flujo completo
- [ ] Notificaciones push configuradas
- [ ] Programación de viajes
- [ ] Test en iOS y Android
- [ ] Analytics configurados

---

## 💡 Recomendaciones Finales

1. **RevenueCat**: Usar solo UI nativa, eliminar custom
2. **AI SDK**: Empezar con funcionalidad básica, iterar
3. **Testing**: Probar en dispositivos reales antes de submit
4. **Analytics**: Trackear conversiones desde día 1
5. **Feedback**: Implementar sistema de feedback in-app

---

## 🎨 UX/UI Mejoras Sugeridas

- Animaciones fluidas entre pantallas
- Micro-interacciones en botones
- Skeleton screens para loading
- Empty states informativos
- Haptic feedback en acciones importantes
- Dark mode consistente
- Accessibility labels completos

---

**¿Listo para empezar?** Recomiendo comenzar con el Paso 1 (RevenueCat) ya que es crítico para monetización y luego el Paso 2 (AI SDK) que es el diferenciador principal de la app.
