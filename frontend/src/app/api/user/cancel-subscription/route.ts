import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get current user subscription details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        subscriptionStatus: true,
        subscriptionEndDate: true
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if already canceled
    if (user.subscriptionStatus === 'CANCELED') {
      return NextResponse.json({ 
        message: 'Subscription is already canceled',
        endDate: user.subscriptionEndDate
      })
    }

    // Cancel the subscription (keep access until end date)
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionStatus: 'CANCELED',
        // Keep the existing subscriptionEndDate - don't change it
      },
      select: {
        subscriptionEndDate: true
      }
    })

    return NextResponse.json({ 
      message: 'Subscription canceled successfully. You will have access until your subscription end date.',
      endDate: updatedUser.subscriptionEndDate
    })

  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
