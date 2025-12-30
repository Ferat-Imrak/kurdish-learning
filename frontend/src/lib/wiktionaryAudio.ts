/**
 * Wiktionary Audio Service
 * Fetches audio pronunciations for Kurdish words from Wiktionary
 */

interface WiktionaryAudioResult {
  audioUrl: string | null
  source: 'wiktionary' | 'fallback'
}

// Cache for audio URLs to avoid repeated API calls
const audioCache = new Map<string, WiktionaryAudioResult>()

// Kurdish pronunciation database for common words
const kurdishPronunciations: Record<string, string> = {
  // Numbers
  'yek': 'YEK',
  'du': 'DOO', 
  'sê': 'SEH',
  'çar': 'CHAR',
  'pênc': 'PENCH',
  'şeş': 'SHESH',
  'heft': 'HEFT',
  'heşt': 'HESHT',
  'neh': 'NEH',
  'deh': 'DEH',
  'bîst': 'BEEST',
  'sî': 'SEE',
  'çil': 'CHEEL',
  'pêncî': 'PENCH-EE',
  'şêst': 'SHEST',
  'heftê': 'HEFT-EH',
  'heştê': 'HESHT-EH',
  'nod': 'NOD',
  'sed': 'SED',
  
  // Colors
  'sor': 'SOR',
  'kewş': 'KEWSH',
  'şîn': 'SHEEN',
  'zer': 'ZEHR',
  'pirteqal': 'PEER-TEH-QAL',
  'mor': 'MOR',
  'gulî': 'GOO-LEE',
  'qehweyî': 'QEH-WEH-YEE',
  'reş': 'RESH',
  'spî': 'SPEE',
  'xwelî': 'KHWEH-LEE',
  'zêr': 'ZEHR',
  
  // Common words
  'mal': 'MAL',
  'av': 'AV',
  'nan': 'NAN',
  'sev': 'SEV',
  'pisîk': 'PEE-SEEK',
  'se': 'SEH',
  'hesp': 'HESP',
  'balindee': 'BA-LEEN-DEH',
  'roj': 'ROJ',
  'heyv': 'HEYV',
  'stêr': 'STEH-R',
  'dar': 'DAR',
  'çîrok': 'CHEE-ROK',
  'pirtûk': 'PEER-TOOK',
  'dayik': 'DA-YEEK',
  'bav': 'BAV',
  'xwişk': 'KHWISHK',
  'bira': 'BEE-RA',
  'keç': 'KECH',
  'kur': 'KOOR',
  'pîrik': 'PEE-REEK',
  'kal': 'KAL',
  'metê': 'MEH-TEH',
  'apo': 'A-PO',
  
  // Greetings
  'silav': 'SEE-LAV',
  'spas': 'SPAS',
  'beyanî baş': 'BEH-YAH-NEE BASH',
  'rojbaş': 'ROJ-BASH',
  'şevbaş': 'SHEV-BASH',
  
  // Time
  'sibê': 'SEE-BEH',
  'nîvro': 'NEEV-RO',
  'êvar': 'EH-VAR',
  'şev': 'SHEV',
  'îro': 'EE-RO',
  'duh': 'DOOH',
  
  // Weather
  'hewa': 'HEH-WA',
  'baran': 'BA-RAN',
  'berf': 'BERF',
  'ba': 'BA',
  'germ': 'GERM',
  'sar': 'SAR',
  'ewr': 'EWR',
}

/**
 * Search for audio files in Wikimedia Commons for a Kurdish word
 */
async function searchWiktionaryAudio(word: string): Promise<string | null> {
  try {
    // Known Kurdish audio files from Lingua Libre
    const knownKurdishAudio: Record<string, string> = {
      'çar': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d1/LL-Q36163_%28kmr%29-Ebulf%C3%AEda-%C3%A7ar.wav/LL-Q36163_%28kmr%29-Ebulf%C3%AEda-%C3%A7ar.wav.mp3',
      'çarde': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c1/LL-Q36163_%28kmr%29-Ebulf%C3%AEda-%C3%A7arde.wav/LL-Q36163_%28kmr%29-Ebulf%C3%AEda-%C3%A7arde.wav.mp3',
      'a': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/fc/LL-Q36368_%28kur%29-Pispor-a.wav/LL-Q36368_%28kur%29-Pispor-a.wav.mp3',
      'b': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f2/LL-Q36368_%28kur%29-Pispor-b.wav/LL-Q36368_%28kur%29-Pispor-b.wav.mp3',
      'e': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/LL-Q36368_%28kur%29-Pispor-e.wav/LL-Q36368_%28kur%29-Pispor-e.wav.mp3',
      'î': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7a/LL-Q36368_%28kur%29-Pispor-%C3%AE.wav/LL-Q36368_%28kur%29-Pispor-%C3%AE.wav.mp3',
      'p': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a7/LL-Q36368_%28kur%29-Pispor-p_%28req%29.wav/LL-Q36368_%28kur%29-Pispor-p_%28req%29.wav.mp3',
      't': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c6/LL-Q36368_%28kur%29-Pispor-t_%28req%29.wav/LL-Q36368_%28kur%29-Pispor-t_%28req%29.wav.mp3',
      'û': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/be/LL-Q36368_%28kur%29-Pispor-%C3%BB.wav/LL-Q36368_%28kur%29-Pispor-%C3%BB.wav.mp3',
      'w': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c1/LL-Q36368_%28kur%29-Pispor-w.wav/LL-Q36368_%28kur%29-Pispor-w.wav.mp3',
      'x': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/df/LL-Q36368_%28kur%29-Pispor-x.wav/LL-Q36368_%28kur%29-Pispor-x.wav.mp3',
      // All other letters and numbers are now handled by the audio cache system
    }
    
    // Check if we have a direct URL for this word
    if (knownKurdishAudio[word]) {
      console.log('🎯 Using known Kurdish audio for:', word)
      return knownKurdishAudio[word]
    }
    
    // Try multiple search strategies, prioritizing Kurdish pronunciation files
    const searchTerms = [
      `LL-Q36163 kmr ${word}`, // Lingua Libre Kurdish files (highest priority)
      `kmr ${word}`, // Kurmanji language code
      `kurdish ${word} pronunciation`, // Kurdish pronunciation
      `kurdish ${word} audio`, // Kurdish audio
      `kurdish ${word} sound`, // Kurdish sound
      `${word} pronunciation`, // Word + pronunciation
      `${word} audio`, // Word + audio
      `${word} sound`, // Word + sound
      `ku-${word}`, // With language code
      `kurdish ${word}`, // With "kurdish" prefix
      `kurmanji ${word}`, // With "kurmanji" prefix
      word, // Original word (lowest priority)
    ]

    for (const searchTerm of searchTerms) {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?` +
        `action=query&` +
        `format=json&` +
        `list=search&` +
        `srsearch=${encodeURIComponent(searchTerm)}&` +
        `srnamespace=6&` + // File namespace
        `srlimit=10&` +
        `origin=*`

      const response = await fetch(searchUrl)
      const data = await response.json()

      if (data.query && data.query.search) {
        // Look for audio files (mp3, ogg, wav) but exclude music/songs
        const audioFiles = data.query.search.filter((item: any) => {
          const title = item.title.toLowerCase()
          const hasAudioExtension = title.includes('.mp3') || title.includes('.ogg') || title.includes('.wav')
          
          // Exclude music/song files, language files, and non-Kurdish audio
          const isMusicFile = title.includes('song') || 
                             title.includes('music') || 
                             title.includes('march') || 
                             title.includes('melody') || 
                             title.includes('tune') ||
                             title.includes('languages') ||
                             title.includes('anthem') ||
                             title.includes('hymn') ||
                             title.includes('chorus') ||
                             title.includes('orchestra') ||
                             title.includes('band') ||
                             title.includes('concert')
          
          // Exclude non-Kurdish language files
          const isNonKurdishLanguage = title.includes('jindrich') ||
                                      title.includes('janecka') ||
                                      title.includes('czech') ||
                                      title.includes('english') ||
                                      title.includes('en-us') ||
                                      title.includes('en-uk') ||
                                      title.includes('voice of america') ||
                                      title.includes('v.o.a') ||
                                      title.includes('voa') ||
                                      title.includes('seleka') ||
                                      title.includes('c.a.r') ||
                                      title.includes('central african republic') ||
                                      title.includes('french') ||
                                      title.includes('german') ||
                                      title.includes('spanish') ||
                                      title.includes('arabic') ||
                                      title.includes('turkish') ||
                                      title.includes('persian') ||
                                      title.includes('farsi') ||
                                      title.includes('dutch') ||
                                      title.includes('italian') ||
                                      title.includes('russian') ||
                                      title.includes('chinese') ||
                                      title.includes('japanese') ||
                                      title.includes('korean') ||
                                      title.includes('hindi') ||
                                      title.includes('portuguese') ||
                                      title.includes('polish') ||
                                      title.includes('swedish') ||
                                      title.includes('norwegian') ||
                                      title.includes('danish') ||
                                      title.includes('finnish') ||
                                      title.includes('greek') ||
                                      title.includes('hebrew') ||
                                      title.includes('latvian') ||
                                      title.includes('estonian') ||
                                      title.includes('bulgarian') ||
                                      title.includes('romanian') ||
                                      title.includes('hungarian') ||
                                      title.includes('slovak') ||
                                      title.includes('croatian') ||
                                      title.includes('serbian') ||
                                      title.includes('slovenian') ||
                                      title.includes('macedonian') ||
                                      title.includes('albanian') ||
                                      title.includes('bosnian') ||
                                      title.includes('montenegrin')
          
          // Prefer Kurdish language files
          const isKurdishFile = title.includes('kurdish') ||
                               title.includes('kurdî') ||
                               title.includes('kurmanji') ||
                               title.includes('sorani') ||
                               title.includes('ku-') ||
                               title.includes('kur-') ||
                               title.includes('kurd-') ||
                               title.includes('kmr') ||
                               title.includes('ll-q36163') ||
                               title.includes('lingua libre')
          
          // Prefer pronunciation files
          const isPronunciationFile = title.includes('pronunciation') || 
                                     title.includes('pronounce') || 
                                     title.includes('audio') ||
                                     title.includes('sound') ||
                                     title.includes('voice') ||
                                     title.includes('speak') ||
                                     title.includes('say')
          
          return hasAudioExtension && !isMusicFile && !isNonKurdishLanguage
        })

        // Sort to prioritize Kurdish files, exact word matches, and pronunciation files
        audioFiles.sort((a: any, b: any) => {
          const aTitle = a.title.toLowerCase()
          const bTitle = b.title.toLowerCase()
          
          const aIsKurdish = aTitle.includes('kurdish') ||
                            aTitle.includes('kurdî') ||
                            aTitle.includes('kurmanji') ||
                            aTitle.includes('sorani') ||
                            aTitle.includes('ku-') ||
                            aTitle.includes('kur-') ||
                            aTitle.includes('kurd-') ||
                            aTitle.includes('kmr') ||
                            aTitle.includes('ll-q36163') ||
                            aTitle.includes('lingua libre')
          
          const bIsKurdish = bTitle.includes('kurdish') ||
                            bTitle.includes('kurdî') ||
                            bTitle.includes('kurmanji') ||
                            bTitle.includes('sorani') ||
                            bTitle.includes('ku-') ||
                            bTitle.includes('kur-') ||
                            bTitle.includes('kurd-') ||
                            bTitle.includes('kmr') ||
                            bTitle.includes('ll-q36163') ||
                            bTitle.includes('lingua libre')
          
          const aIsPronunciation = aTitle.includes('pronunciation') || 
                                  aTitle.includes('pronounce') || 
                                  aTitle.includes('audio') ||
                                  aTitle.includes('sound') ||
                                  aTitle.includes('voice') ||
                                  aTitle.includes('speak') ||
                                  aTitle.includes('say')
          
          const bIsPronunciation = bTitle.includes('pronunciation') || 
                                  bTitle.includes('pronounce') || 
                                  bTitle.includes('audio') ||
                                  bTitle.includes('sound') ||
                                  bTitle.includes('voice') ||
                                  bTitle.includes('speak') ||
                                  bTitle.includes('say')
          
          // Check for exact word match in filename
          const aExactMatch = aTitle.includes(`-${word.toLowerCase()}.`) || 
                             aTitle.includes(`_${word.toLowerCase()}.`) ||
                             aTitle.includes(`${word.toLowerCase()}.`) ||
                             aTitle.includes(`${word.toLowerCase()}_`) ||
                             aTitle.includes(`${word.toLowerCase()}-`)
          
          const bExactMatch = bTitle.includes(`-${word.toLowerCase()}.`) || 
                             bTitle.includes(`_${word.toLowerCase()}.`) ||
                             bTitle.includes(`${word.toLowerCase()}.`) ||
                             bTitle.includes(`${word.toLowerCase()}_`) ||
                             bTitle.includes(`${word.toLowerCase()}-`)
          
          // Priority: Kurdish > exact match > pronunciation > others
          if (aIsKurdish && !bIsKurdish) return -1
          if (!aIsKurdish && bIsKurdish) return 1
          if (aExactMatch && !bExactMatch) return -1
          if (!aExactMatch && bExactMatch) return 1
          if (aIsPronunciation && !bIsPronunciation) return -1
          if (!aIsPronunciation && bIsPronunciation) return 1
          return 0
        })

        if (audioFiles.length > 0) {
          const selectedFile = audioFiles[0]
          console.log('✅ Found audio file:', selectedFile.title)
          
          // Double-check that it's not a non-Kurdish file that slipped through
          const title = selectedFile.title.toLowerCase()
          const isDefinitelyNonKurdish = title.includes('en-us') ||
                                        title.includes('en-uk') ||
                                        title.includes('voice of america') ||
                                        title.includes('voa') ||
                                        title.includes('english') ||
                                        title.includes('jindrich') ||
                                        title.includes('janecka') ||
                                        title.includes('czech') ||
                                        title.includes('french') ||
                                        title.includes('german') ||
                                        title.includes('spanish') ||
                                        title.includes('arabic') ||
                                        title.includes('turkish')
          
          if (isDefinitelyNonKurdish) {
            continue // Try next search term
          }
          
          // Get the first audio file and construct the URL
          const fileName = selectedFile.title.replace('File:', '')
          return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`
        }
      }
    }

    return null
  } catch (error) {
    console.warn('Wiktionary audio search failed:', error)
    return null
  }
}

/**
 * Search for audio in Wiktionary entries
 */
async function searchWiktionaryEntry(word: string): Promise<string | null> {
  try {
    // Try multiple Wiktionary sources
    const wiktionarySources = [
      'ku.wiktionary.org', // Kurdish Wiktionary
      'en.wiktionary.org', // English Wiktionary (might have Kurdish entries)
    ]

    for (const source of wiktionarySources) {
      const searchUrl = `https://${source}/w/api.php?` +
        `action=query&` +
        `format=json&` +
        `list=search&` +
        `srsearch=${encodeURIComponent(word)}&` +
        `srlimit=5&` +
        `origin=*`

      const response = await fetch(searchUrl)
      const data = await response.json()

      if (data.query && data.query.search) {
        // Get the first result and fetch its content
        const firstResult = data.query.search[0]
        if (firstResult) {
          const contentUrl = `https://${source}/w/api.php?` +
            `action=query&` +
            `format=json&` +
            `prop=revisions&` +
            `titles=${encodeURIComponent(firstResult.title)}&` +
            `rvprop=content&` +
            `origin=*`

          const contentResponse = await fetch(contentUrl)
          const contentData = await contentResponse.json()

          if (contentData.query && contentData.query.pages) {
            const page = Object.values(contentData.query.pages)[0] as any
            if (page && page.revisions && page.revisions[0]) {
              const content = page.revisions[0]['*']
              
              // Look for audio file references in the content
              const audioRegex = /\[\[File:([^|\]]+\.(?:mp3|ogg|wav))[^\]]*\]\]/gi
              const matches = content.match(audioRegex)
              
              if (matches && matches.length > 0) {
                console.log('🎵 Found audio reference:', matches[0])
                const fileName = matches[0].match(/File:([^|\]]+)/)?.[1]
                if (fileName) {
                  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`
                }
              }
            }
          }
        }
      }
    }

    return null
  } catch (error) {
    return null
  }
}

/**
 * Get audio URL for a Kurdish word from Wiktionary
 */
export async function getWiktionaryAudio(word: string): Promise<WiktionaryAudioResult> {
  // Check cache first
  if (audioCache.has(word)) {
    const cached = audioCache.get(word)!
    return cached
  }

  try {
    // Try Wiktionary entry search first
    let audioUrl = await searchWiktionaryEntry(word)
    
    // If not found, try Commons search
    if (!audioUrl) {
      audioUrl = await searchWiktionaryAudio(word)
    }

    const result: WiktionaryAudioResult = {
      audioUrl,
      source: audioUrl ? 'wiktionary' : 'fallback'
    }

    console.log('✅ Final result for', word, ':', result)
    
    // Cache the result
    audioCache.set(word, result)
    
    return result
  } catch (error) {
    const result: WiktionaryAudioResult = {
      audioUrl: null,
      source: 'fallback'
    }
    
    audioCache.set(word, result)
    return result
  }
}

/**
 * Play audio from Wiktionary or fallback to TTS
 */
export async function playWiktionaryAudio(
  word: string, 
  phoneticText?: string,
  fallbackTTS?: () => Promise<void>
): Promise<void> {
  try {
    console.log('🎵 Playing audio for:', word)
    const { audioUrl, source } = await getWiktionaryAudio(word)
    console.log('🎵 Audio result:', { audioUrl, source })
    
    if (audioUrl && source === 'wiktionary') {
      console.log('🔊 Playing Wiktionary audio:', audioUrl)
      // Play Wiktionary audio
      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      
      return new Promise((resolve, reject) => {
        audio.onloadeddata = () => {
          console.log('✅ Wiktionary audio loaded, playing...')
          audio.play().then(resolve).catch(reject)
        }
        audio.onerror = (error) => {
          console.warn('❌ Failed to play Wiktionary audio, falling back to TTS:', error)
          if (fallbackTTS) {
            fallbackTTS().then(resolve).catch(reject)
          } else {
            resolve()
          }
        }
        audio.onended = () => {
          resolve()
        }
      })
    } else {
      // Enhanced TTS fallback with Kurdish pronunciation
      if (fallbackTTS) {
        // Use Kurdish pronunciation if available
        const kurdishPronunciation = kurdishPronunciations[word.toLowerCase()]
        if (kurdishPronunciation) {
          // Import and use the TTS with Kurdish pronunciation
          const { speakKurdish } = await import('./kurdishTTS')
          await speakKurdish(word, kurdishPronunciation)
        } else {
          await fallbackTTS()
        }
      }
    }
  } catch (error) {
    if (fallbackTTS) {
      await fallbackTTS()
    }
  }
}

/**
 * Clear the audio cache (useful for testing or memory management)
 */
export function clearAudioCache(): void {
  audioCache.clear()
}

/**
 * Clear cache for a specific word
 */
export function clearWordCache(word: string): void {
  audioCache.delete(word.toLowerCase())
}

/**
 * Clear cache and force fresh search for a word
 */
export async function refreshWordAudio(word: string): Promise<void> {
  clearWordCache(word)
}

/**
 * Get cache statistics
 */
export function getAudioCacheStats(): { size: number; keys: string[] } {
  return {
    size: audioCache.size,
    keys: Array.from(audioCache.keys())
  }
}
