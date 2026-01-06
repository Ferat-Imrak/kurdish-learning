// Authentication service
import { apiClient, tokenService, handleApiError } from './api';
import { User } from '../shared/types';
import axios from 'axios';

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
}

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // Determine if input is email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.usernameOrEmail);
    const loginPayload = isEmail
      ? { email: credentials.usernameOrEmail, password: credentials.password }
      : { username: credentials.usernameOrEmail, password: credentials.password };

    const response = await apiClient.post('/auth/login', loginPayload);

    const { user, token } = response.data;

    if (token) {
      await tokenService.setToken(token);
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username || user.email?.split('@')[0] || '',
        email: user.email,
        name: user.name,
        image: user.image,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
      },
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    if (__DEV__) {
      console.log('📝 Registering user:', { email: data.email, username: data.username });
      console.log('🔗 API URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api');
    }
    
    const response = await apiClient.post('/auth/register', {
      name: data.username, // Backend expects 'name' field
      email: data.email,
      password: data.password,
    });

    if (__DEV__) {
      console.log('✅ Registration response:', JSON.stringify(response.data, null, 2));
    }

    // Validate response structure first
    if (!response.data) {
      throw new Error('Invalid response: no data received');
    }

    const { user, token } = response.data;

    // Validate response structure
    if (!user) {
      console.error('❌ Response data:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response: user data missing. Response: ' + JSON.stringify(response.data));
    }

    if (!user.id) {
      console.error('❌ User object:', JSON.stringify(user, null, 2));
      throw new Error('Invalid response: user ID missing. User: ' + JSON.stringify(user));
    }

    if (token) {
      await tokenService.setToken(token);
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username || data.username,
        email: user.email || data.email,
        name: user.name || data.username,
        image: user.image || null,
        subscriptionPlan: user.subscriptionPlan || null,
        subscriptionStatus: user.subscriptionStatus || 'ACTIVE',
      },
      token,
    };
  } catch (error) {
    if (__DEV__) {
      console.error('❌ Registration error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method,
          }
        });
      }
    }
    return {
      success: false,
      error: handleApiError(error),
    };
  }
};

// Logout
export const logout = async (): Promise<void> => {
  // Just clear local token - no need to call backend
  // Backend logout endpoint doesn't exist, and JWT tokens are stateless anyway
  try {
    await tokenService.removeToken();
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await tokenService.getToken();
    if (!token) {
      return null;
    }

    const response = await apiClient.get('/auth/me');
    return {
      id: response.data.user.id,
      username: response.data.user.username || response.data.user.email?.split('@')[0] || '',
      email: response.data.user.email,
      name: response.data.user.name,
      image: response.data.user.image,
      subscriptionPlan: response.data.user.subscriptionPlan,
      subscriptionStatus: response.data.user.subscriptionStatus,
    };
  } catch (error: any) {
    console.error('Get current user error:', error);
    // Don't clear token on 429 (rate limit) - just return null
    if (error?.response?.status === 429) {
      console.warn('Rate limited - skipping token clear');
      return null;
    }
    await tokenService.removeToken();
    return null;
  }
};

// Verify token and restore session
export const restoreSession = async (): Promise<User | null> => {
  try {
    const token = await tokenService.getToken();
    if (!token) {
      return null;
    }

    // Verify token by fetching current user
    return await getCurrentUser();
  } catch (error: any) {
    console.error('Restore session error:', error);
    // Don't clear token on 429 (rate limit) - just return null
    if (error?.response?.status === 429) {
      console.warn('Rate limited during session restore - keeping stored token');
      return null; // Return null but don't clear token
    }
    // Only clear token on other errors (401, etc.)
    await tokenService.removeToken();
    return null;
  }
};

