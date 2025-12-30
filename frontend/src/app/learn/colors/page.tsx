"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

const colors = [
  { en: "Red", ku: "sor", hex: "#E31E24", audio: "/audio/kurmanji/red.mp3" },
  { en: "Green", ku: "kesk", hex: "#00A651", audio: "/audio/kurmanji/green.mp3" },
  { en: "Blue", ku: "şîn", hex: "#1E90FF", audio: "/audio/kurmanji/blue.mp3" },
  { en: "Yellow", ku: "zer", hex: "#FFD700", audio: "/audio/kurmanji/yellow.mp3" },
  { en: "Orange", ku: "pirteqal", hex: "#FF8C00", audio: "/audio/kurmanji/orange.mp3" },
  { en: "Purple", ku: "mor", hex: "#8A2BE2", audio: "/audio/kurmanji/purple.mp3" },
  { en: "Silver", ku: "zîv", hex: "#C0C0C0", audio: "/audio/kurmanji/silver.mp3" },
  { en: "Orange-Red", ku: "gevez", hex: "#FF4500", audio: "/audio/kurmanji/cyan.mp3" },
  { en: "Black", ku: "reş", hex: "#000000", audio: "/audio/kurmanji/black.mp3" },
  { en: "White", ku: "spî", hex: "#FFFFFF", audio: "/audio/kurmanji/white.mp3" },
  { en: "Gray", ku: "xwelî", hex: "#808080", audio: "/audio/kurmanji/gray.mp3" },
  { en: "Gold", ku: "zêr", hex: "#FFD700", audio: "/audio/kurmanji/gold.mp3" },
]

export default function ColorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href={`/learn`} className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Colors</h1>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {colors.map((c) => (
            <motion.div key={c.en} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-4 text-center">
              <div className="w-full h-24 rounded-xl mb-3" style={{backgroundColor: c.hex}} />
                  <div className="font-bold text-gray-800">{c.ku.charAt(0).toUpperCase() + c.ku.slice(1)} • {c.en}</div>
                  <div className="mt-2 flex justify-center">
                    <AudioButton 
                      kurdishText={c.ku} 
                      phoneticText={c.en.toUpperCase()} 
                      label="Listen"
                      size="medium"
                    />
                  </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
