// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get token from localStorage or sessionStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    : null

  if (!token && typeof window !== 'undefined') {
    console.warn(`⚠️ No auth token found for API request to ${endpoint}. User may need to log out and log back in to get a token.`);
  }

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
      if (!token) {
        console.warn(`⚠️ API request to ${endpoint} returned 401 - no token available. Please log out and log back in.`);
      } else {
        console.warn(`⚠️ API request to ${endpoint} returned 401 - token may be expired. Please log out and log back in.`);
      }
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

