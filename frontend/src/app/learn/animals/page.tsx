"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const animals = [
  { en: "Cat", ku: "pisîk", icon: "🐱", audioFile: "pisik.mp3" },
  { en: "Dog", ku: "se", icon: "🐶", audioFile: "se.mp3" },
  { en: "Bird", ku: "balinde", icon: "🐦", audioFile: "balinde.mp3" },
  { en: "Cow", ku: "çêlek", icon: "🐮", audioFile: "celek.mp3" },
  { en: "Bull", ku: "ga", icon: "🐂", audioFile: "ga.mp3" },
  { en: "Horse", ku: "hesp", icon: "🐴", audioFile: "hesp.mp3" },
  { en: "Fish", ku: "masî", icon: "🐟", audioFile: "masi.mp3" },
  { en: "Lion", ku: "şêr", icon: "🦁", audioFile: "ser.mp3" },
  { en: "Goat", ku: "bizin", icon: "🐐", audioFile: "bizin.mp3" },
  { en: "Sheep", ku: "pez", icon: "🐑", audioFile: "pez.mp3" },
  { en: "Elephant", ku: "fîl", icon: "🐘", audioFile: "fil.mp3" },
  { en: "Monkey", ku: "meymûn", icon: "🐵", audioFile: "meymun.mp3" },
  { en: "Wolf", ku: "gur", icon: "🐺", audioFile: "gur.mp3" },
  { en: "Snake", ku: "mar", icon: "🐍", audioFile: "mar.mp3" },
  { en: "Rabbit", ku: "kevroşk", icon: "🐰", audioFile: "kevrosk.mp3" },
  { en: "Chicken", ku: "mirîşk", icon: "🐔", audioFile: "mirisk.mp3" },
  { en: "Rooster", ku: "dîk", icon: "🐓", audioFile: "dik.mp3" },
  { en: "Tiger", ku: "piling", icon: "🐯", audioFile: "piling.mp3" },
  { en: "Bear", ku: "hirç", icon: "🐻", audioFile: "hirc.mp3" },
  { en: "Fox", ku: "rovî", icon: "🦊", audioFile: "rovi.mp3" },
  { en: "Butterfly", ku: "perperok", icon: "🦋", audioFile: "perperok.mp3" },
  { en: "Mouse", ku: "mişk", icon: "🐭", audioFile: "misk.mp3" },
  { en: "Duck", ku: "werdek", icon: "🦆", audioFile: "werdek.mp3" },
  { en: "Pig", ku: "beraz", icon: "🐷", audioFile: "beraz.mp3" },
  { en: "Donkey", ku: "ker", icon: "🫏", audioFile: "ker.mp3" },
  { en: "Owl", ku: "kund", icon: "🦉", audioFile: "kund.mp3" },
  { en: "Turkey", ku: "elok", icon: "🦃", audioFile: "elok.mp3" },
  { en: "Hedgehog", ku: "jûjî", icon: "🦔", audioFile: "juji.mp3" },
  { en: "Crow", ku: "qel", icon: "🐦‍⬛", audioFile: "qel.mp3" },
]

// Animal questions
const animalQuestions = [
  { ku: "Ev çi heywan e?", en: "What animal is this?", audioFile: "/audio/kurdish-tts-mp3/animals/ev-ci-heywan-e.mp3" },
  { ku: "Tu heywanekî xwe heye?", en: "Do you have a pet?", audioFile: "/audio/kurdish-tts-mp3/animals/tu-heywanki-xwe-heye.mp3" },
  { ku: "Heywana te çi ye?", en: "What is your pet?", audioFile: "/audio/kurdish-tts-mp3/animals/heywana-te-ci-ye.mp3" },
  { ku: "Tu kîjan heywanan hez dikî?", en: "Which animals do you like?", audioFile: "/audio/kurdish-tts-mp3/animals/tu-kijan-heywanan-hez-diki.mp3" },
]

interface ExerciseItem {
  ku: string
  en: string
  audioFile: string
  icon: string
}

const QUESTIONS_PER_SESSION = 20
const LESSON_ID = '9' // Animals lesson ID

// Progress configuration
const progressConfig = {
  totalAudios: 33, // 29 animals + 4 animal questions
  hasPractice: true,
  audioWeight: 30,
  timeWeight: 20,
  practiceWeight: 50,
  audioMultiplier: 100 / 33, // ~3.03% per audio
}

export default function AnimalsWordsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Refs for progress tracking
  const startTimeRef = useRef<number>(Date.now())
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  const baseAudioPlaysRef = useRef<number>(0)
  const refsInitializedRef = useRef<boolean>(false)

  const [mode, setMode] = useState<'learn' | 'practice'>('learn')
  const [currentExercise, setCurrentExercise] = useState<ExerciseItem | null>(null)
  const [options, setOptions] = useState<ExerciseItem[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [practiceQuestions, setPracticeQuestions] = useState<ExerciseItem[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [practiceScore, setPracticeScore] = useState<number | undefined>(undefined)
  const [practicePassed, setPracticePassed] = useState(false)

  // Calculate progress based on unique audios played, time spent, and practice score
  const calculateProgress = (currentPracticeScore?: number): number => {
    const currentProgress = getLessonProgress(LESSON_ID)
    const storedProgress = currentProgress?.progress || 0
    
    // Calculate total unique audios played (base + session)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    
    // Audio progress: 30% weight
    const audioProgress = Math.min(progressConfig.audioWeight, (effectiveUniqueAudios / progressConfig.totalAudios) * progressConfig.audioWeight)
    
    // Time progress: 20% weight (3 minutes = 20%)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const timeProgress = Math.min(progressConfig.timeWeight, (totalTimeSpent / 3) * progressConfig.timeWeight)
    
    // Practice progress: 50% weight (use current score or stored score)
    const practiceScoreToUse = currentPracticeScore !== undefined 
      ? currentPracticeScore 
      : (currentProgress?.score !== undefined ? currentProgress.score : 0)
    const practiceProgress = progressConfig.hasPractice 
      ? (practiceScoreToUse / 100) * progressConfig.practiceWeight 
      : 0
    
    // Combined progress
    let calculatedProgress = audioProgress + timeProgress + practiceProgress
    
    // Special case: if practice score is >= 70%, force 100% completion
    if (practiceScoreToUse >= 70) {
      calculatedProgress = 100
    }
    
    // Prevent progress from decreasing
    return Math.max(storedProgress, Math.round(calculatedProgress))
  }

  // Handle audio play - track unique audios
  const handleAudioPlay = (audioKey: string) => {
    // Track unique audios played (only count new ones) - check BEFORE adding
    if (uniqueAudiosPlayedRef.current.has(audioKey)) {
      // Already played this audio, don't update progress
      console.log('🔇 Audio already played, skipping:', audioKey)
      return
    }
    
    console.log('🔊 New unique audio played:', audioKey, 'Total unique:', uniqueAudiosPlayedRef.current.size + 1)
    uniqueAudiosPlayedRef.current.add(audioKey)
    
    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    
    // Get practice score from state or stored progress
    const currentPracticeScore = practiceScore !== undefined ? practiceScore : (currentProgress?.score !== undefined ? currentProgress.score : undefined)
    const progress = calculateProgress(currentPracticeScore)
    
    // Set status to COMPLETED when progress reaches 100%, otherwise preserve existing status or set to IN_PROGRESS
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
    
    console.log('📊 Progress update:', {
      progress,
      status,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, currentPracticeScore, safeTimeSpent)
  }

  // Initial setup: restore refs from stored progress and mark lesson as in progress
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Mark lesson as IN_PROGRESS if not already completed
    if (currentProgress?.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
    
    // Restore refs from stored progress (only once)
    if (currentProgress) {
      const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig)
      startTimeRef.current = estimatedStartTime
      
      // Only restore baseAudioPlaysRef if progress is significant (>20%)
      if (currentProgress.progress > 20) {
        baseAudioPlaysRef.current = Math.min(estimatedAudioPlays, progressConfig.totalAudios)
      } else {
        baseAudioPlaysRef.current = 0
        console.log('🔄 Progress is low (<20%), resetting baseAudioPlaysRef to 0 for accurate tracking')
      }
      
      // Safety check: if baseAudioPlaysRef is already at or near totalAudios, reset it
      if (baseAudioPlaysRef.current >= progressConfig.totalAudios - 2) {
        console.warn('⚠️ baseAudioPlaysRef is too high, resetting to 0 to prevent progress jump')
        baseAudioPlaysRef.current = 0
      }
      
      // Restore practice score if it exists
      if (currentProgress.score !== undefined) {
        setPracticeScore(currentProgress.score)
        setPracticePassed(currentProgress.score >= 70)
      }
      
      // Check if progress is 100% but status is not COMPLETED
      if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
        console.log('✅ Progress is 100% but status is not COMPLETED, updating status...')
        updateLessonProgress(LESSON_ID, currentProgress.progress, 'COMPLETED', currentProgress.score, currentProgress.timeSpent)
      }
      
      console.log('✅ Restored progress refs for Animals:', {
        baseAudioPlays: baseAudioPlaysRef.current,
        uniqueAudios: uniqueAudiosPlayedRef.current.size,
        startTime: new Date(startTimeRef.current).toISOString(),
        practiceScore: currentProgress.score,
      })
    }
    
    refsInitializedRef.current = true
  }, []) // Empty dependency array - only run once on mount

  // Track practice completion and update progress
  useEffect(() => {
    if (isCompleted && score.total > 0) {
      const practiceScorePercent = Math.round((score.correct / score.total) * 100)
      const isPracticePassed = practiceScorePercent >= 70
      
      setPracticeScore(practiceScorePercent)
      setPracticePassed(isPracticePassed)
      
      // Calculate total time spent (base + session)
      const currentProgress = getLessonProgress(LESSON_ID)
      const baseTimeSpent = currentProgress?.timeSpent || 0
      const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
      const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
      const safeTimeSpent = Math.min(1000, totalTimeSpent)
      
      // Calculate combined progress (will force to 100% if score >= 70)
      const progress = calculateProgress(practiceScorePercent)
      
      // Mark lesson as completed if practice is passed (score >= 70)
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
      
      console.log('🎯 Practice completed:', {
        practiceScorePercent,
        isPracticePassed,
        progress,
        status,
      })
      
      updateLessonProgress(LESSON_ID, progress, status, practiceScorePercent, safeTimeSpent)
    }
  }, [isCompleted, score, getLessonProgress, updateLessonProgress, calculateProgress])

  // Recovery check: ensure progress consistency on mount and visibility changes
  useEffect(() => {
    const checkProgress = () => {
      const currentProgress = getLessonProgress(LESSON_ID)
      if (!currentProgress) return
      
      const currentPracticeScore = practiceScore !== undefined ? practiceScore : (currentProgress.score !== undefined ? currentProgress.score : undefined)
      const progress = calculateProgress(currentPracticeScore)
      const storedProgress = currentProgress.progress || 0
      
      // If calculated progress is higher, update it
      if (progress > storedProgress) {
        const baseTimeSpent = currentProgress.timeSpent || 0
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
        const safeTimeSpent = Math.min(1000, totalTimeSpent)
        
        const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
        updateLessonProgress(LESSON_ID, progress, status, currentPracticeScore, safeTimeSpent)
      }
    }
    
    checkProgress()
    
    // Also check when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkProgress()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [getLessonProgress, updateLessonProgress, calculateProgress, practiceScore])

  // Periodic progress update based on time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProgress = getLessonProgress(LESSON_ID)
      if (!currentProgress || currentProgress.status === 'COMPLETED') return
      
      const currentPracticeScore = practiceScore !== undefined ? practiceScore : (currentProgress.score !== undefined ? currentProgress.score : undefined)
      const progress = calculateProgress(currentPracticeScore)
      const storedProgress = currentProgress.progress || 0
      
      // Only update if progress increased
      if (progress > storedProgress) {
        const baseTimeSpent = currentProgress.timeSpent || 0
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
        const safeTimeSpent = Math.min(1000, totalTimeSpent)
        
        const status = progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
        updateLessonProgress(LESSON_ID, progress, status, currentPracticeScore, safeTimeSpent)
      }
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [getLessonProgress, updateLessonProgress, calculateProgress, practiceScore])

  // Generate all possible exercise items from animals
  const allExerciseItems: ExerciseItem[] = animals.map(animal => ({
    ku: animal.ku,
    en: animal.en,
    audioFile: `/audio/kurdish-tts-mp3/animals/${animal.audioFile}`,
    icon: animal.icon
  }))

  // Generate 20 unique questions for practice session
  const generatePracticeQuestions = (): ExerciseItem[] => {
    // Shuffle all animals and take 20 unique ones
    const shuffled = [...allExerciseItems].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, shuffled.length))
  }

  // Start new practice session
  const startPracticeSession = () => {
    // Generate new unique set of 20 questions
    const newQuestions = generatePracticeQuestions()
    setPracticeQuestions(newQuestions)
    setScore({ correct: 0, total: 0 })
    setCurrentQuestion(1)
    setCurrentQuestionIndex(0)
    setIsCompleted(false)
  }

  // Initialize first exercise when switching to practice mode
  useEffect(() => {
    if (mode === 'practice' && !currentExercise && !isCompleted) {
      startPracticeSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Generate exercise when practice questions are ready or question index changes
  useEffect(() => {
    if (mode === 'practice' && practiceQuestions.length > 0 && currentQuestionIndex < practiceQuestions.length) {
      const currentItem = practiceQuestions[currentQuestionIndex]
      if (currentItem) {
        setCurrentExercise(currentItem)
        
        // Generate 3 wrong options
        const wrongOptions = allExerciseItems
          .filter(item => item.ku !== currentItem.ku)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        
        // Combine correct answer with wrong options and shuffle
        const allOptions = [currentItem, ...wrongOptions].sort(() => Math.random() - 0.5)
        setOptions(allOptions)
        setSelectedAnswer(null)
        setShowFeedback(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceQuestions, currentQuestionIndex, mode])

  const handleAnswerSelect = (answerKu: string) => {
    if (showFeedback || isCompleted) return
    
    setSelectedAnswer(answerKu)
    const isCorrect = answerKu === currentExercise?.ku
    setShowFeedback(true)
    const newTotal = score.total + 1
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: newTotal
    }))
    
    // Check if this was the last question
    if (newTotal >= QUESTIONS_PER_SESSION) {
      setIsCompleted(true)
    }
  }

  const handleNext = () => {
    if (currentQuestion >= QUESTIONS_PER_SESSION || currentQuestionIndex >= practiceQuestions.length - 1) {
      setIsCompleted(true)
      return
    }
    setCurrentQuestion(prev => prev + 1)
    setCurrentQuestionIndex(prev => prev + 1)
  }

  const handleRestart = () => {
    startPracticeSession()
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Animals</h1>
        
        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => {
                setMode('learn')
                setScore({ correct: 0, total: 0 })
                setCurrentExercise(null)
                setCurrentQuestion(0)
                setIsCompleted(false)
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                mode === 'learn'
                  ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => {
                setMode('practice')
                startPracticeSession()
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                mode === 'practice'
                  ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Practice
            </button>
          </div>

        {/* Practice Mode - Listening Exercise */}
        {mode === 'practice' && currentExercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <div className="p-6">
              {/* Completion Message */}
              {isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mb-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Great job!</h2>
                    <p className="text-gray-600 mb-4">
                      You got {score.correct} out of {QUESTIONS_PER_SESSION} correct
                    </p>
                    <div className="text-3xl font-bold text-kurdish-red">
                      {Math.round((score.correct / QUESTIONS_PER_SESSION) * 100)}%
                    </div>
                  </div>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-kurdish-red text-white rounded-lg font-medium hover:bg-kurdish-red/90 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Score and Progress */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-gray-600">
                      Question {currentQuestion} of {QUESTIONS_PER_SESSION}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      Score: {score.correct}/{score.total}
                    </div>
                  </div>

                  {/* Audio Button */}
                  <div className="text-center mb-6">
                    <p className="text-gray-600 mb-3">Listen to the animal name:</p>
                    <AudioButton
                      kurdishText={currentExercise.ku}
                      phoneticText={currentExercise.en}
                      label="Play Audio"
                      size="medium"
                      audioFile={currentExercise.audioFile}
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `practice-animal-${currentQuestionIndex}-${currentExercise.ku}`)}
                    />
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {options.map((option, index) => {
                      const isSelected = selectedAnswer === option.ku
                      const isCorrect = option.ku === currentExercise.ku
                      const showCorrect = showFeedback && isCorrect
                      const showIncorrect = showFeedback && isSelected && !isCorrect

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option.ku)}
                          disabled={showFeedback}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-200
                            ${showCorrect 
                              ? 'border-green-500 bg-green-50' 
                              : showIncorrect
                              ? 'border-red-500 bg-red-50'
                              : isSelected
                              ? 'border-kurdish-red bg-kurdish-red/10'
                              : 'border-gray-200 bg-white hover:border-kurdish-red/50 hover:bg-kurdish-red/5'
                            }
                            ${showFeedback ? 'cursor-default' : 'cursor-pointer'}
                            disabled:opacity-50
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-gray-800">{option.en}</div>
                            </div>
                            {showCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {showIncorrect && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Next Button */}
                  {showFeedback && !isCompleted && (
                    <div className="text-center">
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-kurdish-green text-white rounded-lg font-semibold hover:bg-kurdish-green/90 transition-colors"
                      >
                        {currentQuestion >= QUESTIONS_PER_SESSION ? 'Finish' : 'Next Question'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Learn Mode - Animal Cards */}
        {mode === 'learn' && (
          <>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {animals.map((a) => (
            <motion.div key={a.en} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
              <div className="font-bold text-gray-800 text-center">{a.ku.charAt(0).toUpperCase() + a.ku.slice(1)}</div>
              <div className="text-gray-600 mb-4 text-center">{a.en}</div>
              <div className="flex items-center justify-between">
                <AudioButton
                  kurdishText={a.ku}
                  phoneticText={a.en}
                  label="Listen"
                  size="small"
                  audioFile={a.audioFile ? `/audio/kurdish-tts-mp3/animals/${a.audioFile}` : undefined}
                  onPlay={(audioKey) => handleAudioPlay(audioKey || `animal-${a.ku}`)}
                />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                  <span className="text-xl">{a.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animal Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❓</span>
            Animal Questions
          </h2>
          <div className="space-y-4">
            {animalQuestions.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, x:-10}} 
                animate={{opacity:1, x:0}}
                transition={{delay: index * 0.1}}
                className="p-4 rounded-2xl border bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                    <div className="text-gray-600">{item.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `animal-question-${index}-${item.ku}`)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
          </>
        )}
      </PageContainer>
    </div>
  )
}


