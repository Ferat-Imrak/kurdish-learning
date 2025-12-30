'use client'

import Link from 'next/link'
import { Home, BookOpen, Gamepad2, BookMarked, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primaryBlue to-supportLavender mb-4">
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-textNavy mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-8">
          <h2 className="text-xl font-heading font-bold text-textNavy mb-6">
            Popular Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-2xl hover:from-primaryBlue/20 hover:to-supportLavender/20 transition-all duration-300 group"
            >
              <Home className="w-6 h-6 text-primaryBlue group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold text-textNavy">Home</div>
                <div className="text-sm text-gray-600">Back to homepage</div>
              </div>
            </Link>

            <Link
              href="/learn"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-accentBlue/10 to-primaryBlue/10 rounded-2xl hover:from-accentBlue/20 hover:to-primaryBlue/20 transition-all duration-300 group"
            >
              <BookOpen className="w-6 h-6 text-accentBlue group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold text-textNavy">Learn</div>
                <div className="text-sm text-gray-600">Interactive lessons</div>
              </div>
            </Link>

            <Link
              href="/games"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-brand-green/10 to-supportMint/10 rounded-2xl hover:from-brand-green/20 hover:to-supportMint/20 transition-all duration-300 group"
            >
              <Gamepad2 className="w-6 h-6 text-brand-green group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold text-textNavy">Games</div>
                <div className="text-sm text-gray-600">Fun learning games</div>
              </div>
            </Link>

            <Link
              href="/stories"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-supportLavender/10 to-brand-purple/10 rounded-2xl hover:from-supportLavender/20 hover:to-brand-purple/20 transition-all duration-300 group"
            >
              <BookMarked className="w-6 h-6 text-supportLavender group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="font-semibold text-textNavy">Stories</div>
                <div className="text-sm text-gray-600">Read Kurdish stories</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <p className="text-gray-700 mb-4">
            Need help? Try these options:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-primaryBlue text-white rounded-xl hover:bg-primaryBlue/90 transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-gradient-to-r from-primaryBlue to-supportLavender text-white rounded-xl hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all text-sm font-medium"
            >
              Sign Up
            </Link>
            <Link
              href="/terms"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-textNavy rounded-xl hover:bg-gray-50 transition-colors shadow-md font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>
    </div>
  )
}

