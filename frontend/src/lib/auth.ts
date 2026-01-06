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
        
        // credentials.email can be either username or email
        const input = credentials.email.trim()
        const isEmail = input.includes('@')
        
        // Try to find user by username or email
        let user = null
        if (isEmail) {
          user = await prisma.user.findUnique({ 
            where: { email: input },
            select: { id: true, email: true, passwordHash: true, subscriptionEndDate: true }
          })
        } else {
          // Try username first
          user = await prisma.user.findUnique({ 
            where: { username: input },
            select: { id: true, email: true, passwordHash: true, subscriptionEndDate: true }
          })
          // If not found by username, try email (in case username looks like email)
          if (!user) {
            user = await prisma.user.findUnique({ 
              where: { email: input },
              select: { id: true, email: true, passwordHash: true, subscriptionEndDate: true }
            })
          }
        }
        
        if (!user?.passwordHash) return null
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) return null
        
        // Check subscription status based on end date only (subscriptionStatus field doesn't exist in backend)
        const now = new Date()
        if (user.subscriptionEndDate) {
          const endDate = new Date(user.subscriptionEndDate)
          // If past end date, subscription is expired
          if (now > endDate) {
            throw new Error('SUBSCRIPTION_EXPIRED')
          }
        }
        // If no end date set, allow login (for backwards compatibility)
        
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
