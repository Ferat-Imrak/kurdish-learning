'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../providers'
import { useProgress } from '../../contexts/ProgressContext'

// Local achievement definitions (matches achievements page)
const ACHIEVEMENT_DEFINITIONS: Record<string, {
  title: string
  description: string
  icon: string
  points: number
  category: string
  rarity?: 'bronze' | 'silver' | 'gold' | 'platinum'
  target?: number
  getProgress: (data: any) => number
}> = {
  FIRST_LESSON: {
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '⭐',
    points: 10,
    category: 'Learning',
    rarity: 'bronze',
    target: 1,
    getProgress: (data: any) => Math.min(100, (data?.lessonsCompletedCount || 0) / 1 * 100)
  },
  FIVE_LESSONS: {
    title: 'Learning Path',
    description: 'Complete 5 lessons',
    icon: '📚',
    points: 25,
    category: 'Learning',
    rarity: 'silver',
    target: 5,
    getProgress: (data: any) => Math.min(100, (data?.lessonsCompletedCount || 0) / 5 * 100)
  },
  TEN_LESSONS: {
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: '🎓',
    points: 50,
    category: 'Learning',
    rarity: 'gold',
    target: 10,
    getProgress: (data: any) => Math.min(100, (data?.lessonsCompletedCount || 0) / 10 * 100)
  },
  FLASHCARDS_MASTER: {
    title: 'Flashcards Master',
    description: 'Complete all flashcards categories',
    icon: '🧠',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 14,
    getProgress: (data: any) => {
      if (data?.flashcardsCompleted) return 100
      const totalCategories = 14
      const completedCount = data?.flashcardsCompletedCount || 0
      return Math.round((completedCount / totalCategories) * 100)
    }
  },
  MATCHING_MASTER: {
    title: 'Matching Master',
    description: 'Complete all matching game categories',
    icon: '🎯',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.matchingCompleted ? 100 : 0
  },
  WORD_BUILDER_MASTER: {
    title: 'Word Builder Master',
    description: 'Complete all word builder categories',
    icon: '🔤',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.wordBuilderCompleted ? 100 : 0
  },
  TRANSLATION_MASTER: {
    title: 'Translation Master',
    description: 'Complete all translation practice categories',
    icon: '🌐',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.translationCompleted ? 100 : 0
  },
  MEMORY_CARDS_MASTER: {
    title: 'Memory Master',
    description: 'Complete all memory card categories',
    icon: '🧩',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.memoryCardsCompleted ? 100 : 0
  },
  ALL_GAMES_MASTER: {
    title: 'Game Master',
    description: 'Complete all game categories',
    icon: '🏆',
    points: 100,
    category: 'Games',
    rarity: 'platinum',
    target: 1,
    getProgress: (data: any) => data?.allGamesCompleted ? 100 : 0
  },
  STORY_READER: {
    title: 'Story Reader',
    description: 'Read your first story',
    icon: '📖',
    points: 25,
    category: 'Stories',
    rarity: 'bronze',
    target: 1,
    getProgress: (data: any) => Math.min(100, (data?.storiesReadCount || 0) / 1 * 100)
  }
}
import { 
  BookOpen, 
  Gamepad2, 
  Star, 
  Trophy, 
  Play,
  Sparkles,
  Target,
  Zap,
  Heart,
  ArrowRight,
  CheckCircle,
  BookMarked,
  Trash2
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { getRecentLessons, getLessonProgress, clearProgress, lessonProgress } = useProgress()
  const [isClearing, setIsClearing] = useState(false)

  // All available lessons (matching learn page)
  const allLessons = [
    { id: '1', title: 'Alphabet', type: 'ALPHABET' },
    { id: '2', title: 'Numbers', type: 'NUMBERS' },
    { id: '3', title: 'Days of the Week', type: 'TIME' },
    { id: '4', title: 'Months of the Year', type: 'TIME' },
    { id: '18', title: 'Sentence Structure & Pronouns', type: 'GRAMMAR' },
    { id: '19', title: 'Articles & Plurals', type: 'GRAMMAR' },
    { id: '21', title: 'Possessive Pronouns', type: 'GRAMMAR' },
    { id: '22', title: 'Prepositions', type: 'GRAMMAR' },
    { id: '20', title: 'Questions & Negation', type: 'GRAMMAR' },
    { id: '15', title: 'Simple Present Tense', type: 'GRAMMAR' },
    { id: '14', title: 'Common Verbs', type: 'VERBS' },
    { id: '8', title: 'Family Members', type: 'WORDS' },
    { id: '23', title: 'Colors', type: 'WORDS' },
    { id: '24', title: 'Basic Adjectives', type: 'GRAMMAR' },
    { id: '7', title: 'Food & Meals', type: 'FOOD' },
    { id: '6', title: 'Things Around the House', type: 'HOUSE' },
    { id: '9', title: 'Animals', type: 'WORDS' },
    { id: '13', title: 'Body Parts', type: 'BODY' },
    { id: '5', title: 'Weather & Seasons', type: 'WEATHER' },
    { id: '16', title: 'Simple Past Tense', type: 'GRAMMAR' },
    { id: '17', title: 'Simple Future Tense', type: 'GRAMMAR' },
    { id: '10', title: 'Daily Conversations', type: 'CONVERSATIONS' },
    { id: '11', title: 'Nature', type: 'NATURE' }
  ]

  const completedLessons = allLessons.filter(lesson => 
    getLessonProgress(lesson.id).status === 'COMPLETED'
  ).length

  const inProgressLessons = allLessons.filter(lesson => 
    getLessonProgress(lesson.id).status === 'IN_PROGRESS'
  ).length

  const recentLessons = allLessons
    .filter(lesson => {
      const progress = getLessonProgress(lesson.id)
      return progress.status !== 'NOT_STARTED'
    })
    .sort((a, b) => {
      const progressA = getLessonProgress(a.id)
      const progressB = getLessonProgress(b.id)
      return progressB.lastAccessed.getTime() - progressA.lastAccessed.getTime()
    })
    .slice(0, 3)

  const [achievements, setAchievements] = useState<any[]>([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)

  // Helper function to get progress data (matches achievements page)
  const getProgressData = () => {
    if (typeof window === 'undefined') return {}

    // Check lesson progress from ProgressContext (more reliable)
    let lessonsCompletedCount = 0
    try {
      if (lessonProgress && Object.keys(lessonProgress).length > 0) {
        const completedLessons = Object.values(lessonProgress).filter(
          (lesson: any) => lesson.status === 'COMPLETED'
        )
        lessonsCompletedCount = completedLessons.length
      } else {
        // Fallback to localStorage
        const lessonProgressKey = Object.keys(localStorage).find(key => key.startsWith('lessonProgress_'))
        if (lessonProgressKey) {
          const lessonProgressData = JSON.parse(localStorage.getItem(lessonProgressKey) || '{}')
          lessonsCompletedCount = Object.values(lessonProgressData).filter(
            (lesson: any) => lesson.status === 'COMPLETED'
          ).length
        }
      }
    } catch (error) {
      console.error('Failed to parse lesson progress:', error)
    }

    // Check flashcards
    const flashcardsCategories = [
      "Colors", "Animals", "Food & Meals", "Family Members", "Nature",
      "Time & Schedule", "Weather & Seasons", "House & Objects", "Numbers",
      "Days & Months", "Basic Question Words", "Pronouns", "Body Parts", "Master Challenge"
    ]
    let flashcardsCompletedCount = 0
    flashcardsCategories.forEach(cat => {
      const stored = localStorage.getItem(`flashcards-progress-${cat}`)
      if (stored) {
        const progress = JSON.parse(stored)
        if (progress.correct === progress.total && progress.total > 0) {
          flashcardsCompletedCount++
        }
      }
    })
    const flashcardsCompleted = flashcardsCompletedCount === flashcardsCategories.length

    // Check matching
    const matchingCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    const matchingCompleted = matchingCategories.every(cat => {
      const stored = localStorage.getItem(`matching-progress-${cat}`)
      if (!stored) return false
      const rounds = JSON.parse(stored)
      return rounds >= (cat === "master" ? 20 : 10)
    })

    // Check word builder
    const wordBuilderCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    const wordBuilderCompleted = wordBuilderCategories.every(cat => {
      const stored = localStorage.getItem(`word-builder-progress-${cat}`)
      if (!stored) return false
      const progress = JSON.parse(stored)
      return progress.completed === true
    })

    // Check translation
    const translationCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    const translationCompleted = translationCategories.every(cat => {
      const stored = localStorage.getItem(`picture-quiz-progress-${cat}`)
      if (!stored) return false
      const progress = JSON.parse(stored)
      return progress.completed === true
    })

    // Check memory cards
    const memoryCardsCategories = ["colors", "animals", "food", "nature", "time", "weather", "house", "numbers", "daysMonths", "bodyParts", "master"]
    const memoryCardsCompleted = memoryCardsCategories.every(cat => {
      const stored = localStorage.getItem(`memory-cards-progress-${cat}`)
      if (!stored) return false
      const progress = JSON.parse(stored)
      return progress.easy === true && progress.medium === true && progress.hard === true
    })

    // Check stories
    const storiesRead = localStorage.getItem('stories-read')
    const storiesReadCount = storiesRead ? JSON.parse(storiesRead).length : 0

    // Check all games completed
    const allGamesCompleted = flashcardsCompleted && matchingCompleted && wordBuilderCompleted && translationCompleted && memoryCardsCompleted

    return {
      lessonsCompletedCount,
      flashcardsCompleted,
      flashcardsCompletedCount,
      matchingCompleted,
      wordBuilderCompleted,
      translationCompleted,
      memoryCardsCompleted,
      storiesReadCount,
      allGamesCompleted
    }
  }

  // Load achievements (calculate locally first, then try backend)
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        // Get progress data
        const progressData = getProgressData()

        // Always calculate achievements locally first (works with or without backend)
        const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
          const progress = def.getProgress ? def.getProgress(progressData) : 0
          const earned = progress >= 100
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
            earnedAt: earned ? new Date().toISOString() : null
          }
        })

        // Always set local achievements first (immediate display)
        setAchievements(allAchievements)
        setAchievementsLoading(false)

        // If user is authenticated, try to sync with backend in the background (but don't fail if it doesn't exist)
        if (user) {
          // Use a timeout to prevent hanging if backend is down
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
          
          try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
            const token = localStorage.getItem('auth_token')
            const progressDataStr = encodeURIComponent(JSON.stringify(progressData))
            
            const response = await fetch(`${API_BASE_URL}/achievements?progressData=${progressDataStr}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              },
              signal: controller.signal
            })
            
            clearTimeout(timeoutId)
            
            if (response.ok) {
              const data = await response.json()
              // Merge backend data with local calculations (backend might have earnedAt dates)
              const backendAchievements = (data.achievements || []).reduce((acc: any, ach: any) => {
                acc[ach.type] = ach
                return acc
              }, {})
              
              // Use local calculations but preserve backend earnedAt dates
              const mergedAchievements = allAchievements.map(ach => {
                const backendAch = backendAchievements[ach.type]
                if (backendAch && backendAch.earnedAt) {
                  return { ...ach, earnedAt: backendAch.earnedAt }
                }
                return ach
              })
              setAchievements(mergedAchievements)
            } else if (response.status === 404) {
              // Backend route not found, use local calculations (already set above)
              console.log('⚠️ Dashboard: Backend achievements endpoint not found (404), using local calculations')
            } else {
              // Other error, use local calculations (already set above)
              console.log(`⚠️ Dashboard: Backend returned ${response.status}, using local calculations`)
            }
          } catch (fetchError: any) {
            clearTimeout(timeoutId)
            // Backend fetch failed (network error, timeout, etc.), use local calculations (already set above)
            if (fetchError.name === 'AbortError') {
              console.log('⚠️ Dashboard: Backend request timed out, using local calculations')
            } else {
              console.log('⚠️ Dashboard: Backend fetch failed, using local calculations:', fetchError.message)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load achievements:', error)
        // On error, still try to calculate locally
        try {
          const progressData = getProgressData()
          const allAchievements = Object.entries(ACHIEVEMENT_DEFINITIONS).map(([type, def]) => {
            const progress = def.getProgress ? def.getProgress(progressData) : 0
            const earned = progress >= 100
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
              earnedAt: earned ? new Date().toISOString() : null
            }
          })
          setAchievements(allAchievements)
        } catch (calcError) {
          console.error('Failed to calculate achievements locally:', calcError)
        }
        setAchievementsLoading(false)
      }
    }

    loadAchievements()
  }, [user, lessonProgress])

  // Calculate stars: 100 for completed, 50 for in progress
  const starsEarned = completedLessons * 100 + inProgressLessons * 50

  const achievementsEarned = achievements.filter(a => a.earned).length
  const recentAchievements = achievements.filter(a => a.earned).slice(0, 3)

  // Ensure stats are calculated even if achievements haven't loaded yet
  const displayAchievementsCount = achievementsLoading ? 0 : achievementsEarned

  // Calculate games completed (count completed categories across all games)
  const getGamesCompletedCount = () => {
    if (typeof window === 'undefined') return 0
    
    let count = 0
    
    // Flashcards categories
    const flashcardsCategories = [
      "Colors", "Animals", "Food & Meals", "Family Members", "Nature",
      "Time & Schedule", "Weather & Seasons", "House & Objects", "Numbers",
      "Days & Months", "Basic Question Words", "Pronouns", "Body Parts", "Master Challenge"
    ]
    flashcardsCategories.forEach(cat => {
      const stored = localStorage.getItem(`flashcards-progress-${cat}`)
      if (stored) {
        const progress = JSON.parse(stored)
        if (progress.correct === progress.total && progress.total > 0) count++
      }
    })
    
    // Matching categories
    const matchingCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    matchingCategories.forEach(cat => {
      const stored = localStorage.getItem(`matching-progress-${cat}`)
      if (stored) {
        const rounds = JSON.parse(stored)
        const requiredRounds = cat === "master" ? 20 : 10
        if (rounds >= requiredRounds) count++
      }
    })
    
    // Word Builder categories
    const wordBuilderCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    wordBuilderCategories.forEach(cat => {
      const stored = localStorage.getItem(`word-builder-progress-${cat}`)
      if (stored) {
        const progress = JSON.parse(stored)
        if (progress.completed === true) count++
      }
    })
    
    // Translation Practice categories
    const translationCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    translationCategories.forEach(cat => {
      const stored = localStorage.getItem(`picture-quiz-progress-${cat}`)
      if (stored) {
        const progress = JSON.parse(stored)
        if (progress.completed === true) count++
      }
    })
    
    // Memory Cards categories (need all 3 difficulties)
    const memoryCardsCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
    memoryCardsCategories.forEach(cat => {
      const stored = localStorage.getItem(`memory-cards-progress-${cat}`)
      if (stored) {
        const progress = JSON.parse(stored)
        // Check if all three difficulty levels are completed
        if (progress.easy === true && progress.medium === true && progress.hard === true) count++
      }
    })
    
    return count
  }

  const gamesCompletedCount = getGamesCompletedCount()

  // Get in-progress games (categories with some progress but not completed)
  const getInProgressGames = () => {
    const inProgressGames: Array<{ name: string; game: string; progress: number; route: string; icon: string }> = []
    
    // Flashcards categories
    const flashcardsCategories = [
      { name: "Colors", route: "/games/flashcards?category=Colors", icon: "🎨" },
      { name: "Animals", route: "/games/flashcards?category=Animals", icon: "🐾" },
      { name: "Food & Meals", route: "/games/flashcards?category=Food & Meals", icon: "🍎" },
      { name: "Family Members", route: "/games/flashcards?category=Family Members", icon: "👨‍👩‍👧‍👦" },
      { name: "Nature", route: "/games/flashcards?category=Nature", icon: "🌳" },
      { name: "Time & Schedule", route: "/games/flashcards?category=Time & Schedule", icon: "🕐" },
      { name: "Weather & Seasons", route: "/games/flashcards?category=Weather & Seasons", icon: "🌤️" },
      { name: "House & Objects", route: "/games/flashcards?category=House & Objects", icon: "🏠" },
      { name: "Numbers", route: "/games/flashcards?category=Numbers", icon: "🔢" },
      { name: "Days & Months", route: "/games/flashcards?category=Days & Months", icon: "📅" },
      { name: "Basic Question Words", route: "/games/flashcards?category=Basic Question Words", icon: "❓" },
      { name: "Pronouns", route: "/games/flashcards?category=Pronouns", icon: "👥" },
      { name: "Body Parts", route: "/games/flashcards?category=Body Parts", icon: "👤" }
    ]
    
    flashcardsCategories.forEach(cat => {
      const stored = localStorage.getItem(`flashcards-progress-${cat.name}`)
      if (stored) {
        const progress = JSON.parse(stored)
        const progressPercent = progress.total > 0 ? Math.round((progress.correct / progress.total) * 100) : 0
        // Show if progress > 0 but not 100%
        if (progressPercent > 0 && progressPercent < 100) {
          inProgressGames.push({
            name: cat.name,
            game: "Flashcards",
            progress: progressPercent,
            route: cat.route,
            icon: cat.icon
          })
        }
      }
    })
    
    // Sort by most recent (we'll use progress as a proxy for recency)
    return inProgressGames.sort((a, b) => b.progress - a.progress).slice(0, 3)
  }

  const inProgressGames = getInProgressGames()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ALPHABET': return '🔤'
      case 'NUMBERS': return '🔢'
      case 'WORDS': return '📝'
      case 'TIME': return '🕐'
      case 'WEATHER': return '🌤️'
      case 'HOUSE': return '🏠'
      case 'FOOD': return '🍎'
      case 'SONGS': return '🎵'
      case 'GAMES': return '🎮'
      default: return '📚'
    }
  }

  const handleClearProgress = async () => {
    if (isClearing) return
    
    if (!confirm('Are you sure you want to clear all progress? This action cannot be undone.')) {
      return
    }
    
    setIsClearing(true)
    try {
      await clearProgress()
      // Force page reload to refresh all stats
      window.location.reload()
      console.log('✅ Progress cleared successfully')
    } catch (error) {
      console.error('❌ Error clearing progress:', error)
      alert('Failed to clear progress. Please try again.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-supportMint/10 to-brand-green/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2"
          >
            Welcome back, <span className="bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'there'}</span>!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto"
          >
            Ready to continue your Kurdish learning journey? Let's pick up where you left off.
          </motion.p>
          
          {/* Clear Progress Button (for testing) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-4"
          >
            <button
              onClick={handleClearProgress}
              disabled={isClearing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {isClearing ? 'Clearing...' : 'Clear All Progress (Testing)'}
            </button>
          </motion.div>
        </motion.div>

        {/* Single-user dashboard (child selection removed) */}

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primaryBlue to-supportLavender rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent">{completedLessons}</div>
            <div className="text-sm text-gray-600 font-medium">Lessons Completed</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accentCoral to-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-accentCoral to-brand-orange bg-clip-text text-transparent">{starsEarned.toLocaleString()}</div>
            <div className="text-sm text-gray-600 font-medium">Stars Earned</div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-supportMint rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-brand-green to-supportMint bg-clip-text text-transparent">{displayAchievementsCount}</div>
            <div className="text-sm text-gray-600 font-medium">Achievements</div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Continue Learning & Continue Playing */}
          <div className="space-y-8">
            {/* Continue Learning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-100"
            >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primaryBlue/20 to-supportLavender/20 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primaryBlue" />
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Continue Learning</h3>
              </div>
              <Link href="/learn" className="text-sm text-primaryBlue hover:text-primaryBlue/80 font-medium transition-colors flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentLessons.length > 0 ? (
              <div className="space-y-4">
                {recentLessons.map((lesson, index) => {
                  const progress = getLessonProgress(lesson.id)
                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 via-blue-50/50 to-purple-50/30 rounded-2xl border border-gray-200 hover:border-primaryBlue/30 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-primaryBlue/15 to-supportLavender/15 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                          {getTypeIcon(lesson.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 mb-2 truncate">{lesson.title}</h4>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-primaryBlue to-supportLavender h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.round(progress.progress)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 min-w-[50px] text-right">
                              {Math.round(progress.progress)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {progress.status === 'COMPLETED' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-xs text-gray-500">
                              {progress.status === 'COMPLETED' ? 'Completed' : 
                               progress.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        href={
                          lesson.id === '1'
                            ? '/learn/alphabet'
                            : lesson.id === '2'
                            ? '/learn/kurmanji/numbers'
                            : lesson.id === '3'
                            ? '/learn/days'
                            : lesson.id === '4'
                            ? '/learn/months'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Present')
                            ? '/learn/simple-present'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Past')
                            ? '/learn/simple-past'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Future')
                            ? '/learn/simple-future'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Sentence Structure')
                            ? '/learn/sentence-structure-pronouns'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Articles & Plurals')
                            ? '/learn/articles-plurals'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Possessive Pronouns')
                            ? '/learn/possessive-pronouns'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Prepositions')
                            ? '/learn/prepositions'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Questions & Negation')
                            ? '/learn/questions-negation'
                            : lesson.type === 'GRAMMAR' && lesson.title.includes('Basic Adjectives')
                            ? '/learn/basic-adjectives'
                            : lesson.id === '14'
                            ? '/learn/verbs'
                            : lesson.id === '8'
                            ? '/learn/family'
                            : lesson.id === '23'
                            ? '/learn/colors'
                            : lesson.id === '7'
                            ? '/learn/food'
                            : lesson.id === '6'
                            ? '/learn/house'
                            : lesson.id === '9'
                            ? '/learn/animals'
                            : lesson.id === '13'
                            ? '/learn/body'
                            : lesson.id === '5'
                            ? '/learn/weather'
                            : lesson.id === '10'
                            ? '/learn/conversations'
                            : lesson.id === '11'
                            ? '/learn/nature'
                            : `/learn/kurmanji/lesson/${lesson.id}`
                        }
                        className="bg-gradient-to-r from-primaryBlue to-supportLavender text-white text-xs sm:text-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap ml-2 sm:ml-4"
                      >
                        {progress.status === 'COMPLETED' ? 'Completed' : 
                         progress.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No lessons started yet</p>
                <Link 
                  href="/learn"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primaryBlue to-supportLavender text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                >
                  Start Your First Lesson
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
            </motion.div>

            {/* Continue Playing Games */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-green/20 to-supportMint/20 rounded-2xl flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-brand-green" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Continue Playing</h3>
                </div>
                <Link href="/games" className="text-sm text-brand-green hover:text-brand-green/80 font-medium transition-colors flex items-center gap-1">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {inProgressGames.length > 0 ? (
                <div className="space-y-4">
                  {inProgressGames.map((game, index) => (
                    <motion.div
                      key={`${game.game}-${game.name}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 via-green-50/50 to-mint-50/30 rounded-2xl border border-gray-200 hover:border-brand-green/30 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-brand-green/15 to-supportMint/15 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                          {game.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 mb-1 truncate">{game.name}</h4>
                          <p className="text-xs text-gray-500 mb-2">{game.game}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-brand-green to-supportMint h-full rounded-full transition-all duration-500"
                                style={{ width: `${game.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 min-w-[50px] text-right">
                              {game.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link 
                        href={game.route}
                        className="bg-gradient-to-r from-brand-green to-supportMint text-white text-xs sm:text-sm px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl hover:from-brand-green/90 hover:to-supportMint/90 transition-all duration-200 shadow-md hover:shadow-lg font-medium whitespace-nowrap ml-2 sm:ml-4"
                      >
                        Continue
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-4">No games in progress</p>
                  <Link 
                    href="/games"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-green to-supportMint text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Start Playing
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-accentCoral/20 to-brand-orange/20 rounded-2xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-accentCoral" />
              </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Achievements</h3>
            </div>
            {achievementsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading achievements...</p>
              </div>
            ) : recentAchievements.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {recentAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-2xl text-center transition-all duration-200 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-lg"
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-sm font-medium text-yellow-800">
                      {achievement.title}
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-2" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Complete lessons and games to earn achievements!</p>
              </div>
            )}
            <div className="mt-6 text-center">
              <Link href="/achievements" className="inline-flex items-center gap-2 text-accentCoral hover:text-accentCoral/80 font-medium transition-colors">
                View All Achievements
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions - Improved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="text-center mb-8">
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2"
            >
              Jump into Your Favorite Learning Activities
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-sm sm:text-base md:text-lg"
            >
              Choose your adventure and keep learning!
            </motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/learn" className="block bg-gradient-to-br from-primaryBlue/10 via-white to-supportLavender/10 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border-2 border-primaryBlue/20 hover:border-primaryBlue/40 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primaryBlue/5 to-supportLavender/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-primaryBlue to-supportLavender rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg md:text-xl">Start Learning</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">Interactive lessons with audio & quizzes</p>
                  <div className="inline-flex items-center gap-2 text-primaryBlue font-semibold group-hover:gap-3 transition-all duration-200">
                    Begin Learning
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/games" className="block bg-gradient-to-br from-brand-green/10 via-white to-supportMint/10 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border-2 border-brand-green/20 hover:border-brand-green/40 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-supportMint/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-supportMint rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg md:text-xl">Play Games</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">Fun games to practice vocabulary</p>
                  <div className="inline-flex items-center gap-2 text-brand-green font-semibold group-hover:gap-3 transition-all duration-200">
                    Start Playing
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/stories" className="block bg-gradient-to-br from-accentCoral/10 via-white to-brand-orange/10 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border-2 border-accentCoral/20 hover:border-accentCoral/40 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accentCoral/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-accentCoral to-brand-orange rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <BookMarked className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg md:text-xl">Read Stories</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">Engaging stories with audio & translations</p>
                  <div className="inline-flex items-center gap-2 text-accentCoral font-semibold group-hover:gap-3 transition-all duration-200">
                    Read Stories
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
