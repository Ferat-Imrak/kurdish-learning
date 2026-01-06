'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, CheckCircle, Star, XCircle } from 'lucide-react'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  
  // Check URL for plan parameter
  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam === 'monthly' || planParam === 'yearly') {
      setSelectedPlan(planParam)
    }
  }, [searchParams])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Username validation
  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_.-]{3,30}$/
    return usernameRegex.test(username)
  }

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset validation errors and submit error
    setValidationErrors({ username: '', email: '', password: '', confirmPassword: '' })
    setSubmitError(null)
    
    // Validate email
    if (!validateEmail(formData.email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }))
      return
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setValidationErrors(prev => ({ ...prev, password: 'Password must meet all requirements' }))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      return
    }

    setIsLoading(true)
    
    try {
      // Use backend API directly (not Next.js API route for static export)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.username || formData.name, // Backend expects 'name' field
          email: formData.email, 
          password: formData.password,
          plan: selectedPlan // Will be handled by backend
        }),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || msg?.message || 'Failed to register')
      }
      router.push('/auth/login')
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to create account. Please try again.')
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

    // Real-time validation
    if (name === 'username' && value) {
      const isValidUsername = validateUsername(value)
      setValidationErrors(prev => ({
        ...prev,
        username: isValidUsername ? '' : 'Username must be 3-30 characters (letters, numbers, _, ., -)'
      }))
    }

    if (name === 'email' && value) {
      const isValidEmail = validateEmail(value)
      setValidationErrors(prev => ({
        ...prev,
        email: isValidEmail ? '' : 'Please enter a valid email address'
      }))
    }

    if (name === 'password') {
      const passwordValidation = validatePassword(value)
      setValidationErrors(prev => ({
        ...prev,
        password: passwordValidation.isValid ? '' : 'Password must meet all requirements'
      }))
    }

    if (name === 'confirmPassword') {
      const passwordMatch = value === formData.password && value.length > 0
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: passwordMatch ? '' : (value.length > 0 ? 'Passwords do not match' : '')
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-gradient-to-br from-brand-green/10 to-supportMint/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-xl">
                <img 
                  src="/peyvi-logo.png" 
                  alt="Peyvi - Kurdish Language Learning App Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-3">
              Join <span className="bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent tracking-wide">Peyvi</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Start your journey to mastering Kurdish today
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-gray-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300">
            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{submitError}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Plan Selection */}
              <div className="bg-gradient-to-r from-primaryBlue/10 to-supportLavender/10 rounded-2xl p-5 border-2 border-primaryBlue/30 shadow-lg">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Choose Your Plan
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Monthly Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`relative p-3 sm:p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 ${
                      selectedPlan === 'monthly'
                        ? 'border-primaryBlue bg-primaryBlue/10 shadow-xl scale-105 ring-2 ring-primaryBlue/20'
                        : 'border-gray-300 bg-white/70 hover:border-primaryBlue/50 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-textNavy mb-1">$4.99</div>
                      <div className="text-xs sm:text-sm text-gray-600">per month</div>
                      {selectedPlan === 'monthly' && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-primaryBlue" />
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Yearly Plan */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('yearly')}
                    className={`relative p-3 sm:p-4 md:p-5 rounded-2xl border-2 transition-all duration-300 ${
                      selectedPlan === 'yearly'
                        ? 'border-primaryBlue bg-primaryBlue/10 shadow-xl scale-105 ring-2 ring-primaryBlue/20'
                        : 'border-gray-300 bg-white/70 hover:border-primaryBlue/50 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-textNavy mb-1">$49.99</div>
                      <div className="text-xs sm:text-sm text-gray-600">per year</div>
                      {selectedPlan === 'yearly' && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5 text-primaryBlue" />
                        </div>
                      )}
                      <div className="mt-2 px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-lg">
                        <div className="text-sm font-bold text-green-700">🎉 2 Months FREE</div>
                      </div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  You can change your plan anytime after signup
                </p>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-primaryBlue focus:border-primaryBlue transition-all duration-200 bg-white/70 backdrop-blur-sm hover:border-primaryBlue/50 text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                      validationErrors.username 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : formData.username && !validationErrors.username
                        ? 'border-green-400 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-primaryBlue focus:border-primaryBlue hover:border-primaryBlue/50'
                    }`}
                    placeholder="Choose a username"
                  />
                  {formData.username && !validationErrors.username && (
                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                  )}
                  {validationErrors.username && (
                    <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                  )}
                </div>
                
                {formData.username && !validationErrors.username && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Username looks good
                  </p>
                )}
                
                {validationErrors.username && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {validationErrors.username}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-4 py-3 sm:py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm sm:text-base ${
                      validationErrors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primaryBlue focus:border-primaryBlue hover:border-primaryBlue/50'
                    }`}
                    placeholder="Enter your email address"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
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
                    className={`w-full pl-12 pr-12 py-3 sm:py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm sm:text-base ${
                      validationErrors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-primaryBlue focus:border-primaryBlue hover:border-primaryBlue/50'
                    }`}
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Password requirements:</p>
                    <div className="space-y-1">
                      {[
                        { check: formData.password.length >= 8, text: 'At least 8 characters' },
                        { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                        { check: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                        { check: /\d/.test(formData.password), text: 'One number' },
                        { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' }
                      ].map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            req.check ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {req.check && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${req.check ? 'text-green-600' : 'text-gray-500'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/70 backdrop-blur-sm ${
                      validationErrors.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-400 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-300 focus:ring-primaryBlue focus:border-primaryBlue hover:border-primaryBlue/50'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Passwords match
                  </p>
                )}
                
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !!validationErrors.username || !!validationErrors.email || !!validationErrors.password || !!validationErrors.confirmPassword}
                className="w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-bold text-sm sm:text-base md:text-lg py-3 sm:py-4 px-4 sm:px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primaryBlue hover:text-primaryBlue/80 font-semibold transition-colors whitespace-nowrap">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 bg-gradient-to-r from-primaryBlue/10 to-supportLavender/10 rounded-2xl p-6 border-2 border-primaryBlue/20 shadow-lg"
          >
            <h3 className="text-base sm:text-lg font-semibold text-textNavy mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accentCoral" />
              What you'll get:
            </h3>
            <div className="space-y-3">
              {[
                'Interactive Kurdish lessons with audio',
                'Progress tracking and achievements',
                'Fun games and cultural insights',
                'Community support and resources'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Terms */}
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-8">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primaryBlue hover:underline font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primaryBlue hover:underline font-medium">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

