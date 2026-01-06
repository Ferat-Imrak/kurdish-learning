// Auth state management with SecureStore
import { create } from 'zustand';
import { User } from '../shared/types';
import * as SecureStore from 'expo-secure-store';
import { restoreSession, logout as logoutService } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  isLoggingOut: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as true, will be set to false after initialization
  isInitializing: false,
  isLoggingOut: false,
  token: null,

  setUser: async (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      try {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user:', error);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(USER_KEY);
      } catch (error) {
        console.error('Error removing user:', error);
      }
    }
  },

  setToken: async (token) => {
    set({ token });
    if (token) {
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } catch (error) {
        console.error('Error saving token:', error);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch (error) {
        console.error('Error removing token:', error);
      }
    }
  },

  login: async (user, token) => {
    await get().setToken(token);
    await get().setUser(user);
    set({ isAuthenticated: true });
  },

  logout: async () => {
    console.log('🟡 AuthStore: Logout called');
    set({ isLoggingOut: true });
    await logoutService();
    await get().setToken(null);
    await get().setUser(null);
    set({ isAuthenticated: false, isLoggingOut: false });
    console.log('🟡 AuthStore: Logout complete, isAuthenticated:', false);
  },

  initialize: async () => {
    // Prevent multiple simultaneous initializations
    if (get().isInitializing) {
      return;
    }
    
    set({ isLoading: true, isInitializing: true });
    
    // Use Promise.race to ensure we always finish within 1 second
    const initPromise = (async () => {
      try {
        // Try to load from SecureStore (no API call, fast)
        const [storedUser, storedToken] = await Promise.all([
          SecureStore.getItemAsync(USER_KEY).catch(() => null),
          SecureStore.getItemAsync(TOKEN_KEY).catch(() => null)
        ]);
        
        if (storedUser && storedToken) {
          try {
            // Use stored data immediately (no API call to avoid rate limiting)
            const user = JSON.parse(storedUser);
            set({ 
              user, 
              token: storedToken, 
              isAuthenticated: true,
              isLoading: false,
              isInitializing: false
            });
            return;
          } catch (parseError) {
            console.error('Error parsing stored user:', parseError);
          }
        }
        
        // No stored data or parse error - user is not authenticated
        set({ isLoading: false, isInitializing: false });
      } catch (error: any) {
        console.error('Error initializing auth:', error);
        set({ isLoading: false, isInitializing: false });
      }
    })();
    
    // Race with timeout to ensure we always finish
    await Promise.race([
      initPromise,
      new Promise<void>((resolve) => {
        setTimeout(() => {
          console.warn('Auth initialization timeout - defaulting to logged out');
          set({ isLoading: false, isInitializing: false });
          resolve();
        }, 1000); // 1 second max
      })
    ]);
  },
}));
