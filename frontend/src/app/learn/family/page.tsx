"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

const family = [
  { en: "Family", ku: "malbat", icon: "👨‍👩‍👧‍👦", audioFile: "/audio/kurdish-tts-mp3/family/malbat.mp3" },
  { en: "Mother", ku: "dayik", icon: "👩", audioFile: "/audio/kurdish-tts-mp3/family/dayik.mp3" },
  { en: "Father", ku: "bav", icon: "👨", audioFile: "/audio/kurdish-tts-mp3/family/bav.mp3" },
  { en: "Sister", ku: "xwişk", icon: "👧", audioFile: "/audio/kurdish-tts-mp3/family/xwisk.mp3" },
  { en: "Brother", ku: "bira", icon: "👦", audioFile: "/audio/kurdish-tts-mp3/family/bira.mp3" },
  { en: "Daughter", ku: "keç", icon: "👧", audioFile: "/audio/kurdish-tts-mp3/family/kec.mp3" },
  { en: "Son", ku: "kur", icon: "👦", audioFile: "/audio/kurdish-tts-mp3/family/kur.mp3" },
  { en: "Grandmother", ku: "dapîr", icon: "👵", audioFile: "/audio/kurdish-tts-mp3/family/dapir.mp3" },
  { en: "Grandfather", ku: "bapîr", icon: "👴", audioFile: "/audio/kurdish-tts-mp3/family/bapir.mp3" },
  { en: "Paternal uncle", ku: "apo", icon: "👨", audioFile: "/audio/kurdish-tts-mp3/family/apo.mp3" },
  { en: "Maternal uncle", ku: "xalo", icon: "👨", audioFile: "/audio/kurdish-tts-mp3/family/xalo.mp3" },
  { en: "Paternal aunt", ku: "metê", icon: "👩", audioFile: "/audio/kurdish-tts-mp3/family/mete.mp3" },
  { en: "Maternal aunt", ku: "xaltî", icon: "👩", audioFile: "/audio/kurdish-tts-mp3/family/xalti.mp3" },
  { en: "Parents", ku: "dewûbav", icon: "👨‍👩‍👧", audioFile: "/audio/kurdish-tts-mp3/family/dewubav.mp3" },
  { en: "Baby", ku: "zarok", icon: "👶", audioFile: "/audio/kurdish-tts-mp3/family/zarok.mp3" },
  { en: "Cousin", ku: "pismam", icon: "👫", audioFile: "/audio/kurdish-tts-mp3/family/pismam.mp3" },
  { en: "Uncle's daughter", ku: "dotmam", icon: "👧", audioFile: "/audio/kurdish-tts-mp3/family/dotmam.mp3" },
  { en: "Uncle's son", ku: "kurap", icon: "👦", audioFile: "/audio/kurdish-tts-mp3/family/kurap.mp3" },
  { en: "Mother-in-law", ku: "xesû", icon: "👩", audioFile: "/audio/kurdish-tts-mp3/family/xesu.mp3" },
  { en: "Father-in-law", ku: "xezûr", icon: "👨", audioFile: "/audio/kurdish-tts-mp3/family/xezur.mp3" },
  { en: "Sister-in-law", ku: "jinbira", icon: "👩", audioFile: "/audio/kurdish-tts-mp3/family/jinbira.mp3" },
  { en: "Brother-in-law", ku: "tîbira", icon: "👨", audioFile: "/audio/kurdish-tts-mp3/family/tibira.mp3" },
  { en: "Groom", ku: "zava", icon: "🤵", audioFile: "/audio/kurdish-tts-mp3/family/zava.mp3" },
  { en: "Bride", ku: "bûk", icon: "👰", audioFile: "/audio/kurdish-tts-mp3/family/buk.mp3" },
]

// Possessive forms
const possessiveForms = [
  { ku: "dayika min", en: "my mother", audioFile: "/audio/kurdish-tts-mp3/family/dayika-min.mp3" },
  { ku: "bavê te", en: "your father", audioFile: "/audio/kurdish-tts-mp3/family/bave-te.mp3" },
  { ku: "xwişka wî", en: "his sister", audioFile: "/audio/kurdish-tts-mp3/family/xwiska-wi.mp3" },
  { ku: "xwişka wê", en: "her sister", audioFile: "/audio/kurdish-tts-mp3/family/xwiska-we.mp3" },
  { ku: "birayê min", en: "my brother", audioFile: "/audio/kurdish-tts-mp3/family/biraye-min.mp3" },
  { ku: "malbata min", en: "my family", audioFile: "/audio/kurdish-tts-mp3/family/malbata-min.mp3" },
]

// Age-related terms for siblings
const ageTerms = [
  { ku: "birayê mezin", en: "elder brother", audioFile: "/audio/kurdish-tts-mp3/family/biraye-mezin.mp3" },
  { ku: "birayê piçûk", en: "younger brother", audioFile: "/audio/kurdish-tts-mp3/family/biraye-picuk.mp3" },
  { ku: "xwişka mezin", en: "elder sister", audioFile: "/audio/kurdish-tts-mp3/family/xwiska-mezin.mp3" },
  { ku: "xwişka piçûk", en: "younger sister", audioFile: "/audio/kurdish-tts-mp3/family/xwiska-picuk.mp3" },
]

// Family phrases
const familyPhrases = [
  { ku: "Ez malbata xwe hez dikim", en: "I love my family", audioFile: "/audio/kurdish-tts-mp3/family/ez-malbata-xwe-hez-dikim.mp3" },
  { ku: "Ev dayika min e", en: "This is my mother", audioFile: "/audio/kurdish-tts-mp3/family/ev-dayika-min-e.mp3" },
  { ku: "Ev bava min e", en: "This is my father", audioFile: "/audio/kurdish-tts-mp3/family/ev-bava-min-e.mp3" },
  { ku: "Ev xwişka min e", en: "This is my sister", audioFile: "/audio/kurdish-tts-mp3/family/ev-xwiska-min-e.mp3" },
  { ku: "Ez birayê xwe hez dikim", en: "I love my brother", audioFile: "/audio/kurdish-tts-mp3/family/ez-biraye-xwe-hez-dikim.mp3" },
  { ku: "Malbata min mezin e", en: "My family is big", audioFile: "/audio/kurdish-tts-mp3/family/malbata-min-mezin-e.mp3" },
]

// Family questions
const familyQuestions = [
  { ku: "Çend xwişk û birayên te hene?", en: "How many sisters and brothers do you have?", audioFile: "/audio/kurdish-tts-mp3/family/cend-xwisk-u-birayen-te-hene.mp3" },
  { ku: "Ev kî ye?", en: "Who is this?", audioFile: "/audio/kurdish-tts-mp3/family/ev-ki-ye.mp3" },
  { ku: "Dayika te li ku ye?", en: "Where is your mother?", audioFile: "/audio/kurdish-tts-mp3/family/dayika-te-li-ku-ye.mp3" },
  { ku: "Malbata te li ku ye?", en: "Where is your family?", audioFile: "/audio/kurdish-tts-mp3/family/malbata-te-li-ku-ye.mp3" },
  { ku: "Tu zewicî yî?", en: "Are you married?", audioFile: "/audio/kurdish-tts-mp3/family/tu-zewici-yi.mp3" },
  { ku: "Bavê te li ku ye?", en: "Where is your father?", audioFile: "/audio/kurdish-tts-mp3/family/bave-te-li-ku-ye.mp3" },
]

export default function FamilyWordsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Family Members</h1>
        </div>

        {/* Family Members */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            Family Members
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {family.map((f) => (
              <motion.div key={f.en} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="font-bold text-gray-800 text-center">{f.ku.charAt(0).toUpperCase() + f.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{f.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={f.ku} 
                    phoneticText={f.en.toUpperCase()} 
                    label="Listen"
                    size="medium"
                    audioFile={f.audioFile}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{f.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Possessive Forms */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Possessive Forms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {possessiveForms.map((item, index) => (
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

        {/* Age-Related Terms */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Age-Related Terms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ageTerms.map((item, index) => (
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

        {/* Family Phrases */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💭</span>
            Family Phrases
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {familyPhrases.map((item, index) => (
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

        {/* Family Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❓</span>
            Family Questions
          </h2>
          <div className="space-y-4">
            {familyQuestions.map((item, index) => (
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


