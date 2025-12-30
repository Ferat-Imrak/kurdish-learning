// Test page for TTS functionality
// src/app/test-audio/page.tsx

"use client"

import { useState } from 'react'
import { speakKurdish } from '../../lib/kurdishTTS'
import { playWiktionaryAudio } from '../../lib/wiktionaryAudio'

export default function TestAudioPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])

  const testCases = [
    { kurdish: "Silav", phonetic: "see-LAHV", description: "Hello" },
    { kurdish: "Spas", phonetic: "SPAHS", description: "Thank you" },
    { kurdish: "Sor", phonetic: "SOR", description: "Red" },
    { kurdish: "Yek", phonetic: "YEK", description: "One" },
  ]

  const testAudio = async (testCase: typeof testCases[0]) => {
    setIsPlaying(true)
    setTestResults(prev => [...prev, `Testing: ${testCase.kurdish} (${testCase.description})`])
    
    try {
      // Try Wiktionary audio first, fallback to TTS
      await playWiktionaryAudio(
        testCase.kurdish, 
        testCase.phonetic,
        async () => {
          const success = await speakKurdish(testCase.kurdish, testCase.phonetic)
          setTestResults(prev => [...prev, `✅ ${testCase.kurdish}: ${success ? 'TTS Success' : 'TTS Fallback used'}`])
        }
      )
      setTestResults(prev => [...prev, `✅ ${testCase.kurdish}: Wiktionary audio attempted`])
    } catch (error) {
      setTestResults(prev => [...prev, `❌ ${testCase.kurdish}: Error - ${error}`])
    } finally {
      setIsPlaying(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-kurdish-red mb-8">🎵 Audio Test Page</h1>
        
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Test Kurdish Audio</h2>
          <p className="text-gray-600 mb-4">
            This page helps you test the audio functionality. Click the buttons below to hear Kurdish pronunciation.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {testCases.map((testCase, index) => (
              <button
                key={index}
                onClick={() => testAudio(testCase)}
                disabled={isPlaying}
                className="p-4 bg-primaryBlue text-white rounded-xl hover:bg-primaryBlue/80 disabled:opacity-50 transition-colors"
              >
                <div className="font-bold">{testCase.kurdish}</div>
                <div className="text-sm opacity-90">{testCase.description}</div>
                <div className="text-xs opacity-75">{testCase.phonetic}</div>
              </button>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => testCases.forEach(testCase => testAudio(testCase))}
              disabled={isPlaying}
              className="px-4 py-2 bg-kurdish-green text-white rounded-lg hover:bg-kurdish-green/80 disabled:opacity-50"
            >
              Test All
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Audio Fallback Order</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
              <span>Google Cloud TTS (if API key is configured)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
              <span>Browser Speech Synthesis (built-in TTS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
              <span>Phonetic Simulation (syllable-based tones)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
              <span>Simple Beep (last resort)</span>
            </div>
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Setup Instructions</h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>For best results:</strong> Get a Google Cloud TTS API key and add it to your <code>.env.local</code> file:
            </div>
            <div className="bg-gray-100 p-3 rounded font-mono text-xs">
              NEXT_PUBLIC_GOOGLE_TTS_API_KEY=your_api_key_here
            </div>
            <div>
              <strong>Current status:</strong> {process.env.NEXT_PUBLIC_GOOGLE_TTS_API_KEY ? '✅ API key configured' : '❌ No API key - using fallbacks'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
