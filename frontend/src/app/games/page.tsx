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
import { useGamesProgress } from '../../contexts/GamesProgressContext'

function useGamesCompletion() {
  const { getProgress } = useGamesProgress()
  const [gameCompletions, setGameCompletions] = useState({
    flashcards: false,
    matching: false,
    wordBuilder: false,
    pictureQuiz: false,
    memoryCards: false,
    sentenceBuilder: false
  })

  useEffect(() => {
    const check = () => {
      const flashCategories = ["Colors", "Animals", "Food & Meals", "Family Members", "Nature", "Time & Schedule", "Weather & Seasons", "House & Objects", "Numbers", "Days & Months", "Basic Question Words", "Pronouns", "Body Parts", "Master Challenge"]
      const flashcards = flashCategories.every(c => {
        const p = getProgress(`flashcards-progress-${c}`) as { correct?: number; total?: number } | null
        return p && p.total !== undefined && p.total > 0 && p.correct === p.total
      })
      const matchCategories = ["colors", "animals", "food", "family", "nature", "time", "weather", "house", "numbers", "daysMonths", "questions", "pronouns", "bodyParts", "master"]
      const matching = matchCategories.every(c => {
        const rounds = getProgress(`matching-progress-${c}`) as number | undefined
        const req = c === "master" ? 20 : 10
        return typeof rounds === 'number' && rounds >= req
      })
      const wordCategories = matchCategories
      const wordBuilder = wordCategories.every(c => {
        const d = getProgress(`wordbuilder-progress-${c}`) as { uniqueWords?: number } | number | undefined
        const n = typeof d === 'number' ? d : (d?.uniqueWords ?? 0)
        const req = c === "master" ? 30 : 20
        return n >= req
      })
      const pictureCategories = flashCategories
      const pictureQuiz = pictureCategories.every(c => {
        const p = getProgress(`picturequiz-progress-${c}`) as { score?: number; total?: number } | null
        return p && p.total !== undefined && p.total > 0 && (p.score ?? 0) / p.total >= 0.8
      })
      const memoryCategories = ["Colors", "Animals", "Food & Meals", "Nature", "Weather & Seasons", "House & Objects", "Numbers", "Body Parts", "Master Challenge"]
      const memoryCards = memoryCategories.every(cat => {
        let completedCount = 0
        for (const d of ['easy', 'medium', 'hard']) {
          const p = getProgress(`memorycards-progress-${cat}-${d}`) as { completed?: boolean } | null
          if (p?.completed) completedCount++
        }
        return completedCount === 3
      })
      const sentenceCategories = flashCategories
      const sentenceBuilder = sentenceCategories.every(c => {
        const p = getProgress(`sentence-builder-progress-${c}`) as { completed?: number; total?: number } | null
        return p && p.total !== undefined && p.total > 0 && p.completed === p.total
      })
      setGameCompletions({ flashcards, matching, wordBuilder, pictureQuiz, memoryCards, sentenceBuilder })
    }
    check()
    const t = setInterval(check, 2000)
    return () => clearInterval(t)
  }, [getProgress])

  return gameCompletions
}

export default function GamesPage() {
  const gameCompletions = useGamesCompletion()
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
      id: 'translation-quiz',
      title: 'Translation Quiz',
      description: 'Translate English words to Kurdish',
      icon: Brain,
      color: 'from-yellow-400 to-yellow-600',
      href: '/games/translation-quiz'
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
