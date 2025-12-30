// Kurdish Text-to-Speech Service
// src/lib/kurdishTTS.ts

export interface TTSOptions {
  text: string
  language?: string
  voice?: string
  speed?: number
  pitch?: number
}

export interface AudioResult {
  success: boolean
  audioBuffer?: ArrayBuffer
  error?: string
}

export class KurdishTTSService {
  private apiKey: string
  private baseUrl = 'https://texttospeech.googleapis.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async synthesizeSpeech(options: TTSOptions): Promise<AudioResult> {
    const { 
      text, 
      language = 'ku', 
      voice = 'ku-KU-Standard-A', 
      speed = 0.8,
      pitch = 0.0 
    } = options

    const requestBody = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speed,
        pitch: pitch
      }
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text:synthesize?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`TTS API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      const audioData = atob(data.audioContent)
      const audioBuffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(audioBuffer)
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i)
      }

      return { success: true, audioBuffer }
    } catch (error) {
      console.error('TTS Synthesis Error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<boolean> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const audioBufferSource = audioContext.createBufferSource()
      
      const decodedAudio = await audioContext.decodeAudioData(audioBuffer)
      audioBufferSource.buffer = decodedAudio
      audioBufferSource.connect(audioContext.destination)
      audioBufferSource.start()
      
      return true
    } catch (error) {
      console.error('Audio playback error:', error)
      return false
    }
  }

  async speakKurdish(text: string, options?: Partial<TTSOptions>): Promise<boolean> {
    try {
      const result = await this.synthesizeSpeech({ text, ...options })
      
      if (result.success && result.audioBuffer) {
        return await this.playAudio(result.audioBuffer)
      }
      
      return false
    } catch (error) {
      console.error('Speak Kurdish error:', error)
      return false
    }
  }
}

// Fallback phonetic simulation
export function playPhoneticSimulation(text: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Parse the pronunciation guide to create syllable-based tones
      const syllables = text.split(' ').filter(s => s.length > 0)
      let currentTime = audioContext.currentTime
      
      syllables.forEach((syllable, index) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // More realistic frequency mapping for Kurdish sounds
        let frequency = 400
        if (syllable.includes('AH') || syllable.includes('ah')) frequency = 500
        if (syllable.includes('EE') || syllable.includes('ee')) frequency = 600
        if (syllable.includes('EH') || syllable.includes('eh')) frequency = 450
        if (syllable.includes('UH') || syllable.includes('uh')) frequency = 350
        if (syllable.includes('OO') || syllable.includes('oo')) frequency = 300
        if (syllable.includes('SH') || syllable.includes('sh')) frequency = 700
        if (syllable.includes('CH') || syllable.includes('ch')) frequency = 650
        if (syllable.includes('KH') || syllable.includes('kh')) frequency = 550
        
        oscillator.frequency.setValueAtTime(frequency, currentTime)
        
        // Syllable duration based on length and complexity
        const duration = syllable.length > 4 ? 0.4 : 0.3
        
        gainNode.gain.setValueAtTime(0.2, currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration)
        
        oscillator.start(currentTime)
        oscillator.stop(currentTime + duration)
        
        currentTime += duration + 0.1 // Small pause between syllables
      })
      
      // Resolve after all syllables finish
      setTimeout(resolve, (syllables.length * 0.5) + 500)
    } catch (error) {
      console.error('Phonetic simulation failed:', error)
      resolve()
    }
  })
}

// Simple beep fallback
export function playSimpleBeep(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.8)
      
      setTimeout(resolve, 800)
    } catch (error) {
      console.error('Simple beep failed:', error)
      resolve()
    }
  })
}

// Global TTS instance
let ttsService: KurdishTTSService | null = null

export function getTTSService(): KurdishTTSService | null {
  if (typeof window === 'undefined') return null
  
  if (!ttsService && process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY) {
    ttsService = new KurdishTTSService(process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY)
  }
  
  return ttsService
}

// Main function to speak Kurdish with fallbacks
export async function speakKurdish(
  kurdishText: string, 
  phoneticFallback?: string
): Promise<boolean> {
  const tts = getTTSService()
  
  // Try real TTS first
  if (tts) {
    const success = await tts.speakKurdish(kurdishText, {
      speed: 0.8,
      pitch: 0.0
    })
    
    if (success) {
      return true
    }
  }
  
  // Fallback to browser's built-in speech synthesis
  if ('speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(kurdishText)
      utterance.lang = 'ku' // Kurdish language code
      utterance.rate = 0.7 // Slower for learning
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      return new Promise((resolve) => {
        utterance.onend = () => resolve(true)
        utterance.onerror = () => resolve(false)
        speechSynthesis.speak(utterance)
      })
    } catch (error) {
      console.error('Browser TTS failed:', error)
    }
  }
  
  // Fallback to phonetic simulation
  if (phoneticFallback) {
    await playPhoneticSimulation(phoneticFallback)
    return true
  }
  
  // Last resort: simple beep
  await playSimpleBeep()
  return false
}
