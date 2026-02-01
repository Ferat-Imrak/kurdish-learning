// Centralized API service
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

// Log API URL for debugging (only in development)
if (__DEV__) {
  console.log('🔗 API URL:', API_URL);
}

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout (increased for slow networks)
});

/** Quick connectivity check (short timeout). Use before login to fail fast. */
export async function checkConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = axios.create({
      baseURL: API_URL,
      timeout: 6000,
      headers: { 'Content-Type': 'application/json' },
    });
    await client.get('/health');
    return { ok: true };
  } catch (e: any) {
    const msg = e?.code === 'ETIMEDOUT' || e?.message?.includes('timeout')
      ? 'Connection timeout. See alert for tips.'
      : e?.message || 'Network error';
    return { ok: false, error: msg };
  }
}

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Token management
export const tokenService = {
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },
};

// Add request interceptor to include token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await tokenService.removeToken();
    } else if (error.response?.status === 429) {
      // Rate limited - log warning but don't clear token
      console.warn('⚠️ Rate limited - too many requests. Please wait a moment.');
    }
    return Promise.reject(error);
  }
);

// API error handler
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    // Network errors (connection refused, timeout, etc.)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNREFUSED' || axiosError.message.includes('Network Error')) {
        return 'Network error: Cannot connect to server. Make sure:\n1. Backend server is running\n2. Using your computer\'s IP address (not localhost)\n3. Phone and computer are on same WiFi';
      }
      if (axiosError.code === 'ETIMEDOUT' || axiosError.message.includes('timeout')) {
        const url = axiosError.config?.baseURL || API_URL;
        const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
        if (isLocalhost) {
          return 'Connection timeout: On a device/tunnel, "localhost" does not reach your computer. Set EXPO_PUBLIC_API_URL in mobile/.env to your computer\'s IP (e.g. http://192.168.1.x:8080/api). See mobile/README.md.';
        }
        return (
          'Connection timeout: The app could not reach the server.\n\n' +
          '• Using Expo Tunnel? Your phone may be on a different network. Try: run without tunnel (npx expo start) so phone and computer are on the same WiFi.\n\n' +
          '• Or expose the backend with ngrok: run "ngrok http 8080", then set EXPO_PUBLIC_API_URL in mobile/.env to the ngrok URL (e.g. https://xxxx.ngrok.io/api) and restart Expo.'
        );
      }
      return `Network error: ${axiosError.message}`;
    }
    
    // Server responded with error
    return axiosError.response?.data?.message || 
           axiosError.response?.data?.error || 
           axiosError.message || 
           'An error occurred';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};
