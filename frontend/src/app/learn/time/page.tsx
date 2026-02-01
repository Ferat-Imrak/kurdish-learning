"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Clock, Sun, Moon, Calendar } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const LESSON_ID = '12' // Time & Daily Schedule lesson ID

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

// Basic Times
const basicTimes = [
  { ku: "sibê", en: "morning", icon: "🌅", audioFile: "/audio/kurdish-tts-mp3/time/sibe-morning.mp3" },
  { ku: "nîvro", en: "noon", icon: "☀️", audioFile: "/audio/kurdish-tts-mp3/time/nivro.mp3" },
  { ku: "êvar", en: "evening", icon: "🌆", audioFile: "/audio/kurdish-tts-mp3/time/evar.mp3" },
  { ku: "şev", en: "night", icon: "🌙", audioFile: "/audio/kurdish-tts-mp3/time/sev.mp3" },
  { ku: "îro", en: "today", icon: "📅", audioFile: "/audio/kurdish-tts-mp3/time/iro.mp3" },
  { ku: "duh", en: "yesterday", icon: "📅", audioFile: "/audio/kurdish-tts-mp3/time/duh.mp3" },
  { ku: "sibê", en: "tomorrow", icon: "📅", audioFile: "/audio/kurdish-tts-mp3/time/sibe-tomorrow.mp3" },
]

// More Time Expressions
const moreTimeExpressions = [
  { ku: "niha", en: "now", icon: "⏰", audioFile: "/audio/kurdish-tts-mp3/time/niha.mp3" },
  { ku: "paşê", en: "later", icon: "⏭️", audioFile: "/audio/kurdish-tts-mp3/time/pase.mp3" },
  { ku: "berê", en: "earlier", icon: "⏮️", audioFile: "/audio/kurdish-tts-mp3/time/bere.mp3" },
  { ku: "pênc deqe", en: "five minutes", icon: "⏱️", audioFile: "/audio/kurdish-tts-mp3/time/penc-deqe.mp3" },
  { ku: "nîv saet", en: "half hour", icon: "⏰", audioFile: "/audio/kurdish-tts-mp3/time/niv-saet.mp3" },
  { ku: "nêzîkê", en: "around", icon: "🕐", audioFile: "/audio/kurdish-tts-mp3/time/nezike.mp3" },
  { ku: "piştî", en: "after", icon: "➡️", audioFile: "/audio/kurdish-tts-mp3/time/pisti.mp3" },
  { ku: "berî", en: "before", icon: "⬅️", audioFile: "/audio/kurdish-tts-mp3/time/beri.mp3" },
]

const timeQuestions = [
  { ku: "Saet çend e?", en: "What time is it?", audioFile: "/audio/kurdish-tts-mp3/time/saet-cend-e.mp3" },
  { ku: "Tu çi demê şiyar dibî?", en: "What time do you wake up?", audioFile: "/audio/kurdish-tts-mp3/time/tu-ci-deme-siyar-dibi-wakeup.mp3" },
  { ku: "Tu çi demê dixwî?", en: "What time do you eat?", audioFile: "/audio/kurdish-tts-mp3/time/tu-ci-deme-dixwi.mp3" },
  { ku: "Tu çi demê şiyar dibî?", en: "What time do you sleep?", audioFile: "/audio/kurdish-tts-mp3/time/tu-ci-deme-siyar-dibi-sleep.mp3" },
]

// Telling Time
const clockTimes = [
  { time: "08:00", ku: "saet heştê sibê", en: "eight o'clock in the morning", audioFile: "/audio/kurdish-tts-mp3/time/saet-heste-sibe.mp3" },
  { time: "12:00", ku: "saet dazdeh", en: "twelve o'clock", audioFile: "/audio/kurdish-tts-mp3/time/saet-dazdeh.mp3" },
  { time: "15:30", ku: "sê û nîv", en: "three thirty", audioFile: "/audio/kurdish-tts-mp3/time/se-u-niv.mp3" },
  { time: "20:00", ku: "saet heştê şevê", en: "eight o'clock at night", audioFile: "/audio/kurdish-tts-mp3/time/saet-heste-seve.mp3" },
  { time: "09:15", ku: "neh û panzdeh", en: "nine fifteen", audioFile: "/audio/kurdish-tts-mp3/time/neh-u-panzdeh.mp3" },
  { time: "14:45", ku: "du û çil û pênc deqe", en: "two forty-five", audioFile: "/audio/kurdish-tts-mp3/time/du-u-cil-u-penc-deqe.mp3" },
  { time: "06:00", ku: "saet şeş", en: "six o'clock", audioFile: "/audio/kurdish-tts-mp3/time/saet-ses.mp3" },
  { time: "18:30", ku: "şeş û nîv", en: "six thirty", audioFile: "/audio/kurdish-tts-mp3/time/ses-u-niv.mp3" },
  { time: "22:00", ku: "saet deh", en: "ten o'clock", audioFile: "/audio/kurdish-tts-mp3/time/saet-deh.mp3" },
  { time: "11:05", ku: "yanzdeh û pênc deqe", en: "eleven five", audioFile: "/audio/kurdish-tts-mp3/time/yanzdeh-u-penc-deqe.mp3" },
]


// Helper function to convert number to Kurdish
function numberToKurdish(num: number): string {
  const ones: { [key: number]: string } = {
    0: "sifir", 1: "yek", 2: "du", 3: "sê", 4: "çar", 5: "pênc",
    6: "şeş", 7: "heft", 8: "heşt", 9: "neh"
  }
  
  if (num === 0) return "sifir"
  if (num < 10) return ones[num]
  if (num === 10) return "deh"
  if (num === 11) return "yanzdeh"
  if (num === 12) return "dazdeh"
  if (num === 13) return "sêzdeh"
  if (num === 14) return "çardeh"
  if (num === 15) return "pênzdeh"
  if (num === 16) return "şanzdeh"
  if (num === 17) return "hevdeh"
  if (num === 18) return "hejdeh"
  if (num === 19) return "nozdeh"
  if (num === 20) return "bîst"
  if (num === 30) return "sî"
  if (num === 40) return "çil"
  if (num === 50) return "pêncî"
  
  const tensDigit = Math.floor(num / 10)
  const onesDigit = num % 10
  
  let tensName = ""
  if (tensDigit === 2) tensName = "bîst"
  else if (tensDigit === 3) tensName = "sî"
  else if (tensDigit === 4) tensName = "çil"
  else if (tensDigit === 5) tensName = "pêncî"
  
  if (onesDigit === 0) {
    return tensName
  } else {
    return `${tensName} û ${ones[onesDigit]}`
  }
}

// Progress configuration
const progressConfig = {
  totalAudios: 29, // 7 basic times + 8 more time expressions + 10 clock times + 4 time questions
  hasPractice: false,
  audioWeight: 50,
  timeWeight: 50,
  audioMultiplier: 100 / 29, // ~3.45% per audio
}

export default function TimePage() {
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
    
    // Calculate audio contribution
    const uniqueCount = uniqueAudiosPlayedRef.current.size
    const audioProgress = Math.min(100, (uniqueCount * progressConfig.audioMultiplier))
    const audioContribution = (audioProgress / 100) * progressConfig.audioWeight
    
    // Calculate time contribution (max 50% from time, requires at least 3 minutes for full time contribution)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const timeProgress = Math.min(100, (totalTimeSpent / 3) * 100) // 3 minutes = 100% time contribution
    const timeContribution = (timeProgress / 100) * progressConfig.timeWeight
    
    // Combined progress
    const calculatedProgress = Math.round(audioContribution + timeContribution)
    
    // Special case: if all audios are played and at least 3 minutes spent, force 100%
    if (uniqueCount >= progressConfig.totalAudios && totalTimeSpent >= 3) {
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
      
      console.log('✅ Restored progress refs for Time & Daily Schedule:', {
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
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Time & Daily Schedule</h1>

        {/* Basic Times */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primaryBlue" />
            Basic Times
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {basicTimes.map((item, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center mb-4">
                  <div className="font-bold text-gray-800 text-center mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                  <div className="text-gray-600 text-center">{item.en}</div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `basic-time-${index}-${item.ku}`)}
                  />
                  <div className="text-3xl">{item.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* More Time Expressions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primaryBlue" />
            More Time Expressions
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {moreTimeExpressions.map((item, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="text-3xl text-center mb-2">{item.icon}</div>
                <div className="font-bold text-gray-800 text-center">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{item.en}</div>
                <div className="flex items-center justify-center">
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `time-expression-${index}-${item.ku}`)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Telling Time */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primaryBlue" />
            Telling Time
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {clockTimes.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-kurdish-red">{item.time}</div>
                  <div className="text-right">
                    <div className="font-medium text-gray-800">{item.ku}</div>
                    <div className="text-sm text-gray-600">{item.en}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `clock-time-${index}-${item.time}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primaryBlue" />
            Common Time Questions
          </h2>
          <div className="space-y-4">
            {timeQuestions.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku}</div>
                    <div className="text-gray-600">{item.en}</div>
                  </div>
                  <div className="ml-4">
                    <AudioButton 
                      kurdishText={item.ku} 
                      phoneticText={item.en} 
                      label="Listen"
                      size="small"
                      audioFile={item.audioFile}
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `time-question-${index}-${item.ku}`)}
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
