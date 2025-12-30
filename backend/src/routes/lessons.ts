import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Get all lessons for a language
router.get('/', async (req, res) => {
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

    res.json({ lessons })
  } catch (error) {
    console.error('Get lessons error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get specific lesson
router.get('/:id', async (req, res) => {
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

    res.json({ lesson })
  } catch (error) {
    console.error('Get lesson error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get lesson content
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params

    const content = await prisma.lessonContent.findMany({
      where: { lessonId: id },
      orderBy: { order: 'asc' }
    })

    res.json({ content })
  } catch (error) {
    console.error('Get lesson content error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

