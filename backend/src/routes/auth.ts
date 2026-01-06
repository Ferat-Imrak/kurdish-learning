import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

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
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.status(201).json({
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
    res.status(500).json({ 
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
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: 'ACTIVE'
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        children: true
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        children: user.children
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(401).json({ message: 'Invalid token' })
  }
})

export default router

