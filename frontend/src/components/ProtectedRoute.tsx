'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../app/providers'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'active' | 'expired'>('loading')

  useEffect(() => {
    // Allow access to landing page, auth pages, and legal pages
    const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/terms', '/privacy']
    const isPublicPath = publicPaths.includes(pathname)

    // If not loading and not authenticated and not on a public path, redirect to login
    if (!loading && !user && !isPublicPath) {
      router.push('/auth/login')
    }
  }, [user, loading, pathname, router])

  // Check subscription status when authenticated
  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
          const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
          const response = await fetch(`${apiBase}/auth/subscription`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined
          })
          if (response.ok) {
            const data = await response.json()
            // Check if expired (including CANCELED past end date)
            if (data.status === 'EXPIRED' || 
                (data.status === 'CANCELED' && data.endDate && new Date(data.endDate) < new Date())) {
              setSubscriptionStatus('expired')
            } else {
              setSubscriptionStatus('active')
            }
          } else {
            setSubscriptionStatus('active') // Default to active if check fails
          }
        } catch (error) {
          setSubscriptionStatus('active') // Default to active if check fails
        }
      } else {
        setSubscriptionStatus('active')
      }
    }
    checkSubscription()
  }, [user])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-backgroundCream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Allow public paths
  const publicPaths = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/terms', '/privacy']
  if (publicPaths.includes(pathname)) {
    return <>{children}</>
  }

  // Check subscription if authenticated
  if (user) {
    if (subscriptionStatus === 'loading') {
      return (
        <div className="min-h-screen bg-backgroundCream flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    
    if (subscriptionStatus === 'expired') {
      return (
        <div className="min-h-screen bg-backgroundCream flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Expired</h2>
            <p className="text-gray-600 mb-6">Your subscription has expired. Please subscribe to continue learning Kurdish.</p>
            <a
              href="/auth/register"
              className="inline-block w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-6 rounded-xl hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Subscribe Now
            </a>
          </div>
        </div>
      )
    }
    
    return <>{children}</>
  }

  // Return null while redirecting
  return null
}

