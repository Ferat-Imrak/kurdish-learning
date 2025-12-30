/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  // Enable static export only for mobile builds
  ...(process.env.MOBILE_BUILD === 'true' && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
  images: {
    domains: ['localhost', 'supabase.co'],
  },
}

module.exports = withPWA(nextConfig)

