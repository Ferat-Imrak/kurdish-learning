import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Update lesson progress
router.post('/:lessonId', [
  body('childId').isString(),
  body('status').isIn(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('timeSpent').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { lessonId } = req.params
    const { childId, status, score, timeSpent } = req.body
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

    // Update or create progress
    const progress = await prisma.progress.upsert({
      where: {
        childId_lessonId: {
          childId,
          lessonId
        }
      },
      update: {
        status,
        score,
        timeSpent,
        attempts: { increment: 1 },
        completedAt: status === 'COMPLETED' || status === 'MASTERED' ? new Date() : undefined
      },
      create: {
        childId,
        lessonId,
        status,
        score,
        timeSpent,
        attempts: 1,
        completedAt: status === 'COMPLETED' || status === 'MASTERED' ? new Date() : undefined
      }
    })

    res.json({
      message: 'Progress updated successfully',
      progress
    })
  } catch (error) {
    console.error('Update progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get child's progress
router.get('/child/:childId', async (req, res) => {
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

    const progress = await prisma.progress.findMany({
      where: { childId },
      include: {
        lesson: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    res.json({ progress })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get progress summary for dashboard
router.get('/child/:childId/summary', async (req, res) => {
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

    const progress = await prisma.progress.findMany({
      where: { childId },
      include: {
        lesson: true
      }
    })

    const summary = {
      totalLessons: progress.length,
      completedLessons: progress.filter(p => p.status === 'COMPLETED' || p.status === 'MASTERED').length,
      inProgressLessons: progress.filter(p => p.status === 'IN_PROGRESS').length,
      averageScore: progress.length > 0 
        ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length)
        : 0,
      totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      achievements: await prisma.achievement.count({
        where: { childId }
      })
    }

    res.json({ summary })
  } catch (error) {
    console.error('Get progress summary error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

