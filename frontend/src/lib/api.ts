// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from session or localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Don't throw for 401 - just return empty data
    if (response.status === 401) {
      return response
    }
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response
}

export async function getAchievements(progressData?: any) {
  try {
    const endpoint = progressData 
      ? `/achievements?progressData=${encodeURIComponent(JSON.stringify(progressData))}`
      : '/achievements'
    const response = await apiRequest(endpoint)
    if (response.status === 401) {
      // User not authenticated, return empty achievements
      return { achievements: [] }
    }
    return response.json()
  } catch (error) {
    console.error('Failed to fetch achievements:', error)
    return { achievements: [] }
  }
}

export async function checkAchievements(progressData: any) {
  try {
    const response = await apiRequest('/achievements/check', {
      method: 'POST',
      body: JSON.stringify({ progressData }),
    })
    if (response.status === 401) {
      // User not authenticated, return empty
      return { newlyEarned: [] }
    }
    return response.json()
  } catch (error) {
    console.error('Failed to check achievements:', error)
    return { newlyEarned: [] }
  }
}

