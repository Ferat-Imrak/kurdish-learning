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

const LESSON_ID = '21' // Possessive Pronouns lesson ID

// Possessive pronouns reference table
const possessiveTable = [
  { ku: "min", en: "my", example: "pirtûka min", exampleEn: "my book", usage: "First person singular" },
  { ku: "te", en: "your", example: "malê te", exampleEn: "your house", usage: "Second person singular" },
  { ku: "wî", en: "his", example: "pirtûka wî", exampleEn: "his book", usage: "Third person singular (masculine)" },
  { ku: "wê", en: "her", example: "pirtûka wê", exampleEn: "her book", usage: "Third person singular (feminine)" },
  { ku: "me", en: "our", example: "malê me", exampleEn: "our house", usage: "First person plural" },
  { ku: "we", en: "your (plural)", example: "pirtûkên we", exampleEn: "your books", usage: "Second person plural" },
  { ku: "wan", en: "their", example: "malên wan", exampleEn: "their houses", usage: "Third person plural" },
  { ku: "xwe", en: "self/own", example: "nanê xwe", exampleEn: "his/her own bread", usage: "Reflexive (refers back to subject)" }
]

const presentTenseExamples = [
  {
    title: 'Basic Possessive Forms',
    examples: [
      { ku: "Pirtûka min.", en: "my book", audio: true, audioText: "Pirtûka min." },
      { ku: "Malê te.", en: "your house", audio: true, audioText: "Malê te." },
      { ku: "Pirtûka wî.", en: "his book", audio: true, audioText: "Pirtûka wî." },
      { ku: "Pirtûka wê.", en: "her book", audio: true, audioText: "Pirtûka wê." },
      { ku: "Malê me.", en: "our house", audio: true, audioText: "Malê me." },
      { ku: "Pirtûkên we.", en: "your books", audio: true, audioText: "Pirtûkên we." },
      { ku: "Malên wan.", en: "their houses", audio: true, audioText: "Malên wan." }
    ]
  },
  {
    title: 'Possessive Pronouns in Sentences',
    examples: [
      { ku: "Ez pirtûka min dixwînim.", en: "I read my book", audio: true, audioText: "Ez pirtûka min dixwînim." },
      { ku: "Tu malê te dibînî.", en: "You see your house", audio: true, audioText: "Tu malê te dibînî." },
      { ku: "Ew nanê xwe dixwe.", en: "He/She eats his/her own bread", audio: true, audioText: "Ew nanê xwe dixwe." },
      { ku: "Em pirtûkên xwe dixwînin.", en: "We read our books", audio: true, audioText: "Em pirtûkên xwe dixwînin." },
      { ku: "Ewan malên wan dibînin.", en: "They see their houses", audio: true, audioText: "Ewan malên wan dibînin." }
    ]
  },
  {
    title: 'Body Parts with Possessives',
    examples: [
      { ku: "Çavên min.", en: "my eyes", audio: true, audioText: "Çavên min." },
      { ku: "Dengê te.", en: "your voice", audio: true, audioText: "Dengê te." },
      { ku: "Destê wî.", en: "his hand", audio: true, audioText: "Destê wî." },
      { ku: "Serê wê.", en: "her head", audio: true, audioText: "Serê wê." },
      { ku: "Lingên me.", en: "our legs", audio: true, audioText: "Lingên me." }
    ]
  },
  {
    title: 'Family Members with Possessives',
    examples: [
      { ku: "Bavê min.", en: "my father", audio: true, audioText: "Bavê min." },
      { ku: "Dayika te.", en: "your mother", audio: true, audioText: "Dayika te." },
      { ku: "Bira wî.", en: "his brother", audio: true, audioText: "Bira wî." },
      { ku: "Xwişka wê.", en: "her sister", audio: true, audioText: "Xwişka wê." },
      { ku: "Zarokên me.", en: "our children", audio: true, audioText: "Zarokên me." }
    ]
  },
  {
    title: 'Using "xwe" (self/own)',
    examples: [
      { ku: "Ez nanê xwe dixwim.", en: "I eat my own bread", audio: true, audioText: "Ez nanê xwe dixwim." },
      { ku: "Tu pirtûka xwe dixwînî.", en: "You read your own book", audio: true, audioText: "Tu pirtûka xwe dixwînî." },
      { ku: "Ew malê xwe dibîne.", en: "He/She sees his/her own house", audio: true, audioText: "Ew malê xwe dibîne." },
      { ku: "Em odeyên xwe dibînin.", en: "We see our own rooms", audio: true, audioText: "Em odeyên xwe dibînin." }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "min pirtûk",
    correct: "pirtûka min",
    explanation: "Possessive pronouns come AFTER the noun, not before. The noun also gets an ending (-a, -ê, -ên) before the possessive."
  },
  {
    wrong: "pirtûk min",
    correct: "pirtûka min",
    explanation: "Don't forget the ending on the noun! 'pirtûk' becomes 'pirtûka' before 'min' (my)."
  },
  {
    wrong: "pirtûka ez",
    correct: "pirtûka min",
    explanation: "Use possessive pronouns (min, te, wî, wê, me, we, wan), not subject pronouns (ez, tu, ew, em, hûn, ewan). 'ez' = I, but 'min' = my."
  },
  {
    wrong: "pirtûka ew",
    correct: "pirtûka wî or pirtûka wê",
    explanation: "For 'his/her', use 'wî' (his) or 'wê' (her), not 'ew'. 'ew' is the subject pronoun (he/she), not possessive."
  },
  {
    wrong: "pirtûkên min",
    correct: "pirtûkên min",
    explanation: "Actually this is correct! For plural nouns, use '-ên' ending: pirtûkên min (my books)."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'my book' in Kurdish?",
    options: ["min pirtûk", "pirtûk min", "pirtûka min", "pirtûka ez"],
    correct: 2,
    explanation: "Possessive comes after noun with ending: pirtûka min (my book)"
  },
  {
    question: "What possessive pronoun means 'your' (singular)?",
    options: ["tu", "te", "we", "wan"],
    correct: 1,
    explanation: "'te' means 'your' (singular). 'tu' is the subject pronoun (you), 'we' is your (plural), 'wan' is their."
  },
  {
    question: "How do you say 'his book'?",
    options: ["pirtûka ew", "pirtûka wî", "pirtûka wê", "pirtûka wan"],
    correct: 1,
    explanation: "Use 'wî' for 'his': pirtûka wî (his book). 'ew' is subject pronoun, 'wê' is her, 'wan' is their."
  },
  {
    question: "How do you say 'her book'?",
    options: ["pirtûka ew", "pirtûka wî", "pirtûka wê", "pirtûka wan"],
    correct: 2,
    explanation: "Use 'wê' for 'her': pirtûka wê (her book)"
  },
  {
    question: "What is 'our house' in Kurdish?",
    options: ["malê em", "malê me", "malên me", "malê we"],
    correct: 1,
    explanation: "Use 'me' for 'our': malê me (our house). 'em' is subject pronoun (we), 'we' is your (plural)."
  },
  {
    question: "How do you say 'their books'?",
    options: ["pirtûkên wan", "pirtûka wan", "pirtûkên we", "pirtûka we"],
    correct: 0,
    explanation: "For plural: pirtûkên wan (their books). Use '-ên' for plural nouns and 'wan' for their."
  },
  {
    question: "What does 'xwe' mean?",
    options: ["my", "your", "self/own", "their"],
    correct: 2,
    explanation: "'xwe' means 'self' or 'own' - it refers back to the subject. Example: nanê xwe (his/her own bread)."
  },
  {
    question: "How do you say 'my eyes'?",
    options: ["çavên min", "çavê min", "çav min", "min çavên"],
    correct: 0,
    explanation: "For plural body parts: çavên min (my eyes). Use '-ên' for plural and possessive comes after."
  },
  {
    question: "What is the correct form for 'your voice'?",
    options: ["dengê te", "deng te", "te dengê", "dengê tu"],
    correct: 0,
    explanation: "Use 'dengê te' (your voice). The noun gets '-ê' ending and possessive 'te' comes after."
  },
  {
    question: "How do you say 'I read my book'?",
    options: ["Ez pirtûka min dixwînim", "Ez min pirtûk dixwînim", "Ez pirtûk min dixwînim", "Min pirtûka ez dixwînim"],
    correct: 0,
    explanation: "SOV order: Ez (I) + pirtûka min (my book) + dixwînim (read) = Ez pirtûka min dixwînim"
  },
  {
    question: "What possessive pronoun means 'your (plural)'?",
    options: ["te", "we", "me", "wan"],
    correct: 1,
    explanation: "'we' means 'your (plural)'. 'te' is your (singular), 'me' is our, 'wan' is their."
  },
  {
    question: "How do you say 'our children'?",
    options: ["zarokên me", "zaroka me", "zarok me", "me zarokên"],
    correct: 0,
    explanation: "For plural: zarokên me (our children). Use '-ên' for plural and 'me' for our."
  },
  {
    question: "What is 'his hand' in Kurdish?",
    options: ["destê wî", "dest wî", "wî destê", "destê ew"],
    correct: 0,
    explanation: "Use 'destê wî' (his hand). The noun gets '-ê' ending and 'wî' (his) comes after."
  },
  {
    question: "How do you say 'He eats his own bread'?",
    options: ["Ew nanê xwe dixwe", "Ew nanê wî dixwe", "Ew nanê wê dixwe", "Ew nanê wan dixwe"],
    correct: 0,
    explanation: "Use 'xwe' (own) when the subject and possessor are the same: Ew nanê xwe dixwe (He eats his own bread)."
  },
  {
    question: "What is the correct order for possessive constructions?",
    options: ["Possessive + Noun", "Noun + Possessive", "Noun + Ending + Possessive", "Possessive + Ending + Noun"],
    correct: 2,
    explanation: "The order is: Noun + Ending (-a, -ê, -ên) + Possessive. Example: pirtûka min (my book)."
  },
  {
    question: "How do you say 'your books' (plural)?",
    options: ["pirtûkên te", "pirtûkên we", "pirtûka we", "pirtûkên tu"],
    correct: 1,
    explanation: "For plural 'your': pirtûkên we (your books). Use '-ên' for plural and 'we' for your (plural)."
  },
  {
    question: "What ending is used for singular nouns before possessives?",
    options: ["-a or -ê", "-ên", "-an", "-ek"],
    correct: 0,
    explanation: "Singular nouns use '-a' or '-ê' before possessives: pirtûka min (my book), malê te (your house)."
  },
  {
    question: "How do you say 'her sister'?",
    options: ["xwişka wê", "xwişka wî", "xwişka ew", "xwişka te"],
    correct: 0,
    explanation: "Use 'wê' for 'her': xwişka wê (her sister)"
  },
  {
    question: "What is 'my father' in Kurdish?",
    options: ["bavê min", "bav min", "min bavê", "bavê ez"],
    correct: 0,
    explanation: "Use 'bavê min' (my father). The noun gets '-ê' ending and 'min' (my) comes after."
  },
  {
    question: "When do you use 'xwe' instead of 'wî' or 'wê'?",
    options: ["Always", "When the possessor is the same as the subject", "Never", "Only for plural"],
    correct: 1,
    explanation: "Use 'xwe' when the possessor is the same as the subject. Example: Ew nanê xwe dixwe (He eats his own bread)."
  }
]

export default function PossessivePronounsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 26, // Counted from presentTenseExamples sections (7+5+5+5+4)
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.15, // 30% / 26 audios ≈ 1.15% per audio
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
    console.log('🚀 Possessive Pronouns page mounted, initial progress:', {
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
    
    // Audio progress: 30% weight (1.15% per audio, max 30%)
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
          Possessive Pronouns
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
              className="card p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Possessive Pronouns Work in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, possessive pronouns come <span className="font-bold text-kurdish-red">after</span> the noun, not before it like in English.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-indigo-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    Noun + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Ending</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Possessive</span>
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Step 1:</strong> Take the noun
                    </p>
                    <p className="text-kurdish-red font-mono">
                      Example: <span className="font-bold">pirtûk</span> (book)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 2:</strong> Add ending (-a, -ê, or -ên)
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="font-bold">pirtûk</span> → <span className="bg-yellow-200 px-2 py-1 rounded">pirtûka</span> (for singular)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 3:</strong> Add possessive pronoun
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="bg-yellow-200 px-2 py-1 rounded">pirtûka</span> + <span className="font-bold">min</span> (my)
                    </p>
                    <p className="text-kurdish-red font-mono mt-2">
                      = <span className="font-bold">pirtûka min</span> (my book)
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Remember: <span className="font-bold">Noun + Ending + Possessive</span> - the opposite of English! Also, use subject pronouns (ez, tu, ew) for subjects, but possessive pronouns (min, te, wî) for possessives.
                </p>
              </div>
            </motion.div>

            {/* Possessive Pronouns Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Possessive Pronouns Reference</h2>
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
                    {possessiveTable.map((row, index) => (
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
