/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline'
  }
})

const nextConfig = {
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  async redirects() {
    return [
      { source: '/games/picture-quiz', destination: '/games/translation-quiz', permanent: true },
      { source: '/games/picture-quiz/:path*', destination: '/games/translation-quiz/:path*', permanent: true },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = withPWA(nextConfig)

