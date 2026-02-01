"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const commonVerbs = [
  { ku: "bûn", en: "to be", icon: "👤" },
  { ku: "kirin", en: "to do/make", icon: "🔨" },
  { ku: "çûn", en: "to go", icon: "🚶" },
  { ku: "hatin", en: "to come", icon: "🏃" },
  { ku: "xwarin", en: "to eat", icon: "🍽️" },
  { ku: "vexwarin", en: "to drink", icon: "🥤" },
  { ku: "xwendin", en: "to read", icon: "📖" },
  { ku: "nivîsîn", en: "to write", icon: "✍️" },
  { ku: "axaftin", en: "to speak", icon: "💬" },
  { ku: "bihîstin", en: "to hear", icon: "👂" },
  { ku: "dîtin", en: "to see", icon: "👁️" },
  { ku: "raketin", en: "to sleep", icon: "😴" },
  { ku: "hişyarbûn", en: "to wake up", icon: "⏰" },
  { ku: "rûniştin", en: "to sit", icon: "🪑" },
  { ku: "rabûn", en: "to stand", icon: "🧍" },
  { ku: "meşîn", en: "to walk", icon: "🚶" },
  { ku: "revîn", en: "to run", icon: "🏃" },
  { ku: "girtin", en: "to hold", icon: "✋" },
  { ku: "dayîn", en: "to give", icon: "🎁" },
  { ku: "stendin", en: "to take", icon: "🤲" },
  { ku: "kirîn", en: "to buy", icon: "🛒" },
  { ku: "firotin", en: "to sell", icon: "💰" },
  { ku: "xebat", en: "to work", icon: "💼" },
  { ku: "xwendin", en: "to study", icon: "📚" },
  { ku: "lîstin", en: "to play", icon: "🎮" }
]

const verbConjugations = [
  {
    verb: "kirin",
    meaning: "to do/make",
    conjugations: [
      { pronoun: "ez", form: "dikim", en: "I do" },
      { pronoun: "tu", form: "dikî", en: "you do" },
      { pronoun: "ew", form: "dike", en: "he/she does" },
      { pronoun: "em", form: "dikin", en: "we do" },
      { pronoun: "hûn", form: "dikin", en: "you do" },
      { pronoun: "ew", form: "dikin", en: "they do" }
    ]
  },
  {
    verb: "çûn",
    meaning: "to go",
    conjugations: [
      { pronoun: "ez", form: "diçim", en: "I go" },
      { pronoun: "tu", form: "diçî", en: "you go" },
      { pronoun: "ew", form: "diçe", en: "he/she goes" },
      { pronoun: "em", form: "diçin", en: "we go" },
      { pronoun: "hûn", form: "diçin", en: "you go" },
      { pronoun: "ew", form: "diçin", en: "they go" }
    ]
  }
]

const practiceExercises = [
  {
    question: "What does 'kirin' mean?",
    options: ["to go", "to do/make", "to eat", "to come"],
    correct: 1,
    explanation: "'kirin' means 'to do' or 'to make' in Kurdish."
  },
  {
    question: "What does 'çûn' mean?",
    options: ["to go", "to come", "to see", "to do"],
    correct: 0,
    explanation: "'çûn' means 'to go' in Kurdish."
  },
  {
    question: "What is 'I do' in Kurdish?",
    options: ["dikim", "diçim", "dixwim", "dibînim"],
    correct: 0,
    explanation: "'I do' is 'dikim' (from the verb 'kirin' - to do/make)."
  },
  {
    question: "What is 'I go' in Kurdish?",
    options: ["dikim", "diçim", "dixwim", "dibînim"],
    correct: 1,
    explanation: "'I go' is 'diçim' (from the verb 'çûn' - to go)."
  },
  {
    question: "What does 'xwarin' mean?",
    options: ["to drink", "to eat", "to read", "to write"],
    correct: 1,
    explanation: "'xwarin' means 'to eat' in Kurdish."
  },
  {
    question: "What does 'vexwarin' mean?",
    options: ["to eat", "to drink", "to read", "to write"],
    correct: 1,
    explanation: "'vexwarin' means 'to drink' in Kurdish."
  },
  {
    question: "What is 'he/she does' in Kurdish?",
    options: ["dikim", "dikî", "dike", "dikin"],
    correct: 2,
    explanation: "'he/she does' is 'dike' (from 'kirin' - to do/make, with 'ew' pronoun)."
  },
  {
    question: "What is 'he/she goes' in Kurdish?",
    options: ["diçim", "diçî", "diçe", "diçin"],
    correct: 2,
    explanation: "'he/she goes' is 'diçe' (from 'çûn' - to go, with 'ew' pronoun)."
  },
  {
    question: "What does 'axaftin' mean?",
    options: ["to hear", "to speak", "to see", "to listen"],
    correct: 1,
    explanation: "'axaftin' means 'to speak' in Kurdish."
  },
  {
    question: "What does 'bihîstin' mean?",
    options: ["to speak", "to hear", "to see", "to listen"],
    correct: 1,
    explanation: "'bihîstin' means 'to hear' in Kurdish."
  },
  {
    question: "What is 'we do' in Kurdish?",
    options: ["dikim", "dikî", "dike", "dikin"],
    correct: 3,
    explanation: "'we do' is 'dikin' (from 'kirin' - to do/make, with 'em' pronoun)."
  },
  {
    question: "What is 'we go' in Kurdish?",
    options: ["diçim", "diçî", "diçe", "diçin"],
    correct: 3,
    explanation: "'we go' is 'diçin' (from 'çûn' - to go, with 'em' pronoun)."
  },
  {
    question: "What does 'raketin' mean?",
    options: ["to wake up", "to sleep", "to sit", "to stand"],
    correct: 1,
    explanation: "'raketin' means 'to sleep' in Kurdish."
  },
  {
    question: "What does 'hişyarbûn' mean?",
    options: ["to sleep", "to wake up", "to sit", "to stand"],
    correct: 1,
    explanation: "'hişyarbûn' means 'to wake up' in Kurdish."
  },
  {
    question: "What does 'girtin' mean?",
    options: ["to give", "to take", "to hold", "to buy"],
    correct: 2,
    explanation: "'girtin' means 'to hold' in Kurdish."
  },
  {
    question: "What does 'dayîn' mean?",
    options: ["to take", "to give", "to hold", "to buy"],
    correct: 1,
    explanation: "'dayîn' means 'to give' in Kurdish."
  },
  {
    question: "What does 'kirîn' mean?",
    options: ["to sell", "to buy", "to give", "to take"],
    correct: 1,
    explanation: "'kirîn' means 'to buy' in Kurdish."
  },
  {
    question: "What does 'firotin' mean?",
    options: ["to buy", "to sell", "to give", "to take"],
    correct: 1,
    explanation: "'firotin' means 'to sell' in Kurdish."
  },
  {
    question: "What does 'xebat' mean?",
    options: ["to study", "to work", "to play", "to read"],
    correct: 1,
    explanation: "'xebat' means 'to work' in Kurdish."
  },
  {
    question: "What does 'lîstin' mean?",
    options: ["to work", "to study", "to play", "to read"],
    correct: 2,
    explanation: "'lîstin' means 'to play' in Kurdish."
  }
]

const LESSON_ID = '14' // Common Verbs lesson ID

export default function VerbsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 36, // 24 unique verbs (xwendin appears twice but counted once) + 12 conjugations (2 verbs × 6)
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 0.83, // 30% / 36 audios ≈ 0.83% per audio
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

  // Initialize refs from stored progress - ONLY ONCE on mount
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Common Verbs page mounted, initial progress:', {
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
    
    // Audio progress: 30% weight (0.83% per audio, max 30%)
    const audioProgress = Math.min(progressConfig.audioWeight, totalUniqueAudios * progressConfig.audioMultiplier)
    
    // Time progress: 20% weight
    const baseTimeSpent = currentProgress.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    const timeProgress = Math.min(progressConfig.timeWeight, safeTimeSpent * 0.2) // 1 minute = 0.2%, max 20%
    
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

  const handleRestart = () => {
    setCurrentExercise(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore({ correct: 0, total: 0 })
    setIsCompleted(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Common Verbs</h1>

        <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
          Essential action words for daily conversations and activities in Kurdish.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setMode('learn')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                mode === 'learn'
                  ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => setMode('practice')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                mode === 'practice'
                  ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Practice
            </button>
          </div>
        </div>

        {mode === 'learn' ? (
          <>
            {/* Common Verbs */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" style={{ display: 'grid' }}>
            {commonVerbs.map((verb, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}}
                transition={{ delay: index * 0.03 }}
                className="card p-5 min-w-0"
              >
                {/* Kurdish Word - Center */}
                <div className="text-xl font-bold text-gray-800 text-center mb-2">
                  {verb.ku.charAt(0).toUpperCase() + verb.ku.slice(1)}
                </div>
                
                {/* English Translation - Center */}
                <div className="text-gray-600 text-center mb-4">{verb.en}</div>
                
                {/* Bottom Row: Audio Button (Left) + Icon (Right) */}
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={verb.ku} 
                    phoneticText={verb.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${verb.ku}`)}
                  />
                  <div className="text-2xl">{verb.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Verb Conjugations */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-lg">📝</span>
            Verb Conjugations
          </h2>
          
          <div className="space-y-6">
            {verbConjugations.map((verb, index) => (
              <div key={index} className="card p-6">
                <h3 className="text-lg font-bold text-kurdish-red mb-4 text-center">
                  {verb.verb} - {verb.meaning}
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {verb.conjugations.map((conjugation, conjIndex) => (
                    <motion.div 
                      key={conjIndex} 
                      initial={{opacity:0, y:10}} 
                      animate={{opacity:1, y:0}}
                      transition={{ delay: 0.5 + conjIndex * 0.05 }}
                      className="card p-4"
                    >
                      <div className="text-center mb-2">
                        <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow mb-2">
                          <span className="text-sm font-bold text-kurdish-red">{conjugation.pronoun}</span>
                        </div>
                        <div className="font-bold text-gray-800">{conjugation.form.charAt(0).toUpperCase() + conjugation.form.slice(1)}</div>
                        <div className="text-gray-600 text-sm mb-3">{conjugation.en}</div>
                      </div>
                      <AudioButton 
                        kurdishText={conjugation.form} 
                        phoneticText={conjugation.en.toUpperCase()} 
                        label="Listen" 
                        size="small"
                        onPlay={(audioKey) => handleAudioPlay(audioKey || `conjugation-${verb.verb}-${conjugation.pronoun}-${conjugation.form}`)}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Verb Usage Tips */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Verb Usage Tips</h3>
          <div className="space-y-3 text-sm text-gray-700 max-w-3xl mx-auto">
            <p>• <strong>Present Tense:</strong> Add "di-" prefix to verb stem</p>
            <p>• <strong>Past Tense:</strong> Add "kir" suffix to verb stem</p>
            <p>• <strong>Future Tense:</strong> Use "dê" before the verb</p>
            <p>• <strong>Negation:</strong> Add "na-" prefix for negative forms</p>
            <p>• <strong>Compound Verbs:</strong> Many verbs are formed with "kirin" (to do)</p>
            <p>• <strong>Irregular Verbs:</strong> Some verbs like "bûn" (to be) have irregular forms</p>
          </div>
        </motion.div>
          </>
        ) : (
          /* Practice Mode */
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

