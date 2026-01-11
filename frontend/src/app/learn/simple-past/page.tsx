"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
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

const LESSON_ID = '16' // Simple Past Tense lesson ID

// Conjugation table data
const conjugationTable = [
  { pronoun: "Min", pronounEn: "I", example: "xwar", exampleEn: "I ate" },
  { pronoun: "Te", pronounEn: "You", example: "xwar", exampleEn: "You ate" },
  { pronoun: "Wî", pronounEn: "He", example: "xwar", exampleEn: "He ate" },
  { pronoun: "Wê", pronounEn: "She", example: "xwar", exampleEn: "She ate" },
  { pronoun: "Me", pronounEn: "We", example: "xwar", exampleEn: "We ate" },
  { pronoun: "We", pronounEn: "You (plural)", example: "xwar", exampleEn: "You ate" },
  { pronoun: "Wan", pronounEn: "They", example: "xwar", exampleEn: "They ate" }
]

const pronounComparison = [
  { present: "Ez", past: "Min", en: "I" },
  { present: "Tu", past: "Te", en: "You" },
  { present: "Ew", past: "Wî/Wê", en: "He/She" },
  { present: "Em", past: "Me", en: "We" },
  { present: "Hûn", past: "We", en: "You (plural)" },
  { present: "Ewan", past: "Wan", en: "They" }
]

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", past: "xwar" },
  { infinitive: "çûn", en: "to go", past: "çû" },
  { infinitive: "kirin", en: "to do", past: "kir" },
  { infinitive: "xwendin", en: "to read", past: "xwend" },
  { infinitive: "hatin", en: "to come", past: "hat" },
  { infinitive: "dîtin", en: "to see", past: "dît" },
  { infinitive: "bihîstin", en: "to hear", past: "bihîst" },
  { infinitive: "axaftin", en: "to speak", past: "axaft" }
]

const pastTenseExamples = [
  {
    title: 'Daily Activities - Past Tense',
    examples: [
      { ku: "Min nan xwar.", en: "I ate bread", audio: true, audioText: "Min nan xwar" },
      { ku: "Te pirtûk xwend.", en: "You read a book", audio: true, audioText: "Te pirtûk xwend" },
      { ku: "Wî çû malê.", en: "He went home", audio: true, audioText: "Wî çû malê" },
      { ku: "Min îro çi kir?", en: "What did I do today?", audio: true },
      { ku: "Te çayê vexwar.", en: "You drank tea", audio: true, audioText: "Te çayê vexwar" },
      { ku: "Wê pirtûkek kirî.", en: "She bought a book", audio: true, audioText: "Wê pirtûkek kirî" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Min dît.", en: "I saw", audio: true, audioText: "Min dît" },
      { ku: "Te bihîst.", en: "You heard", audio: true, audioText: "Te bihîst" },
      { ku: "Wî axaft.", en: "He spoke", audio: true, audioText: "Wî axaft" },
      { ku: "Me kir.", en: "We did", audio: true, audioText: "Me kir" },
      { ku: "Ew hatin.", en: "They came", audio: true, audioText: "Ew hatin" },
      { ku: "Min çû bazarê.", en: "I went to the market", audio: true, audioText: "Min çû bazarê" }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Min nexwar.", en: "I didn't eat", audio: true, audioText: "Min nexwar" },
      { ku: "Te nexwar.", en: "You didn't eat", audio: true, audioText: "Te nexwar" },
      { ku: "Wî nexwar.", en: "He didn't eat", audio: true, audioText: "Wî nexwar" },
      { ku: "Me nexwar.", en: "We didn't eat", audio: true, audioText: "Me nexwar" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Te çi xwar?", en: "What did you eat?", audio: true },
      { ku: "Wî çû ku derê?", en: "Where did he go?", audio: true, audioText: "Wî çû ku derê" },
      { ku: "Tu kengî hatî?", en: "When did you come?", audio: true },
      { ku: "Min çi kir?", en: "What did I do?", audio: true }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Ez xwar",
    correct: "Min xwar",
    explanation: "Past tense uses 'Min' instead of 'Ez'. Always remember: past tense = different pronouns!"
  },
  {
    wrong: "Tu dixwar",
    correct: "Te xwar",
    explanation: "Past tense doesn't use 'di-' prefix. Also use 'Te' instead of 'Tu'."
  },
  {
    wrong: "Ew xwar",
    correct: "Wî xwar (or Wê xwar)",
    explanation: "For 'Ew' in past tense, use 'Wî' (he) or 'Wê' (she), not 'Ew'."
  },
  {
    wrong: "Min dixwar",
    correct: "Min xwar",
    explanation: "Past tense verbs don't have the 'di-' prefix. The verb form is simpler and shorter."
  }
]

// Practice exercises
const practiceExercises = [
  {
    question: "How do you say 'I ate' in Kurdish?",
    options: ["Ez xwar", "Min xwar", "Min dixwar", "Ez dixwim"],
    correct: 1,
    explanation: "Past tense uses 'Min' (not 'Ez') and no 'di-' prefix. Just 'Min xwar'."
  },
  {
    question: "What is the correct past tense form for 'You went'?",
    options: ["Tu çûyî", "Te çû", "Tu diçî", "Te diçû"],
    correct: 1,
    explanation: "Past tense: Te (not Tu) + past verb form (çû). No 'di-' prefix needed."
  },
  {
    question: "Which pronoun is used for 'I' in past tense?",
    options: ["Ez", "Min", "Me", "Wî"],
    correct: 1,
    explanation: "Past tense always uses 'Min' for 'I', never 'Ez'."
  },
  {
    question: "How do you say 'He didn't eat'?",
    options: ["Wî nexwar", "Ew nexwar", "Wî naxwar", "Ew naxwe"],
    correct: 0,
    explanation: "Past negative: Wî (not Ew) + ne- prefix + past verb = Wî nexwar"
  },
  {
    question: "What is the main difference between present and past tense pronouns?",
    options: ["They are the same", "Past uses different pronouns (Min/Te/Wî)", "Past uses longer forms", "No difference"],
    correct: 1,
    explanation: "Past tense uses completely different pronouns: Min/Te/Wî instead of Ez/Tu/Ew"
  },
  {
    question: "How do you say 'I read' in past tense?",
    options: ["Ez xwend", "Min xwend", "Ez dixwînim", "Min dixwend"],
    correct: 1,
    explanation: "Past tense: Min (not Ez) + past verb form (xwend) = Min xwend"
  },
  {
    question: "What is 'Te xwar' in English?",
    options: ["I ate", "You ate", "He ate", "We ate"],
    correct: 1,
    explanation: "Te = You (past tense), xwar = ate"
  },
  {
    question: "Which is correct for 'She went'?",
    options: ["Ew çû", "Wê çû", "Ew diçe", "Wê diçe"],
    correct: 1,
    explanation: "Past tense: Wê (not Ew) + past verb (çû) = Wê çû"
  },
  {
    question: "How do you say 'They came' in past tense?",
    options: ["Ewan hatin", "Ew hatin", "Ewan hat", "Wan hat"],
    correct: 1,
    explanation: "Past tense: Ew + past verb (hatin) = Ew hatin"
  },
  {
    question: "What is the negative form of 'Min xwar'?",
    options: ["Min nexwar", "Ez naxwim", "Min naxwar", "Ez nexwar"],
    correct: 0,
    explanation: "Past negative: Min + ne- prefix + past verb = Min nexwar"
  },
  {
    question: "Which pronoun is used for 'You' in past tense?",
    options: ["Tu", "Te", "We", "Hûn"],
    correct: 1,
    explanation: "Past tense always uses 'Te' for 'You', never 'Tu'."
  },
  {
    question: "How do you say 'I did' in past tense?",
    options: ["Ez dikim", "Min kir", "Ez bikim", "Min dikir"],
    correct: 1,
    explanation: "Past tense: Min (not Ez) + past verb (kir) = Min kir"
  },
  {
    question: "What is 'Wî çû' in English?",
    options: ["I went", "You went", "He went", "We went"],
    correct: 2,
    explanation: "Wî = He (past tense), çû = went"
  },
  {
    question: "How do you say 'You read' in past tense?",
    options: ["Tu xwend", "Te xwend", "Tu dixwînî", "Te dixwend"],
    correct: 1,
    explanation: "Past tense: Te (not Tu) + past verb (xwend) = Te xwend"
  },
  {
    question: "Which is the correct structure for past tense?",
    options: ["Subject + di- + verb", "Past pronoun + past verb", "Subject + ê + bi- + verb", "Subject + verb + ending"],
    correct: 1,
    explanation: "Past tense structure: Past pronoun (Min/Te/Wî) + past verb form (no prefix needed)"
  },
  {
    question: "How do you say 'We ate' in past tense?",
    options: ["Em dixwin", "Me xwar", "Em xwar", "Me dixwar"],
    correct: 1,
    explanation: "Past tense: Me (not Em) + past verb (xwar) = Me xwar"
  },
  {
    question: "What is the negative of 'Te çû'?",
    options: ["Te neçû", "Tu neçî", "Te naxwar", "Tu naxwî"],
    correct: 0,
    explanation: "Past negative: Te + ne- prefix + past verb = Te neçû"
  },
  {
    question: "Which pronoun is used for 'He' in past tense?",
    options: ["Ew", "Wî", "Wê", "Wan"],
    correct: 1,
    explanation: "Past tense uses 'Wî' for 'He', 'Wê' for 'She', not 'Ew'."
  },
  {
    question: "How do you say 'I saw' in past tense?",
    options: ["Ez dît", "Min dît", "Ez dibînim", "Min bidît"],
    correct: 1,
    explanation: "Past tense: Min (not Ez) + past verb (dît) = Min dît"
  },
  {
    question: "What is 'Wan kir' in English?",
    options: ["I did", "You did", "We did", "They did"],
    correct: 3,
    explanation: "Wan = They (past tense), kir = did"
  },
  {
    question: "How do you say 'You (plural) went' in past tense?",
    options: ["Hûn diçin", "We çû", "Hûn çû", "We diçû"],
    correct: 1,
    explanation: "Past tense: We (not Hûn) + past verb (çû) = We çû"
  }
]

export default function SimplePastPage() {
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
  const examplesWithAudio = pastTenseExamples.map(section => ({
    ...section,
    examples: section.examples.map(example => {
      if (example.audio) {
        // Use audioText if provided (to match existing audio files), otherwise use ku
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
            Simple Past Tense
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to talk about things that already happened. Perfect for beginners!
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
            {/* How Past Tense Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Past Tense Works in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, past tense is different from present tense in two important ways: <span className="font-bold text-kurdish-red">different pronouns</span> and <span className="font-bold text-kurdish-red">different verb forms</span>.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-orange-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Past Pronoun</span> + past verb form
                  </p>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-700 mb-2">
                        <strong>Step 1:</strong> Use past tense pronouns (different from present tense!)
                      </p>
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-gray-700 mb-1"><strong>Present:</strong> Ez, Tu, Ew</p>
                        <p className="text-kurdish-red font-bold">Past:</p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li><span className="font-bold text-kurdish-red">Min</span> (I) - instead of "Ez"</li>
                          <li><span className="font-bold text-kurdish-red">Te</span> (You) - instead of "Tu"</li>
                          <li><span className="font-bold text-kurdish-red">Wî</span> (He) / <span className="font-bold text-kurdish-red">Wê</span> (She) - instead of "Ew"</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-700 mb-2">
                        <strong>Step 2:</strong> Change the verb to its past form
                      </p>
                      <p className="text-kurdish-red font-mono">
                        Example: <span className="font-bold">xwarin</span> (to eat) → <span className="font-bold bg-yellow-200 px-2 py-1 rounded">xwar</span> (ate)
                      </p>
                      <p className="text-kurdish-red font-mono mt-1">
                        Example: <span className="font-bold">çûn</span> (to go) → <span className="font-bold bg-yellow-200 px-2 py-1 rounded">çû</span> (went)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-orange-200">
                  <p className="font-semibold mb-2 text-gray-800">Complete Examples:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><span className="font-bold text-kurdish-red">Min xwar</span> = I ate (not "Ez xwar")</li>
                    <li><span className="font-bold text-kurdish-red">Te çû</span> = You went (not "Tu çû")</li>
                    <li><span className="font-bold text-kurdish-red">Wî kir</span> = He did (not "Ew kir")</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Important:</strong> Always remember to use <span className="font-bold">Min/Te/Wî</span> for past tense, never <span className="font-bold">Ez/Tu/Ew</span>! The verb form also changes - it becomes shorter and simpler.
                </p>
              </div>
            </motion.div>

            {/* Pronoun Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">🔄 Pronoun Comparison: Present vs Past</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Present Tense</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Past Tense</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pronounComparison.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.en}</td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-blue-600">{row.present}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-bold text-kurdish-red">{row.past}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>⚠️ Remember:</strong> Past tense uses completely different pronouns! This is the most important thing to remember.
              </p>
            </motion.div>

            {/* Conjugation Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Conjugation Table - Verb "xwarin" (to eat)</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Pronoun</th>
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
                          <span className="font-mono text-kurdish-red">{row.pronoun} {row.example}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.exampleEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Note:</strong> Notice how the verb form "xwar" stays the same for all pronouns, but the pronouns are different from present tense!
              </p>
            </motion.div>

            {/* Common Verbs - Card Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Common Verbs in Past Tense</h2>
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
                        audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(verb.infinitive)}.mp3`}
                        label=""
                        size="small"
                        onPlay={handleAudioPlay}
                      />
                    </div>
                    <div className="mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold text-sm">Past Form: </span>
                        <span className="font-mono text-kurdish-red font-bold">{verb.past}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-16 text-sm">Min:</span>
                        <span className="font-mono text-kurdish-red flex-1">Min {verb.past}</span>
                        <AudioButton
                          kurdishText={`Min ${verb.past}`}
                          phoneticText="I ate"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Min ${verb.past}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-16 text-sm">Te:</span>
                        <span className="font-mono text-kurdish-red flex-1">Te {verb.past}</span>
                        <AudioButton
                          kurdishText={`Te ${verb.past}`}
                          phoneticText="You ate"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Te ${verb.past}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-16 text-sm">Wî/Wê:</span>
                        <span className="font-mono text-kurdish-red flex-1">Wî {verb.past} / Wê {verb.past}</span>
                        <AudioButton
                          kurdishText={`Wî ${verb.past}`}
                          phoneticText="He ate"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Wî ${verb.past}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-16 text-sm">Me:</span>
                        <span className="font-mono text-kurdish-red flex-1">Me {verb.past}</span>
                        <AudioButton
                          kurdishText={`Me ${verb.past}`}
                          phoneticText="We ate"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Me ${verb.past}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-16 text-sm">We:</span>
                        <span className="font-mono text-kurdish-red flex-1">We {verb.past}</span>
                        <AudioButton
                          kurdishText={`We ${verb.past}`}
                          phoneticText="You (plural) ate"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`We ${verb.past}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-16 text-sm">Wan:</span>
                        <span className="font-mono text-kurdish-red flex-1">Wan {verb.past}</span>
                        <AudioButton
                          kurdishText={`Wan ${verb.past}`}
                          phoneticText="They ate"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Wan ${verb.past}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
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
              transition={{ delay: 0.4 }}
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
                  transition={{ delay: 0.5 + sectionIndex * 0.1 }}
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
