import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Achievement types
export enum AchievementType {
  FIRST_LESSON = 'FIRST_LESSON',
  FIVE_LESSONS = 'FIVE_LESSONS',
  TEN_LESSONS = 'TEN_LESSONS',
  FLASHCARDS_MASTER = 'FLASHCARDS_MASTER',
  MATCHING_MASTER = 'MATCHING_MASTER',
  WORD_BUILDER_MASTER = 'WORD_BUILDER_MASTER',
  TRANSLATION_MASTER = 'TRANSLATION_MASTER',
  MEMORY_CARDS_MASTER = 'MEMORY_CARDS_MASTER',
  STORY_READER = 'STORY_READER',
  ALL_STORIES_READ = 'ALL_STORIES_READ',
  GAME_CHAMPION = 'GAME_CHAMPION',
  DAILY_STREAK_3 = 'DAILY_STREAK_3',
  DAILY_STREAK_7 = 'DAILY_STREAK_7',
  PERFECT_SCORE = 'PERFECT_SCORE'
}

// Achievement definitions with progress tracking
const ACHIEVEMENT_DEFINITIONS = {
  [AchievementType.FIRST_LESSON]: {
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '⭐',
    points: 10,
    category: 'Learning',
    rarity: 'bronze',
    target: 1,
    getProgress: (data: any) => Math.min(100, (data?.lessonsCompletedCount || 0) / 1 * 100)
  },
  [AchievementType.FIVE_LESSONS]: {
    title: 'Learning Path',
    description: 'Complete 5 lessons',
    icon: '📚',
    points: 25,
    category: 'Learning',
    rarity: 'silver',
    target: 5,
    getProgress: (data: any) => Math.min(100, (data?.lessonsCompletedCount || 0) / 5 * 100)
  },
  [AchievementType.TEN_LESSONS]: {
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: '🎓',
    points: 50,
    category: 'Learning',
    rarity: 'gold',
    target: 10,
    getProgress: (data: any) => Math.min(100, (data?.lessonsCompletedCount || 0) / 10 * 100)
  },
  [AchievementType.FLASHCARDS_MASTER]: {
    title: 'Flashcards Master',
    description: 'Complete all flashcards categories',
    icon: '🧠',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.flashcardsCompleted ? 100 : 0
  },
  [AchievementType.MATCHING_MASTER]: {
    title: 'Matching Master',
    description: 'Complete all matching game categories',
    icon: '🎯',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.matchingCompleted ? 100 : 0
  },
  [AchievementType.WORD_BUILDER_MASTER]: {
    title: 'Word Builder Master',
    description: 'Complete all word builder categories',
    icon: '🔤',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.wordBuilderCompleted ? 100 : 0
  },
  [AchievementType.TRANSLATION_MASTER]: {
    title: 'Translation Master',
    description: 'Complete all translation practice categories',
    icon: '🌐',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.translationCompleted ? 100 : 0
  },
  [AchievementType.MEMORY_CARDS_MASTER]: {
    title: 'Memory Master',
    description: 'Complete all memory cards categories',
    icon: '🧩',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.memoryCardsCompleted ? 100 : 0
  },
  [AchievementType.STORY_READER]: {
    title: 'Story Reader',
    description: 'Read your first story',
    icon: '📖',
    points: 25,
    category: 'Stories',
    rarity: 'bronze',
    target: 1,
    getProgress: (data: any) => Math.min(100, (data?.storiesReadCount || 0) / 1 * 100)
  },
  [AchievementType.ALL_STORIES_READ]: {
    title: 'Story Master',
    description: 'Read all stories',
    icon: '📚',
    points: 100,
    category: 'Stories',
    rarity: 'gold',
    target: 7,
    getProgress: (data: any) => Math.min(100, (data?.storiesReadCount || 0) / 7 * 100)
  },
  [AchievementType.GAME_CHAMPION]: {
    title: 'Game Champion',
    description: 'Complete all game categories',
    icon: '🏆',
    points: 200,
    category: 'Mastery',
    rarity: 'platinum',
    target: 1,
    getProgress: (data: any) => data?.allGamesCompleted ? 100 : 0
  },
  [AchievementType.DAILY_STREAK_3]: {
    title: '3 Day Streak',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
    points: 30,
    category: 'Consistency',
    rarity: 'silver',
    target: 3,
    getProgress: (data: any) => Math.min(100, (data?.dailyStreak || 0) / 3 * 100)
  },
  [AchievementType.DAILY_STREAK_7]: {
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '💪',
    points: 75,
    category: 'Consistency',
    rarity: 'gold',
    target: 7,
    getProgress: (data: any) => Math.min(100, (data?.dailyStreak || 0) / 7 * 100)
  },
  [AchievementType.PERFECT_SCORE]: {
    title: 'Perfect Score',
    description: 'Get 100% on any game',
    icon: '✨',
    points: 40,
    category: 'Mastery',
    rarity: 'silver',
    target: 1,
    getProgress: (data: any) => data?.hasPerfectScore ? 100 : 0
  }
}

// Get all achievements for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get user's earned achievements
    const earnedAchievements = await prisma.achievement.findMany({
      where: {
        child: {
          parentId: userId
        }
      },
      include: {
        child: true
      }
    })

    // Get progress data for calculating progress percentages
    let progressData = {}
    try {
      if (req.query.progressData) {
        progressData = typeof req.query.progressData === 'string' 
          ? JSON.parse(decodeURIComponent(req.query.progressData))
          : req.query.progressData
      }
    } catch (error) {
      console.error('Failed to parse progressData:', error)
    }

    // Get all achievement types with progress
    const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
      const earned = earnedAchievements.some(a => a.title === def.title)
      const progress = def.getProgress ? def.getProgress(progressData) : (earned ? 100 : 0)
      return {
        id: type,
        type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        points: def.points,
        category: def.category,
        rarity: def.rarity,
        target: def.target,
        earned,
        progress: Math.round(progress),
        earnedAt: earned ? earnedAchievements.find(a => a.title === def.title)?.createdAt : null
      }
    })

    res.json({ achievements: allAchievements })
  } catch (error) {
    console.error('Get achievements error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Check and award achievements based on progress data
router.post('/check', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { progressData } = req.body // Progress data from localStorage

    // Get user's first active child (or create one if needed)
    let child = await prisma.child.findFirst({
      where: {
        parentId: userId,
        isActive: true
      }
    })

    if (!child) {
      // Create a default child for the user
      child = await prisma.child.create({
        data: {
          name: 'Default',
          age: 5,
          parentId: userId,
          language: 'KURMANJI'
        })
      }
    }

    const newlyEarned: string[] = []

    // Check each achievement type
    for (const [type, def] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
      // Check if already earned
      const existing = await prisma.achievement.findFirst({
        where: {
          childId: child.id,
          title: def.title
        }
      })

      if (existing) continue

      let shouldAward = false

      // Check achievement conditions based on progress data
      switch (type) {
        case AchievementType.FIRST_LESSON:
          shouldAward = progressData?.lessonsCompletedCount >= 1
          break
        case AchievementType.FIVE_LESSONS:
          shouldAward = progressData?.lessonsCompletedCount >= 5
          break
        case AchievementType.TEN_LESSONS:
          shouldAward = progressData?.lessonsCompletedCount >= 10
          break
        case AchievementType.DAILY_STREAK_3:
          shouldAward = progressData?.dailyStreak >= 3
          break
        case AchievementType.DAILY_STREAK_7:
          shouldAward = progressData?.dailyStreak >= 7
          break
        case AchievementType.PERFECT_SCORE:
          shouldAward = progressData?.hasPerfectScore === true
          break
        case AchievementType.FLASHCARDS_MASTER:
          shouldAward = progressData?.flashcardsCompleted === true
          break
        case AchievementType.MATCHING_MASTER:
          shouldAward = progressData?.matchingCompleted === true
          break
        case AchievementType.WORD_BUILDER_MASTER:
          shouldAward = progressData?.wordBuilderCompleted === true
          break
        case AchievementType.TRANSLATION_MASTER:
          shouldAward = progressData?.translationCompleted === true
          break
        case AchievementType.MEMORY_CARDS_MASTER:
          shouldAward = progressData?.memoryCardsCompleted === true
          break
        case AchievementType.STORY_READER:
          shouldAward = progressData?.storiesReadCount >= 1
          break
        case AchievementType.ALL_STORIES_READ:
          shouldAward = progressData?.storiesReadCount >= 7 // All 7 stories
          break
        case AchievementType.GAME_CHAMPION:
          shouldAward = progressData?.allGamesCompleted === true
          break
      }

      if (shouldAward) {
        await prisma.achievement.create({
          data: {
            title: def.title,
            description: def.description,
            icon: def.icon,
            points: def.points,
            childId: child.id
          }
        })
        newlyEarned.push(def.title)
      }
    }

    res.json({ newlyEarned })
  } catch (error) {
    console.error('Check achievements error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

