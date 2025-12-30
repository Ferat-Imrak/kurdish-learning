'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface LanguageSelectorProps {
  selectedLanguage: 'kurmanji' | 'sorani' | null
  onLanguageSelect: (language: 'kurmanji' | 'sorani') => void
}

export default function LanguageSelector({ selectedLanguage, onLanguageSelect }: LanguageSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-kurdish-red font-heading not-italic">
        Choose Your Kurdish Dialect
      </h3>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLanguageSelect('kurmanji')}
          className={`px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 ${
            selectedLanguage === 'kurmanji'
              ? 'bg-kurdish-red text-white shadow-xl'
              : 'bg-white text-kurdish-red border-2 border-kurdish-red hover:bg-kurdish-red hover:text-white'
          }`}
        >
          <div className="text-3xl mb-2">🏔️</div>
          <div>Kurmanji</div>
          <div className="text-sm font-normal opacity-80">
            Northern Kurdish
          </div>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onLanguageSelect('sorani')}
          className={`px-8 py-4 rounded-2xl text-xl font-bold transition-all duration-300 ${
            selectedLanguage === 'sorani'
              ? 'bg-kurdish-green text-white shadow-xl'
              : 'bg-white text-kurdish-green border-2 border-kurdish-green hover:bg-kurdish-green hover:text-white'
          }`}
        >
          <div className="text-3xl mb-2">🌅</div>
          <div>Sorani</div>
          <div className="text-sm font-normal opacity-80">
            Central Kurdish
          </div>
        </motion.button>
      </div>
      
      {selectedLanguage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600">
            Great choice! You'll learn {selectedLanguage === 'kurmanji' ? 'Kurmanji' : 'Sorani'} Kurdish.
          </p>
        </motion.div>
      )}
    </div>
  )
}

