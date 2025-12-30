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

const LESSON_ID = '22' // Prepositions lesson ID

// Prepositions reference table
const prepositionsTable = [
  { ku: "li", en: "at/in/on", example: "li malê", exampleEn: "at home", usage: "Location - where something is" },
  { ku: "ji", en: "from", example: "ji Kurdistanê", exampleEn: "from Kurdistan", usage: "Origin or source" },
  { ku: "bi", en: "with", example: "bi min re", exampleEn: "with me", usage: "Accompaniment (needs 're' after pronoun)" },
  { ku: "bo", en: "for", example: "bo te", exampleEn: "for you", usage: "Purpose or recipient" },
  { ku: "ber", en: "before/in front of", example: "ber malê", exampleEn: "in front of the house", usage: "Position - in front" },
  { ku: "paş", en: "behind/after", example: "paş malê", exampleEn: "behind the house", usage: "Position - behind or time after" },
  { ku: "di...de", en: "in/inside", example: "di odeyê de", exampleEn: "in the room", usage: "Inside something (wraps around noun)" },
  { ku: "li ser", en: "on/on top of", example: "li ser maseyê", exampleEn: "on the table", usage: "Position - on top" }
]

const presentTenseExamples = [
  {
    title: 'Location - "li" (at/in/on)',
    examples: [
      { ku: "Li malê.", en: "at home", audio: true, audioText: "Li malê." },
      { ku: "Li dibistanê.", en: "at school", audio: true, audioText: "Li dibistanê." },
      { ku: "Li bazarê.", en: "at the market", audio: true, audioText: "Li bazarê." },
      { ku: "Ez li malê me.", en: "I am at home", audio: true, audioText: "Ez li malê me" },
      { ku: "Tu li ku yî?", en: "Where are you?", audio: true },
      { ku: "Ew li Kurdistanê ye.", en: "He/She is in Kurdistan", audio: true, audioText: "Ew li Kurdistanê ye" }
    ]
  },
  {
    title: 'Origin - "ji" (from)',
    examples: [
      { ku: "Ji Kurdistanê.", en: "from Kurdistan", audio: true, audioText: "Ji Kurdistanê." },
      { ku: "Ji malê.", en: "from home", audio: true, audioText: "Ji malê." },
      { ku: "Ji bazarê.", en: "from the market", audio: true, audioText: "Ji bazarê." },
      { ku: "Ez ji Kurdistanê me", en: "I am from Kurdistan", audio: true },
      { ku: "Tu ji ku yî?", en: "Where are you from?", audio: true },
      { ku: "Ew ji malê tê", en: "He/She comes from home", audio: true }
    ]
  },
  {
    title: 'Accompaniment - "bi...re" (with)',
    examples: [
      { ku: "Bi min re.", en: "with me", audio: true, audioText: "Bi min re." },
      { ku: "Bi te re.", en: "with you", audio: true, audioText: "Bi te re." },
      { ku: "Bi wî re.", en: "with him", audio: true, audioText: "Bi wî re." },
      { ku: "Bi wê re.", en: "with her", audio: true, audioText: "Bi wê re." },
      { ku: "Ez bi te re diçim.", en: "I go with you", audio: true, audioText: "Ez bi te re diçim" },
      { ku: "Ew bi kurên xwe re ye.", en: "He is with his sons", audio: true, audioText: "Ew bi kurên xwe re ye" }
    ]
  },
  {
    title: 'Purpose - "bo" (for)',
    examples: [
      { ku: "Bo te.", en: "for you", audio: true, audioText: "Bo te." },
      { ku: "Bo min.", en: "for me", audio: true, audioText: "Bo min." },
      { ku: "Bo me.", en: "for us", audio: true, audioText: "Bo me." },
      { ku: "Ez bo te kar dikim", en: "I work for you", audio: true },
      { ku: "Ev pirtûk bo te ye", en: "This book is for you", audio: true }
    ]
  },
  {
    title: 'Position - "ber" and "paş" (before/behind)',
    examples: [
      { ku: "Ber malê.", en: "in front of the house", audio: true, audioText: "Ber malê." },
      { ku: "Paş malê.", en: "behind the house", audio: true, audioText: "Paş malê." },
      { ku: "Ez ber malê me.", en: "I am in front of the house", audio: true, audioText: "Ez ber malê me" },
      { ku: "Ew paş darê ye.", en: "He/She is behind the tree", audio: true, audioText: "Ew paş darê ye" }
    ]
  },
  {
    title: 'Inside - "di...de" (in/inside)',
    examples: [
      { ku: "Di odeyê de.", en: "in the room", audio: true, audioText: "Di odeyê de." },
      { ku: "Di malê de.", en: "in the house", audio: true, audioText: "Di malê de." },
      { ku: "Di dibistanê de.", en: "in the school", audio: true, audioText: "Di dibistanê de." },
      { ku: "Ez di odeyê de me.", en: "I am in the room", audio: true, audioText: "Ez di odeyê de me" },
      { ku: "Pirtûk di odeyê de ye.", en: "The book is in the room", audio: true, audioText: "Pirtûk di odeyê de ye" }
    ]
  },
  {
    title: 'On Top - "li ser" (on)',
    examples: [
      { ku: "Li ser maseyê.", en: "on the table", audio: true, audioText: "Li ser maseyê." },
      { ku: "Li ser kursiyê.", en: "on the chair", audio: true, audioText: "Li ser kursiyê." },
      { ku: "Pirtûk li ser maseyê ye.", en: "The book is on the table", audio: true, audioText: "Pirtûk li ser maseyê ye" },
      { ku: "Ez li ser kursiyê rûniştim.", en: "I sat on the chair", audio: true, audioText: "Ez li ser kursiyê rûniştim" }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Ez malê me",
    correct: "Ez li malê me",
    explanation: "Don't forget 'li' when talking about location! 'li malê' means 'at home'."
  },
  {
    wrong: "Ez Kurdistanê me",
    correct: "Ez ji Kurdistanê me",
    explanation: "Use 'ji' (from) when talking about origin. 'ji Kurdistanê' means 'from Kurdistan'."
  },
  {
    wrong: "bi min",
    correct: "bi min re",
    explanation: "When using 'bi' (with) with pronouns, you need 're' after: 'bi min re' (with me), not just 'bi min'."
  },
  {
    wrong: "di odeyê",
    correct: "di odeyê de",
    explanation: "'di...de' wraps around the noun. You need both 'di' before and 'de' after: 'di odeyê de' (in the room)."
  },
  {
    wrong: "li ser mase",
    correct: "li ser maseyê",
    explanation: "Don't forget the ending on the noun! 'mase' becomes 'maseyê' (the table) after 'li ser'."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'at home' in Kurdish?",
    options: ["malê", "li malê", "ji malê", "bo malê"],
    correct: 1,
    explanation: "Use 'li' for location: li malê (at home). 'ji' = from, 'bo' = for."
  },
  {
    question: "What preposition means 'from'?",
    options: ["li", "ji", "bi", "bo"],
    correct: 1,
    explanation: "'ji' means 'from'. 'li' = at/in, 'bi' = with, 'bo' = for."
  },
  {
    question: "How do you say 'with me'?",
    options: ["bi min", "bi min re", "li min", "ji min"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: bi min re (with me). You need both 'bi' and 're'."
  },
  {
    question: "How do you say 'I am from Kurdistan'?",
    options: ["Ez Kurdistanê me", "Ez li Kurdistanê me", "Ez ji Kurdistanê me", "Ez bo Kurdistanê me"],
    correct: 2,
    explanation: "Use 'ji' for origin: Ez ji Kurdistanê me (I am from Kurdistan)."
  },
  {
    question: "What is 'in the room' in Kurdish?",
    options: ["li odeyê", "ji odeyê", "di odeyê de", "bo odeyê"],
    correct: 2,
    explanation: "Use 'di...de' for inside: di odeyê de (in the room). It wraps around the noun."
  },
  {
    question: "How do you say 'on the table'?",
    options: ["li maseyê", "li ser maseyê", "di maseyê de", "ji maseyê"],
    correct: 1,
    explanation: "Use 'li ser' for on top: li ser maseyê (on the table)."
  },
  {
    question: "What preposition means 'for'?",
    options: ["li", "ji", "bi", "bo"],
    correct: 3,
    explanation: "'bo' means 'for'. 'li' = at/in, 'ji' = from, 'bi' = with."
  },
  {
    question: "How do you say 'in front of the house'?",
    options: ["li malê", "ber malê", "paş malê", "di malê de"],
    correct: 1,
    explanation: "Use 'ber' for in front: ber malê (in front of the house)."
  },
  {
    question: "What is 'behind the house'?",
    options: ["ber malê", "paş malê", "li malê", "ji malê"],
    correct: 1,
    explanation: "Use 'paş' for behind: paş malê (behind the house)."
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu kû yî?", "Tu li kû yî?", "Tu ji kû yî?", "Tu bo kû yî?"],
    correct: 1,
    explanation: "Use 'li kû' for location: Tu li kû yî? (Where are you?). 'kû' = where."
  },
  {
    question: "How do you say 'I go with you'?",
    options: ["Ez bi te diçim", "Ez bi te re diçim", "Ez li te diçim", "Ez ji te diçim"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: Ez bi te re diçim (I go with you)."
  },
  {
    question: "What is 'for you' in Kurdish?",
    options: ["li te", "ji te", "bi te", "bo te"],
    correct: 3,
    explanation: "Use 'bo' for for: bo te (for you)."
  },
  {
    question: "How do you say 'The book is on the table'?",
    options: ["Pirtûk li maseyê ye", "Pirtûk li ser maseyê ye", "Pirtûk di maseyê de ye", "Pirtûk ji maseyê ye"],
    correct: 1,
    explanation: "Use 'li ser' for on: Pirtûk li ser maseyê ye (The book is on the table)."
  },
  {
    question: "What preposition is used for 'inside'?",
    options: ["li", "di...de", "ber", "paş"],
    correct: 1,
    explanation: "'di...de' means 'in/inside'. It wraps around the noun: di odeyê de (in the room)."
  },
  {
    question: "How do you say 'Where are you from?'?",
    options: ["Tu kû yî?", "Tu li kû yî?", "Tu ji kû yî?", "Tu bo kû yî?"],
    correct: 2,
    explanation: "Use 'ji kû' for origin: Tu ji kû yî? (Where are you from?)."
  },
  {
    question: "What is the correct form for 'with him'?",
    options: ["bi wî", "bi wî re", "li wî", "ji wî"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: bi wî re (with him)."
  },
  {
    question: "How do you say 'I am in the room'?",
    options: ["Ez li odeyê me", "Ez di odeyê de me", "Ez ji odeyê me", "Ez bo odeyê me"],
    correct: 1,
    explanation: "Use 'di...de' for inside: Ez di odeyê de me (I am in the room)."
  },
  {
    question: "What preposition means 'before/in front of'?",
    options: ["ber", "paş", "li", "ji"],
    correct: 0,
    explanation: "'ber' means 'before' or 'in front of'. 'paş' = behind, 'li' = at/in, 'ji' = from."
  },
  {
    question: "How do you say 'behind the tree'?",
    options: ["ber darê", "paş darê", "li darê", "di darê de"],
    correct: 1,
    explanation: "Use 'paş' for behind: paş darê (behind the tree)."
  },
  {
    question: "What is the structure for 'di...de'?",
    options: ["di + noun", "noun + de", "di + noun + de", "de + noun + di"],
    correct: 2,
    explanation: "'di...de' wraps around the noun: 'di' comes before and 'de' comes after. Example: di odeyê de (in the room)."
  }
]

export default function PrepositionsPage() {
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
            Prepositions
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to say "at", "from", "with", "for", "in", "on" and more in Kurdish. Perfect for beginners!
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
              className="card p-6 mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Prepositions Work in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Prepositions in Kurdish work similarly to English, but some have special rules. They usually come <span className="font-bold text-kurdish-red">before</span> the noun.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-teal-200">
                  <p className="font-semibold mb-3 text-gray-800">Important Rules:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <span className="font-bold text-kurdish-red">"li"</span> = at/in/on (location)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">li malê</span> (at home)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"ji"</span> = from (origin)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">ji Kurdistanê</span> (from Kurdistan)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"bi...re"</span> = with (needs "re" after pronoun)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">bi min re</span> (with me)</p>
                    </li>
                    <li>
                      <span className="font-bold text-kurdish-red">"di...de"</span> = in/inside (wraps around noun)
                      <p className="text-kurdish-red font-mono ml-4">Example: <span className="bg-yellow-200 px-2 py-1 rounded">di odeyê de</span> (in the room)</p>
                    </li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-teal-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Remember: "bi" needs "re" with pronouns (bi min re), and "di...de" wraps around the noun (di odeyê de). Don't forget the ending on the noun!
                </p>
              </div>
            </motion.div>

            {/* Prepositions Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Prepositions Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-100 to-cyan-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Translation</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prepositionsTable.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{row.ku}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.en}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-mono text-kurdish-red">{row.example}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.exampleEn}</td>
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
