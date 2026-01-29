# EAS OTA Updates - Guía Completa

## ¿Qué es OTA?

**OTA (Over-The-Air)** te permite enviar actualizaciones de JavaScript/bundles a tus usuarios **sin necesidad de pasar por App Store / Play Store**.

### Ventajas:
- ✅ **Instantáneo**: Los usuarios reciben updates en minutos, no días
- ✅ **Sin review**: No necesitas aprobación de Apple/Google
- ✅ **Rollback**: Puedes revertir cambios si algo falla
- ✅ **Analytics**: Sabes quién tiene qué versión

### Limitaciones:
- ⚠️ Solo actualiza **JavaScript/bundles**, no código nativo
- ⚠️ Si agregas un nuevo plugin nativo, necesitas build nuevo
- ⚠️ Los assets nuevos deben estar en el bundle

---

## Configuración Actual

### 1. Dependencias Instaladas

```bash
# Ya instalado:
expo-updates ^29.0.16
```

### 2. Configuración EAS (`eas.json`)

```json
{
  "update": {
    "default": {
      "branch": "main",
      "channel": "production"
    },
    "preview": {
      "branch": "preview",
      "channel": "preview"
    }
  }
}
```

### 3. Estructura de Archivos

```
apps/mobile/
├── hooks/
│   └── use-ota-updates.ts      # Hook para manejar updates
├── components/
│   └── update-banner.tsx       # UI para mostrar updates
├── app/
│   └── _layout.tsx             # Integrado en layout principal
└── eas.json                    # Configuración EAS
```

---

## Cómo Funciona

### Flujo Automático

1. **App inicia** → Chequea updates después de 3 segundos
2. **Update disponible** → Muestra banner azul "Nueva versión disponible"
3. **Usuario toca** → Descarga en background
4. **Descarga lista** → Muestra banner verde "Actualización lista"
5. **Usuario toca** → App se reinicia con nuevo código

### Estados del Banner

```
[GRIS]    "Buscando actualizaciones..."
[AZUL]    "Nueva versión disponible" → Toque para descargar
[AZUL]    "Descargando actualización..."
[VERDE]   "Actualización lista" → Toque para aplicar ahora
```

---

## Comandos

### Manual (Desarrollo)

```bash
# Publicar update manualmente
cd apps/mobile
eas update

# Publicar a canal específico
eas update --branch main --channel production

# Ver updates publicados
eas update:list

# Ver detalles de un update
eas update:view [update-id]
```

### Automático (CI/CD)

Cada push a `main` que modifique `apps/mobile/**` publica automáticamente un OTA update.

```yaml
# .github/workflows/eas-ota.yml
on:
  push:
    branches: [main]
    paths: ["apps/mobile/**"]
```

---

## Uso en Código

### Hook `useOTAUpdates`

```tsx
import { useOTAUpdates } from "@/hooks/use-ota-updates";

function MyComponent() {
  const {
    status,              // "checking" | "available" | "downloading" | "ready" | "up-to-date" | "error"
    isUpdateAvailable,   // boolean
    isUpdatePending,     // boolean
    isChecking,          // boolean
    isDownloading,       // boolean
    updateId,            // string | null
    checkForUpdate,      // () => Promise<void>
    downloadUpdate,      // () => Promise<void>
    applyUpdate,         // () => Promise<void>
    error,               // Error | null
  } = useOTAUpdates();

  // Forzar check manual
  const handleCheck = () => {
    checkForUpdate();
  };

  return (
    <View>
      {isUpdateAvailable && (
        <Button onPress={downloadUpdate}>
          Descargar actualización
        </Button>
      )}
      
      {isUpdatePending && (
        <Button onPress={applyUpdate}>
          Aplicar actualización (reiniciará app)
        </Button>
      )}
    </View>
  );
}
```

### Banner Automático

El banner ya está integrado en `_layout.tsx` y aparece automáticamente:

```tsx
// app/_layout.tsx
<NotificationsProvider>
  <UpdateBanner />  {/* ← Ya incluido */}
  <StackLayout />
</NotificationsProvider>
```

---

## Estrategias de Update

### 1. Forzar Update (Critical Bug)

```tsx
import { useEffect } from "react";
import { useOTAUpdates } from "@/hooks/use-ota-updates";

function CriticalUpdateCheck() {
  const { isUpdatePending, applyUpdate } = useOTAUpdates();

  useEffect(() => {
    if (isUpdatePending) {
      // Forzar reinicio inmediatamente
      applyUpdate();
    }
  }, [isUpdatePending, applyUpdate]);

  return null;
}
```

### 2. Update Silencioso (Background)

```tsx
const { downloadUpdate } = useOTAUpdates();

// Descargar sin mostrar UI
useEffect(() => {
  const timer = setTimeout(() => {
    downloadUpdate();
  }, 10000); // 10 segundos después de iniciar
  
  return () => clearTimeout(timer);
}, [downloadUpdate]);
```

### 3. Update en Foreground

```tsx
// El hook ya hace esto automáticamente:
// - Chequea al iniciar (3 seg delay)
// - Chequea cada 5 minutos
// - Chequea cuando app vuelve a foreground
```

---

## Debugging

### Ver Logs

```bash
# En Metro bundler
# Busca logs con [OTA] prefix:
# [OTA] Checking for updates...
# [OTA] Update available
# [OTA] Update downloaded and ready
```

### Simular en Desarrollo

```tsx
// No funciona en __DEV__ mode
// Para testear, necesitas hacer un build:

# 1. Crear build de preview
eas build --platform ios --profile preview

# 2. Instalar en dispositivo
# 3. Publicar update
eas update --branch main

# 4. Abrir app y ver banner
```

### Comandos Útiles

```bash
# Ver estado de updates
eas update:list --branch main

# Ver canales
eas channel:list

# Ver branches
eas branch:list

# Eliminar update (rollback)
eas update:republish --branch main [update-id]
```

---

## CI/CD Automático

### GitHub Actions Workflow

```yaml
# .github/workflows/eas-ota.yml
name: EAS OTA Update

on:
  push:
    branches: [main]
    paths: ["apps/mobile/**"]

jobs:
  ota-update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas update --auto
```

### Configurar Secrets

1. Ve a GitHub → Settings → Secrets
2. Agrega `EXPO_TOKEN`:
   ```bash
   # Generar token
   eas login
   eas token:create
   
   # Copiar token y agregar a GitHub
   ```

---

## Mejores Prácticas

### ✅ Hacer

1. **Testear en preview primero**
   ```bash
   eas update --branch preview
   ```

2. **Versionado semántico**
   - Cambios pequeños: patch (1.0.1)
   - Features nuevos: minor (1.1.0)
   - Breaking changes: major (2.0.0)

3. **Mensajes descriptivos**
   ```bash
   eas update --message "Fix: Corrige crash en onboarding"
   ```

4. **Monitorear errores**
   - Revisa Sentry/PostHog después de cada update
   - Rollback si hay errores

### ❌ No Hacer

1. **No hagas OTA si:**
   - Agregaste un plugin nativo nuevo
   - Cambiaste `app.json` config nativa
   - Modificaste código en `ios/` o `android/`

2. **No ignores errores**
   - Si un update falla, republish o rollback

3. **No hagas updates muy grandes**
   - Máximo recomendado: ~10MB de bundle
   - Usa code splitting si es necesario

---

## Troubleshooting

### "No updates available"

```bash
# Verificar que estás en el branch correcto
git branch

# Verificar canal
eas channel:list

# Forzar update con branch específico
eas update --branch main --channel production
```

### "Update not downloading"

```bash
# Verificar conexión a internet
# Verificar que no estás en modo desarrollo (__DEV__)
# Verificar logs en Metro
```

### "App crashes after update"

```bash
# Rollback inmediato
eas update:republish --branch main [previous-update-id]

# O publicar fix
eas update --message "Hotfix: Rollback cambio problemático"
```

---

## Métricas y Analytics

### Track Updates

```tsx
import { useOTAUpdates } from "@/hooks/use-ota-updates";
import { analytics } from "@/lib/analytics";

function TrackUpdates() {
  const { status, updateId } = useOTAUpdates();

  useEffect(() => {
    if (status === "ready") {
      analytics.track("ota_update_ready", {
        update_id: updateId,
      });
    }
  }, [status, updateId]);

  return null;
}
```

### Ver en Dashboard

1. Ve a [expo.dev](https://expo.dev)
2. Selecciona tu proyecto
3. Ve a "Updates"
4. Verás:
   - Cuántos usuarios tienen cada versión
   - Tasa de adopción
   - Errores por update

---

## Resumen

### Qué se implementó:

✅ `expo-updates` instalado y configurado
✅ Hook `useOTAUpdates` con auto-check
✅ Banner UI con estados (checking → available → downloading → ready)
✅ CI/CD automático en merges a main
✅ Documentación completa

### Flujo de trabajo:

1. **Desarrollo**: Trabajas normalmente
2. **Merge a main**: GitHub Actions publica OTA automáticamente
3. **Usuarios**: Reciben update en minutos
4. **Monitoreo**: Revisa métricas en expo.dev

### Comandos rápidos:

```bash
# Manual
cd apps/mobile && eas update

# Con mensaje
eas update --message "Fix: Crash en onboarding"

# A canal específico
eas update --branch main --channel production

# Ver updates
eas update:list
```

---

**¡Listo! Tu app ahora tiene OTA updates funcionando.** 🚀
