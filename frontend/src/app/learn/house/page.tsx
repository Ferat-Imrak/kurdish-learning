"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

// Helper function to sanitize Kurdish text for filename lookup (same as AudioButton)
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

const houseItems = [
  { ku: "mal", en: "house", icon: "🏠", audioFile: "/audio/kurdish-tts-mp3/house/mal.mp3" },
  { ku: "ode", en: "room", icon: "🚪", audioFile: "/audio/kurdish-tts-mp3/house/ode.mp3" },
  { ku: "derî", en: "door", icon: "🚪", audioFile: "/audio/kurdish-tts-mp3/house/deri.mp3" },
  { ku: "pencere", en: "window", icon: "🪟", audioFile: "/audio/kurdish-tts-mp3/house/pencere.mp3" },
  { ku: "kursî", en: "chair", icon: "🪑", audioFile: "/audio/kurdish-tts-mp3/house/kursi.mp3" },
  { ku: "mase", en: "table", icon: "⬜", audioFile: "/audio/kurdish-tts-mp3/house/mase.mp3" },
  { ku: "nivîn", en: "bed", icon: "🛏️", audioFile: "/audio/kurdish-tts-mp3/house/nivin.mp3" },
  { ku: "qenepe", en: "sofa", icon: "🛋️", audioFile: "/audio/kurdish-tts-mp3/house/qenepe.mp3" },
  { ku: "çira", en: "lamp", icon: "💡", audioFile: "/audio/kurdish-tts-mp3/house/cira.mp3" },
  { ku: "televîzyon", en: "television", icon: "📺", audioFile: "/audio/kurdish-tts-mp3/house/televizyon.mp3" },
  { ku: "sarinc", en: "refrigerator", icon: "🧊", audioFile: "/audio/kurdish-tts-mp3/house/sarinc.mp3" },
  { ku: "aşxane", en: "kitchen", icon: "🍳", audioFile: "/audio/kurdish-tts-mp3/house/asxane.mp3" },
]

const roomTypes = [
  { ku: "odeya xewê", en: "bedroom", audioFile: "/audio/kurdish-tts-mp3/house/odeya-xewe.mp3" },
  { ku: "aşxane", en: "kitchen", audioFile: "/audio/kurdish-tts-mp3/house/asxane.mp3" },
  { ku: "odeya rûniştinê", en: "living room", audioFile: "/audio/kurdish-tts-mp3/house/odeya-runistine.mp3" },
  { ku: "hemam", en: "bathroom", audioFile: "/audio/kurdish-tts-mp3/house/hemam.mp3" },
  { ku: "odeya xwendinê", en: "study room", audioFile: "/audio/kurdish-tts-mp3/house/odeya-xwendine.mp3" },
]

const houseQuestions = [
  { ku: "Malê te çend ode hene?", en: "How many rooms does your house have?", audioFile: "/audio/kurdish-tts-mp3/house/male-te-cend-ode-hene.mp3" },
  { ku: "Tu li ku radizî?", en: "Where do you sleep?", audioFile: "/audio/kurdish-tts-mp3/house/tu-li-ku-radizi-sleep.mp3" },
  { ku: "Tu li ku dixwî?", en: "Where do you eat?", audioFile: "/audio/kurdish-tts-mp3/house/tu-li-ku-dixewi-eat.mp3" },
  { ku: "Mala te mezin e?", en: "Is your house big?", audioFile: "/audio/kurdish-tts-mp3/house/mala-te-mezin-e.mp3" },
  { ku: "Tu li ku derê xwarinê çêdikî?", en: "Where do you cook?", audioFile: "/audio/kurdish-tts-mp3/house/tu-li-ku-dere-xwarine-cediki.mp3" },
]

export default function HouseItemsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Things Around the House</h1>
        </div>

        <p className="text-gray-700 mb-6">Learn vocabulary for items and rooms in the house.</p>

        {/* House Items */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">🏠</span>
            House Items
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {houseItems.map((item, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="font-bold text-gray-800 text-center">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{item.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="medium"
                    audioFile={item.audioFile}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Room Types */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">🛏️</span>
            Types of Rooms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomTypes.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                    <div className="text-sm text-gray-600">{item.en}</div>
                  </div>
                  <div className="ml-4">
                    <AudioButton 
                      kurdishText={item.ku} 
                      phoneticText={item.en} 
                      label="Listen"
                      size="small"
                      audioFile={item.audioFile}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* House Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">❓</span>
            Talking About Your House
          </h2>
          <div className="space-y-4">
            {houseQuestions.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                    <div className="text-gray-600">{item.en}</div>
                  </div>
                  <div className="ml-4">
                    <AudioButton 
                      kurdishText={item.ku} 
                      phoneticText={item.en} 
                      label="Listen"
                      size="small"
                      audioFile={item.audioFile}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
