'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, Lock, Play, Star, 
  Target, Trophy, ArrowRight, LockKeyhole, Sparkles
} from 'lucide-react'
import { useProgress } from '../../contexts/ProgressContext'

interface Lesson {
  id: string
  number: number
  title: string
  description: string
  icon: string
  unlocksAfter?: string // lesson ID that must be completed first
}

const lessons: Lesson[] = [
  {
    id: '1',
    number: 1,
    title: 'Kurdish Alphabet & Pronunciation',
    description: 'Learn all 31 letters of the Kurdish alphabet with proper pronunciation',
    icon: '🔤',
    unlocksAfter: undefined // First lesson is always unlocked
  },
  {
    id: '2',
    number: 2,
    title: 'Pronouns (I, You, He/She)',
    description: 'Master personal pronouns and their usage in sentences',
    icon: '👤',
    unlocksAfter: '1'
  },
  {
    id: '3',
    number: 3,
    title: 'Question Words',
    description: 'Learn essential question words: who, what, where, when, why, how',
    icon: '❓',
    unlocksAfter: '2'
  },
  {
    id: '4',
    number: 4,
    title: 'Kurdish Numbers',
    description: 'Master numbers from 1 to 100 with pronunciation and examples',
    icon: '🔢',
    unlocksAfter: '3'
  },
  {
    id: '5',
    number: 5,
    title: 'Grammar: Sentence Structure & Pronouns',
    description: 'Learn basic sentence structure and pronoun usage in Kurdish',
    icon: '📝',
    unlocksAfter: '4'
  },
  {
    id: '6',
    number: 6,
    title: 'Grammar: Verbs & Conjugation',
    description: 'Master verb conjugation in present and past tense',
    icon: '🔄',
    unlocksAfter: '5'
  },
  {
    id: '7',
    number: 7,
    title: 'Grammar: Negation & Articles',
    description: 'Learn how to form negative sentences and use articles',
    icon: '❌',
    unlocksAfter: '6'
  },
  {
    id: '8',
    number: 8,
    title: 'Grammar: Adjectives & Prepositions',
    description: 'Master adjectives, colors, and prepositions in Kurdish',
    icon: '📍',
    unlocksAfter: '7'
  },
  {
    id: '9',
    number: 9,
    title: 'Common Verbs',
    description: 'Learn essential action words for daily conversations',
    icon: '🏃',
    unlocksAfter: '8'
  },
  {
    id: '10',
    number: 10,
    title: 'Daily Conversations',
    description: 'Practice essential greetings and everyday conversations',
    icon: '💬',
    unlocksAfter: '9'
  }
]

export default function LessonsPage() {
  const { getLessonProgress } = useProgress()
  const [, setRefresh] = useState(0)

  // Listen for progress updates
  useEffect(() => {
    const handleProgressUpdate = () => {
      setRefresh(prev => prev + 1)
    }
    
    window.addEventListener('lessonProgressUpdated', handleProgressUpdate)
    
    return () => {
      window.removeEventListener('lessonProgressUpdated', handleProgressUpdate)
    }
  }, [])

  // Check if a lesson is unlocked
  const isLessonUnlocked = (lesson: Lesson): boolean => {
    // TEMPORARILY UNLOCKED FOR TESTING - TODO: Re-enable locking later
    return true
    
    // First lesson is always unlocked
    // if (!lesson.unlocksAfter) return true
    
    // Check if prerequisite lesson is completed
    // const prerequisiteProgress = getLessonProgress(lesson.unlocksAfter)
    // return prerequisiteProgress.status === 'COMPLETED'
  }

  // Calculate overall progress
  const progressStats = lessons.reduce((acc, lesson) => {
    const progress = getLessonProgress(lesson.id)
    if (progress.status === 'COMPLETED') {
      acc.completed++
    } else if (progress.status === 'IN_PROGRESS') {
      acc.inProgress++
    }
    return acc
  }, { completed: 0, inProgress: 0 })

  const totalLessons = lessons.length
  const overallProgress = totalLessons > 0 ? Math.round(((progressStats.completed) / totalLessons) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-accentCoral/10 to-brand-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-supportMint/10 to-brand-green/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primaryBlue to-supportLavender bg-clip-text text-transparent">
                  Structured Lessons
                </h1>
                <p className="text-gray-600 mt-1">Learn Kurdish grammar step-by-step</p>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primaryBlue/20 to-supportLavender/20 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-primaryBlue" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">Your Progress</h2>
                    <p className="text-sm text-gray-600">{overallProgress}% Complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-green">{progressStats.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accentCoral">{progressStats.inProgress}</div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-primaryBlue to-supportLavender"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </header>

        {/* Lessons Grid */}
        <section className="container mx-auto px-4 py-8">
          {lessons.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => {
                const progress = getLessonProgress(lesson.id)
                const unlocked = isLessonUnlocked(lesson)
                const isCompleted = progress.status === 'COMPLETED'
                const isInProgress = progress.status === 'IN_PROGRESS'

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={unlocked ? { scale: 1.02 } : {}}
                    className={`relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border transition-all duration-300 ${
                      unlocked 
                        ? 'border-gray-100 hover:shadow-xl cursor-pointer' 
                        : 'border-gray-200 opacity-75 cursor-not-allowed'
                    } ${isCompleted ? 'ring-2 ring-brand-green/20' : ''}`}
                  >
                    {/* Lesson Number Badge */}
                    <div className="absolute top-4 right-4">
                      {unlocked ? (
                        <div className="w-10 h-10 bg-gradient-to-br from-primaryBlue/20 to-supportLavender/20 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primaryBlue">{lesson.number}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Lock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Lock Overlay */}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                        <div className="text-center">
                          <LockKeyhole className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-600">Complete Lesson {lesson.number - 1} to unlock</p>
                        </div>
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-5xl mb-4">{lesson.icon}</div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2 pr-12">
                      Lesson {lesson.number}: {lesson.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 text-sm">
                      {lesson.description}
                    </p>


                    {/* Progress Bar */}
                    {(isInProgress || isCompleted) && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-700">Progress</span>
                          <span className="text-xs text-gray-500">{progress.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-brand-green' 
                                : 'bg-gradient-to-r from-primaryBlue to-supportLavender'
                            }`}
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {unlocked ? (
                      <Link 
                        href={`/lessons/${lesson.id}`}
                        className="w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-6 rounded-2xl hover:from-primaryBlue/90 hover:to-supportLavender/90 focus:outline-none focus:ring-2 focus:ring-primaryBlue/50 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2"
                      >
                        {isCompleted ? (
                          <>
                            <Star className="w-4 h-4" />
                            <span>Completed</span>
                          </>
                        ) : isInProgress ? (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Continue</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Start Lesson</span>
                          </>
                        )}
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-200 text-gray-400 font-semibold py-3 px-6 rounded-2xl cursor-not-allowed text-center flex items-center justify-center space-x-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Locked</span>
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Lessons Available</h2>
              <p className="text-gray-600">Lessons will be added soon!</p>
            </div>
          )}

          {/* Completion Message */}
          {lessons.length > 0 && progressStats.completed === totalLessons && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 bg-gradient-to-r from-brand-green to-supportMint rounded-3xl p-8 text-center text-white shadow-xl"
            >
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Congratulations! 🎉</h2>
              <p className="text-lg mb-4">You've completed all structured lessons!</p>
              <p className="text-sm opacity-90">Keep practicing and explore other learning sections.</p>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  )
}

