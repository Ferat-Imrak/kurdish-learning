// Updated AudioButton component with real TTS
// This would replace your existing AudioButton component

"use client"

import { useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { speakKurdish } from '../../lib/kurdishTTS'
import { playWiktionaryAudio } from '../../lib/wiktionaryAudio'

interface AudioButtonProps {
  src?: string
  label?: string
  kurdishText?: string
  fallbackText?: string
}

export default function AudioButton({ 
  src, 
  label = "Listen", 
  kurdishText,
  fallbackText 
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const playAudio = async () => {
    if (isPlaying || isLoading) return

    setIsLoading(true)
    setIsPlaying(true)

    try {
      // Try Wiktionary audio first, then TTS, then fallbacks
      if (kurdishText) {
        await playWiktionaryAudio(
          kurdishText, 
          fallbackText,
          async () => {
            await speakKurdish(kurdishText)
          }
        )
      } 
      // Fallback to phonetic simulation
      else if (fallbackText) {
        await playPhoneticSimulation(fallbackText)
      }
      // Last resort: simple beep
      else {
        await playSimpleBeep()
      }
    } catch (error) {
      console.error('Audio playback failed:', error)
      // Fallback to simple beep
      await playSimpleBeep()
    } finally {
      setIsLoading(false)
      setIsPlaying(false)
    }
  }

  const playPhoneticSimulation = async (text: string) => {
    const audioContext = new AudioContext()
    const syllables = text.split(' ').filter(s => s.length > 0)
    let currentTime = audioContext.currentTime

    for (const syllable of syllables) {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      let frequency = 400
      if (syllable.includes('AH') || syllable.includes('ah')) frequency = 500
      if (syllable.includes('EE') || syllable.includes('ee')) frequency = 600
      if (syllable.includes('EH') || syllable.includes('eh')) frequency = 450
      if (syllable.includes('UH') || syllable.includes('uh')) frequency = 350
      
      oscillator.frequency.setValueAtTime(frequency, currentTime)
      
      const duration = syllable.length > 4 ? 0.4 : 0.3
      gainNode.gain.setValueAtTime(0.2, currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration)
      
      oscillator.start(currentTime)
      oscillator.stop(currentTime + duration)
      
      currentTime += duration + 0.1
    }
  }

  const playSimpleBeep = async () => {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.8)
  }

  return (
    <button
      onClick={playAudio}
      disabled={isPlaying || isLoading}
      className="flex items-center gap-2 px-3 py-2 bg-primaryBlue text-white rounded-xl hover:bg-primaryBlue/80 disabled:opacity-50 transition-colors text-sm font-medium"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : label}
    </button>
  )
}
