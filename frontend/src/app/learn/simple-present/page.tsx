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

const LESSON_ID = '15' // Simple Present Tense lesson ID

// Conjugation table data
const conjugationTable = [
  { pronoun: "Ez", pronounEn: "I", ending: "-im", example: "dixwim", exampleEn: "I eat" },
  { pronoun: "Tu", pronounEn: "You", ending: "-î", example: "dixwî", exampleEn: "You eat" },
  { pronoun: "Ew", pronounEn: "He/She", ending: "-e", example: "dixwe", exampleEn: "He/She eats" },
  { pronoun: "Em", pronounEn: "We", ending: "-in", example: "dixwin", exampleEn: "We eat" },
  { pronoun: "Hûn", pronounEn: "You (plural)", ending: "-in", example: "dixwin", exampleEn: "You eat" },
  { pronoun: "Ewan", pronounEn: "They", ending: "-in", example: "dixwin", exampleEn: "They eat" }
]

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", root: "xwar" },
  { infinitive: "çûn", en: "to go", root: "ç" },
  { infinitive: "kirin", en: "to do", root: "kir" },
  { infinitive: "xwendin", en: "to read", root: "xwên" },
  { infinitive: "hatin", en: "to come", root: "hat" },
  { infinitive: "dîtin", en: "to see", root: "bîn" },
  { infinitive: "bihîstin", en: "to hear", root: "bihîs" },
  { infinitive: "axaftin", en: "to speak", root: "axaft" }
]

const presentTenseExamples = [
  {
    title: 'Daily Activities',
    examples: [
      { ku: "Ez nan dixwim.", en: "I eat bread", audio: true, audioText: "Ez nan dixwim" },
      { ku: "Tu pirtûk dixwînî.", en: "You read a book", audio: true, audioText: "Tu pirtûk dixwînî" },
      { ku: "Ew li malê ye.", en: "He/She is at home", audio: true, audioText: "Ew li malê ye" },
      { ku: "Ez xwendekar im.", en: "I am a student", audio: true, audioText: "Ez xwendekar im" },
      { ku: "Em diçin dibistanê.", en: "We go to school", audio: true, audioText: "Em diçin dibistanê" },
      { ku: "Tu çayê vedixwî.", en: "You drink tea", audio: true, audioText: "Tu çayê vedixwî" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Ez dibînim.", en: "I see", audio: true, audioText: "Ez dibînim" },
      { ku: "Tu dibihîzî.", en: "You hear", audio: true, audioText: "Tu dibihîzî" },
      { ku: "Ew diaxive.", en: "He/She speaks", audio: true, audioText: "Ew diaxive" },
      { ku: "Em dikin.", en: "We do", audio: true, audioText: "Em dikin" },
      { ku: "Ew tê.", en: "He/She comes", audio: true, audioText: "Ew tê" },
      { ku: "Ez diçim bazarê.", en: "I go to the market", audio: true, audioText: "Ez diçim bazarê" }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Ez naxwim.", en: "I don't eat", audio: true, audioText: "Ez naxwim" },
      { ku: "Tu naxwî.", en: "You don't eat", audio: true, audioText: "Tu naxwî" },
      { ku: "Ew naxwe.", en: "He/She doesn't eat", audio: true, audioText: "Ew naxwe" },
      { ku: "Em naxwin.", en: "We don't eat", audio: true, audioText: "Em naxwin" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Tu çi dixwî?", en: "What do you eat?", audio: true },
      { ku: "Ew kû diçe?", en: "Where does he/she go?", audio: true },
      { ku: "Tu çawa yî?", en: "How are you?", audio: true },
      { ku: "Ez çi bikim?", en: "What should I do?", audio: true }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Ez xwarim",
    correct: "Ez dixwim",
    explanation: "Don't forget the 'di-' prefix! Present tense always needs 'di-' before the verb root."
  },
  {
    wrong: "Tu xwar",
    correct: "Tu dixwî",
    explanation: "Present tense needs both 'di-' prefix and the correct ending (-î for 'Tu')."
  },
  {
    wrong: "Ew dixwar",
    correct: "Ew dixwe",
    explanation: "The ending for 'Ew' (He/She) is '-e', not '-ar'. Remember: Ew → -e ending."
  },
  {
    wrong: "Ez diçim malê",
    correct: "Ez diçim malê",
    note: "Actually correct! But remember 'li' is often used: 'Ez li malê me' (I am at home)."
  }
]

// Practice exercises
const practiceExercises = [
  {
    question: "How do you say 'I eat' in Kurdish?",
    options: ["Ez dixwim", "Min xwar", "Ez bixwim", "Ez xwarim"],
    correct: 0,
    explanation: "Present tense uses 'Ez' + 'di-' prefix + verb root + '-im' ending"
  },
  {
    question: "What is the correct present tense form for 'You go'?",
    options: ["Tu çûyî", "Tu diçî", "Tu biçî", "Te çû"],
    correct: 1,
    explanation: "Present tense: Tu + di- + ç + -î = Tu diçî"
  },
  {
    question: "Which ending is used for 'Ew' (He/She) in present tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 2,
    explanation: "Ew (He/She) always uses '-e' ending in present tense"
  },
  {
    question: "How do you say 'We don't eat'?",
    options: ["Em naxwin", "Em naxwar", "Em naxwim", "Em naxwe"],
    correct: 0,
    explanation: "Negative: Em + na- (instead of di-) + xwar + -in = Em naxwin"
  },
  {
    question: "What prefix is used for present tense?",
    options: ["bi-", "di-", "ê", "no prefix"],
    correct: 1,
    explanation: "Present tense always uses 'di-' prefix before the verb root"
  },
  {
    question: "How do you say 'I read' in present tense?",
    options: ["Ez xwend", "Ez dixwînim", "Min xwend", "Ez bixwînim"],
    correct: 1,
    explanation: "Present tense: Ez + di- + xwên + -im = Ez dixwînim"
  },
  {
    question: "What is 'Tu dixwî' in English?",
    options: ["I eat", "You eat", "He eats", "We eat"],
    correct: 1,
    explanation: "Tu = You, dixwî = eat (present tense with -î ending for Tu)"
  },
  {
    question: "Which is correct for 'She reads'?",
    options: ["Ew dixwîne", "Ew xwend", "Wê dixwîne", "Ew bixwîne"],
    correct: 0,
    explanation: "Present tense: Ew + di- + xwên + -e = Ew dixwîne"
  },
  {
    question: "How do you say 'They go' in present tense?",
    options: ["Ewan diçin", "Ewan çûn", "Ewan biçin", "Wan çû"],
    correct: 0,
    explanation: "Present tense: Ewan + di- + ç + -in = Ewan diçin"
  },
  {
    question: "What is the negative form of 'Ez dixwim'?",
    options: ["Ez naxwim", "Ez nexwar", "Min naxwar", "Ez naxwar"],
    correct: 0,
    explanation: "Negative present: Replace 'di-' with 'na-' = Ez naxwim"
  },
  {
    question: "Which ending is used for 'Em' (We) in present tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "Em (We) always uses '-in' ending in present tense"
  },
  {
    question: "How do you say 'I do' in present tense?",
    options: ["Ez dikim", "Min kir", "Ez bikim", "Ez kirim"],
    correct: 0,
    explanation: "Present tense: Ez + di- + kir + -im = Ez dikim"
  },
  {
    question: "What is 'Ew diçe' in English?",
    options: ["I go", "You go", "He/She goes", "We go"],
    correct: 2,
    explanation: "Ew = He/She, diçe = goes (present tense with -e ending)"
  },
  {
    question: "How do you say 'You read' in present tense?",
    options: ["Tu xwend", "Tu dixwînî", "Te xwend", "Tu bixwînî"],
    correct: 1,
    explanation: "Present tense: Tu + di- + xwên + -î = Tu dixwînî"
  },
  {
    question: "Which is the correct structure for present tense?",
    options: ["Subject + verb", "Subject + di- + verb + ending", "Subject + ê + bi- + verb", "Subject + past verb"],
    correct: 1,
    explanation: "Present tense structure: Subject + di- prefix + verb root + personal ending"
  },
  {
    question: "How do you say 'We eat' in present tense?",
    options: ["Em dixwin", "Me xwar", "Em naxwin", "Em bixwin"],
    correct: 0,
    explanation: "Present tense: Em + di- + xwar + -in = Em dixwin"
  },
  {
    question: "What is the negative of 'Tu diçî'?",
    options: ["Tu naçî", "Tu neçî", "Te çû", "Tu naxwî"],
    correct: 1,
    explanation: "Negative present: Replace 'di-' with 'ne-' = Tu neçî (for çûn verb)"
  },
  {
    question: "Which pronoun uses '-î' ending in present tense?",
    options: ["Ez", "Tu", "Ew", "Em"],
    correct: 1,
    explanation: "Tu (You) always uses '-î' ending in present tense"
  },
  {
    question: "How do you say 'I see' in present tense?",
    options: ["Ez dît", "Ez dibînim", "Min dît", "Ez bidînim"],
    correct: 1,
    explanation: "Present tense: Ez + di- + bîn + -im = Ez dibînim"
  },
  {
    question: "What is 'Hûn dixwin' in English?",
    options: ["I eat", "You eat (singular)", "You eat (plural)", "They eat"],
    correct: 2,
    explanation: "Hûn = You (plural), dixwin = eat (present tense with -in ending)"
  }
]

export default function SimplePresentPage() {
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
            Simple Present Tense
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to talk about things happening now or regularly. Perfect for beginners!
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
            {/* How Present Tense Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Present Tense Works in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, present tense is formed by adding the prefix <span className="font-bold text-kurdish-red">"di-"</span> before the verb root. This prefix shows that the action is happening right now or happens regularly.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-blue-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    Subject + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">di-</span> + verb root + personal ending
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Step 1:</strong> Take the verb root (infinitive form)
                    </p>
                    <p className="text-kurdish-red font-mono">
                      Example: <span className="font-bold">xwarin</span> (to eat)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 2:</strong> Add <span className="font-bold text-kurdish-red">"di-"</span> prefix
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="font-bold">xwarin</span> → <span className="bg-yellow-200 px-2 py-1 rounded">di</span>xwarin
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 3:</strong> Add personal ending based on the subject
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="bg-yellow-200 px-2 py-1 rounded">di</span>xwar<span className="font-bold">im</span> (I eat)
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-blue-200">
                  <p className="font-semibold mb-2 text-gray-800">Personal Endings:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li><span className="font-bold text-kurdish-red">-im</span> for "Ez" (I)</li>
                    <li><span className="font-bold text-kurdish-red">-î</span> for "Tu" (You)</li>
                    <li><span className="font-bold text-kurdish-red">-e</span> for "Ew" (He/She)</li>
                    <li><span className="font-bold text-kurdish-red">-in</span> for "Em/Hûn/Ewan" (We/You/They)</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-blue-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> The <span className="font-bold">"di-"</span> prefix always stays the same, but the ending changes based on who is doing the action!
                </p>
              </div>
            </motion.div>

            {/* Conjugation Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Conjugation Table - Verb "xwarin" (to eat)</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Pronoun</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Ending</th>
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
                          <span className="font-mono text-kurdish-red font-bold">{row.ending}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3">
                          <span className="font-mono text-kurdish-red">{row.example}</span>
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">{row.exampleEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Note:</strong> Notice how all forms use "di-" prefix, but the ending changes: -im, -î, -e, -in
              </p>
            </motion.div>

            {/* More Verbs Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Common Verbs in Present Tense</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Infinitive</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Ez (I)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Tu (You)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Ew (He/She)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonVerbs.map((verb, index) => {
                      // Generate conjugations (simplified - in real app you'd have full conjugation logic)
                      const conjugations = {
                        ez: `di${verb.root}im`,
                        tu: `di${verb.root}î`,
                        ew: `di${verb.root}e`
                      }
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 font-mono text-kurdish-red font-bold">{verb.infinitive}</td>
                          <td className="border border-gray-300 px-4 py-3 text-gray-700">{verb.en}</td>
                          <td className="border border-gray-300 px-4 py-3 font-mono text-kurdish-red">{conjugations.ez}</td>
                          <td className="border border-gray-300 px-4 py-3 font-mono text-kurdish-red">{conjugations.tu}</td>
                          <td className="border border-gray-300 px-4 py-3 font-mono text-kurdish-red">{conjugations.ew}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Common Mistakes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                  transition={{ delay: 0.4 + sectionIndex * 0.1 }}
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
