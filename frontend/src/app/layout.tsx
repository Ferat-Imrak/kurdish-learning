import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import ClientNav from '../components/ClientNav'
import Footer from '../components/Footer'
import ProtectedRoute from '../components/ProtectedRoute'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'Peyvi • Learn Kurdish Online - Interactive Language Learning',
    template: '%s | Peyvi Kurdish Learning'
  },
  description: 'Master Kurdish language with Peyvi! Interactive lessons, games, and stories for Kurmanji and Sorani dialects. Start learning Kurdish today with our fun, engaging platform designed for all ages.',
  keywords: [
    'Kurdish language learning',
    'Learn Kurdish online',
    'Kurmanji lessons',
    'Sorani lessons',
    'Kurdish alphabet',
    'Kurdish grammar',
    'Kurdish vocabulary',
    'Kurdish games',
    'Kurdish for kids',
    'Kurdish language app',
    'Learn Kurdish free',
    'Kurdish language course',
    'Interactive Kurdish learning',
    'Kurdish pronunciation',
    'Kurdish culture'
  ],
  authors: [{ name: 'Peyvi', url: 'https://kurdishlearning.app' }],
  creator: 'Peyvi',
  publisher: 'Peyvi',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://kurdishlearning.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Peyvi Kurdish Learning',
    title: 'Peyvi • Learn Kurdish Online - Interactive Language Learning',
    description: 'Master Kurdish language with Peyvi! Interactive lessons, games, and stories for Kurmanji and Sorani dialects. Start learning Kurdish today.',
    images: [
      {
        url: '/peyvi-logo.png',
        width: 1200,
        height: 630,
        alt: 'Peyvi Kurdish Learning App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peyvi • Learn Kurdish Online',
    description: 'Master Kurdish language with interactive lessons, games, and stories. Learn Kurmanji and Sorani dialects.',
    images: ['/peyvi-logo.png'],
    creator: '@peyvi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  themeColor: '#3B82F6',
  manifest: '/manifest.json',
  icons: {
    icon: '/peyvi-logo.png',
    apple: '/peyvi-logo.png',
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>
          <ProtectedRoute>
            <ClientNav />
            {children}
            <Footer />
          </ProtectedRoute>
        </Providers>
      </body>
    </html>
  )
}

