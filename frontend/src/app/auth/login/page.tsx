'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, CheckCircle, XCircle, User } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    usernameOrEmail: string
  }>({
    usernameOrEmail: ''
  })
  const [loginError, setLoginError] = useState('')

  const validateUsernameOrEmail = (input: string) => {
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(input)) {
      return { isValid: true, type: 'email' as const }
    }
    // Check if it's a valid username: 3-30 characters, letters, numbers, _, ., -
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/
    if (usernameRegex.test(input)) {
      return { isValid: true, type: 'username' as const }
    }
    return { isValid: false, type: null }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validation = validateUsernameOrEmail(formData.usernameOrEmail)

    setValidationErrors({
      usernameOrEmail: validation.isValid ? '' : 'Please enter a valid username or email address'
    })

    if (!validation.isValid) {
      setLoginError('Please enter a valid username or email address')
      return
    }
    
    setIsLoading(true)
    setLoginError('')
    
    try {
      // First, login with NextAuth
      const res = await signIn('credentials', {
        email: formData.usernameOrEmail, // NextAuth expects 'email' field, but we accept both username and email
        password: formData.password,
        redirect: false,
      })
      
      if (res?.error) {
        // Check if it's a subscription error
        if (res.error === 'SUBSCRIPTION_EXPIRED' || res.error.includes('subscription')) {
          setLoginError('SUBSCRIPTION_REQUIRED')
        } else {
          setLoginError('Invalid username/email or password. Please check your credentials and try again.')
        }
        setIsLoading(false)
        return
      }

      // NextAuth login successful - now get backend JWT token for API calls
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.usernameOrEmail.includes('@') ? formData.usernameOrEmail : undefined,
            username: formData.usernameOrEmail.includes('@') ? undefined : formData.usernameOrEmail,
            password: formData.password,
          }),
        })

        if (loginResponse.ok) {
          const data = await loginResponse.json()
          if (data.token) {
            // Store backend JWT token for API calls
            localStorage.setItem('auth_token', data.token)
            if (formData.rememberMe) {
              sessionStorage.setItem('auth_token', data.token)
            }
            console.log('✅ Backend JWT token stored for API calls');
          }
        } else {
          console.warn('⚠️ Failed to get backend token, but NextAuth login succeeded');
        }
      } catch (error) {
        console.error('❌ Error getting backend token:', error);
        // Continue anyway - user is logged in with NextAuth, just can't sync progress
      }

      // Successful login
      router.push('/dashboard')
    } catch (error: any) {
      if (error.message === 'SUBSCRIPTION_EXPIRED' || error.message?.includes('subscription')) {
        setLoginError('SUBSCRIPTION_REQUIRED')
      } else {
        setLoginError('Invalid username/email or password. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear login error when user starts typing
    if (loginError) {
      setLoginError('')
    }

    // Real-time validation
    if (name === 'usernameOrEmail' && value) {
      const validation = validateUsernameOrEmail(value)
      setValidationErrors(prev => ({
        ...prev,
        usernameOrEmail: validation.isValid ? '' : 'Please enter a valid username or email address'
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-supportMint/10 to-brand-green/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6 shadow-xl"
              >
                <img 
                  src="/peyvi-logo.png" 
                  alt="Peyvi - Kurdish Language Learning App Logo" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-textNavy mb-2"
              >
                Welcome Back!
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gray-600 text-base sm:text-lg"
              >
                Sign in to continue your Kurdish learning journey
              </motion.p>
            </div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 p-8 hover:shadow-3xl transition-shadow duration-300"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username/Email Field */}
                <div>
                  <label htmlFor="usernameOrEmail" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      value={formData.usernameOrEmail}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-12 py-3 sm:py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm sm:text-base ${
                        validationErrors.usernameOrEmail 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : formData.usernameOrEmail && !validationErrors.usernameOrEmail
                          ? 'border-green-400 focus:ring-green-500 focus:border-green-500'
                          : 'border-gray-300 focus:ring-primaryBlue focus:border-primaryBlue hover:border-primaryBlue/50'
                      }`}
                      placeholder="Enter your username or email"
                    />
                    {formData.usernameOrEmail && !validationErrors.usernameOrEmail && (
                      <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                    )}
                    {validationErrors.usernameOrEmail && (
                      <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                    )}
                  </div>
                  
                  {formData.usernameOrEmail && !validationErrors.usernameOrEmail && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Looks good
                    </p>
                  )}
                  
                  {validationErrors.usernameOrEmail && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {validationErrors.usernameOrEmail}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3 sm:py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/70 backdrop-blur-sm border-gray-300 focus:ring-primaryBlue focus:border-primaryBlue hover:border-primaryBlue/50 text-sm sm:text-base"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Login Error */}
                {loginError && (
                  <div className={`p-4 rounded-2xl ${
                    loginError === 'SUBSCRIPTION_REQUIRED' 
                      ? 'bg-yellow-50 border border-yellow-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {loginError === 'SUBSCRIPTION_REQUIRED' ? (
                      <div className="space-y-3">
                        <p className="text-yellow-800 text-sm flex items-center gap-2 font-medium">
                          <XCircle className="w-4 h-4" />
                          Your subscription has expired. Please subscribe to continue learning.
                        </p>
                        <Link 
                          href="/auth/register"
                          className="inline-block w-full text-center bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-6 rounded-xl hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Subscribe Now
                        </Link>
                      </div>
                    ) : (
                      <p className="text-red-600 text-sm flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {loginError}
                      </p>
                    )}
                  </div>
                )}

                {/* Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                      className="w-4 h-4 text-primaryBlue border-gray-300 rounded focus:ring-primaryBlue focus:ring-2"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-xs sm:text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-xs sm:text-sm text-primaryBlue hover:text-primaryBlue/80 transition-colors whitespace-nowrap">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !!validationErrors.usernameOrEmail}
                  className="w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:from-primaryBlue/90 hover:to-supportLavender/90 focus:outline-none focus:ring-2 focus:ring-primaryBlue/50 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm sm:text-base">
                  Don't have an account?{' '}
                  <Link href="/auth/register" className="text-primaryBlue hover:text-primaryBlue/80 font-medium transition-colors whitespace-nowrap">
                    Create one here
                  </Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

