# Mobile App Deployment Guide

This guide covers how to deploy your Kurdish Learning app to iOS and Android.

## Option 1: Capacitor (Recommended - Reuse Existing Code)

Capacitor wraps your existing Next.js web app as a native mobile app. This is the fastest path since you can reuse 95% of your code.

### Prerequisites
- Node.js 18+
- Xcode (for iOS - Mac only)
- Android Studio (for Android)
- Apple Developer Account ($99/year for iOS)
- Google Play Developer Account ($25 one-time for Android)

### Step 1: Install Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init
```

When prompted:
- App name: `Peyvi Kurdish Learning`
- App ID: `com.peyvi.kurdishlearning` (or your preferred bundle ID)
- Web dir: `out` (for static export) or `.next` (for SSR)

### Step 2: Configure Next.js for Static Export

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
  // Update basePath if deploying to a subdirectory
  // basePath: '/kurdish-learning',
}

module.exports = nextConfig
```

### Step 3: Build and Sync

```bash
# Build the Next.js app
npm run build

# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync web assets to native projects
npx cap sync
```

### Step 4: Configure Capacitor

Create `frontend/capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.peyvi.kurdishlearning',
  appName: 'Peyvi Kurdish Learning',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
    },
  },
};
```

### Step 5: Install Native Plugins (Optional)

For features like audio, camera, etc.:

```bash
npm install @capacitor/audio @capacitor/filesystem @capacitor/preferences
```

### Step 6: iOS Setup

```bash
# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Select your project in the navigator
# 2. Go to "Signing & Capabilities"
# 3. Select your team
# 4. Update bundle identifier if needed
# 5. Build and run (Cmd+R) or archive for App Store
```

### Step 7: Android Setup

```bash
# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync
# 2. Update app/build.gradle if needed
# 3. Run on device/emulator or build APK/AAB
```

### Step 8: Update package.json Scripts

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "build:mobile": "next build && npx cap sync",
    "ios:dev": "npm run build:mobile && npx cap open ios",
    "android:dev": "npm run build:mobile && npx cap open android",
    "ios:sync": "npx cap sync ios",
    "android:sync": "npx cap sync android"
  }
}
```

---

## Option 2: Expo (Full Native Experience)

Expo provides a better native experience but requires rewriting components.

### Step 1: Create Expo App

```bash
npx create-expo-app@latest peyvi-mobile --template
cd peyvi-mobile
```

### Step 2: Install Dependencies

```bash
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install expo-av expo-speech
npm install @react-native-async-storage/async-storage
```

### Step 3: Migrate Components

You'll need to:
- Convert Next.js pages to React Navigation screens
- Replace Next.js routing with React Navigation
- Convert Tailwind classes to React Native StyleSheet
- Replace web-specific APIs with React Native equivalents

### Step 4: Build and Deploy

```bash
# Development
npx expo start

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Option 3: PWA (Simplest - Web App)

You already have `next-pwa` installed! Enhance it for better mobile experience.

### Step 1: Update PWA Configuration

Update `frontend/next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/www\.kurdishtts\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'kurdish-tts-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
})

module.exports = withPWA({
  // ... your existing config
})
```

### Step 2: Update manifest.json

Update `frontend/public/manifest.json`:

```json
{
  "name": "Peyvi Kurdish Learning",
  "short_name": "Peyvi",
  "description": "Learn Kurdish with interactive lessons and games",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Step 3: Add Install Prompt

Users can "Add to Home Screen" from browser menu. For a custom install prompt, add a component.

---

## Comparison

| Feature | Capacitor | Expo | PWA |
|---------|-----------|------|-----|
| **Code Reuse** | 95% | 30% | 100% |
| **Native Features** | Full | Full | Limited |
| **App Store** | Yes | Yes | No (web only) |
| **Development Time** | 1-2 days | 2-4 weeks | 1 day |
| **Performance** | Good | Excellent | Good |
| **Offline Support** | Yes | Yes | Yes (with PWA) |

---

## Recommendation

**Start with Capacitor** because:
1. ✅ Reuse 95% of your existing code
2. ✅ Quick to set up (1-2 days)
3. ✅ Full native app experience
4. ✅ Can publish to App Store and Play Store
5. ✅ Easy to maintain (one codebase)

**Then enhance with PWA** for:
- Web users who prefer browser
- Easier updates (no app store approval)
- Cross-platform compatibility

---

## Next Steps

1. **Choose your approach** (Capacitor recommended)
2. **Set up development environment** (Xcode, Android Studio)
3. **Test on devices** before submitting
4. **Prepare app store assets** (screenshots, descriptions, icons)
5. **Submit for review**

---

## App Store Requirements

### iOS (App Store)
- App icon: 1024x1024px
- Screenshots: Various sizes for iPhone/iPad
- Privacy policy URL
- App description
- Keywords
- Age rating

### Android (Google Play)
- App icon: 512x512px
- Feature graphic: 1024x500px
- Screenshots: Phone and tablet
- Privacy policy URL
- App description
- Content rating

---

## Troubleshooting

### Capacitor Issues
- **Build errors**: Run `npx cap sync` after npm installs
- **iOS build fails**: Check signing in Xcode
- **Android build fails**: Update Gradle and dependencies

### Audio Issues
- Test audio playback on real devices
- Handle permissions for microphone (if needed)
- Consider native audio plugins for better performance

---

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [PWA Guide](https://web.dev/progressive-web-apps/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)





