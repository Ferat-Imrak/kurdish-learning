'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Gamepad2, 
  Puzzle, 
  Brain, 
  Palette, 
  BookOpen,
  Stars,
  Target,
  Shuffle,
  PenTool,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react'

// Helper function to check if all flashcards categories are completed
const areAllFlashcardsCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const categories = [
    "Colors",
    "Animals",
    "Food & Meals",
    "Family Members",
    "Nature",
    "Time & Schedule",
    "Weather & Seasons",
    "House & Objects",
    "Numbers",
    "Days & Months",
    "Basic Question Words",
    "Pronouns",
    "Body Parts",
    "Master Challenge"
  ]
  
  // Check if all categories are completed (100%)
  // A category is completed if progress.correct === progress.total
  for (const category of categories) {
    const stored = localStorage.getItem(`flashcards-progress-${category}`)
    if (!stored) return false
    
    const progress = JSON.parse(stored)
    
    // Check if completed (correct equals total, meaning 100% completion)
    if (progress.correct !== progress.total || progress.total === 0) {
      return false
    }
  }
  
  return true
}

// Helper function to check if all matching game categories are completed
const areAllMatchingCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const categories = [
    "colors",
    "animals",
    "food",
    "family",
    "nature",
    "time",
    "weather",
    "house",
    "numbers",
    "daysMonths",
    "questions",
    "pronouns",
    "bodyParts",
    "master"
  ]
  
  // A category is completed if user has completed at least 10 rounds (50 for Master Challenge)
  for (const category of categories) {
    const stored = localStorage.getItem(`matching-progress-${category}`)
    if (!stored) return false
    
    const rounds = JSON.parse(stored)
    const requiredRounds = category === "master" ? 50 : 10
    if (rounds < requiredRounds) return false
  }
  
  return true
}

// Helper function to check if all word builder categories are completed
const areAllWordBuilderCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const categories = [
    "colors",
    "animals",
    "food",
    "family",
    "nature",
    "time",
    "weather",
    "house",
    "numbers",
    "daysMonths",
    "questions",
    "pronouns",
    "bodyParts",
    "master"
  ]
  
  // A category is completed if user has completed the required number of unique words
  // Master Challenge: 50 words, regular categories: 20 words
  for (const category of categories) {
    const stored = localStorage.getItem(`wordbuilder-progress-${category}`)
    if (!stored) return false
    
    const data = JSON.parse(stored)
    // Handle both old format (number) and new format (object)
    const uniqueWords = typeof data === 'number' ? data : (data.uniqueWords || 0)
    // Check completion: Master Challenge needs 50, others need 20
    const requiredWords = category === "master" ? 50 : 20
    if (uniqueWords < requiredWords) return false
  }
  
  return true
}

// Helper function to check if all picture quiz categories are completed
const areAllPictureQuizCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const categories = [
    "Colors",
    "Animals",
    "Food & Meals",
    "Family Members",
    "Nature",
    "Time & Schedule",
    "Weather & Seasons",
    "House & Objects",
    "Numbers",
    "Days & Months",
    "Basic Question Words",
    "Pronouns",
    "Body Parts",
    "Master Challenge"
  ]
  
  // A category is completed if user scored 80% or higher
  for (const category of categories) {
    const stored = localStorage.getItem(`picturequiz-progress-${category}`)
    if (!stored) return false
    
    const progress = JSON.parse(stored)
    if (progress.score / progress.total < 0.8) return false
  }
  
  return true
}

// Helper function to check if all memory cards categories are completed
const areAllMemoryCardsCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const categories = [
    "Colors",
    "Animals",
    "Food & Meals",
    "Nature",
    "Weather & Seasons",
    "House & Objects",
    "Numbers",
    "Body Parts",
    "Master Challenge"
  ]
  
  // A category is completed only when user won on ALL three difficulty levels (easy, medium, and hard)
  const difficulties = ['easy', 'medium', 'hard']
  for (const category of categories) {
    let completedCount = 0
    for (const difficulty of difficulties) {
      const stored = localStorage.getItem(`memorycards-progress-${category}-${difficulty}`)
      if (stored) {
        const progress = JSON.parse(stored)
        if (progress.completed) {
          completedCount++
        }
      }
    }
    // Category is only completed if all 3 difficulties are done
    if (completedCount !== 3) return false
  }
  
  return true
}

// Helper function to check if all sentence builder categories are completed
const areAllSentenceBuilderCompleted = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const categories = [
    "Colors",
    "Animals",
    "Food & Meals",
    "Family Members",
    "Nature",
    "Time & Schedule",
    "Weather & Seasons",
    "House & Objects",
    "Numbers",
    "Days & Months",
    "Basic Question Words",
    "Pronouns",
    "Body Parts",
    "Master Challenge"
  ]
  
  // A category is completed if all sentences in that category are completed
  for (const category of categories) {
    const stored = localStorage.getItem(`sentence-builder-progress-${category}`)
    if (!stored) return false
    
    const progress = JSON.parse(stored)
    // Check if all sentences are completed (completed equals total)
    if (progress.completed !== progress.total || progress.total === 0) {
      return false
    }
  }
  
  return true
}

export default function GamesPage() {
  const [gameCompletions, setGameCompletions] = useState({
    flashcards: false,
    matching: false,
    wordBuilder: false,
    pictureQuiz: false,
    memoryCards: false,
    sentenceBuilder: false
  })
  
  useEffect(() => {
    const checkCompletion = () => {
      setGameCompletions({
        flashcards: areAllFlashcardsCompleted(),
        matching: areAllMatchingCompleted(),
        wordBuilder: areAllWordBuilderCompleted(),
        pictureQuiz: areAllPictureQuizCompleted(),
        memoryCards: areAllMemoryCardsCompleted(),
        sentenceBuilder: areAllSentenceBuilderCompleted()
      })
    }
    
    // Check on mount
    checkCompletion()
    
    // Listen for storage changes (cross-tab updates)
    window.addEventListener('storage', checkCompletion)
    
    // Listen for focus events (when user returns to this tab)
    window.addEventListener('focus', checkCompletion)
    
    // Check periodically in case of same-tab updates
    const interval = setInterval(checkCompletion, 2000)
    
    return () => {
      window.removeEventListener('storage', checkCompletion)
      window.removeEventListener('focus', checkCompletion)
      clearInterval(interval)
    }
  }, [])
  const games = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Learn new words with interactive flashcards',
      icon: BookOpen,
      color: 'from-blue-400 to-blue-600',
      href: '/games/flashcards'
    },
    {
      id: 'matching',
      title: 'Word Matching',
      description: 'Match Kurdish words with their meanings',
      icon: Puzzle,
      color: 'from-green-400 to-green-600',
      href: '/games/matching'
    },
    {
      id: 'word-builder',
      title: 'Word Builder',
      description: 'Build Kurdish words letter by letter',
      icon: PenTool,
      color: 'from-orange-400 to-orange-600',
      href: '/games/word-builder'
    },
    {
      id: 'picture-quiz',
      title: 'Translation Quiz',
      description: 'Translate English words to Kurdish',
      icon: Brain,
      color: 'from-yellow-400 to-yellow-600',
      href: '/games/picture-quiz'
    },
    {
      id: 'memory-cards',
      title: 'Memory Cards',
      description: 'Match pairs of Kurdish words and pictures',
      icon: Shuffle,
      color: 'from-red-400 to-red-600',
      href: '/games/memory-cards'
    },
    {
      id: 'sentence-builder',
      title: 'Sentence Builder',
      description: 'Build complete sentences from word cards',
      icon: FileText,
      color: 'from-purple-400 to-purple-600',
      href: '/games/sentence-builder'
    }
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-supportMint/10 to-brand-green/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-4">
          <div className="mb-2">
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4"
            >
              Fun Learning Games
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Learn Kurdish through exciting games and interactive challenges!
            </motion.p>
          </motion.div>
        </div>

        {/* Games Grid */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link href={game.href}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer h-full group">

                    {/* Game Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <game.icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Game Info */}
                    <div className="text-center">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-2">
                        {game.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {game.description}
                      </p>
                      {/* Show Completed badge if all categories are completed */}
                      {gameCompletions[game.id as keyof typeof gameCompletions] && (
                        <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </div>
                      )}
                    </div>

                    {/* Play Button */}
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primaryBlue to-supportLavender text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base rounded-2xl font-semibold hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap">
                        Play Now
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
