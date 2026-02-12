'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ProgressProvider } from '../contexts/ProgressContext'
import { GamesProgressProvider } from '../contexts/GamesProgressContext'

type AuthUser = {
  id?: string
  email?: string | null
  name?: string | null
  image?: string | null
  role?: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
}

async function clearStoredToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_token')
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getStoredToken()
        if (!token) {
          setUser(null)
          return
        }
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
        const res = await fetch(`${apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) {
          await clearStoredToken()
          setUser(null)
          return
        }
        const data = await res.json()
        setUser(data?.user || null)
      } catch (error) {
        console.error('Failed to load user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signOut: async () => {
      await clearStoredToken()
      window.location.href = window.location.origin
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>
        <GamesProgressProvider>
          {children}
        </GamesProgressProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#363636', color: '#fff', fontSize: '16px', borderRadius: '12px' },
          }}
        />
      </ProgressProvider>
    </AuthProvider>
  )
}

