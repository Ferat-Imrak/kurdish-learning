"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const LESSON_ID = '6' // Things Around the House lesson ID

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

const houseItems = [
  { ku: "mal", en: "house", icon: "🏠", audioFile: "/audio/kurdish-tts-mp3/house/mal.mp3" },
  { ku: "ode", en: "room", icon: "🚪", audioFile: "/audio/kurdish-tts-mp3/house/ode.mp3" },
  { ku: "derî", en: "door", icon: "🚪", audioFile: "/audio/kurdish-tts-mp3/house/deri.mp3" },
  { ku: "pencere", en: "window", icon: "🪟", audioFile: "/audio/kurdish-tts-mp3/house/pencere.mp3" },
  { ku: "kursî", en: "chair", icon: "🪑", audioFile: "/audio/kurdish-tts-mp3/house/kursi.mp3" },
  { ku: "mase", en: "table", icon: "⬜", audioFile: "/audio/kurdish-tts-mp3/house/mase.mp3" },
  { ku: "nivîn", en: "bed", icon: "🛏️", audioFile: "/audio/kurdish-tts-mp3/house/nivin.mp3" },
  { ku: "qenepe", en: "sofa", icon: "🛋️", audioFile: "/audio/kurdish-tts-mp3/house/qenepe.mp3" },
  { ku: "çira", en: "lamp", icon: "💡", audioFile: "/audio/kurdish-tts-mp3/house/cira.mp3" },
  { ku: "televîzyon", en: "television", icon: "📺", audioFile: "/audio/kurdish-tts-mp3/house/televizyon.mp3" },
  { ku: "sarinc", en: "refrigerator", icon: "🧊", audioFile: "/audio/kurdish-tts-mp3/house/sarinc.mp3" },
  { ku: "aşxane", en: "kitchen", icon: "🍳", audioFile: "/audio/kurdish-tts-mp3/house/asxane.mp3" },
]

const roomTypes = [
  { ku: "odeya xewê", en: "bedroom", audioFile: "/audio/kurdish-tts-mp3/house/odeya-xewe.mp3" },
  { ku: "aşxane", en: "kitchen", audioFile: "/audio/kurdish-tts-mp3/house/asxane.mp3" },
  { ku: "odeya rûniştinê", en: "living room", audioFile: "/audio/kurdish-tts-mp3/house/odeya-runistine.mp3" },
  { ku: "hemam", en: "bathroom", audioFile: "/audio/kurdish-tts-mp3/house/hemam.mp3" },
]

const houseQuestions = [
  { ku: "Malê te çend ode hene?", en: "How many rooms does your house have?", audioFile: "/audio/kurdish-tts-mp3/house/male-te-cend-ode-hene.mp3" },
  { ku: "Tu li ku radizî?", en: "Where do you sleep?", audioFile: "/audio/kurdish-tts-mp3/house/tu-li-ku-radizi-sleep.mp3" },
  { ku: "Tu li ku dixwî?", en: "Where do you eat?", audioFile: "/audio/kurdish-tts-mp3/house/tu-li-ku-dixewi-eat.mp3" },
  { ku: "Mala te mezin e?", en: "Is your house big?", audioFile: "/audio/kurdish-tts-mp3/house/mala-te-mezin-e.mp3" },
  { ku: "Tu li ku derê xwarinê çêdikî?", en: "Where do you cook?", audioFile: "/audio/kurdish-tts-mp3/house/tu-li-ku-dere-xwarine-cediki.mp3" },
]

// Progress configuration
const progressConfig = {
  totalAudios: 21, // 12 house items + 4 room types + 5 house questions
  hasPractice: false,
  audioWeight: 50,
  timeWeight: 50,
  audioMultiplier: 100 / 21, // ~4.76% per audio
}

export default function HouseItemsPage() {
  const { getLessonProgress, updateLessonProgress } = useProgress()
  
  // Refs for progress tracking
  const startTimeRef = useRef<number>(Date.now())
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  const baseAudioPlaysRef = useRef<number>(0)
  const refsInitializedRef = useRef<boolean>(false)

  // Calculate progress based on unique audios played and time spent
  const calculateProgress = (): number => {
    const currentProgress = getLessonProgress(LESSON_ID)
    const storedProgress = currentProgress?.progress || 0
    
    // Calculate total unique audios played (base + session)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    
    // Audio progress: 50% weight (percentage-based)
    const audioProgress = Math.min(progressConfig.audioWeight, (effectiveUniqueAudios / progressConfig.totalAudios) * progressConfig.audioWeight)
    
    // Time progress: 50% weight (3 minutes = 50%, max 50%)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const timeProgress = Math.min(progressConfig.timeWeight, (totalTimeSpent / 3) * progressConfig.timeWeight)
    
    // Combined progress
    const calculatedProgress = Math.round(audioProgress + timeProgress)
    
    // Special case: If all audios are played, allow 100% completion
    // This prioritizes audio completion over time spent
    if (effectiveUniqueAudios >= progressConfig.totalAudios) {
      // If all audios played and at least 3 minutes spent, force 100%
      if (totalTimeSpent >= 3) {
        return 100
      }
      // If all audios played but less time, still allow 100% (audio completion is the priority)
      // This matches the Colors lesson behavior
      return 100
    }
    
    // Prevent progress from decreasing
    return Math.max(storedProgress, calculatedProgress)
  }

  // Handle audio play - track unique audios
  const handleAudioPlay = (audioKey: string) => {
    // Track unique audios played (only count new ones) - check BEFORE adding
    if (uniqueAudiosPlayedRef.current.has(audioKey)) {
      // Already played this audio, don't update progress
      console.log('🔇 Audio already played, skipping:', audioKey)
      return
    }
    
    console.log('🔊 New unique audio played:', audioKey, 'Total unique:', uniqueAudiosPlayedRef.current.size + 1)
    uniqueAudiosPlayedRef.current.add(audioKey)
    
    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    
    const progress = calculateProgress()
    
    // Set status to COMPLETED when progress reaches 100%, otherwise preserve existing status or set to IN_PROGRESS
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
    
    console.log('📊 Progress update:', {
      progress,
      status,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
  }

  // Initial setup: restore refs from stored progress and mark lesson as in progress
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Mark lesson as IN_PROGRESS if not already completed
    if (currentProgress?.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
    
    // Restore refs from stored progress (only once)
    if (currentProgress) {
      const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig)
      startTimeRef.current = estimatedStartTime
      
      // Only restore baseAudioPlaysRef if progress is significant (>20%)
      if (currentProgress.progress > 20) {
        baseAudioPlaysRef.current = Math.min(estimatedAudioPlays, progressConfig.totalAudios)
      } else {
        baseAudioPlaysRef.current = 0
        console.log('🔄 Progress is low (<20%), resetting baseAudioPlaysRef to 0 for accurate tracking')
      }
      
      // Safety check: if baseAudioPlaysRef is already at or near totalAudios, reset it
      if (baseAudioPlaysRef.current >= progressConfig.totalAudios - 2) {
        console.warn('⚠️ baseAudioPlaysRef is too high, resetting to 0 to prevent progress jump')
        baseAudioPlaysRef.current = 0
      }
      
      // Check if progress is 100% but status is not COMPLETED
      if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
        console.log('✅ Progress is 100% but status is not COMPLETED, updating status...')
        updateLessonProgress(LESSON_ID, currentProgress.progress, 'COMPLETED', undefined, currentProgress.timeSpent)
      }
      
      console.log('✅ Restored progress refs for Things Around the House:', {
        baseAudioPlays: baseAudioPlaysRef.current,
        uniqueAudios: uniqueAudiosPlayedRef.current.size,
        startTime: new Date(startTimeRef.current).toISOString(),
      })
    }
    
    refsInitializedRef.current = true
  }, []) // Empty dependency array - only run once on mount

  // Recovery check: ensure progress consistency on mount and visibility changes
  useEffect(() => {
    const checkProgress = () => {
      const currentProgress = getLessonProgress(LESSON_ID)
      if (!currentProgress) return
      
      const progress = calculateProgress()
      const storedProgress = currentProgress.progress || 0
      
      // If calculated progress is higher, update it
      if (progress > storedProgress) {
        const baseTimeSpent = currentProgress.timeSpent || 0
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
        const safeTimeSpent = Math.min(1000, totalTimeSpent)
        
        const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
        updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
      }
    }
    
    checkProgress()
    
    // Also check when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkProgress()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [getLessonProgress, updateLessonProgress, calculateProgress])

  // Periodic progress update based on time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProgress = getLessonProgress(LESSON_ID)
      if (!currentProgress || currentProgress.status === 'COMPLETED') return
      
      const progress = calculateProgress()
      const storedProgress = currentProgress.progress || 0
      
      // Only update if progress increased
      if (progress > storedProgress) {
        const baseTimeSpent = currentProgress.timeSpent || 0
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
        const safeTimeSpent = Math.min(1000, totalTimeSpent)
        
        const status = progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS'
        updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
      }
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [getLessonProgress, updateLessonProgress, calculateProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Things Around the House</h1>

        {/* House Items */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">🏠</span>
            House Items
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {houseItems.map((item, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="font-bold text-gray-800 text-center">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{item.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `house-item-${index}-${item.ku}`)}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Room Types */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">🛏️</span>
            Types of Rooms
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomTypes.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                    <div className="text-sm text-gray-600">{item.en}</div>
                  </div>
                  <div className="ml-4">
                    <AudioButton 
                      kurdishText={item.ku} 
                      phoneticText={item.en} 
                      label="Listen"
                      size="small"
                      audioFile={item.audioFile}
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `room-type-${index}-${item.ku}`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* House Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center text-lg">❓</span>
            Talking About Your House
          </h2>
          <div className="space-y-4">
            {houseQuestions.map((item, index) => (
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
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `house-question-${index}-${item.ku}`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </PageContainer>
    </div>
  )
}
