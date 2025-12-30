import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    // Validate plan
    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      return NextResponse.json({ message: 'Invalid plan. Must be "monthly" or "yearly".' }, { status: 400 })
    }

    // Update user's subscription plan
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        subscriptionPlan: plan.toUpperCase() === 'MONTHLY' ? 'MONTHLY' : 'YEARLY',
      },
    })

    return NextResponse.json({ 
      message: 'Subscription plan updated successfully',
      plan: updatedUser.subscriptionPlan 
    })

  } catch (error: any) {
    console.error('Plan change error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to change subscription plan' },
      { status: 500 }
    )
  }
}

