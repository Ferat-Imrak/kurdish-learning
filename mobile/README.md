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
   EXPO_PUBLIC_API_URL=http://YOUR_IP_ADDRESS:5001/api
   ```
   
   Example:
   ```bash
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5001/api
   ```
   
   **Important:**
   - Make sure your backend server is running on port 5001
   - Your phone and computer must be on the same WiFi network
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

If you see "Network error" or "Cannot connect to server":

1. **Check backend is running:**
   ```bash
   cd ../backend
   npm run dev
   ```

2. **Verify API URL:**
   - Check the console log when the app starts - it will show the API URL being used
   - Make sure it's your computer's IP, not `localhost`

3. **Check CORS:**
   - The backend should allow all origins in development mode
   - Check `backend/src/index.ts` CORS configuration

4. **Same WiFi network:**
   - Phone and computer must be on the same network
   - Try pinging your computer's IP from your phone's browser: `http://YOUR_IP:5001/api/health`

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


