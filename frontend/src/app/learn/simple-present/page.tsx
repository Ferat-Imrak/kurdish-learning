"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
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

const LESSON_ID = '15' // Simple Present Tense lesson ID

// Conjugation table data
const conjugationTable = [
  { pronoun: "Ez", pronounEn: "I", ending: "-im", example: "dixwim", exampleEn: "I eat" },
  { pronoun: "Tu", pronounEn: "You", ending: "-î", example: "dixwî", exampleEn: "You eat" },
  { pronoun: "Ew", pronounEn: "He/She", ending: "-e", example: "dixwe", exampleEn: "He/She eats" },
  { pronoun: "Em", pronounEn: "We", ending: "-in", example: "dixwin", exampleEn: "We eat" },
  { pronoun: "Hûn", pronounEn: "You (plural)", ending: "-in", example: "dixwin", exampleEn: "You eat" },
  { pronoun: "Ewan", pronounEn: "They", ending: "-in", example: "dixwin", exampleEn: "They eat" }
]

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", root: "xwar", ez: "dixwim", tu: "dixwî", ew: "dixwe", em: "dixwin", hun: "dixwin", ewan: "dixwin" },
  { infinitive: "çûn", en: "to go", root: "ç", ez: "diçim", tu: "diçî", ew: "diçe", em: "diçin", hun: "diçin", ewan: "diçin" },
  { infinitive: "kirin", en: "to do", root: "kir", ez: "dikim", tu: "dikî", ew: "dike", em: "dikin", hun: "dikin", ewan: "dikin" },
  { infinitive: "xwendin", en: "to read", root: "xwên", ez: "dixwînim", tu: "dixwînî", ew: "dixwîne", em: "dixwînin", hun: "dixwînin", ewan: "dixwînin" },
  { infinitive: "hatin", en: "to come", root: "hat", ez: "hatim", tu: "hatî", ew: "tê", em: "tên", hun: "tên", ewan: "tên" },
  { infinitive: "dîtin", en: "to see", root: "bîn", ez: "dibînim", tu: "dibînî", ew: "dibîne", em: "dibînin", hun: "dibînin", ewan: "dibînin" },
  { infinitive: "bihîstin", en: "to hear", root: "bihîs", ez: "dibihîzim", tu: "dibihîzî", ew: "dibihîze", em: "dibihîzin", hun: "dibihîzin", ewan: "dibihîzin" },
  { infinitive: "axaftin", en: "to speak", root: "axaft", ez: "diaxivim", tu: "diaxivî", ew: "diaxive", em: "diaxevin", hun: "diaxevin", ewan: "diaxevin" }
]

const presentTenseExamples = [
  {
    title: 'Daily Activities',
    examples: [
      { ku: "Ez nan dixwim.", en: "I eat bread", audio: true, audioText: "Ez nan dixwim" },
      { ku: "Tu pirtûk dixwînî.", en: "You read a book", audio: true, audioText: "Tu pirtûk dixwînî" },
      { ku: "Ew li malê ye.", en: "He/She is at home", audio: true, audioText: "Ew li malê ye" },
      { ku: "Ez xwendekar im.", en: "I am a student", audio: true, audioText: "Ez xwendekar im" },
      { ku: "Em diçin dibistanê.", en: "We go to school", audio: true, audioText: "Em diçin dibistanê" },
      { ku: "Tu çayê vedixwî.", en: "You drink tea", audio: true, audioText: "Tu çayê vedixwî" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Ez dibînim.", en: "I see", audio: true, audioText: "Ez dibînim" },
      { ku: "Tu dibihîzî.", en: "You hear", audio: true, audioText: "Tu dibihîzî" },
      { ku: "Ew diaxive.", en: "He/She speaks", audio: true, audioText: "Ew diaxive" },
      { ku: "Em dikin.", en: "We do", audio: true, audioText: "Em dikin" },
      { ku: "Ew tê.", en: "He/She comes", audio: true, audioText: "Ew tê" },
      { ku: "Ez diçim bazarê.", en: "I go to the market", audio: true, audioText: "Ez diçim bazarê" }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Ez naxwim.", en: "I don't eat", audio: true, audioText: "Ez naxwim" },
      { ku: "Tu naxwî.", en: "You don't eat", audio: true, audioText: "Tu naxwî" },
      { ku: "Ew naxwe.", en: "He/She doesn't eat", audio: true, audioText: "Ew naxwe" },
      { ku: "Em naxwin.", en: "We don't eat", audio: true, audioText: "Em naxwin" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Tu çi dixwî?", en: "What do you eat?", audio: true },
      { ku: "Ew diçe ku derê?", en: "Where does he/she go?", audio: true, audioText: "Ew diçe ku derê?" },
      { ku: "Tu çawa yî?", en: "How are you?", audio: true },
      { ku: "Ez çi bikim?", en: "What should I do?", audio: true }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Ez xwarim",
    correct: "Ez dixwim",
    explanation: "Don't forget the 'di-' prefix! Present tense always needs 'di-' before the verb root."
  },
  {
    wrong: "Tu xwar",
    correct: "Tu dixwî",
    explanation: "Present tense needs both 'di-' prefix and the correct ending (-î for 'Tu')."
  },
  {
    wrong: "Ew dixwar",
    correct: "Ew dixwe",
    explanation: "The ending for 'Ew' (He/She) is '-e', not '-ar'. Remember: Ew → -e ending."
  },
  {
    wrong: "Ez diçim malê",
    correct: "Ez diçim malê",
    note: "Actually correct! But remember 'li' is often used: 'Ez li malê me' (I am at home)."
  }
]

// Practice exercises
const practiceExercises = [
  {
    question: "How do you say 'I eat' in Kurdish?",
    options: ["Ez dixwim", "Min xwar", "Ez bixwim", "Ez xwarim"],
    correct: 0,
    explanation: "Present tense uses 'Ez' + 'di-' prefix + verb root + '-im' ending"
  },
  {
    question: "What is the correct present tense form for 'You go'?",
    options: ["Tu çûyî", "Tu diçî", "Tu biçî", "Te çû"],
    correct: 1,
    explanation: "Present tense: Tu + di- + ç + -î = Tu diçî"
  },
  {
    question: "Which ending is used for 'Ew' (He/She) in present tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 2,
    explanation: "Ew (He/She) always uses '-e' ending in present tense"
  },
  {
    question: "How do you say 'We don't eat'?",
    options: ["Em naxwin", "Em naxwar", "Em naxwim", "Em naxwe"],
    correct: 0,
    explanation: "Negative: Em + na- (instead of di-) + xwar + -in = Em naxwin"
  },
  {
    question: "What prefix is used for present tense?",
    options: ["bi-", "di-", "ê", "no prefix"],
    correct: 1,
    explanation: "Present tense always uses 'di-' prefix before the verb root"
  },
  {
    question: "How do you say 'I read' in present tense?",
    options: ["Ez xwend", "Ez dixwînim", "Min xwend", "Ez bixwînim"],
    correct: 1,
    explanation: "Present tense: Ez + di- + xwên + -im = Ez dixwînim"
  },
  {
    question: "What is 'Tu dixwî' in English?",
    options: ["I eat", "You eat", "He eats", "We eat"],
    correct: 1,
    explanation: "Tu = You, dixwî = eat (present tense with -î ending for Tu)"
  },
  {
    question: "Which is correct for 'She reads'?",
    options: ["Ew dixwîne", "Ew xwend", "Wê dixwîne", "Ew bixwîne"],
    correct: 0,
    explanation: "Present tense: Ew + di- + xwên + -e = Ew dixwîne"
  },
  {
    question: "How do you say 'They go' in present tense?",
    options: ["Ewan diçin", "Ewan çûn", "Ewan biçin", "Wan çû"],
    correct: 0,
    explanation: "Present tense: Ewan + di- + ç + -in = Ewan diçin"
  },
  {
    question: "What is the negative form of 'Ez dixwim'?",
    options: ["Ez naxwim", "Ez nexwar", "Min naxwar", "Ez naxwar"],
    correct: 0,
    explanation: "Negative present: Replace 'di-' with 'na-' = Ez naxwim"
  },
  {
    question: "Which ending is used for 'Em' (We) in present tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "Em (We) always uses '-in' ending in present tense"
  },
  {
    question: "How do you say 'I do' in present tense?",
    options: ["Ez dikim", "Min kir", "Ez bikim", "Ez kirim"],
    correct: 0,
    explanation: "Present tense: Ez + di- + kir + -im = Ez dikim"
  },
  {
    question: "What is 'Ew diçe' in English?",
    options: ["I go", "You go", "He/She goes", "We go"],
    correct: 2,
    explanation: "Ew = He/She, diçe = goes (present tense with -e ending)"
  },
  {
    question: "How do you say 'You read' in present tense?",
    options: ["Tu xwend", "Tu dixwînî", "Te xwend", "Tu bixwînî"],
    correct: 1,
    explanation: "Present tense: Tu + di- + xwên + -î = Tu dixwînî"
  },
  {
    question: "Which is the correct structure for present tense?",
    options: ["Subject + verb", "Subject + di- + verb + ending", "Subject + ê + bi- + verb", "Subject + past verb"],
    correct: 1,
    explanation: "Present tense structure: Subject + di- prefix + verb root + personal ending"
  },
  {
    question: "How do you say 'We eat' in present tense?",
    options: ["Em dixwin", "Me xwar", "Em naxwin", "Em bixwin"],
    correct: 0,
    explanation: "Present tense: Em + di- + xwar + -in = Em dixwin"
  },
  {
    question: "What is the negative of 'Tu diçî'?",
    options: ["Tu naçî", "Tu neçî", "Te çû", "Tu naxwî"],
    correct: 1,
    explanation: "Negative present: Replace 'di-' with 'ne-' = Tu neçî (for çûn verb)"
  },
  {
    question: "Which pronoun uses '-î' ending in present tense?",
    options: ["Ez", "Tu", "Ew", "Em"],
    correct: 1,
    explanation: "Tu (You) always uses '-î' ending in present tense"
  },
  {
    question: "How do you say 'I see' in present tense?",
    options: ["Ez dît", "Ez dibînim", "Min dît", "Ez bidînim"],
    correct: 1,
    explanation: "Present tense: Ez + di- + bîn + -im = Ez dibînim"
  },
  {
    question: "What is 'Hûn dixwin' in English?",
    options: ["I eat", "You eat (singular)", "You eat (plural)", "They eat"],
    correct: 2,
    explanation: "Hûn = You (plural), dixwin = eat (present tense with -in ending)"
  }
]

export default function SimplePresentPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 30, // Counted from presentTenseExamples (20) + commonVerbs infinitive forms (8) + some conjugations (2) ≈ 30
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.0, // 30% / 30 audios = 1% per audio
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
    console.log('🚀 Simple Present Tense page mounted, initial progress:', {
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
    
    // Audio progress: 30% weight (1% per audio, max 30%)
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

  // Audio filename mappings for files that don't match the sanitized text
  const audioFilenameMappings: Record<string, string> = {
    'em-diaxevin': 'em-diaxivin', // File is diaxivin but text is diaxevin
    'hun-diaxevin': 'hun-diaxivin', // File is diaxivin but text is diaxevin
    'ewan-diaxevin': 'ewan-diaxivin', // File is diaxivin but text is diaxevin
  };

  // Process examples to add audioFile paths
  const examplesWithAudio = presentTenseExamples.map(section => ({
    ...section,
    examples: section.examples.map(example => {
      if (example.audio) {
        // Use audioText if provided (to match existing audio files), otherwise use ku
        const textForAudio = example.audioText || example.ku;
        let audioFilename = getAudioFilename(textForAudio);
        
        // Apply filename mapping if needed
        if (audioFilenameMappings[audioFilename]) {
          audioFilename = audioFilenameMappings[audioFilename];
        }
        
        return {
          ...example,
          audioFile: `/audio/kurdish-tts-mp3/grammar/${audioFilename}.mp3`
        };
      }
      return example;
    })
  }));
  
  // Helper function to get correct audio filename with mapping
  const getMappedAudioFilename = (text: string): string => {
    const baseFilename = getAudioFilename(text);
    return audioFilenameMappings[baseFilename] || baseFilename;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">
          Simple Present Tense
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
            {/* How Present Tense Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Present Tense Works in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, present tense is formed by adding the prefix <span className="font-bold text-kurdish-red">"di-"</span> before the verb root. This prefix shows that the action is happening right now or happens regularly.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-blue-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    Subject + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">di-</span> + verb root + personal ending
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Step 1:</strong> Take the verb root (infinitive form)
                    </p>
                    <p className="text-kurdish-red font-mono">
                      Example: <span className="font-bold">xwarin</span> (to eat)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 2:</strong> Add <span className="font-bold text-kurdish-red">"di-"</span> prefix
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="font-bold">xwarin</span> → <span className="bg-yellow-200 px-2 py-1 rounded">di</span>xwarin
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 3:</strong> Add personal ending based on the subject
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="bg-yellow-200 px-2 py-1 rounded">di</span>xwar<span className="font-bold">im</span> (I eat)
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-blue-200">
                  <p className="font-semibold mb-2 text-gray-800">Personal Endings:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li><span className="font-bold text-kurdish-red">-im</span> for "Ez" (I)</li>
                    <li><span className="font-bold text-kurdish-red">-î</span> for "Tu" (You)</li>
                    <li><span className="font-bold text-kurdish-red">-e</span> for "Ew" (He/She)</li>
                    <li><span className="font-bold text-kurdish-red">-in</span> for "Em/Hûn/Ewan" (We/You/They)</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> The <span className="font-bold">"di-"</span> prefix always stays the same, but the ending changes based on who is doing the action!
                </p>
              </div>
            </motion.div>

            {/* Conjugation Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Conjugation Table - Verb "xwarin" (to eat)</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Pronoun</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Ending</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conjugationTable.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{row.pronoun}</span>
                          <span className="text-gray-600 text-sm ml-2">({row.pronounEn})</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-mono text-kurdish-red font-bold">{row.ending}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-mono text-kurdish-red">{row.example}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.exampleEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Note:</strong> Notice how all forms use "di-" prefix, but the ending changes: -im, -î, -e, -in
              </p>
            </motion.div>

            {/* More Verbs Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Common Verbs in Present Tense</h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                {commonVerbs.map((verb, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="mb-3 pb-3 border-b border-gray-200 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-mono text-kurdish-red font-bold text-lg">{verb.infinitive}</div>
                        <div className="text-gray-600 text-sm mt-1">{verb.en}</div>
                      </div>
                      <AudioButton
                        kurdishText={verb.infinitive}
                        phoneticText={verb.en}
                        audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(verb.infinitive)}.mp3`}
                        label=""
                        size="small"
                        onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-infinitive-${index}`)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Ez:</span>
                        <span className="font-mono text-kurdish-red flex-1">Ez {verb.ez}</span>
                        <AudioButton
                          kurdishText={`Ez ${verb.ez}`}
                          phoneticText="I eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(`Ez ${verb.ez}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${index}-ez`)}
                        />
                      </div>
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Tu:</span>
                        <span className="font-mono text-kurdish-red flex-1">Tu {verb.tu}</span>
                        <AudioButton
                          kurdishText={`Tu ${verb.tu}`}
                          phoneticText="You eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(`Tu ${verb.tu}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${index}-tu`)}
                        />
                      </div>
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Ew:</span>
                        <span className="font-mono text-kurdish-red flex-1">Ew {verb.ew}</span>
                        <AudioButton
                          kurdishText={`Ew ${verb.ew}`}
                          phoneticText="He/She eats"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(`Ew ${verb.ew}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${index}-ew`)}
                        />
                      </div>
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Em:</span>
                        <span className="font-mono text-kurdish-red flex-1">Em {verb.em}</span>
                        <AudioButton
                          kurdishText={`Em ${verb.em}`}
                          phoneticText="We eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(`Em ${verb.em}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${index}-em`)}
                        />
                      </div>
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Hûn:</span>
                        <span className="font-mono text-kurdish-red flex-1">Hûn {verb.hun}</span>
                        <AudioButton
                          kurdishText={`Hûn ${verb.hun}`}
                          phoneticText="You (plural) eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(`Hûn ${verb.hun}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${index}-hun`)}
                        />
                      </div>
                      <div className="h-px bg-gray-200 my-1.5"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Ewan:</span>
                        <span className="font-mono text-kurdish-red flex-1">Ewan {verb.ewan}</span>
                        <AudioButton
                          kurdishText={`Ewan ${verb.ewan}`}
                          phoneticText="They eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getMappedAudioFilename(`Ewan ${verb.ewan}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `verb-${index}-ewan`)}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Common Mistakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                  transition={{ delay: 0.4 + sectionIndex * 0.1 }}
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
                            <span className="font-mono text-kurdish-red">{option}</span>
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
