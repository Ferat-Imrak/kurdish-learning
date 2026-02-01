"use client"

import { useState } from "react"
import { Volume2, Loader2 } from "lucide-react"
import { speakKurdish } from "../../lib/kurdishTTS"
import { playWiktionaryAudio } from "../../lib/wiktionaryAudio"
import { audioCache } from "../../lib/audioCache"

// Cache for Kurdish TTS audio to avoid re-fetching
const kurdishTTSCache = new Map<string, string>() // word -> blob URL

interface AudioButtonProps {
  src?: string
  label?: string
  kurdishText?: string
  phoneticText?: string
  audioFile?: string
  size?: 'small' | 'medium' | 'normal' | 'large'
  onPlay?: (audioKey?: string) => void // Callback when audio starts playing
}

export default function AudioButton({ 
  src, 
  label = "Listen", 
  kurdishText,
  phoneticText,
  audioFile,
  size = 'normal',
  onPlay
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Note: No preloading needed since we have local MP3 files!
  // Kurdish TTS API is now only used as a fallback for missing files

  // Helper function to sanitize text for filename lookup
  const getAudioFilename = (text: string) => {
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

  const playAudio = async () => {
    if (isPlaying || isLoading) return

    setIsPlaying(true)
    // Don't set loading state for local files - they load instantly

    try {
      // Priority 1: Explicitly provided local audio file
      if (audioFile) {
        const audio = new Audio(audioFile)
        
        // Wait for audio to be ready to play
        await new Promise((resolve, reject) => {
          audio.oncanplaythrough = () => {
            resolve(null)
          }
          audio.onerror = (e) => {
            reject(audio.error || new Error('Audio load failed'))
          }
          audio.load()
        })
        
        audio.onended = () => {
          setIsPlaying(false)
        }
        audio.onerror = (e) => {
          setIsPlaying(false)
        }
        
        try {
          await audio.play()
          onPlay?.()
          return
        } catch (playError) {
          setIsPlaying(false)
          console.error('Audio play error:', playError)
          // Still call onPlay even if play fails (for progress tracking)
          onPlay?.()
          throw playError
        }
      }

      // Priority 2: Downloaded Kurdish TTS files (MP3)
      if (kurdishText) {
        const filename = getAudioFilename(kurdishText);
        // Try conversations subdirectory first (for Daily Conversations lesson)
        const conversationsPath = `/audio/kurdish-tts-mp3/conversations/${filename}.mp3`;
        // Try common subdirectory (for common phrases used in conversations)
        const commonPath = `/audio/kurdish-tts-mp3/common/${filename}.mp3`;
        // Try grammar subdirectory (where most lesson audio files are)
        const grammarPath = `/audio/kurdish-tts-mp3/grammar/${filename}.mp3`;
        const rootPath = `/audio/kurdish-tts-mp3/${filename}.mp3`;
        
        // Try conversations path first
        try {
          const audio = new Audio(conversationsPath);
          
          await new Promise((resolve, reject) => {
            audio.onloadeddata = resolve;
            audio.onerror = reject;
            audio.load();
          });
          
          audio.onended = () => {
            setIsPlaying(false)
            setIsLoading(false)
          }
          await audio.play();
          setIsLoading(false);
          onPlay?.();
          return;
        } catch (conversationsError) {
          // Try common path
          try {
            const audio = new Audio(commonPath);
            
            await new Promise((resolve, reject) => {
              audio.onloadeddata = resolve;
              audio.onerror = reject;
              audio.load();
            });
            
            audio.onended = () => {
              setIsPlaying(false)
              setIsLoading(false)
            }
            await audio.play();
            setIsLoading(false);
            onPlay?.();
            return;
          } catch (commonError) {
            // Try grammar path
            try {
              const audio = new Audio(grammarPath);
              
              await new Promise((resolve, reject) => {
                audio.onloadeddata = resolve;
                audio.onerror = reject;
                audio.load();
              });
              
              audio.onended = () => {
                setIsPlaying(false)
                setIsLoading(false)
              }
              await audio.play();
              setIsLoading(false);
              onPlay?.();
              return;
            } catch (grammarError) {
              // Try root path as fallback
              try {
                const audio = new Audio(rootPath);
                
                await new Promise((resolve, reject) => {
                  audio.onloadeddata = resolve;
                  audio.onerror = reject;
                  audio.load();
                });
                
                audio.onended = () => {
                  setIsPlaying(false)
                  setIsLoading(false)
                }
                await audio.play();
                setIsLoading(false);
                onPlay?.();
                return;
              } catch (localError) {
                // File doesn't exist in any location, continue to API/fallbacks
              }
            }
          }
        }
      }

      // Priority 3: Kurdish TTS API (if local file not available)
      if (kurdishText) {
        const cacheKey = kurdishText.toLowerCase()
        
        // Check cache first - INSTANT playback if cached!
        if (kurdishTTSCache.has(cacheKey)) {
          console.log(`⚡ Playing cached TTS: ${kurdishText}`)
          const audioUrl = kurdishTTSCache.get(cacheKey)!
          const audio = new Audio(audioUrl)

          // Cached audio is instant, no loading needed

          audio.onended = () => {
            setIsPlaying(false)
            setIsLoading(false)
          }

          audio.onerror = () => {
            setIsPlaying(false)
            setIsLoading(false)
          }

          await audio.play()
          onPlay?.()
          return
        }

        // Not cached - fetch from API
        try {
          const response = await fetch('https://www.kurdishtts.com/api/tts-proxy', {
            method: 'POST',
            headers: {
              'x-api-key': '399af84a0973b4cc4a8dec8c69ee48c06d3ac172',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: kurdishText,
              speaker_id: 'kurmanji_12'
            })
          })

          if (response.ok) {
            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            
            // Cache for next time
            kurdishTTSCache.set(cacheKey, audioUrl)
            
            const audio = new Audio(audioUrl)
            console.log(`✅ TTS ready`)

            audio.onended = () => {
              setIsPlaying(false)
              setIsLoading(false)
            }

            audio.onerror = (e) => {
              console.error('Audio playback error:', e)
              setIsPlaying(false)
              setIsLoading(false)
            }

            setIsLoading(false)
            await audio.play()
            onPlay?.()
            return
          } else if (response.status === 503) {
            console.log(`⚠️ TTS service temporarily unavailable, using fallback...`)
          } else {
            console.log(`⚠️ TTS API error (${response.status}), using fallback...`)
          }
        } catch (apiError) {
          console.log(`⚠️ TTS API error:`, apiError)
        }
      }

      const word = kurdishText?.toLowerCase() || ''
      
      // Priority 4: Cached Wiktionary audio (FALLBACK 1)
      if (audioCache.hasKnownAudio(word)) {
        await audioCache.playAudio(word)
        setIsPlaying(false)
        setIsLoading(false)
        onPlay?.()
        return
      }

      // Priority 5: Wiktionary search (FALLBACK 2)
      await playWiktionaryAudio(
        kurdishText || '', 
        phoneticText,
        async () => {
          // Priority 6: Browser TTS (FINAL FALLBACK)
          await speakKurdish(kurdishText || '', phoneticText)
          setIsPlaying(false)
          setIsLoading(false)
          onPlay?.()
        }
      )
    } catch (error) {
      setIsPlaying(false)
      setIsLoading(false)
    }
  }

  const sizeClasses = size === 'small' 
    ? 'px-2 py-1 text-xs gap-1' 
    : size === 'medium'
    ? 'px-3 py-1.5 text-sm gap-1.5'
    : size === 'large'
    ? 'px-6 py-3 text-base gap-2'
    : 'px-4 py-2 gap-2'
  
  const iconSize = size === 'small' 
    ? 'w-3 h-3' 
    : size === 'medium'
    ? 'w-4 h-4'
    : size === 'large'
    ? 'w-5 h-5'
    : 'w-5 h-5'

  return (
    <button
      onClick={playAudio}
      disabled={isPlaying || isLoading}
      className={`inline-flex items-center ${sizeClasses} rounded-full bg-primaryBlue text-white shadow hover:shadow-md hover:bg-primaryBlue/80 disabled:opacity-50 transition-all duration-200`}
    >
      {isLoading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : isPlaying ? (
        <Volume2 className={`${iconSize} animate-pulse`} />
      ) : (
        <Volume2 className={iconSize} />
      )}
      <span className="font-medium">
        {label}
      </span>
    </button>
  )
}


