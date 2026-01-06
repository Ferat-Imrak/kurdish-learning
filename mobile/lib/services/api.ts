// Centralized API service
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

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
  timeout: 10000, // 10 second timeout
});

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
      if (axiosError.code === 'ETIMEDOUT') {
        return 'Connection timeout: Server took too long to respond';
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
