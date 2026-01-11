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

const LESSON_ID = '18' // Sentence Structure & Pronouns lesson ID

// Pronoun reference table
const pronounTable = [
  { ku: "ez", en: "I", example: "Ez xwendekar im", exampleEn: "I am a student" },
  { ku: "tu", en: "you", example: "Tu çawa yî?", exampleEn: "How are you?" },
  { ku: "ew", en: "he/she", example: "Ew li malê ye", exampleEn: "He/She is at home" },
  { ku: "em", en: "we", example: "Em xwendekar in", exampleEn: "We are students" },
  { ku: "hûn", en: "you (plural)", example: "Hûn çawa ne?", exampleEn: "How are you (all)?" },
  { ku: "ewan", en: "they", example: "Ewan li Kurdistanê ne", exampleEn: "They are in Kurdistan" }
]

const presentTenseExamples = [
  {
    title: 'Basic SOV Sentences',
    examples: [
      { ku: "Ez nan dixwim.", en: "I eat bread", audio: true, audioText: "Ez nan dixwim" },
      { ku: "Ew sêv dixwe.", en: "He/She eats an apple", audio: true, audioText: "Ew sêv dixwe" },
      { ku: "Tu pirtûk dixwînî.", en: "You read a book", audio: true, audioText: "Tu pirtûk dixwînî" },
      { ku: "Em çayê vedixwin.", en: "We drink tea", audio: true, audioText: "Em çayê vedixwin" },
      { ku: "Ewan li malê ne.", en: "They are at home", audio: true, audioText: "Ewan li malê ne" }
    ]
  },
  {
    title: 'Pronouns with "To Be"',
    examples: [
      { ku: "Ez xwendekar im.", en: "I am a student", audio: true, audioText: "Ez xwendekar im" },
      { ku: "Tu çawa yî?", en: "How are you?", audio: true },
      { ku: "Ew ji Kurdistanê ye.", en: "He is from Kurdistan", audio: true, audioText: "Ew ji Kurdistanê ye" },
      { ku: "Em li malê ne.", en: "We are at home", audio: true, audioText: "Em li malê ne" },
      { ku: "Ewan xwendekar in.", en: "They are students", audio: true, audioText: "Ewan xwendekar in" },
      { ku: "Hûn çawa ne?", en: "How are you (all)?", audio: true }
    ]
  },
  {
    title: 'More Complex Sentences',
    examples: [
      { ku: "Ez çavên te dibînim.", en: "I see your eyes", audio: true, audioText: "Ez çavên te dibînim" },
      { ku: "Tu dengê min dibihîzî.", en: "You hear my voice", audio: true, audioText: "Tu dengê min dibihîzî" },
      { ku: "Ew nanê xwe dixwe.", en: "He/She eats his/her bread", audio: true, audioText: "Ew nanê xwe dixwe" },
      { ku: "Em pirtûkên xwe dixwînin.", en: "We read our books", audio: true, audioText: "Em pirtûkên xwe dixwînin" },
      { ku: "Ew di baxçê de dilîzin.", en: "They play in the garden", audio: true, audioText: "Ew di baxçê de dilîzin" }
    ]
  },
  {
    title: 'Questions with Pronouns',
    examples: [
      { ku: "Tu kû yî?", en: "Where are you?", audio: true },
      { ku: "Ew çi dike?", en: "What does he/she do?", audio: true },
      { ku: "Em kengî diçin?", en: "When do we go?", audio: true },
      { ku: "Ewan kî ne?", en: "Who are they?", audio: true }
    ]
  }
]

const commonMistakes = [
  {
    wrong: "Nan ez dixwim",
    correct: "Ez nan dixwim",
    explanation: "Remember: Subject comes first! Kurdish is SOV (Subject-Object-Verb), not OSV."
  },
  {
    wrong: "Ez dixwim nan",
    correct: "Ez nan dixwim",
    explanation: "The verb must come at the END of the sentence. Object comes before the verb."
  },
  {
    wrong: "Ew xwendekar e",
    correct: "Ew xwendekar e",
    explanation: "Actually this is correct! But remember: 'Ew' can mean both 'he' and 'she' in Kurdish."
  },
  {
    wrong: "Em xwendekar im",
    correct: "Em xwendekar in",
    explanation: "For plural pronouns (Em, Hûn, Ewan), use 'in' not 'im'. 'im' is only for 'Ez' (I)."
  },
  {
    wrong: "Tu xwendekar e",
    correct: "Tu xwendekar î",
    explanation: "For 'Tu' (you), use '-î' ending, not '-e'. '-e' is for 'Ew' (he/she)."
  }
]

const practiceExercises = [
  {
    question: "What is the correct word order in Kurdish?",
    options: ["Subject-Verb-Object (SVO)", "Subject-Object-Verb (SOV)", "Verb-Subject-Object (VSO)", "Object-Subject-Verb (OSV)"],
    correct: 1,
    explanation: "Kurdish follows SOV (Subject-Object-Verb) order. The verb always comes at the end."
  },
  {
    question: "How do you say 'I eat bread' in Kurdish?",
    options: ["Nan ez dixwim", "Ez nan dixwim", "Ez dixwim nan", "Dixwim ez nan"],
    correct: 1,
    explanation: "Correct order: Ez (I) + nan (bread) + dixwim (eat) = Ez nan dixwim"
  },
  {
    question: "What pronoun means 'we' in Kurdish?",
    options: ["ez", "tu", "em", "ew"],
    correct: 2,
    explanation: "'em' means 'we' in Kurdish. 'ez' = I, 'tu' = you, 'ew' = he/she"
  },
  {
    question: "How do you say 'They are students'?",
    options: ["Ewan xwendekar in", "Ewan xwendekar im", "Ewan xwendekar e", "Ewan xwendekar î"],
    correct: 0,
    explanation: "For plural 'Ewan' (they), use 'in' ending. 'im' is for 'Ez', 'e' is for 'Ew', 'î' is for 'Tu'."
  },
  {
    question: "What is the correct sentence structure for 'You read a book'?",
    options: ["Tu pirtûk dixwînî", "Pirtûk tu dixwînî", "Tu dixwînî pirtûk", "Dixwînî tu pirtûk"],
    correct: 0,
    explanation: "SOV order: Tu (you) + pirtûk (book) + dixwînî (read) = Tu pirtûk dixwînî"
  },
  {
    question: "Which pronoun is used for 'he' or 'she'?",
    options: ["ez", "tu", "ew", "em"],
    correct: 2,
    explanation: "'ew' means both 'he' and 'she' in Kurdish. There's no gender distinction in pronouns."
  },
  {
    question: "How do you say 'We are at home'?",
    options: ["Em li malê ne", "Em li malê im", "Em li malê e", "Em li malê î"],
    correct: 0,
    explanation: "For 'Em' (we), use 'ne' ending. 'im' is for 'Ez', 'e' is for 'Ew', 'î' is for 'Tu'."
  },
  {
    question: "What is the correct ending for 'Tu' (you) with 'to be'?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 1,
    explanation: "'Tu' always uses '-î' ending. Example: Tu çawa yî? (How are you?)"
  },
  {
    question: "In the sentence 'Ew nan dixwe', what is the subject?",
    options: ["nan", "dixwe", "ew", "none"],
    correct: 2,
    explanation: "'Ew' (he/she) is the subject. 'nan' (bread) is the object, 'dixwe' (eats) is the verb."
  },
  {
    question: "How do you say 'I see your eyes'?",
    options: ["Ez çavên te dibînim", "Çavên te ez dibînim", "Ez dibînim çavên te", "Dibînim ez çavên te"],
    correct: 0,
    explanation: "SOV order: Ez (I) + çavên te (your eyes) + dibînim (see) = Ez çavên te dibînim"
  },
  {
    question: "What pronoun means 'you (plural)'?",
    options: ["tu", "hûn", "em", "ewan"],
    correct: 1,
    explanation: "'hûn' means 'you (plural)' or 'you all'. 'tu' is singular 'you'."
  },
  {
    question: "How do you say 'He/She is from Kurdistan'?",
    options: ["Ew ji Kurdistanê ye", "Ew ji Kurdistanê im", "Ew ji Kurdistanê in", "Ew ji Kurdistanê î"],
    correct: 0,
    explanation: "For 'Ew' (he/she), use 'ye' (is). 'im' is for 'Ez', 'in' is for plural, 'î' is for 'Tu'."
  },
  {
    question: "What is the correct order for 'We drink tea'?",
    options: ["Em çayê vedixwin", "Çayê em vedixwin", "Em vedixwin çayê", "Vedixwin em çayê"],
    correct: 0,
    explanation: "SOV: Em (we) + çayê (tea) + vedixwin (drink) = Em çayê vedixwin"
  },
  {
    question: "Which ending is used for plural pronouns (Em, Hûn, Ewan)?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "All plural pronouns (Em, Hûn, Ewan) use '-in' ending with 'to be'."
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu kû yî?", "Tu kû im?", "Tu kû e?", "Tu kû in?"],
    correct: 0,
    explanation: "For 'Tu' (you), use '-î' ending: Tu kû yî? (Where are you?)"
  },
  {
    question: "In Kurdish, what comes first in a sentence?",
    options: ["Verb", "Object", "Subject", "Adjective"],
    correct: 2,
    explanation: "The subject always comes first in Kurdish sentences (SOV order)."
  },
  {
    question: "What is the correct sentence for 'They play in the garden'?",
    options: ["Ew di baxçê de dilîzin", "Di baxçê de ew dilîzin", "Ew dilîzin di baxçê de", "Dilîzin ew di baxçê de"],
    correct: 0,
    explanation: "SOV order: Ew (they) + di baxçê de (in the garden) + dilîzin (play) = Ew di baxçê de dilîzin"
  },
  {
    question: "How do you say 'What does he/she do?'?",
    options: ["Ew çi dike?", "Çi ew dike?", "Ew dike çi?", "Dike ew çi?"],
    correct: 0,
    explanation: "SOV order: Ew (he/she) + çi (what) + dike (does) = Ew çi dike?"
  },
  {
    question: "What pronoun would you use to say 'We are students'?",
    options: ["ez", "tu", "em", "ew"],
    correct: 2,
    explanation: "'em' means 'we'. Example: Em xwendekar in (We are students)."
  },
  {
    question: "In the sentence 'Ez nan dixwim', what is the verb?",
    options: ["Ez", "nan", "dixwim", "all of them"],
    correct: 2,
    explanation: "'dixwim' (I eat) is the verb. 'Ez' is the subject, 'nan' is the object."
  }
]

export default function SentenceStructurePronounsPage() {
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
            Sentence Structure & Pronouns
          </h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn the basic word order and essential pronouns in Kurdish. Perfect for beginners!
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
              className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">💡</span>
                How Kurdish Sentences Work
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Kurdish follows <span className="font-bold text-kurdish-red">Subject-Object-Verb (SOV)</span> word order. This means the verb always comes at the end of the sentence.
                </p>
                
                <div className="bg-white p-4 rounded-lg mt-4 border border-blue-200">
                  <p className="font-semibold mb-3 text-gray-800">The Structure:</p>
                  <p className="text-kurdish-red font-mono text-lg mb-3">
                    <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Subject</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Object</span> + <span className="bg-yellow-200 px-2 py-1 rounded font-bold">Verb</span>
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <strong>Example:</strong> "I eat bread"
                    </p>
                    <p className="text-kurdish-red font-mono">
                      <span className="bg-yellow-200 px-2 py-1 rounded">Ez</span> (I) + <span className="bg-yellow-200 px-2 py-1 rounded">nan</span> (bread) + <span className="bg-yellow-200 px-2 py-1 rounded">dixwim</span> (eat)
                    </p>
                    <p className="text-kurdish-red font-mono mt-2">
                      = <span className="font-bold">Ez nan dixwim</span>
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-3 bg-green-100 p-3 rounded-lg">
                  <strong>💡 Tip:</strong> Always remember: <span className="font-bold">Verb comes last!</span> This is different from English where verbs come in the middle.
                </p>
              </div>
            </motion.div>

            {/* Pronoun Reference Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Personal Pronouns Reference</h2>
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
                    {pronounTable.map((row, index) => (
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
