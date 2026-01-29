# 🚀 EAS OTA Updates - Implementación Completa

## ✅ Qué se Implementó

### 1. Dependencias
- ✅ `expo-updates ^29.0.16` instalado

### 2. Configuración EAS (`eas.json`)
```json
"update": {
  "default": {
    "branch": "main",
    "channel": "production"
  }
}
```

### 3. Hook `useOTAUpdates`
- ✅ Auto-check al iniciar (3 seg delay)
- ✅ Check cada 5 minutos
- ✅ Check al volver a foreground
- ✅ Estados: checking → available → downloading → ready → up-to-date

### 4. Componente `UpdateBanner`
- ✅ Banner flotante con animaciones
- ✅ Estados visuales:
  - 🩶 Gris: "Buscando actualizaciones..."
  - 🔵 Azul: "Nueva versión disponible" → Descargar
  - 🔵 Azul: "Descargando..."
  - 🟢 Verde: "Actualización lista" → Aplicar

### 5. Integración en Layout
- ✅ Agregado a `app/_layout.tsx`
- ✅ Aparece automáticamente cuando hay updates

### 6. CI/CD Automático
- ✅ GitHub Actions workflow (`.github/workflows/eas-ota.yml`)
- ✅ Se ejecuta en cada push a `main`
- ✅ Solo cuando cambian archivos en `apps/mobile/**`

### 7. Documentación
- ✅ `docs/OTA_UPDATES.md` - Guía completa

---

## 📁 Archivos Creados/Modificados

```
apps/mobile/
├── hooks/
│   └── use-ota-updates.ts      [NUEVO]
├── components/
│   └── update-banner.tsx       [NUEVO]
├── app/
│   └── _layout.tsx             [MODIFICADO]
├── docs/
│   └── OTA_UPDATES.md          [NUEVO]
├── eas.json                    [MODIFICADO]
└── package.json                [MODIFICADO]

.github/
└── workflows/
    └── eas-ota.yml             [NUEVO]
```

---

## 🎯 Cómo Usar

### Publicar Update Manual

```bash
cd apps/mobile

# Básico
eas update

# Con mensaje descriptivo
eas update --message "Fix: Corrige crash en onboarding"

# A canal específico
eas update --branch main --channel production
```

### Automático (CI/CD)

```bash
# Solo haz push a main:
git add .
git commit -m "Fix: Corrige bug crítico"
git push origin main

# GitHub Actions publica OTA automáticamente
```

---

## 🔧 Configurar GitHub Secrets

1. Generar token de Expo:
```bash
eas login
eas token:create
# Copia el token
```

2. Agregar a GitHub:
   - Ve a tu repo → Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `EXPO_TOKEN`
   - Value: [pega el token]

---

## 📊 Flujo de Trabajo

### Desarrollo Local
1. Trabajas en tu código
2. Testeas en simulador
3. Haces commit y push

### Producción (Automático)
1. Merge a `main` → Trigger GitHub Actions
2. Actions corre: `eas update --auto`
3. Update publicado en ~2 minutos
4. Usuarios reciben banner en app
5. Descargan y aplican update

### Timeline
```
T+0 min: Push a main
T+1 min: GitHub Actions inicia
T+2 min: OTA publicado
T+3 min: Usuarios ven banner
T+5 min: Update descargado
T+6 min: App reinicia con nuevo código
```

---

## 🧪 Testear OTA

### En Preview Build

```bash
# 1. Crear build de preview
eas build --platform ios --profile preview

# 2. Instalar en dispositivo físico
# 3. Abrir app
# 4. Publicar update
eas update --branch main

# 5. Ver banner aparecer en app
```

### Ver Logs

```bash
# En Metro bundler, busca:
[OTA] Checking for updates...
[OTA] Update available
[OTA] Update downloaded and ready
[OTA] Applying update and reloading...
```

---

## ⚠️ Limitaciones Importantes

### ✅ OTA PUEDE actualizar:
- Código JavaScript/TypeScript
- Componentes React
- Lógica de negocio
- Assets (imágenes, fuentes)
- Configuración de app (no nativa)

### ❌ OTA NO PUEDE actualizar:
- Plugins nativos nuevos
- Permisos de iOS/Android
- Configuración nativa (Info.plist, AndroidManifest)
- Versiones de SDK de Expo
- Dependencias nativas

### 📝 Regla de Oro
**Si modificas `app.json`, `package.json` (agregas plugins), o carpetas `ios/`/`android/`, necesitas un build nuevo, no OTA.**

---

## 🎨 Estados del Banner

```
┌─────────────────────────────────────┐
│ 🔄 Buscando actualizaciones...      │  ← Gris (3 segundos)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ➡️  Nueva versión disponible        │  ← Azul
│     Toque para descargar     ➡️     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔄 Descargando actualización...     │  ← Azul
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✅ Actualización lista              │  ← Verde
│     Toque para aplicar ahora  🔄    │
└─────────────────────────────────────┘
```

---

## 📈 Métricas

Monitorea en [expo.dev](https://expo.dev):
- Cuántos usuarios tienen cada versión
- Tasa de adopción de updates
- Errores por update
- Tiempo promedio de adopción

---

## 🆘 Troubleshooting

### "No se ve el banner"
- Estás en modo desarrollo (`__DEV__`)? El banner no aparece en dev
- Hiciste un build de preview/production primero?
- Verifica que `expo-updates` esté configurado correctamente

### "Update no se descarga"
- Verifica conexión a internet
- Revisa logs en Metro: `[OTA] ...`
- Asegúrate de que el update esté publicado: `eas update:list`

### "App crashea después de update"
- Rollback inmediato: `eas update:republish [id-anterior]`
- O publica fix: `eas update --message "Hotfix"`

---

## 🚀 Próximos Pasos

1. ✅ Configurar `EXPO_TOKEN` en GitHub Secrets
2. ✅ Hacer build de preview: `eas build --profile preview`
3. ✅ Testear OTA en dispositivo físico
4. ✅ Merge a main y verificar CI/CD
5. ✅ Documentar en equipo cómo usar

---

## 📚 Recursos

- [Expo OTA Docs](https://docs.expo.dev/eas-update/introduction/)
- [EAS Update CLI](https://docs.expo.dev/eas-update/eas-cli/)
- [GitHub Actions](https://docs.expo.dev/eas-update/github-actions/)

---

**¡Tu app ahora tiene OTA updates funcionando!** 🎉

Los usuarios recibirán actualizaciones automáticamente sin pasar por App Store.
