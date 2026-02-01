import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../lib/store/authStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      hasRedirectedRef.current = false;
      return;
    }

    const inTabs = segments[0] === '(tabs)';
    const onLanding = segments[0] === 'index' || segments.length === 0;
    const onLogin = segments[0] === 'auth' && segments[1] === 'login';

    // Logged IN → redirect to tabs if on landing (but NOT if logging out or on login page)
    if (isAuthenticated && onLanding && !hasRedirectedRef.current && !isLoggingOut && !onLogin) {
      hasRedirectedRef.current = true;
      router.replace('/(tabs)/');
      setTimeout(() => {
        hasRedirectedRef.current = false;
      }, 100);
    }
    
    // Logged OUT → DON'T redirect if on login page (let user stay there)
    // Only redirect if in tabs AND not on login page AND not logging out
    if (!isAuthenticated && inTabs && !onLogin && !hasRedirectedRef.current && !isLoggingOut) {
      hasRedirectedRef.current = true;
      // Don't redirect here - let the individual screens handle it
      // This prevents conflicts with profile/index redirects
      setTimeout(() => {
        hasRedirectedRef.current = false;
      }, 100);
    }
  }, [isAuthenticated, isLoading, isLoggingOut, segments, router]);

  // Always render all screens - Expo Router requires this
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ 
          headerShown: false,
          gestureEnabled: false, // Disable all swipe back gestures globally
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="stories" options={{ gestureEnabled: true }} />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

