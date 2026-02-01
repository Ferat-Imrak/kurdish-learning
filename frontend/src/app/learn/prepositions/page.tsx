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

const LESSON_ID = '22' // Prepositions lesson ID

// Prepositions reference table
const prepositionsTable = [
  { ku: "li", en: "at/in/on", example: "li malê", exampleEn: "at home", usage: "Location - where something is" },
  { ku: "ji", en: "from", example: "ji Kurdistanê", exampleEn: "from Kurdistan", usage: "Origin or source" },
  { ku: "bi", en: "with", example: "bi min re", exampleEn: "with me", usage: "Accompaniment (needs 're' after pronoun)" },
  { ku: "bo", en: "for", example: "bo te", exampleEn: "for you", usage: "Purpose or recipient" },
  { ku: "ber", en: "before/in front of", example: "ber malê", exampleEn: "in front of the house", usage: "Position - in front" },
  { ku: "paş", en: "behind/after", example: "paş malê", exampleEn: "behind the house", usage: "Position - behind or time after" },
  { ku: "di...de", en: "in/inside", example: "di odeyê de", exampleEn: "in the room", usage: "Inside something (wraps around noun)" },
  { ku: "li ser", en: "on/on top of", example: "li ser maseyê", exampleEn: "on the table", usage: "Position - on top" }
]

const presentTenseExamples = [
  {
    title: 'Location - "li" (at/in/on)',
    examples: [
      { ku: "Li malê.", en: "at home", audio: true, audioText: "Li malê." },
      { ku: "Li dibistanê.", en: "at school", audio: true, audioText: "Li dibistanê." },
      { ku: "Li bazarê.", en: "at the market", audio: true, audioText: "Li bazarê." },
      { ku: "Ez li malê me.", en: "I am at home", audio: true, audioText: "Ez li malê me" },
      { ku: "Tu li ku yî?", en: "Where are you?", audio: true },
      { ku: "Ew li Kurdistanê ye.", en: "He/She is in Kurdistan", audio: true, audioText: "Ew li Kurdistanê ye" }
    ]
  },
  {
    title: 'Origin - "ji" (from)',
    examples: [
      { ku: "Ji Kurdistanê.", en: "from Kurdistan", audio: true, audioText: "Ji Kurdistanê." },
      { ku: "Ji malê.", en: "from home", audio: true, audioText: "Ji malê." },
      { ku: "Ji bazarê.", en: "from the market", audio: true, audioText: "Ji bazarê." },
      { ku: "Ez ji Kurdistanê me", en: "I am from Kurdistan", audio: true },
      { ku: "Tu ji ku yî?", en: "Where are you from?", audio: true },
      { ku: "Ew ji malê tê", en: "He/She comes from home", audio: true }
    ]
  },
  {
    title: 'Accompaniment - "bi...re" (with)',
    examples: [
      { ku: "Bi min re.", en: "with me", audio: true, audioText: "Bi min re." },
      { ku: "Bi te re.", en: "with you", audio: true, audioText: "Bi te re." },
      { ku: "Bi wî re.", en: "with him", audio: true, audioText: "Bi wî re." },
      { ku: "Bi wê re.", en: "with her", audio: true, audioText: "Bi wê re." },
      { ku: "Ez bi te re diçim.", en: "I go with you", audio: true, audioText: "Ez bi te re diçim" },
      { ku: "Ew bi kurên xwe re ye.", en: "He is with his sons", audio: true, audioText: "Ew bi kurên xwe re ye" }
    ]
  },
  {
    title: 'Purpose - "bo" (for)',
    examples: [
      { ku: "Bo te.", en: "for you", audio: true, audioText: "Bo te." },
      { ku: "Bo min.", en: "for me", audio: true, audioText: "Bo min." },
      { ku: "Bo me.", en: "for us", audio: true, audioText: "Bo me." },
      { ku: "Ez bo te kar dikim", en: "I work for you", audio: true },
      { ku: "Ev pirtûk bo te ye", en: "This book is for you", audio: true }
    ]
  },
  {
    title: 'Position - "ber" and "paş" (before/behind)',
    examples: [
      { ku: "Ber malê.", en: "in front of the house", audio: true, audioText: "Ber malê." },
      { ku: "Paş malê.", en: "behind the house", audio: true, audioText: "Paş malê." },
      { ku: "Ez ber malê me.", en: "I am in front of the house", audio: true, audioText: "Ez ber malê me" },
      { ku: "Ew paş darê ye.", en: "He/She is behind the tree", audio: true, audioText: "Ew paş darê ye" }
    ]
  },
  {
    title: 'Inside - "di...de" (in/inside)',
    examples: [
      { ku: "Di odeyê de.", en: "in the room", audio: true, audioText: "Di odeyê de." },
      { ku: "Di malê de.", en: "in the house", audio: true, audioText: "Di malê de." },
      { ku: "Di dibistanê de.", en: "in the school", audio: true, audioText: "Di dibistanê de." },
      { ku: "Ez di odeyê de me.", en: "I am in the room", audio: true, audioText: "Ez di odeyê de me" },
      { ku: "Pirtûk di odeyê de ye.", en: "The book is in the room", audio: true, audioText: "Pirtûk di odeyê de ye" }
    ]
  },
  {
    title: 'On Top - "li ser" (on)',
    examples: [
      { ku: "Li ser maseyê.", en: "on the table", audio: true, audioText: "Li ser maseyê." },
      { ku: "Li ser kursiyê.", en: "on the chair", audio: true, audioText: "Li ser kursiyê." },
      { ku: "Pirtûk li ser maseyê ye.", en: "The book is on the table", audio: true, audioText: "Pirtûk li ser maseyê ye" },
      { ku: "Ez li ser kursiyê rûniştim.", en: "I sat on the chair", audio: true, audioText: "Ez li ser kursiyê rûniştim" }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Ez malê me",
    correct: "Ez li malê me",
    explanation: "Don't forget 'li' when talking about location! 'li malê' means 'at home'."
  },
  {
    wrong: "Ez Kurdistanê me",
    correct: "Ez ji Kurdistanê me",
    explanation: "Use 'ji' (from) when talking about origin. 'ji Kurdistanê' means 'from Kurdistan'."
  },
  {
    wrong: "bi min",
    correct: "bi min re",
    explanation: "When using 'bi' (with) with pronouns, you need 're' after: 'bi min re' (with me), not just 'bi min'."
  },
  {
    wrong: "di odeyê",
    correct: "di odeyê de",
    explanation: "'di...de' wraps around the noun. You need both 'di' before and 'de' after: 'di odeyê de' (in the room)."
  },
  {
    wrong: "li ser mase",
    correct: "li ser maseyê",
    explanation: "Don't forget the ending on the noun! 'mase' becomes 'maseyê' (the table) after 'li ser'."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'at home' in Kurdish?",
    options: ["malê", "li malê", "ji malê", "bo malê"],
    correct: 1,
    explanation: "Use 'li' for location: li malê (at home). 'ji' = from, 'bo' = for."
  },
  {
    question: "What preposition means 'from'?",
    options: ["li", "ji", "bi", "bo"],
    correct: 1,
    explanation: "'ji' means 'from'. 'li' = at/in, 'bi' = with, 'bo' = for."
  },
  {
    question: "How do you say 'with me'?",
    options: ["bi min", "bi min re", "li min", "ji min"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: bi min re (with me). You need both 'bi' and 're'."
  },
  {
    question: "How do you say 'I am from Kurdistan'?",
    options: ["Ez Kurdistanê me", "Ez li Kurdistanê me", "Ez ji Kurdistanê me", "Ez bo Kurdistanê me"],
    correct: 2,
    explanation: "Use 'ji' for origin: Ez ji Kurdistanê me (I am from Kurdistan)."
  },
  {
    question: "What is 'in the room' in Kurdish?",
    options: ["li odeyê", "ji odeyê", "di odeyê de", "bo odeyê"],
    correct: 2,
    explanation: "Use 'di...de' for inside: di odeyê de (in the room). It wraps around the noun."
  },
  {
    question: "How do you say 'on the table'?",
    options: ["li maseyê", "li ser maseyê", "di maseyê de", "ji maseyê"],
    correct: 1,
    explanation: "Use 'li ser' for on top: li ser maseyê (on the table)."
  },
  {
    question: "What preposition means 'for'?",
    options: ["li", "ji", "bi", "bo"],
    correct: 3,
    explanation: "'bo' means 'for'. 'li' = at/in, 'ji' = from, 'bi' = with."
  },
  {
    question: "How do you say 'in front of the house'?",
    options: ["li malê", "ber malê", "paş malê", "di malê de"],
    correct: 1,
    explanation: "Use 'ber' for in front: ber malê (in front of the house)."
  },
  {
    question: "What is 'behind the house'?",
    options: ["ber malê", "paş malê", "li malê", "ji malê"],
    correct: 1,
    explanation: "Use 'paş' for behind: paş malê (behind the house)."
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu kû yî?", "Tu li kû yî?", "Tu ji kû yî?", "Tu bo kû yî?"],
    correct: 1,
    explanation: "Use 'li kû' for location: Tu li kû yî? (Where are you?). 'kû' = where."
  },
  {
    question: "How do you say 'I go with you'?",
    options: ["Ez bi te diçim", "Ez bi te re diçim", "Ez li te diçim", "Ez ji te diçim"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: Ez bi te re diçim (I go with you)."
  },
  {
    question: "What is 'for you' in Kurdish?",
    options: ["li te", "ji te", "bi te", "bo te"],
    correct: 3,
    explanation: "Use 'bo' for for: bo te (for you)."
  },
  {
    question: "How do you say 'The book is on the table'?",
    options: ["Pirtûk li maseyê ye", "Pirtûk li ser maseyê ye", "Pirtûk di maseyê de ye", "Pirtûk ji maseyê ye"],
    correct: 1,
    explanation: "Use 'li ser' for on: Pirtûk li ser maseyê ye (The book is on the table)."
  },
  {
    question: "What preposition is used for 'inside'?",
    options: ["li", "di...de", "ber", "paş"],
    correct: 1,
    explanation: "'di...de' means 'in/inside'. It wraps around the noun: di odeyê de (in the room)."
  },
  {
    question: "How do you say 'Where are you from?'?",
    options: ["Tu kû yî?", "Tu li kû yî?", "Tu ji kû yî?", "Tu bo kû yî?"],
    correct: 2,
    explanation: "Use 'ji kû' for origin: Tu ji kû yî? (Where are you from?)."
  },
  {
    question: "What is the correct form for 'with him'?",
    options: ["bi wî", "bi wî re", "li wî", "ji wî"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: bi wî re (with him)."
  },
  {
    question: "How do you say 'I am in the room'?",
    options: ["Ez li odeyê me", "Ez di odeyê de me", "Ez ji odeyê me", "Ez bo odeyê me"],
    correct: 1,
    explanation: "Use 'di...de' for inside: Ez di odeyê de me (I am in the room)."
  },
  {
    question: "What preposition means 'before/in front of'?",
    options: ["ber", "paş", "li", "ji"],
    correct: 0,
    explanation: "'ber' means 'before' or 'in front of'. 'paş' = behind, 'li' = at/in, 'ji' = from."
  },
  {
    question: "How do you say 'behind the tree'?",
    options: ["ber darê", "paş darê", "li darê", "di darê de"],
    correct: 1,
    explanation: "Use 'paş' for behind: paş darê (behind the tree)."
  },
  {
    question: "What is the structure for 'di...de'?",
    options: ["di + noun", "noun + de", "di + noun + de", "de + noun + di"],
    correct: 2,
    explanation: "'di...de' wraps around the noun: 'di' comes before and 'de' comes after. Example: di odeyê de (in the room)."
  }
]

export default function PrepositionsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 36, // Counted from presentTenseExamples sections (6+6+6+5+4+5+4)
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
    console.log('🚀 Prepositions page mounted, initial progress:', {
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

  // Process examples to add audioFile paths
  const examplesWithAudio = presentTenseExamples.map(section => ({
    ...section,
    examples: section.examples.map(example => {
      if (example.audio) {
        // Use audioText if provided (for uppercase consistency), otherwise use ku
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
          Prepositions
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
              className="card p-6 mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Prepositions Work in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Prepositions in Kurdish work similarly to English, but some have special rules. They usually come <span className="font-bold text-kurdish-red">before</span> the noun.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-teal-200">
                  <p className="font-semibold mb-3 text-gray-800">Important Rules:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-bold text-kurdish-red">"li"</span> = at/in/on (location)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">li malê</span> (at home)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"ji"</span> = from (origin)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">ji Kurdistanê</span> (from Kurdistan)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"bi...re"</span> = with (needs "re" after pronoun)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">bi min re</span> (with me)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"di...de"</span> = in/inside (wraps around noun)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">di odeyê de</span> (in the room)</p>
                    </li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Remember: "bi" needs "re" with pronouns (bi min re), and "di...de" wraps around the noun (di odeyê de). Don't forget the ending on the noun!
                </p>
              </div>
            </motion.div>

            {/* Prepositions Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Prepositions Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prepositionsTable.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{row.ku}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.en}</td>
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
