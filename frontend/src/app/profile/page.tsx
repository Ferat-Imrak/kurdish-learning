'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import NextImage from 'next/image'
import { User, Mail, Lock, Camera, Save, Loader2, Trash2, CreditCard, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../providers'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(user?.image || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [isValidatingPassword, setIsValidatingPassword] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [profileSaveStatus, setProfileSaveStatus] = useState<'success' | 'error' | null>(null)
  const [profileSaveMessage, setProfileSaveMessage] = useState<string>('')
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<'success' | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [subscriptionPlan, setSubscriptionPlan] = useState<'monthly' | 'yearly' | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'ACTIVE' | 'CANCELED' | 'EXPIRED' | null>(null)
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null)
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [planChangeStatus, setPlanChangeStatus] = useState<'success' | 'error' | null>(null)
  const [planChangeMessage, setPlanChangeMessage] = useState<string>('')
  const [isCanceling, setIsCanceling] = useState(false)
  const [cancelStatus, setCancelStatus] = useState<'success' | 'error' | null>(null)
  const [cancelMessage, setCancelMessage] = useState<string>('')
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  useEffect(() => {
    if (user) {
      setFullName(user.name || '')
      setEmail(user.email || '')
      setAvatarUrl(user.image || '')
    }
  }, [user])

  // Fetch current subscription details
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        // Fetch from API to get full details
        const response = await fetch(`${apiBase}/auth/subscription`, {
          headers: getAuthHeaders()
        })
        if (response.ok) {
          const data = await response.json()
          // Convert 'MONTHLY'/'YEARLY' to 'monthly'/'yearly'
          if (data.plan) {
            setSubscriptionPlan(data.plan.toLowerCase() as 'monthly' | 'yearly')
          }
          if (data.status) {
            setSubscriptionStatus(data.status)
          }
          if (data.endDate) {
            setSubscriptionEndDate(new Date(data.endDate))
          }
        }
      } catch (error) {
        console.error('Failed to fetch subscription details:', error)
      }
    }

    if (user) {
      fetchSubscriptionDetails()
    }
  }, [user])

  const compressImage = (file: File, maxWidth: number = 512, maxHeight: number = 512, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedBase64)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file')
      return
    }
    
    setAvatarError(null)

    setIsUploading(true)

    try {
      // Compress and resize the image automatically
      const compressedBase64 = await compressImage(file, 512, 512, 0.8)
      
      // Save to database via API
      const response = await fetch(`${apiBase}/auth/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          name: fullName || user?.name, 
          email: email || user?.email,
          image: compressedBase64 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload avatar.')
      }

      const data = await response.json()
      
      // Update local state
      if (data.user?.image) {
        setAvatarUrl(data.user.image)
      }
      if (data.user?.name) {
        setFullName(data.user.name)
      }
      
      // No session refresh needed; backend is source of truth
      
      setAvatarError(null)

    } catch (error: any) {
      setAvatarError(error.message || 'Failed to upload avatar.')
      console.error('Avatar upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email format
    if (email && !validateEmail(email)) {
      setProfileSaveStatus('error')
      setProfileSaveMessage('Please enter a valid email address')
      return
    }
    
    setIsSaving(true)
    setProfileSaveStatus(null)
    setProfileSaveMessage('')

    try {
      const response = await fetch(`${apiBase}/auth/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: fullName, email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile.');
      }

      const data = await response.json()
      
      // Update local state with response data
      if (data.user) {
        setFullName(data.user.name || '')
        setEmail(data.user.email || '')
        if (data.user.image) {
          setAvatarUrl(data.user.image)
        }
      }

      // No session refresh needed; backend is source of truth

      setProfileSaveStatus('success')
      setProfileSaveMessage('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileSaveStatus(null)
        setProfileSaveMessage('')
      }, 3000)
    } catch (error: any) {
      setProfileSaveStatus('error')
      setProfileSaveMessage(error.message || 'Failed to save changes.')
      console.error('Save changes error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const validateCurrentPassword = async (password: string) => {
    if (!password || password.trim() === '') {
      setPasswordErrors({ ...passwordErrors, currentPassword: undefined })
      return
    }

    setIsValidatingPassword(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setPasswordErrors({})
    
    // Validate current password is provided
    if (!currentPassword || currentPassword.trim() === '') {
      setPasswordErrors({ currentPassword: 'Please enter your current password.' })
      return
    }
    
    if (newPassword !== confirmNewPassword) {
      setPasswordErrors({ confirmPassword: 'New passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'New password must be at least 6 characters.' })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch(`${apiBase}/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json()

      if (!response.ok) {
        // Set inline error for current password if it's incorrect
        if (data.message?.toLowerCase().includes('current password') || data.message?.toLowerCase().includes('incorrect')) {
          setPasswordErrors({ currentPassword: data.message || 'Current password is incorrect.' })
        } else {
          setPasswordErrors({ currentPassword: data.message || 'Failed to change password.' })
        }
        return
      }

      setPasswordChangeStatus('success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPasswordErrors({})
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordChangeStatus(null)
      }, 3000)
    } catch (error: any) {
      setPasswordErrors({ currentPassword: 'Failed to change password. Please try again.' })
      console.error('Change password error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm.')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const response = await fetch(`${apiBase}/auth/me`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete account.');
      }

      await signOut()
      router.push('/')
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete account.')
      console.error('Delete account error:', error)
    } finally {
      setIsDeleting(false)
      if (!deleteError) {
        setShowDeleteConfirm(false)
        setDeleteConfirmText('')
      }
    }
  }

  const handleChangePlan = async (newPlan: 'monthly' | 'yearly') => {
    if (newPlan === subscriptionPlan) return // Already on this plan
    
    setIsChangingPlan(true)
    setPlanChangeStatus(null)
    setPlanChangeMessage('')

    try {
      const response = await fetch(`${apiBase}/auth/subscription/plan`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan: newPlan }),
      })

      const data = await response.json()

      if (!response.ok) {
        setPlanChangeStatus('error')
        setPlanChangeMessage(data.message || 'Failed to change subscription plan')
        return
      }

      setPlanChangeStatus('success')
      setPlanChangeMessage(`Successfully switched to ${newPlan} plan!`)
      setSubscriptionPlan(newPlan)
      
      // Refresh subscription details
      const subResponse = await fetch(`${apiBase}/auth/subscription`, {
        headers: getAuthHeaders()
      })
      if (subResponse.ok) {
        const subData = await subResponse.json()
        if (subData.status) setSubscriptionStatus(subData.status)
        if (subData.endDate) setSubscriptionEndDate(new Date(subData.endDate))
      }
      
      // No session refresh needed
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPlanChangeStatus(null)
        setPlanChangeMessage('')
      }, 3000)
    } catch (error: any) {
      setPlanChangeStatus('error')
      setPlanChangeMessage('Failed to change subscription plan. Please try again.')
      console.error('Change plan error:', error)
    } finally {
      setIsChangingPlan(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will have access until your subscription end date.')) {
      return
    }

    setIsCanceling(true)
    setCancelStatus(null)
    setCancelMessage('')

    try {
      const response = await fetch(`${apiBase}/auth/subscription/cancel`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        setCancelStatus('error')
        setCancelMessage(data.message || 'Failed to cancel subscription')
        return
      }

      setCancelStatus('success')
      setCancelMessage(data.message || 'Subscription canceled successfully')
      setSubscriptionStatus('CANCELED')
      if (data.endDate) {
        setSubscriptionEndDate(new Date(data.endDate))
      }
      
      // No session refresh needed
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setCancelStatus(null)
        setCancelMessage('')
      }, 5000)
    } catch (error: any) {
      setCancelStatus('error')
      setCancelMessage('Failed to cancel subscription. Please try again.')
      console.error('Cancel subscription error:', error)
    } finally {
      setIsCanceling(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold text-textNavy mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
        <Link href="/auth/login" className="btn-primary">Go to Login</Link>
      </div>
    )
  }

  const userInitials = (user.name || user.email || 'U').substring(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-textNavy font-heading flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primaryBlue to-purple-600 rounded-2xl">
                <User className="w-6 h-6 text-white" />
              </div>
              Profile
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Manage your account information</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Picture & Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-textNavy">Profile Picture</h2>
                <p className="text-sm text-gray-500">Update your avatar</p>
              </div>
            </div>

            {avatarError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {avatarError}
                </p>
              </div>
            )}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full bg-primaryBlue flex items-center justify-center text-white text-4xl font-bold mb-4 overflow-hidden border-4 border-primaryBlue shadow-lg">
                {avatarUrl ? (
                  <NextImage src={avatarUrl} alt={`${fullName || user?.name || 'User'} profile avatar`} width={128} height={128} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  userInitials
                )}
                {/* Loading overlay - always visible when uploading */}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
                {/* Camera overlay - only on hover when not uploading */}
                <label 
                  htmlFor="avatar-upload" 
                  className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full transition-opacity duration-300 ${
                    isUploading 
                      ? 'opacity-0 cursor-not-allowed pointer-events-none' 
                      : 'opacity-0 hover:opacity-100 cursor-pointer'
                  }`}
                >
                  <Camera className="w-8 h-8 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </div>
              <p className="text-lg font-semibold text-textNavy">{fullName || 'Profile'}</p>
            </div>
          </motion.div>

          {/* Profile Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-textNavy">Profile Information</h2>
                <p className="text-sm text-gray-500">Update your details</p>
              </div>
            </div>

            {profileSaveStatus && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                profileSaveStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {profileSaveStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{profileSaveMessage}</span>
              </div>
            )}
            <form onSubmit={handleSaveChanges} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200"
                  placeholder="Your full name"
                  required
                  disabled={isSaving}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200"
                  placeholder="your@email.com"
                  required
                  disabled={isSaving}
                />
              </div>
              <button
                type="submit"
                className="w-full btn-primary text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Subscription Management Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-6 hover:shadow-xl transition-shadow mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textNavy">Subscription Plan</h2>
              <p className="text-sm text-gray-500">Manage your subscription</p>
            </div>
          </div>

          {planChangeStatus && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              planChangeStatus === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {planChangeStatus === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{planChangeMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Current Plan:</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Monthly Plan */}
                <button
                  type="button"
                  onClick={() => handleChangePlan('monthly')}
                  disabled={isChangingPlan || subscriptionPlan === 'monthly'}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                    subscriptionPlan === 'monthly'
                      ? 'border-primaryBlue bg-primaryBlue/10 shadow-xl scale-105 ring-2 ring-primaryBlue/20'
                      : 'border-gray-300 bg-white/70 hover:border-primaryBlue/50 hover:shadow-md'
                  } ${isChangingPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-textNavy mb-1">$4.99</div>
                    <div className="text-sm text-gray-600">per month</div>
                    {subscriptionPlan === 'monthly' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-primaryBlue" />
                      </div>
                    )}
                  </div>
                </button>

                {/* Yearly Plan */}
                <button
                  type="button"
                  onClick={() => handleChangePlan('yearly')}
                  disabled={isChangingPlan || subscriptionPlan === 'yearly'}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                    subscriptionPlan === 'yearly'
                      ? 'border-primaryBlue bg-primaryBlue/10 shadow-xl scale-105 ring-2 ring-primaryBlue/20'
                      : 'border-gray-300 bg-white/70 hover:border-primaryBlue/50 hover:shadow-md'
                  } ${isChangingPlan ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-textNavy mb-1">$49.99</div>
                    <div className="text-sm text-gray-600">per year</div>
                    {subscriptionPlan === 'yearly' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle2 className="w-5 h-5 text-primaryBlue" />
                      </div>
                    )}
                    <div className="mt-1 text-xs text-green-600 font-semibold">
                      2 months free
                    </div>
                  </div>
                </button>
              </div>
            </div>
            {isChangingPlan && (
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Updating plan...</span>
              </div>
            )}
            
            {/* Subscription Status */}
            {subscriptionStatus && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span className={`text-sm font-semibold ${
                    subscriptionStatus === 'ACTIVE' ? 'text-green-600' :
                    subscriptionStatus === 'CANCELED' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {subscriptionStatus === 'ACTIVE' ? 'Active' :
                     subscriptionStatus === 'CANCELED' ? 'Canceled' :
                     'Expired'}
                  </span>
                </div>
                {subscriptionEndDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Access until:</span>
                    <span className="text-sm text-gray-600">
                      {subscriptionEndDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Cancel Subscription Button */}
            {subscriptionStatus === 'ACTIVE' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {cancelStatus && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                    cancelStatus === 'success' 
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {cancelStatus === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="text-sm font-medium">{cancelMessage}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  disabled={isCanceling}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCanceling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  You will have access until your subscription end date
                </p>
              </div>
            )}
            
            {subscriptionStatus !== 'ACTIVE' && subscriptionStatus && (
              <p className="text-xs text-gray-500 text-center mt-2">
                {subscriptionStatus === 'CANCELED' 
                  ? 'Your subscription is canceled. Access will end on the date shown above.'
                  : 'Your subscription has expired. Please subscribe to continue learning.'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 hover:shadow-xl transition-shadow mt-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-textNavy">Change Password</h2>
              <p className="text-sm text-gray-500">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  // Clear error when user starts typing
                  if (passwordErrors.currentPassword) {
                    setPasswordErrors({ ...passwordErrors, currentPassword: undefined })
                  }
                }}
                onBlur={(e) => {
                  // Validate when user leaves the field
                  if (e.target.value.trim() !== '') {
                    validateCurrentPassword(e.target.value)
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200 ${
                  passwordErrors.currentPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter current password"
                disabled={isSaving || isValidatingPassword}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    // Clear error when user starts typing
                    if (passwordErrors.newPassword) {
                      setPasswordErrors({ ...passwordErrors, newPassword: undefined })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200 ${
                    passwordErrors.newPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  } ${passwordErrors.currentPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Enter new password"
                  required
                  disabled={isSaving || isValidatingPassword || !!passwordErrors.currentPassword}
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value)
                    // Clear error when user starts typing
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors({ ...passwordErrors, confirmPassword: undefined })
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primaryBlue focus:border-transparent transition-all duration-200 ${
                    passwordErrors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  } ${passwordErrors.currentPassword ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Confirm new password"
                  required
                  disabled={isSaving || isValidatingPassword || !!passwordErrors.currentPassword}
                />
                {passwordErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="w-full btn-secondary text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving || isValidatingPassword || !!passwordErrors.currentPassword || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              {isSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </motion.div>

        {/* Delete Account Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 hover:shadow-xl transition-shadow mt-6 border-2 border-red-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              <p className="text-sm text-gray-500">Permanent account deletion</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {deleteError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{deleteError}</span>
            </div>
          )}
          {!showDeleteConfirm ? (
            <button
              onClick={() => {
                setShowDeleteConfirm(true)
                setDeleteError(null)
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm font-semibold text-red-800">
                Type <span className="font-mono bg-red-100 px-2 py-1 rounded">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value)
                  if (deleteError) setDeleteError(null)
                }}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type DELETE to confirm"
                disabled={isDeleting}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirm Delete
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
