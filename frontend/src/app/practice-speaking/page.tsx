"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { speakKurdish } from '../../lib/kurdishTTS'
import { playWiktionaryAudio } from '../../lib/wiktionaryAudio'

const practiceItems = [
  {
    id: 1,
    kurdish: "Silav",
    english: "Hello",
    pronunciation: "see-LAHV",
    category: "Greeting"
  },
  {
    id: 2,
    kurdish: "Beyanî baş",
    english: "Good morning",
    pronunciation: "beh-yah-NEE BASH",
    category: "Greeting"
  },
  {
    id: 3,
    kurdish: "Spas",
    english: "Thank you",
    pronunciation: "SPAHS",
    category: "Politeness"
  },
  {
    id: 4,
    kurdish: "Ji kerema xwe",
    english: "Please",
    pronunciation: "jee keh-reh-MAH khweh",
    category: "Politeness"
  },
  {
    id: 5,
    kurdish: "Tu çawa yî?",
    english: "How are you?",
    pronunciation: "too CHAH-vah YEE",
    category: "Conversation"
  },
  {
    id: 6,
    kurdish: "Ez baş im",
    english: "I'm fine",
    pronunciation: "ehz BASH eem",
    category: "Conversation"
  },
  {
    id: 7,
    kurdish: "Navê te çi ye?",
    english: "What's your name?",
    pronunciation: "nah-VEH teh CHEE yeh",
    difficulty: "Hard",
    category: "Conversation"
  },
  {
    id: 8,
    kurdish: "Navê min... e",
    english: "My name is...",
    pronunciation: "nah-VEH meen... eh",
    difficulty: "Hard",
    category: "Conversation"
  },
  {
    id: 9,
    kurdish: "Yek",
    english: "One",
    pronunciation: "YEK",
    category: "Numbers"
  },
  {
    id: 10,
    kurdish: "Du",
    english: "Two",
    pronunciation: "DOO",
    category: "Numbers"
  },
  {
    id: 11,
    kurdish: "Sê",
    english: "Three",
    pronunciation: "SEH",
    category: "Numbers"
  },
  {
    id: 12,
    kurdish: "Çar",
    english: "Four",
    pronunciation: "CHAR",
    category: "Numbers"
  },
  {
    id: 13,
    kurdish: "Pênc",
    english: "Five",
    pronunciation: "PENCH",
    category: "Numbers"
  },
  {
    id: 14,
    kurdish: "Sor",
    english: "Red",
    pronunciation: "SOR",
    category: "Colors"
  },
  {
    id: 15,
    kurdish: "Kewş",
    english: "Green",
    pronunciation: "KEWSH",
    category: "Colors"
  },
  {
    id: 16,
    kurdish: "Şîn",
    english: "Blue",
    pronunciation: "SHEEN",
    category: "Colors"
  },
  {
    id: 17,
    kurdish: "Zer",
    english: "Yellow",
    pronunciation: "ZEHR",
    category: "Colors"
  },
  {
    id: 18,
    kurdish: "Dayik",
    english: "Mother",
    pronunciation: "DAH-YEEK",
    category: "Family"
  },
  {
    id: 19,
    kurdish: "Bav",
    english: "Father",
    pronunciation: "BAHV",
    category: "Family"
  },
  {
    id: 20,
    kurdish: "Birayê min",
    english: "My brother",
    pronunciation: "bee-rah-YEH meen",
    category: "Family"
  },
  {
    id: 21,
    kurdish: "Xwişkê min",
    english: "My sister",
    pronunciation: "khweesh-KEH meen",
    category: "Family"
  },
  {
    id: 22,
    kurdish: "Kur",
    english: "Son",
    pronunciation: "KOOR",
    category: "Family"
  },
  {
    id: 23,
    kurdish: "Keç",
    english: "Daughter",
    pronunciation: "KECH",
    category: "Family"
  },
  {
    id: 24,
    kurdish: "Mal",
    english: "House",
    pronunciation: "MAHL",
    category: "Home"
  },
  {
    id: 25,
    kurdish: "Derî",
    english: "Door",
    pronunciation: "deh-REE",
    category: "Home"
  },
  {
    id: 26,
    kurdish: "Pencere",
    english: "Window",
    pronunciation: "pen-jeh-REH",
    category: "Home"
  },
  {
    id: 27,
    kurdish: "Mase",
    english: "Table",
    pronunciation: "mah-SEH",
    category: "Home"
  },
  {
    id: 28,
    kurdish: "Kursî",
    english: "Chair",
    pronunciation: "koor-SEE",
    category: "Home"
  },
  {
    id: 29,
    kurdish: "Xwarin",
    english: "Food",
    pronunciation: "khwah-REEN",
    category: "Food"
  },
  {
    id: 30,
    kurdish: "Av",
    english: "Water",
    pronunciation: "AHV",
    category: "Food"
  },
  {
    id: 31,
    kurdish: "Nan",
    english: "Bread",
    pronunciation: "NAHN",
    category: "Food"
  },
  {
    id: 32,
    kurdish: "Şîr",
    english: "Milk",
    pronunciation: "SHEER",
    category: "Food"
  },
  {
    id: 33,
    kurdish: "Mêwe",
    english: "Fruit",
    pronunciation: "meh-WEH",
    category: "Food"
  },
  {
    id: 34,
    kurdish: "Guh",
    english: "Ear",
    pronunciation: "GOOH",
    category: "Body"
  },
  {
    id: 35,
    kurdish: "Çav",
    english: "Eye",
    pronunciation: "CHAHV",
    category: "Body"
  },
  {
    id: 36,
    kurdish: "Dest",
    english: "Hand",
    pronunciation: "DEST",
    category: "Body"
  },
  {
    id: 37,
    kurdish: "Ling",
    english: "Foot",
    pronunciation: "LEENG",
    category: "Body"
  },
  {
    id: 38,
    kurdish: "Ser",
    english: "Head",
    pronunciation: "SEHR",
    category: "Body"
  },
  {
    id: 39,
    kurdish: "Dil",
    english: "Heart",
    pronunciation: "DEEL",
    category: "Body"
  },
  {
    id: 40,
    kurdish: "Roj",
    english: "Day",
    pronunciation: "ROZH",
    category: "Time"
  },
  {
    id: 41,
    kurdish: "Şev",
    english: "Night",
    pronunciation: "SHEV",
    category: "Time"
  },
  {
    id: 42,
    kurdish: "Sibê",
    english: "Morning",
    pronunciation: "see-BEH",
    category: "Time"
  },
  {
    id: 43,
    kurdish: "Êvar",
    english: "Evening",
    pronunciation: "eh-VAHR",
    category: "Time"
  },
  {
    id: 44,
    kurdish: "Havîn",
    english: "Summer",
    pronunciation: "hah-VEEN",
    category: "Seasons"
  },
  {
    id: 45,
    kurdish: "Zivistan",
    english: "Winter",
    pronunciation: "zee-vees-TAHN",
    category: "Seasons"
  },
  {
    id: 46,
    kurdish: "Bihar",
    english: "Spring",
    pronunciation: "bee-HAHR",
    category: "Seasons"
  },
  {
    id: 47,
    kurdish: "Payîz",
    english: "Autumn",
    pronunciation: "pah-YEEZ",
    category: "Seasons"
  }
]

export default function PracticeSpeakingPage() {
  const [currentItem, setCurrentItem] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(0)

  const item = practiceItems[currentItem]

  const playPronunciation = async () => {
    setIsPlaying(true)
    
    try {
      // Try Wiktionary audio first, fallback to TTS
      await playWiktionaryAudio(
        item.kurdish, 
        item.pronunciation,
        async () => {
          await speakKurdish(item.kurdish, item.pronunciation)
        }
      )
    } catch (error) {
      console.error('Pronunciation playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const playPhoneticSimulation = () => {
    // Create a more realistic pronunciation simulation based on the phonetic guide
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Parse the pronunciation guide to create syllable-based tones
      const syllables = item.pronunciation.split(' ').filter(s => s.length > 0)
      let currentTime = audioContext.currentTime
      
      syllables.forEach((syllable, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Different frequencies for different syllable types
        let frequency = 400
        if (syllable.includes('AH') || syllable.includes('ah')) frequency = 500
        if (syllable.includes('EE') || syllable.includes('ee')) frequency = 600
        if (syllable.includes('EH') || syllable.includes('eh')) frequency = 450
        if (syllable.includes('UH') || syllable.includes('uh')) frequency = 350
        
        oscillator.frequency.setValueAtTime(frequency, currentTime)
        
        // Syllable duration based on length
        const duration = syllable.length > 4 ? 0.4 : 0.3
        
        gainNode.gain.setValueAtTime(0.2, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration)
        
        oscillator.start(currentTime)
        oscillator.stop(currentTime + duration)
        
        currentTime += duration + 0.1 // Small pause between syllables
      })
      
      // Stop playing state after all syllables finish
      setTimeout(() => setIsPlaying(false), (syllables.length * 0.4) + 500)
    } catch (error) {
      console.log('Audio simulation failed, using visual feedback')
      setTimeout(() => setIsPlaying(false), 2000)
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setShowFeedback(false)
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false)
      setShowFeedback(true)
      setAttempts(prev => prev + 1)
      // Simulate success/failure
      if (Math.random() > 0.3) {
        setScore(prev => prev + 1)
      }
    }, 3000)
  }

  const nextItem = () => {
    setCurrentItem((prev) => (prev + 1) % practiceItems.length)
    setShowFeedback(false)
    setAttempts(0)
  }

  const resetItem = () => {
    setShowFeedback(false)
    setAttempts(0)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-kurdish-red font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">Practice Speaking</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Score: {score}</span>
            <span className="text-sm text-gray-600">Item: {currentItem + 1}/{practiceItems.length}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentItem + 1) / practiceItems.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primaryBlue to-secondaryYellow h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentItem + 1) / practiceItems.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Main Practice Card */}
          <motion.div 
            key={currentItem}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card p-8 text-center"
          >
            {/* Category */}
            <div className="flex justify-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {item.category}
              </span>
            </div>

            {/* Kurdish Word */}
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-kurdish-red mb-2">{item.kurdish}</h2>
              <p className="text-lg text-gray-600 mb-1">{item.english}</p>
              <p className="text-sm text-gray-500">{item.pronunciation}</p>
            </div>

            {/* Audio Controls */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={playPronunciation}
                disabled={isPlaying}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isPlaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                {isPlaying ? 'Playing...' : 'Listen to Pronunciation'}
              </button>
            </div>

            {/* Recording Section */}
            <div className="mb-6">
              <p className="text-gray-700 mb-4">Try saying the Kurdish word:</p>
              
              {!showFeedback ? (
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-lg transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-gradient-to-r from-primaryBlue to-secondaryYellow hover:scale-105'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-6 h-6" />
                      Recording... ({3 - Math.floor((3000 - Date.now() % 3000) / 1000)}s)
                    </>
                  ) : (
                    <>
                      <Mic className="w-6 h-6" />
                      Start Recording
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-lg">
                    {score > attempts - score ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-green-600 font-bold">Great pronunciation!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-red-500" />
                        <span className="text-red-600 font-bold">Keep practicing!</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={resetItem}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                    <button
                      onClick={nextItem}
                      className="px-4 py-2 bg-gradient-to-r from-primaryBlue to-secondaryYellow text-white rounded-xl hover:scale-105 transition-transform"
                    >
                      Next Word
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Practice Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <h4 className="font-bold text-yellow-800 mb-2">💡 Practice Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Listen to the pronunciation first</li>
                <li>• Break the word into syllables</li>
                <li>• Practice slowly, then speed up</li>
                <li>• Record yourself and compare</li>
              </ul>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-primaryBlue">{score}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-kurdish-red">{currentItem + 1}</div>
              <div className="text-sm text-gray-600">Current</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-500">{practiceItems.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
