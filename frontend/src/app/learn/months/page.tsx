"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Calendar, ArrowLeft, Clock, CalendarDays, RotateCcw, Shuffle, CheckCircle2 } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"

const LESSON_ID = '4' // Months lesson ID

// Helper function to get audio filename for each month
function getMonthAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "çile": "cile",
    "sibat": "sibat",
    "adar": "adar",
    "nîsan": "nisan",
    "gulan": "gulan",
    "hezîran": "heziran",
    "tîrmeh": "tirmeh",
    "tebax": "tebax",
    "îlon": "ilon",
    "cotmeh": "cotmeh",
    "mijdar": "mijdar",
    "kanûn": "kanun",
  };
  return mapping[ku] || ku.toLowerCase();
}

const months = [
  { ku: "çile", en: "January", icon: "❄️", season: "Winter", order: 1 },
  { ku: "sibat", en: "February", icon: "🌨️", season: "Winter", order: 2 },
  { ku: "adar", en: "March", icon: "🌸", season: "Spring", order: 3 },
  { ku: "nîsan", en: "April", icon: "🌺", season: "Spring", order: 4 },
  { ku: "gulan", en: "May", icon: "🌷", season: "Spring", order: 5 },
  { ku: "hezîran", en: "June", icon: "☀️", season: "Summer", order: 6 },
  { ku: "tîrmeh", en: "July", icon: "🌞", season: "Summer", order: 7 },
  { ku: "tebax", en: "August", icon: "🌻", season: "Summer", order: 8 },
  { ku: "îlon", en: "September", icon: "🍂", season: "Fall", order: 9 },
  { ku: "cotmeh", en: "October", icon: "🍁", season: "Fall", order: 10 },
  { ku: "mijdar", en: "November", icon: "🌧️", season: "Fall", order: 11 },
  { ku: "kanûn", en: "December", icon: "🎄", season: "Winter", order: 12 }
]

const timePhrases = [
  { ku: "Ev meh", en: "This month", filename: "ev-meh.mp3" },
  { ku: "Meha din", en: "Next month", filename: "meha-din.mp3" },
  { ku: "Meha borî", en: "Last month", filename: "meha-bori.mp3" },
]

const monthPhrases = [
  { ku: "Di çileyê de", en: "In January", filename: "di-cileye-de.mp3" },
  { ku: "Her meh", en: "Every month", filename: "her-meh.mp3" },
]

const usageExamples = [
  { ku: "Îro çi meh e?", en: "What month is it?", filename: "iro-ci-meh-e.mp3" },
  { ku: "Çile ye.", en: "It's January", filename: "cile-ye.mp3" },
  { ku: "Roja jidayikbûna min di gulanê de ye.", en: "My birthday is in May", filename: "roja-jidayikbuna-min-di-gulane-de-ye.mp3" },
  { ku: "Bihar di adarê de dest pê dike.", en: "Spring starts in March", filename: "bihar-di-adare-de-dest-pe-dike.mp3" },
  { ku: "Ez di hezîranê de diçim betlaneyê.", en: "I go on vacation in June", filename: "ez-di-hezirane-de-dicim-betlaneye.mp3" },
  { ku: "Zivistan di kanûnê de dest pê dike.", en: "Winter starts in December", filename: "zivistan-di-kanune-de-dest-pe-dike.mp3" },
  { ku: "Meha borî çi meh bû?", en: "What month was last month?", filename: "meha-bori-ci-meh-bu.mp3" },
  { ku: "Meha din çi meh e?", en: "What month is next month?", filename: "meha-din-ci-meh-e.mp3" },
]

// Get current month index (0 = January, 11 = December)
function getCurrentMonthIndex(): number {
  return new Date().getMonth() + 1 // JavaScript months are 0-11, our order is 1-12
}

export default function MonthsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [mode, setMode] = useState<'learn' | 'practice'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('months-mode')
      return (saved === 'learn' || saved === 'practice') ? saved : 'learn'
    }
    return 'learn'
  })
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('months-mode', mode)
    }
  }, [mode])

  // Mark lesson as in progress on mount
  useEffect(() => {
    const progress = getLessonProgress(LESSON_ID)
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
  }, [getLessonProgress, updateLessonProgress])
  
  const [practiceGame, setPracticeGame] = useState<'order' | 'matching'>('order')
  
  // Month order quiz state
  const [shuffledMonths, setShuffledMonths] = useState(months)
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
  
  const currentMonthIndex = getCurrentMonthIndex()
  
  // Initialize month order quiz
  const initializeOrderQuiz = () => {
    const shuffled = [...months].sort(() => Math.random() - 0.5)
    setShuffledMonths(shuffled)
    setSelectedOrder([])
    setOrderFeedback(null)
    setOrderCompleted(false)
  }
  
  // Initialize matching game
  const initializeMatching = () => {
    const pairs = months.map(m => ({ ku: m.ku, en: m.en, matched: false }))
    const kurdish = months.map(m => m.ku).sort(() => Math.random() - 0.5)
    const english = months.map(m => m.en).sort(() => Math.random() - 0.5)
    
    setMatchingPairs(pairs)
    setShuffledKurdish(kurdish)
    setShuffledEnglish(english)
    setSelectedMatch(null)
    setMatchScore({ correct: 0, total: 0 })
    setIncorrectMatches([])
  }
  
  // Handle month order selection
  const handleMonthSelect = (monthKu: string) => {
    if (selectedOrder.includes(monthKu)) {
      setSelectedOrder(prev => prev.filter(m => m !== monthKu))
    } else {
      setSelectedOrder(prev => [...prev, monthKu])
    }
  }
  
  // Check month order
  const checkMonthOrder = () => {
    const correctOrder = months.map(m => m.ku)
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(correctOrder)
    setOrderFeedback(isCorrect)
    if (isCorrect) {
      setOrderCompleted(true)
      const { progress, status } = calculateProgress()
      updateLessonProgress(LESSON_ID, progress, status)
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
        
        // Check if all matched
        if (matchingPairs.every(p => p.matched || (p.ku === (type === 'ku' ? value : selectedMatch.value) && p.en === (type === 'en' ? value : selectedMatch.value)))) {
          const allMatched = matchingPairs.every(p => p.matched)
          if (allMatched) {
            const { progress, status } = calculateProgress()
            updateLessonProgress(LESSON_ID, progress, status)
          }
        }
      } else {
        setSelectedMatch({ type, value })
        setIncorrectMatches([])
      }
    }
  }

  const handleAudioPlay = () => {
    audioPlaysRef.current += 1
    const { progress, status } = calculateProgress()
    updateLessonProgress(LESSON_ID, progress, status)
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
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Months of the Year</h1>
        </div>

        <p className="text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Learn the twelve months of the year in Kurdish.
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
              Month Order
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

        {/* Learn Mode - Months Grid */}
        {mode === 'learn' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {months.map((month, index) => (
            <motion.div 
              key={month.ku}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-5"
            >
              {/* Kurdish Month Name - Center */}
              <div className="text-lg font-bold text-gray-800 text-center mb-2 leading-tight">
                {month.ku.charAt(0).toUpperCase() + month.ku.slice(1)}
              </div>
              
              {/* English Translation - Center */}
              <div className="text-gray-600 text-center mb-4">{month.en}</div>
              
              {/* Bottom Row: Audio Button (Left) + Icon (Right) */}
              <div className="flex items-center justify-between">
                <AudioButton 
                  kurdishText={month.ku} 
                  phoneticText={month.en.toUpperCase()} 
                  label="Listen" 
                  size="small"
                  audioFile={`/audio/kurdish-tts-mp3/months/${getMonthAudioFile(month.ku)}.mp3`}
                  onPlay={handleAudioPlay}
                />
                <div className="text-2xl">{month.icon}</div>
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
          className="mt-8 max-w-5xl mx-auto mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="w-6 h-6 text-kurdish-red" />
              <h2 className="text-xl font-bold text-gray-800">Year Calendar</h2>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {months.map((month) => {
                const isCurrentMonth = month.order === currentMonthIndex
                return (
                  <div
                    key={month.ku}
                    className={`p-3 rounded-lg text-center border-2 transition-all ${
                      isCurrentMonth
                        ? 'bg-kurdish-red text-white border-kurdish-red shadow-lg'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isCurrentMonth ? 'text-white' : 'text-gray-500'}`}>
                      {month.en.slice(0, 3)}
                    </div>
                    <div className={`text-sm font-bold ${isCurrentMonth ? 'text-white' : 'text-gray-800'}`}>
                      {month.ku.charAt(0).toUpperCase() + month.ku.slice(1)}
                    </div>
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
                    audioFile={`/audio/kurdish-tts-mp3/months/${phrase.filename}`}
                    onPlay={handleAudioPlay}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Month Phrases */}
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
              <h2 className="text-xl font-bold text-gray-800">Month Phrases</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {monthPhrases.map((phrase, index) => (
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
                    audioFile={`/audio/kurdish-tts-mp3/months/${phrase.filename}`}
                    onPlay={handleAudioPlay}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Learn Mode - Seasons Reference */}
        {mode === 'learn' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-4xl mx-auto mb-6"
        >
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              Seasons
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">🌸</div>
                <div className="font-bold text-gray-800">Bihar</div>
                <div className="text-sm text-gray-600">Spring</div>
                <div className="text-xs text-gray-500 mt-2">Adar, Nîsan, Gulan</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl mb-2">☀️</div>
                <div className="font-bold text-gray-800">Havîn</div>
                <div className="text-sm text-gray-600">Summer</div>
                <div className="text-xs text-gray-500 mt-2">Hezîran, Tîrmeh, Tebax</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl mb-2">🍂</div>
                <div className="font-bold text-gray-800">Payiz</div>
                <div className="text-sm text-gray-600">Fall</div>
                <div className="text-xs text-gray-500 mt-2">Îlon, Cotmeh, Mijdar</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">❄️</div>
                <div className="font-bold text-gray-800">Zivistan</div>
                <div className="text-sm text-gray-600">Winter</div>
                <div className="text-xs text-gray-500 mt-2">Çile, Sibat, Kanûn</div>
              </div>
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
                    audioFile={`/audio/kurdish-tts-mp3/months/${example.filename}`}
                    onPlay={handleAudioPlay}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        )}

        {/* Practice Mode - Month Order Quiz */}
        {mode === 'practice' && practiceGame === 'order' && (
          <motion.div 
            initial={{opacity:0, y:10}} 
            animate={{opacity:1, y:0}}
            className="mt-8 card p-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shuffle className="w-6 h-6 text-kurdish-red" />
                <h2 className="text-xl font-bold text-gray-800">Arrange Months in Order</h2>
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
                <div className="text-lg text-gray-700 mb-4">You arranged the months correctly!</div>
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
                      <span className="text-gray-400">Click months below to arrange them in order</span>
                    ) : (
                      selectedOrder.map((monthKu, index) => {
                        const month = months.find(m => m.ku === monthKu)
                        return (
                          <button
                            key={index}
                            onClick={() => handleMonthSelect(monthKu)}
                            className="px-3 py-2 bg-kurdish-red text-white rounded-lg hover:bg-kurdish-red/90 transition-colors text-sm font-medium"
                          >
                            {month?.ku.charAt(0).toUpperCase() + month?.ku.slice(1)}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {shuffledMonths.map((month) => {
                    const isSelected = selectedOrder.includes(month.ku)
                    return (
                      <button
                        key={month.ku}
                        onClick={() => handleMonthSelect(month.ku)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-kurdish-red text-white border-kurdish-red'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-sm">{month.ku.charAt(0).toUpperCase() + month.ku.slice(1)}</div>
                      </button>
                    )
                  })}
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={checkMonthOrder}
                    disabled={selectedOrder.length !== 12}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      selectedOrder.length !== 12
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
                <h2 className="text-xl font-bold text-gray-800">Match Months</h2>
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
              {/* Kurdish Months Column */}
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
                        className={`h-12 p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
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
              
              {/* English Months Column */}
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
                        className={`h-12 p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                          isMatched
                            ? 'bg-green-100 border-green-500 opacity-60'
                            : isIncorrect
                            ? 'bg-red-100 border-red-500'
                            : isSelected
                            ? 'bg-blue-100 border-blue-500'
                            : 'bg-white border-gray-200 hover:border-kurdish-red'
                        }`}
                      >
                        <div className="font-bold text-sm text-gray-800 text-center">{en}</div>
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
                <div className="text-sm text-green-600">You matched all months correctly!</div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
