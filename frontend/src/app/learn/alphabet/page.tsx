"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { motion } from "framer-motion"
import { HelpCircle, ArrowLeftRight } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { useEffect, useRef, useState } from "react"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

// Helper function to get audio filename for each letter
function getLetterAudioFile(glyph: string): string {
  const letterMap: Record<string, string> = {
    'A': 'a',
    'B': 'b',
    'C': 'c',
    'Ç': 'cedilla-c',
    'D': 'd',
    'E': 'e',
    'Ê': 'circumflex-e',
    'F': 'f',
    'G': 'g',
    'H': 'h',
    'I': 'i',
    'Î': 'circumflex-i',
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
    'Ş': 'cedilla-s',
    'T': 't',
    'U': 'u',
    'Û': 'circumflex-u',
    'V': 'v',
    'W': 'w',
    'X': 'x',
    'Y': 'y',
    'Z': 'z'
  };
  
  return letterMap[glyph] || glyph.toLowerCase();
}

const LESSON_ID = '1' // Alphabet lesson ID

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

export default function AlphabetPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 37, // 31 letters + 6 comparison audios (3 cards × 2 letters each)
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 1.35, // 50% / 37 audios ≈ 1.35% per audio
  }
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID)
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig)
  const startTimeRef = useRef<number>(estimatedStartTime)
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  // Base audio plays estimated from stored progress
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays)

  // Track if refs have been initialized to prevent re-initialization on re-renders
  const refsInitializedRef = useRef(false)

  useEffect(() => {
    // Only initialize refs once on mount, not on every re-render
    if (refsInitializedRef.current) {
      return
    }

    const progress = getLessonProgress(LESSON_ID)
    console.log('🚀 Alphabet page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      score: progress.score,
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
    // Otherwise, reset to 0 to avoid inflating counts from small progress values
    // This prevents the issue where small progress percentages get incorrectly converted to base audio counts
    // For example: 14% progress → ~10 base audios, which inflates the learned count
    // Also cap it at totalAudios to prevent it from exceeding the maximum
    if (currentProgress.progress > 20) {
      baseAudioPlaysRef.current = Math.min(estimatedAudioPlays, progressConfig.totalAudios)
    } else {
      baseAudioPlaysRef.current = 0
      console.log('🔄 Progress is low (<20%), resetting baseAudioPlaysRef to 0 for accurate tracking')
    }
    
    // Safety check: if baseAudioPlaysRef is already at or near totalAudios, reset it
    // This prevents the issue where progress jumps to 100% immediately
    if (baseAudioPlaysRef.current >= progressConfig.totalAudios - 2) {
      console.warn('⚠️ baseAudioPlaysRef is too high, resetting to 0 to prevent progress jump')
      baseAudioPlaysRef.current = 0
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
    
    // If progress is already 100% but status is not COMPLETED, update it
    if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
      console.log('✅ Progress is 100% but status is not COMPLETED, updating status...')
      updateLessonProgress(LESSON_ID, currentProgress.progress, 'COMPLETED', currentProgress.score, currentProgress.timeSpent)
    }
  }, []) // Empty dependency array - only run once on mount

  const calculateProgress = () => {
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    
    // Calculate progress from ACTUAL STATE, not from stored baseProgress
    
    // 1. Audio progress: Calculate from total unique audios played (base + new)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    const audioProgress = Math.min(50, (effectiveUniqueAudios / progressConfig.totalAudios) * 50)
    
    // 2. Time progress: Calculate from total time spent (max 50%, 5 minutes = 50%)
    const timeProgress = Math.min(50, totalTimeSpent * 10)
    
    // 3. Total progress = audio + time (capped at 100%)
    const totalProgress = Math.round(Math.min(100, audioProgress + timeProgress))
    
    console.log('📊 Progress calculation (from state):', {
      totalUniqueAudios,
      effectiveUniqueAudios,
      audioProgress: audioProgress.toFixed(2),
      totalTimeSpent,
      timeProgress: timeProgress.toFixed(2),
      totalProgress,
    })
    
    return totalProgress
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

  const progress = getLessonProgress(LESSON_ID)
  
  // Calculate learned count from actual unique audios (includes letters + comparisons)
  const estimatedBaseCount = Math.min(baseAudioPlaysRef.current, progressConfig.totalAudios)
  const newUniqueAudios = uniqueAudiosPlayedRef.current.size
  const learnedCount = Math.min(estimatedBaseCount + newUniqueAudios, progressConfig.totalAudios)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Kurdish Alphabet</h1>

        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {letters.map((l) => {
              const audioKey = `letter-${l.glyph}`
              return (
                <motion.div key={l.glyph} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
                  <div className="text-center mb-5">
                    <div className="text-4xl font-bold text-kurdish-red">{l.glyph}</div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <AudioButton 
                      kurdishText={l.glyph.toLowerCase()} 
                      phoneticText={l.glyph.toUpperCase()} 
                      label="Listen" 
                      size="small"
                      audioFile={`/audio/kurdish-tts-mp3/alphabet/${getLetterAudioFile(l.glyph)}.mp3`}
                      onPlay={() => handleAudioPlay(audioKey)}
                    />
                    <div className="text-right flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{l.word}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{l.meaning}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
                    onPlay={() => handleAudioPlay("comparison-i-1")}
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
                    onPlay={() => handleAudioPlay("comparison-i-2")}
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
                    onPlay={() => handleAudioPlay("comparison-u-1")}
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
                    onPlay={() => handleAudioPlay("comparison-u-2")}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">ûr</div>
                  <div className="text-xs text-gray-500">fire</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> U is short like "put", Û is long like "oo" in "moon"
              </div>
            </div>

            {/* E vs Ê */}
            <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-white">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">E</div>
                  <div className="text-xs text-gray-500 mb-1">Short sound</div>
                  <AudioButton 
                    kurdishText="e" 
                    phoneticText="E" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/e.mp3"
                    onPlay={() => handleAudioPlay("comparison-e-1")}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">ev</div>
                  <div className="text-xs text-gray-500">this</div>
                </div>
                <div className="text-2xl text-gray-400">vs</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-kurdish-red mb-2">Ê</div>
                  <div className="text-xs text-gray-500 mb-1">Long sound</div>
                  <AudioButton 
                    kurdishText="ê" 
                    phoneticText="Ê" 
                    label="Listen" 
                    size="small"
                    audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-e.mp3"
                    onPlay={() => handleAudioPlay("comparison-e-2")}
                  />
                  <div className="text-sm font-medium text-gray-800 mt-2">êvar</div>
                  <div className="text-xs text-gray-500">evening</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                <strong>Tip:</strong> E is short like "bet", Ê is long like "ay" in "say"
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pronunciation Tips */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.2 }}
          className="mt-8 card p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-kurdish-red" />
            Pronunciation Tips for Special Characters
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-semibold mb-2">Ç (cedilla C):</p>
              <p className="text-sm">Sounds like "ch" in "chair" - çav (eyes)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Ş (cedilla S):</p>
              <p className="text-sm">Sounds like "sh" in "shoe" - şêr (lion)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">X:</p>
              <p className="text-sm">Sounds like "kh" (guttural sound) - xwişk (sister)</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Q:</p>
              <p className="text-sm">Sounds like "q" in Arabic - qel (crow)</p>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  )
}
