"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"
import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"

// Helper function to sanitize Kurdish text for filename lookup
function getAudioFilename(text: string): string {
  return text
    .toLowerCase()
    .replace(/[îÎ]/g, 'i')
    .replace(/[êÊ]/g, 'e')
    .replace(/[ûÛ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const LESSON_ID = '24' // Basic Adjectives lesson ID

// Basic adjectives reference table
const adjectivesTable = [
  { ku: "mezin", en: "big/large", category: "Size", example: "malê mezin", exampleEn: "big house", usage: "Describes size" },
  { ku: "biçûk", en: "small/little", category: "Size", example: "zarokê biçûk", exampleEn: "small child", usage: "Describes size" },
  { ku: "baş", en: "good", category: "Quality", example: "pirtûka baş", exampleEn: "good book", usage: "Describes quality" },
  { ku: "xirab", en: "bad", category: "Quality", example: "hewa xirab", exampleEn: "bad weather", usage: "Describes quality" },
  { ku: "germ", en: "hot", category: "Temperature", example: "hewa germ", exampleEn: "hot weather", usage: "Describes temperature" },
  { ku: "sar", en: "cold", category: "Temperature", example: "av sar", exampleEn: "cold water", usage: "Describes temperature" },
  { ku: "nû", en: "new", category: "Age", example: "pirtûka nû", exampleEn: "new book", usage: "Describes age" },
  { ku: "kevn", en: "old", category: "Age", example: "malê kevn", exampleEn: "old house", usage: "Describes age" },
  { ku: "xweş", en: "nice/pleasant", category: "Quality", example: "roja xweş", exampleEn: "nice day", usage: "Describes pleasantness" },
  { ku: "zû", en: "fast/quick", category: "Speed", example: "otomobîla zû", exampleEn: "fast car", usage: "Describes speed" },
  { ku: "hêdî", en: "slow", category: "Speed", example: "otomobîla hêdî", exampleEn: "slow car", usage: "Describes speed" },
  { ku: "hêsan", en: "easy", category: "Difficulty", example: "karê hêsan", exampleEn: "easy work", usage: "Describes difficulty" },
  { ku: "giran", en: "heavy/difficult", category: "Difficulty", example: "karê giran", exampleEn: "hard work", usage: "Describes difficulty or weight" },
  { ku: "dirêj", en: "long/tall", category: "Size", example: "darê dirêj", exampleEn: "tall tree", usage: "Describes length/height" },
  { ku: "kurt", en: "short", category: "Size", example: "mêra kurt", exampleEn: "short man", usage: "Describes length/height" },
  { ku: "fireh", en: "wide", category: "Size", example: "rêya fireh", exampleEn: "wide road", usage: "Describes width" },
  { ku: "teng", en: "narrow", category: "Size", example: "rêya teng", exampleEn: "narrow road", usage: "Describes width" },
  { ku: "giran", en: "heavy/difficult", category: "Weight", example: "pirtûka giran", exampleEn: "heavy book", usage: "Describes weight (can also mean difficult)" },
  { ku: "sivik", en: "light", category: "Weight", example: "pirtûka sivik", exampleEn: "light book", usage: "Describes weight" },
  { ku: "qelew", en: "fat/thick", category: "Size", example: "mêra qelew", exampleEn: "fat man", usage: "Describes thickness" },
  { ku: "tenik", en: "thin", category: "Size", example: "pirtûka tenik", exampleEn: "thin book", usage: "Describes thickness" }
]

const presentTenseExamples = [
  {
    title: 'Adjectives After Nouns',
    examples: [
      { ku: "Malê mezin.", en: "big house", audio: true, audioText: "Malê mezin." },
      { ku: "Zarokê biçûk.", en: "small child", audio: true, audioText: "Zarokê biçûk." },
      { ku: "Pirtûka baş.", en: "good book", audio: true, audioText: "Pirtûka baş." },
      { ku: "Hewa xirab.", en: "bad weather", audio: true, audioText: "Hewa xirab." },
      { ku: "Av germ.", en: "hot water", audio: true, audioText: "Av germ." },
      { ku: "Av sar.", en: "cold water", audio: true, audioText: "Av sar." }
    ]
  },
  {
    title: 'Adjectives in Sentences',
    examples: [
      { ku: "Malê min mezin e.", en: "My house is big", audio: true, audioText: "Malê min mezin e" },
      { ku: "Zarokê te biçûk e.", en: "Your child is small", audio: true, audioText: "Zarokê te biçûk e" },
      { ku: "Pirtûka wî baş e.", en: "His book is good", audio: true, audioText: "Pirtûka wî baş e" },
      { ku: "Hewa xirab e.", en: "The weather is bad", audio: true, audioText: "Hewa xirab e" },
      { ku: "Av germ e.", en: "The water is hot", audio: true, audioText: "Av germ e" },
      { ku: "Pirtûka nû xweş e.", en: "The new book is nice", audio: true, audioText: "Pirtûka nû xweş e" }
    ]
  },
  {
    title: 'Size Adjectives',
    examples: [
      { ku: "Darê dirêj.", en: "tall tree", audio: true, audioText: "Darê dirêj." },
      { ku: "Mêra kurt.", en: "short man", audio: true, audioText: "Mêra kurt." },
      { ku: "Rêya fireh.", en: "wide road", audio: true, audioText: "Rêya fireh." },
      { ku: "Rêya teng.", en: "narrow road", audio: true, audioText: "Rêya teng." },
      { ku: "Pirtûka giran.", en: "heavy book", audio: true, audioText: "Pirtûka giran." },
      { ku: "Pirtûka sivik.", en: "light book", audio: true, audioText: "Pirtûka sivik." }
    ]
  },
  {
    title: 'Quality & Difficulty',
    examples: [
      { ku: "Karê hêsan.", en: "easy work", audio: true, audioText: "Karê hêsan." },
      { ku: "Karê giran.", en: "hard work", audio: true, audioText: "Karê giran." },
      { ku: "Roja xweş.", en: "nice day", audio: true, audioText: "Roja xweş." },
      { ku: "Pirtûka baş.", en: "good book", audio: true, audioText: "Pirtûka baş." },
      { ku: "Otomobîla zû.", en: "fast car", audio: true, audioText: "Otomobîla zû." },
      { ku: "Otomobîla hêdî.", en: "slow car", audio: true, audioText: "Otomobîla hêdî." }
    ]
  },
  {
    title: 'Age & Condition',
    examples: [
      { ku: "Pirtûka nû.", en: "new book", audio: true, audioText: "Pirtûka nû." },
      { ku: "Malê kevn.", en: "old house", audio: true, audioText: "Malê kevn." },
      { ku: "Kûrsiyê nû.", en: "new chair", audio: true, audioText: "Kûrsiyê nû." },
      { ku: "Kûrsiyê kevn.", en: "old chair", audio: true, audioText: "Kûrsiyê kevn." }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "mezin mal",
    correct: "malê mezin",
    explanation: "In Kurdish, adjectives come AFTER the noun, not before. Also, the noun gets an ending (-ê, -a, -ên) before the adjective."
  },
  {
    wrong: "mal mezin",
    correct: "malê mezin",
    explanation: "Don't forget the ending on the noun! 'mal' becomes 'malê' before the adjective 'mezin' (big)."
  },
  {
    wrong: "baş pirtûk",
    correct: "pirtûka baş",
    explanation: "Adjectives always come after the noun in Kurdish. 'pirtûka baş' (good book), not 'baş pirtûk'."
  },
  {
    wrong: "germ hewa",
    correct: "hewa germ",
    explanation: "Some nouns don't need endings when used with adjectives. 'hewa germ' (hot weather) is correct - the adjective comes after."
  },
  {
    wrong: "mezin malê",
    correct: "malê mezin",
    explanation: "The ending goes on the noun, then the adjective follows. 'malê mezin' (big house), not 'mezin malê'."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'big house' in Kurdish?",
    options: ["mezin mal", "mal mezin", "malê mezin", "mezin malê"],
    correct: 2,
    explanation: "Adjective comes after noun with ending: malê mezin (big house)"
  },
  {
    question: "What does 'biçûk' mean?",
    options: ["big", "small", "good", "bad"],
    correct: 1,
    explanation: "'biçûk' means 'small' or 'little'"
  },
  {
    question: "How do you say 'good book'?",
    options: ["baş pirtûk", "pirtûk baş", "pirtûka baş", "pirtûkê baş"],
    correct: 2,
    explanation: "Use 'pirtûka baş' - adjective comes after noun with ending"
  },
  {
    question: "What is 'cold water' in Kurdish?",
    options: ["sar av", "av sar", "ava sar", "sar avê"],
    correct: 1,
    explanation: "'av sar' (cold water) - some nouns like 'av' (water) don't need endings with certain adjectives"
  },
  {
    question: "What does 'nû' mean?",
    options: ["old", "new", "good", "bad"],
    correct: 1,
    explanation: "'nû' means 'new'"
  },
  {
    question: "How do you say 'hot weather'?",
    options: ["germ hewa", "hewa germ", "hewê germ", "germ hewê"],
    correct: 1,
    explanation: "'hewa germ' (hot weather) - adjective comes after"
  },
  {
    question: "What is 'small child' in Kurdish?",
    options: ["biçûk zarok", "zarok biçûk", "zarokê biçûk", "biçûk zarokê"],
    correct: 2,
    explanation: "'zarokê biçûk' (small child) - noun gets ending, adjective follows"
  },
  {
    question: "What does 'xirab' mean?",
    options: ["good", "bad", "big", "small"],
    correct: 1,
    explanation: "'xirab' means 'bad'"
  },
  {
    question: "How do you say 'old house'?",
    options: ["kevn mal", "mal kevn", "malê kevn", "kevn malê"],
    correct: 2,
    explanation: "'malê kevn' (old house) - adjective after noun with ending"
  },
  {
    question: "What is 'fast car' in Kurdish?",
    options: ["zû otomobîl", "otomobîl zû", "otomobîla zû", "zû otomobîla"],
    correct: 2,
    explanation: "'otomobîla zû' (fast car) - adjective comes after"
  },
  {
    question: "What does 'hêsan' mean?",
    options: ["hard", "easy", "fast", "slow"],
    correct: 1,
    explanation: "'hêsan' means 'easy'"
  },
  {
    question: "How do you say 'tall tree'?",
    options: ["dirêj dar", "dar dirêj", "darê dirêj", "dirêj darê"],
    correct: 2,
    explanation: "'darê dirêj' (tall tree) - adjective after noun"
  },
  {
    question: "What is 'heavy book' in Kurdish?",
    options: ["giran pirtûk", "pirtûk giran", "pirtûka giran", "giran pirtûka"],
    correct: 2,
    explanation: "'pirtûka giran' (heavy book) - adjective follows noun"
  },
  {
    question: "What does 'xweş' mean?",
    options: ["bad", "nice/pleasant", "big", "small"],
    correct: 1,
    explanation: "'xweş' means 'nice' or 'pleasant'"
  },
  {
    question: "How do you say 'wide road'?",
    options: ["fireh rê", "rê fireh", "rêya fireh", "fireh rêya"],
    correct: 2,
    explanation: "'rêya fireh' (wide road) - adjective after noun"
  },
  {
    question: "What is 'slow car' in Kurdish?",
    options: ["hêdî otomobîl", "otomobîl hêdî", "otomobîla hêdî", "hêdî otomobîla"],
    correct: 2,
    explanation: "'otomobîla hêdî' (slow car)"
  },
  {
    question: "What does 'giran' mean?",
    options: ["easy", "heavy/difficult", "fast", "slow"],
    correct: 1,
    explanation: "'giran' means 'heavy' or 'difficult' (can mean both depending on context)"
  },
  {
    question: "How do you say 'light book'?",
    options: ["sivik pirtûk", "pirtûk sivik", "pirtûka sivik", "sivik pirtûka"],
    correct: 2,
    explanation: "'pirtûka sivik' (light book)"
  },
  {
    question: "What is 'narrow road' in Kurdish?",
    options: ["teng rê", "rê teng", "rêya teng", "teng rêya"],
    correct: 2,
    explanation: "'rêya teng' (narrow road)"
  },
  {
    question: "What does 'kevn' mean?",
    options: ["new", "old", "good", "bad"],
    correct: 1,
    explanation: "'kevn' means 'old'"
  }
]

export default function BasicAdjectivesPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 28, // 28 examples across 5 sections (6+6+6+6+4)
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.07, // 30% / 28 audios ≈ 1.07% per audio
  }
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID)
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig)
  const startTimeRef = useRef<number>(estimatedStartTime)
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays)
  const refsInitializedRef = useRef(false)
  
  const [mode, setMode] = useState<'learn' | 'practice'>('learn')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isCompleted, setIsCompleted] = useState(false)
  const [practiceScore, setPracticeScore] = useState<number | undefined>(undefined)
  const [practicePassed, setPracticePassed] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Initialize refs from stored progress - ONLY ONCE on mount
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Basic Adjectives page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
    })
    
    // Mark lesson as in progress on mount
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
    
    // Restore refs from stored progress - ONLY ONCE on mount
    const currentProgress = getLessonProgress(LESSON_ID)
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
    
    // Mark refs as initialized to prevent re-initialization
    refsInitializedRef.current = true
    
    console.log('🔄 Restored refs (ONCE on mount):', {
      storedProgress: currentProgress.progress,
      estimatedAudioPlays,
      baseAudioPlaysRef: baseAudioPlaysRef.current,
      estimatedStartTime: new Date(estimatedStartTime).toISOString(),
      uniqueAudiosPlayed: uniqueAudiosPlayedRef.current.size,
    })
  }, []) // Empty dependency array - only run once on mount

  const calculateProgress = (practiceScore?: number) => {
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID)
    const storedProgress = currentProgress.progress || 0
    
    // Calculate total unique audios played (base + session)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    
    // Audio progress: 30% weight (1.07% per audio, max 30%)
    const audioProgress = Math.min(progressConfig.audioWeight, totalUniqueAudios * progressConfig.audioMultiplier)
    
    // Time progress: 20% weight
    const baseTimeSpent = currentProgress.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    const timeProgress = Math.min(progressConfig.timeWeight, safeTimeSpent * 4) // 1 minute = 4%, max 20%
    
    // Practice progress: 50% weight (if practice exists)
    let practiceProgress = 0
    if (practiceScore !== undefined) {
      practiceProgress = (practiceScore / 100) * progressConfig.practiceWeight
    }
    
    // Calculate total progress
    let calculatedProgress = audioProgress + timeProgress + practiceProgress
    
    // Special case: If practice score >= 70, force progress to 100%
    if (practiceScore !== undefined && practiceScore >= 70) {
      calculatedProgress = 100
    }
    
    // Prevent progress from decreasing - always use max of stored and calculated
    const totalProgress = Math.max(storedProgress, calculatedProgress)
    
    // Round to whole number
    const roundedProgress = Math.round(totalProgress)
    
    console.log('📊 Progress calculation:', {
      totalUniqueAudios,
      audioProgress: audioProgress.toFixed(2),
      totalTimeSpent,
      timeProgress: timeProgress.toFixed(2),
      practiceScore,
      practiceProgress: practiceProgress.toFixed(2),
      calculatedProgress: calculatedProgress.toFixed(2),
      storedProgress,
      totalProgress: roundedProgress,
    })
    
    return roundedProgress
  }

  const handleAnswerSelect = (index: number) => {
    if (showFeedback || isCompleted) return
    setSelectedAnswer(index)
    setShowFeedback(true)
    const isCorrect = index === practiceExercises[currentExercise].correct
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const handleNext = () => {
    if (currentExercise < practiceExercises.length - 1) {
      setCurrentExercise(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // Calculate practice score percentage
      const practiceScorePercent = Math.round((score.correct / score.total) * 100)
      const isPracticePassed = practiceScorePercent >= 70 // Match pattern: >= 70 for completion
      
      // Always show completion screen when practice is finished, regardless of score
      setIsCompleted(true)
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
  }

  const handleRestart = () => {
    setCurrentExercise(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore({ correct: 0, total: 0 })
    setIsCompleted(false)
    setPracticeScore(undefined)
    setPracticePassed(false)
  }
  
  // Check if practice was already completed (score exists) but progress doesn't reflect it
  useEffect(() => {
    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Case 1: Practice score exists and >= 70, but progress is not 100% - FORCE to 100%
    if (currentProgress.score !== undefined && currentProgress.score >= 70 && currentProgress.progress < 100) {
      console.log('🔍 Practice score >= 70 but progress is not 100%, forcing to 100%...', {
        storedProgress: currentProgress.progress,
        storedScore: currentProgress.score,
      })
      
      // Force progress to 100% when practice is completed (score >= 70)
      const shouldBeCompleted = currentProgress.score >= 70
      const newStatus = shouldBeCompleted ? 'COMPLETED' : currentProgress.status
      
      console.log('🔄 Forcing progress to 100% because practice score >= 70:', {
        newProgress: 100,
        newStatus,
        storedScore: currentProgress.score,
        oldProgress: currentProgress.progress,
      })
      
      // Always update to 100% if score >= 70
      updateLessonProgress(LESSON_ID, 100, newStatus, currentProgress.score, currentProgress.timeSpent)
    }
  }, [getLessonProgress, updateLessonProgress])
  
  // Listen for progress updates (including from backend sync) and fix if needed
  useEffect(() => {
    const handleProgressUpdate = () => {
      const currentProgress = getLessonProgress(LESSON_ID)
      // If practice score >= 70 but progress is not 100%, force it to 100%
      if (currentProgress.score !== undefined && currentProgress.score >= 70 && currentProgress.progress < 100) {
        console.log('🔧 Progress update detected - fixing progress to 100% (score >= 70)')
        updateLessonProgress(LESSON_ID, 100, 'COMPLETED', currentProgress.score, currentProgress.timeSpent)
      }
    }
    
    window.addEventListener('lessonProgressUpdated', handleProgressUpdate)
    return () => window.removeEventListener('lessonProgressUpdated', handleProgressUpdate)
  }, [getLessonProgress, updateLessonProgress])
  
  // Check on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentProgress = getLessonProgress(LESSON_ID)
        // If practice score >= 70 but progress is not 100%, force it to 100%
        if (currentProgress.score !== undefined && currentProgress.score >= 70 && currentProgress.progress < 100) {
          console.log('👁️ Page visible - fixing progress to 100% (score >= 70)')
          updateLessonProgress(LESSON_ID, 100, 'COMPLETED', currentProgress.score, currentProgress.timeSpent)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [getLessonProgress, updateLessonProgress])

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
    const baseTimeSpent = currentProgress.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    
    // Get practice score from state or stored progress
    const currentPracticeScore = practiceScore !== undefined ? practiceScore : (currentProgress.score !== undefined ? currentProgress.score : undefined)
    const progress = calculateProgress(currentPracticeScore)
    
    // Set status to COMPLETED when progress reaches 100%, otherwise preserve existing status or set to IN_PROGRESS
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
    
    console.log('📊 Progress update:', {
      progress,
      status,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, currentPracticeScore, safeTimeSpent)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">
          Basic Adjectives
        </h1>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setMode('learn')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'learn'
                ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'practice'
                ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Practice
          </button>
        </div>

        {/* Learn Mode */}
        {mode === 'learn' && (
          <div className="space-y-8">
            {/* Key Rule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📝 How Adjectives Work in Kurdish
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  In Kurdish, adjectives come <span className="font-bold text-kurdish-red">after</span> the noun, not before it like in English.
                </p>
                <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                <div className="bg-white p-4 rounded-lg border-2 border-kurdish-red">
                  <p className="text-center font-mono text-lg">
                    Noun + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Ending</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Adjective</span>
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-semibold">Example:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><span className="font-bold">mal</span> (house) → <span className="bg-yellow-200 px-2 py-1 rounded">malê</span> (for singular)</li>
                    <li><span className="bg-yellow-200 px-2 py-1 rounded">malê</span> + <span className="font-bold">mezin</span> (big)</li>
                    <li>= <span className="font-bold">malê mezin</span> (big house)</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Remember: <span className="font-bold">Noun + Ending + Adjective</span> - the opposite of English! Some nouns don't need endings (like "hewa germ" - hot weather).
                </p>
              </div>
            </motion.div>

            {/* Adjectives Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Basic Adjectives Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Category</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjectivesTable.map((adj, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{adj.ku}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">{adj.en}</td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{adj.category}</td>
                        <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{adj.example}</td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{adj.exampleEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Common Mistakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 bg-red-50 border-2 border-red-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⚠️ Common Mistakes
              </h2>
              <div className="space-y-4">
                {commonMistakes.map((mistake, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="font-bold text-red-600">Wrong:</span>{" "}
                          <span className="font-mono bg-red-100 px-2 py-1 rounded">{mistake.wrong}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-bold text-green-600">Correct:</span>{" "}
                          <span className="font-mono text-green-600 font-bold">{mistake.correct}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{mistake.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Examples by Category */}
            {presentTenseExamples.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                ref={(el) => { sectionRefs.current[sectionIndex] = el }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + sectionIndex * 0.1 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.examples.map((example, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-bold text-kurdish-red mb-1">{example.ku}</div>
                          <div className="text-sm text-gray-600">{example.en}</div>
                        </div>
                        {example.audio && (
                          <AudioButton
                            kurdishText={example.audioText || example.ku}
                            phoneticText={example.en.toUpperCase()}
                            label="Listen"
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(example.audioText || example.ku)}.mp3`}
                            onPlay={(audioKey) => handleAudioPlay(audioKey || `example-${sectionIndex}-${index}-${example.ku}`)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Practice Mode */}
        {mode === 'practice' && (
          <div className="max-w-3xl mx-auto">
            {!isCompleted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Practice Exercise</h2>
                  <span className="text-gray-600">
                    Question {currentExercise + 1} of {practiceExercises.length}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-kurdish-red h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentExercise + 1) / practiceExercises.length) * 100}%` }}
                  />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {practiceExercises[currentExercise].question}
                </h3>

                <div className="space-y-3 mb-6">
                  {practiceExercises[currentExercise].options.map((option, index) => {
                    const isSelected = selectedAnswer === index
                    const isCorrect = index === practiceExercises[currentExercise].correct
                    const showResult = showFeedback

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          showResult && isCorrect
                            ? 'bg-green-100 border-2 border-green-500'
                            : showResult && isSelected && !isCorrect
                            ? 'bg-red-100 border-2 border-red-500'
                            : !showResult && isSelected
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {showResult && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <span className="font-medium text-gray-800">{option}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
                  >
                    <p className="font-semibold text-blue-900 mb-2">Explanation:</p>
                    <p className="text-blue-800">{practiceExercises[currentExercise].explanation}</p>
                  </motion.div>
                )}

                {showFeedback && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={handleNext}
                    className="w-full bg-kurdish-red text-white py-3 rounded-lg font-semibold hover:bg-kurdish-red/90 transition-colors"
                  >
                    {currentExercise < practiceExercises.length - 1 ? 'Next Question' : 'Finish'}
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 text-center"
              >
                {practicePassed ? (
                  <>
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                    <p className="text-lg text-gray-600 mb-2">
                      You got <span className="font-bold text-kurdish-red">{score.correct}</span> out of{' '}
                      <span className="font-bold">{score.total}</span> correct!
                    </p>
                    <p className="text-4xl font-bold text-green-600 mb-2">
                      {practiceScore}%
                    </p>
                    <p className="text-sm text-gray-600 mb-6">Great job! You passed the practice.</p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                    <p className="text-lg text-gray-600 mb-2">
                      You got <span className="font-bold text-kurdish-red">{score.correct}</span> out of{' '}
                      <span className="font-bold">{score.total}</span> correct!
                    </p>
                    <p className="text-4xl font-bold text-orange-600 mb-2">
                      {practiceScore}%
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                      You need at least 70% to complete this lesson. Keep practicing!
                    </p>
                  </>
                )}
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 bg-kurdish-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-kurdish-red/90 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </motion.div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  )
}
