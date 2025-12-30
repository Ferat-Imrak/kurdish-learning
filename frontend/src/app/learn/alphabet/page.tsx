"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, HelpCircle, ArrowLeftRight } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { useEffect } from "react"

// Helper function to get audio filename for each letter
function getLetterAudioFile(glyph: string): string {
  const letterMap: Record<string, string> = {
    'A': 'a',
    'B': 'b',
    'C': 'c',
    'Ç': 'cedilla-c',
    'D': 'd',
    'E': 'e',
    'Ê': 'circumflex-e',
    'F': 'f',
    'G': 'g',
    'H': 'h',
    'I': 'i',
    'Î': 'circumflex-i',
    'J': 'j',
    'K': 'k',
    'L': 'l',
    'M': 'm',
    'N': 'n',
    'O': 'o',
    'P': 'p',
    'Q': 'q',
    'R': 'r',
    'S': 's',
    'Ş': 'cedilla-s',
    'T': 't',
    'U': 'u',
    'Û': 'circumflex-u',
    'V': 'v',
    'W': 'w',
    'X': 'x',
    'Y': 'y',
    'Z': 'z'
  };
  
  return letterMap[glyph] || glyph.toLowerCase();
}

const LESSON_ID = '1' // Alphabet lesson ID

const letters = [
  { glyph: "A", word: "av", meaning: "water" },
  { glyph: "B", word: "bav", meaning: "father" },
  { glyph: "C", word: "cîran", meaning: "neighbors" },
  { glyph: "Ç", word: "çav", meaning: "eyes" },
  { glyph: "D", word: "dest", meaning: "hand" },
  { glyph: "E", word: "ev", meaning: "this" },
  { glyph: "Ê", word: "êvar", meaning: "evening" },
  { glyph: "F", word: "fîl", meaning: "elephant" },
  { glyph: "G", word: "gur", meaning: "wolf" },
  { glyph: "H", word: "hesp", meaning: "horse" },
  { glyph: "I", word: "isal", meaning: "this year" },
  { glyph: "Î", word: "îro", meaning: "today" },
  { glyph: "J", word: "jin", meaning: "woman" },
  { glyph: "K", word: "kur", meaning: "son" },
  { glyph: "L", word: "ling", meaning: "leg" },
  { glyph: "M", word: "mal", meaning: "house" },
  { glyph: "N", word: "nav", meaning: "name" },
  { glyph: "O", word: "ode", meaning: "room" },
  { glyph: "P", word: "poz", meaning: "nose" },
  { glyph: "Q", word: "qel", meaning: "crow" },
  { glyph: "R", word: "roj", meaning: "sun" },
  { glyph: "S", word: "sor", meaning: "red" },
  { glyph: "Ş", word: "şêr", meaning: "lion" },
  { glyph: "T", word: "tili", meaning: "finger" },
  { glyph: "U", word: "usta", meaning: "master" },
  { glyph: "Û", word: "ûr", meaning: "fire" },
  { glyph: "V", word: "vexwarin", meaning: "to drink" },
  { glyph: "W", word: "welat", meaning: "country" },
  { glyph: "X", word: "xwişk", meaning: "sister" },
  { glyph: "Y", word: "yek", meaning: "one" },
  { glyph: "Z", word: "ziman", meaning: "tongue" },
]

export default function AlphabetPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()

  // Mark lesson as in progress on mount
  useEffect(() => {
    const progress = getLessonProgress(LESSON_ID)
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
  }, [getLessonProgress, updateLessonProgress])

  const handleAudioPlay = () => {
    const progress = getLessonProgress(LESSON_ID)
    const newProgress = Math.min(100, progress.progress + 2)
    updateLessonProgress(LESSON_ID, newProgress, 'IN_PROGRESS')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Kurdish Alphabet</h1>
          <p className="text-gray-700 mt-4 text-center max-w-2xl mx-auto">
            Learn all 31 letters of the Kurdish alphabet with pronunciation and example words. Start here!
          </p>
        </div>

        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {letters.map((l) => (
              <motion.div key={l.glyph} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-kurdish-red">{l.glyph}</div>
                </div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={l.glyph.toLowerCase()} 
                    phoneticText={l.glyph.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/alphabet/${getLetterAudioFile(l.glyph)}.mp3`}
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">{l.word}</div>
                    <div className="text-xs text-gray-500">{l.meaning}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Letter Comparison Section */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.1 }}
          className="mt-8 card p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-kurdish-red" />
            Letter Comparison
          </h2>
          <p className="text-gray-600 text-sm mb-6">Compare similar-looking letters with different sounds:</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* I vs Î */}
            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">I</div>
                  <div className="text-xs text-gray-500 mb-1">Short sound</div>
                  <AudioButton 
                    kurdishText="i" 
                    phoneticText="I" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/i.mp3"
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">isal</div>
                  <div className="text-xs text-gray-500">this year</div>
                </div>
                <div className="text-2xl text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">Î</div>
                  <div className="text-xs text-gray-500 mb-1">Long sound</div>
                  <AudioButton 
                    kurdishText="î" 
                    phoneticText="Î" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-i.mp3"
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">îro</div>
                  <div className="text-xs text-gray-500">today</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> I is short like "it", Î is long like "ee" in "see"
              </div>
            </div>

            {/* U vs Û */}
            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-purple-50 to-white">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">U</div>
                  <div className="text-xs text-gray-500 mb-1">Short sound</div>
                  <AudioButton 
                    kurdishText="u" 
                    phoneticText="U" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/u.mp3"
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">usta</div>
                  <div className="text-xs text-gray-500">master</div>
                </div>
                <div className="text-2xl text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">Û</div>
                  <div className="text-xs text-gray-500 mb-1">Long sound</div>
                  <AudioButton 
                    kurdishText="û" 
                    phoneticText="Û" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-u.mp3"
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">ûr</div>
                  <div className="text-xs text-gray-500">fire</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> U is short like "put", Û is long like "oo" in "moon"
              </div>
            </div>

            {/* E vs Ê */}
            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">E</div>
                  <div className="text-xs text-gray-500 mb-1">Short sound</div>
                  <AudioButton 
                    kurdishText="e" 
                    phoneticText="E" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/e.mp3"
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">ev</div>
                  <div className="text-xs text-gray-500">this</div>
                </div>
                <div className="text-2xl text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">Ê</div>
                  <div className="text-xs text-gray-500 mb-1">Long sound</div>
                  <AudioButton 
                    kurdishText="ê" 
                    phoneticText="Ê" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-e.mp3"
                    onPlay={handleAudioPlay}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">êvar</div>
                  <div className="text-xs text-gray-500">evening</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> E is short like "bet", Ê is long like "ay" in "say"
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pronunciation Tips */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.2 }}
          className="mt-8 card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-kurdish-red" />
            Pronunciation Tips for Special Characters
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold mb-2">Ç (cedilla C):</p>
              <p className="text-sm">Sounds like "ch" in "chair" - çav (eyes)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Ş (cedilla S):</p>
              <p className="text-sm">Sounds like "sh" in "shoe" - şêr (lion)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">X:</p>
              <p className="text-sm">Sounds like "kh" (guttural sound) - xwişk (sister)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Q:</p>
              <p className="text-sm">Sounds like "q" in Arabic - qel (crow)</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
