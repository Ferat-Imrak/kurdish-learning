#!/bin/bash

# Mobile App Setup Script for Kurdish Learning App
# This script sets up Capacitor for iOS and Android deployment

set -e

echo "🚀 Setting up mobile app deployment with Capacitor..."

cd frontend

# Check if Capacitor is already installed
if [ -d "node_modules/@capacitor" ]; then
  echo "✅ Capacitor is already installed"
else
  echo "📦 Installing Capacitor..."
  npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
fi

# Check if capacitor.config.ts exists
if [ ! -f "capacitor.config.ts" ]; then
  echo "⚙️  Creating Capacitor configuration..."
  cat > capacitor.config.ts << 'EOF'
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

export default config;
EOF
  echo "✅ Created capacitor.config.ts"
else
  echo "✅ Capacitor config already exists"
fi

# Update next.config.js for static export
echo "📝 Checking Next.js configuration..."
if ! grep -q "output: 'export'" next.config.js; then
  echo "⚠️  You need to update next.config.js to enable static export:"
  echo "   Add: output: 'export',"
  echo "   Add: images: { unoptimized: true },"
else
  echo "✅ Next.js is configured for static export"
fi

# Build the app
echo "🏗️  Building Next.js app..."
npm run build

# Add platforms if they don't exist
if [ ! -d "ios" ]; then
  echo "📱 Adding iOS platform..."
  npx cap add ios
else
  echo "✅ iOS platform already exists"
fi

if [ ! -d "android" ]; then
  echo "🤖 Adding Android platform..."
  npx cap add android
else
  echo "✅ Android platform already exists"
fi

# Sync
echo "🔄 Syncing web assets to native projects..."
npx cap sync

echo ""
echo "✅ Mobile setup complete!"
echo ""
echo "Next steps:"
echo "  iOS:     npx cap open ios"
echo "  Android: npx cap open android"
echo ""
echo "Or use the npm scripts:"
echo "  npm run ios:dev"
echo "  npm run android:dev"
echo ""












