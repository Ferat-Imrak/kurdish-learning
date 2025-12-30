# Mobile App Quick Start Guide

## 🎯 Recommended Approach: Capacitor

Capacitor allows you to wrap your existing Next.js app as a native mobile app with minimal changes.

## ⚡ Quick Setup (5 minutes)

### 1. Install Capacitor

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

### 2. Create Capacitor Config

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
};

export default config;
```

### 3. Update Next.js Config for Mobile Build

Update `frontend/next.config.js` to support both web and mobile:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  // Enable static export only for mobile builds
  ...(process.env.MOBILE_BUILD === 'true' && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
  images: {
    domains: ['localhost', 'supabase.co'],
  },
}

module.exports = withPWA(nextConfig)
```

### 4. Add Mobile Build Scripts

Add to `frontend/package.json`:

```json
{
  "scripts": {
    "build:mobile": "MOBILE_BUILD=true npm run build && npx cap sync",
    "ios:dev": "npm run build:mobile && npx cap open ios",
    "android:dev": "npm run build:mobile && npx cap open android",
    "ios:sync": "npx cap sync ios",
    "android:sync": "npx cap sync android"
  }
}
```

### 5. Initialize Capacitor

```bash
npx cap init
# App name: Peyvi Kurdish Learning
# App ID: com.peyvi.kurdishlearning
# Web dir: out
```

### 6. Add Platforms

```bash
npm run build:mobile
npx cap add ios
npx cap add android
npx cap sync
```

### 7. Open in Native IDEs

```bash
# iOS (Mac only)
npx cap open ios

# Android
npx cap open android
```

## 📱 Building for Production

### iOS (App Store)

1. Open in Xcode: `npx cap open ios`
2. Select your project → Signing & Capabilities
3. Select your Apple Developer team
4. Product → Archive
5. Distribute App → App Store Connect

### Android (Google Play)

1. Open in Android Studio: `npx cap open android`
2. Build → Generate Signed Bundle / APK
3. Select "Android App Bundle" (.aab)
4. Upload to Google Play Console

## 🔧 Common Issues

### Issue: Build fails with "output: 'export'"
**Solution**: Use `MOBILE_BUILD=true` environment variable to conditionally enable static export.

### Issue: Audio doesn't work on mobile
**Solution**: Test on real devices. Mobile browsers have stricter audio policies. Consider using Capacitor's Audio plugin.

### Issue: API calls fail
**Solution**: Update API URLs to use your production backend URL, not localhost.

## 📋 Pre-Submission Checklist

- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Update API endpoints to production
- [ ] Test offline functionality
- [ ] Prepare app icons (1024x1024 for iOS, 512x512 for Android)
- [ ] Prepare screenshots for App Store/Play Store
- [ ] Write app description
- [ ] Set up privacy policy URL
- [ ] Test all features (lessons, games, stories, audio)

## 🎨 App Store Assets Needed

### iOS
- App icon: 1024x1024px (PNG, no transparency)
- Screenshots: iPhone 6.7", 6.5", 5.5" displays
- iPad screenshots (if supporting iPad)

### Android
- App icon: 512x512px (PNG)
- Feature graphic: 1024x500px
- Screenshots: Phone (16:9) and tablet (if supporting)

## 💰 Costs

- **Apple Developer**: $99/year
- **Google Play Developer**: $25 one-time
- **Total First Year**: ~$124

## 🚀 Next Steps

1. Run the setup script: `bash scripts/setup-mobile.sh`
2. Test on simulator/emulator first
3. Test on real devices
4. Prepare store assets
5. Submit for review

## 📚 Resources

- Full guide: See `MOBILE_DEPLOYMENT_GUIDE.md`
- [Capacitor Docs](https://capacitorjs.com/docs)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)











