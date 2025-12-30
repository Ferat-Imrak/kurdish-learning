"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../../../components/lessons/AudioButton"

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

const colors = [
  { en: "Red", ku: "sor", hex: "#E31E24" },
  { en: "Green", ku: "kewş", hex: "#00A651" },
  { en: "Blue", ku: "şîn", hex: "#1E90FF" },
  { en: "Yellow", ku: "zer", hex: "#FFD700" },
]

// Add audioFile paths to colors
const colorsWithAudio = colors.map(color => ({
  ...color,
  audioFile: `/audio/kurdish-tts-mp3/colors/${getAudioFilename(color.ku)}.mp3`
}))

export default function ColorsWordsPage({ params }: { params: { dialect: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/learn`} className="text-kurdish-red font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-playful">Colors</h1>
          <div />
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {colorsWithAudio.map((c) => (
            <motion.div key={c.en} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-4 text-center">
              <div className="w-full h-24 rounded-xl mb-3" style={{backgroundColor: c.hex}} />
              <div className="font-bold text-gray-800">{c.en} • {c.ku}</div>
              <div className="mt-2 flex justify-center">
                <AudioButton 
                  kurdishText={c.ku} 
                  phoneticText={c.en.toUpperCase()} 
                  label="Listen"
                  audioFile={c.audioFile}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}


