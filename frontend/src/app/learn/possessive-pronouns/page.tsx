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

const LESSON_ID = '21' // Possessive Pronouns lesson ID

// Possessive pronouns reference table
const possessiveTable = [
  { ku: "min", en: "my", example: "pirtûka min", exampleEn: "my book", usage: "First person singular" },
  { ku: "te", en: "your", example: "malê te", exampleEn: "your house", usage: "Second person singular" },
  { ku: "wî", en: "his", example: "pirtûka wî", exampleEn: "his book", usage: "Third person singular (masculine)" },
  { ku: "wê", en: "her", example: "pirtûka wê", exampleEn: "her book", usage: "Third person singular (feminine)" },
  { ku: "me", en: "our", example: "malê me", exampleEn: "our house", usage: "First person plural" },
  { ku: "we", en: "your (plural)", example: "pirtûkên we", exampleEn: "your books", usage: "Second person plural" },
  { ku: "wan", en: "their", example: "malên wan", exampleEn: "their houses", usage: "Third person plural" },
  { ku: "xwe", en: "self/own", example: "nanê xwe", exampleEn: "his/her own bread", usage: "Reflexive (refers back to subject)" }
]

const presentTenseExamples = [
  {
    title: 'Basic Possessive Forms',
    examples: [
      { ku: "Pirtûka min.", en: "my book", audio: true, audioText: "Pirtûka min." },
      { ku: "Malê te.", en: "your house", audio: true, audioText: "Malê te." },
      { ku: "Pirtûka wî.", en: "his book", audio: true, audioText: "Pirtûka wî." },
      { ku: "Pirtûka wê.", en: "her book", audio: true, audioText: "Pirtûka wê." },
      { ku: "Malê me.", en: "our house", audio: true, audioText: "Malê me." },
      { ku: "Pirtûkên we.", en: "your books", audio: true, audioText: "Pirtûkên we." },
      { ku: "Malên wan.", en: "their houses", audio: true, audioText: "Malên wan." }
    ]
  },
  {
    title: 'Possessive Pronouns in Sentences',
    examples: [
      { ku: "Ez pirtûka min dixwînim.", en: "I read my book", audio: true, audioText: "Ez pirtûka min dixwînim." },
      { ku: "Tu malê te dibînî.", en: "You see your house", audio: true, audioText: "Tu malê te dibînî." },
      { ku: "Ew nanê xwe dixwe.", en: "He/She eats his/her own bread", audio: true, audioText: "Ew nanê xwe dixwe." },
      { ku: "Em pirtûkên xwe dixwînin.", en: "We read our books", audio: true, audioText: "Em pirtûkên xwe dixwînin." },
      { ku: "Ewan malên wan dibînin.", en: "They see their houses", audio: true, audioText: "Ewan malên wan dibînin." }
    ]
  },
  {
    title: 'Body Parts with Possessives',
    examples: [
      { ku: "Çavên min.", en: "my eyes", audio: true, audioText: "Çavên min." },
      { ku: "Dengê te.", en: "your voice", audio: true, audioText: "Dengê te." },
      { ku: "Destê wî.", en: "his hand", audio: true, audioText: "Destê wî." },
      { ku: "Serê wê.", en: "her head", audio: true, audioText: "Serê wê." },
      { ku: "Lingên me.", en: "our legs", audio: true, audioText: "Lingên me." }
    ]
  },
  {
    title: 'Family Members with Possessives',
    examples: [
      { ku: "Bavê min.", en: "my father", audio: true, audioText: "Bavê min." },
      { ku: "Dayika te.", en: "your mother", audio: true, audioText: "Dayika te." },
      { ku: "Bira wî.", en: "his brother", audio: true, audioText: "Bira wî." },
      { ku: "Xwişka wê.", en: "her sister", audio: true, audioText: "Xwişka wê." },
      { ku: "Zarokên me.", en: "our children", audio: true, audioText: "Zarokên me." }
    ]
  },
  {
    title: 'Using "xwe" (self/own)',
    examples: [
      { ku: "Ez nanê xwe dixwim.", en: "I eat my own bread", audio: true, audioText: "Ez nanê xwe dixwim." },
      { ku: "Tu pirtûka xwe dixwînî.", en: "You read your own book", audio: true, audioText: "Tu pirtûka xwe dixwînî." },
      { ku: "Ew malê xwe dibîne.", en: "He/She sees his/her own house", audio: true, audioText: "Ew malê xwe dibîne." },
      { ku: "Em odeyên xwe dibînin.", en: "We see our own rooms", audio: true, audioText: "Em odeyên xwe dibînin." }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "min pirtûk",
    correct: "pirtûka min",
    explanation: "Possessive pronouns come AFTER the noun, not before. The noun also gets an ending (-a, -ê, -ên) before the possessive."
  },
  {
    wrong: "pirtûk min",
    correct: "pirtûka min",
    explanation: "Don't forget the ending on the noun! 'pirtûk' becomes 'pirtûka' before 'min' (my)."
  },
  {
    wrong: "pirtûka ez",
    correct: "pirtûka min",
    explanation: "Use possessive pronouns (min, te, wî, wê, me, we, wan), not subject pronouns (ez, tu, ew, em, hûn, ewan). 'ez' = I, but 'min' = my."
  },
  {
    wrong: "pirtûka ew",
    correct: "pirtûka wî or pirtûka wê",
    explanation: "For 'his/her', use 'wî' (his) or 'wê' (her), not 'ew'. 'ew' is the subject pronoun (he/she), not possessive."
  },
  {
    wrong: "pirtûkên min",
    correct: "pirtûkên min",
    explanation: "Actually this is correct! For plural nouns, use '-ên' ending: pirtûkên min (my books)."
  }
]

const practiceExercises = [
  {
    question: "How do you say 'my book' in Kurdish?",
    options: ["min pirtûk", "pirtûk min", "pirtûka min", "pirtûka ez"],
    correct: 2,
    explanation: "Possessive comes after noun with ending: pirtûka min (my book)"
  },
  {
    question: "What possessive pronoun means 'your' (singular)?",
    options: ["tu", "te", "we", "wan"],
    correct: 1,
    explanation: "'te' means 'your' (singular). 'tu' is the subject pronoun (you), 'we' is your (plural), 'wan' is their."
  },
  {
    question: "How do you say 'his book'?",
    options: ["pirtûka ew", "pirtûka wî", "pirtûka wê", "pirtûka wan"],
    correct: 1,
    explanation: "Use 'wî' for 'his': pirtûka wî (his book). 'ew' is subject pronoun, 'wê' is her, 'wan' is their."
  },
  {
    question: "How do you say 'her book'?",
    options: ["pirtûka ew", "pirtûka wî", "pirtûka wê", "pirtûka wan"],
    correct: 2,
    explanation: "Use 'wê' for 'her': pirtûka wê (her book)"
  },
  {
    question: "What is 'our house' in Kurdish?",
    options: ["malê em", "malê me", "malên me", "malê we"],
    correct: 1,
    explanation: "Use 'me' for 'our': malê me (our house). 'em' is subject pronoun (we), 'we' is your (plural)."
  },
  {
    question: "How do you say 'their books'?",
    options: ["pirtûkên wan", "pirtûka wan", "pirtûkên we", "pirtûka we"],
    correct: 0,
    explanation: "For plural: pirtûkên wan (their books). Use '-ên' for plural nouns and 'wan' for their."
  },
  {
    question: "What does 'xwe' mean?",
    options: ["my", "your", "self/own", "their"],
    correct: 2,
    explanation: "'xwe' means 'self' or 'own' - it refers back to the subject. Example: nanê xwe (his/her own bread)."
  },
  {
    question: "How do you say 'my eyes'?",
    options: ["çavên min", "çavê min", "çav min", "min çavên"],
    correct: 0,
    explanation: "For plural body parts: çavên min (my eyes). Use '-ên' for plural and possessive comes after."
  },
  {
    question: "What is the correct form for 'your voice'?",
    options: ["dengê te", "deng te", "te dengê", "dengê tu"],
    correct: 0,
    explanation: "Use 'dengê te' (your voice). The noun gets '-ê' ending and possessive 'te' comes after."
  },
  {
    question: "How do you say 'I read my book'?",
    options: ["Ez pirtûka min dixwînim", "Ez min pirtûk dixwînim", "Ez pirtûk min dixwînim", "Min pirtûka ez dixwînim"],
    correct: 0,
    explanation: "SOV order: Ez (I) + pirtûka min (my book) + dixwînim (read) = Ez pirtûka min dixwînim"
  },
  {
    question: "What possessive pronoun means 'your (plural)'?",
    options: ["te", "we", "me", "wan"],
    correct: 1,
    explanation: "'we' means 'your (plural)'. 'te' is your (singular), 'me' is our, 'wan' is their."
  },
  {
    question: "How do you say 'our children'?",
    options: ["zarokên me", "zaroka me", "zarok me", "me zarokên"],
    correct: 0,
    explanation: "For plural: zarokên me (our children). Use '-ên' for plural and 'me' for our."
  },
  {
    question: "What is 'his hand' in Kurdish?",
    options: ["destê wî", "dest wî", "wî destê", "destê ew"],
    correct: 0,
    explanation: "Use 'destê wî' (his hand). The noun gets '-ê' ending and 'wî' (his) comes after."
  },
  {
    question: "How do you say 'He eats his own bread'?",
    options: ["Ew nanê xwe dixwe", "Ew nanê wî dixwe", "Ew nanê wê dixwe", "Ew nanê wan dixwe"],
    correct: 0,
    explanation: "Use 'xwe' (own) when the subject and possessor are the same: Ew nanê xwe dixwe (He eats his own bread)."
  },
  {
    question: "What is the correct order for possessive constructions?",
    options: ["Possessive + Noun", "Noun + Possessive", "Noun + Ending + Possessive", "Possessive + Ending + Noun"],
    correct: 2,
    explanation: "The order is: Noun + Ending (-a, -ê, -ên) + Possessive. Example: pirtûka min (my book)."
  },
  {
    question: "How do you say 'your books' (plural)?",
    options: ["pirtûkên te", "pirtûkên we", "pirtûka we", "pirtûkên tu"],
    correct: 1,
    explanation: "For plural 'your': pirtûkên we (your books). Use '-ên' for plural and 'we' for your (plural)."
  },
  {
    question: "What ending is used for singular nouns before possessives?",
    options: ["-a or -ê", "-ên", "-an", "-ek"],
    correct: 0,
    explanation: "Singular nouns use '-a' or '-ê' before possessives: pirtûka min (my book), malê te (your house)."
  },
  {
    question: "How do you say 'her sister'?",
    options: ["xwişka wê", "xwişka wî", "xwişka ew", "xwişka te"],
    correct: 0,
    explanation: "Use 'wê' for 'her': xwişka wê (her sister)"
  },
  {
    question: "What is 'my father' in Kurdish?",
    options: ["bavê min", "bav min", "min bavê", "bavê ez"],
    correct: 0,
    explanation: "Use 'bavê min' (my father). The noun gets '-ê' ending and 'min' (my) comes after."
  },
  {
    question: "When do you use 'xwe' instead of 'wî' or 'wê'?",
    options: ["Always", "When the possessor is the same as the subject", "Never", "Only for plural"],
    correct: 1,
    explanation: "Use 'xwe' when the possessor is the same as the subject. Example: Ew nanê xwe dixwe (He eats his own bread)."
  }
]

export default function PossessivePronounsPage() {
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

  const calculateProgress = (practiceScorePercent: number) => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60) // minutes
    // Audio clicks: max 30% (10 clicks = 30%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 3)
    // Time spent: max 20% (5 minutes = 20%)
    const timeProgress = Math.min(20, timeSpent * 4)
    // Practice score: max 50%
    const practiceProgress = practiceScorePercent * 0.5
    // Combined progress
    const progress = Math.min(100, audioProgress + timeProgress + practiceProgress)
    return progress
  }

  const handleAudioPlay = () => {
    audioPlaysRef.current += 1
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60) // minutes
    const progress = Math.min(100, (audioPlaysRef.current * 10) + (timeSpent * 5))
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
            Possessive Pronouns
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn how to say "my", "your", "his", "her", "our", "their" and "own" in Kurdish. Perfect for beginners!
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
              className="card p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Possessive Pronouns Work in Kurdish
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  In Kurdish, possessive pronouns come <span className="font-bold text-kurdish-red">after</span> the noun, not before it like in English.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-indigo-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    Noun + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Ending</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Possessive</span>
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Step 1:</strong> Take the noun
                    </p>
                    <p className="text-kurdish-red font-mono">
                      Example: <span className="font-bold">pirtûk</span> (book)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 2:</strong> Add ending (-a, -ê, or -ên)
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="font-bold">pirtûk</span> → <span className="bg-yellow-200 px-2 py-1 rounded">pirtûka</span> (for singular)
                    </p>
                    
                    <p className="text-gray-700 mt-3">
                      <strong>Step 3:</strong> Add possessive pronoun
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="bg-yellow-200 px-2 py-1 rounded">pirtûka</span> + <span className="font-bold">min</span> (my)
                    </p>
                    <p className="text-kurdish-red font-mono mt-2">
                      = <span className="font-bold">pirtûka min</span> (my book)
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-indigo-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Remember: <span className="font-bold">Noun + Ending + Possessive</span> - the opposite of English! Also, use subject pronouns (ez, tu, ew) for subjects, but possessive pronouns (min, te, wî) for possessives.
                </p>
              </div>
            </motion.div>

            {/* Possessive Pronouns Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Possessive Pronouns Reference</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-100 to-purple-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Kurdish</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">English</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Example</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Translation</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-bold">Usage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {possessiveTable.map((row, index) => (
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
