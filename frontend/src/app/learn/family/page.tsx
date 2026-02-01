"use client"

import PageContainer from "../../../components/PageContainer"
import BackLink from "../../../components/BackLink"
import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import AudioButton from "../../../components/lessons/AudioButton"
import { useProgress } from "../../../contexts/ProgressContext"
import { restoreRefsFromProgress } from "../../../lib/progressHelper"

const LESSON_ID = '8' // Family Members lesson ID

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
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 45, // 23 family members + 6 possessive forms + 4 age terms + 6 phrases + 6 questions
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 1.11, // 50% / 45 audios ≈ 1.11% per audio
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
    console.log('🚀 Family Members page mounted, initial progress:', {
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
    
    // Audio progress: 50% weight (1.11% per audio, max 50%)
    const audioProgress = Math.min(progressConfig.audioWeight, totalUniqueAudios * progressConfig.audioMultiplier)
    
    // Time progress: 50% weight
    const baseTimeSpent = currentProgress.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    const timeProgress = Math.min(progressConfig.timeWeight, safeTimeSpent * 10) // 1 minute = 10%, max 50%
    
    // Calculate total progress (audio + time only, no practice)
    let calculatedProgress = audioProgress + timeProgress
    
    // Prevent progress from decreasing - always use max of stored and calculated
    const totalProgress = Math.max(storedProgress, calculatedProgress)
    
    // Round to whole number
    const roundedProgress = Math.round(totalProgress)
    
    console.log('📊 Progress calculation:', {
      totalUniqueAudios,
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
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Family Members</h1>

        {/* Family Members */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
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
                    size="small"
                    audioFile={f.audioFile}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `family-${f.ku}`)}
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
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `possessive-${item.ku}`)}
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
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `age-${item.ku}`)}
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
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `phrase-${item.ku}`)}
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
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `question-${item.ku}`)}
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


