import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Require authentication for all user routes
router.use(authenticateToken)

// Create child profile
router.post('/children', [
  body('name').trim().isLength({ min: 2 }),
  body('age').isInt({ min: 3, max: 12 }),
  body('language').isIn(['KURMANJI', 'SORANI']),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { name, age, language, avatar } = req.body
    const userId = req.user?.id // Assuming auth middleware sets this

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const child = await prisma.child.create({
      data: {
        name,
        age,
        language,
        avatar,
        parentId: userId
      }
    })

    return res.status(201).json({
      message: 'Child profile created successfully',
      child
    })
  } catch (error) {
    console.error('Create child error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Get all children for a parent
router.get('/children', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const children = await prisma.child.findMany({
      where: { parentId: userId },
      include: {
        progress: {
          include: {
            lesson: true
          }
        },
        achievements: true
      }
    })

    return res.json({ children })
  } catch (error) {
    console.error('Get children error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Update child profile
router.put('/children/:id', [
  body('name').optional().trim().isLength({ min: 2 }),
  body('age').optional().isInt({ min: 3, max: 12 }),
  body('language').optional().isIn(['KURMANJI', 'SORANI']),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { id } = req.params
    const userId = req.user?.id
    const updateData = req.body

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: updateData
    })

    return res.json({
      message: 'Child profile updated successfully',
      child: updatedChild
    })
  } catch (error) {
    console.error('Update child error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Delete child profile
router.delete('/children/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    await prisma.child.delete({
      where: { id }
    })

    return res.json({ message: 'Child profile deleted successfully' })
  } catch (error) {
    console.error('Delete child error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

