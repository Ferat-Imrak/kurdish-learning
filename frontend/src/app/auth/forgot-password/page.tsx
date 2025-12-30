'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, XCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [recoveryType, setRecoveryType] = useState<'username' | 'password' | null>(null)
  const [recoveredUsername, setRecoveredUsername] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailValid = validateEmail(email)
    if (!emailValid) {
      setValidationError('Please enter a valid email address')
      return
    }

    if (!recoveryType) {
      setValidationError('Please select what you need help with')
      return
    }

    setIsLoading(true)
    setValidationError('')
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: recoveryType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setValidationError(data.error || 'Something went wrong. Please try again.')
        return
      }

      // In development, username might be returned directly
      if (recoveryType === 'username' && data.username) {
        setRecoveredUsername(data.username)
      }

      setIsSubmitted(true)
    } catch (error) {
      setValidationError('Something went wrong. Please try again.')
      console.error('Forgot password error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('')
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
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primaryBlue to-supportLavender text-white flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <Mail className="w-8 h-8" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-3xl font-bold text-gray-800 mb-2"
              >
                Forgot Username or Password?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-gray-600"
              >
                {isSubmitted 
                  ? `We've sent you a ${recoveryType === 'username' ? 'username reminder' : 'password reset link'}`
                  : "Enter your email address and we'll help you recover your account"
                }
              </motion.p>
            </div>

            {/* Recovery Type Selection */}
            {!isSubmitted && !recoveryType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 mb-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">What do you need help with?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setRecoveryType('username')}
                    className="p-6 border-2 border-gray-200 rounded-2xl hover:border-primaryBlue hover:bg-primaryBlue/5 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primaryBlue/10 rounded-full flex items-center justify-center">
                        <span className="text-primaryBlue font-bold text-sm">👤</span>
                      </div>
                      <h4 className="font-semibold text-gray-800">Forgot Username</h4>
                    </div>
                    <p className="text-gray-600 text-sm">Get your username sent to your email address</p>
                  </button>
                  <button
                    onClick={() => setRecoveryType('password')}
                    className="p-6 border-2 border-gray-200 rounded-2xl hover:border-primaryBlue hover:bg-primaryBlue/5 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primaryBlue/10 rounded-full flex items-center justify-center">
                        <span className="text-primaryBlue font-bold text-sm">🔒</span>
                      </div>
                      <h4 className="font-semibold text-gray-800">Forgot Password</h4>
                    </div>
                    <p className="text-gray-600 text-sm">Reset your password with a secure link</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Form Card */}
            {recoveryType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8"
              >
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      {recoveryType === 'username' 
                        ? "We'll send your username to this email address"
                        : "We'll send a password reset link to this email address"
                      }
                    </p>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                        className={`w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-2 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
                          validationError 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : email && !validationError
                            ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                            : 'border-gray-200 focus:ring-primaryBlue focus:border-primaryBlue'
                        }`}
                        placeholder="Enter your email address"
                      />
                      {email && !validationError && (
                        <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                      )}
                      {validationError && (
                        <XCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 w-5 h-5" />
                      )}
                    </div>
                    
                    {email && !validationError && (
                      <p className="text-green-600 text-sm mt-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Email looks good
                      </p>
                    )}
                    
                    {validationError && (
                      <p className="text-red-600 text-sm mt-2 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {validationError}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !!validationError}
                    className="w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-4 px-6 rounded-2xl hover:from-primaryBlue/90 hover:to-supportLavender/90 focus:outline-none focus:ring-2 focus:ring-primaryBlue/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading 
                      ? 'Sending...' 
                      : recoveryType === 'username' 
                        ? 'Send Username' 
                        : 'Send Reset Link'
                    }
                  </button>
                </form>
              ) : (
                /* Success State */
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {recoveryType === 'username' && recoveredUsername 
                        ? 'Your Username' 
                        : 'Check Your Email'
                      }
                    </h3>
                    {recoveryType === 'username' && recoveredUsername ? (
                      <div className="bg-primaryBlue/10 border-2 border-primaryBlue rounded-2xl p-6 mb-4">
                        <p className="text-sm text-gray-600 mb-2">Your username is:</p>
                        <p className="text-2xl font-bold text-primaryBlue">{recoveredUsername}</p>
                        <p className="text-xs text-gray-500 mt-4">
                          (In development mode - this will be sent via email in production)
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600 mb-4">
                          {recoveryType === 'username' 
                            ? `We've sent your username to ${email}`
                            : `We've sent a password reset link to ${email}`
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          Didn't receive the email? Check your spam folder or try again.
                        </p>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsSubmitted(false)
                        setEmail('')
                        setRecoveryType(null)
                        setRecoveredUsername(null)
                      }}
                      className="w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-6 rounded-2xl hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {recoveredUsername ? 'Try Different Email' : 'Try Different Email'}
                    </button>
                  </div>
                </div>
              )}
              </motion.div>
            )}

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Check your spam/junk folder</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Make sure you entered the correct email</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Contact support if you still need help</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
