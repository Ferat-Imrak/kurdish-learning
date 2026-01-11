"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"

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

const LESSON_ID = '24' // Basic Adjectives lesson ID

// Basic adjectives reference table
const adjectivesTable = [
  { ku: "mezin", en: "big/large", category: "Size", example: "malê mezin", exampleEn: "big house", usage: "Describes size" },
  { ku: "biçûk", en: "small/little", category: "Size", example: "zarokê biçûk", exampleEn: "small child", usage: "Describes size" },
  { ku: "baş", en: "good", category: "Quality", example: "pirtûka baş", exampleEn: "good book", usage: "Describes quality" },
  { ku: "xirab", en: "bad", category: "Quality", example: "hewa xirab", exampleEn: "bad weather", usage: "Describes quality" },
  { ku: "germ", en: "hot", category: "Temperature", example: "hewa germ", exampleEn: "hot weather", usage: "Describes temperature" },
  { ku: "sar", en: "cold", category: "Temperature", example: "av sar", exampleEn: "cold water", usage: "Describes temperature" },
  { ku: "nû", en: "new", category: "Age", example: "pirtûka nû", exampleEn: "new book", usage: "Describes age" },
  { ku: "kevn", en: "old", category: "Age", example: "malê kevn", exampleEn: "old house", usage: "Describes age" },
  { ku: "xweş", en: "nice/pleasant", category: "Quality", example: "roja xweş", exampleEn: "nice day", usage: "Describes pleasantness" },
  { ku: "zû", en: "fast/quick", category: "Speed", example: "otomobîla zû", exampleEn: "fast car", usage: "Describes speed" },
  { ku: "hêdî", en: "slow", category: "Speed", example: "otomobîla hêdî", exampleEn: "slow car", usage: "Describes speed" },
  { ku: "hêsan", en: "easy", category: "Difficulty", example: "karê hêsan", exampleEn: "easy work", usage: "Describes difficulty" },
  { ku: "giran", en: "heavy/difficult", category: "Difficulty", example: "karê giran", exampleEn: "hard work", usage: "Describes difficulty or weight" },
  { ku: "dirêj", en: "long/tall", category: "Size", example: "darê dirêj", exampleEn: "tall tree", usage: "Describes length/height" },
  { ku: "kurt", en: "short", category: "Size", example: "mêra kurt", exampleEn: "short man", usage: "Describes length/height" },
  { ku: "fireh", en: "wide", category: "Size", example: "rêya fireh", exampleEn: "wide road", usage: "Describes width" },
  { ku: "teng", en: "narrow", category: "Size", example: "rêya teng", exampleEn: "narrow road", usage: "Describes width" },
  { ku: "giran", en: "heavy/difficult", category: "Weight", example: "pirtûka giran", exampleEn: "heavy book", usage: "Describes weight (can also mean difficult)" },
  { ku: "sivik", en: "light", category: "Weight", example: "pirtûka sivik", exampleEn: "light book", usage: "Describes weight" },
  { ku: "qelew", en: "fat/thick", category: "Size", example: "mêra qelew", exampleEn: "fat man", usage: "Describes thickness" },
  { ku: "tenik", en: "thin", category: "Size", example: "pirtûka tenik", exampleEn: "thin book", usage: "Describes thickness" }
]

const presentTenseExamples = [
  {
    title: 'Adjectives After Nouns',
    examples: [
      { ku: "Malê mezin.", en: "big house", audio: true, audioText: "Malê mezin." },
      { ku: "Zarokê biçûk.", en: "small child", audio: true, audioText: "Zarokê biçûk." },
      { ku: "Pirtûka baş.", en: "good book", audio: true, audioText: "Pirtûka baş." },
      { ku: "Hewa xirab.", en: "bad weather", audio: true, audioText: "Hewa xirab." },
      { ku: "Av germ.", en: "hot water", audio: true, audioText: "Av germ." },
      { ku: "Av sar.", en: "cold water", audio: true, audioText: "Av sar." }
    ]
  },
  {
    title: 'Adjectives in Sentences',
    examples: [
      { ku: "Malê min mezin e.", en: "My house is big", audio: true, audioText: "Malê min mezin e" },
      { ku: "Zarokê te biçûk e.", en: "Your child is small", audio: true, audioText: "Zarokê te biçûk e" },
      { ku: "Pirtûka wî baş e.", en: "His book is good", audio: true, audioText: "Pirtûka wî baş e" },
      { ku: "Hewa xirab e.", en: "The weather is bad", audio: true, audioText: "Hewa xirab e" },
      { ku: "Av germ e.", en: "The water is hot", audio: true, audioText: "Av germ e" },
      { ku: "Pirtûka nû xweş e.", en: "The new book is nice", audio: true, audioText: "Pirtûka nû xweş e" }
    ]
  },
  {
    title: 'Size Adjectives',
    examples: [
      { ku: "Darê dirêj.", en: "tall tree", audio: true, audioText: "Darê dirêj." },
      { ku: "Mêra kurt.", en: "short man", audio: true, audioText: "Mêra kurt." },
      { ku: "Rêya fireh.", en: "wide road", audio: true, audioText: "Rêya fireh." },
      { ku: "Rêya teng.", en: "narrow road", audio: true, audioText: "Rêya teng." },
      { ku: "Pirtûka giran.", en: "heavy book", audio: true, audioText: "Pirtûka giran." },
      { ku: "Pirtûka sivik.", en: "light book", audio: true, audioText: "Pirtûka sivik." }
    ]
  },
  {
    title: 'Quality & Difficulty',
    examples: [
      { ku: "Karê hêsan.", en: "easy work", audio: true, audioText: "Karê hêsan." },
      { ku: "Karê giran.", en: "hard work", audio: true, audioText: "Karê giran." },
      { ku: "Roja xweş.", en: "nice day", audio: true, audioText: "Roja xweş." },
      { ku: "Pirtûka baş.", en: "good book", audio: true, audioText: "Pirtûka baş." },
      { ku: "Otomobîla zû.", en: "fast car", audio: true, audioText: "Otomobîla zû." },
      { ku: "Otomobîla hêdî.", en: "slow car", audio: true, audioText: "Otomobîla hêdî." }
    ]
  },
  {
    title: 'Age & Condition',
    examples: [
      { ku: "Pirtûka nû.", en: "new book", audio: true, audioText: "Pirtûka nû." },
      { ku: "Malê kevn.", en: "old house", audio: true, audioText: "Malê kevn." },
      { ku: "Kûrsiyê nû.", en: "new chair", audio: true, audioText: "Kûrsiyê nû." },
      { ku: "Kûrsiyê kevn.", en: "old chair", audio: true, audioText: "Kûrsiyê kevn." }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "mezin mal",
    correct: "malê mezin",
    explanation: "In Kurdish, adjectives come AFTER the noun, not before. Also, the noun gets an ending (-ê, -a, -ên) before the adjective."
  },
  {
    wrong: "mal mezin",
    correct: "malê mezin",
    explanation: "Don't forget the ending on the noun! 'mal' becomes 'malê' before the adjective 'mezin' (big)."
  },
  {
    wrong: "baş pirtûk",
    correct: "pirtûka baş",
    explanation: "Adjectives always come after the noun in Kurdish. 'pirtûka baş' (good book), not 'baş pirtûk'."
  },
  {
    wrong: "germ hewa",
    correct: "hewa germ",
    explanation: "Some nouns don't need endings when used with adjectives. 'hewa germ' (hot weather) is correct - the adjective comes after."
  },
  {
    wrong: "mezin malê",
    correct: "malê mezin",
    explanation: "The ending goes on the noun, then the adjective follows. 'malê mezin' (big house), not 'mezin malê'."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'big house' in Kurdish?",
    options: ["mezin mal", "mal mezin", "malê mezin", "mezin malê"],
    correct: 2,
    explanation: "Adjective comes after noun with ending: malê mezin (big house)"
  },
  {
    question: "What does 'biçûk' mean?",
    options: ["big", "small", "good", "bad"],
    correct: 1,
    explanation: "'biçûk' means 'small' or 'little'"
  },
  {
    question: "How do you say 'good book'?",
    options: ["baş pirtûk", "pirtûk baş", "pirtûka baş", "pirtûkê baş"],
    correct: 2,
    explanation: "Use 'pirtûka baş' - adjective comes after noun with ending"
  },
  {
    question: "What is 'cold water' in Kurdish?",
    options: ["sar av", "av sar", "ava sar", "sar avê"],
    correct: 1,
    explanation: "'av sar' (cold water) - some nouns like 'av' (water) don't need endings with certain adjectives"
  },
  {
    question: "What does 'nû' mean?",
    options: ["old", "new", "good", "bad"],
    correct: 1,
    explanation: "'nû' means 'new'"
  },
  {
    question: "How do you say 'hot weather'?",
    options: ["germ hewa", "hewa germ", "hewê germ", "germ hewê"],
    correct: 1,
    explanation: "'hewa germ' (hot weather) - adjective comes after"
  },
  {
    question: "What is 'small child' in Kurdish?",
    options: ["biçûk zarok", "zarok biçûk", "zarokê biçûk", "biçûk zarokê"],
    correct: 2,
    explanation: "'zarokê biçûk' (small child) - noun gets ending, adjective follows"
  },
  {
    question: "What does 'xirab' mean?",
    options: ["good", "bad", "big", "small"],
    correct: 1,
    explanation: "'xirab' means 'bad'"
  },
  {
    question: "How do you say 'old house'?",
    options: ["kevn mal", "mal kevn", "malê kevn", "kevn malê"],
    correct: 2,
    explanation: "'malê kevn' (old house) - adjective after noun with ending"
  },
  {
    question: "What is 'fast car' in Kurdish?",
    options: ["zû otomobîl", "otomobîl zû", "otomobîla zû", "zû otomobîla"],
    correct: 2,
    explanation: "'otomobîla zû' (fast car) - adjective comes after"
  },
  {
    question: "What does 'hêsan' mean?",
    options: ["hard", "easy", "fast", "slow"],
    correct: 1,
    explanation: "'hêsan' means 'easy'"
  },
  {
    question: "How do you say 'tall tree'?",
    options: ["dirêj dar", "dar dirêj", "darê dirêj", "dirêj darê"],
    correct: 2,
    explanation: "'darê dirêj' (tall tree) - adjective after noun"
  },
  {
    question: "What is 'heavy book' in Kurdish?",
    options: ["giran pirtûk", "pirtûk giran", "pirtûka giran", "giran pirtûka"],
    correct: 2,
    explanation: "'pirtûka giran' (heavy book) - adjective follows noun"
  },
  {
    question: "What does 'xweş' mean?",
    options: ["bad", "nice/pleasant", "big", "small"],
    correct: 1,
    explanation: "'xweş' means 'nice' or 'pleasant'"
  },
  {
    question: "How do you say 'wide road'?",
    options: ["fireh rê", "rê fireh", "rêya fireh", "fireh rêya"],
    correct: 2,
    explanation: "'rêya fireh' (wide road) - adjective after noun"
  },
  {
    question: "What is 'slow car' in Kurdish?",
    options: ["hêdî otomobîl", "otomobîl hêdî", "otomobîla hêdî", "hêdî otomobîla"],
    correct: 2,
    explanation: "'otomobîla hêdî' (slow car)"
  },
  {
    question: "What does 'giran' mean?",
    options: ["easy", "heavy/difficult", "fast", "slow"],
    correct: 1,
    explanation: "'giran' means 'heavy' or 'difficult' (can mean both depending on context)"
  },
  {
    question: "How do you say 'light book'?",
    options: ["sivik pirtûk", "pirtûk sivik", "pirtûka sivik", "sivik pirtûka"],
    correct: 2,
    explanation: "'pirtûka sivik' (light book)"
  },
  {
    question: "What is 'narrow road' in Kurdish?",
    options: ["teng rê", "rê teng", "rêya teng", "teng rêya"],
    correct: 2,
    explanation: "'rêya teng' (narrow road)"
  },
  {
    question: "What does 'kevn' mean?",
    options: ["new", "old", "good", "bad"],
    correct: 1,
    explanation: "'kevn' means 'old'"
  }
]

export default function BasicAdjectivesPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const startTimeRef = useRef<number>(Date.now())
  const audioPlaysRef = useRef<number>(0)
  const [mode, setMode] = useState<'learn' | 'practice'>('learn')
  const [currentSection, setCurrentSection] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({})
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [practiceComplete, setPracticeComplete] = useState(false)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  // Mark lesson as in progress on mount
  useEffect(() => {
    const progress = getLessonProgress(LESSON_ID)
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
  }, [getLessonProgress, updateLessonProgress])

  const calculateProgress = (practiceScore?: number) => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60) // minutes
    // Audio clicks: max 30% (10 clicks = 30%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 3)
    // Time spent: max 20% (4 minutes = 20%)
    const timeProgress = Math.min(20, timeSpent * 5)
    // Practice score: max 50% (if practice exists)
    const practiceProgress = practiceScore !== undefined ? Math.min(50, practiceScore * 0.5) : 0
    return Math.min(100, audioProgress + timeProgress + practiceProgress)
  }

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    if (showFeedback[questionIndex]) return
    
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }))
    setShowFeedback(prev => ({ ...prev, [questionIndex]: true }))
    
    const isCorrect = practiceExercises[questionIndex].correct === answerIndex
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }))

    // Check if all questions answered
    const allAnswered = Object.keys(selectedAnswers).length + 1 === practiceExercises.length
    if (allAnswered) {
      setTimeout(() => {
        // Calculate practice score percentage (score is already updated)
        const finalScore = {
          correct: score.correct + (isCorrect ? 1 : 0),
          total: score.total + 1
        }
        const practiceScorePercent = (finalScore.correct / finalScore.total) * 100
        const isPracticePassed = practiceScorePercent >= 80
        
        setPracticeComplete(isPracticePassed)
        
        // Calculate combined progress
        const progress = calculateProgress(practiceScorePercent)
        
        // Only mark lesson as completed if practice is passed
        const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
        updateLessonProgress(LESSON_ID, progress, status, practiceScorePercent)
      }, 500)
    }
  }

  const resetPractice = () => {
    setSelectedAnswers({})
    setShowFeedback({})
    setScore({ correct: 0, total: 0 })
    setPracticeComplete(false)
  }

  const handleAudioPlay = () => {
    audioPlaysRef.current += 1
    const currentProgress = getLessonProgress(LESSON_ID)
    const practiceScore = currentProgress.score !== undefined ? (currentProgress.score / 100) * 100 : undefined
    const progress = calculateProgress(practiceScore)
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'
    updateLessonProgress(LESSON_ID, progress, status)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">
            Basic Adjectives
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Learn how to describe things in Kurdish - size, quality, temperature, and more
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('learn')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'learn'
                ? 'bg-kurdish-red text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              mode === 'practice'
                ? 'bg-kurdish-red text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Practice
          </button>
        </div>

        {/* Learn Mode */}
        {mode === 'learn' && (
          <div className="space-y-8">
            {/* Key Rule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                📝 How Adjectives Work in Kurdish
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  In Kurdish, adjectives come <span className="font-bold text-kurdish-red">after</span> the noun, not before it like in English.
                </p>
                <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                <div className="bg-white p-4 rounded-lg border-2 border-kurdish-red">
                  <p className="text-center font-mono text-lg">
                    Noun + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Ending</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Adjective</span>
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-semibold">Example:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><span className="font-bold">mal</span> (house) → <span className="bg-yellow-200 px-2 py-1 rounded">malê</span> (for singular)</li>
                    <li><span className="bg-yellow-200 px-2 py-1 rounded">malê</span> + <span className="font-bold">mezin</span> (big)</li>
                    <li>= <span className="font-bold">malê mezin</span> (big house)</li>
                  </ul>
                </div>
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Remember: <span className="font-bold">Noun + Ending + Adjective</span> - the opposite of English! Some nouns don't need endings (like "hewa germ" - hot weather).
                </p>
              </div>
            </motion.div>

            {/* Adjectives Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Basic Adjectives Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Category</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjectivesTable.map((adj, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{adj.ku}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">{adj.en}</td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{adj.category}</td>
                        <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{adj.example}</td>
                        <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">{adj.exampleEn}</td>
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
              className="card p-6 bg-red-50 border-2 border-red-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                ⚠️ Common Mistakes
              </h2>
              <div className="space-y-4">
                {commonMistakes.map((mistake, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="font-bold text-red-600">Wrong:</span>{" "}
                          <span className="font-mono bg-red-100 px-2 py-1 rounded">{mistake.wrong}</span>
                        </div>
                        <div className="mb-2">
                          <span className="font-bold text-green-600">Correct:</span>{" "}
                          <span className="font-mono text-green-600 font-bold">{mistake.correct}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{mistake.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Examples by Category */}
            {presentTenseExamples.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                ref={(el) => { sectionRefs.current[sectionIndex] = el }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + sectionIndex * 0.1 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">{section.title}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {section.examples.map((example, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-bold text-kurdish-red mb-1">{example.ku}</div>
                          <div className="text-sm text-gray-600">{example.en}</div>
                        </div>
                        {example.audio && (
                          <AudioButton
                            kurdishText={example.audioText || example.ku}
                            phoneticText={example.en.toUpperCase()}
                            label="Listen"
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(example.audioText || example.ku)}.mp3`}
                            onPlay={handleAudioPlay}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Practice Mode */}
        {mode === 'practice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            {!practiceComplete ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Practice Exercise</h2>
                  <div className="text-sm text-gray-600">
                    {Object.keys(selectedAnswers).length + (showFeedback[Object.keys(selectedAnswers).length] ? 1 : 0)} / {practiceExercises.length}
                  </div>
                </div>

                <div className="space-y-6">
                  {practiceExercises.map((exercise, index) => {
                    const isAnswered = showFeedback[index]
                    const selectedAnswer = selectedAnswers[index]
                    const isCorrect = selectedAnswer === exercise.correct

                    return (
                      <div
                        key={index}
                        className={`p-5 rounded-lg border-2 transition-all ${
                          isAnswered
                            ? isCorrect
                              ? 'bg-green-50 border-green-300'
                              : 'bg-red-50 border-red-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <p className="text-lg font-semibold text-gray-800 mb-4">
                          {index + 1}. {exercise.question}
                        </p>
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          {exercise.options.map((option, optIndex) => {
                            const isSelected = selectedAnswer === optIndex
                            const showCorrect = isAnswered && optIndex === exercise.correct
                            const showWrong = isAnswered && isSelected && !isCorrect

                            return (
                              <button
                                key={optIndex}
                                onClick={() => !isAnswered && handleAnswer(index, optIndex)}
                                disabled={isAnswered}
                                className={`p-3 rounded-lg border-2 transition-all text-left ${
                                  showCorrect
                                    ? 'bg-green-200 border-green-500'
                                    : showWrong
                                    ? 'bg-red-200 border-red-500'
                                    : isSelected
                                    ? 'bg-blue-100 border-blue-400'
                                    : 'bg-white border-gray-300 hover:border-kurdish-red hover:bg-gray-50'
                                } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center gap-2">
                                  {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                  {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                                  <span className="font-medium">{option}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        {isAnswered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`mt-3 p-3 rounded-lg ${
                              isCorrect ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            <p className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{exercise.explanation}</p>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                  <p className="text-lg text-gray-600 mb-2">
                    You got <span className="font-bold text-kurdish-red">{score.correct}</span> out of{' '}
                    <span className="font-bold">{score.total}</span> correct!
                  </p>
                  <div className="text-3xl font-bold text-kurdish-red">
                    {Math.round((score.correct / score.total) * 100)}%
                  </div>
                </motion.div>
                <button
                  onClick={resetPractice}
                  className="bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold py-3 px-8 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
