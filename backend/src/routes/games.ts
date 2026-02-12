import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Get all games
router.get('/', async (req: Request, res: Response) => {
  try {
    const { language, type, difficulty } = req.query

    const where: any = {
      isActive: true
    }

    if (language) {
      where.language = language
    }

    if (type) {
      where.type = type
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: { createdAt: 'asc' }
    })

    return res.json({ games })
  } catch (error) {
    console.error('Get games error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Get specific game
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const game = await prisma.game.findUnique({
      where: { id }
    })

    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }

    return res.json({ game })
  } catch (error) {
    console.error('Get game error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Save game session
router.post('/:gameId/session', authenticateToken, [
  body('childId').isString(),
  body('score').isInt({ min: 0 }),
  body('timeSpent').isInt({ min: 0 }),
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { gameId } = req.params
    const { childId, score, timeSpent } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId }
    })

    if (!game) {
      return res.status(404).json({ message: 'Game not found' })
    }

    const gameSession = await prisma.gameSession.create({
      data: {
        gameId,
        childId,
        score,
        timeSpent
      }
    })

    return res.status(201).json({
      message: 'Game session saved successfully',
      gameSession
    })
  } catch (error) {
    console.error('Save game session error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Get child's game sessions
router.get('/child/:childId/sessions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { childId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: userId
      }
    })

    if (!child) {
      return res.status(404).json({ message: 'Child not found' })
    }

    const sessions = await prisma.gameSession.findMany({
      where: { childId },
      include: {
        game: true
      },
      orderBy: { completedAt: 'desc' }
    })

    return res.json({ sessions })
  } catch (error) {
    console.error('Get game sessions error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

