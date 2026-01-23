---
active: true
iteration: 1
max_iterations: 30
completion_promise: "FASE_2_COMPLETE"
started_at: "2025-01-23T14:00:00Z"
---

# Implementar Fase 2: Voz + Paradas - UX Chat-First Driwet

## Contexto
Lee el documento de diseño completo en `docs/plans/2025-01-23-ux-redesign-chat-first.md` antes de cada iteracion.

## Tareas de Fase 2

### 1. Speech-to-Text (push-to-talk)
- Usar expo-av o expo-speech para grabación
- Implementar botón push-to-talk en ChatInput
- Integrar con servicio de STT (Whisper API o similar)
- Estados: idle, recording, processing, done

### 2. Text-to-Speech para respuestas
- Usar expo-speech para TTS
- Reproducir respuestas del agente automáticamente
- Control de volumen y velocidad
- Opción para desactivar

### 3. Estados visuales de grabación
- Animación de ondas de audio durante grabación
- Indicador de procesamiento
- Feedback visual de éxito/error

### 4. Detección modo conducción
- Detectar velocidad > 10km/h usando location updates
- Activar modo conducción automáticamente
- UI más grande en modo conducción (textos 15% más grandes)

### 5. findSafeStops tool
- Crear tool para el agente AI
- Buscar gasolineras, áreas de descanso, refugios
- Integrar con APIs de POI (Mapbox o similar)

### 6. StopSelectorCard
- Crear componente AI: `apps/mobile/components/ai/stop-selector-card.tsx`
- Mostrar paradas sugeridas con checkbox
- Incluir razón de la sugerencia (clima, fatiga, combustible)

### 7. Integración Tomorrow.io (road risk)
- Agregar API de Tomorrow.io en el backend
- Crear hook useRoadRisk
- Calcular índice de riesgo vial

### 8. Ruta coloreada por riesgo
- Modificar MapViewComponent para mostrar segmentos coloreados
- Verde → Amarillo → Naranja → Rojo según riesgo
- Actualizar en tiempo real

## Reglas
- Hacer commits frecuentes con mensajes descriptivos
- Un componente/feature por iteracion
- NO romper funcionalidad existente
- Seguir los design tokens del documento
- Usar TypeScript estricto
- Usar expo-av y expo-speech para audio

## Completion
Cuando TODAS las tareas de Fase 2 esten implementadas y funcionando, output:
<promise>FASE_2_COMPLETE</promise>

NO outputear el promise hasta que todo este verificado y funcionando.
