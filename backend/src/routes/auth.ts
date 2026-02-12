import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret } from '../utils/jwt'

const router = Router()
const prisma = new PrismaClient()

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password, name, plan } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Determine subscription plan and end date
    const subscriptionPlan = plan === 'yearly' ? 'YEARLY' : 'MONTHLY'
    const subscriptionEndDate = new Date()
    if (plan === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)
    }

    // Create user with password hash and subscription
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword, // Store the hashed password
        subscriptionPlan: subscriptionPlan as any,
        subscriptionEndDate
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.name, // Use name as username for mobile compatibility
        role: user.role,
        subscriptionPlan: user.subscriptionPlan || 'MONTHLY',
        subscriptionStatus: 'ACTIVE', // Default to active for new users
        image: null // Not in backend schema yet
      },
      token
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error.message || 'Internal server error')
      : 'Internal server error'
    return res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Login
router.post('/login', [
  body('email').optional().isString(),
  body('username').optional().isString(),
  body('password').exists(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, username, password } = req.body

    // Must provide either email or username
    if (!email && !username) {
      return res.status(400).json({ message: 'Email or username is required' })
    }

    // Find user by email or name (username field doesn't exist in schema)
    let user = null
    if (email) {
      user = await prisma.user.findUnique({
        where: { email }
      })
    } else if (username) {
      // Backend schema doesn't have username field, so search by name instead
      user = await prisma.user.findFirst({
        where: { name: username }
      })
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Verify password
    if (!user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: '7d' }
    )

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: (user as any).username ?? user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: 'ACTIVE',
        image: (user as any).image ?? undefined
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Helper: get userId from Bearer token (same as /me)
async function getUserIdFromToken(req: Request): Promise<string | null> {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return null
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// Get current user
router.get('/me', async (req, res) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        children: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: (user as any).image ?? undefined,
        children: user.children
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return res.status(401).json({ message: 'Invalid token' })
  }
})

// Update profile (name, email, image)
router.put('/me', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('image').optional().isString(),
], async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, email, image } = req.body
    const updateData: { name?: string; email?: string; image?: string } = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== userId) {
        return res.status(400).json({ message: 'Email already in use' })
      }
      updateData.email = email
    }
    if (image !== undefined) {
      // Optional: limit base64 size (e.g. 512KB). Data URLs can be large.
      if (typeof image === 'string' && image.length > 700_000) {
        return res.status(400).json({ message: 'Image too large. Use a smaller photo.' })
      }
      updateData.image = image || null
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image ?? undefined
      }
    })
  } catch (error: any) {
    console.error('Update profile error:', error)
    return res.status(500).json({ message: error.message || 'Failed to update profile' })
  }
})

// Change password
router.put('/change-password', [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 }),
], async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.passwordHash) {
      return res.status(400).json({ message: 'No password set for this account' })
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    const hashedNew = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNew }
    })

    return res.json({ message: 'Password changed successfully' })
  } catch (error: any) {
    console.error('Change password error:', error)
    return res.status(500).json({ message: error.message || 'Failed to change password' })
  }
})

// Delete account
router.delete('/me', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return res.json({ message: 'Account deleted successfully' })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return res.status(500).json({ message: error.message || 'Failed to delete account' })
  }
})

// Get subscription details
router.get('/subscription', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true, subscriptionStatus: true, subscriptionEndDate: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    let status = user.subscriptionStatus || 'ACTIVE'
    const now = new Date()
    if (user.subscriptionEndDate && now > user.subscriptionEndDate) {
      status = 'EXPIRED'
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'EXPIRED' }
      })
    }

    return res.json({
      plan: user.subscriptionPlan || 'MONTHLY',
      status,
      endDate: user.subscriptionEndDate
    })
  } catch (error: any) {
    console.error('Get subscription error:', error)
    return res.status(500).json({ message: error.message || 'Failed to get subscription' })
  }
})

// Change subscription plan (monthly | yearly)
router.put('/subscription/plan', [
  body('plan').isIn(['monthly', 'yearly']),
], async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { plan } = req.body
    const subscriptionPlan = plan === 'yearly' ? 'YEARLY' : 'MONTHLY'

    const user = await prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan }
    })

    return res.json({
      message: 'Subscription plan updated successfully',
      plan: user.subscriptionPlan
    })
  } catch (error: any) {
    console.error('Change plan error:', error)
    return res.status(500).json({ message: error.message || 'Failed to change subscription plan' })
  }
})

// Cancel subscription (access until end date)
router.post('/subscription/cancel', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionEndDate: true }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.subscriptionStatus === 'CANCELED') {
      return res.json({
        message: 'Subscription is already canceled',
        endDate: user.subscriptionEndDate
      })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'CANCELED' }
    })

    return res.json({
      message: 'Subscription canceled successfully. You will have access until your subscription end date.',
      endDate: updated.subscriptionEndDate
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)
    return res.status(500).json({ message: error.message || 'Failed to cancel subscription' })
  }
})

export default router

