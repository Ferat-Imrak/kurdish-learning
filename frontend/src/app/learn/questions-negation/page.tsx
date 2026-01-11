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

const LESSON_ID = '20' // Questions & Negation lesson ID

// Question words reference table
const questionWordsTable = [
  { ku: "kî", en: "who", example: "Ew kî ye?", exampleEn: "Who is he/she?" },
  { ku: "çi", en: "what", example: "Ev çi ye?", exampleEn: "What is this?" },
  { ku: "kû", en: "where", example: "Tu kû yî?", exampleEn: "Where are you?" },
  { ku: "kengî", en: "when", example: "Tu kengî diçî?", exampleEn: "When do you go?" },
  { ku: "çima", en: "why", example: "Tu çima li vir yî?", exampleEn: "Why are you here?" },
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
      { ku: "Tu çima li vir yî?", en: "Why are you here?", audio: true },
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
      { ku: "Tu li vir nîyî.", en: "You are not here", audio: true, audioText: "Tu li vir nîyî" },
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
    options: ["Ez naxwim", "Ez nedixwim", "Ez dixwim ne", "Ez ne dixwim"],
    correct: 0,
    explanation: "Replace 'di-' with 'na-': dixwim → naxwim (I don't eat)"
  },
  {
    question: "How do you say 'I am not a student'?",
    options: ["Ez xwendekar nînim", "Ez xwendekar nîne", "Ez xwendekar nînin", "Ez xwendekar nîyî"],
    correct: 0,
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
    options: ["Ev çi ye?", "Ew çi ye?", "Ev çi e?", "Ew çi e?"],
    correct: 0,
    explanation: "'Ev çi ye?' = 'What is this?' Use 'Ev' for 'this' and 'ye' for 'is'"
  },
  {
    question: "What is the negative of 'Tu dixwî' (You eat)?",
    options: ["Tu naxwî", "Tu nedixwî", "Tu dixwî ne", "Tu ne dixwî"],
    correct: 0,
    explanation: "Replace 'di-' with 'na-': dixwî → naxwî (you don't eat)"
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu kû yî?", "Tu kû î?", "Tu kû e?", "Tu kû in?"],
    correct: 0,
    explanation: "For 'Tu' (you), use 'yî': Tu kû yî? (Where are you?)"
  },
  {
    question: "What question word means 'when'?",
    options: ["kengî", "kû", "çima", "çawa"],
    correct: 0,
    explanation: "'kengî' means 'when'. 'kû' = where, 'çima' = why, 'çawa' = how"
  },
  {
    question: "How do you say 'We don't eat'?",
    options: ["Em naxwin", "Em nedixwin", "Em dixwin ne", "Em ne dixwin"],
    correct: 0,
    explanation: "Replace 'di-' with 'na-': dixwin → naxwin (we don't eat)"
  },
  {
    question: "What is the negative of 'Ew li malê ye' (He/She is at home)?",
    options: ["Ew li malê nîne", "Ew li malê nînim", "Ew li malê nînin", "Ew li malê nîyî"],
    correct: 0,
    explanation: "For 'Ew' (he/she), use 'nîne': Ew li malê nîne (He/She is not at home)"
  },
  {
    question: "How do you say 'Why are you here?'?",
    options: ["Tu çima li vir yî?", "Tu çima li vir î?", "Tu çima li vir e?", "Tu çima li vir in?"],
    correct: 0,
    explanation: "For 'Tu' (you), use 'yî': Tu çima li vir yî? (Why are you here?)"
  },
  {
    question: "What question word means 'why'?",
    options: ["çima", "çawa", "kengî", "kû"],
    correct: 0,
    explanation: "'çima' means 'why'. 'çawa' = how, 'kengî' = when, 'kû' = where"
  },
  {
    question: "How do you say 'They are not students'?",
    options: ["Ewan xwendekar nînin", "Ewan xwendekar nînim", "Ewan xwendekar nîne", "Ewan xwendekar nîyî"],
    correct: 0,
    explanation: "For plural 'Ewan' (they), use 'nînin': Ewan xwendekar nînin"
  },
  {
    question: "What is the correct negative sentence for 'I don't go'?",
    options: ["Ez naçim", "Ez neçim", "Ez çim ne", "Ez ne çim"],
    correct: 0,
    explanation: "For 'çûn' (to go), use 'naçim' (I don't go). Some verbs use 'ne-' instead of 'na-'."
  },
  {
    question: "How do you say 'What do you eat?'?",
    options: ["Tu çi dixwî?", "Tu çi naxwî?", "Tu çi ye?", "Tu çi dike?"],
    correct: 0,
    explanation: "Question word 'çi' (what) + subject + verb: Tu çi dixwî? (What do you eat?)"
  },
  {
    question: "What is the negative of 'Em li derve ne' (We are outside)?",
    options: ["Em li derve nînin", "Em li derve nînim", "Em li derve nîne", "Em li derve nîyî"],
    correct: 0,
    explanation: "For 'Em' (we), use 'nînin': Em li derve nînin (We are not outside)"
  },
  {
    question: "How do you say 'When do you go?'?",
    options: ["Tu kengî diçî?", "Tu kengî naçî?", "Tu kengî yî?", "Tu kengî e?"],
    correct: 0,
    explanation: "Question word 'kengî' (when) + subject + verb: Tu kengî diçî? (When do you go?)"
  },
  {
    question: "What question word means 'how'?",
    options: ["çawa", "çima", "kengî", "kû"],
    correct: 0,
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
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">
            Questions & Negation
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to ask questions and make negative sentences. Perfect for beginners!
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
                              audioFile={example.audioFile}
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
