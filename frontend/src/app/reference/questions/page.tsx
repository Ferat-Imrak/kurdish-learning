"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

// Helper function to get audio filename for each question word
function getQuestionAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "kî": "ki",
    "çi": "ci",
    "ku": "ku",
    "kengî": "kengi",
    "çima": "cima",
    "çawa": "cawa",
    "çend": "cend",
    "kîjan": "kijan",
  };
  return mapping[ku] || ku.toLowerCase();
}

// Helper function to get audio filename for common questions
function getCommonQuestionAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "Ew kî ye?": "ew-ki-ye",
    "Navê te çi ye?": "nave-te-ci-ye",
    "Tu çend salî yî?": "tu-cend-sali-yi",
    "Tu li ku dijî?": "tu-li-ku-diji",
    "Tu çi kar dikî?": "tu-ci-kar-diki",
    "Tu çi dixwî?": "tu-ci-dixwi",
    "Tu çi dixwînî?": "tu-ci-dixwini",
    "Tu çawa yî?": "tu-cawa-yi",
    "Tu kengî hatî?": "tu-kengi-hati",
    "Tu kengî diçî?": "tu-kengi-dici",
    "Tu çima li vir yî?": "tu-cima-li-vir-yi",
    "Tu kîjan pirtûk dixwînî?": "tu-kijan-pirtuk-dixwini",
  };
  return mapping[ku] || ku.toLowerCase().replace(/[îÎ]/g, 'i').replace(/[êÊ]/g, 'e').replace(/[ûÛ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[çÇ]/g, 'c').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

const questionWords = [
  { ku: "kî", en: "who", example: "Ew kî ye?", exampleEn: "Who is that?" },
  { ku: "çi", en: "what", example: "Tu çi dikî?", exampleEn: "What are you doing?" },
  { ku: "ku", en: "where", example: "Tu li ku yî?", exampleEn: "Where are you?" },
  { ku: "kengî", en: "when", example: "Ew kengî tê?", exampleEn: "When is he/she coming?" },
  { ku: "çima", en: "why", example: "Tu çima li malê yî?", exampleEn: "Why are you at home?" },
  { ku: "çawa", en: "how", example: "Tu çawa yî?", exampleEn: "How are you?" },
  { ku: "çend", en: "how many/much", example: "Tu çend salî yî?", exampleEn: "How old are you?" },
  { ku: "kîjan", en: "which", example: "Tu kîjan pirtûk dixwînî?", exampleEn: "Which book are you reading?" }
]

const commonQuestions = [
  { ku: "Ew kî ye?", en: "Who is that?" },
  { ku: "Navê te çi ye?", en: "What is your name?" },
  { ku: "Tu çend salî yî?", en: "How old are you?" },
  { ku: "Tu li ku dijî?", en: "Where do you live?" },
  { ku: "Tu çi kar dikî?", en: "What do you do for work?" },
  { ku: "Tu çi dixwî?", en: "What are you eating?" },
  { ku: "Tu çi dixwînî?", en: "What are you reading?" },
  { ku: "Tu çawa yî?", en: "How are you?" },
  { ku: "Tu kengî hatî?", en: "When did you come?" },
  { ku: "Tu kengî diçî?", en: "When are you going?" },
  { ku: "Tu çima li vir yî?", en: "Why are you here?" },
  { ku: "Tu kîjan pirtûk dixwînî?", en: "Which book are you reading?" }
]

export default function QuestionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Question Words</h1>
        </div>

        <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
          Essential question words for asking and understanding questions in Kurdish.
        </p>

        {/* Question Words */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">❓</span>
            Basic Question Words
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {questionWords.map((word, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-kurdish-red mb-2">{word.ku.charAt(0).toUpperCase() + word.ku.slice(1)}</div>
                  <div className="text-sm text-gray-600">{word.en}</div>
                </div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={word.ku} 
                    phoneticText={word.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/questions/${getQuestionAudioFile(word.ku)}.mp3`}
                  />
                  <div className="text-right">
                    <div className="text-sm text-gray-700 mb-1">{word.example}</div>
                    <div className="text-xs text-gray-600">{word.exampleEn}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Common Questions */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-lg">💬</span>
            Common Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {commonQuestions.map((question, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="text-kurdish-red font-medium mb-2">{question.ku}</div>
                  <div className="text-gray-600 text-sm">{question.en}</div>
                </div>
                <AudioButton 
                  kurdishText={question.ku} 
                  phoneticText={question.en.toUpperCase()} 
                  label="Listen" 
                  size="small"
                  audioFile={`/audio/kurdish-tts-mp3/questions/${getCommonQuestionAudioFile(question.ku)}.mp3`}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
