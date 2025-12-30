"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Calendar, ArrowLeft, Clock, CalendarDays, RotateCcw, Shuffle, CheckCircle2, XCircle } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

// Helper function to get audio filename for each day
function getDayAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "yekşem": "yeksem",
    "duşem": "dusem",
    "sêşem": "sesem",
    "çarşem": "carsem",
    "pêncşem": "pencsem",
    "în": "in",
    "şemî": "semi",
  };
  return mapping[ku] || ku.toLowerCase();
}

const days = [
  { ku: "yekşem", en: "Sunday", description: "First day of the week", order: 1 },
  { ku: "duşem", en: "Monday", description: "Second day of the week", order: 2 },
  { ku: "sêşem", en: "Tuesday", description: "Third day of the week", order: 3 },
  { ku: "çarşem", en: "Wednesday", description: "Fourth day of the week", order: 4 },
  { ku: "pêncşem", en: "Thursday", description: "Fifth day of the week", order: 5 },
  { ku: "în", en: "Friday", description: "Sixth day of the week", order: 6 },
  { ku: "şemî", en: "Saturday", description: "Seventh day of the week", order: 7 }
]

const timePhrases = [
  { ku: "Îro", en: "Today", filename: "iro.mp3" },
  { ku: "Sibê", en: "Tomorrow", filename: "sibe.mp3" },
  { ku: "Duh", en: "Yesterday", filename: "duh.mp3" },
]

const weekPhrases = [
  { ku: "Ev hefte", en: "This week", filename: "ev-hefte.mp3" },
  { ku: "Hefteya din", en: "Next week", filename: "hefteya-din.mp3" },
]

const dayPhrases = [
  { ku: "Li duşemê", en: "On Monday", filename: "li-duseme.mp3" },
  { ku: "Her roj", en: "Every day", filename: "her-roj.mp3" },
]

const usageExamples = [
  { ku: "Îro duşem e.", en: "Today is Monday", filename: "iro-dusem-e.mp3" },
  { ku: "Sibê sêşem e.", en: "Tomorrow is Tuesday", filename: "sibe-sesem-e.mp3" },
  { ku: "Duh yekşem bû.", en: "Yesterday was Sunday", filename: "duh-yeksem-bu.mp3" },
  { ku: "Îro çi roj e?", en: "What day is it?", filename: "iro-ci-roj-e.mp3" },
  { ku: "Ez diçim dibistanê li duşemê.", en: "I go to school on Monday", filename: "ez-dicim-dibistane-li-duseme.mp3" },
  { ku: "Em li înê bêhna xwe vedidim.", en: "We rest on Friday", filename: "em-li-ine-behna-xwe-vedidim.mp3" },
  { ku: "Hefteya dawî şemî û yekşem e.", en: "The weekend is Saturday and Sunday", filename: "hefteya-dawi-semi-u-yeksem-e.mp3" },
  { ku: "Sibê çi roj e?", en: "What day is tomorrow?", filename: "sibe-ci-roj-e.mp3" },
]

// Get current day of week (0 = Sunday, 1 = Monday, etc.)
function getCurrentDayIndex(): number {
  const today = new Date().getDay()
  // Convert JavaScript day (0=Sunday) to our order (1=Sunday)
  return today === 0 ? 1 : today + 1
}

export default function DaysPage() {
  const [mode, setMode] = useState<'learn' | 'practice'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('days-mode')
      return (saved === 'learn' || saved === 'practice') ? saved : 'learn'
    }
    return 'learn'
  })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('days-mode', mode)
    }
  }, [mode])
  
  const [practiceGame, setPracticeGame] = useState<'order' | 'matching'>('order')
  
  // Day order quiz state
  const [shuffledDays, setShuffledDays] = useState(days)
  const [selectedOrder, setSelectedOrder] = useState<string[]>([])
  const [orderFeedback, setOrderFeedback] = useState<boolean | null>(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  
  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ ku: string; en: string; matched: boolean }>>([])
  const [shuffledKurdish, setShuffledKurdish] = useState<string[]>([])
  const [shuffledEnglish, setShuffledEnglish] = useState<string[]>([])
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'ku' | 'en'; value: string } | null>(null)
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 })
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'ku' | 'en'; value: string }>>([])
  
  const currentDayIndex = getCurrentDayIndex()
  
  // Initialize day order quiz
  const initializeOrderQuiz = () => {
    const shuffled = [...days].sort(() => Math.random() - 0.5)
    setShuffledDays(shuffled)
    setSelectedOrder([])
    setOrderFeedback(null)
    setOrderCompleted(false)
  }
  
  // Initialize matching game
  const initializeMatching = () => {
    const pairs = days.map(d => ({ ku: d.ku, en: d.en, matched: false }))
    const kurdish = days.map(d => d.ku).sort(() => Math.random() - 0.5)
    const english = days.map(d => d.en).sort(() => Math.random() - 0.5)
    
    setMatchingPairs(pairs)
    setShuffledKurdish(kurdish)
    setShuffledEnglish(english)
    setSelectedMatch(null)
    setMatchScore({ correct: 0, total: 0 })
    setIncorrectMatches([])
  }
  
  // Handle day order selection
  const handleDaySelect = (dayKu: string) => {
    if (selectedOrder.includes(dayKu)) {
      setSelectedOrder(prev => prev.filter(d => d !== dayKu))
    } else {
      setSelectedOrder(prev => [...prev, dayKu])
    }
  }
  
  // Check day order
  const checkDayOrder = () => {
    const correctOrder = days.map(d => d.ku)
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(correctOrder)
    setOrderFeedback(isCorrect)
    if (isCorrect) {
      setOrderCompleted(true)
    }
  }
  
  // Handle matching game selection
  const handleMatchSelect = (type: 'ku' | 'en', value: string) => {
    if (!selectedMatch) {
      setSelectedMatch({ type, value })
      setIncorrectMatches([])
    } else {
      if (selectedMatch.type !== type) {
        let isCorrect = false
        
        if (type === 'ku' && selectedMatch.type === 'en') {
          const enValue = selectedMatch.value
          const kuValue = value
          const pair = matchingPairs.find(p => p.ku === kuValue && p.en === enValue)
          if (pair && !pair.matched) {
            isCorrect = true
            setMatchingPairs(prev => prev.map(p => 
              p.ku === kuValue ? { ...p, matched: true } : p
            ))
            setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
          } else {
            setMatchScore(prev => ({ ...prev, total: prev.total + 1 }))
            setIncorrectMatches([
              { type: 'ku', value: kuValue },
              { type: 'en', value: enValue }
            ])
            setTimeout(() => {
              setIncorrectMatches([])
              setSelectedMatch(null)
            }, 1000)
            return
          }
        } else if (type === 'en' && selectedMatch.type === 'ku') {
          const kuValue = selectedMatch.value
          const enValue = value
          const pair = matchingPairs.find(p => p.ku === kuValue && p.en === enValue)
          if (pair && !pair.matched) {
            isCorrect = true
            setMatchingPairs(prev => prev.map(p => 
              p.ku === kuValue ? { ...p, matched: true } : p
            ))
            setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
          } else {
            setMatchScore(prev => ({ ...prev, total: prev.total + 1 }))
            setIncorrectMatches([
              { type: 'ku', value: kuValue },
              { type: 'en', value: enValue }
            ])
            setTimeout(() => {
              setIncorrectMatches([])
              setSelectedMatch(null)
            }, 1000)
            return
          }
        }
        
        setSelectedMatch(null)
        setIncorrectMatches([])
      } else {
        setSelectedMatch({ type, value })
        setIncorrectMatches([])
      }
    }
  }
  
  // Initialize exercises when switching to practice mode
  useEffect(() => {
    if (mode === 'practice') {
      if (practiceGame === 'order') initializeOrderQuiz()
      if (practiceGame === 'matching') initializeMatching()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, practiceGame])
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Days of the Week</h1>
        </div>

        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Learn the seven days of the week in Kurdish. Each day has its own unique name and pronunciation.
        </p>

        {/* Mode Toggle */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('learn')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'learn'
                ? 'bg-kurdish-red text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Learn
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === 'practice'
                ? 'bg-kurdish-red text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Practice
          </button>
        </div>

        {/* Practice Mode - Game Selector Tabs */}
        {mode === 'practice' && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setPracticeGame('order')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                practiceGame === 'order'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Day Order
            </button>
            <button
              onClick={() => setPracticeGame('matching')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm ${
                practiceGame === 'matching'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              Matching
            </button>
          </div>
        )}

        {/* Learn Mode - Days Grid */}
        {mode === 'learn' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
          {days.map((day, index) => (
            <motion.div 
              key={day.ku}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-5"
            >
              {/* Kurdish Day Name - Center */}
              <div className="text-xl font-bold text-gray-800 text-center mb-2">
                {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
              </div>
              
              {/* English Translation - Center */}
              <div className="text-gray-600 text-center mb-4">{day.en}</div>
              
              {/* Bottom Row: Audio Button (Left) + Description (Right) */}
              <div className="flex items-center justify-between">
                <AudioButton 
                  kurdishText={day.ku} 
                  phoneticText={day.en.toUpperCase()} 
                  label="Listen" 
                  size="small"
                  audioFile={`/audio/kurdish-tts-mp3/days/${getDayAudioFile(day.ku)}.mp3`}
                />
                <div className="text-xs text-gray-500">{day.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
        )}

        {/* Learn Mode - Visual Calendar */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 max-w-4xl mx-auto mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Week Calendar</h2>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => {
                const isToday = day.order === currentDayIndex
                return (
                  <div
                    key={day.ku}
                    className={`p-3 rounded-lg text-center border-2 transition-all ${
                      isToday
                        ? 'bg-kurdish-red text-white border-kurdish-red shadow-lg'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-white' : 'text-gray-500'}`}>
                      {day.en.slice(0, 3)}
                    </div>
                    <div className={`text-sm font-bold ${isToday ? 'text-white' : 'text-gray-800'}`}>
                      {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
                    </div>
                    {isToday && (
                      <div className="text-xs text-white/80 mt-1">Today</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Time Phrases */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Time Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {timePhrases.map((phrase, index) => (
                <div key={index} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-kurdish-red mb-1">{phrase.ku}</div>
                    <div className="text-sm text-gray-600">{phrase.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={phrase.ku} 
                    phoneticText={phrase.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${phrase.filename}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Week Phrases */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Week Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {weekPhrases.map((phrase, index) => (
                <div key={index} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-kurdish-red mb-1">{phrase.ku}</div>
                    <div className="text-sm text-gray-600">{phrase.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={phrase.ku} 
                    phoneticText={phrase.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${phrase.filename}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Day Phrases */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Day Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {dayPhrases.map((phrase, index) => (
                <div key={index} className="p-4 rounded-lg border bg-white flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-kurdish-red mb-1">{phrase.ku}</div>
                    <div className="text-sm text-gray-600">{phrase.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={phrase.ku} 
                    phoneticText={phrase.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${phrase.filename}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Usage Examples */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 max-w-4xl mx-auto"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Usage Examples</h2>
            </div>
            
            <div className="space-y-4">
              {usageExamples.map((example, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-kurdish-red mb-1">{example.ku}</div>
                    <div className="text-gray-600">{example.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={example.ku} 
                    phoneticText={example.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/days/${example.filename}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Practice Mode - Day Order Quiz */}
        {mode === 'practice' && practiceGame === 'order' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            className="mt-8 card p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shuffle className="w-6 h-6 text-kurdish-red" />
                <h2 className="text-xl font-bold text-gray-800">Arrange Days in Order</h2>
              </div>
              <button
                onClick={initializeOrderQuiz}
                className="flex items-center gap-2 px-4 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
            
            {orderCompleted ? (
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-8 border-2 border-green-200 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-700 mb-2">Perfect!</h3>
                <div className="text-lg text-gray-700 mb-4">You arranged the days correctly!</div>
                <button
                  onClick={initializeOrderQuiz}
                  className="flex items-center gap-2 px-6 py-3 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Selected order:</div>
                  <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    {selectedOrder.length === 0 ? (
                      <span className="text-gray-400">Click days below to arrange them in order</span>
                    ) : (
                      selectedOrder.map((dayKu, index) => {
                        const day = days.find(d => d.ku === dayKu)
                        return (
                          <button
                            key={index}
                            onClick={() => handleDaySelect(dayKu)}
                            className="px-3 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors text-sm font-medium"
                          >
                            {day?.ku.charAt(0).toUpperCase() + day?.ku.slice(1)}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {shuffledDays.map((day) => {
                    const isSelected = selectedOrder.includes(day.ku)
                    return (
                      <button
                        key={day.ku}
                        onClick={() => handleDaySelect(day.ku)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-kurdish-red text-white border-kurdish-red'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-sm">{day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}</div>
                      </button>
                    )
                  })}
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={checkDayOrder}
                    disabled={selectedOrder.length !== 7}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      selectedOrder.length !== 7
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-kurdish-red text-white hover:bg-kurdish-red/90'
                    }`}
                  >
                    Check Order
                  </button>
                </div>
                
                {orderFeedback !== null && !orderCompleted && (
                  <div className="mt-4 text-center">
                    <div className="text-red-600 font-medium">Incorrect order. Try again!</div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Practice Mode - Matching Game */}
        {mode === 'practice' && practiceGame === 'matching' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            className="mt-8 card p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shuffle className="w-6 h-6 text-kurdish-red" />
                <h2 className="text-xl font-bold text-gray-800">Match Days</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Score: {matchScore.correct}/{matchScore.total}
                </div>
                <button
                  onClick={initializeMatching}
                  className="flex items-center gap-2 px-4 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Kurdish Days Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Kurdish</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shuffledKurdish.map((ku, index) => {
                    const pair = matchingPairs.find(p => p.ku === ku)
                    const isMatched = pair?.matched || false
                    const isSelected = selectedMatch?.type === 'ku' && selectedMatch.value === ku
                    const isIncorrect = incorrectMatches.some(m => m.type === 'ku' && m.value === ku)
                    return (
                      <button
                        key={`ku-${ku}-${index}`}
                        onClick={() => !isMatched && handleMatchSelect('ku', ku)}
                        disabled={isMatched}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isMatched
                            ? 'bg-green-100 border-green-500 opacity-60'
                            : isIncorrect
                            ? 'bg-red-100 border-red-500'
                            : isSelected
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-sm text-gray-800 text-center">{ku}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* English Days Column */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">English</h3>
                <div className="grid grid-cols-2 gap-3">
                  {shuffledEnglish.map((en, index) => {
                    const pair = matchingPairs.find(p => p.en === en)
                    const isMatched = pair?.matched || false
                    const isSelected = selectedMatch?.type === 'en' && selectedMatch.value === en
                    const isIncorrect = incorrectMatches.some(m => m.type === 'en' && m.value === en)
                    return (
                      <button
                        key={`en-${en}-${index}`}
                        onClick={() => !isMatched && handleMatchSelect('en', en)}
                        disabled={isMatched}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isMatched
                            ? 'bg-green-100 border-green-500 opacity-60'
                            : isIncorrect
                            ? 'bg-red-100 border-red-500'
                            : isSelected
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-xs text-gray-800 text-center">{en}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            
            {matchingPairs.every(p => p.matched) && (
              <motion.div
                initial={{opacity:0, scale:0.9}}
                animate={{opacity:1, scale:1}}
                className="mt-6 text-center p-6 bg-green-50 rounded-xl border-2 border-green-200"
              >
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-700 mb-1">Great job!</div>
                <div className="text-sm text-green-600">You matched all days correctly!</div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
