# Kurdish Learning Mobile App

React Native mobile app built with Expo for iOS and Android.

## Setup

1. Install dependencies:
```bash
npm install
```

2. **Configure API URL for Mobile Development:**
   
   When testing on a physical device, you need to use your computer's IP address instead of `localhost`.
   
   **Find your computer's IP address:**
   - **Mac/Linux:** Run `ifconfig | grep "inet " | grep -v 127.0.0.1` and look for your local IP (usually starts with `192.168.` or `10.`)
   - **Windows:** Run `ipconfig` and look for "IPv4 Address" under your active network adapter
   
   **Create `.env` file in the `mobile/` directory:**
   ```bash
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:8080/api
   ```
   
   Example:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8080/api
   ```
   
   **Important:**
   - Backend runs on port 8080 (see backend startup log for "Mobile access: http://...")
   - Your phone and computer must be on the same WiFi network when using a local IP
   - Restart Expo after changing the `.env` file

3. Start the development server:
```bash
npm start
```

4. Run on iOS:
```bash
npm run ios
```

5. Run on Android:
```bash
npm run android
```

## Troubleshooting Network Errors

**"timeout" or "Cannot reach server"** – The app could not reach the backend. Common causes:

### Using Expo Tunnel (`npx expo start --tunnel`)

With **tunnel**, your phone loads the app via the internet but API requests still go to `EXPO_PUBLIC_API_URL`. If that URL is your computer's local IP (e.g. `10.0.0.45`), the phone often **cannot** reach it because the phone may be on a different network (cellular or another WiFi).

**Options:**

1. **Run without tunnel (recommended for local dev):**
   ```bash
   npx expo start
   ```
   Then connect your phone and computer to the **same WiFi**. Set `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8080/api` in `mobile/.env`. Use the IP shown in the backend log ("Mobile access: http://...").

2. **Expose the backend with ngrok (works with tunnel):**
   ```bash
   ngrok http 8080
   ```
   Copy the `https://xxxx.ngrok.io` URL, then in `mobile/.env`:
   ```bash
   EXPO_PUBLIC_API_URL=https://xxxx.ngrok.io/api
   ```
   Restart Expo. The phone can then reach the backend over the internet.

### General checks

1. **Set API URL:** Create or edit `mobile/.env` with `EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8080/api`. Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1` (Mac/Linux) or `ipconfig` (Windows). Restart Expo after changing `.env`.

2. **Backend running:** `cd backend && npm run dev`. Backend listens on `0.0.0.0:8080` so the device can reach it.

3. **Same WiFi:** When using a local IP, phone and computer must be on the same network. Test in the phone browser: `http://YOUR_IP:8080/api/health`.

4. **macOS Firewall (same WiFi but still timeout):** The Mac may be blocking incoming connections. In **System Settings → Network → Firewall**:
   - If Firewall is On: click **Options** and add **Node** (or **tsx**) and allow **Incoming connections**, or
   - Temporarily turn Firewall Off to test; if login works, add an allow rule for Node/tsx and turn Firewall back On.

## Project Structure

- `app/` - Expo Router pages (file-based routing)
- `components/` - Reusable React Native components
- `lib/` - Utilities and helpers
- `hooks/` - Custom React hooks

## Shared Code

Shared types and API client are in `../shared/` directory.

## Development

This app uses:
- **Expo Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management
- **TypeScript** for type safety


