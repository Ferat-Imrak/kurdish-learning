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
  const startTimeRef = useRef<number>(Date.now())
  const audioPlaysRef = useRef<number>(0)
  const [mode, setMode] = useState<'learn' | 'practice'>('learn')
  const [currentExercise, setCurrentExercise] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isCompleted, setIsCompleted] = useState(false)

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

  const handleAudioPlay = () => {
    audioPlaysRef.current += 1
    const currentProgress = getLessonProgress(LESSON_ID)
    const practiceScore = currentProgress.score !== undefined ? (currentProgress.score / 100) * 100 : undefined
    const progress = calculateProgress(practiceScore)
    updateLessonProgress(LESSON_ID, progress, 'IN_PROGRESS')
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
      const practiceScorePercent = (score.correct / score.total) * 100
      const isPracticePassed = practiceScorePercent >= 80
      
      setIsCompleted(isPracticePassed)
      
      // Calculate combined progress
      const progress = calculateProgress(practiceScorePercent)
      
      // Only mark lesson as completed if practice is passed
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS'
      updateLessonProgress(LESSON_ID, progress, status, practiceScorePercent)
    }
  }

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
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">
            Articles & Plurals
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to say "a/an", "the", "this/that" and make plurals. Perfect for beginners!
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
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
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-kurdish-red font-medium text-lg">{example.ku}</div>
                              <div className="text-gray-400 text-xl">|</div>
                              <div className="text-gray-600 text-lg">{example.en}</div>
                            </div>
                          </div>
                          {example.audio && (
                            <AudioButton
                              kurdishText={example.audioText || example.ku}
                              phoneticText={example.en}
                              audioFile={'audioFile' in example ? (example as any).audioFile : undefined}
                              label="Play"
                              size="small"
                              onPlay={handleAudioPlay}
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
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Practice Complete!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  You got <span className="font-bold text-kurdish-red">{score.correct}</span> out of{' '}
                  <span className="font-bold">{score.total}</span> correct!
                </p>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-kurdish-red">
                    {Math.round((score.correct / score.total) * 100)}%
                  </div>
                </div>
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
      </div>
    </div>
  )
}
