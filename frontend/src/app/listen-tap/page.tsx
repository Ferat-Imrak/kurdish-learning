"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { speakKurdish } from "../../lib/kurdishTTS"
import { playWiktionaryAudio } from "../../lib/wiktionaryAudio"

const items = [
  { id: "1", word: "sor", label: "Red", phonetic: "SOR" },
  { id: "2", word: "kewş", label: "Green", phonetic: "KEWSH" },
  { id: "3", word: "şîn", label: "Blue", phonetic: "SHEEN" },
  { id: "4", word: "zer", label: "Yellow", phonetic: "ZEHR" },
  { id: "5", word: "yek", label: "One", phonetic: "YEK" },
  { id: "6", word: "du", label: "Two", phonetic: "DOO" },
  { id: "7", word: "sê", label: "Three", phonetic: "SEH" },
  { id: "8", word: "çar", label: "Four", phonetic: "CHAR" },
]

export default function ListenTapPage() {
  const [target, setTarget] = useState(items[0])
  const [message, setMessage] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const play = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      // Try Wiktionary audio first, fallback to TTS
      await playWiktionaryAudio(
        target.word, 
        target.phonetic,
        async () => {
          await speakKurdish(target.word, target.phonetic)
        }
      )
    } catch (error) {
      console.error('Audio playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  const check = (id: string) => {
    if (id === target.id) {
      setMessage('✅ Great job!')
      const next = items[(items.findIndex(i => i.id === target.id) + 1) % items.length]
      setTarget(next)
      setTimeout(() => setMessage(null), 1200)
    } else {
      setMessage('❌ Try again')
      setTimeout(() => setMessage(null), 800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-playful">Listen & Tap</h1>
          <div />
        </div>

        <div className="max-w-xl mx-auto card p-6 text-center">
          <p className="text-gray-700 mb-4">Listen to the Kurdish word, then tap the correct card.</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Current word:</p>
            <p className="text-2xl font-bold text-kurdish-red">{target.word}</p>
          </div>
          
          <button 
            onClick={play} 
            disabled={isPlaying}
            className="btn-primary mb-6 disabled:opacity-50"
          >
            {isPlaying ? '🎵 Playing...' : '🎵 Play Sound'}
          </button>
          {message && <div className="mb-4 font-bold text-lg">{message}</div>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((it) => (
              <button
                key={it.id}
                onClick={() => check(it.id)}
                className="p-4 rounded-xl border bg-white hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className="font-bold text-lg">{it.label}</div>
                <div className="text-sm text-gray-600 mt-1">{it.word}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


