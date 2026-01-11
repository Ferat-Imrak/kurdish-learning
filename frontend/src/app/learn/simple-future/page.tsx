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

const LESSON_ID = '17' // Simple Future Tense lesson ID

// Conjugation table data
const conjugationTable = [
  { pronoun: "Ez", pronounEn: "I", example: "ê bixwim", exampleEn: "I will eat" },
  { pronoun: "Tu", pronounEn: "You", example: "ê bixwî", exampleEn: "You will eat" },
  { pronoun: "Ew", pronounEn: "He/She", example: "ê bixwe", exampleEn: "He/She will eat" },
  { pronoun: "Em", pronounEn: "We", example: "ê bixwin", exampleEn: "We will eat" },
  { pronoun: "Hûn", pronounEn: "You (plural)", example: "ê bixwin", exampleEn: "You will eat" },
  { pronoun: "Ewan", pronounEn: "They", example: "ê bixwin", exampleEn: "They will eat" }
]

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", ez: "bixwim", tu: "bixwî", ew: "bixwe", em: "bixwin", hun: "bixwin", ewan: "bixwin" },
  { infinitive: "çûn", en: "to go", ez: "biçim", tu: "biçî", ew: "biçe", em: "biçin", hun: "biçin", ewan: "biçin" },
  { infinitive: "kirin", en: "to do", ez: "bikim", tu: "bikî", ew: "bike", em: "bikin", hun: "bikin", ewan: "bikin" },
  { infinitive: "xwendin", en: "to read", ez: "bixwînim", tu: "bixwînî", ew: "bixwîne", em: "bixwînin", hun: "bixwînin", ewan: "bixwînin" },
  { infinitive: "hatin", en: "to come", ez: "werim", tu: "werî", ew: "bê", em: "werin", hun: "werin", ewan: "werin" },
  { infinitive: "dîtin", en: "to see", ez: "bibînim", tu: "bibînî", ew: "bibîne", em: "bibînin", hun: "bibînin", ewan: "bibînin" },
  { infinitive: "bihîstin", en: "to hear", ez: "bibihîzim", tu: "bibihîzî", ew: "bibihîze", em: "bibihîzin", hun: "bibihîzin", ewan: "bibihîzin" },
  { infinitive: "axaftin", en: "to speak", ez: "biaxevim", tu: "biaxevî", ew: "biaxeve", em: "biaxevin", hun: "biaxevin", ewan: "biaxevin" }
]

const futureTenseExamples = [
  {
    title: 'Future Plans',
    examples: [
      { ku: "Ez ê sibê biçim malê.", en: "I will go home tomorrow", audio: true, audioText: "Ez ê sibê biçim malê" },
      { ku: "Tu ê pirtûk bixwînî.", en: "You will read a book", audio: true, audioText: "Tu ê pirtûk bixwînî" },
      { ku: "Ew ê nan bixwe.", en: "He/She will eat bread", audio: true, audioText: "Ew ê nan bixwe" },
      { ku: "Em ê biçin bazarê.", en: "We will go to the market", audio: true, audioText: "Em ê biçin bazarê" },
      { ku: "Hûn ê çay vexwin.", en: "You will drink tea", audio: true, audioText: "Hûn ê çay vexwin" },
      { ku: "Ewan ê werin.", en: "They will come", audio: true, audioText: "Ewan ê werin" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Ez ê bibînim", en: "I will see", audio: true },
      { ku: "Tu ê bibihîzî", en: "You will hear", audio: true },
      { ku: "Ew ê biaxeve", en: "He/She will speak", audio: true },
      { ku: "Em ê bikin", en: "We will do", audio: true },
      { ku: "Ew ê bê", en: "He/She will come", audio: true },
      { ku: "Ez ê sibê biçim dibistanê", en: "I will go to school tomorrow", audio: true }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Ez ê nexwim.", en: "I will not eat", audio: true, audioText: "Ez ê nexwim" },
      { ku: "Tu ê nexwî.", en: "You will not eat", audio: true, audioText: "Tu ê nexwî" },
      { ku: "Ew ê nexwe.", en: "He/She will not eat", audio: true, audioText: "Ew ê nexwe" },
      { ku: "Em ê nexwin.", en: "We will not eat", audio: true, audioText: "Em ê nexwin" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Tu ê çi bixwî?", en: "What will you eat?", audio: true },
      { ku: "Ew ê biçe ku derê?", en: "Where will he/she go?", audio: true, audioText: "Ew ê biçe ku derê" },
      { ku: "Tu ê kengî werî?", en: "When will you come?", audio: true },
      { ku: "Ez ê çi bikim?", en: "What should I do?", audio: true }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Ez bixwim",
    correct: "Ez ê bixwim",
    explanation: "Don't forget 'ê'! Future tense needs both 'ê' after the subject AND 'bi-' prefix before the verb."
  },
  {
    wrong: "Ez ê dixwim",
    correct: "Ez ê bixwim",
    explanation: "Future tense uses 'bi-' prefix, not 'di-'. 'di-' is for present tense only."
  },
  {
    wrong: "Ez bixwar",
    correct: "Ez ê bixwim",
    explanation: "Future tense needs 'ê' after the subject, and the verb ending changes based on the subject (-im for Ez)."
  },
  {
    wrong: "Tu ê bixwar",
    correct: "Tu ê bixwî",
    explanation: "The ending for 'Tu' (You) is '-î', not '-ar'. Remember: Tu → -î ending."
  }
]

// Practice exercises
const practiceExercises = [
  {
    question: "How do you say 'I will eat' in Kurdish?",
    options: ["Ez dixwim", "Ez ê bixwim", "Min xwar", "Ez bixwar"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- prefix + verb root + -im ending = Ez ê bixwim"
  },
  {
    question: "What is the correct future tense form for 'You will go'?",
    options: ["Tu diçî", "Tu ê biçî", "Te çû", "Tu biçe"],
    correct: 1,
    explanation: "Future tense: Tu + ê + bi- + ç + -î = Tu ê biçî"
  },
  {
    question: "Which two components are needed for future tense?",
    options: ["di- prefix only", "ê and bi- prefix", "bi- prefix only", "ê only"],
    correct: 1,
    explanation: "Future tense requires BOTH 'ê' (after subject) AND 'bi-' prefix (before verb). Both are essential!"
  },
  {
    question: "How do you say 'We will not eat'?",
    options: ["Em ê nexwin", "Em naxwin", "Em nexwar", "Em ê naxwin"],
    correct: 0,
    explanation: "Future negative: Em + ê + ne- (instead of bi-) + xw + -in = Em ê nexwin"
  },
  {
    question: "What prefix is used for future tense?",
    options: ["di-", "bi-", "ê", "no prefix"],
    correct: 1,
    explanation: "Future tense uses 'bi-' prefix before the verb root. Remember: bi- = future, di- = present"
  },
  {
    question: "How do you say 'I will read' in future tense?",
    options: ["Ez xwend", "Ez ê bixwînim", "Ez dixwînim", "Min xwend"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- + xwîn + -im = Ez ê bixwînim"
  },
  {
    question: "What is 'Tu ê bixwî' in English?",
    options: ["I will eat", "You will eat", "He will eat", "We will eat"],
    correct: 1,
    explanation: "Tu = You, ê = will, bixwî = will eat (future tense with -î ending for Tu)"
  },
  {
    question: "Which is correct for 'She will read'?",
    options: ["Ew ê bixwîne", "Wê bixwîne", "Ew dixwîne", "Wê dixwîne"],
    correct: 0,
    explanation: "Future tense: Ew + ê + bi- + xwîn + -e = Ew ê bixwîne"
  },
  {
    question: "How do you say 'They will go' in future tense?",
    options: ["Ewan ê biçin", "Wan biçin", "Ewan diçin", "Wan çû"],
    correct: 0,
    explanation: "Future tense: Ewan + ê + bi- + ç + -in = Ewan ê biçin"
  },
  {
    question: "What is the negative form of 'Ez ê bixwim'?",
    options: ["Ez ê nexwim", "Ez naxwim", "Ez nexwar", "Min nexwar"],
    correct: 0,
    explanation: "Future negative: Replace 'bi-' with 'ne-' = Ez ê nexwim"
  },
  {
    question: "Which ending is used for 'Em' (We) in future tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "Em (We) always uses '-in' ending in future tense (same as present)"
  },
  {
    question: "How do you say 'I will do' in future tense?",
    options: ["Ez dikim", "Ez ê bikim", "Min kir", "Ez bikim"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- + kir + -im = Ez ê bikim"
  },
  {
    question: "What is 'Ew ê biçe' in English?",
    options: ["I will go", "You will go", "He/She will go", "We will go"],
    correct: 2,
    explanation: "Ew = He/She, ê = will, biçe = will go (future tense with -e ending)"
  },
  {
    question: "How do you say 'You will read' in future tense?",
    options: ["Tu xwend", "Tu ê bixwînî", "Te xwend", "Tu dixwînî"],
    correct: 1,
    explanation: "Future tense: Tu + ê + bi- + xwîn + -î = Tu ê bixwînî"
  },
  {
    question: "Which is the correct structure for future tense?",
    options: ["Subject + verb", "Subject + di- + verb", "Subject + ê + bi- + verb + ending", "Subject + past verb"],
    correct: 2,
    explanation: "Future tense structure: Subject + ê + bi- prefix + verb root + personal ending"
  },
  {
    question: "How do you say 'We will eat' in future tense?",
    options: ["Em dixwin", "Em ê bixwin", "Me xwar", "Em bixwin"],
    correct: 1,
    explanation: "Future tense: Em + ê + bi- + xw + -in = Em ê bixwin"
  },
  {
    question: "What is the negative of 'Tu ê biçî'?",
    options: ["Tu ê neçî", "Tu neçî", "Te çû", "Tu naxwî"],
    correct: 0,
    explanation: "Future negative: Replace 'bi-' with 'ne-' = Tu ê neçî"
  },
  {
    question: "Which pronoun uses '-î' ending in future tense?",
    options: ["Ez", "Tu", "Ew", "Em"],
    correct: 1,
    explanation: "Tu (You) always uses '-î' ending in future tense (same as present)"
  },
  {
    question: "How do you say 'I will see' in future tense?",
    options: ["Ez dît", "Ez ê bibînim", "Min dît", "Ez dibînim"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- + bîn + -im = Ez ê bibînim"
  },
  {
    question: "What is 'Hûn ê bixwin' in English?",
    options: ["I will eat", "You will eat (singular)", "You will eat (plural)", "They will eat"],
    correct: 2,
    explanation: "Hûn = You (plural), ê = will, bixwin = will eat (future tense with -in ending)"
  },
  {
    question: "What happens if you forget 'ê' in future tense?",
    options: ["It becomes present tense", "It becomes past tense", "It's incorrect", "All of the above"],
    correct: 2,
    explanation: "Both 'ê' and 'bi-' are required for future tense. Without 'ê', it's grammatically incorrect."
  }
]

export default function SimpleFuturePage() {
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
  const examplesWithAudio = futureTenseExamples.map(section => ({
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
            Simple Future Tense
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to talk about things that will happen. Perfect for beginners!
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
            {/* How Future Tense Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6 mb-6 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Future Tense Works in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, future tense is formed by adding <span className="font-bold text-kurdish-red">"ê"</span> after the subject and the prefix <span className="font-bold text-kurdish-red">"bi-"</span> before the verb root. This shows that the action will happen later.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-green-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    Subject + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">ê</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">bi-</span> + verb root + personal ending
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Step 1:</strong> Start with the subject (Ez, Tu, Ew, etc.)
                    </p>
                    <p className="text-kurdish-red font-mono">
                      Example: <span className="font-bold">Ez</span> (I)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 2:</strong> Add <span className="font-bold text-kurdish-red">"ê"</span> right after the subject
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="font-bold">Ez</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">ê</span>
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 3:</strong> Add <span className="font-bold text-kurdish-red">"bi-"</span> prefix before the verb root
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="font-bold">xwarin</span> (to eat) → root: <span className="bg-yellow-200 px-2 py-1 rounded font-bold">xw</span> → <span className="bg-yellow-200 px-2 py-1 rounded font-bold">bi</span>xw
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 4:</strong> Add personal ending based on the subject
                    </p>
                    <p className="text-kurdish-red font-mono">
                      Ez <span className="bg-yellow-200 px-2 py-1 rounded font-bold">ê</span> <span className="bg-yellow-200 px-2 py-1 rounded font-bold">bi</span>xw<span className="font-bold">im</span> = I will eat
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-green-200">
                  <p className="font-semibold mb-2 text-gray-800">Key Points:</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><span className="font-bold text-kurdish-red">"ê"</span> always comes right after the subject (Ez ê, Tu ê, Ew ê)</li>
                    <li><span className="font-bold text-kurdish-red">"bi-"</span> prefix always comes before the verb root</li>
                    <li>The personal ending changes based on the subject (same as present tense)</li>
                    <li>Both <span className="font-bold">"ê"</span> and <span className="font-bold">"bi-"</span> are needed together to make future tense</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-green-200">
                  <p className="font-semibold mb-2 text-gray-800">Personal Endings (same as present tense):</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li><span className="font-bold text-kurdish-red">-im</span> for "Ez" (I)</li>
                    <li><span className="font-bold text-kurdish-red">-î</span> for "Tu" (You)</li>
                    <li><span className="font-bold text-kurdish-red">-e</span> for "Ew" (He/She)</li>
                    <li><span className="font-bold text-kurdish-red">-in</span> for "Em/Hûn/Ewan" (We/You/They)</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Think of <span className="font-bold">"ê"</span> as meaning "will" and <span className="font-bold">"bi-"</span> as the future marker. You need both to make a future sentence!
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
                    <tr className="bg-gradient-to-r from-green-100 to-teal-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Pronoun</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Structure</th>
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
                          <span className="text-xs text-gray-500">{row.pronoun} + ê + bi- + root + ending</span>
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
                <strong>Note:</strong> Notice how all forms use both "ê" (after subject) and "bi-" prefix, but the ending changes: -im, -î, -e, -in
              </p>
            </motion.div>

            {/* More Verbs Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📚 Common Verbs in Future Tense</h2>
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Ez:</span>
                        <span className="font-mono text-kurdish-red flex-1">Ez ê {verb.ez}</span>
                        <AudioButton
                          kurdishText={`Ez ê ${verb.ez}`}
                          phoneticText="I will eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Ez ê ${verb.ez}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Tu:</span>
                        <span className="font-mono text-kurdish-red flex-1">Tu ê {verb.tu}</span>
                        <AudioButton
                          kurdishText={`Tu ê ${verb.tu}`}
                          phoneticText="You will eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Tu ê ${verb.tu}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Ew:</span>
                        <span className="font-mono text-kurdish-red flex-1">Ew ê {verb.ew}</span>
                        <AudioButton
                          kurdishText={`Ew ê ${verb.ew}`}
                          phoneticText="He/She will eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Ew ê ${verb.ew}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Em:</span>
                        <span className="font-mono text-kurdish-red flex-1">Em ê {verb.em}</span>
                        <AudioButton
                          kurdishText={`Em ê ${verb.em}`}
                          phoneticText="We will eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Em ê ${verb.em}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Hûn:</span>
                        <span className="font-mono text-kurdish-red flex-1">Hûn ê {verb.hun}</span>
                        <AudioButton
                          kurdishText={`Hûn ê ${verb.hun}`}
                          phoneticText="You (plural) will eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Hûn ê ${verb.hun}`)}.mp3`}
                          label=""
                          size="small"
                          onPlay={handleAudioPlay}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-semibold w-12 text-sm">Ewan:</span>
                        <span className="font-mono text-kurdish-red flex-1">Ewan ê {verb.ewan}</span>
                        <AudioButton
                          kurdishText={`Ewan ê ${verb.ewan}`}
                          phoneticText="They will eat"
                          audioFile={`/audio/kurdish-tts-mp3/grammar/${getAudioFilename(`Ewan ê ${verb.ewan}`)}.mp3`}
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
