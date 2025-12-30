import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword } = await request.json()

    // Get user from database to verify current password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Verify current password is provided
    if (!currentPassword || currentPassword.trim() === '') {
      return NextResponse.json({ valid: false, message: 'Please enter your current password' }, { status: 200 })
    }

    // Verify current password matches
    if (!user.passwordHash) {
      return NextResponse.json({ valid: false, message: 'No password set for this account' }, { status: 200 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ valid: false, message: 'Current password is incorrect' }, { status: 200 })
    }

    return NextResponse.json({ valid: true, message: 'Password is correct' })

  } catch (error: any) {
    console.error('Password validation error:', error)
    return NextResponse.json(
      { valid: false, message: error.message || 'Failed to validate password' },
      { status: 500 }
    )
  }
}
