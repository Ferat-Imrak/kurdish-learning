"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

// Helper function to get audio filename for each pronoun
function getPronounAudioFile(ku: string): string {
  // Handle special cases where filename differs from sanitized text
  if (ku === "wê") return "we-her"
  if (ku === "we") return "we-your"
  if (ku === "hûn") return "hun"
  if (ku === "wî") return "wi"
  
  // Default: return lowercase version
  return ku.toLowerCase()
}

const pronouns = [
  { ku: "ez", en: "I", example: "Ez xwendekar im", exampleEn: "I am a student" },
  { ku: "tu", en: "you (singular)", example: "Tu çi dikî?", exampleEn: "What are you doing?" },
  { ku: "ew", en: "he/she/it", example: "Ew xwendekar e", exampleEn: "He/She is a student" },
  { ku: "em", en: "we", example: "Em xwendekar in", exampleEn: "We are students" },
  { ku: "hûn", en: "you (plural/formal)", example: "Hûn çi dikin?", exampleEn: "What are you doing?" },
  { ku: "ew", en: "they", example: "Ew xwendekar in", exampleEn: "They are students" },
]

const possessivePronouns = [
  { ku: "min", en: "my", example: "mala min", exampleEn: "my house" },
  { ku: "te", en: "your (singular)", example: "mala te", exampleEn: "your house" },
  { ku: "wî", en: "his", example: "mala wî", exampleEn: "his house" },
  { ku: "wê", en: "her", example: "mala wê", exampleEn: "her house" },
  { ku: "me", en: "our", example: "mala me", exampleEn: "our house" },
  { ku: "we", en: "your (plural/formal)", example: "mala we", exampleEn: "your house" },
  { ku: "wan", en: "their", example: "mala wan", exampleEn: "their house" },
]

export default function PronounsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Pronouns</h1>
        </div>

        <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
          Essential pronouns for building sentences and conversations in Kurdish.
        </p>

        {/* Personal Pronouns */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-lg">👤</span>
            Personal Pronouns
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pronouns.map((pronoun, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-kurdish-red mb-2">{pronoun.ku.charAt(0).toUpperCase() + pronoun.ku.slice(1)}</div>
                  <div className="text-sm text-gray-600">{pronoun.en}</div>
                </div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={pronoun.ku} 
                    phoneticText={pronoun.en.toUpperCase()} 
                    label="Listen" 
                    size="medium"
                    audioFile={`/audio/kurdish-tts-mp3/pronouns/${getPronounAudioFile(pronoun.ku)}.mp3`}
                  />
                  <div className="text-right">
                    <div className="text-sm text-gray-700 mb-1">{pronoun.example}</div>
                    <div className="text-xs text-gray-600">{pronoun.exampleEn}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Possessive Pronouns */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center text-lg">🏠</span>
            Possessive Pronouns
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {possessivePronouns.map((pronoun, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-kurdish-red mb-2">{pronoun.ku.charAt(0).toUpperCase() + pronoun.ku.slice(1)}</div>
                  <div className="text-sm text-gray-600">{pronoun.en}</div>
                </div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={pronoun.ku} 
                    phoneticText={pronoun.en.toUpperCase()} 
                    label="Listen" 
                    size="medium"
                    audioFile={`/audio/kurdish-tts-mp3/pronouns/${getPronounAudioFile(pronoun.ku)}.mp3`}
                  />
                  <div className="text-right">
                    <div className="text-sm text-gray-700 mb-1">{pronoun.example}</div>
                    <div className="text-xs text-gray-600">{pronoun.exampleEn}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Notes */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.2 }}
          className="mt-8 card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Usage Notes</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>• <strong>ez</strong> - Used for "I" in all contexts</p>
            <p>• <strong>tu</strong> - Informal "you" for friends and family</p>
            <p>• <strong>hûn</strong> - Formal "you" or plural "you"</p>
            <p>• <strong>ew</strong> - Can mean "he", "she", "it", or "they" depending on context</p>
            <p>• <strong>wî/wê</strong> - "wî" for masculine, "wê" for feminine</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
