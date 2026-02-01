"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

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

const LESSON_ID = '19' // Articles & Plurals lesson ID

// Article rules reference table
const articleRules = [
  { ending: "-ek", meaning: "a/an", example: "pirtûk → pirtûkek", exampleEn: "book → a book", usage: "Indefinite (one thing, not specific)" },
  { ending: "-ê", meaning: "the", example: "pirtûk → pirtûkê", exampleEn: "book → the book", usage: "Definite (specific thing)" },
  { ending: "-an", meaning: "plural", example: "mal → malan", exampleEn: "house → houses", usage: "More than one (some nouns)" },
  { ending: "-ên", meaning: "plural", example: "pirtûk → pirtûkên", exampleEn: "book → books", usage: "More than one (most nouns)" }
]

const presentTenseExamples = [
  {
    title: 'Indefinite Article - "a/an" (-ek)',
    examples: [
      { ku: "Pirtûkek", en: "a book", audio: true, audioText: "Pirtûkek." },
      { ku: "Pisîkek", en: "a cat", audio: true, audioText: "Pisîkek." },
      { ku: "Malek", en: "a house", audio: true, audioText: "Malek." },
      { ku: "Xwendekarek", en: "a student", audio: true, audioText: "Xwendekarek." },
      { ku: "Çayek", en: "a tea", audio: true, audioText: "Çayek." },
      { ku: "Ez pirtûkek dixwînim", en: "I read a book", audio: true }
    ]
  },
  {
    title: 'Definite Article - "the" (-ê)',
    examples: [
      { ku: "Malê", en: "the house", audio: true, audioText: "Malê." },
      { ku: "Pirtûkê", en: "the book", audio: true, audioText: "Pirtûkê." },
      { ku: "Pisîkê", en: "the cat", audio: true, audioText: "Pisîkê." },
      { ku: "Çayê", en: "the tea", audio: true, audioText: "Çayê." },
      { ku: "Nanê", en: "the bread", audio: true, audioText: "Nanê." },
      { ku: "Ez pirtûkê dixwînim.", en: "I read the book", audio: true, audioText: "Ez pirtûkê dixwînim" }
    ]
  },
  {
    title: 'This and That (ev/ew)',
    examples: [
      { ku: "Ev pirtûk.", en: "this book", audio: true, audioText: "Ev pirtûk." },
      { ku: "Ew pisîk.", en: "that cat", audio: true, audioText: "Ew pisîk." },
      { ku: "Ev mal.", en: "this house", audio: true, audioText: "Ev mal." },
      { ku: "Ew av.", en: "that water", audio: true, audioText: "Ew av." },
      { ku: "Ev nan.", en: "this bread", audio: true, audioText: "Ev nan." },
      { ku: "Ev pirtûk xweş e.", en: "This book is good", audio: true, audioText: "Ev pirtûk xweş e" }
    ]
  },
  {
    title: 'Making Plurals',
    examples: [
      { ku: "mal → malan", en: "house → houses", audio: true, audioText: "malan" },
      { ku: "pirtûk → pirtûkên", en: "book → books", audio: true, audioText: "pirtûkên" },
      { ku: "xwendekar → xwendekarên", en: "student → students", audio: true, audioText: "xwendekarên" },
      { ku: "pisîk → pisîkan", en: "cat → cats", audio: true, audioText: "pisîkan" },
      { ku: "çav → çavên", en: "eye → eyes", audio: true, audioText: "çavên" },
      { ku: "Ez pirtûkên xwe dixwînim.", en: "I read my books", audio: true, audioText: "Ez pirtûkên xwe dixwînim" }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "pirtûk ek",
    correct: "pirtûkek",
    explanation: "The ending '-ek' is attached directly to the noun, not a separate word."
  },
  {
    wrong: "pirtûk ê",
    correct: "pirtûkê",
    explanation: "The ending '-ê' is attached directly to the noun, not a separate word."
  },
  {
    wrong: "malên",
    correct: "malan",
    explanation: "Some nouns use '-an' for plural, not '-ên'. 'mal' (house) becomes 'malan' (houses)."
  },
  {
    wrong: "ev pirtûkê",
    correct: "ev pirtûk",
    explanation: "When using 'ev' (this) or 'ew' (that), don't add '-ê'. Just use the noun: 'ev pirtûk' (this book)."
  },
  {
    wrong: "pirtûkekê",
    correct: "pirtûkek or pirtûkê",
    explanation: "You can't use both '-ek' and '-ê' together. Use '-ek' for 'a' or '-ê' for 'the', not both."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'a book' in Kurdish?",
    options: ["pirtûk", "pirtûkek", "pirtûkê", "pirtûkên"],
    correct: 1,
    explanation: "Add '-ek' to the noun: pirtûk → pirtûkek (a book)"
  },
  {
    question: "How do you say 'the house' in Kurdish?",
    options: ["mal", "malek", "malê", "malan"],
    correct: 2,
    explanation: "Add '-ê' to the noun: mal → malê (the house)"
  },
  {
    question: "What ending means 'a' or 'an'?",
    options: ["-ek", "-ê", "-an", "-ên"],
    correct: 0,
    explanation: "'-ek' means 'a' or 'an' (indefinite article). '-ê' means 'the' (definite)."
  },
  {
    question: "How do you make 'book' plural?",
    options: ["pirtûkan", "pirtûkên", "pirtûkek", "pirtûkê"],
    correct: 1,
    explanation: "Most nouns use '-ên' for plural: pirtûk → pirtûkên (books)"
  },
  {
    question: "How do you say 'this book'?",
    options: ["ev pirtûk", "ev pirtûkê", "ev pirtûkek", "ev pirtûkên"],
    correct: 0,
    explanation: "With 'ev' (this) or 'ew' (that), use the noun without any ending: ev pirtûk"
  },
  {
    question: "What is the plural of 'mal' (house)?",
    options: ["malên", "malan", "malek", "malê"],
    correct: 1,
    explanation: "'mal' uses '-an' for plural: mal → malan (houses)"
  },
  {
    question: "How do you say 'the cat'?",
    options: ["pisîk", "pisîkek", "pisîkê", "pisîkan"],
    correct: 2,
    explanation: "Add '-ê' for 'the': pisîk → pisîkê (the cat)"
  },
  {
    question: "What ending means 'the' (definite)?",
    options: ["-ek", "-ê", "-an", "-ên"],
    correct: 1,
    explanation: "'-ê' means 'the' (definite article). '-ek' means 'a/an' (indefinite)."
  },
  {
    question: "How do you say 'cats' (plural)?",
    options: ["pisîkên", "pisîkan", "pisîkek", "pisîkê"],
    correct: 1,
    explanation: "'pisîk' uses '-an' for plural: pisîk → pisîkan (cats)"
  },
  {
    question: "How do you say 'that cat'?",
    options: ["ew pisîk", "ew pisîkê", "ew pisîkek", "ew pisîkan"],
    correct: 0,
    explanation: "With 'ew' (that), use the noun without any ending: ew pisîk"
  },
  {
    question: "What is 'a student' in Kurdish?",
    options: ["xwendekar", "xwendekarek", "xwendekarê", "xwendekarên"],
    correct: 1,
    explanation: "Add '-ek' for 'a': xwendekar → xwendekarek (a student)"
  },
  {
    question: "How do you say 'students' (plural)?",
    options: ["xwendekaran", "xwendekarên", "xwendekarek", "xwendekarê"],
    correct: 1,
    explanation: "Most nouns use '-ên' for plural: xwendekar → xwendekarên (students)"
  },
  {
    question: "What is the correct way to write 'a house'?",
    options: ["mal ek", "malek", "mal ê", "malê"],
    correct: 1,
    explanation: "The ending is attached directly: malek (not 'mal ek')"
  },
  {
    question: "How do you say 'the books'?",
    options: ["pirtûkên", "pirtûkan", "pirtûkê", "pirtûkek"],
    correct: 0,
    explanation: "Plural form: pirtûk → pirtûkên (books). The plural already implies 'the'."
  },
  {
    question: "What ending is used for most plurals?",
    options: ["-ek", "-ê", "-an", "-ên"],
    correct: 3,
    explanation: "Most nouns use '-ên' for plural. Some use '-an'."
  },
  {
    question: "How do you say 'this house'?",
    options: ["ev mal", "ev malê", "ev malek", "ev malan"],
    correct: 0,
    explanation: "With 'ev' (this), use the noun without ending: ev mal"
  },
  {
    question: "What is 'the tea' in Kurdish?",
    options: ["çay", "çayek", "çayê", "çayan"],
    correct: 2,
    explanation: "Add '-ê' for 'the': çay → çayê (the tea)"
  },
  {
    question: "How do you say 'eyes' (plural)?",
    options: ["çavên", "çavan", "çavek", "çavê"],
    correct: 0,
    explanation: "Most nouns use '-ên' for plural: çav → çavên (eyes)"
  },
  {
    question: "Can you use both '-ek' and '-ê' together?",
    options: ["Yes, always", "No, never", "Sometimes", "Only for plurals"],
    correct: 1,
    explanation: "No! You use either '-ek' (a/an) OR '-ê' (the), never both together."
  },
  {
    question: "What is the correct form for 'I read a book'?",
    options: ["Ez pirtûk dixwînim", "Ez pirtûkek dixwînim", "Ez pirtûkê dixwînim", "Ez pirtûkên dixwînim"],
    correct: 1,
    explanation: "Use 'pirtûkek' (a book) with the article ending: Ez pirtûkek dixwînim"
  }
]

export default function ArticlesPluralsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 24, // Counted from presentTenseExamples sections (6+6+6+6)
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.25, // 30% / 24 audios = 1.25% per audio
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
    console.log('🚀 Articles & Plurals page mounted, initial progress:', {
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
    
    // Audio progress: 30% weight (1.25% per audio, max 30%)
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

  // Process examples to add audioFile paths
  const examplesWithAudio = presentTenseExamples.map(section => ({
    ...section,
    examples: section.examples.map(example => {
      if (example.audio) {
        // Use audioText if provided (for examples with arrows), otherwise use ku
        const textForAudio = example.audioText || example.ku;
        return {
          ...example,
          audioFile: `/audio/kurdish-tts-mp3/grammar/${getAudioFilename(textForAudio)}.mp3`
        };
      }
      return example;
    })
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">
          Articles & Plurals
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

        {mode === 'learn' ? (
          <>
            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Articles & Plurals Work in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, you add endings to nouns to show if they are "a/an", "the", or plural (more than one).
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-green-200">
                  <p className="font-semibold mb-3 text-gray-800">Simple Rules:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-bold text-kurdish-red">"-ek"</span> = "a" or "an" (one thing)
                      <p className="text-kurdish-red font-mono ml-4">Example: pirtûk → <span className="bg-yellow-200 px-2 py-1 rounded">pirtûkek</span> (a book)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"-ê"</span> = "the" (specific thing)
                      <p className="text-kurdish-red font-mono ml-4">Example: pirtûk → <span className="bg-yellow-200 px-2 py-1 rounded">pirtûkê</span> (the book)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"-an" or "-ên"</span> = plural (many things)
                      <p className="text-kurdish-red font-mono ml-4">Example: pirtûk → <span className="bg-yellow-200 px-2 py-1 rounded">pirtûkên</span> (books)</p>
                    </li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Just add the ending to the noun! Kurdish is simpler than English - no separate words like "a" or "the" before the noun.
                </p>
              </div>
            </motion.div>

            {/* Article Rules Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Article & Plural Endings Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Ending</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Meaning</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articleRules.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-mono text-kurdish-red font-bold">{row.ending}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.meaning}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-mono text-kurdish-red">{row.example}</span>
                            <span className="text-gray-600 text-sm mt-1">{row.exampleEn}</span>
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{row.usage}</td>
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
              className="card p-6 mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Common Mistakes to Avoid
              </h2>
              <div className="space-y-4">
                {commonMistakes.map((mistake, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-700 mb-2">
                          <span className="font-bold text-red-600">Wrong:</span>{" "}
                          <span className="font-mono text-red-600 line-through">{mistake.wrong}</span>
                        </p>
                        <p className="text-gray-700 mb-2">
                          <span className="font-bold text-green-600">Correct:</span>{" "}
                          <span className="font-mono text-green-600 font-bold">{mistake.correct}</span>
                        </p>
                        <p className="text-sm text-gray-600">{mistake.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Examples */}
            <div className="space-y-6">
              {examplesWithAudio.map((section, sectionIndex) => (
                <motion.div
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + sectionIndex * 0.1 }}
                  className="card p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                    {section.examples.map((example, exampleIndex) => (
                      <motion.div
                        key={exampleIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sectionIndex * 0.1 + exampleIndex * 0.05 }}
                        className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-bold text-kurdish-red mb-1">{example.ku}</div>
                            <div className="text-sm text-gray-600">{example.en}</div>
                          </div>
                          {example.audio && (
                            <AudioButton
                              kurdishText={example.audioText || example.ku}
                              phoneticText={example.en}
                              audioFile={'audioFile' in example ? (example as any).audioFile : undefined}
                              label="Listen"
                              size="small"
                              onPlay={(audioKey) => handleAudioPlay(audioKey || `example-${sectionIndex}-${exampleIndex}`)}
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
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
                <div className="mb-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Practice Exercise</h2>
                  <span className="text-sm text-gray-600">
                    Question {currentExercise + 1} of {practiceExercises.length}
                  </span>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primaryBlue to-supportLavender h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentExercise + 1) / practiceExercises.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-800 mb-4">
                    {practiceExercises[currentExercise].question}
                  </p>
                  
                  <div className="space-y-3">
                    {practiceExercises[currentExercise].options.map((option, index) => {
                      const isSelected = selectedAnswer === index
                      const isCorrect = index === practiceExercises[currentExercise].correct
                      const showResult = showFeedback
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showFeedback}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            showResult
                              ? isCorrect
                                ? 'bg-green-100 border-green-500'
                                : isSelected
                                ? 'bg-red-100 border-red-500'
                                : 'bg-gray-50 border-gray-300'
                              : isSelected
                              ? 'bg-blue-100 border-blue-500'
                              : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {showResult && isCorrect && (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            )}
                            {showResult && isSelected && !isCorrect && (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span>{option}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-4 rounded-lg bg-blue-50 border border-blue-200"
                  >
                    <p className="text-sm text-gray-700">
                      <strong>Explanation:</strong> {practiceExercises[currentExercise].explanation}
                    </p>
                  </motion.div>
                )}

                {showFeedback && (
                  <button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
                  >
                    {currentExercise < practiceExercises.length - 1 ? 'Next Question' : 'Finish'}
                  </button>
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                    <p className="text-lg text-gray-600 mb-6">
                      You got <span className="font-bold text-kurdish-red">{score.correct}</span> out of{' '}
                      <span className="font-bold">{score.total}</span> correct!
                    </p>
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-green-600">
                        {practiceScore}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Great job! You passed the practice.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                    <p className="text-lg text-gray-600 mb-6">
                      You got <span className="font-bold text-kurdish-red">{score.correct}</span> out of{' '}
                      <span className="font-bold">{score.total}</span> correct!
                    </p>
                    <div className="mb-6">
                      <div className="text-3xl font-bold text-orange-600">
                        {practiceScore}%
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        You need at least 70% to complete this lesson. Keep practicing!
                      </p>
                    </div>
                  </>
                )}
                <button
                  onClick={handleRestart}
                  className="bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
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
