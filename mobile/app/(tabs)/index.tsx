import React from 'react';
import { useAuthStore } from '../../lib/store/authStore';
import DashboardScreen from './dashboard';

export default function HomeScreen() {
  // Use getState() in render - NO subscriptions
  const state = useAuthStore.getState();
  const isAuthenticated = state.isAuthenticated;
  const isLoading = state.isLoading;
  
  console.log('🟢 HomeScreen: Render', { isLoading, isAuthenticated });

  // REMOVED: HomeScreen redirect logic
  // Navigation is handled in profile.tsx BEFORE logout
  // This prevents double redirects and navigation conflicts

  // Show dashboard for authenticated users only
  if (!isLoading && isAuthenticated) {
    return <DashboardScreen />;
  }

  // If not authenticated, return null immediately to prevent rendering
  // The redirect will happen in useEffect
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  // Show nothing while loading
  return null;
}
