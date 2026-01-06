"use client"

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Target, Award, Medal, Crown, Zap, Heart, ArrowLeft, BookOpen, Brain, Gamepad2, Globe, Puzzle, X, CheckCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { getAchievements, checkAchievements } from '../../lib/api'
import { useAuth } from '../providers'

const categories = {
  Learning: { color: "bg-blue-100 text-blue-800", icon: "📚" },
  Numbers: { color: "bg-green-100 text-green-800", icon: "🔢" },
  Colors: { color: "bg-yellow-100 text-yellow-800", icon: "🎨" },
  Family: { color: "bg-pink-100 text-pink-800", icon: "👨‍👩‍👧‍👦" },
  Speaking: { color: "bg-purple-100 text-purple-800", icon: "🗣️" },
  Games: { color: "bg-orange-100 text-orange-800", icon: "🎮" },
  Stories: { color: "bg-indigo-100 text-indigo-800", icon: "📖" },
  Consistency: { color: "bg-indigo-100 text-indigo-800", icon: "📅" },
  Mastery: { color: "bg-red-100 text-red-800", icon: "👑" }
}

// Local achievement definitions (matches backend)
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
    target: 14, // Total number of categories
    getProgress: (data: any) => {
      if (data?.flashcardsCompleted) return 100
      // Calculate progress based on completed categories
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
    description: 'Complete all memory cards categories',
    icon: '🧩',
    points: 50,
    category: 'Games',
    rarity: 'gold',
    target: 1,
    getProgress: (data: any) => data?.memoryCardsCompleted ? 100 : 0
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
  },
  ALL_STORIES_READ: {
    title: 'Story Master',
    description: 'Read all stories',
    icon: '📚',
    points: 100,
    category: 'Stories',
    rarity: 'gold',
    target: 7,
    getProgress: (data: any) => Math.min(100, (data?.storiesReadCount || 0) / 7 * 100)
  },
  GAME_CHAMPION: {
    title: 'Game Champion',
    description: 'Complete all game categories',
    icon: '🏆',
    points: 200,
    category: 'Mastery',
    rarity: 'platinum',
    target: 1,
    getProgress: (data: any) => data?.allGamesCompleted ? 100 : 0
  },
  DAILY_STREAK_3: {
    title: '3 Day Streak',
    description: 'Practice for 3 days in a row',
    icon: '🔥',
    points: 30,
    category: 'Consistency',
    rarity: 'silver',
    target: 3,
    getProgress: (data: any) => Math.min(100, (data?.dailyStreak || 0) / 3 * 100)
  },
  DAILY_STREAK_7: {
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '💪',
    points: 75,
    category: 'Consistency',
    rarity: 'gold',
    target: 7,
    getProgress: (data: any) => Math.min(100, (data?.dailyStreak || 0) / 7 * 100)
  },
  PERFECT_SCORE: {
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

const iconMap: Record<string, React.ReactNode> = {
  '⭐': <Star className="w-8 h-8" />,
  '🧠': <Brain className="w-8 h-8" />,
  '🎯': <Target className="w-8 h-8" />,
  '🔤': <Award className="w-8 h-8" />,
  '🌐': <Globe className="w-8 h-8" />,
  '🧩': <Puzzle className="w-8 h-8" />,
  '📖': <BookOpen className="w-8 h-8" />,
  '📚': <BookOpen className="w-8 h-8" />,
  '🏆': <Trophy className="w-8 h-8" />,
}

type Achievement = {
  id: string
  type: string
  title: string
  description: string
  icon: string
  points: number
  category: string
  rarity?: 'bronze' | 'silver' | 'gold' | 'platinum'
  target?: number
  progress?: number
  earned: boolean
  earnedAt?: string | null
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  // Helper functions to check game progress from localStorage
  const getProgressData = () => {
    if (typeof window === 'undefined') return {}

    // Check lesson progress
    const lessonProgressKey = Object.keys(localStorage).find(key => key.startsWith('lessonProgress_'))
    let lessonsCompletedCount = 0
    if (lessonProgressKey) {
      try {
        const lessonProgress = JSON.parse(localStorage.getItem(lessonProgressKey) || '{}')
        lessonsCompletedCount = Object.values(lessonProgress).filter(
          (lesson: any) => lesson.status === 'COMPLETED'
        ).length
      } catch (error) {
        console.error('Failed to parse lesson progress:', error)
      }
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
      return rounds >= (cat === "master" ? 50 : 10)
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
      matchingCompleted,
      wordBuilderCompleted,
      translationCompleted,
      memoryCardsCompleted,
      storiesReadCount,
      allGamesCompleted
    }
  }

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        // Get progress data and check achievements (works even without auth)
        const progressData = getProgressData()
        if (user) {
          const checkResult = await checkAchievements(progressData)
          
          // Show notifications for newly earned achievements
          if (checkResult?.newlyEarned && checkResult.newlyEarned.length > 0) {
            setNewlyUnlocked(checkResult.newlyEarned)
            // Auto-hide notifications after 5 seconds
            setTimeout(() => {
              setNewlyUnlocked([])
            }, 5000)
          }
          
          // Fetch achievements with progress data
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
          const progressDataStr = encodeURIComponent(JSON.stringify(progressData))
          const response = await fetch(`${API_BASE_URL}/achievements?progressData=${progressDataStr}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setAchievements(data.achievements || [])
          } else {
            // Fallback to basic fetch
            const data = await getAchievements()
            setAchievements(data.achievements || [])
          }
        } else {
          // Not authenticated, use local definitions to show all achievements
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
        }
      } catch (error) {
        console.error('Failed to load achievements:', error)
        // Fallback to empty array
        setAchievements([])
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [user])

  // Group achievements by category and sort by points within each category
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const category = achievement.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(achievement)
    return acc
  }, {} as Record<string, Achievement[]>)

  // Sort achievements within each category by points (highest first), then by earned status
  Object.keys(groupedAchievements).forEach(category => {
    groupedAchievements[category].sort((a, b) => {
      // Earned achievements first
      if (a.earned && !b.earned) return -1
      if (!a.earned && b.earned) return 1
      // Then by points
      return b.points - a.points
    })
  })

  // Sort categories: show categories with earned achievements first, then by category name
  const sortedCategories = Object.keys(groupedAchievements).sort((a, b) => {
    const aEarned = groupedAchievements[a].filter(ach => ach.earned).length
    const bEarned = groupedAchievements[b].filter(ach => ach.earned).length
    if (aEarned > 0 && bEarned === 0) return -1
    if (aEarned === 0 && bEarned > 0) return 1
    return a.localeCompare(b)
  })

  const earnedAchievements = achievements.filter(a => a.earned)
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0)
  const completionRate = achievements.length > 0 
    ? Math.round((earnedAchievements.length / achievements.length) * 100)
    : 0

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'bronze': return 'bg-amber-600'
      case 'silver': return 'bg-gray-400'
      case 'gold': return 'bg-yellow-500'
      case 'platinum': return 'bg-purple-500'
      default: return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primaryBlue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-kurdish-red font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">Achievements</h1>
          <div />
        </div>

        {/* Achievement Unlocked Notifications */}
        {newlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 space-y-2"
          >
            {newlyUnlocked.map((title, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Achievement Unlocked!</p>
                    <p className="text-sm text-gray-700">{title} 🎉</p>
                  </div>
                </div>
                <button
                  onClick={() => setNewlyUnlocked(prev => prev.filter((_, i) => i !== index))}
                  className="p-1 hover:bg-yellow-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 text-center"
          >
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-kurdish-red mb-1">{earnedAchievements.length}</div>
            <div className="text-sm text-gray-600">Achievements Earned</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 text-center"
          >
            <Star className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-kurdish-red mb-1">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 text-center"
          >
            <Target className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-kurdish-red mb-1">{completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Overall Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-primaryBlue to-secondaryYellow h-3 rounded-full transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{earnedAchievements.length} of {achievements.length} achievements</span>
            <span>{completionRate}% complete</span>
          </div>
        </motion.div>

        {/* Achievements by Category */}
        {sortedCategories.length > 0 ? sortedCategories.map((category, categoryIndex) => {
          const categoryAchievements = groupedAchievements[category]
          const earnedCount = categoryAchievements.filter(a => a.earned).length
          const totalCount = categoryAchievements.length
          const categoryInfo = categories[category as keyof typeof categories] || { color: "bg-gray-100 text-gray-800", icon: "🏆" }
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-8"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl ${categoryInfo.color} font-semibold flex items-center gap-2`}>
                    <span className="text-xl">{categoryInfo.icon}</span>
                    <span>{category}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {earnedCount} / {totalCount} earned
                  </span>
                </div>
                {/* Category Progress Bar */}
                <div className="flex-1 max-w-xs ml-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${categoryInfo.color.split(' ')[0]}`}
                      style={{ width: `${(earnedCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Achievements Grid for this Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (categoryIndex * 0.1) + (index * 0.05) }}
                    className={`card p-6 transition-all duration-300 ${
                      achievement.earned 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <div className={`p-3 rounded-full ${
                    achievement.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {iconMap[achievement.icon] || <Star className="w-8 h-8" />}
                  </div>
                  {achievement.rarity && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${getRarityColor(achievement.rarity)} border-2 border-white`} title={achievement.rarity} />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-600">{achievement.points} pts</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    categories[achievement.category as keyof typeof categories]?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {categories[achievement.category as keyof typeof categories]?.icon || '🏆'} {achievement.category}
                  </span>
                </div>
              </div>
              
              {/* Progress Indicator */}
              {!achievement.earned && achievement.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primaryBlue to-supportLavender h-2 rounded-full transition-all duration-500"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  {achievement.target && (
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress < 100 
                        ? `${Math.round((achievement.progress / 100) * achievement.target)} / ${achievement.target}`
                        : 'Complete!'
                      }
                    </div>
                  )}
                </div>
              )}
              
              <h3 className={`font-bold text-lg mb-2 ${
                achievement.earned ? 'text-gray-800' : 'text-gray-500'
              }`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm mb-4 ${
                achievement.earned ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {achievement.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className={`text-sm font-medium ${
                  achievement.earned ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {achievement.earned ? '✅ Earned' : '⏳ Not earned yet'}
                </div>
                {achievement.earned && (
                  <div className="text-xs text-yellow-600 font-bold">
                    +{achievement.points} points
                  </div>
                )}
              </div>
            </motion.div>
          ))}
              </div>
            </motion.div>
          )
        }) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-8 text-center"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Achievements Yet</h3>
            <p className="text-gray-500">Start learning to unlock achievements!</p>
          </motion.div>
        )}

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <div className="bg-gradient-to-r from-primaryBlue to-secondaryYellow rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🎯 Keep Learning!</h3>
            <p className="mb-4">
              {earnedAchievements.length < achievements.length 
                ? `You're ${achievements.length - earnedAchievements.length} achievements away from becoming a Kurdish master!`
                : "Congratulations! You've earned all achievements! 🎉"
              }
            </p>
            <Link 
              href="/learn" 
              className="bg-white text-primaryBlue px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Continue Learning
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
