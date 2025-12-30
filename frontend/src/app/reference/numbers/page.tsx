"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, ArrowLeft, Calculator, BookOpen, Shuffle, CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

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

export default function NumbersPage() {
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
  
  const [showAll, setShowAll] = useState(false)
  const [mathProblem, setMathProblem] = useState(generateMathProblem())
  const [selectedMathAnswer, setSelectedMathAnswer] = useState<number | null>(null)
  const [mathFeedback, setMathFeedback] = useState<boolean | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [mathScore, setMathScore] = useState({ correct: 0, total: 0 })
  const [mathQuizCompleted, setMathQuizCompleted] = useState(false)
  const [practiceGame, setPracticeGame] = useState<'math' | 'matching'>('math')
  
  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ digit: number; ku: string; matched: boolean }>>([])
  const [shuffledDigits, setShuffledDigits] = useState<number[]>([])
  const [shuffledKurdishWords, setShuffledKurdishWords] = useState<string[]>([])
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'digit' | 'ku'; value: number | string } | null>(null)
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 })
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'digit' | 'ku'; value: number | string }>>([])
  
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
            setMatchingPairs(prev => prev.map(p => 
              p.digit === digitValue ? { ...p, matched: true } : p
            ))
            setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
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
            setMatchingPairs(prev => prev.map(p => 
              p.digit === digitValue ? { ...p, matched: true } : p
            ))
            setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
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
      setMathQuizCompleted(true)
    }
  }
  
  // Initialize matching game and math quiz on mount and when switching to practice mode
  useEffect(() => {
    if (mode === 'practice') {
      initializeMatchingGame()
      initializeMathQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])
  
  // Show numbers 1-19, key numbers (20, 30, 40, 50, 60, 70, 80, 90, 100), and compound numbers (21-29)
  const selectedNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 40, 50, 60, 70, 80, 90, 100]
  const displayedNumbers = showAll ? selectedNumbers : selectedNumbers.slice(0, 20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">
            Numbers
          </h1>
          <div />
        </div>

        <p className="text-gray-700 mb-6 text-center">
          Learn Kurdish numbers with pronunciation and number patterns.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('learn')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'learn'
                ? 'bg-kurdish-red text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'practice'
                ? 'bg-kurdish-red text-white shadow-lg'
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
                      size="medium"
                      audioFile={`/audio/kurdish-tts-mp3/numbers/${getNumberAudioFile(numberData.ku)}.mp3`}
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
      </div>
    </div>
  )
}
