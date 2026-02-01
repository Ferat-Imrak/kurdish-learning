"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const LESSON_ID = '23' // Colors lesson ID

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

interface ColorExample {
  ku: string
  en: string
  icon: string
}

interface ColorData {
  en: string
  ku: string
  hex: string
  examples: ColorExample[]
}

const colors: ColorData[] = [
  { 
    en: "Red", 
    ku: "sor", 
    hex: "#E31E24",
    examples: [
      { ku: "pirtûkê sor", en: "red book", icon: "📕" },
      { ku: "gulê sor", en: "red flower", icon: "🌹" },
      { ku: "sêvê sor", en: "red apple", icon: "🍎" },
      { ku: "îsotê sor", en: "red pepper", icon: "🌶️" }
    ]
  },
  { 
    en: "Green", 
    ku: "kesk", 
    hex: "#00A651",
    examples: [
      { ku: "pelê kesk", en: "green leaf", icon: "🍃" },
      { ku: "giyayê kesk", en: "green grass", icon: "🌿" },
      { ku: "sêvê kesk", en: "green apple", icon: "🍏" },
      { ku: "pirtûkê kesk", en: "green book", icon: "📗" }
    ]
  },
  { 
    en: "Blue", 
    ku: "şîn", 
    hex: "#1E90FF",
    examples: [
      { ku: "avê şîn", en: "blue water", icon: "🌊" },
      { ku: "esmanê şîn", en: "blue sky", icon: "☁️" },
      { ku: "pirtûkê şîn", en: "blue book", icon: "📘" },
      { ku: "çavên şîn", en: "blue eyes", icon: "👀" }
    ]
  },
  { 
    en: "Yellow", 
    ku: "zer", 
    hex: "#FFD700",
    examples: [
      { ku: "tava zer", en: "yellow sun", icon: "☀️" },
      { ku: "gulê zer", en: "yellow flower", icon: "🌼" },
      { ku: "pirtûkê zer", en: "yellow book", icon: "📒" },
      { ku: "mûzê zer", en: "yellow banana", icon: "🍌" }
    ]
  },
  { 
    en: "Orange", 
    ku: "porteqalî", 
    hex: "#FF8C00",
    examples: [
      { ku: "gizêrê porteqalî", en: "orange carrot", icon: "🥕" },
      { ku: "kûndirê porteqalî", en: "orange pumpkin", icon: "🎃" },
      { ku: "şêrê porteqalî", en: "orange lion", icon: "🦁" },
      { ku: "pirtûkê porteqalî", en: "orange book", icon: "📙" }
    ]
  },
  { 
    en: "Purple", 
    ku: "mor", 
    hex: "#8A2BE2",
    examples: [
      { ku: "dilê mor", en: "purple heart", icon: "💜" },
      { ku: "çemberê mor", en: "purple circle", icon: "🟣" },
      { ku: "kirasê mor", en: "purple dress", icon: "👗" },
      { ku: "tirîyê mor", en: "purple grape", icon: "🍇" }
    ]
  },
  { 
    en: "Silver", 
    ku: "zîv", 
    hex: "#C0C0C0",
    examples: [
      { ku: "kevçiyê zîv", en: "silver spoon", icon: "🥄" },
      { ku: "çetelê zîv", en: "silver fork", icon: "🍴" },
      { ku: "guharê zîv", en: "silver earrings", icon: "💠" },
      { ku: "saetê zîv", en: "silver watch", icon: "⌚" }
    ]
  },
  { 
    en: "Orange-Red", 
    ku: "gevez", 
    hex: "#FF4500",
    examples: [
      { ku: "gulê gevez", en: "orange-red flower", icon: "🌺" },
      { ku: "rojê gevez", en: "orange-red sun", icon: "🌅" },
      { ku: "agirê gevez", en: "orange-red fire", icon: "🔥" },
      { ku: "gulê gevez", en: "orange-red rose", icon: "🌹" }
    ]
  },
  { 
    en: "Black", 
    ku: "reş", 
    hex: "#000000",
    examples: [
      { ku: "pisîkê reş", en: "black cat", icon: "🐈‍⬛" },
      { ku: "pirtûkê reş", en: "black book", icon: "📓" },
      { ku: "şevê reş", en: "black night", icon: "🌑" },
      { ku: "dilê reş", en: "black heart", icon: "🖤" }
    ]
  },
  { 
    en: "White", 
    ku: "spî", 
    hex: "#FFFFFF",
    examples: [
      { ku: "hêkê spî", en: "white egg", icon: "🥚" },
      { ku: "şîrê spî", en: "white milk", icon: "🥛" },
      { ku: "berfê spî", en: "white snow", icon: "❄️" },
      { ku: "birincê spî", en: "white rice", icon: "🍚" }
    ]
  },
  { 
    en: "Gray", 
    ku: "xwelî", 
    hex: "#808080",
    examples: [
      { ku: "ewrê xwelî", en: "gray cloud", icon: "☁️" },
      { ku: "kevirê xwelî", en: "gray stone", icon: "🪨" },
      { ku: "çiyayê xwelî", en: "gray mountain", icon: "🏔️" },
      { ku: "fîlê xwelî", en: "gray elephant", icon: "🐘" }
    ]
  },
  { 
    en: "Gold", 
    ku: "zêr", 
    hex: "#FFD700",
    examples: [
      { ku: "zêrê zêr", en: "gold metal", icon: "🥇" },
      { ku: "stêrkê zêr", en: "gold star", icon: "⭐" },
      { ku: "saetê zêr", en: "gold watch", icon: "⌚" }
    ]
  },
]

// Add audioFile paths to colors and examples
const colorsWithAudio = colors.map(color => {
  // Handle filename collision for "zêr" (gold) vs "zer" (yellow)
  let filename;
  if (color.ku === "zêr") {
    filename = "zer-gold.mp3";
  } else {
    filename = `${getAudioFilename(color.ku)}.mp3`;
  }
  
  return {
    ...color,
    audioFile: `/audio/kurdish-tts-mp3/colors/${filename}`,
    examplesWithAudio: color.examples.map(example => ({
      ...example,
      audioFile: `/audio/kurdish-tts-mp3/colors/${getAudioFilename(example.ku)}.mp3`
    }))
  };
})

export default function ColorsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  const [expandedColor, setExpandedColor] = useState<string | null>(null)
  
  // Progress tracking configuration
  // Count: 12 color names + examples (Red:4, Green:4, Blue:4, Yellow:4, Orange:4, Purple:4, Silver:4, Orange-Red:3, Black:4, White:4, Gray:4, Gold:3) = 12 + 46 = 58
  const progressConfig = {
    totalAudios: 58, // 12 colors + 46 examples (Gold has 3, Orange-Red has duplicate "gulê gevez")
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 0.86, // 50% / 58 audios ≈ 0.86% per audio
  }
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID)
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig)
  const startTimeRef = useRef<number>(estimatedStartTime)
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays)
  const refsInitializedRef = useRef(false)
  
  // Initialize refs from stored progress - ONLY ONCE on mount
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Colors page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      timeSpent: progress.timeSpent,
    })
    
    // Mark lesson as in progress on mount
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
    
    // Restore refs from stored progress - ONLY ONCE on mount
    const currentProgress = getLessonProgress(LESSON_ID)
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
    
    // Mark refs as initialized to prevent re-initialization
    refsInitializedRef.current = true
    
    console.log('🔄 Restored refs (ONCE on mount):', {
      storedProgress: currentProgress.progress,
      estimatedAudioPlays,
      baseAudioPlaysRef: baseAudioPlaysRef.current,
      estimatedStartTime: new Date(estimatedStartTime).toISOString(),
      uniqueAudiosPlayed: uniqueAudiosPlayedRef.current.size,
    })
  }, []) // Empty dependency array - only run once on mount

  const calculateProgress = () => {
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID)
    const storedProgress = currentProgress.progress || 0
    
    // Calculate total unique audios played (base + session)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    
    // Audio progress: 50% weight (percentage-based, like Alphabet)
    const audioProgress = Math.min(progressConfig.audioWeight, (effectiveUniqueAudios / progressConfig.totalAudios) * progressConfig.audioWeight)
    
    // Time progress: 50% weight (1 minute = 10%, max 50%)
    const baseTimeSpent = currentProgress.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    const timeProgress = Math.min(progressConfig.timeWeight, safeTimeSpent * 10)
    
    // Calculate total progress (audio + time only, no practice)
    let calculatedProgress = audioProgress + timeProgress
    
    // Special case: If all audios are played, ensure progress can reach 100% with minimal time
    // This makes it easier to complete when all content is consumed
    if (effectiveUniqueAudios >= progressConfig.totalAudios) {
      // If all audios played, audioProgress should be 50%, and we need at least 2.5 minutes for 50% time = 100% total
      // But let's be more generous: if all audios played, allow reaching 100% with just 3 minutes total
      if (totalTimeSpent >= 3) {
        calculatedProgress = 100
      } else {
        // Still allow progress up to 95% if all audios played but less time
        calculatedProgress = Math.max(calculatedProgress, 95)
      }
    }
    
    // Prevent progress from decreasing - always use max of stored and calculated
    const totalProgress = Math.max(storedProgress, calculatedProgress)
    
    // Round to whole number
    const roundedProgress = Math.round(totalProgress)
    
    console.log('📊 Progress calculation:', {
      totalUniqueAudios,
      effectiveUniqueAudios,
      audioProgress: audioProgress.toFixed(2),
      totalTimeSpent,
      timeProgress: timeProgress.toFixed(2),
      calculatedProgress: calculatedProgress.toFixed(2),
      storedProgress,
      totalProgress: roundedProgress,
    })
    
    return roundedProgress
  }

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
    const baseTimeSpent = currentProgress.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    
    const progress = calculateProgress()
    
    // Set status to COMPLETED when progress reaches 100%, otherwise preserve existing status or set to IN_PROGRESS
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
    
    console.log('📊 Progress update:', {
      progress,
      status,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
  }
  
  // Recovery check: if progress is 100% but status is not COMPLETED
  useEffect(() => {
    const currentProgress = getLessonProgress(LESSON_ID)
    if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
      console.log('🔧 Recovery: Progress is 100% but status is not COMPLETED, fixing...')
      updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
    }
  }, [getLessonProgress, updateLessonProgress])
  
  // Listen for progress updates (including from backend sync) and fix if needed
  useEffect(() => {
    const handleProgressUpdate = () => {
      const currentProgress = getLessonProgress(LESSON_ID)
      if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
        console.log('🔧 Progress update detected - fixing status to COMPLETED')
        updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
      }
    }
    
    window.addEventListener('lessonProgressUpdated', handleProgressUpdate)
    return () => window.removeEventListener('lessonProgressUpdated', handleProgressUpdate)
  }, [getLessonProgress, updateLessonProgress])
  
  // Check on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentProgress = getLessonProgress(LESSON_ID)
        if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
          console.log('👁️ Page visible - fixing status to COMPLETED')
          updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [getLessonProgress, updateLessonProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">
          Colors
        </h1>

        <div className="space-y-4">
          {colorsWithAudio.map((color) => {
            const isExpanded = expandedColor === color.ku
            
            return (
              <motion.div
                key={color.ku}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card overflow-hidden"
              >
                {/* Color header - non-clickable */}
                <div className="p-4 flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-xl shadow-md flex-shrink-0"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold text-xl text-gray-800 mb-2">
                      {color.ku.charAt(0).toUpperCase() + color.ku.slice(1)} • {color.en}
                    </div>
                    <div className="flex items-center gap-3">
                      <div onClick={(e) => e.stopPropagation()}>
                        <AudioButton
                          kurdishText={color.ku}
                          phoneticText={color.en.toUpperCase()}
                          label="Listen"
                          size="small"
                          audioFile={color.audioFile}
                          onPlay={(audioKey) => handleAudioPlay(audioKey || `color-${color.ku}`)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Examples preview and expand button */}
                <div className="px-4 pb-3 border-t border-gray-100">
                  <button
                    onClick={() => setExpandedColor(isExpanded ? null : color.ku)}
                    className="w-full flex items-center justify-between py-3 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Real-world examples preview */}
                      <div className="flex gap-1.5">
                        {color.examples.slice(0, 4).map((example, idx) => (
                          <span 
                            key={idx} 
                            className="text-2xl transition-transform group-hover:scale-110" 
                            title={`${example.ku} (${example.en})`}
                          >
                            {example.icon}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-kurdish-red transition-colors">
                        {isExpanded ? 'Hide' : 'View'} {color.examples.length} examples
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-kurdish-red transition-colors" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-kurdish-red transition-colors" />
                    )}
                  </button>
                </div>

                {/* Expanded examples */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Common Phrases
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {color.examplesWithAudio.map((example, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-kurdish-red/30 hover:shadow-md transition-all"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <span className="text-3xl flex-shrink-0">{example.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-800 mb-1 break-words">
                                    {example.ku}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {example.en}
                                  </div>
                                </div>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <AudioButton
                                  kurdishText={example.ku}
                                  phoneticText={example.en}
                                  label="Listen"
                                  size="small"
                                  audioFile={example.audioFile}
                                  onPlay={(audioKey) => handleAudioPlay(audioKey || `example-${color.ku}-${example.ku}`)}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </PageContainer>
    </div>
  )
}
