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

const LESSON_ID = '20' // Questions & Negation lesson ID

// Question words reference table
const questionWordsTable = [
  { ku: "kî", en: "who", example: "Ew kî ye?", exampleEn: "Who is he/she?" },
  { ku: "çi", en: "what", example: "Ev çi ye?", exampleEn: "What is this?" },
  { ku: "kû", en: "where", example: "Tu kû yî?", exampleEn: "Where are you?" },
  { ku: "kengî", en: "when", example: "Tu kengî diçî?", exampleEn: "When do you go?" },
  { ku: "çima", en: "why", example: "Tu çima li vir î?", exampleEn: "Why are you here?" },
  { ku: "çawa", en: "how", example: "Tu çawa yî?", exampleEn: "How are you?" }
]

const presentTenseExamples = [
  {
    title: 'Question Words',
    examples: [
      { ku: "kî", en: "who", audio: true },
      { ku: "çi", en: "what", audio: true },
      { ku: "kû", en: "where", audio: true },
      { ku: "kengî", en: "when", audio: true },
      { ku: "çima", en: "why", audio: true },
      { ku: "çawa", en: "how", audio: true }
    ]
  },
  {
    title: 'Asking Questions',
    examples: [
      { ku: "Tu çawa yî?", en: "How are you?", audio: true },
      { ku: "Ev çi ye?", en: "What is this?", audio: true },
      { ku: "Tu kû yî?", en: "Where are you?", audio: true },
      { ku: "Tu çi dixwî?", en: "What do you eat?", audio: true },
      { ku: "Ew kengî hat?", en: "When did he come?", audio: true },
      { ku: "Tu çima li vir î?", en: "Why are you here?", audio: true },
      { ku: "Ew kî ye?", en: "Who is he/she?", audio: true }
    ]
  },
  {
    title: 'Negative Sentences - Verbs',
    examples: [
      { ku: "Ez naxwim.", en: "I don't eat", audio: true, audioText: "Ez naxwim." },
      { ku: "Tu naxwî.", en: "you don't eat", audio: true, audioText: "Tu naxwî." },
      { ku: "Ew naxwe.", en: "he/she doesn't eat", audio: true, audioText: "Ew naxwe." },
      { ku: "Em naxwin.", en: "we don't eat", audio: true, audioText: "Em naxwin." },
      { ku: "Ez naçim.", en: "I don't go", audio: true, audioText: "Ez naçim." },
      { ku: "Tu naxwînî.", en: "you don't read", audio: true, audioText: "Tu naxwînî." },
      { ku: "Ew naxwe.", en: "he/she doesn't eat", audio: true, audioText: "Ew naxwe." }
    ]
  },
  {
    title: 'Negative Sentences - "To Be"',
    examples: [
      { ku: "Ez xwendekar nînim.", en: "I am not a student", audio: true, audioText: "Ez xwendekar nînim" },
      { ku: "Ew malê nîne.", en: "He/She is not at home", audio: true, audioText: "Ew malê nîne" },
      { ku: "Em li derve nînin.", en: "We are not outside", audio: true, audioText: "Em li derve nînin" },
      { ku: "Tu li vir nînî.", en: "You are not here", audio: true, audioText: "Tu li vir nînî" },
      { ku: "Ewan xwendekar nînin.", en: "They are not students", audio: true, audioText: "Ewan xwendekar nînin" }
    ]
  },
  {
    title: 'Negative Questions',
    examples: [
      { ku: "Tu çi naxwî?", en: "What don't you eat?", audio: true },
      { ku: "Ew kû naçe?", en: "Where doesn't he/she go?", audio: true },
      { ku: "Tu çima naxwînî?", en: "Why don't you read?", audio: true }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Tu çawa î?",
    correct: "Tu çawa yî?",
    explanation: "For 'Tu' (you), use 'yî' not 'î' when asking 'how are you?'"
  },
  {
    wrong: "Ez naxwim nan",
    correct: "Ez nan naxwim",
    explanation: "Remember SOV order! Even in negative sentences: Subject + Object + Verb. 'nan' (bread) comes before 'naxwim' (don't eat)."
  },
  {
    wrong: "Ez xwendekar nînim",
    correct: "Ez xwendekar nînim",
    explanation: "Actually this is correct! But remember: 'nînim' is for 'Ez' (I). For 'Ew' use 'nîne', for plural use 'nînin'."
  },
  {
    wrong: "Tu naxwî nan",
    correct: "Tu nan naxwî",
    explanation: "SOV order applies to negative sentences too: Tu (you) + nan (bread) + naxwî (don't eat) = Tu nan naxwî"
  },
  {
    wrong: "Ew çi ye?",
    correct: "Ev çi ye?",
    explanation: "Actually both can be correct! 'Ev çi ye?' = 'What is this?' and 'Ew çi ye?' = 'What is that?' But 'Ev çi ye?' is more common."
  }
]

const practiceExercises = [
  {
    question: "What question word means 'who'?",
    options: ["çi", "kî", "kû", "kengî"],
    correct: 1,
    explanation: "'kî' means 'who'. 'çi' = what, 'kû' = where, 'kengî' = when"
  },
  {
    question: "How do you say 'How are you?'?",
    options: ["Tu çawa î?", "Tu çawa yî?", "Tu çawa e?", "Tu çawa in?"],
    correct: 1,
    explanation: "For 'Tu' (you), use 'yî': Tu çawa yî? (How are you?)"
  },
  {
    question: "What is the negative of 'Ez dixwim' (I eat)?",
    options: ["Ez nedixwim", "Ez naxwim", "Ez dixwim ne", "Ez ne dixwim"],
    correct: 1,
    explanation: "Replace 'di-' with 'na-': dixwim → naxwim (I don't eat)"
  },
  {
    question: "How do you say 'I am not a student'?",
    options: ["Ez xwendekar nîne", "Ez xwendekar nînin", "Ez xwendekar nînim", "Ez xwendekar nîyî"],
    correct: 2,
    explanation: "For 'Ez' (I), use 'nînim': Ez xwendekar nînim (I am not a student)"
  },
  {
    question: "What question word means 'where'?",
    options: ["kî", "çi", "kû", "çima"],
    correct: 2,
    explanation: "'kû' means 'where'. 'kî' = who, 'çi' = what, 'çima' = why"
  },
  {
    question: "How do you say 'What is this?'?",
    options: ["Ew çi ye?", "Ev çi e?", "Ew çi e?", "Ev çi ye?"],
    correct: 3,
    explanation: "'Ev çi ye?' = 'What is this?' Use 'Ev' for 'this' and 'ye' for 'is'"
  },
  {
    question: "What is the negative of 'Tu dixwî' (You eat)?",
    options: ["Tu nedixwî", "Tu naxwî", "Tu dixwî ne", "Tu ne dixwî"],
    correct: 1,
    explanation: "Replace 'di-' with 'na-': dixwî → naxwî (you don't eat)"
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu kû î?", "Tu kû e?", "Tu kû yî?", "Tu kû in?"],
    correct: 2,
    explanation: "For 'Tu' (you), use 'yî': Tu kû yî? (Where are you?)"
  },
  {
    question: "What question word means 'when'?",
    options: ["kû", "kengî", "çima", "çawa"],
    correct: 1,
    explanation: "'kengî' means 'when'. 'kû' = where, 'çima' = why, 'çawa' = how"
  },
  {
    question: "How do you say 'We don't eat'?",
    options: ["Em nedixwin", "Em dixwin ne", "Em ne dixwin", "Em naxwin"],
    correct: 3,
    explanation: "Replace 'di-' with 'na-': dixwin → naxwin (we don't eat)"
  },
  {
    question: "What is the negative of 'Ew li malê ye' (He/She is at home)?",
    options: ["Ew li malê nînim", "Ew li malê nîne", "Ew li malê nînin", "Ew li malê nîyî"],
    correct: 1,
    explanation: "For 'Ew' (he/she), use 'nîne': Ew li malê nîne (He/She is not at home)"
  },
  {
    question: "How do you say 'Why are you here?'?",
    options: ["Tu çima li vir yî?", "Tu çima li vir î?", "Tu çima li vir e?", "Tu çima li vir in?"],
    correct: 1,
    explanation: "For 'Tu' (you), use 'î': Tu çima li vir î? (Why are you here?)"
  },
  {
    question: "What question word means 'why'?",
    options: ["çawa", "çima", "kengî", "kû"],
    correct: 1,
    explanation: "'çima' means 'why'. 'çawa' = how, 'kengî' = when, 'kû' = where"
  },
  {
    question: "How do you say 'They are not students'?",
    options: ["Ewan xwendekar nînim", "Ewan xwendekar nîne", "Ewan xwendekar nîyî", "Ewan xwendekar nînin"],
    correct: 3,
    explanation: "For plural 'Ewan' (they), use 'nînin': Ewan xwendekar nînin"
  },
  {
    question: "What is the correct negative sentence for 'I don't go'?",
    options: ["Ez neçim", "Ez naçim", "Ez çim ne", "Ez ne çim"],
    correct: 1,
    explanation: "For 'çûn' (to go), use 'naçim' (I don't go). Some verbs use 'ne-' instead of 'na-'."
  },
  {
    question: "How do you say 'What do you eat?'?",
    options: ["Tu çi naxwî?", "Tu çi ye?", "Tu çi dixwî?", "Tu çi dike?"],
    correct: 2,
    explanation: "Question word 'çi' (what) + subject + verb: Tu çi dixwî? (What do you eat?)"
  },
  {
    question: "What is the negative of 'Em li derve ne' (We are outside)?",
    options: ["Em li derve nînim", "Em li derve nîne", "Em li derve nîyî", "Em li derve nînin"],
    correct: 3,
    explanation: "For 'Em' (we), use 'nînin': Em li derve nînin (We are not outside)"
  },
  {
    question: "How do you say 'When do you go?'?",
    options: ["Tu kengî naçî?", "Tu kengî yî?", "Tu kengî diçî?", "Tu kengî e?"],
    correct: 2,
    explanation: "Question word 'kengî' (when) + subject + verb: Tu kengî diçî? (When do you go?)"
  },
  {
    question: "What question word means 'how'?",
    options: ["çima", "çawa", "kengî", "kû"],
    correct: 1,
    explanation: "'çawa' means 'how'. 'çima' = why, 'kengî' = when, 'kû' = where"
  },
  {
    question: "In negative sentences, what prefix replaces 'di-'?",
    options: ["na-", "ne-", "nî-", "both na- and ne-"],
    correct: 3,
    explanation: "Most verbs use 'na-' (naxwim), but some use 'ne-' (neçim). It depends on the verb."
  }
]

export default function QuestionsNegationPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 28, // Counted from presentTenseExamples sections (6+7+7+5+3)
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

  // Initialize refs from stored progress - ONLY ONCE on mount
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Questions & Negation page mounted, initial progress:', {
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
        const audioFilename = getAudioFilename(textForAudio);
        
        // Determine the correct folder based on section type and file availability
        // Question words section: use 'questions' folder (single words like ki, ci, etc.)
        // Asking Questions section: check if file exists in questions, otherwise use grammar
        // Negative sentences: use 'grammar' folder
        let audioFolder = 'grammar'; // default
        
        if (section.title === 'Question Words') {
          // Single question words are in questions folder
          audioFolder = 'questions';
        } else if (section.title === 'Asking Questions' || section.title === 'Negative Questions') {
          // Check if this specific file exists in questions folder
          // Files that exist in questions: ew-ki-ye, tu-cawa-yi, tu-kengi-dici, etc.
          // Files that don't: ev-ci-ye (use grammar)
          const questionsFolderFiles = [
            'ew-ki-ye', 'nave-te-ci-ye', 'tu-cawa-yi', 'tu-cend-sali-yi',
            'tu-ci-dixwi', 'tu-ci-dixwini', 'tu-ci-kar-diki', 'tu-cima-li-vir-yi',
            'tu-kengi-dici', 'tu-kengi-hati', 'tu-kijan-pirtuk-dixwini', 'tu-li-ku-diji'
          ];
          
          // Single question words (ki, ci, ku, etc.) are in questions folder
          const isSingleWord = !textForAudio.includes(' ') && !textForAudio.includes('?');
          
          if (questionsFolderFiles.includes(audioFilename) || isSingleWord) {
            audioFolder = 'questions';
          } else {
            // Fallback to grammar folder for files like ev-ci-ye
            audioFolder = 'grammar';
          }
        } else {
          // Negative sentences use grammar folder
          audioFolder = 'grammar';
        }
        
        return {
          ...example,
          audioFile: `/audio/kurdish-tts-mp3/${audioFolder}/${audioFilename}.mp3`
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
          Questions & Negation
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
              className="card p-6 mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Questions & Negation Work in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="text-lg font-semibold mb-2">Asking Questions:</p>
                  <p className="text-sm">
                    Just use question words (who, what, where, when, why, how) at the beginning of the sentence. The word order stays the same (SOV)!
                  </p>
                  <p className="text-kurdish-red font-mono text-sm mt-2 bg-white p-2 rounded">
                    Example: <span className="bg-yellow-200 px-2 py-1 rounded">Tu</span> (you) + <span className="bg-yellow-200 px-2 py-1 rounded">çi</span> (what) + <span className="bg-yellow-200 px-2 py-1 rounded">dixwî</span> (eat) = <span className="font-bold">Tu çi dixwî?</span> (What do you eat?)
                  </p>
                </div>
                
                <div>
                  <p className="text-lg font-semibold mb-2">Making Negative Sentences:</p>
                  <p className="text-sm">
                    For verbs: Replace <span className="font-bold text-kurdish-red">"di-"</span> with <span className="font-bold text-kurdish-red">"na-"</span>
                  </p>
                  <p className="text-kurdish-red font-mono text-sm mt-1 bg-white p-2 rounded">
                    Example: <span className="bg-yellow-200 px-2 py-1 rounded">dixwim</span> (I eat) → <span className="bg-yellow-200 px-2 py-1 rounded">naxwim</span> (I don't eat)
                  </p>
                  <p className="text-sm mt-2">
                    For "to be": Use <span className="font-bold text-kurdish-red">"nîn"</span> or <span className="font-bold text-kurdish-red">"nînim"</span>
                  </p>
                  <p className="text-kurdish-red font-mono text-sm mt-1 bg-white p-2 rounded">
                    Example: <span className="bg-yellow-200 px-2 py-1 rounded">Ez xwendekar im</span> (I am a student) → <span className="bg-yellow-200 px-2 py-1 rounded">Ez xwendekar nînim</span> (I am not a student)
                  </p>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Questions are easy - just add a question word! Negation is simple - just change "di-" to "na-" for verbs. Remember SOV order applies to both!
                </p>
              </div>
            </motion.div>

            {/* Question Words Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Question Words Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionWordsTable.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{row.ku}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.en}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-mono text-kurdish-red">{row.example}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.exampleEn}</td>
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
                              audioFile={example.audioFile}
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
