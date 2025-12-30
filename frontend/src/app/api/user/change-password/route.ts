import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import bcrypt from 'bcrypt'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Get user from database to verify current password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Verify current password is provided
    if (!currentPassword || currentPassword.trim() === '') {
      return NextResponse.json({ message: 'Current password is required' }, { status: 400 })
    }

    // Verify current password matches
    if (!user.passwordHash) {
      return NextResponse.json({ message: 'No password set for this account' }, { status: 400 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        passwordHash: hashedNewPassword,
      },
    })

    return NextResponse.json({ message: 'Password changed successfully' })

  } catch (error: any) {
    console.error('Password change error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to change password' },
      { status: 500 }
    )
  }
}
