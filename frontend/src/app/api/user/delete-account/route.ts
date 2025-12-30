import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Delete user from database
    await prisma.user.delete({
      where: { email: session.user.email },
    })

    return NextResponse.json({ 
      message: 'Account deleted successfully'
    })

  } catch (error: any) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}
