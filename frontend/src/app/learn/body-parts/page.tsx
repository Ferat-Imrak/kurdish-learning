"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const LESSON_ID = '13' // Body Parts lesson ID

// Helper function to get audio filename for body parts
function getBodyAudioFilename(ku: string): string {
  // Map Kurdish text to actual audio filenames
  const audioMap: Record<string, string> = {
    'ser': 'ser.mp3',
    'çav': 'cav.mp3',
    'guh': 'guh.mp3',
    'poz': 'poz.mp3',
    'dev': 'dev.mp3',
    'didan': 'didan.mp3',
    'ziman': 'ziman.mp3',
    'stû': 'stu.mp3',
    'mil': 'mil.mp3',
    'dest': 'dest.mp3',
    'tili': 'tili.mp3',
    'sîng': 'sing.mp3',
    'zik': 'zik.mp3',
    'pişt': 'pist.mp3',
    'ling': 'ling.mp3',
    'pê': 'pe.mp3',
    'pêçî': 'peci.mp3',
    'çok': 'cok.mp3',
  }
  return audioMap[ku] || `${ku.toLowerCase().replace(/[îÎ]/g, 'i').replace(/[êÊ]/g, 'e').replace(/[ûÛ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[çÇ]/g, 'c')}.mp3`
}

// Helper function to get audio filename for body action examples
function getBodyActionAudioFilename(example: string): string {
  // Map example sentences to actual audio filenames
  const exampleMap: Record<string, string> = {
    'Ez çavên te dibînim': 'ez-caven-te-dibinim.mp3',
    'Ez dengê te dibihîzim': 'ez-denge-te-dibihizim.mp3',
    'Tu bi devê xwe dibêjî': 'tu-bi-deve-xwe-dibeji.mp3',
    'Ez bi devê xwe dixwim': 'ez-bi-deve-xwe-dixwim.mp3',
    'Ez bi lingên xwe dimeşim': 'ez-bi-lingen-xwe-dimesim.mp3',
    'Ez bi destên xwe digirim': 'ez-bi-desten-xwe-digirim.mp3',
  }
  return exampleMap[example] || ''
}

const bodyParts = [
  { ku: "ser", en: "head", icon: "👤" },
  { ku: "çav", en: "eye", icon: "👁️" },
  { ku: "guh", en: "ear", icon: "👂" },
  { ku: "poz", en: "nose", icon: "👃" },
  { ku: "dev", en: "mouth", icon: "👄" },
  { ku: "didan", en: "tooth", icon: "🦷" },
  { ku: "ziman", en: "tongue", icon: "👅" },
  { ku: "stû", en: "neck", icon: "🔶" },
  { ku: "mil", en: "shoulder", icon: "💪" },
  { ku: "dest", en: "hand", icon: "✋" },
  { ku: "tili", en: "finger", icon: "👆" },
  { ku: "sîng", en: "chest", icon: "👤" },
  { ku: "zik", en: "stomach", icon: "🫃" },
  { ku: "pişt", en: "back", icon: "🔶" },
  { ku: "ling", en: "leg", icon: "🦵" },
  { ku: "pê", en: "foot", icon: "🦶" },
  { ku: "pêçî", en: "ankle", icon: "🦴" },
  { ku: "çok", en: "knee", icon: "🦴" }
]

const bodyActions = [
  { ku: "bînî", en: "see", example: "Ez çavên te dibînim", exampleEn: "I see your eyes", icon: "👁️" },
  { ku: "bihîze", en: "hear", example: "Ez dengê te dibihîzim", exampleEn: "I hear your voice", icon: "👂" },
  { ku: "bêje", en: "speak", example: "Tu bi devê xwe dibêjî", exampleEn: "You speak with your mouth", icon: "💬" },
  { ku: "bixwe", en: "eat", example: "Ez bi devê xwe dixwim", exampleEn: "I eat with my mouth", icon: "🍽️" },
  { ku: "bimeşe", en: "walk", example: "Ez bi lingên xwe dimeşim", exampleEn: "I walk with my legs", icon: "🚶" },
  { ku: "bigire", en: "hold", example: "Ez bi destên xwe digirim", exampleEn: "I hold with my hands", icon: "✋" }
]

// Progress configuration
const progressConfig = {
  totalAudios: 24, // 18 body parts + 6 body actions (with examples)
  hasPractice: false,
  audioWeight: 50,
  timeWeight: 50,
  audioMultiplier: 100 / 24, // ~4.17% per audio
}

export default function BodyPartsPage() {
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
    let calculatedProgress = audioProgress + timeProgress
    
    // Special case: If all audios are played, allow 100% completion
    // This prioritizes audio completion over time spent
    if (effectiveUniqueAudios >= progressConfig.totalAudios) {
      // If all audios played and at least 3 minutes spent, force 100%
      if (totalTimeSpent >= 3) {
        return 100
      }
      // If all audios played but less time, still allow 100% (audio completion is the priority)
      return 100
    }
    
    // Prevent progress from decreasing
    return Math.max(storedProgress, Math.round(calculatedProgress))
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
      
      console.log('✅ Restored progress refs for Body Parts:', {
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
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Body Parts</h1>

        {/* Body Parts */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="mb-6"
        >
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {bodyParts.map((part, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}} 
                transition={{ delay: index * 0.05 }}
                className="card p-5"
              >
                <div className="text-xl font-bold text-gray-800 text-center mb-2">
                  {part.ku.charAt(0).toUpperCase() + part.ku.slice(1)}
                </div>
                <div className="text-gray-600 mb-4 text-center">{part.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={part.ku} 
                    phoneticText={part.en.toUpperCase()} 
                    label="Listen" 
                    size="small"
                    audioFile={`/audio/kurdish-tts-mp3/body/${getBodyAudioFilename(part.ku)}`}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `body-part-${index}-${part.ku}`)}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{part.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Body Actions */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center text-lg">🏃</span>
            Actions with Body Parts
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {bodyActions.map((action, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="card p-5"
              >
                <div className="text-center mb-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow mb-2">
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div className="font-bold text-gray-800">{action.ku.charAt(0).toUpperCase() + action.ku.slice(1)}</div>
                  <div className="text-gray-600 text-sm mb-3">{action.en}</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium text-gray-800">{action.example}</div>
                  <div className="text-xs text-gray-600 mt-1">{action.exampleEn}</div>
                </div>
                
                <AudioButton 
                  kurdishText={action.example} 
                  phoneticText={action.en.toUpperCase()} 
                  label="Listen" 
                  size="small"
                  audioFile={`/audio/kurdish-tts-mp3/body/${getBodyActionAudioFilename(action.example)}`}
                  onPlay={(audioKey) => handleAudioPlay(audioKey || `body-action-${index}-${action.ku}`)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Notes */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.8 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Usage Notes</h3>
          <div className="space-y-3 text-sm text-gray-700 max-w-3xl mx-auto">
            <p>• <strong>çav</strong> - Can mean both "eye" and "eyes" (context determines)</p>
            <p>• <strong>dest</strong> - Usually refers to "hand" but can mean "hands"</p>
            <p>• <strong>ling</strong> - Can mean "leg" or "foot" depending on context</p>
            <p>• <strong>pê</strong> - Specifically means "foot" (not leg)</p>
            <p>• Body parts are often used with possessive pronouns (destê min, çavên te)</p>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  )
}

