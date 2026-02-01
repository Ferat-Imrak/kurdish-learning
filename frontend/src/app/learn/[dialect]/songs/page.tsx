"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, Star, ThumbsUp, Smile, Volume2, Loader2, MessageCircle, Users, HelpCircle, MapPin, Calendar, Utensils, ArrowLeft } from "lucide-react"
import { speakKurdish } from "../../../../lib/kurdishTTS"
import { playWiktionaryAudio } from "../../../../lib/wiktionaryAudio"
import { useState } from "react"

const phrases = [
  // Basic Greetings & Politeness
  {
    english: "Good day/Hello",
    kurdish: "Roj baş",
    pronunciation: "ROHZH BASH",
    category: "greeting",
    icon: <Smile className="w-6 h-6" />
  },
  {
    english: "Thank you",
    kurdish: "Spas dikim",
    pronunciation: "SPAHS dee-KEEM",
    category: "politeness",
    icon: <ThumbsUp className="w-6 h-6" />
  },
  {
    english: "Excuse me/Sorry",
    kurdish: "Bibore",
    pronunciation: "bee-BOH-reh",
    category: "politeness",
    icon: <Heart className="w-6 h-6" />
  },
  {
    english: "You're welcome",
    kurdish: "Ser çavan",
    pronunciation: "SEHR chah-VAHN",
    category: "politeness",
    icon: <Star className="w-6 h-6" />
  },
  
  // Essential Communication
  {
    english: "I am learning Kurdish",
    kurdish: "Ez kurdî fêr dibim",
    pronunciation: "ehz koor-DEE fehr dee-BEEM",
    category: "communication",
    icon: <MessageCircle className="w-6 h-6" />
  },
  {
    english: "I don't know Kurmanji",
    kurdish: "Ez kurmancî nizanim",
    pronunciation: "ehz koor-mahn-CHEE nee-zah-NEEM",
    category: "communication",
    icon: <HelpCircle className="w-6 h-6" />
  },
  {
    english: "Do you know Kurdish?",
    kurdish: "Tu kurdî dizanî?",
    pronunciation: "too koor-DEE dee-zah-NEE",
    category: "communication",
    icon: <MessageCircle className="w-6 h-6" />
  },
  {
    english: "Say it again",
    kurdish: "Dîsa bêje",
    pronunciation: "DEE-sah BEH-jeh",
    category: "communication",
    icon: <Volume2 className="w-6 h-6" />
  },
  {
    english: "Speak slowly",
    kurdish: "Hêdî biaxive",
    pronunciation: "HEH-dee bee-ah-khee-VEH",
    category: "communication",
    icon: <Volume2 className="w-6 h-6" />
  },
  
  // Basic Needs
  {
    english: "I am hungry",
    kurdish: "Ez birçî me",
    pronunciation: "ehz beer-CHEE meh",
    category: "needs",
    icon: <Utensils className="w-6 h-6" />
  },
  {
    english: "I am thirsty",
    kurdish: "Ez tî me",
    pronunciation: "ehz TEE meh",
    category: "needs",
    icon: <Utensils className="w-6 h-6" />
  },
  {
    english: "Help me",
    kurdish: "Alîkariya min bike",
    pronunciation: "ah-lee-kah-REE-yah meen BEE-keh",
    category: "needs",
    icon: <HelpCircle className="w-6 h-6" />
  },
  {
    english: "What is that?",
    kurdish: "Ew çi ye?",
    pronunciation: "ehw CHEE yeh",
    category: "needs",
    icon: <HelpCircle className="w-6 h-6" />
  },
  {
    english: "How much is this?",
    kurdish: "Ev çend e?",
    pronunciation: "ehv CHEHND eh",
    category: "needs",
    icon: <Star className="w-6 h-6" />
  },
  
  // Personal Information
  {
    english: "My name is...",
    kurdish: "Navê min … e",
    pronunciation: "nah-VEH meen … eh",
    category: "personal",
    icon: <Users className="w-6 h-6" />
  },
  {
    english: "I am from...",
    kurdish: "Ez ji … me",
    pronunciation: "ehz jee … meh",
    category: "personal",
    icon: <MapPin className="w-6 h-6" />
  },
  {
    english: "I am ... years old",
    kurdish: "Ez … salî me",
    pronunciation: "ehz … sah-LEE meh",
    category: "personal",
    icon: <Calendar className="w-6 h-6" />
  },
  {
    english: "I live in ………",
    kurdish: "Ez li ……… dijîm",
    pronunciation: "ehz lee ……… dee-JEEM",
    category: "personal",
    icon: <MapPin className="w-6 h-6" />
  },
  {
    english: "How are you?",
    kurdish: "Tu çawa yî?",
    pronunciation: "too CHAH-vah YEE",
    category: "personal",
    icon: <Smile className="w-6 h-6" />
  },
  
  // Basic Response
  {
    english: "I'm fine, thank you",
    kurdish: "Baş im, spas",
    pronunciation: "BASH eem, SPAHS",
    category: "response",
    icon: <ThumbsUp className="w-6 h-6" />
  }
]

const categories = {
  greeting: { color: "bg-green-100 text-green-800", label: "Greetings" },
  politeness: { color: "bg-blue-100 text-blue-800", label: "Politeness" },
  communication: { color: "bg-purple-100 text-purple-800", label: "Communication" },
  needs: { color: "bg-orange-100 text-orange-800", label: "Basic Needs" },
  personal: { color: "bg-pink-100 text-pink-800", label: "Personal Info" },
  response: { color: "bg-indigo-100 text-indigo-800", label: "Responses" }
}

function PhraseAudioButton({ kurdish, pronunciation }: { kurdish: string; pronunciation: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const playAudio = async () => {
    if (isPlaying || isLoading) return
    
    setIsLoading(true)
    setIsPlaying(true)
    
    try {
      // Try Wiktionary audio first, fallback to TTS
      await playWiktionaryAudio(
        kurdish, 
        pronunciation,
        async () => {
          await speakKurdish(kurdish, pronunciation)
        }
      )
    } catch (error) {
      console.error('Audio playback failed:', error)
    } finally {
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  return (
    <button
      onClick={playAudio}
      disabled={isPlaying || isLoading}
      className="flex items-center gap-2 px-3 py-2 bg-primaryBlue text-white rounded-lg hover:bg-primaryBlue/80 disabled:opacity-50 transition-colors text-sm"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : 'Listen'}
    </button>
  )
}

export default function DailyPhrasesPage({ params }: { params: { dialect: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href={`/learn`} className="text-kurdish-red font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">Daily Phrases</h1>
          <div />
        </div>

        <div className="mb-6 text-center">
          <p className="text-lg text-gray-600 mb-2">
            🗣️ Learn essential Kurdish phrases for everyday conversations!
          </p>
          <p className="text-sm text-gray-500">
            Practice these common expressions to start speaking Kurdish confidently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {phrases.map((phrase, index) => (
            <motion.div 
              key={phrase.english}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-primaryBlue">
                    {phrase.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{phrase.english}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categories[phrase.category as keyof typeof categories].color}`}>
                      {categories[phrase.category as keyof typeof categories].label}
                    </span>
                  </div>
                </div>
              </div>
              
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xl font-bold text-kurdish-red mb-1">
                      {phrase.kurdish}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium">Practice tip:</span>
                      <span>Repeat "{phrase.kurdish}" 3 times out loud!</span>
                    </div>
                    <PhraseAudioButton kurdish={phrase.kurdish} pronunciation={phrase.pronunciation} />
                  </div>
                </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-primaryBlue to-secondaryYellow rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">🎯 Practice Challenge</h3>
            <p className="mb-4">
              Try using these phrases in your daily conversations!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-3">
                <strong>Morning:</strong> Say "Beyanî baş" to family
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <strong>Throughout day:</strong> Use "Spas" when someone helps you
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <strong>Evening:</strong> Practice "Silav" with friends
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


