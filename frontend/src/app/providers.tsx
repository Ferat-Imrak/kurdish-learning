'use client'

import { SessionProvider, useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { ProgressProvider } from '../contexts/ProgressContext'

type SimpleUser = { email?: string | null, name?: string | null, image?: string | null }

export function useAuth() {
  const { data, status } = useSession()
  return {
    user: (data?.user as SimpleUser) || null,
    loading: status === 'loading',
    signOut: async () => { 
      // Clear the session cookie first
      if (typeof window !== 'undefined') {
        try {
          // Clear NextAuth session
          await nextAuthSignOut({ redirect: false })
          
          // Also clear any other session-related cookies
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=")
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim()
            if (name.includes('session') || name.includes('auth')) {
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
              document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
            }
          })
        } catch (error) {
          console.error('Error clearing session:', error)
        }
        window.location.href = window.location.origin
      } else {
        await nextAuthSignOut({ callbackUrl: '/' })
      }
    },
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProgressProvider>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: '#363636', color: '#fff', fontSize: '16px', borderRadius: '12px' },
          }}
        />
      </ProgressProvider>
    </SessionProvider>
  )
}

