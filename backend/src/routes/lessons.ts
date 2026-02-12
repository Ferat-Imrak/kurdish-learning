import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all lessons for a language
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

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        content: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return res.json({ lessons })
  } catch (error) {
    console.error('Get lessons error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Get specific lesson
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        content: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    return res.json({ lesson })
  } catch (error) {
    console.error('Get lesson error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// Get lesson content
router.get('/:id/content', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const content = await prisma.lessonContent.findMany({
      where: { lessonId: id },
      orderBy: { order: 'asc' }
    })

    return res.json({ content })
  } catch (error) {
    console.error('Get lesson content error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

