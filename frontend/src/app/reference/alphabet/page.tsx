"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, HelpCircle, ArrowLeftRight } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

// Helper function to get audio filename for each letter
function getLetterAudioFile(glyph: string): string {
  const letterMap: Record<string, string> = {
    'A': 'a',
    'B': 'b',
    'C': 'c',
    'Ç': 'cedilla-c',  // Special handling for Ç
    'D': 'd',
    'E': 'e',
    'Ê': 'circumflex-e',  // Separate file for Ê
    'F': 'f',
    'G': 'g',
    'H': 'h',
    'I': 'i',
    'Î': 'circumflex-i',  // Separate file for Î
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
    'Ş': 'cedilla-s',  // Separate file for Ş
    'T': 't',
    'U': 'u',
    'Û': 'circumflex-u',  // Separate file for Û
    'V': 'v',
    'W': 'w',
    'X': 'x',
    'Y': 'y',
    'Z': 'z'
  };
  
  return letterMap[glyph] || glyph.toLowerCase();
}

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

export default function AlphabetPart1Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Kurdish Alphabet</h1>
        </div>

        <p className="text-gray-700 mb-6 text-center">Learn Kurdish letters with pronunciation and example words.</p>

        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
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
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">ûr</div>
                  <div className="text-xs text-gray-500">fire</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> U is short like "put", Û is long like "oo" in "moon"
              </div>
            </div>

            {/* S vs Ş */}
            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">S</div>
                  <div className="text-xs text-gray-500 mb-1">Regular S</div>
                  <AudioButton 
                    kurdishText="s" 
                    phoneticText="S" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/s.mp3"
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">sor</div>
                  <div className="text-xs text-gray-500">red</div>
                </div>
                <div className="text-2xl text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">Ş</div>
                  <div className="text-xs text-gray-500 mb-1">Sh sound</div>
                  <AudioButton 
                    kurdishText="ş" 
                    phoneticText="Ş" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/cedilla-s.mp3"
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">şêr</div>
                  <div className="text-xs text-gray-500">lion</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> S is like "sun", Ş is like "sh" in "shoe"
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pronunciation Tips Section */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.2 }}
          className="mt-8 card p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-kurdish-red" />
            Pronunciation Tips for Special Characters
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ç */}
            <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-kurdish-red">Ç</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">çav</div>
                  <div className="text-xs text-gray-500">eyes</div>
                </div>
                <AudioButton 
                  kurdishText="ç" 
                  phoneticText="Ç" 
                  label="Listen" 
                  size="small"
                  audioFile="/audio/kurdish-tts-mp3/alphabet/cedilla-c.mp3"
                />
              </div>
              <div className="text-xs text-gray-600">
                <strong>Sound:</strong> Like "ch" in "chair" or "church"
              </div>
            </div>

            {/* Ê */}
            <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-kurdish-red">Ê</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">êvar</div>
                  <div className="text-xs text-gray-500">evening</div>
                </div>
                <AudioButton 
                  kurdishText="ê" 
                  phoneticText="Ê" 
                  label="Listen" 
                  size="small"
                  audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-e.mp3"
                />
              </div>
              <div className="text-xs text-gray-600">
                <strong>Sound:</strong> Long "e" like "ay" in "say" or "e" in "they"
              </div>
            </div>

            {/* Î */}
            <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-kurdish-red">Î</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">îro</div>
                  <div className="text-xs text-gray-500">today</div>
                </div>
                <AudioButton 
                  kurdishText="î" 
                  phoneticText="Î" 
                  label="Listen" 
                  size="small"
                  audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-i.mp3"
                />
              </div>
              <div className="text-xs text-gray-600">
                <strong>Sound:</strong> Long "ee" like "ee" in "see" or "i" in "machine"
              </div>
            </div>

            {/* Ş */}
            <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-kurdish-red">Ş</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">şêr</div>
                  <div className="text-xs text-gray-500">lion</div>
                </div>
                <AudioButton 
                  kurdishText="ş" 
                  phoneticText="Ş" 
                  label="Listen" 
                  size="small"
                  audioFile="/audio/kurdish-tts-mp3/alphabet/cedilla-s.mp3"
                />
              </div>
              <div className="text-xs text-gray-600">
                <strong>Sound:</strong> Like "sh" in "shoe" or "sh" in "wish"
              </div>
            </div>

            {/* Û */}
            <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-kurdish-red">Û</div>
                <div>
                  <div className="text-sm font-medium text-gray-800">ûr</div>
                  <div className="text-xs text-gray-500">fire</div>
                </div>
                <AudioButton 
                  kurdishText="û" 
                  phoneticText="Û" 
                  label="Listen" 
                  size="small"
                  audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-u.mp3"
                />
              </div>
              <div className="text-xs text-gray-600">
                <strong>Sound:</strong> Long "oo" like "oo" in "moon" or "u" in "rule"
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


