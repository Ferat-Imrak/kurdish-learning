# Mobile Testing Guide - Test on Your Phone

This guide will help you test your Kurdish Learning app on your phone using Capacitor.

## Quick Setup (5 minutes)

### Step 1: Install Capacitor

Run this in your terminal from the `frontend` directory:

```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

### Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: `Peyvi Kurdish Learning`
- **App ID**: `com.peyvi.kurdishlearning` (or press Enter to use default)
- **Web dir**: `out`

### Step 3: Add Mobile Platforms

```bash
# Build for mobile first
npm run build:mobile

# Add iOS (Mac only)
npx cap add ios

# Add Android
npx cap add android

# Sync files
npx cap sync
```

---

## Testing on Your Phone

### Option 1: Android (Easiest - Works on any OS)

#### Method A: Direct APK Install (Fastest)

1. **Build the app:**
   ```bash
   npm run build:mobile
   ```

2. **Open Android Studio:**
   ```bash
   npx cap open android
   ```

3. **In Android Studio:**
   - Wait for Gradle sync to finish
   - Connect your Android phone via USB
   - Enable "USB Debugging" on your phone (Settings → Developer Options)
   - Click the green "Run" button (or press Shift+F10)
   - Select your phone from the device list
   - The app will install and launch on your phone!

#### Method B: Generate APK for Manual Install

1. **In Android Studio:**
   - Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - Wait for build to complete
   - Click "locate" in the notification
   - Copy the APK file to your phone
   - Install it (you may need to enable "Install from Unknown Sources")

#### Method C: Live Reload (Development)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Update Capacitor config** (`capacitor.config.ts`):
   ```typescript
   server: {
     url: 'http://YOUR_COMPUTER_IP:3000', // e.g., 'http://192.168.1.100:3000'
     cleartext: true
   }
   ```

3. **Find your computer's IP:**
   - Mac/Linux: `ifconfig | grep "inet "`
   - Windows: `ipconfig`

4. **Sync and run:**
   ```bash
   npx cap sync android
   npx cap open android
   ```
   - Click Run in Android Studio
   - Changes will reload automatically!

---

### Option 2: iOS (Mac Only)

#### Method A: Simulator (No Phone Needed)

1. **Open in Xcode:**
   ```bash
   npm run build:mobile
   npx cap open ios
   ```

2. **In Xcode:**
   - Select a simulator (e.g., iPhone 15 Pro) from the device dropdown
   - Click the Play button (or press Cmd+R)
   - The app will launch in the simulator

#### Method B: Real iPhone

1. **Open in Xcode:**
   ```bash
   npm run build:mobile
   npx cap open ios
   ```

2. **In Xcode:**
   - Connect your iPhone via USB
   - Select your iPhone from the device dropdown
   - Go to `Signing & Capabilities` tab
   - Select your Apple Developer team (or use your Apple ID for free)
   - Click the Play button
   - On your iPhone: Settings → General → VPN & Device Management → Trust your developer

#### Method C: Live Reload (Development)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Update Capacitor config** (`capacitor.config.ts`):
   ```typescript
   server: {
     url: 'http://YOUR_COMPUTER_IP:3000',
     cleartext: true
   }
   ```

3. **Sync and run:**
   ```bash
   npx cap sync ios
   npx cap open ios
   ```
   - Click Run in Xcode
   - Changes reload automatically!

---

## Quick Test Checklist

Once the app is on your phone, test:

- [ ] Mobile landing page displays correctly
- [ ] Hero section with "Learn Kurdish the Fun Way"
- [ ] Pricing toggle works (Monthly/Yearly)
- [ ] "Best Value" badge appears on Yearly plan card
- [ ] Features section (3 cards)
- [ ] Testimonials swipeable
- [ ] FAQ accordion works
- [ ] All buttons are tappable
- [ ] Text is readable (not too small/large)
- [ ] Navigation works
- [ ] Audio playback (if applicable)

---

## Troubleshooting

### "Build failed" errors
- Make sure you ran `npm run build:mobile` first
- Check that `out` directory exists after build

### "Cannot find module" errors
- Run `npm install` again
- Make sure you're in the `frontend` directory

### App shows blank screen
- Check browser console (if using live reload)
- Make sure API URLs point to your backend (not localhost)
- Check Capacitor config `webDir` is set to `out`

### Android Studio won't open
- Install Android Studio from https://developer.android.com/studio
- Make sure Java/JDK is installed

### Xcode won't open
- Install Xcode from App Store (Mac only)
- Run `xcode-select --install` if needed

### Can't install on phone
- **Android**: Enable "Install from Unknown Sources" in Settings
- **iOS**: Trust the developer certificate in Settings → General → VPN & Device Management

---

## Development Workflow

### Making Changes

1. **Edit your code** in `frontend/src/`
2. **Rebuild:**
   ```bash
   npm run build:mobile
   npx cap sync
   ```
3. **Run again** in Android Studio/Xcode

### Live Reload (Faster Development)

1. **Start Next.js dev server:**
   ```bash
   npm run dev
   ```

2. **Update `capacitor.config.ts`** with your computer's IP:
   ```typescript
   server: {
     url: 'http://192.168.1.XXX:3000', // Your IP
     cleartext: true
   }
   ```

3. **Sync:**
   ```bash
   npx cap sync
   ```

4. **Run the app** - changes will reload automatically!

---

## Next Steps

Once testing is complete:
- Prepare app icons (1024x1024 for iOS, 512x512 for Android)
- Update API endpoints to production URLs
- Test on multiple devices
- Prepare for App Store/Play Store submission

See `MOBILE_DEPLOYMENT_GUIDE.md` for full deployment instructions.

