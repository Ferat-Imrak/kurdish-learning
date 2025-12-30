import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionEndDate: true
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if subscription is expired (including CANCELED past end date)
    let status = user.subscriptionStatus || 'ACTIVE'
    const now = new Date()
    if (user.subscriptionEndDate && now > user.subscriptionEndDate) {
      // If past end date, mark as expired regardless of status
      status = 'EXPIRED'
      // Update database if expired
      await prisma.user.update({
        where: { email: session.user.email },
        data: { subscriptionStatus: 'EXPIRED' }
      })
    } else if (user.subscriptionStatus === 'CANCELED' && user.subscriptionEndDate && now > user.subscriptionEndDate) {
      // Double check: CANCELED past end date should be EXPIRED
      status = 'EXPIRED'
      await prisma.user.update({
        where: { email: session.user.email },
        data: { subscriptionStatus: 'EXPIRED' }
      })
    }

    return NextResponse.json({ 
      plan: user.subscriptionPlan || 'MONTHLY',
      status: status,
      endDate: user.subscriptionEndDate
    })

  } catch (error: any) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to get subscription plan' },
      { status: 500 }
    )
  }
}

