"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Calendar, Clock, CalendarDays, RotateCcw, Shuffle, CheckCircle2, XCircle } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const LESSON_ID = '3' // Days lesson ID

// Helper function to get audio filename for each day
function getDayAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "yekşem": "yeksem",
    "duşem": "dusem",
    "sêşem": "sesem",
    "çarşem": "carsem",
    "pêncşem": "pencsem",
    "în": "in",
    "şemî": "semi",
  };
  return mapping[ku] || ku.toLowerCase();
}

const days = [
  { ku: "yekşem", en: "Sunday", description: "First day of the week", order: 1 },
  { ku: "duşem", en: "Monday", description: "Second day of the week", order: 2 },
  { ku: "sêşem", en: "Tuesday", description: "Third day of the week", order: 3 },
  { ku: "çarşem", en: "Wednesday", description: "Fourth day of the week", order: 4 },
  { ku: "pêncşem", en: "Thursday", description: "Fifth day of the week", order: 5 },
  { ku: "în", en: "Friday", description: "Sixth day of the week", order: 6 },
  { ku: "şemî", en: "Saturday", description: "Seventh day of the week", order: 7 }
]

const timePhrases = [
  { ku: "Îro", en: "Today", filename: "iro.mp3" },
  { ku: "Sibê", en: "Tomorrow", filename: "sibe.mp3" },
  { ku: "Duh", en: "Yesterday", filename: "duh.mp3" },
]

const weekPhrases = [
  { ku: "Ev hefte", en: "This week", filename: "ev-hefte.mp3" },
  { ku: "Hefteya din", en: "Next week", filename: "hefteya-din.mp3" },
]

const dayPhrases = [
  { ku: "Li duşemê", en: "On Monday", filename: "li-duseme.mp3" },
  { ku: "Her roj", en: "Every day", filename: "her-roj.mp3" },
]

const usageExamples = [
  { ku: "Îro duşem e.", en: "Today is Monday", filename: "iro-dusem-e.mp3" },
  { ku: "Sibê sêşem e.", en: "Tomorrow is Tuesday", filename: "sibe-sesem-e.mp3" },
  { ku: "Duh yekşem bû.", en: "Yesterday was Sunday", filename: "duh-yeksem-bu.mp3" },
  { ku: "Îro çi roj e?", en: "What day is it?", filename: "iro-ci-roj-e.mp3" },
  { ku: "Ez diçim dibistanê li duşemê.", en: "I go to school on Monday", filename: "ez-dicim-dibistane-li-duseme.mp3" },
  { ku: "Em li înê bêhna xwe vedidim.", en: "We rest on Friday", filename: "em-li-ine-behna-xwe-vedidim.mp3" },
  { ku: "Hefteya dawî şemî û yekşem e.", en: "The weekend is Saturday and Sunday", filename: "hefteya-dawi-semi-u-yeksem-e.mp3" },
  { ku: "Sibê çi roj e?", en: "What day is tomorrow?", filename: "sibe-ci-roj-e.mp3" },
]

// Get current day of week (0 = Sunday, 1 = Monday, etc.)
function getCurrentDayIndex(): number {
  const today = new Date().getDay()
  // Convert JavaScript day (0=Sunday) to our order (1=Sunday)
  return today === 0 ? 1 : today + 1
}

export default function DaysPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 22, // 7 days + 3 time phrases + 2 week phrases + 2 day phrases + 8 examples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.36, // 30% / 22 audios ≈ 1.36% per audio
  }
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID)
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig)
  const startTimeRef = useRef<number>(estimatedStartTime)
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  // Base audio plays estimated from stored progress
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays)
  // Track if refs have been initialized to prevent re-initialization on re-renders
  const refsInitializedRef = useRef(false)
  
  const [mode, setMode] = useState<'learn' | 'practice'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('days-mode')
      return (saved === 'learn' || saved === 'practice') ? saved : 'learn'
    }
    return 'learn'
  })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('days-mode', mode)
    }
  }, [mode])

  // Initialize refs from stored progress - ONLY ONCE on mount
  useEffect(() => {
    // Only initialize refs once on mount, not on every re-render
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Days page mounted, initial progress:', {
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
    const storedProgress = currentProgress?.progress || 0
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    
    // Calculate progress from ACTUAL STATE, not from stored baseProgress
    
    // 1. Audio progress: Calculate from total unique audios played (base + new)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    const audioProgress = Math.min(30, (effectiveUniqueAudios / progressConfig.totalAudios) * 30)
    
    // 2. Time progress: Calculate from total time spent (max 20%, 4 minutes = 20%)
    const timeProgress = Math.min(20, totalTimeSpent * 5)
    
    // 3. Practice progress: Calculate from practice score (max 50%)
    let practiceProgress = 0
    if (progressConfig.hasPractice) {
      if (practiceScore !== undefined) {
        practiceProgress = Math.min(50, (practiceScore / 100) * 50)
      } else if (currentProgress.score !== undefined) {
        // Use stored practice score if available
        practiceProgress = Math.min(50, (currentProgress.score / 100) * 50)
      }
    }
    
    // 4. Total progress = audio + time + practice (capped at 100%)
    let calculatedProgress = Math.round(Math.min(100, audioProgress + timeProgress + practiceProgress))
    
    // SPECIAL CASE: If practice is completed (score >= 70), ensure progress is at least 100%
    // This handles cases where audio/time weren't tracked but practice was completed
    if (practiceScore !== undefined && practiceScore >= 70) {
      calculatedProgress = 100
      console.log('🎯 Practice passed (>=70%), setting progress to 100%')
    } else if (currentProgress.score !== undefined && currentProgress.score >= 70) {
      calculatedProgress = 100
      console.log('🎯 Stored practice score passed (>=70%), setting progress to 100%')
    }
    
    // IMPORTANT: Never decrease progress - always use the maximum of stored and calculated
    // This prevents progress from dropping when refs are reset or recalculated
    const totalProgress = Math.max(storedProgress, calculatedProgress)
    
    console.log('📊 Progress calculation (from state):', {
      storedProgress,
      totalUniqueAudios,
      effectiveUniqueAudios,
      audioProgress: audioProgress.toFixed(2),
      totalTimeSpent,
      timeProgress: timeProgress.toFixed(2),
      practiceScore: practiceScore !== undefined ? practiceScore : 'undefined',
      practiceProgress: practiceProgress.toFixed(2),
      calculatedProgress,
      totalProgress,
      breakdown: {
        audio: audioProgress.toFixed(2),
        time: timeProgress.toFixed(2),
        practice: practiceProgress.toFixed(2),
        sum: (audioProgress + timeProgress + practiceProgress).toFixed(2),
      },
    })
    
    return totalProgress
  }
  
  const [practiceGame, setPracticeGame] = useState<'order' | 'matching'>('order')
  
  // Day order quiz state
  const [shuffledDays, setShuffledDays] = useState(days)
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [orderFeedback, setOrderFeedback] = useState<boolean | null>(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [orderScore, setOrderScore] = useState<number | undefined>(undefined)
  const [orderPassed, setOrderPassed] = useState(false)
  
  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ ku: string; en: string; matched: boolean }>>([])
  const [shuffledKurdish, setShuffledKurdish] = useState<string[]>([])
  const [shuffledEnglish, setShuffledEnglish] = useState<string[]>([])
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'ku' | 'en'; value: string } | null>(null)
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 })
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'ku' | 'en'; value: string }>>([])
  const [matchingCompleted, setMatchingCompleted] = useState(false)
  const [matchingScore, setMatchingScore] = useState<number | undefined>(undefined)
  const [matchingPassed, setMatchingPassed] = useState(false)
  
  const currentDayIndex = getCurrentDayIndex()
  
  // Initialize day order quiz
  const initializeOrderQuiz = () => {
    const shuffled = [...days].sort(() => Math.random() - 0.5)
    setShuffledDays(shuffled)
    setSelectedOrder([])
    setOrderFeedback(null)
    setOrderCompleted(false)
    setOrderScore(undefined)
    setOrderPassed(false)
  }
  
  // Initialize matching game
  const initializeMatching = () => {
    const pairs = days.map(d => ({ ku: d.ku, en: d.en, matched: false }))
    const kurdish = days.map(d => d.ku).sort(() => Math.random() - 0.5)
    const english = days.map(d => d.en).sort(() => Math.random() - 0.5)
    
    setMatchingPairs(pairs)
    setShuffledKurdish(kurdish)
    setShuffledEnglish(english)
    setSelectedMatch(null)
    setMatchScore({ correct: 0, total: 0 })
    setIncorrectMatches([])
    setMatchingCompleted(false)
    setMatchingScore(undefined)
    setMatchingPassed(false)
  }
  
  // Handle day order selection
  const handleDaySelect = (dayKu: string) => {
    if (selectedOrder.includes(dayKu)) {
      setSelectedOrder(prev => prev.filter(d => d !== dayKu))
    } else {
      setSelectedOrder(prev => [...prev, dayKu])
    }
  }
  
  // Check day order
  const checkDayOrder = () => {
    const correctOrder = days.map(d => d.ku)
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(correctOrder)
    setOrderFeedback(isCorrect)
    if (isCorrect) {
      // Calculate practice score (order game) - 100% if correct
      const currentScore = 100
      const isPracticePassed = currentScore >= 70
      
      setOrderCompleted(true)
      setOrderPassed(isPracticePassed)
      setOrderScore(currentScore)
      
      console.log('✅ Day order completed:', {
        score: currentScore,
        passed: isPracticePassed,
      })
    }
  }
  
  // Handle matching game selection
  const handleMatchSelect = (type: 'ku' | 'en', value: string) => {
    if (!selectedMatch) {
      setSelectedMatch({ type, value })
      setIncorrectMatches([])
    } else {
      if (selectedMatch.type !== type) {
        let isCorrect = false
        
        if (type === 'ku' && selectedMatch.type === 'en') {
          const enValue = selectedMatch.value
          const kuValue = value
          const pair = matchingPairs.find(p => p.ku === kuValue && p.en === enValue)
          if (pair && !pair.matched) {
            isCorrect = true
            // Update matching pairs and calculate score in one go
            setMatchingPairs(prev => {
              const updated = prev.map(p => 
                p.ku === kuValue ? { ...p, matched: true } : p
              )
              // Check if all matched after update
              if (updated.every(p => p.matched) && !matchingCompleted) {
                // Calculate practice score (matching game) using updated score
                setMatchScore(prevScore => {
                  const updatedScore = { correct: prevScore.correct + 1, total: prevScore.total + 1 }
                  const currentScore = updatedScore.total > 0 
                    ? Math.round((updatedScore.correct / updatedScore.total) * 100)
                    : 100
                  const isPracticePassed = currentScore >= 70
                  
                  console.log('✅ Matching game completed:', {
                    correct: updatedScore.correct,
                    total: updatedScore.total,
                    score: currentScore,
                    passed: isPracticePassed,
                  })
                  
                  // Set completion states after state update
                  setTimeout(() => {
                    setMatchingCompleted(true)
                    setMatchingPassed(isPracticePassed)
                    setMatchingScore(currentScore)
                  }, 0)
                  
                  return updatedScore
                })
              } else {
                // Update match score for correct match
                setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
              }
              return updated
            })
          } else {
            setMatchScore(prev => ({ ...prev, total: prev.total + 1 }))
            setIncorrectMatches([
              { type: 'ku', value: kuValue },
              { type: 'en', value: enValue }
            ])
            setTimeout(() => {
              setIncorrectMatches([])
              setSelectedMatch(null)
            }, 1000)
            return
          }
        } else if (type === 'en' && selectedMatch.type === 'ku') {
          const kuValue = selectedMatch.value
          const enValue = value
          const pair = matchingPairs.find(p => p.ku === kuValue && p.en === enValue)
          if (pair && !pair.matched) {
            isCorrect = true
            // Update matching pairs and calculate score in one go
            setMatchingPairs(prev => {
              const updated = prev.map(p => 
                p.ku === kuValue ? { ...p, matched: true } : p
              )
              // Check if all matched after update
              if (updated.every(p => p.matched) && !matchingCompleted) {
                // Calculate practice score (matching game) using updated score
                setMatchScore(prevScore => {
                  const updatedScore = { correct: prevScore.correct + 1, total: prevScore.total + 1 }
                  const currentScore = updatedScore.total > 0 
                    ? Math.round((updatedScore.correct / updatedScore.total) * 100)
                    : 100
                  const isPracticePassed = currentScore >= 70
                  
                  console.log('✅ Matching game completed:', {
                    correct: updatedScore.correct,
                    total: updatedScore.total,
                    score: currentScore,
                    passed: isPracticePassed,
                  })
                  
                  // Set completion states after state update
                  setTimeout(() => {
                    setMatchingCompleted(true)
                    setMatchingPassed(isPracticePassed)
                    setMatchingScore(currentScore)
                  }, 0)
                  
                  return updatedScore
                })
              } else {
                // Update match score for correct match
                setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
              }
              return updated
            })
          } else {
            setMatchScore(prev => ({ ...prev, total: prev.total + 1 }))
            setIncorrectMatches([
              { type: 'ku', value: kuValue },
              { type: 'en', value: enValue }
            ])
            setTimeout(() => {
              setIncorrectMatches([])
              setSelectedMatch(null)
            }, 1000)
            return
          }
        }
        
        setSelectedMatch(null)
        setIncorrectMatches([])
      } else {
        setSelectedMatch({ type, value })
        setIncorrectMatches([])
      }
    }
  }
  
  // Initialize exercises when switching to practice mode
  useEffect(() => {
    if (mode === 'practice') {
      if (practiceGame === 'order') initializeOrderQuiz()
      if (practiceGame === 'matching') initializeMatching()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, practiceGame])

  // Use useEffect to watch for both games being completed
  useEffect(() => {
    console.log('🔍 Practice completion check:', {
      orderCompleted,
      matchingCompleted,
      orderScore,
      matchingScore,
      orderPassed,
      matchingPassed,
    })
    
    if (orderCompleted && matchingCompleted && orderScore !== undefined && matchingScore !== undefined) {
      // Both games completed - calculate combined practice score
      const combinedScore = (orderScore + matchingScore) / 2
      const isPracticePassed = orderPassed && matchingPassed && combinedScore >= 70
      
      console.log('🎯 Both practice games completed:', {
        orderScore,
        matchingScore,
        combinedScore,
        orderPassed,
        matchingPassed,
        isPracticePassed,
      })
      
      // Calculate total time spent (base + session)
      const currentProgress = getLessonProgress(LESSON_ID)
      const baseTimeSpent = currentProgress?.timeSpent || 0
      const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
      const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
      const safeTimeSpent = Math.min(1000, totalTimeSpent)
      
      // Always pass combinedScore to calculateProgress so it can set progress to 100% if score >= 70
      const progress = calculateProgress(combinedScore)
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
      
      console.log('💾 Updating lesson progress after practice completion:', {
        progress,
        status,
        combinedScore,
        isPracticePassed,
        orderScore,
        matchingScore,
      })
      
      updateLessonProgress(LESSON_ID, progress, status, combinedScore, safeTimeSpent)
    } else {
      console.log('⏳ Waiting for both games to complete...')
    }
  }, [orderCompleted, matchingCompleted, orderScore, matchingScore, orderPassed, matchingPassed])
  
  // Check if practice was already completed (score exists) but progress doesn't reflect it
  // This runs after calculateProgress is defined and whenever progress/score changes
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

  const handleAudioPlay = (audioKey: string) => {
    // Track unique audios played (only count new ones) - check BEFORE adding
    if (uniqueAudiosPlayedRef.current.has(audioKey)) {
      console.log('🔊 Duplicate audio play ignored:', audioKey)
      return
    }
    
    console.log('🔊 New unique audio played:', audioKey, 'Total unique:', uniqueAudiosPlayedRef.current.size + 1)
    uniqueAudiosPlayedRef.current.add(audioKey)
    
    // Calculate total time spent (base + session)
    const currentProgress = getLessonProgress(LESSON_ID)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    
    // Don't pass practiceScore - we're just playing audio, not doing practice
    const progress = calculateProgress(undefined)
    // Set status to COMPLETED when progress reaches 100%, otherwise preserve existing status or set to IN_PROGRESS
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
    
    console.log('📊 Progress update:', {
      progress,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Days of the Week</h1>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setMode('learn')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'learn'
                ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'practice'
                ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Practice
          </button>
        </div>

        {/* Practice Mode - Game Selector Tabs */}
        {mode === 'practice' && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setPracticeGame('order')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                practiceGame === 'order'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Day Order
            </button>
            <button
              onClick={() => setPracticeGame('matching')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                practiceGame === 'matching'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Matching
            </button>
          </div>
        )}

        {/* Learn Mode - Days Grid */}
        {mode === 'learn' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
          {days.map((day, index) => (
            <motion.div 
              key={day.ku}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6"
            >
              {/* Kurdish Day Name - Center */}
              <div className="text-xl font-bold text-gray-800 text-center mb-2">
                {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
              </div>
              
              {/* English Translation - Center */}
              <div className="text-gray-600 text-center mb-4">{day.en}</div>
              
              {/* Bottom Row: Audio Button + Description on same line */}
              <div className="flex items-center gap-2">
                <AudioButton 
                  kurdishText={day.ku} 
                  phoneticText={day.en.toUpperCase()} 
                  label="Listen" 
                  size="small"
                  audioFile={`/audio/kurdish-tts-mp3/days/${getDayAudioFile(day.ku)}.mp3`}
                  onPlay={() => handleAudioPlay(`day-${day.ku}`)}
                />
                <span className="text-[11px] text-gray-500 whitespace-nowrap">{day.description}</span>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Learn Mode - Visual Calendar */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 max-w-4xl mx-auto mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Week Calendar</h2>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const isToday = day.order === currentDayIndex
                return (
                  <div
                    key={day.ku}
                    className={`p-3 rounded-lg text-center border-2 transition-all ${
                      isToday
                        ? 'bg-kurdish-red text-white border-kurdish-red shadow-lg'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-white' : 'text-gray-500'}`}>
                      {day.en.slice(0, 3)}
                    </div>
                    <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-800'}`}>
                      {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
                    </div>
                    {isToday && (
                      <div className="text-xs text-white/80 mt-1">Today</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Time Phrases */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Time Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {timePhrases.map((phrase, index) => (
                <div key={index} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-kurdish-red mb-1">{phrase.ku}</div>
                    <div className="text-sm text-gray-600">{phrase.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={phrase.ku} 
                    phoneticText={phrase.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${phrase.filename}`}
                    onPlay={() => handleAudioPlay(`time-phrase-${phrase.filename}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Week Phrases */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Week Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {weekPhrases.map((phrase, index) => (
                <div key={index} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-kurdish-red mb-1">{phrase.ku}</div>
                    <div className="text-sm text-gray-600">{phrase.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={phrase.ku} 
                    phoneticText={phrase.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${phrase.filename}`}
                    onPlay={() => handleAudioPlay(`week-phrase-${phrase.filename}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Day Phrases */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Day Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {dayPhrases.map((phrase, index) => (
                <div key={index} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-kurdish-red mb-1">{phrase.ku}</div>
                    <div className="text-sm text-gray-600">{phrase.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={phrase.ku} 
                    phoneticText={phrase.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${phrase.filename}`}
                    onPlay={() => handleAudioPlay(`day-phrase-${phrase.filename}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Usage Examples */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 max-w-4xl mx-auto"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Usage Examples</h2>
            </div>
            
            <div className="space-y-4">
              {usageExamples.map((example, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-kurdish-red mb-1">{example.ku}</div>
                    <div className="text-gray-600">{example.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={example.ku} 
                    phoneticText={example.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${example.filename}`}
                    onPlay={() => handleAudioPlay(`example-${example.filename}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Practice Mode - Day Order Quiz */}
        {mode === 'practice' && practiceGame === 'order' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            className="mt-8 card p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shuffle className="w-6 h-6 text-kurdish-red" />
                <h2 className="text-xl font-bold text-gray-800">Arrange Days in Order</h2>
              </div>
              <button
                onClick={initializeOrderQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
            
            {orderCompleted ? (
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-8 border-2 border-green-200 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-700 mb-2">Perfect!</h3>
                <div className="text-lg text-gray-700 mb-4">You arranged the days correctly!</div>
                <button
                  onClick={initializeOrderQuiz}
                  className="flex items-center gap-2 px-6 py-3 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Selected order:</div>
                  <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    {selectedOrder.length === 0 ? (
                      <span className="text-gray-400">Click days below to arrange them in order</span>
                    ) : (
                      selectedOrder.map((dayKu, index) => {
                        const day = days.find(d => d.ku === dayKu)
                        return (
                          <button
                            key={index}
                            onClick={() => handleDaySelect(dayKu)}
                            className="px-3 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors text-sm font-medium"
                          >
                            {day?.ku.charAt(0).toUpperCase() + day?.ku.slice(1)}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {shuffledDays.map((day) => {
                    const isSelected = selectedOrder.includes(day.ku)
                    return (
                      <button
                        key={day.ku}
                        onClick={() => handleDaySelect(day.ku)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-kurdish-red text-white border-kurdish-red'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-sm">{day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}</div>
                      </button>
                    )
                  })}
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={checkDayOrder}
                    disabled={selectedOrder.length !== 7}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      selectedOrder.length !== 7
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-kurdish-red text-white hover:bg-kurdish-red/90'
                    }`}
                  >
                    Check Order
                  </button>
                </div>
                
                {orderFeedback !== null && !orderCompleted && (
                  <div className="mt-4 text-center">
                    <div className="text-red-600 font-medium">Incorrect order. Try again!</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Practice Mode - Matching Game */}
        {mode === 'practice' && practiceGame === 'matching' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            className="mt-8 card p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shuffle className="w-6 h-6 text-kurdish-red" />
                <h2 className="text-xl font-bold text-gray-800">Match Days</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Score: {matchScore.correct}/{matchScore.total}
                </div>
                <button
                  onClick={initializeMatching}
                  className="flex items-center gap-2 px-4 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Kurdish Days Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Kurdish</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shuffledKurdish.map((ku, index) => {
                    const pair = matchingPairs.find(p => p.ku === ku)
                    const isMatched = pair?.matched || false
                    const isSelected = selectedMatch?.type === 'ku' && selectedMatch.value === ku
                    const isIncorrect = incorrectMatches.some(m => m.type === 'ku' && m.value === ku)
                    return (
                      <button
                        key={`ku-${ku}-${index}`}
                        onClick={() => !isMatched && handleMatchSelect('ku', ku)}
                        disabled={isMatched}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isMatched
                            ? 'bg-green-100 border-green-500 opacity-60'
                            : isIncorrect
                            ? 'bg-red-100 border-red-500'
                            : isSelected
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-sm text-gray-800 text-center">{ku}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* English Days Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">English</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shuffledEnglish.map((en, index) => {
                    const pair = matchingPairs.find(p => p.en === en)
                    const isMatched = pair?.matched || false
                    const isSelected = selectedMatch?.type === 'en' && selectedMatch.value === en
                    const isIncorrect = incorrectMatches.some(m => m.type === 'en' && m.value === en)
                    return (
                      <button
                        key={`en-${en}-${index}`}
                        onClick={() => !isMatched && handleMatchSelect('en', en)}
                        disabled={isMatched}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isMatched
                            ? 'bg-green-100 border-green-500 opacity-60'
                            : isIncorrect
                            ? 'bg-red-100 border-red-500'
                            : isSelected
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-800 text-center">{en}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {matchingPairs.every(p => p.matched) && (
              <motion.div
                initial={{opacity:0, scale:0.9}}
                animate={{opacity:1, scale:1}}
                className="mt-6 text-center p-6 bg-green-50 rounded-xl border-2 border-green-200"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-700 mb-1">Great job!</div>
                <div className="text-sm text-green-600">You matched all days correctly!</div>
              </motion.div>
            )}
          </motion.div>
        )}
      </PageContainer>
    </div>
  )
}
