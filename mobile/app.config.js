// Expo app config with environment variable support
require('dotenv').config();

module.exports = {
  expo: {
    name: "Peyvi Kurdish Learning",
    slug: "kurdish-learning",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    splash: {
      backgroundColor: "#2563eb",
      resizeMode: "contain"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.peyvi.kurdishlearning"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      },
      package: "com.peyvi.kurdishlearning"
    },
    web: {},
    scheme: "kurdishlearning",
    plugins: [
      "expo-router"
    ],
    extra: {
      // Expose environment variables to the app
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api'
    }
  }
};
