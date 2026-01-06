// Shared API client for both web and mobile
import axios from 'axios'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth endpoints
export const authApi = {
  login: async (usernameOrEmail: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      usernameOrEmail,
      password,
    })
    return response.data
  },

  register: async (data: {
    username: string
    email: string
    password: string
  }) => {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },
}

// User endpoints
export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/user/profile')
    return response.data
  },
}


