'use client'

import { useState, useEffect, useRef } from 'react'
import PageContainer from '../../../components/PageContainer'
import BackLink from '../../../components/BackLink'
import { motion } from 'framer-motion'
import AudioButton from '../../../components/lessons/AudioButton'
import { useProgress } from '../../../contexts/ProgressContext'
import { restoreRefsFromProgress } from '../../../lib/progressHelper'

const LESSON_ID = '11' // Nature lesson ID

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

interface NatureItem {
  id: string
  english: string
  kurdish: string
  category: string
  icon: string
  audioFile?: string
}

const natureItems: NatureItem[] = [
  // Trees
  { id: 'tree1', kurdish: 'Dar', english: 'Tree', icon: '🌳', category: 'trees' },
  { id: 'tree2', kurdish: 'Berû', english: 'Oak', icon: '🌲', category: 'trees' },
  { id: 'tree3', kurdish: 'Sûs', english: 'Pine', icon: '🌲', category: 'trees' },
  { id: 'tree4', kurdish: 'Darê bejî', english: 'Palm', icon: '🌴', category: 'trees' },
  { id: 'tree5', kurdish: 'Darê çinar', english: 'Sycamore', icon: '🌳', category: 'trees' },
  
  // Flowers
  { id: 'flower1', kurdish: 'Gul', english: 'Flower', icon: '🌸', category: 'flowers' },
  { id: 'flower2', kurdish: 'Gulên sor', english: 'Rose', icon: '🌹', category: 'flowers' },
  { id: 'flower3', kurdish: 'Gulên rojê', english: 'Sunflower', icon: '🌻', category: 'flowers' },
  { id: 'flower4', kurdish: 'Gulên sîrî', english: 'Lily', icon: '🌺', category: 'flowers' },
  { id: 'flower5', kurdish: 'Gulên çîçek', english: 'Blossom', icon: '🌼', category: 'flowers' },
  
  // Landscapes
  { id: 'mountain1', kurdish: 'Çiya', english: 'Mountain', icon: '🏔️', category: 'landscapes' },
  { id: 'mountain2', kurdish: 'Newal', english: 'Valley', icon: '🏞️', category: 'landscapes' },
  { id: 'mountain3', kurdish: 'Daristan', english: 'Forest', icon: '🌲', category: 'landscapes' },
  { id: 'mountain4', kurdish: 'Çavkanî', english: 'Spring', icon: '💧', category: 'landscapes' },
  { id: 'mountain5', kurdish: 'Çol', english: 'Desert', icon: '🏜️', category: 'landscapes' },
  { id: 'mountain6', kurdish: 'Deşt', english: 'Plain', icon: '🌾', category: 'landscapes' },
  { id: 'mountain7', kurdish: 'Çem', english: 'River', icon: '🏞️', category: 'landscapes' },
  { id: 'mountain8', kurdish: 'Gol', english: 'Lake', icon: '🏞️', category: 'landscapes' },
  { id: 'mountain9', kurdish: 'Behr', english: 'Sea', icon: '🌊', category: 'landscapes' },
  
  // Weather
  { id: 'weather1', kurdish: 'Barîn', english: 'Rain', icon: '🌧️', category: 'weather' },
  { id: 'weather2', kurdish: 'Roj', english: 'Sun', icon: '☀️', category: 'weather' },
  { id: 'weather3', kurdish: 'Berf', english: 'Snow', icon: '❄️', category: 'weather' },
  { id: 'weather4', kurdish: 'Ba', english: 'Wind', icon: '💨', category: 'weather' },
  { id: 'weather5', kurdish: 'Ewr', english: 'Cloud', icon: '☁️', category: 'weather' },
  { id: 'weather6', kurdish: 'Bahoz', english: 'Storm', icon: '⛈️', category: 'weather' },
  { id: 'weather7', kurdish: 'Zîpik', english: 'Hail', icon: '🧊', category: 'weather' },
  
  // Plants
  { id: 'plant1', kurdish: 'Pel', english: 'Leaf', icon: '🍃', category: 'plants' },
  { id: 'plant2', kurdish: 'Kok', english: 'Root', icon: '🌱', category: 'plants' },
  { id: 'plant4', kurdish: 'Gîha', english: 'Grass', icon: '🌱', category: 'plants' },
  { id: 'plant5', kurdish: 'Tohum', english: 'Seed', icon: '🌰', category: 'plants' },
  { id: 'plant6', kurdish: 'Giyayê çavkanî', english: 'Moss', icon: '🌿', category: 'plants' },
  { id: 'plant7', kurdish: 'Herrî', english: 'Mud', icon: '🟤', category: 'plants' },
  { id: 'plant8', kurdish: 'Zevî', english: 'Land/Soil', icon: '🌾', category: 'plants' }
]

// Automatically generate audioFile for each nature item
const natureItemsWithAudio = natureItems.map(item => ({
  ...item,
  audioFile: `${getAudioFilename(item.kurdish)}.mp3`
}))

const categories = {
  trees: { color: 'bg-green-100 text-green-800', label: 'Trees' },
  flowers: { color: 'bg-pink-100 text-pink-800', label: 'Flowers' },
  landscapes: { color: 'bg-blue-100 text-blue-800', label: 'Landscapes' },
  weather: { color: 'bg-yellow-100 text-yellow-800', label: 'Weather' },
  plants: { color: 'bg-emerald-100 text-emerald-800', label: 'Plants' }
}

interface NaturePhrase {
  id: string
  kurdish: string
  english: string
  audioFile: string
}

const naturePhrases: NaturePhrase[] = [
  { id: 'phrase1', kurdish: 'Dar bilind e', english: 'The tree is tall', audioFile: 'dar-bilind-e.mp3' },
  { id: 'phrase2', kurdish: 'Ez gulek dibînim', english: 'I see a flower', audioFile: 'ez-gulek-dibinim.mp3' },
  { id: 'phrase3', kurdish: 'Çiya mezin e', english: 'The mountain is big', audioFile: 'ciya-mezin-e.mp3' },
  { id: 'phrase4', kurdish: 'Baran dibare', english: 'It is raining', audioFile: 'baran-dibare.mp3' },
  { id: 'phrase5', kurdish: 'Roj tê derketin', english: 'The sun is rising', audioFile: 'roj-te-derketin.mp3' },
  { id: 'phrase6', kurdish: 'Daristan xweş e', english: 'The forest is beautiful', audioFile: 'daristan-xwes-e.mp3' },
  { id: 'phrase7', kurdish: 'Çem mezin e', english: 'The river is big', audioFile: 'cem-mezin-e.mp3' },
  { id: 'phrase8', kurdish: 'Berf dibare', english: 'It is snowing', audioFile: 'berf-dibare.mp3' },
  { id: 'phrase9', kurdish: 'Gulên sor xweşik in', english: 'Red flowers are beautiful', audioFile: 'gulen-sor-xwesik-in.mp3' },
  { id: 'phrase10', kurdish: 'Behrr hêdî ye', english: 'The sea is calm', audioFile: 'behr-hedi-ye.mp3' }
]

export default function NaturePage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 42, // 5 trees + 5 flowers + 9 landscapes + 7 weather + 6 plants = 32 items + 10 phrases = 42
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 100 / 42, // ~2.38% per audio
  }
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID)
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig)
  const startTimeRef = useRef<number>(estimatedStartTime)
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays)
  const refsInitializedRef = useRef(false)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAllItems, setShowAllItems] = useState(false)

  const filteredItems = selectedCategory === 'all' 
    ? natureItemsWithAudio 
    : natureItemsWithAudio.filter(item => item.category === selectedCategory)

  const displayedItems = showAllItems ? filteredItems : filteredItems.slice(0, 12)

  // Calculate progress based on unique audios played and time spent
  const calculateProgress = (): number => {
    const currentProgress = getLessonProgress(LESSON_ID)
    const storedProgress = currentProgress?.progress || 0
    
    // Calculate total unique audios played (base + session)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    
    // Audio progress: 50% weight
    const audioProgress = Math.min(progressConfig.audioWeight, (effectiveUniqueAudios / progressConfig.totalAudios) * progressConfig.audioWeight)
    
    // Time progress: 50% weight (3 minutes = 50%)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const timeProgress = Math.min(progressConfig.timeWeight, (totalTimeSpent / 3) * progressConfig.timeWeight)
    
    // Combined progress
    let calculatedProgress = audioProgress + timeProgress
    
    // Special case: if all audios are played, force 100% completion (prioritizing audio completion)
    if (effectiveUniqueAudios >= progressConfig.totalAudios) {
      calculatedProgress = 100
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
    }
    
    refsInitializedRef.current = true
  }, [getLessonProgress, updateLessonProgress])

  // Periodic progress update based on time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProgress = getLessonProgress(LESSON_ID)
      const progress = calculateProgress()
      
      // Only update if progress changed
      if (progress !== currentProgress.progress) {
        const baseTimeSpent = currentProgress?.timeSpent || 0
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
        const safeTimeSpent = Math.min(1000, totalTimeSpent)
        
        const status = progress >= 100 ? 'COMPLETED' : (currentProgress?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
        updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
      }
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [getLessonProgress, updateLessonProgress])

  // Recovery check: if all audios are played but progress is not 100%
  useEffect(() => {
    const currentProgress = getLessonProgress(LESSON_ID)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    
    if (totalUniqueAudios >= progressConfig.totalAudios && currentProgress.progress < 100) {
      console.log('🔍 All audios played but progress is not 100%, forcing to 100%...')
      updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
    }
  }, [getLessonProgress, updateLessonProgress])

  // Check on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentProgress = getLessonProgress(LESSON_ID)
        const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
        
        if (totalUniqueAudios >= progressConfig.totalAudios && currentProgress.progress < 100) {
          console.log('👁️ Page visible - fixing progress to 100% (all audios played)')
          updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [getLessonProgress, updateLessonProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      <PageContainer>
        <BackLink />
        <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">Nature</h1>

        {/* Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-8 justify-center"
        >
          {['all', ...Object.keys(categories)].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primaryBlue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Nature Items */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}} 
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            Nature Items
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedItems.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{opacity:0, y:10}} 
                animate={{opacity:1, y:0}} 
                className="card p-5"
              >
                <div className="font-bold text-gray-800 text-center">{item.kurdish.charAt(0).toUpperCase() + item.kurdish.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{item.english}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={item.kurdish} 
                    phoneticText={item.english.toUpperCase()} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile ? `/audio/kurdish-tts-mp3/nature/${item.audioFile}` : undefined}
                    onPlay={(audioKey) => handleAudioPlay(audioKey || `nature-item-${item.id}-${item.kurdish}`)}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center shadow">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredItems.length > 12 && (
            <motion.div 
              initial={{opacity:0, y:10}} 
              animate={{opacity:1, y:0}}
              transition={{ delay: 0.3 }}
              className="text-center mt-6"
            >
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="px-4 py-2 text-sm bg-primaryBlue text-white rounded-lg hover:bg-primaryBlue/90 transition-colors flex items-center gap-2 mx-auto"
              >
                {showAllItems ? (
                  <>
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <span>See More ({filteredItems.length - 12} more items)</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Nature Phrases Section */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}} 
          transition={{ delay: 0.2 }}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Nature Phrases
          </h2>
          <p className="text-gray-600 text-sm mb-4">
          </p>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            {naturePhrases.map((phrase, index) => (
              <motion.div
                key={phrase.id}
                initial={{opacity:0, y:10}}
                animate={{opacity:1, y:0}}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-kurdish-red text-lg mb-1">{phrase.kurdish}</p>
                    <p className="text-gray-600 text-sm">{phrase.english}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <AudioButton
                      kurdishText={phrase.kurdish}
                      phoneticText={phrase.english}
                      label="Listen"
                      size="small"
                      audioFile={`/audio/kurdish-tts-mp3/nature/${phrase.audioFile}`}
                      onPlay={(audioKey) => handleAudioPlay(audioKey || `nature-phrase-${phrase.id}-${phrase.kurdish}`)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Fun Facts Section */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}} 
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            Nature in Kurdistan
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <h3 className="font-bold text-green-800 mb-2">Mountains</h3>
                <p className="text-gray-600 text-sm">Kurdistan is home to beautiful mountains like Mount Ararat and the Zagros range.</p>
              </div>
              <div className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <h3 className="font-bold text-blue-800 mb-2">Forests</h3>
                <p className="text-gray-600 text-sm">Rich forests with oak, pine, and other native trees cover much of the region.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <h3 className="font-bold text-pink-800 mb-2">Wildflowers</h3>
                <p className="text-gray-600 text-sm">Spring brings beautiful wildflowers including Kurdish roses and mountain blooms.</p>
              </div>
              <div className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <h3 className="font-bold text-yellow-800 mb-2">Climate</h3>
                <p className="text-gray-600 text-sm">Kurdistan has diverse climates from mountain snow to warm valleys.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </PageContainer>
    </div>
  )
}
