"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
const animals = [
  { en: "Cat", ku: "pisîk", icon: "🐱", audioFile: "pisik.mp3" },
  { en: "Dog", ku: "se", icon: "🐶", audioFile: "se.mp3" },
  { en: "Bird", ku: "balinde", icon: "🐦", audioFile: "balinde.mp3" },
  { en: "Cow", ku: "çêlek", icon: "🐮", audioFile: "celek.mp3" },
  { en: "Bull", ku: "ga", icon: "🐂", audioFile: "ga.mp3" },
  { en: "Horse", ku: "hesp", icon: "🐴", audioFile: "hesp.mp3" },
  { en: "Fish", ku: "masî", icon: "🐟", audioFile: "masi.mp3" },
  { en: "Lion", ku: "şêr", icon: "🦁", audioFile: "ser.mp3" },
  { en: "Goat", ku: "bizin", icon: "🐐", audioFile: "bizin.mp3" },
  { en: "Sheep", ku: "pez", icon: "🐑", audioFile: "pez.mp3" },
  { en: "Elephant", ku: "fîl", icon: "🐘", audioFile: "fil.mp3" },
  { en: "Monkey", ku: "meymûn", icon: "🐵", audioFile: "meymun.mp3" },
  { en: "Wolf", ku: "gur", icon: "🐺", audioFile: "gur.mp3" },
  { en: "Snake", ku: "mar", icon: "🐍", audioFile: "mar.mp3" },
  { en: "Rabbit", ku: "kevroşk", icon: "🐰", audioFile: "kevrosk.mp3" },
  { en: "Chicken", ku: "mirîşk", icon: "🐔", audioFile: "mirisk.mp3" },
  { en: "Rooster", ku: "dîk", icon: "🐓", audioFile: "dik.mp3" },
  { en: "Tiger", ku: "piling", icon: "🐯", audioFile: "piling.mp3" },
  { en: "Bear", ku: "hirç", icon: "🐻", audioFile: "hirc.mp3" },
  { en: "Fox", ku: "rovî", icon: "🦊", audioFile: "rovi.mp3" },
  { en: "Butterfly", ku: "perperok", icon: "🦋", audioFile: "perperok.mp3" },
  { en: "Mouse", ku: "mişk", icon: "🐭", audioFile: "misk.mp3" },
  { en: "Duck", ku: "werdek", icon: "🦆", audioFile: "werdek.mp3" },
  { en: "Pig", ku: "beraz", icon: "🐷", audioFile: "beraz.mp3" },
  { en: "Donkey", ku: "ker", icon: "🫏", audioFile: "ker.mp3" },
  { en: "Owl", ku: "kund", icon: "🦉", audioFile: "kund.mp3" },
  { en: "Turkey", ku: "elok", icon: "🦃", audioFile: "elok.mp3" },
  { en: "Hedgehog", ku: "jûjî", icon: "🦔", audioFile: "juji.mp3" },
  { en: "Crow", ku: "qel", icon: "🐦‍⬛", audioFile: "qel.mp3" },
]

// Animal questions
const animalQuestions = [
  { ku: "Ev çi heywan e?", en: "What animal is this?", audioFile: "/audio/kurdish-tts-mp3/animals/ev-ci-heywan-e.mp3" },
  { ku: "Tu heywanekî xwe heye?", en: "Do you have a pet?", audioFile: "/audio/kurdish-tts-mp3/animals/tu-heywanki-xwe-heye.mp3" },
  { ku: "Heywana te çi ye?", en: "What is your pet?", audioFile: "/audio/kurdish-tts-mp3/animals/heywana-te-ci-ye.mp3" },
  { ku: "Tu kîjan heywanan hez dikî?", en: "Which animals do you like?", audioFile: "/audio/kurdish-tts-mp3/animals/tu-kijan-heywanan-hez-diki.mp3" },
]

interface ExerciseItem {
  ku: string
  en: string
  audioFile: string
  icon: string
}

const QUESTIONS_PER_SESSION = 10
const LESSON_ID = '9' // Animals lesson ID

export default function AnimalsWordsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [mode, setMode] = useState<'learn' | 'practice'>('learn')
  const [currentExercise, setCurrentExercise] = useState<ExerciseItem | null>(null)
  const [options, setOptions] = useState<ExerciseItem[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const startTimeRef = useRef<number>(Date.now())
  const audioPlaysRef = useRef<Set<string>>(new Set())

  // Generate all possible exercise items from animals
  const allExerciseItems: ExerciseItem[] = animals.map(animal => ({
    ku: animal.ku,
    en: animal.en,
    audioFile: `/audio/kurdish-tts-mp3/animals/${animal.audioFile}`,
    icon: animal.icon
  }))

  // Generate new exercise
  const generateExercise = () => {
    const randomItem = allExerciseItems[Math.floor(Math.random() * allExerciseItems.length)]
    setCurrentExercise(randomItem)
    
    // Generate 3 wrong options
    const wrongOptions = allExerciseItems
      .filter(item => item.ku !== randomItem.ku)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    // Combine correct answer with wrong options and shuffle
    const allOptions = [randomItem, ...wrongOptions].sort(() => Math.random() - 0.5)
    setOptions(allOptions)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  // Start new practice session
  const startPracticeSession = () => {
    setScore({ correct: 0, total: 0 })
    setCurrentQuestion(1)
    setIsCompleted(false)
    generateExercise()
  }

  // Initialize first exercise when switching to practice mode
  useEffect(() => {
    if (mode === 'practice' && !currentExercise && !isCompleted) {
      startPracticeSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const handleAnswerSelect = (answerKu: string) => {
    if (showFeedback || isCompleted) return
    
    setSelectedAnswer(answerKu)
    const isCorrect = answerKu === currentExercise?.ku
    setShowFeedback(true)
    const newTotal = score.total + 1
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: newTotal
    }))
    
    // Check if this was the last question
    if (newTotal >= QUESTIONS_PER_SESSION) {
      setIsCompleted(true)
    }
  }

  const handleNext = () => {
    if (currentQuestion >= QUESTIONS_PER_SESSION) {
      setIsCompleted(true)
      return
    }
    setCurrentQuestion(prev => prev + 1)
    generateExercise()
  }

  const handleRestart = () => {
    startPracticeSession()
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href={`/learn`} className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Animals</h1>
          
          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => {
                setMode('learn')
                setScore({ correct: 0, total: 0 })
                setCurrentExercise(null)
                setCurrentQuestion(0)
                setIsCompleted(false)
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                mode === 'learn'
                  ? 'bg-kurdish-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Learn
            </button>
            <button
              onClick={() => {
                setMode('practice')
                startPracticeSession()
              }}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                mode === 'practice'
                  ? 'bg-kurdish-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Practice
            </button>
          </div>
        </div>

        {/* Practice Mode - Listening Exercise */}
        {mode === 'practice' && currentExercise && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-6"
          >
            <div className="p-6">
              {/* Completion Message */}
              {isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mb-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Great job!</h2>
                    <p className="text-gray-600 mb-4">
                      You got {score.correct} out of {QUESTIONS_PER_SESSION} correct
                    </p>
                    <div className="text-3xl font-bold text-kurdish-red">
                      {Math.round((score.correct / QUESTIONS_PER_SESSION) * 100)}%
                    </div>
                  </div>
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-kurdish-red text-white rounded-lg font-medium hover:bg-kurdish-red/90 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Score and Progress */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-sm text-gray-600">
                      Question {currentQuestion} of {QUESTIONS_PER_SESSION}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      Score: {score.correct}/{score.total}
                    </div>
                  </div>

                  {/* Audio Button */}
                  <div className="text-center mb-6">
                    <p className="text-gray-600 mb-3">Listen to the animal name:</p>
                    <AudioButton
                      kurdishText={currentExercise.ku}
                      phoneticText={currentExercise.en}
                      label="Play Audio"
                      size="large"
                      audioFile={currentExercise.audioFile}
                    />
                  </div>

                  {/* Answer Options */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {options.map((option, index) => {
                      const isSelected = selectedAnswer === option.ku
                      const isCorrect = option.ku === currentExercise.ku
                      const showCorrect = showFeedback && isCorrect
                      const showIncorrect = showFeedback && isSelected && !isCorrect

                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option.ku)}
                          disabled={showFeedback}
                          className={`
                            p-4 rounded-xl border-2 transition-all duration-200
                            ${showCorrect 
                              ? 'border-green-500 bg-green-50' 
                              : showIncorrect
                              ? 'border-red-500 bg-red-50'
                              : isSelected
                              ? 'border-kurdish-red bg-kurdish-red/10'
                              : 'border-gray-200 bg-white hover:border-kurdish-red/50 hover:bg-kurdish-red/5'
                            }
                            ${showFeedback ? 'cursor-default' : 'cursor-pointer'}
                            disabled:opacity-50
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="text-left flex-1">
                              <div className="font-semibold text-gray-800">{option.en}</div>
                            </div>
                            {showCorrect && (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {showIncorrect && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Next Button */}
                  {showFeedback && !isCompleted && (
                    <div className="text-center">
                      <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-kurdish-green text-white rounded-lg font-semibold hover:bg-kurdish-green/90 transition-colors"
                      >
                        {currentQuestion >= QUESTIONS_PER_SESSION ? 'Finish' : 'Next Question'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Learn Mode - Animal Cards */}
        {mode === 'learn' && (
          <>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {animals.map((a) => (
            <motion.div key={a.en} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
              <div className="font-bold text-gray-800 text-center">{a.ku.charAt(0).toUpperCase() + a.ku.slice(1)}</div>
              <div className="text-gray-600 mb-4 text-center">{a.en}</div>
              <div className="flex items-center justify-between">
                <AudioButton
                  kurdishText={a.ku}
                  phoneticText={a.en}
                  label="Listen"
                  size="medium"
                  audioFile={a.audioFile ? `/audio/kurdish-tts-mp3/animals/${a.audioFile}` : undefined}
                />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                  <span className="text-xl">{a.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animal Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❓</span>
            Animal Questions
          </h2>
          <div className="space-y-4">
            {animalQuestions.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, x:-10}} 
                animate={{opacity:1, x:0}}
                transition={{delay: index * 0.1}}
                className="p-4 rounded-2xl border bg-gradient-to-r from-blue-50 to-purple-50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                    <div className="text-gray-600">{item.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  )
}


