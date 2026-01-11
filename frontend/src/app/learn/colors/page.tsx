"use client"

import Link from "next/link"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
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

interface ColorExample {
  ku: string
  en: string
  icon: string
}

interface ColorData {
  en: string
  ku: string
  hex: string
  examples: ColorExample[]
}

const colors: ColorData[] = [
  { 
    en: "Red", 
    ku: "sor", 
    hex: "#E31E24",
    examples: [
      { ku: "pirtûkê sor", en: "red book", icon: "📕" },
      { ku: "gulê sor", en: "red flower", icon: "🌹" },
      { ku: "sêvê sor", en: "red apple", icon: "🍎" },
      { ku: "îsotê sor", en: "red pepper", icon: "🌶️" }
    ]
  },
  { 
    en: "Green", 
    ku: "kesk", 
    hex: "#00A651",
    examples: [
      { ku: "pelê kesk", en: "green leaf", icon: "🍃" },
      { ku: "giyayê kesk", en: "green grass", icon: "🌿" },
      { ku: "sêvê kesk", en: "green apple", icon: "🍏" },
      { ku: "pirtûkê kesk", en: "green book", icon: "📗" }
    ]
  },
  { 
    en: "Blue", 
    ku: "şîn", 
    hex: "#1E90FF",
    examples: [
      { ku: "avê şîn", en: "blue water", icon: "🌊" },
      { ku: "esmanê şîn", en: "blue sky", icon: "☁️" },
      { ku: "pirtûkê şîn", en: "blue book", icon: "📘" },
      { ku: "çavên şîn", en: "blue eyes", icon: "👀" }
    ]
  },
  { 
    en: "Yellow", 
    ku: "zer", 
    hex: "#FFD700",
    examples: [
      { ku: "tava zer", en: "yellow sun", icon: "☀️" },
      { ku: "gulê zer", en: "yellow flower", icon: "🌼" },
      { ku: "pirtûkê zer", en: "yellow book", icon: "📒" },
      { ku: "mûzê zer", en: "yellow banana", icon: "🍌" }
    ]
  },
  { 
    en: "Orange", 
    ku: "porteqalî", 
    hex: "#FF8C00",
    examples: [
      { ku: "gizêrê porteqalî", en: "orange carrot", icon: "🥕" },
      { ku: "kûndirê porteqalî", en: "orange pumpkin", icon: "🎃" },
      { ku: "şêrê porteqalî", en: "orange lion", icon: "🦁" },
      { ku: "pirtûkê porteqalî", en: "orange book", icon: "📙" }
    ]
  },
  { 
    en: "Purple", 
    ku: "mor", 
    hex: "#8A2BE2",
    examples: [
      { ku: "dilê mor", en: "purple heart", icon: "💜" },
      { ku: "çemberê mor", en: "purple circle", icon: "🟣" },
      { ku: "kirasê mor", en: "purple dress", icon: "👗" },
      { ku: "tirîyê mor", en: "purple grape", icon: "🍇" }
    ]
  },
  { 
    en: "Silver", 
    ku: "zîv", 
    hex: "#C0C0C0",
    examples: [
      { ku: "kevçiyê zîv", en: "silver spoon", icon: "🥄" },
      { ku: "çetelê zîv", en: "silver fork", icon: "🍴" },
      { ku: "guharê zîv", en: "silver earrings", icon: "💠" },
      { ku: "saetê zîv", en: "silver watch", icon: "⌚" }
    ]
  },
  { 
    en: "Orange-Red", 
    ku: "gevez", 
    hex: "#FF4500",
    examples: [
      { ku: "gulê gevez", en: "orange-red flower", icon: "🌺" },
      { ku: "rojê gevez", en: "orange-red sun", icon: "🌅" },
      { ku: "agirê gevez", en: "orange-red fire", icon: "🔥" },
      { ku: "gulê gevez", en: "orange-red rose", icon: "🌹" }
    ]
  },
  { 
    en: "Black", 
    ku: "reş", 
    hex: "#000000",
    examples: [
      { ku: "pisîkê reş", en: "black cat", icon: "🐈‍⬛" },
      { ku: "pirtûkê reş", en: "black book", icon: "📓" },
      { ku: "şevê reş", en: "black night", icon: "🌑" },
      { ku: "dilê reş", en: "black heart", icon: "🖤" }
    ]
  },
  { 
    en: "White", 
    ku: "spî", 
    hex: "#FFFFFF",
    examples: [
      { ku: "hêkê spî", en: "white egg", icon: "🥚" },
      { ku: "şîrê spî", en: "white milk", icon: "🥛" },
      { ku: "berfê spî", en: "white snow", icon: "❄️" },
      { ku: "birincê spî", en: "white rice", icon: "🍚" }
    ]
  },
  { 
    en: "Gray", 
    ku: "xwelî", 
    hex: "#808080",
    examples: [
      { ku: "ewrê xwelî", en: "gray cloud", icon: "☁️" },
      { ku: "kevirê xwelî", en: "gray stone", icon: "🪨" },
      { ku: "çiyayê xwelî", en: "gray mountain", icon: "🏔️" },
      { ku: "fîlê xwelî", en: "gray elephant", icon: "🐘" }
    ]
  },
  { 
    en: "Gold", 
    ku: "zêr", 
    hex: "#FFD700",
    examples: [
      { ku: "zêrê zêr", en: "gold metal", icon: "🥇" },
      { ku: "stêrkê zêr", en: "gold star", icon: "⭐" },
      { ku: "saetê zêr", en: "gold watch", icon: "⌚" }
    ]
  },
]

// Add audioFile paths to colors and examples
const colorsWithAudio = colors.map(color => {
  // Handle filename collision for "zêr" (gold) vs "zer" (yellow)
  let filename;
  if (color.ku === "zêr") {
    filename = "zer-gold.mp3";
  } else {
    filename = `${getAudioFilename(color.ku)}.mp3`;
  }
  
  return {
    ...color,
    audioFile: `/audio/kurdish-tts-mp3/colors/${filename}`,
    examplesWithAudio: color.examples.map(example => ({
      ...example,
      audioFile: `/audio/kurdish-tts-mp3/colors/${getAudioFilename(example.ku)}.mp3`
    }))
  };
})

export default function ColorsPage() {
  const [expandedColor, setExpandedColor] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href={`/learn`} className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">
            Colors
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Learn colors in Kurdish with real-world examples and phrases
          </p>
        </div>

        <div className="space-y-4">
          {colorsWithAudio.map((color) => {
            const isExpanded = expandedColor === color.ku
            
            return (
              <motion.div
                key={color.ku}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
              >
                {/* Color header - non-clickable */}
                <div className="p-4 flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-xl shadow-md flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-xl text-gray-800 mb-2">
                      {color.ku.charAt(0).toUpperCase() + color.ku.slice(1)} • {color.en}
                    </div>
                    <div className="flex items-center gap-3">
                      <div onClick={(e) => e.stopPropagation()}>
                        <AudioButton
                          kurdishText={color.ku}
                          phoneticText={color.en.toUpperCase()}
                          label="Listen"
                          size="small"
                          audioFile={color.audioFile}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Examples preview and expand button */}
                <div className="px-4 pb-3 border-t border-gray-100">
                  <button
                    onClick={() => setExpandedColor(isExpanded ? null : color.ku)}
                    className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Real-world examples preview */}
                      <div className="flex gap-1.5">
                        {color.examples.slice(0, 4).map((example, idx) => (
                          <span 
                            key={idx} 
                            className="text-2xl transition-transform group-hover:scale-110" 
                            title={`${example.ku} (${example.en})`}
                          >
                            {example.icon}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-kurdish-red transition-colors">
                        {isExpanded ? 'Hide' : 'View'} {color.examples.length} examples
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-kurdish-red transition-colors" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-kurdish-red transition-colors" />
                    )}
                  </button>
                </div>

                {/* Expanded examples */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Common Phrases
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {color.examplesWithAudio.map((example, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-kurdish-red/30 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <span className="text-3xl flex-shrink-0">{example.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-800 mb-1 break-words">
                                    {example.ku}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {example.en}
                                  </div>
                                </div>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <AudioButton
                                  kurdishText={example.ku}
                                  phoneticText={example.en}
                                  label="Listen"
                                  size="small"
                                  audioFile={example.audioFile}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
