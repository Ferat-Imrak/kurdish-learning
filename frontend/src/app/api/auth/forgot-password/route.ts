import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success for security (don't reveal if email exists)
    // In production, you'd send an email here
    if (user) {
      if (type === 'username' && user.username) {
        // TODO: Send email with username
        // For development: return username in response (remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] Username for ${email}: ${user.username}`)
          return NextResponse.json({ 
            message: 'If an account exists with that email, you will receive instructions shortly.',
            // Only return username in development mode
            username: process.env.NODE_ENV === 'development' ? user.username : undefined
          })
        }
      } else if (type === 'password') {
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

        // TODO: Store reset token in database (you'll need to add a resetToken field to User model)
        // For now, we'll just log it in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] Password reset token for ${email}: ${resetToken}`)
          console.log(`[DEV] Reset link: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`)
        }

        // TODO: Send email with reset link
        // Example email service integration:
        // await sendEmail({
        //   to: email,
        //   subject: 'Password Reset Request',
        //   html: `Click here to reset your password: ${resetLink}`
        // })
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ 
      message: 'If an account exists with that email, you will receive instructions shortly.' 
    })

  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

