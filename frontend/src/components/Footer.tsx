'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { useAuth } from '../app/providers'

export default function Footer() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const currentYear = new Date().getFullYear()

  // Hide footer on landing page (it has its own footer)
  if (pathname === '/') return null

  // Check if user is logged in
  const isLoggedIn = !!user && !loading

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-12">
      <div className="container mx-auto px-4 py-6">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-lg">
              <Image 
                src="/peyvi-logo.png" 
                alt="Peyvi - Kurdish Language Learning App Logo" 
                width={48}
                height={48}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <span className="font-heading font-bold bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent text-xl tracking-wide">
              Peyvi
            </span>
          </div>

          {/* Tagline */}
          <p className="text-gray-400 text-sm max-w-md">
            Making Kurdish language learning fun and accessible for everyone.
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {isLoggedIn && (
              <>
                <Link 
                  href="/learn"
                  className="text-gray-400 hover:text-primaryBlue transition-colors"
                >
                  Learn
                </Link>
                <span className="text-gray-600">•</span>
                <Link 
                  href="/games"
                  className="text-gray-400 hover:text-accentCoral transition-colors"
                >
                  Games
                </Link>
                <span className="text-gray-600">•</span>
                <Link 
                  href="/stories"
                  className="text-gray-400 hover:text-supportLavender transition-colors"
                >
                  Stories
                </Link>
                <span className="text-gray-600">•</span>
              </>
            )}
            <Link 
              href="/terms"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <span className="text-gray-600">•</span>
            <Link 
              href="/privacy"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </Link>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-gray-700 my-2"></div>

          {/* Bottom Row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-xs text-gray-400">
            <span>© {currentYear} Peyvi. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for Kurdish learners worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
