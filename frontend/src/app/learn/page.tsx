'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Star, Trophy, Clock, BookOpen, Sparkles, Target, Zap, ArrowRight, Lock } from 'lucide-react'
import { useProgress } from '../../contexts/ProgressContext'

interface Lesson {
  id: string
  title: string
  description: string
  type: string
}

export default function LearnPage() {
  const [selectedLanguage] = useState<'kurmanji' | 'sorani'>('kurmanji')
  const { getLessonProgress, lessonProgress } = useProgress()
  const [, setRefresh] = useState(0)

  // Listen for progress updates to refresh the page
  useEffect(() => {
    const handleProgressUpdate = () => {
      setRefresh(prev => prev + 1)
    }
    
    window.addEventListener('lessonProgressUpdated', handleProgressUpdate)
    
    return () => {
      window.removeEventListener('lessonProgressUpdated', handleProgressUpdate)
    }
  }, [])
  
  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Alphabet',
      description: 'Learn all 31 letters of the Kurdish alphabet',
      type: 'ALPHABET',
    },
    {
      id: '2',
      title: 'Numbers',
      description: 'Learn numbers from 1 to 20 in Kurdish',
      type: 'NUMBERS',
    },
    {
      id: '3',
      title: 'Days of the Week',
      description: 'Learn the seven days of the week',
      type: 'TIME',
    },
    {
      id: '4',
      title: 'Months of the Year',
      description: 'Learn the twelve months in Kurdish',
      type: 'TIME',
    },
    {
      id: '18',
      title: 'Sentence Structure & Pronouns',
      description: 'Learn word order and essential pronouns',
      type: 'GRAMMAR',
    },
    {
      id: '19',
      title: 'Articles & Plurals',
      description: 'Learn "a/an", "the", "this/that" and making plurals',
      type: 'GRAMMAR',
    },
    {
      id: '21',
      title: 'Possessive Pronouns',
      description: 'Learn how to say "my", "your", "his", "her", "our", "their"',
      type: 'GRAMMAR',
    },
    {
      id: '22',
      title: 'Prepositions',
      description: 'Learn "at", "from", "with", "for", "in", "on" and more',
      type: 'GRAMMAR',
    },
    {
      id: '20',
      title: 'Questions & Negation',
      description: 'Learn how to ask questions and make negative sentences',
      type: 'GRAMMAR',
    },
    {
      id: '15',
      title: 'Simple Present Tense',
      description: 'Learn how to talk about things happening now',
      type: 'GRAMMAR',
    },
    {
      id: '14',
      title: 'Common Verbs',
      description: 'Essential action words for daily conversations',
      type: 'VERBS',
    },
    {
      id: '8',
      title: 'Family Members',
      description: 'Learn family words in Kurdish',
      type: 'WORDS',
    },
    {
      id: '23',
      title: 'Colors',
      description: 'Learn colors in Kurdish',
      type: 'WORDS',
    },
    {
      id: '24',
      title: 'Basic Adjectives',
      description: 'Learn how to describe things: big, small, good, bad, hot, cold, and more',
      type: 'GRAMMAR',
    },
    {
      id: '7',
      title: 'Food & Meals',
      description: 'Learn food vocabulary and meal conversations',
      type: 'FOOD',
    },
    {
      id: '12',
      title: 'Time & Daily Schedule',
      description: 'Learn to tell time and talk about daily activities',
      type: 'TIME',
    },
    {
      id: '6',
      title: 'Things Around the House',
      description: 'Learn vocabulary for items and rooms in the house',
      type: 'HOUSE',
    },
    {
      id: '9',
      title: 'Animals',
      description: 'Learn animal names in Kurdish',
      type: 'WORDS',
    },
    {
      id: '13',
      title: 'Body Parts',
      description: 'Learn vocabulary for human body parts and actions',
      type: 'BODY',
    },
    {
      id: '5',
      title: 'Weather & Seasons',
      description: 'Learn weather vocabulary and descriptions',
      type: 'WEATHER',
    },
    {
      id: '16',
      title: 'Simple Past Tense',
      description: 'Learn how to talk about things that already happened',
      type: 'GRAMMAR',
    },
    {
      id: '17',
      title: 'Simple Future Tense',
      description: 'Learn how to talk about things that will happen',
      type: 'GRAMMAR',
    },
    {
      id: '10',
      title: 'Daily Conversations',
      description: 'Practice conversations and essential phrases in Kurdish',
      type: 'CONVERSATIONS',
    },
    {
      id: '11',
      title: 'Nature',
      description: 'Learn about trees, flowers, mountains, and natural landscapes',
      type: 'NATURE',
    }
  ]

  // Calculate progress statistics
  const progressStats = lessons.reduce((acc, lesson) => {
    const progress = getLessonProgress(lesson.id)
    if (progress.status === 'COMPLETED') {
      acc.completed++
    } else if (progress.status === 'IN_PROGRESS') {
      acc.inProgress++
    } else {
      acc.notStarted++
    }
    return acc
  }, { completed: 0, inProgress: 0, notStarted: 0 })

  // Calculate stars and achievements for header
  const totalStars = progressStats.completed * 100 + progressStats.inProgress * 50
  const totalAchievements = progressStats.completed >= 1 ? 
    (progressStats.completed >= 2 ? 
      (progressStats.completed >= 3 ? 3 : 2) : 1) : 0


  const getProgressColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500'
      case 'IN_PROGRESS': return 'bg-yellow-500'
      case 'NOT_STARTED': return 'bg-gray-300'
      default: return 'bg-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ALPHABET': return '🔤'
      case 'NUMBERS': return '🔢'
      case 'WORDS': return '📝'
      case 'GRAMMAR': return '📚'
      case 'TIME': return '🕐'
      case 'WEATHER': return '🌤️'
      case 'HOUSE': return '🏠'
      case 'FOOD': return '🍎'
      case 'PHRASES': return '🗣️'
      case 'CONVERSATIONS': return '💬'
      case 'NATURE': return '🌿'
      case 'BODY': return '👁️'
      case 'VERBS': return '🏃'
      case 'GAMES': return '🎮'
      default: return '📚'
    }
  }

  const getLessonIcon = (lesson: Lesson) => {
    // Special cases for specific lessons
    if (lesson.title.includes('Alphabet')) return '🔤'
    if (lesson.title.includes('Numbers')) return '🔢'
    if (lesson.title.includes('Days')) return '📅'
    if (lesson.title.includes('Months')) return '📆'
    if (lesson.title.includes('Animals')) return '🐾'
    if (lesson.title.includes('Family')) return '👨‍👩‍👧‍👦'
    if (lesson.title.includes('Colors')) return '🎨'
    if (lesson.title.includes('Basic Adjectives')) return '📝'
    if (lesson.title.includes('Simple Present')) return '⏱️'
    if (lesson.title.includes('Simple Past')) return '⏮️'
    if (lesson.title.includes('Simple Future')) return '⏭️'
    if (lesson.title.includes('Sentence Structure')) return '📝'
    if (lesson.title.includes('Articles & Plurals')) return '📚'
    if (lesson.title.includes('Possessive Pronouns')) return '👤'
    if (lesson.title.includes('Prepositions')) return '📍'
    if (lesson.title.includes('Questions & Negation')) return '❓'
    
    // Default to type icon
    return getTypeIcon(lesson.type)
  }

  // Check if a lesson is locked (previous lesson must be 100% completed)
  const isLessonLocked = (lessonIndex: number): boolean => {
    // TEMPORARILY UNLOCKED FOR TESTING - TODO: Re-enable locking later
    return false
    
    // First lesson is always unlocked
    // if (lessonIndex === 0) return false
    
    // Check if previous lesson is completed
    // const previousLesson = lessons[lessonIndex - 1]
    // const previousProgress = getLessonProgress(previousLesson.id)
    
    // Lesson is unlocked if previous lesson has 100% progress
    // (Status should be COMPLETED, but we also unlock at 100% progress as fallback)
    // const isUnlocked = previousProgress.progress === 100
    
    // Lesson is locked if previous lesson is not 100% completed
    // return !isUnlocked
  }

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    const progress = getLessonProgress(lessonId)
    return progress.progress === 100 && progress.status === 'COMPLETED'
  }

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
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-100">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-sm sm:text-base md:text-lg text-gray-800">{totalStars.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-100">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accentCoral" />
                  <span className="font-bold text-sm sm:text-base md:text-lg text-gray-800">{totalAchievements}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Overview */}
        <section className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primaryBlue/20 to-supportLavender/20 rounded-2xl flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primaryBlue" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Learning Progress</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-brand-green to-supportMint bg-clip-text text-transparent">{progressStats.completed}</div>
                <div className="text-sm text-gray-600 font-medium">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-accentCoral to-brand-orange bg-clip-text text-transparent">{progressStats.inProgress}</div>
                <div className="text-sm text-gray-600 font-medium">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">{progressStats.notStarted}</div>
                <div className="text-sm text-gray-600 font-medium">Not Started</div>
              </div>
            </div>
          </motion.div>

          {/* Lessons Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson, index) => {
              const locked = isLessonLocked(index)
              const completed = isLessonCompleted(lesson.id)
              
              return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={!locked ? { scale: 1.02 } : {}}
                className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border transition-all duration-300 relative group ${
                  locked 
                    ? 'border-gray-300 opacity-60 cursor-not-allowed' 
                    : completed
                    ? 'border-green-300 hover:shadow-xl'
                    : 'border-gray-100 hover:shadow-xl'
                }`}
              >
                {/* Lock Overlay */}
                {locked && (
                  <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mt-1">
                        Complete previous lesson
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Right Icon */}
                <div className="absolute top-4 right-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primaryBlue/10 to-supportLavender/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {getLessonIcon(lesson)}
                  </div>
                </div>

                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-4 pr-8 sm:pr-16 leading-tight">
                  {lesson.title}
                </h3>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {Math.round(getLessonProgress(lesson.id).progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-primaryBlue to-supportLavender"
                      style={{ width: `${Math.round(getLessonProgress(lesson.id).progress)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                {locked ? (
                  <div className="w-full bg-gray-300 text-gray-500 font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl cursor-not-allowed text-center flex items-center justify-center space-x-2 text-xs sm:text-sm">
                    <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                ) : (
                  <Link 
                    href={
                      lesson.id === '1'
                        ? `/learn/alphabet`
                        : lesson.id === '2'
                        ? `/learn/kurmanji/numbers`
                        : lesson.id === '3'
                        ? `/learn/days`
                        : lesson.id === '4'
                        ? `/learn/months`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Present')
                        ? `/learn/simple-present`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Past')
                        ? `/learn/simple-past`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Simple Future')
                        ? `/learn/simple-future`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Sentence Structure')
                        ? `/learn/sentence-structure-pronouns`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Articles & Plurals')
                        ? `/learn/articles-plurals`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Possessive Pronouns')
                        ? `/learn/possessive-pronouns`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Prepositions')
                        ? `/learn/prepositions`
                        : lesson.type === 'GRAMMAR' && lesson.title.includes('Questions & Negation')
                        ? `/learn/questions-negation`
                        : lesson.type === 'WORDS' && lesson.title.includes('Colors')
                        ? `/learn/colors`
                        : lesson.id === '24'
                        ? `/learn/basic-adjectives`
                        : lesson.type === 'WORDS' && lesson.title.includes('Family')
                        ? `/learn/family`
                        : lesson.type === 'WORDS' && lesson.title.includes('Animals')
                        ? `/learn/animals`
                        : lesson.type === 'TIME'
                        ? `/learn/time`
                        : lesson.type === 'WEATHER'
                        ? `/learn/weather`
                        : lesson.type === 'HOUSE'
                        ? `/learn/house`
                        : lesson.type === 'FOOD'
                        ? `/learn/food`
                        : lesson.type === 'PHRASES'
                        ? `/learn/${selectedLanguage}/songs`
                        : lesson.type === 'CONVERSATIONS'
                        ? `/learn/conversations`
                        : lesson.type === 'NATURE'
                        ? `/learn/nature`
                        : lesson.type === 'BODY'
                        ? `/learn/body-parts`
                        : lesson.type === 'VERBS'
                        ? `/learn/verbs`
                        : `/learn/${selectedLanguage}`
                    }
                    className={`w-full font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primaryBlue/50 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2 text-xs sm:text-sm ${
                      completed
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                        : 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white hover:from-primaryBlue/90 hover:to-supportLavender/90'
                    }`}
                  >
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      {completed ? 'Completed' : 
                       getLessonProgress(lesson.id).status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                    </span>
                  </Link>
                )}
              </motion.div>
            )
          })}
        </div>
        </section>
      </div>
    </div>
  )
}

