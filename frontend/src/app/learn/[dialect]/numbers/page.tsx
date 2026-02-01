"use client"

import PageContainer from "../../../../components/PageContainer"
import BackLink from "../../../../components/BackLink"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronUp, Calculator, BookOpen, Shuffle, CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react"
import AudioButton from "../../../../components/lessons/AudioButton"
import { useProgress } from "../../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../../lib/progressHelper"

const LESSON_ID = '2' // Numbers lesson ID

// Helper function to get audio filename for each number
function getNumberAudioFile(ku: string): string {
  return ku
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

const numbers = Array.from({ length: 100 }, (_, i) => i + 1)
// Numbers 1-19 with audio
const basicNumbers: Record<number, { ku: string; en: string; hasAudio: true }> = {
  1: { ku: "yek", en: "one", hasAudio: true },
  2: { ku: "du", en: "two", hasAudio: true },
  3: { ku: "sê", en: "three", hasAudio: true },
  4: { ku: "çar", en: "four", hasAudio: true },
  5: { ku: "pênc", en: "five", hasAudio: true },
  6: { ku: "şeş", en: "six", hasAudio: true },
  7: { ku: "heft", en: "seven", hasAudio: true },
  8: { ku: "heşt", en: "eight", hasAudio: true },
  9: { ku: "neh", en: "nine", hasAudio: true },
  10: { ku: "deh", en: "ten", hasAudio: true },
  11: { ku: "yazde", en: "eleven", hasAudio: true },
  12: { ku: "dazde", en: "twelve", hasAudio: true },
  13: { ku: "sêzde", en: "thirteen", hasAudio: true },
  14: { ku: "çarde", en: "fourteen", hasAudio: true },
  15: { ku: "pazde", en: "fifteen", hasAudio: true },
  16: { ku: "şazde", en: "sixteen", hasAudio: true },
  17: { ku: "hevde", en: "seventeen", hasAudio: true },
  18: { ku: "hejde", en: "eighteen", hasAudio: true },
  19: { ku: "nozde", en: "nineteen", hasAudio: true },
}

// Key numbers with audio (20, 30, 40, 50, 60, 70, 80, 90, 100)
const keyNumbers: Record<number, { ku: string; en: string; hasAudio: true }> = {
  20: { ku: "bîst", en: "twenty", hasAudio: true },
  30: { ku: "sî", en: "thirty", hasAudio: true },
  40: { ku: "çil", en: "forty", hasAudio: true },
  50: { ku: "pêncî", en: "fifty", hasAudio: true },
  60: { ku: "şêst", en: "sixty", hasAudio: true },
  70: { ku: "heftê", en: "seventy", hasAudio: true },
  80: { ku: "heştê", en: "eighty", hasAudio: true },
  90: { ku: "not", en: "ninety", hasAudio: true },
  100: { ku: "sed", en: "one hundred", hasAudio: true },
}

// Compound numbers (21-29) with audio
const compoundNumbers: Record<number, { ku: string; en: string; hasAudio: true }> = {
  21: { ku: "bîst û yek", en: "twenty-one", hasAudio: true },
  22: { ku: "bîst û du", en: "twenty-two", hasAudio: true },
  23: { ku: "bîst û sê", en: "twenty-three", hasAudio: true },
  24: { ku: "bîst û çar", en: "twenty-four", hasAudio: true },
  25: { ku: "bîst û pênc", en: "twenty-five", hasAudio: true },
  26: { ku: "bîst û şeş", en: "twenty-six", hasAudio: true },
  27: { ku: "bîst û heft", en: "twenty-seven", hasAudio: true },
  28: { ku: "bîst û heşt", en: "twenty-eight", hasAudio: true },
  29: { ku: "bîst û neh", en: "twenty-nine", hasAudio: true },
}

// Combine all numbers for display
const allNumbers = { ...basicNumbers, ...keyNumbers, ...compoundNumbers }

// Number usage examples
const numberExamples = [
  { ku: "Sê sêvên min hene", en: "I have 3 apples", number: 3, audioFile: "/audio/kurdish-tts-mp3/numbers/se-seven-min-hene.mp3" },
  { ku: "Du pirtûkên min hene", en: "I have 2 books", number: 2, audioFile: "/audio/kurdish-tts-mp3/numbers/du-pirtuken-min-hene.mp3" },
  { ku: "Pênc kurên min hene", en: "I have 5 sons", number: 5, audioFile: "/audio/kurdish-tts-mp3/numbers/penc-kuren-min-hene.mp3" },
  { ku: "Çar keçên min hene", en: "I have 4 daughters", number: 4, audioFile: "/audio/kurdish-tts-mp3/numbers/car-kecen-min-hene.mp3" },
  { ku: "Deh zarokên min hene", en: "I have 10 children", number: 10, audioFile: "/audio/kurdish-tts-mp3/numbers/deh-zaroken-min-hene.mp3" },
  { ku: "Yek malê min heye", en: "I have 1 house", number: 1, audioFile: "/audio/kurdish-tts-mp3/numbers/yek-male-min-heye.mp3" },
  { ku: "Şeş kursiyên min hene", en: "I have 6 chairs", number: 6, audioFile: "/audio/kurdish-tts-mp3/numbers/ses-kursiyen-min-hene.mp3" },
  { ku: "Heft rojên min hene", en: "I have 7 days", number: 7, audioFile: "/audio/kurdish-tts-mp3/numbers/heft-rojen-min-hene.mp3" },
]

// Simple math problems
const generateMathProblem = () => {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const answer = num1 + num2
  
  // Generate 3 wrong answers
  const wrongAnswers: number[] = []
  const maxAnswer = Math.min(20, answer + 5)
  const minAnswer = Math.max(1, answer - 5)
  
  while (wrongAnswers.length < 3) {
    const wrongAnswer = Math.floor(Math.random() * (maxAnswer - minAnswer + 1)) + minAnswer
    if (wrongAnswer !== answer && !wrongAnswers.includes(wrongAnswer) && allNumbers[wrongAnswer]) {
      wrongAnswers.push(wrongAnswer)
    }
  }
  
  // Combine correct answer with wrong answers and shuffle
  const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5)
  
  return {
    num1,
    num2,
    answer,
    answerKu: allNumbers[answer]?.ku || "",
    question: `${allNumbers[num1]?.ku || ""} + ${allNumbers[num2]?.ku || ""} = ?`,
    options
  }
}

export default function NumbersPage({ params }: { params: { dialect: string } }) {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 45, // 37 numbers (19 basic + 9 key + 9 compound) + 8 examples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 0.67, // 30% / 45 audios ≈ 0.67% per audio
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
  
  // Mode state with localStorage persistence
  const [mode, setMode] = useState<'learn' | 'practice'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('numbers-mode')
      return (saved === 'learn' || saved === 'practice') ? saved : 'learn'
    }
    return 'learn'
  })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('numbers-mode', mode)
    }
  }, [mode])

  // Initialize refs from stored progress - ONLY ONCE on mount
  useEffect(() => {
    // Only initialize refs once on mount, not on every re-render
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Numbers page mounted, initial progress:', {
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
    // Otherwise, reset to 0 to avoid inflating counts from small progress values
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
    
    // Check if practice was already completed (score exists) but progress doesn't reflect it
    // This will be handled by a separate useEffect after calculateProgress is defined
    // But also check here if score >= 70 and progress < 100, we need to fix it
    if (currentProgress.score !== undefined && currentProgress.score >= 70 && currentProgress.progress < 100) {
      console.log('🔍 Practice score >= 70 but progress is not 100%, will recalculate after calculateProgress is defined...', {
        storedProgress: currentProgress.progress,
        storedScore: currentProgress.score,
      })
    }
  }, []) // Empty dependency array - only run once on mount
  
  const [showAll, setShowAll] = useState(false)
  const [mathProblem, setMathProblem] = useState(generateMathProblem())
  const [selectedMathAnswer, setSelectedMathAnswer] = useState<number | null>(null)
  const [mathFeedback, setMathFeedback] = useState<boolean | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [mathScore, setMathScore] = useState({ correct: 0, total: 0 })
  const [mathQuizCompleted, setMathQuizCompleted] = useState(false)
  const [mathQuizPassed, setMathQuizPassed] = useState(false)
  const [mathQuizScore, setMathQuizScore] = useState<number | undefined>(undefined)
  const [practiceGame, setPracticeGame] = useState<'math' | 'matching'>('math')
  
  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ digit: number; ku: string; matched: boolean }>>([])
  const [shuffledDigits, setShuffledDigits] = useState<number[]>([])
  const [shuffledKurdishWords, setShuffledKurdishWords] = useState<string[]>([])
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'digit' | 'ku'; value: number | string } | null>(null)
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 })
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'digit' | 'ku'; value: number | string }>>([])
  const [matchingGameCompleted, setMatchingGameCompleted] = useState(false)
  const [matchingGamePassed, setMatchingGamePassed] = useState(false)
  const [matchingGameScore, setMatchingGameScore] = useState<number | undefined>(undefined)
  
  // Initialize matching game
  const initializeMatchingGame = () => {
    const numbersToMatch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const pairs = numbersToMatch.map(num => ({
      digit: num,
      ku: allNumbers[num]?.ku || "",
      matched: false
    }))
    
    // Shuffle digits and Kurdish words independently
    const digits = numbersToMatch.map(n => n).sort(() => Math.random() - 0.5)
    const kurdishWords = numbersToMatch.map(n => allNumbers[n]?.ku || "").sort(() => Math.random() - 0.5)
    
    setMatchingPairs(pairs)
    setShuffledDigits(digits)
    setShuffledKurdishWords(kurdishWords)
    setSelectedMatch(null)
    setMatchScore({ correct: 0, total: 0 })
    setIncorrectMatches([])
    setMatchingGameCompleted(false)
    setMatchingGamePassed(false)
    setMatchingGameScore(undefined)
  }
  
  // Handle matching game selection
  const handleMatchSelect = (type: 'digit' | 'ku', value: number | string) => {
    if (!selectedMatch) {
      setSelectedMatch({ type, value })
      setIncorrectMatches([])
    } else {
      if (selectedMatch.type !== type) {
        // Check if it's a match
        let isCorrect = false
        
        if (type === 'digit' && selectedMatch.type === 'ku') {
          const kuValue = selectedMatch.value as string
          const digitValue = value as number
          const pair = matchingPairs.find(p => p.ku === kuValue)
          if (pair && pair.digit === digitValue && !pair.matched) {
            // Match found!
            isCorrect = true
            // Update matching pairs and calculate score in one go
            setMatchingPairs(prev => {
              const updated = prev.map(p => 
                p.digit === digitValue ? { ...p, matched: true } : p
              )
              // Check if all matched after update
              if (updated.every(p => p.matched) && !matchingGameCompleted) {
                // Calculate score from current matchScore + this match (since this is correct)
                setMatchScore(prevScore => {
                  const updatedScore = { correct: prevScore.correct + 1, total: prevScore.total + 1 }
                  const currentScore = updatedScore.total > 0 
                    ? Math.round((updatedScore.correct / updatedScore.total) * 100)
                    : 100
                  const isPracticePassed = currentScore >= 70
                  
                  console.log('✅ Matching game completed (ku->digit path):', {
                    correct: updatedScore.correct,
                    total: updatedScore.total,
                    score: currentScore,
                    passed: isPracticePassed,
                  })
                  
                  // Set completion states after state update
                  console.log('🔧 Setting matching game completion states (ku->digit path)...')
                  setTimeout(() => {
                    console.log('⏰ setTimeout callback executing (ku->digit path) - setting matching game states')
                    setMatchingGameCompleted(true)
                    setMatchingGamePassed(isPracticePassed)
                    setMatchingGameScore(currentScore)
                    console.log('✅ Matching game states set (ku->digit path):', {
                      matchingGameCompleted: true,
                      matchingGamePassed: isPracticePassed,
                      matchingGameScore: currentScore,
                    })
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
            // Show incorrect feedback for both selections
            setIncorrectMatches([
              { type: 'digit', value: digitValue },
              { type: 'ku', value: kuValue }
            ])
            setTimeout(() => {
              setIncorrectMatches([])
              setSelectedMatch(null)
            }, 1000)
            return
          }
        } else if (type === 'ku' && selectedMatch.type === 'digit') {
          const digitValue = selectedMatch.value as number
          const kuValue = value as string
          const pair = matchingPairs.find(p => p.digit === digitValue)
          if (pair && pair.ku === kuValue && !pair.matched) {
            // Match found!
            isCorrect = true
            // Update matching pairs and calculate score in one go
            setMatchingPairs(prev => {
              const updated = prev.map(p => 
                p.digit === digitValue ? { ...p, matched: true } : p
              )
              // Check if all matched after update
              if (updated.every(p => p.matched) && !matchingGameCompleted) {
                // Calculate score from current matchScore + this match (since this is correct)
                setMatchScore(prevScore => {
                  const updatedScore = { correct: prevScore.correct + 1, total: prevScore.total + 1 }
                  const currentScore = updatedScore.total > 0 
                    ? Math.round((updatedScore.correct / updatedScore.total) * 100)
                    : 100
                  const isPracticePassed = currentScore >= 70
                  
                  console.log('✅ Matching game completed (digit->ku path):', {
                    correct: updatedScore.correct,
                    total: updatedScore.total,
                    score: currentScore,
                    passed: isPracticePassed,
                  })
                  
                  // Set completion states after state update
                  console.log('🔧 Setting matching game completion states (digit->ku path)...')
                  setTimeout(() => {
                    console.log('⏰ setTimeout callback executing (digit->ku path) - setting matching game states')
                    setMatchingGameCompleted(true)
                    setMatchingGamePassed(isPracticePassed)
                    setMatchingGameScore(currentScore)
                    console.log('✅ Matching game states set (digit->ku path):', {
                      matchingGameCompleted: true,
                      matchingGamePassed: isPracticePassed,
                      matchingGameScore: currentScore,
                    })
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
            // Show incorrect feedback for both selections
            setIncorrectMatches([
              { type: 'digit', value: digitValue },
              { type: 'ku', value: kuValue }
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
  
  // Initialize math quiz
  const initializeMathQuiz = () => {
    setMathProblem(generateMathProblem())
    setSelectedMathAnswer(null)
    setMathFeedback(null)
    setCurrentQuestion(1)
    setMathScore({ correct: 0, total: 0 })
    setMathQuizCompleted(false)
    setMathQuizPassed(false)
    setMathQuizScore(undefined)
  }
  
  // Handle math answer selection
  const handleMathAnswer = (answerNum: number) => {
    setSelectedMathAnswer(answerNum)
    const isCorrect = answerNum === mathProblem.answer
    setMathFeedback(isCorrect)
    setMathScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))
  }
  
  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < 10) {
      setCurrentQuestion(prev => prev + 1)
      setMathProblem(generateMathProblem())
      setSelectedMathAnswer(null)
      setMathFeedback(null)
    } else {
      // Calculate practice score (math quiz)
      const currentScore = mathScore.total > 0 
        ? Math.round((mathScore.correct / mathScore.total) * 100)
        : 100
      const isPracticePassed = currentScore >= 70
      
      console.log('✅ Math quiz completed:', {
        correct: mathScore.correct,
        total: mathScore.total,
        score: currentScore,
        passed: isPracticePassed,
      })
      
      console.log('🔧 Setting math quiz completion states...')
      setMathQuizCompleted(true)
      setMathQuizPassed(isPracticePassed)
      setMathQuizScore(currentScore)
      console.log('✅ Math quiz states set:', {
        mathQuizCompleted: true,
        mathQuizPassed: isPracticePassed,
        mathQuizScore: currentScore,
      })
      // Don't update progress here - wait for both games to complete
    }
  }
  
  // Initialize matching game and math quiz on mount and when switching to practice mode
  // BUT don't reset completion states if games are already completed
  useEffect(() => {
    if (mode === 'practice') {
      // Only initialize if games aren't already completed
      if (!matchingGameCompleted) {
        initializeMatchingGame()
      }
      if (!mathQuizCompleted) {
        initializeMathQuiz()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, practiceGame])
  
  // Restore practice completion states from stored progress on mount
  useEffect(() => {
    const currentProgress = getLessonProgress(LESSON_ID)
    if (currentProgress.score !== undefined) {
      // Practice was completed - restore the states
      // We can't restore individual game scores, but we can mark both as completed
      // if the overall score exists (meaning both were completed)
      console.log('🔄 Restoring practice completion states from stored progress:', {
        score: currentProgress.score,
      })
      // If score exists, both games were completed
      // Set both as completed with estimated scores
      if (!mathQuizCompleted) {
        setMathQuizCompleted(true)
        setMathQuizPassed(currentProgress.score >= 70)
        setMathQuizScore(currentProgress.score) // Use overall score as estimate
      }
      if (!matchingGameCompleted) {
        setMatchingGameCompleted(true)
        setMatchingGamePassed(currentProgress.score >= 70)
        setMatchingGameScore(currentProgress.score) // Use overall score as estimate
      }
    }
  }, []) // Run once on mount

  // Use useEffect to watch for both games being completed
  useEffect(() => {
    console.log('🔍 Practice completion useEffect triggered:', {
      mathQuizCompleted,
      matchingGameCompleted,
      mathQuizScore,
      matchingGameScore,
      mathQuizPassed,
      matchingGamePassed,
      allConditionsMet: mathQuizCompleted && matchingGameCompleted && mathQuizScore !== undefined && matchingGameScore !== undefined,
    })
    
    if (mathQuizCompleted && matchingGameCompleted && mathQuizScore !== undefined && matchingGameScore !== undefined) {
      // Both games completed - calculate combined practice score
      const combinedScore = (mathQuizScore + matchingGameScore) / 2
      const isPracticePassed = mathQuizPassed && matchingGamePassed && combinedScore >= 70
      
      console.log('🎯 Both practice games completed - calculating progress:', {
        mathQuizScore,
        matchingGameScore,
        combinedScore,
        mathQuizPassed,
        matchingGamePassed,
        isPracticePassed,
      })
      
      // Calculate total time spent (base + session)
      const currentProgress = getLessonProgress(LESSON_ID)
      console.log('📊 Current stored progress before calculation:', {
        progress: currentProgress.progress,
        status: currentProgress.status,
        score: currentProgress.score,
        timeSpent: currentProgress.timeSpent,
      })
      
      const baseTimeSpent = currentProgress?.timeSpent || 0
      const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
      const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
      const safeTimeSpent = Math.min(1000, totalTimeSpent)
      
      console.log('⏱️ Time calculation:', {
        baseTimeSpent,
        sessionTimeMinutes,
        totalTimeSpent,
        safeTimeSpent,
      })
      
      // Use the practice score to calculate progress - this should give full practice credit
      console.log('🧮 Calling calculateProgress with combinedScore:', combinedScore)
      const progress = calculateProgress(combinedScore)
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
      
      console.log('💾 Updating lesson progress after practice completion:', {
        calculatedProgress: progress,
        status,
        combinedScore,
        isPracticePassed,
        mathQuizScore,
        matchingGameScore,
        storedProgress: currentProgress.progress,
      })
      
      // Update progress with practice score
      updateLessonProgress(LESSON_ID, progress, status, combinedScore, safeTimeSpent)
      
      // Verify the update
      setTimeout(() => {
        const updatedProgress = getLessonProgress(LESSON_ID)
        console.log('✅ Progress update verified:', {
          updatedProgress: updatedProgress.progress,
          updatedStatus: updatedProgress.status,
          updatedScore: updatedProgress.score,
        })
      }, 100)
    } else {
      console.log('⏳ Waiting for both games to complete...', {
        mathQuizCompleted,
        matchingGameCompleted,
        mathQuizScore: mathQuizScore !== undefined ? mathQuizScore : 'undefined',
        matchingGameScore: matchingGameScore !== undefined ? matchingGameScore : 'undefined',
        missingConditions: {
          mathQuizCompleted: !mathQuizCompleted,
          matchingGameCompleted: !matchingGameCompleted,
          mathQuizScore: mathQuizScore === undefined,
          matchingGameScore: matchingGameScore === undefined,
        },
      })
    }
  }, [mathQuizCompleted, matchingGameCompleted, mathQuizScore, matchingGameScore, mathQuizPassed, matchingGamePassed])
  
  // Check if practice was already completed (score exists) but progress doesn't reflect it
  // Also check if both games are completed but progress wasn't updated
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
    
    // Case 2: Both games are completed but no score was stored - force update
    if (mathQuizCompleted && matchingGameCompleted && mathQuizScore !== undefined && matchingGameScore !== undefined && currentProgress.score === undefined) {
      console.log('🚨 Both games completed but score not stored! Forcing update...', {
        mathQuizScore,
        matchingGameScore,
        currentProgress,
      })
      
      const combinedScore = (mathQuizScore + matchingGameScore) / 2
      const isPracticePassed = mathQuizPassed && matchingGamePassed && combinedScore >= 70
      
      const baseTimeSpent = currentProgress?.timeSpent || 0
      const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
      const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
      const safeTimeSpent = Math.min(1000, totalTimeSpent)
      
      const progress = calculateProgress(combinedScore)
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
      
      console.log('💾 Force updating lesson progress:', {
        progress,
        status,
        combinedScore,
        isPracticePassed,
      })
      
      updateLessonProgress(LESSON_ID, progress, status, combinedScore, safeTimeSpent)
    }
  }, [mathQuizCompleted, matchingGameCompleted, mathQuizScore, matchingGameScore, mathQuizPassed, matchingGamePassed])
  
  // Also check on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentProgress = getLessonProgress(LESSON_ID)
        // If both games are completed but progress is low, force update
        if (mathQuizCompleted && matchingGameCompleted && mathQuizScore !== undefined && matchingGameScore !== undefined) {
          if (currentProgress.progress < 80 || currentProgress.score === undefined) {
            console.log('👁️ Page visible - checking practice completion status...')
            const combinedScore = (mathQuizScore + matchingGameScore) / 2
            const isPracticePassed = mathQuizPassed && matchingGamePassed && combinedScore >= 70
            
            const baseTimeSpent = currentProgress?.timeSpent || 0
            const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
            const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
            const safeTimeSpent = Math.min(1000, totalTimeSpent)
            
            const progress = calculateProgress(combinedScore)
            const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
            
            console.log('💾 Visibility change - updating lesson progress:', {
              progress,
              status,
              combinedScore,
              currentProgress: currentProgress.progress,
            })
            
            updateLessonProgress(LESSON_ID, progress, status, combinedScore, safeTimeSpent)
          }
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [mathQuizCompleted, matchingGameCompleted, mathQuizScore, matchingGameScore, mathQuizPassed, matchingGamePassed])
  
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
  
  // Show numbers 1-19, key numbers (20, 30, 40, 50, 60, 70, 80, 90, 100), and compound numbers (21-29)
  const selectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 40, 50, 60, 70, 80, 90, 100]
  const displayedNumbers = showAll ? selectedNumbers : selectedNumbers.slice(0, 20)

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
        console.log('🎯 Practice progress calculated from provided score:', {
          practiceScore,
          practiceProgress,
          formula: `(${practiceScore} / 100) * 50 = ${practiceProgress}`,
        })
      } else if (currentProgress.score !== undefined) {
        // Use stored practice score if available
        practiceProgress = Math.min(50, (currentProgress.score / 100) * 50)
        console.log('🎯 Practice progress calculated from stored score:', {
          storedScore: currentProgress.score,
          practiceProgress,
          formula: `(${currentProgress.score} / 100) * 50 = ${practiceProgress}`,
        })
      } else {
        console.log('⚠️ No practice score available (neither provided nor stored)')
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
    
    // Don't pass practiceScore - we're just playing audio, not doing practice
    const progress = calculateProgress(undefined)
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
    
    console.log('📊 Progress update:', {
      progress,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
  }

  const progress = getLessonProgress(LESSON_ID)
  
  // Calculate learned count from actual unique audios (includes numbers + examples)
  const estimatedBaseCount = Math.min(baseAudioPlaysRef.current, progressConfig.totalAudios)
  const newUniqueAudios = uniqueAudiosPlayedRef.current.size
  const learnedCount = Math.min(estimatedBaseCount + newUniqueAudios, progressConfig.totalAudios)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">
          Numbers
        </h1>

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
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Practice
          </button>
        </div>

        {/* Number Cards - Only in Learn Mode */}
        {mode === 'learn' && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedNumbers.map((n, index) => {
            const numberData = allNumbers[n]
            const isCompoundNumber = n >= 21 && n <= 29
            
            return (
              <motion.div 
                key={n} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}}
                transition={{ delay: index * 0.05 }}
                className="card p-5"
              >
                <div className="font-bold text-gray-800 text-center">{(numberData?.ku || '—').charAt(0).toUpperCase() + (numberData?.ku || '—').slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{numberData?.en || '—'}</div>
                <div className="flex items-center justify-between">
                  {numberData?.hasAudio ? (
                    <AudioButton 
                      kurdishText={numberData.ku} 
                      phoneticText={numberData.en.toUpperCase()} 
                      label="Listen" 
                      size="small"
                      audioFile={`/audio/kurdish-tts-mp3/numbers/${getNumberAudioFile(numberData.ku)}.mp3`}
                      onPlay={() => handleAudioPlay(`number-${n}`)}
                    />
                  ) : (
                    <div className="text-xs text-gray-400">
                      Combine: "bîst" + "{numberData?.ku.split(' û ')[1] || ''}"
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-lg font-bold text-kurdish-red">{n}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
          </div>
        )}

        {/* Show More/Less buttons - Only in Learn Mode */}
        {mode === 'learn' && !showAll && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setShowAll(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <ChevronDown className="w-4 h-4" />
              See More Numbers (21-100)
            </button>
          </motion.div>
        )}

        {mode === 'learn' && showAll && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <button
              onClick={() => setShowAll(false)}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <ChevronUp className="w-4 h-4" />
              Show Less (1-20)
            </button>
          </motion.div>
        )}

        {/* Number patterns info - Only in Learn Mode */}
        {mode === 'learn' && showAll && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-white rounded-xl p-6 border"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Number Patterns</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-kurdish-red mb-2">Tens (10, 20, 30...)</h4>
                <p className="text-gray-600">deh (10), bîst (20), sî (30), çil (40), pêncî (50), şêst (60), heftê (70), heştê (80), nod (90), sed (100)</p>
              </div>
              <div>
                <h4 className="font-semibold text-kurdish-red mb-2">Compound Numbers</h4>
                <p className="text-gray-600">Use "û" (and) to connect tens and ones: bîst û yek (21), sî û du (32), çil û pênc (45)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Number Usage Examples - Only in Learn Mode */}
        {mode === 'learn' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{ delay: 0.3 }}
            className="mt-8 card p-6"
          >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-kurdish-red" />
            <h2 className="text-xl font-bold text-gray-800">Number Usage Examples</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {numberExamples.map((example, index) => (
              <motion.div
                key={index}
                initial={{opacity:0, y:10}}
                animate={{opacity:1, y:0}}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 mb-1">{example.ku}</div>
                    <div className="text-sm text-gray-600">{example.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={example.ku} 
                    phoneticText={example.en} 
                    label="Listen" 
                    size="small"
                    audioFile={example.audioFile}
                    onPlay={() => handleAudioPlay(`example-${example.number}-${index}`)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}

        {/* Practice Mode - Game Selector Tabs */}
        {mode === 'practice' && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setPracticeGame('math')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                practiceGame === 'math'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Simple Math
            </button>
            <button
              onClick={() => setPracticeGame('matching')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                practiceGame === 'matching'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Match Words
            </button>
          </div>
        )}

        {/* Practice Mode - Simple Math Section */}
        {mode === 'practice' && practiceGame === 'math' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{ delay: 0.3 }}
            className="mt-8 card p-6"
          >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Simple Math in Kurdish</h2>
            </div>
            {!mathQuizCompleted && (
              <div className="text-sm text-gray-600">
                Question {currentQuestion}/10
              </div>
            )}
          </div>
          
          {mathQuizCompleted ? (
            <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-8 border-2 border-green-200 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-700 mb-2">Quiz Completed!</h3>
              <div className="text-lg text-gray-700 mb-4">
                Score: {mathScore.correct}/{mathScore.total}
              </div>
              <button
                onClick={initializeMathQuiz}
                className="flex items-center gap-2 px-6 py-3 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 border-blue-100">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-kurdish-red mb-2">{mathProblem.question}</div>
                <div className="text-sm text-gray-600">Answer in Kurdish</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {mathProblem.options.map(num => {
                  const isSelected = selectedMathAnswer === num
                  const isCorrect = num === mathProblem.answer
                  const showFeedback = mathFeedback !== null
                  
                  return (
                    <button
                      key={num}
                      onClick={() => handleMathAnswer(num)}
                      disabled={showFeedback}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        showFeedback && isCorrect
                          ? 'bg-green-100 border-green-500'
                          : showFeedback && isSelected && !isCorrect
                          ? 'bg-red-100 border-red-500'
                          : isSelected
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-kurdish-red'
                      }`}
                    >
                      <div className="font-bold text-gray-800">{allNumbers[num]?.ku || ""}</div>
                      {showFeedback && isCorrect && (
                        <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-green-600" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <XCircle className="absolute top-2 right-2 w-5 h-5 text-red-600" />
                      )}
                    </button>
                  )
                })}
              </div>
              
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleNextQuestion}
                  disabled={mathFeedback === null}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                    mathFeedback === null
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-kurdish-red text-white hover:bg-kurdish-red/90'
                  }`}
                  style={{ paddingLeft: '1.5rem', paddingRight: '1.25rem' }}
                >
                  {currentQuestion < 10 ? 'Next' : 'Finish'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
        )}

        {/* Practice Mode - Matching Game */}
        {mode === 'practice' && practiceGame === 'matching' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            transition={{ delay: 0.4 }}
            className="mt-8 card p-6"
          >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shuffle className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Match Kurdish Words with Digits</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Score: {matchScore.correct}/{matchScore.total}
              </div>
              <button
                onClick={initializeMatchingGame}
                className="flex items-center gap-2 px-4 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Digits Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Digits</h3>
              <div className="grid grid-cols-2 gap-3">
                {shuffledDigits.map((digit, index) => {
                  const pair = matchingPairs.find(p => p.digit === digit)
                  const isMatched = pair?.matched || false
                  const isSelected = selectedMatch?.type === 'digit' && selectedMatch.value === digit
                  const isIncorrect = incorrectMatches.some(m => m.type === 'digit' && m.value === digit)
                  return (
                    <button
                      key={`digit-${digit}-${index}`}
                      onClick={() => !isMatched && handleMatchSelect('digit', digit)}
                      disabled={isMatched}
                      className={`p-2 rounded-lg border-2 transition-all h-10 flex items-center justify-center ${
                        isMatched
                          ? 'bg-green-100 border-green-500 opacity-60'
                          : isIncorrect
                          ? 'bg-red-100 border-red-500'
                          : isSelected
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-kurdish-red'
                      }`}
                    >
                      <div className="text-lg font-bold text-kurdish-red">{digit}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Kurdish Words Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Kurdish Words</h3>
              <div className="grid grid-cols-2 gap-3">
                {shuffledKurdishWords.map((ku, index) => {
                  const pair = matchingPairs.find(p => p.ku === ku)
                  const isMatched = pair?.matched || false
                  const isSelected = selectedMatch?.type === 'ku' && selectedMatch.value === ku
                  const isIncorrect = incorrectMatches.some(m => m.type === 'ku' && m.value === ku)
                  return (
                    <button
                      key={`ku-${ku}-${index}`}
                      onClick={() => !isMatched && handleMatchSelect('ku', ku)}
                      disabled={isMatched}
                      className={`p-2 rounded-lg border-2 transition-all h-10 flex items-center justify-center ${
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
          </div>
          
          {matchingPairs.every(p => p.matched) && (
            <motion.div
              initial={{opacity:0, scale:0.9}}
              animate={{opacity:1, scale:1}}
              className="mt-6 text-center p-6 bg-green-50 rounded-xl border-2 border-green-200"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-700 mb-1">Great job!</div>
              <div className="text-sm text-green-600">You matched all numbers correctly!</div>
            </motion.div>
          )}
          </motion.div>
        )}
      </PageContainer>
    </div>
  )
}
