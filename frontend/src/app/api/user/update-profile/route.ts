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

    const { name, email, image } = await request.json()

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name,
        email: email,
        ...(image && { image: image }), // Only update image if provided
      },
    })

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: { name: updatedUser.name, email: updatedUser.email, image: updatedUser.image }
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to update profile' },
      { status: 500 }
    )
  }
}
