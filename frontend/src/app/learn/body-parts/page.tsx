"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

const bodyParts = [
  { ku: "ser", en: "head", icon: "👤" },
  { ku: "çav", en: "eye", icon: "👁️" },
  { ku: "guh", en: "ear", icon: "👂" },
  { ku: "poz", en: "nose", icon: "👃" },
  { ku: "dev", en: "mouth", icon: "👄" },
  { ku: "didan", en: "tooth", icon: "🦷" },
  { ku: "ziman", en: "tongue", icon: "👅" },
  { ku: "stû", en: "neck", icon: "🔶" },
  { ku: "mil", en: "shoulder", icon: "💪" },
  { ku: "dest", en: "hand", icon: "✋" },
  { ku: "tili", en: "finger", icon: "👆" },
  { ku: "sîng", en: "chest", icon: "👤" },
  { ku: "zik", en: "stomach", icon: "🫃" },
  { ku: "pişt", en: "back", icon: "🔶" },
  { ku: "ling", en: "leg", icon: "🦵" },
  { ku: "pê", en: "foot", icon: "🦶" },
  { ku: "pêçî", en: "ankle", icon: "🦴" },
  { ku: "çok", en: "knee", icon: "🦴" }
]

const bodyActions = [
  { ku: "bînî", en: "see", example: "Ez çavên te dibînim", exampleEn: "I see your eyes", icon: "👁️" },
  { ku: "bihîze", en: "hear", example: "Ez dengê te dibihîzim", exampleEn: "I hear your voice", icon: "👂" },
  { ku: "bêje", en: "speak", example: "Tu bi devê xwe dibêjî", exampleEn: "You speak with your mouth", icon: "💬" },
  { ku: "bixwe", en: "eat", example: "Ez bi devê xwe dixwim", exampleEn: "I eat with my mouth", icon: "🍽️" },
  { ku: "bimeşe", en: "walk", example: "Ez bi lingên xwe dimeşim", exampleEn: "I walk with my legs", icon: "🚶" },
  { ku: "bigire", en: "hold", example: "Ez bi destên xwe digirim", exampleEn: "I hold with my hands", icon: "✋" }
]

export default function BodyPartsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Body Parts</h1>
        </div>

        <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
          Learn vocabulary for human body parts and anatomy in Kurdish.
        </p>

        {/* Body Parts */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full flex items-center justify-center text-lg">👁️</span>
            Body Parts
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {bodyParts.map((part, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}} 
                transition={{ delay: index * 0.05 }}
                className="card p-5"
              >
                <div className="text-xl font-bold text-gray-800 text-center mb-2">
                  {part.ku.charAt(0).toUpperCase() + part.ku.slice(1)}
                </div>
                <div className="text-gray-600 mb-4 text-center">{part.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={part.ku} 
                    phoneticText={part.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{part.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Body Actions */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center text-lg">🏃</span>
            Actions with Body Parts
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bodyActions.map((action, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="card p-5"
              >
                <div className="text-center mb-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow mb-2">
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div className="font-bold text-gray-800">{action.ku.charAt(0).toUpperCase() + action.ku.slice(1)}</div>
                  <div className="text-gray-600 text-sm mb-3">{action.en}</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium text-gray-800">{action.example}</div>
                  <div className="text-xs text-gray-600 mt-1">{action.exampleEn}</div>
                </div>
                
                <AudioButton 
                  kurdishText={action.example} 
                  phoneticText={action.en.toUpperCase()} 
                  label="Listen" 
                  size="small"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Notes */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Usage Notes</h3>
          <div className="space-y-3 text-sm text-gray-700 max-w-3xl mx-auto">
            <p>• <strong>çav</strong> - Can mean both "eye" and "eyes" (context determines)</p>
            <p>• <strong>dest</strong> - Usually refers to "hand" but can mean "hands"</p>
            <p>• <strong>ling</strong> - Can mean "leg" or "foot" depending on context</p>
            <p>• <strong>pê</strong> - Specifically means "foot" (not leg)</p>
            <p>• Body parts are often used with possessive pronouns (destê min, çavên te)</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

