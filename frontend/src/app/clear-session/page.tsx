'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ClearSessionPage() {
  const router = useRouter()
  const [clearing, setClearing] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const clearCookies = async () => {
      try {
        // Clear all NextAuth session cookies
        const cookieNames = [
          'next-auth.session-token',
          '__Secure-next-auth.session-token',
        ]
        
        // Add numbered cookies (0-10)
        for (let i = 0; i <= 10; i++) {
          cookieNames.push(`next-auth.session-token.${i}`)
        }

        // Clear each cookie
        cookieNames.forEach(name => {
          // Clear for current path
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
          // Clear for root domain
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
          // Clear without domain
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`
        })

        // Also call the API to clear server-side
        await fetch('/api/auth/clear-cookies')
        
        setSuccess(true)
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      } catch (error) {
        console.error('Error clearing cookies:', error)
        setError('Failed to clear cookies. Please clear them manually.')
        setClearing(false)
      }
    }

    clearCookies()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="card p-8 max-w-md text-center">
        {clearing && !success && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primaryBlue mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-textNavy mb-2">Clearing Session...</h1>
            <p className="text-gray-600">Removing old session cookies...</p>
          </>
        )}
        
        {success && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-textNavy mb-2">Session Cleared!</h1>
            <p className="text-gray-600 mb-4">All old session cookies have been removed.</p>
            <p className="text-sm text-gray-500">Redirecting to home page...</p>
          </>
        )}
        
        {error && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-textNavy mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Go to Home
            </button>
          </>
        )}
      </div>
    </div>
  )
}
