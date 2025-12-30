// src/lib/auth.ts
import Credentials from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcrypt'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' as const },
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        // Try to find user by username first, then by email
        let user = await prisma.user.findUnique({ 
          where: { username: credentials.email },
          select: { id: true, email: true, passwordHash: true, subscriptionStatus: true, subscriptionEndDate: true }
        })
        if (!user) {
          user = await prisma.user.findUnique({ 
            where: { email: credentials.email },
            select: { id: true, email: true, passwordHash: true, subscriptionStatus: true, subscriptionEndDate: true }
          })
        }
        
        if (!user?.passwordHash) return null
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null
        
        // Check subscription status
        let subscriptionStatus = user.subscriptionStatus || 'ACTIVE'
        const now = new Date()
        if (user.subscriptionEndDate && now > user.subscriptionEndDate) {
          // If past end date, mark as expired regardless of status
          subscriptionStatus = 'EXPIRED'
        } else if (user.subscriptionStatus === 'CANCELED' && user.subscriptionEndDate && now > user.subscriptionEndDate) {
          // CANCELED past end date should be EXPIRED
          subscriptionStatus = 'EXPIRED'
        }
        
        // Block login if subscription is expired
        if (subscriptionStatus === 'EXPIRED') {
          throw new Error('SUBSCRIPTION_EXPIRED')
        }
        
        // Don't return image here - it will be fetched from DB in session callback
        return { id: user.id, email: user.email || undefined }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - only store user ID and email in token (not image)
      if (user) {
        token.id = user.id
        token.email = user.email
        // Don't store image in JWT to avoid token size issues
      }
      
      return token
    },
    async session({ session, token }) {
      // Fetch user data from database on every session access
      // This ensures we always have the latest data including image
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { 
              id: true, 
              name: true, 
              email: true, 
              image: true, 
              subscriptionPlan: true,
              subscriptionStatus: true,
              subscriptionEndDate: true
            }
          })
          
          if (dbUser && session.user) {
            session.user.id = dbUser.id
            session.user.name = dbUser.name || null
            session.user.email = dbUser.email || null
            session.user.image = dbUser.image || null
            session.user.subscriptionPlan = dbUser.subscriptionPlan || null
          }
        } catch (error) {
          console.error('Error fetching user from database:', error)
          // Fallback to token data if DB fetch fails
          if (session.user) {
            session.user.id = token.id as string
            session.user.email = token.email as string | null
          }
        }
      }
      
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}
