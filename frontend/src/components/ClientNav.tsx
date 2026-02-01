'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { User, LogOut, Menu, X, BookOpen, Gamepad2, Book, Library, Home } from 'lucide-react'
import { useAuth } from '../app/providers'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClientNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Hide navbar on landing and auth pages
  if (pathname === '/' || pathname.startsWith('/auth/')) return null

  return (
    <>
      <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                  <Image 
                    src="/peyvi-logo.png" 
                    alt="Peyvi - Kurdish Language Learning App Logo" 
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority
                  />
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent text-xl tracking-wide">Peyvi</span>
                <p className="text-xs text-gray-500 -mt-1 font-medium">Kurdish Learning App</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <NavbarRight />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors z-50 relative"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Side Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Side Drawer */}
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, x: 280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 280 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 w-[280px] bg-white z-50 lg:hidden shadow-2xl rounded-l-xl"
            >
              <div className="flex flex-col">
                {/* Close Button */}
                <div className="flex items-center justify-end px-4 pt-3 pb-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Menu Content */}
                <div className="px-3 pb-4">
                  <MobileNavbar onLinkClick={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function NavbarRight() {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const assumedLoggedIn = (!!user && !loading) || pathname.startsWith('/dashboard')

  const displayName = user?.name || 'Profile'
  const computeInitials = () => {
    const name = user?.name || ''
    if (name.trim()) {
      const parts = name.trim().split(/\s+/)
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    }
    const email = user?.email || ''
    const local = email.split('@')[0] || ''
    if (local) {
      const tokens = local.split(/[^a-zA-Z]+/).filter(Boolean)
      if (tokens.length >= 2) return (tokens[0][0] + tokens[1][0]).toUpperCase()
      if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase()
    }
    return 'U'
  }
  const initials = computeInitials()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, show: assumedLoggedIn },
    { href: '/learn', label: 'Learn', icon: BookOpen, show: assumedLoggedIn },
    { href: '/games', label: 'Games', icon: Gamepad2, show: assumedLoggedIn },
    { href: '/stories', label: 'Stories', icon: Book, show: assumedLoggedIn },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="flex items-center gap-1">
      {/* Navigation Links */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          if (!item.show) return null
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-md'
                  : 'text-gray-600 hover:text-primaryBlue hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Auth Section */}
      {!assumedLoggedIn && (
        <div className="flex items-center gap-2 ml-4">
          <Link 
            href="/auth/login" 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primaryBlue transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/auth/register" 
            className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primaryBlue to-supportLavender text-white text-xs sm:text-sm font-medium rounded-xl hover:shadow-md hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            Sign Up
          </Link>
        </div>
      )}

      {/* User Profile */}
      {assumedLoggedIn && (
        <div ref={dropdownRef} className="relative ml-4">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200/50 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primaryBlue to-supportLavender text-white flex items-center justify-center text-sm font-bold shadow-md overflow-hidden">
              {user?.image ? (
                <Image 
                  src={user.image} 
                  alt={`${user.name || 'User'} profile picture`} 
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                />
              ) : (
                initials
              )}
            </div>
            {displayName !== 'Profile' && (
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                {displayName.split(' ')[0]}
              </span>
            )}
          </button>
          
          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden z-50 backdrop-blur-sm">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
              </div>
              <Link 
                href="/profile" 
                onClick={() => setOpen(false)}
                className="block px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setOpen(false)
                  signOut()
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-sm font-medium text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface MobileNavbarProps {
  onLinkClick?: () => void
}

function MobileNavbar({ onLinkClick }: MobileNavbarProps = {}) {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()

  const assumedLoggedIn = (!!user && !loading) || pathname.startsWith('/dashboard')

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, show: assumedLoggedIn },
    { href: '/learn', label: 'Learn', icon: BookOpen, show: assumedLoggedIn },
    { href: '/games', label: 'Games', icon: Gamepad2, show: assumedLoggedIn },
    { href: '/stories', label: 'Stories', icon: Book, show: assumedLoggedIn },
  ]

  return (
    <div className="space-y-1">
      {/* Navigation Links */}
      {navItems.map((item) => {
        if (!item.show) return null
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        const Icon = item.icon
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-md'
                : 'text-gray-600 hover:text-primaryBlue hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}

      {/* Auth Section */}
      {!assumedLoggedIn && (
        <div className="pt-2 space-y-1">
          <Link 
            href="/auth/login" 
            onClick={onLinkClick}
            className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-primaryBlue hover:bg-gray-50 rounded-lg transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/auth/register" 
            onClick={onLinkClick}
            className="block px-3 py-2 bg-gradient-to-r from-primaryBlue to-supportLavender text-white text-sm font-medium rounded-lg hover:shadow-md transition-all duration-200 text-center"
          >
            Sign Up
          </Link>
        </div>
      )}

      {/* User Profile */}
      {assumedLoggedIn && (
        <div className="pt-2 space-y-1">
          <Link 
            href="/profile" 
            onClick={onLinkClick}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primaryBlue hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="w-4 h-4" />
            Profile
          </Link>
          <button
            onClick={() => {
              onLinkClick?.()
              signOut()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}


