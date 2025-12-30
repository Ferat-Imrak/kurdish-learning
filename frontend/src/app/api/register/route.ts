import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  try {
    const { name, username, email, password, plan } = await req.json()
    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Email, username and password are required' }, { status: 400 })
    }
    
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    
    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    
    // Validate and set subscription plan
    const subscriptionPlan = (plan === 'yearly' ? 'YEARLY' : 'MONTHLY')
    
    // Calculate subscription end date (1 month or 1 year from now)
    const subscriptionEndDate = new Date()
    if (plan === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ 
      data: { 
        email, 
        username, 
        name, 
        passwordHash,
        subscriptionPlan: subscriptionPlan as any,
        subscriptionStatus: 'ACTIVE',
        subscriptionEndDate
      } 
    })
    return NextResponse.json({ id: user.id, email: user.email, username: user.username, name: user.name })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}


