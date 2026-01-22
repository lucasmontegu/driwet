# DRIWET Mobile Build Guide

## Prerequisites

- Node.js 18+
- pnpm
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- EAS CLI: `npm install -g eas-cli`
- Expo account: Login with `eas login`

## Environment Setup

### Required Environment Variables

Create `.env` in `apps/mobile/`:

```env
EXPO_PUBLIC_SERVER_URL=http://localhost:3001
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ...  # Your Mapbox public token
```

### EAS Secrets (for cloud builds)

Mapbox requires a secret download token for EAS builds. Add it to EAS:

```bash
# Get your secret token from https://account.mapbox.com/access-tokens/
# Create token with DOWNLOADS:READ scope (starts with sk.eyJ...)
npx eas-cli env:create --environment development --name MAPBOX_DOWNLOAD_TOKEN --value 'sk.YOUR_SECRET_TOKEN' --type secret
```

## Local Development

### Start Metro bundler
```bash
cd apps/mobile
pnpm dev
```

### iOS Simulator (requires dev build)
```bash
npx expo run:ios
```

### Android Emulator (requires dev build)
```bash
npx expo run:android
```

## EAS Builds

### Development Build (iOS Simulator)
```bash
npx eas-cli build --platform ios --profile development
```

### Development Build (iOS Device)
```bash
npx eas-cli build --platform ios --profile development:device
```

### Development Build (Android)
```bash
npx eas-cli build --platform android --profile development
```

Note: First Android build will prompt for keystore creation.

### Preview Build (Internal testing)
```bash
npx eas-cli build --platform all --profile preview
```

### Production Build
```bash
npx eas-cli build --platform all --profile production
```

## Build Profiles

Defined in `eas.json`:

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| `development` | iOS Simulator dev builds | Internal |
| `development:device` | iOS Device dev builds | Internal |
| `preview` | Internal testing builds | Internal |
| `production` | App Store/Play Store | Store |

## Native Dependencies

This app uses native modules that require dev builds (not Expo Go):

- **@rnmapbox/maps** - Full Mapbox SDK for maps and navigation
- **expo-location** - Background location tracking
- **expo-dev-client** - Development client with native module support

## Troubleshooting

### iOS Build Fails with Sandbox Error
The app includes a custom Expo config plugin (`plugins/withDisableSandboxing.js`) that disables Xcode's user script sandboxing. If you see errors like:
```
Sandbox: bash deny(1) file-write-create .../Pods/resources-to-copy-*.txt
```

Run:
```bash
npx expo prebuild --platform ios --clean
```

### Mapbox Not Loading
1. Verify `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` is set in `.env`
2. For EAS builds, ensure `MAPBOX_DOWNLOAD_TOKEN` secret is configured
3. Token must be valid Mapbox access token (starts with `pk.` for public)

### Android Keystore Issues
Run credentials manager to regenerate:
```bash
npx eas-cli credentials --platform android
```

## Architecture Notes

- Uses Expo SDK 54 with React Native 0.81
- New Architecture (Fabric) enabled
- Hermes JS engine enabled
- TypeScript with strict mode
