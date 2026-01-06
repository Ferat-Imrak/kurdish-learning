"use client"

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Sparkles, Menu, X, Volume2, Eye, EyeOff, CheckCircle, BookMarked } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

// Kurdish TTS cache for stories
const kurdishTTSCache = new Map<string, string>() // text -> blob URL

// Helper function to sanitize text for filename lookup (same as AudioButton)
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
    .trim()
}

type Story = {
  id: string
  title: string
  summary: string
  paragraphs: { ku: string; en: string }[]
}

// Vocabulary dictionary - extracted from stories and flashcards
const vocabularyDict: Record<string, string> = {
  // Common words from stories
  'mêşk': 'ant',
  'mêşkek': 'an ant',
  'sor': 'red',
  'bax': 'garden',
  'baxê': 'garden (with preposition)',
  'gul': 'flower',
  'gulên': 'flowers',
  'zer': 'yellow',
  'kêf': 'fun',
  'xwest': 'wanted',
  'çilçek': 'bird',
  'şîn': 'blue',
  'dar': 'tree',
  'darê': 'tree (with preposition)',
  'nezdîkî': 'near',
  'rûnişt': 'sat',
  'got': 'said',
  'hez': 'like',
  'dikim': 'I do',
  'bedew': 'beautiful',
  'dawiyê': 'end',
  'hêvî': 'hope',
  'reng': 'color',
  'xweşik': 'nice/beautiful',
  'şêr': 'lion',
  'şêrekî': 'a lion',
  'bihêz': 'mighty',
  'xew': 'sleep',
  'mişk': 'mouse',
  'mişkekî': 'a mouse',
  'piçûk': 'small',
  'pençe': 'paw',
  'pençeya': 'paw (with preposition)',
  'bazda': 'ran',
  'şiyar': 'woke up',
  'girt': 'caught',
  'bixwe': 'eat',
  'ji': 'from',
  'kerema': 'kindness',
  'berde': 'let go',
  'min': 'me',
  'rojekê': 'one day',
  'alîkariya': 'help',
  'bikim': 'I do',
  'kenîya': 'laughed',
  'lê': 'but',
  'berda': 'released',
  'çend': 'few',
  'roj': 'day',
  'şûnda': 'later',
  'tora': 'net',
  'nêçîrvanekî': 'a hunter',
  'asê': 'trapped',
  'ma': 'stayed',
  'dengê': 'voice',
  'bihîst': 'heard',
  'zû': 'quickly',
  'têl': 'rope',
  'xwar': 'chewed',
  'azad': 'free',
  'fêr': 'learned',
  'hevalê': 'friend',
  'ferqek': 'a difference',
  'mezin': 'big',
  'çêbike': 'make',
  'silav': 'hello',
  'tu': 'you',
  'çawa': 'how',
  'yî': 'are',
  'ez': 'I',
  'baş': 'good',
  'im': 'am',
  'spas': 'thank you',
  'jî': 'also',
  'îro': 'today',
  'çi': 'what',
  'dikî': 'you do',
  'diçim': 'I go',
  'bazarê': 'market',
  'nan': 'bread',
  'sêv': 'apple',
  'dixwazim': 'I want',
  'diçî': 'you go',
  'na': 'no',
  'malê': 'home',
  'malbatê': 'family',
  'biaxivim': 'I talk',
  'paşê': 'later',
  'em': 'we',
  'li': 'at',
  'hev': 'each other',
  'bibînin': 'meet',
  'erê': 'yes',
  'bimînim': 'I wait',
  'benda': 'waiting for',
  'te': 'you',
  'piştî': 'after',
  'nîvro': 'noon',
  'werim': 'I come',
  'bim': 'I am',
  'rojbaş': 'goodbye',
  'dayik': 'mother',
  'birinc': 'rice',
  'goşt': 'meat',
  'sebze': 'vegetable',
  'sebzeyan': 'vegetables',
  'xweş': 'delicious',
  'kesk': 'green',
  'amade': 'prepare',
  'dikin': 'we do',
  'bişo': 'wash',
  'deynî': 'put',
  'ser': 'on',
  'mase': 'table',
  'bişom': 'I wash',
  'deynim': 'I put',
  'zarokek': 'a child',
  'kêfxweş': 'happy',
  'hewa': 'weather',
  'ye': 'is',
  'derdikeve': 'comes out',
  'germ': 'warm',
  'dikarin': 'we can',
  'derkevin': 'go out',
  'bilîzin': 'we play',
  'dibînim': 'I see',
  'ewrek': 'a cloud',
  'heye': 'there is',
  'dibe': 'it might',
  'ku': 'that',
  'baran': 'rain',
  'bibare': 'it rains',
  'bimînin': 'we stay',
  'pencereyê': 'window',
  'binêrin': 'we look',
  'dimînim': 'I stay',
  'lîstikan': 'games',
  'odeyê': 'room',
  'de': 'in',
  'bi': 'with',
  're': 'with',
  'bibin': 'we are',
  'belê': 'yes',
  'ajelan': 'animals',
  'du': 'two',
  'pisîk': 'cat',
  'spî': 'white',
  'ne': 'are',
  'yek': 'one',
  'se': 'dog',
  'reş': 'black',
  'sê': 'three',
  'balinde': 'bird',
  'difirin': 'they fly',
  'bijmêrim': 'I count',
  'dizanî': 'you know',
  'bibim': 'I become',
  'berîvan': 'Berîvan (name)',
  'roda': 'Rojda (name)',
  'kursî': 'chair',
  'pencereyan': 'windows',
  'nivîn': 'bed',
  'nivînek': 'a bed',
  'odeya': 'room',
  'odeyan': 'rooms',
}

const stories: Story[] = [
  {
    id: 'story-9',
    title: 'Mêşka Sor – The Red Ant',
    summary: 'A story about a red ant who discovers the beauty of all colors.',
    paragraphs: [
      { ku: 'Di rojekê de, mêşkek sor di nav baxê de dijî.', en: 'One day, a red ant lived in the garden.' },
      { ku: 'Ew gulên zer dît û kêf xwest.', en: 'She saw yellow flowers and wanted to have fun.' },
      { ku: 'Paşê çiçekek şîn li ser darekê nêzîkî wê rûnişt.', en: 'Then a blue bird sat on a tree near her.' },
      { ku: 'Mêşk got: Sor im, zer hez dikim, û şîn jî bedew e!', en: 'The ant said: "I am red, I like yellow, and blue is also beautiful!"' },
      { ku: 'Di dawiyê de, hêvî got: Her reng xwe xweşik e!', en: 'Finally, hope said: "Every color is beautiful!"' },
    ],
  },
  {
    id: 'story-10',
    title: 'Şêr û Mişk – The Lion and the Mouse',
    summary: 'A classic fable about kindness and how even small friends can help.',
    paragraphs: [
      { ku: 'Şêrekî bihêz di xew de bû dema ku mişkekî piçûk li ser pençeya wî bazda.', en: 'A mighty lion was sleeping when a tiny mouse ran across his paw.' },
      { ku: 'Şêr şiyar bû, mişk girt û xwest wî bixwe.', en: 'The lion woke up, caught the mouse, and wanted to eat it.' },
      { ku: 'Mişk got: Ji kerema xwe berde min. Rojekê ez ê alîkariya te bikim.', en: 'The mouse said, "Please let me go. One day I will help you."' },
      { ku: 'Şêr kenîya lê mişk berda.', en: 'The lion laughed but released the mouse.' },
      { ku: 'Çend roj şûnda, şêr di tora nêçîrvanekî de asê ma. Mişk dengê wî bihîst, bazda û zû têl xwar.', en: 'A few days later, the lion was trapped in a hunter\'s net. The mouse heard him, ran over, and quickly chewed the ropes.' },
      { ku: 'Şêr azad bû û fêr bû ku hevalê herî piçûk jî dikare ferqek mezin çêbike.', en: 'The lion was freed and learned that even the smallest friend can make a big difference.' },
    ],
  },
  {
    id: 'story-11',
    title: 'Hevpeyvîn – Conversation',
    summary: 'A simple conversation between two friends meeting and talking.',
    paragraphs: [
      { ku: 'Baran: Silav! Tu çawa yî?', en: 'Baran: "Hello! How are you?"' },
      { ku: 'Dilan: Silav! Ez baş im, spas. Tu çawa yî?', en: 'Dilan: "Hello! I am fine, thank you. How are you?"' },
      { ku: 'Baran: Ez jî baş im. Îro çi dikî?', en: 'Baran: "I am also fine. What are you doing today?"' },
      { ku: 'Dilan: Ez diçim bazarê. Ez nan û sêv dixwazim. Tu jî diçî bazarê?', en: 'Dilan: "I am going to the market. I want bread and apple. Are you also going to the market?"' },
      { ku: 'Baran: Na, ez diçim malê. Ez dixwazim bi malbatê xwe biaxivim.', en: 'Baran: "No, I am going home. I want to talk with my family."' },
      { ku: 'Dilan: Baş e! Paşê em ê li baxçê hev bibînin?', en: 'Dilan: "Good! Later shall we meet in the garden?"' },
      { ku: 'Baran: Erê, baş e! Ez ê li baxçe li benda te bimînim.', en: 'Baran: "Yes, good! I will wait for you in the garden."' },
      { ku: 'Dilan: Baş e! Ez ê piştî nîvro werim.', en: 'Dilan: "Good! I will come after noon."' },
      { ku: 'Baran: Baş e! Ez ê li benda te bim.', en: 'Baran: "Good! I will wait for you."' },
      { ku: 'Dilan: Spas! Rojbaş!', en: 'Dilan: "Thank you! Goodbye!"' },
      { ku: 'Baran: Rojbaş!', en: 'Baran: "Goodbye!"' },
    ],
  },
  {
    id: 'story-12',
    title: 'Hevpeyvîna Xwarinê – Food Conversation',
    summary: 'A conversation about food and what to eat for dinner.',
    paragraphs: [
      { ku: 'Dayik: Baran, tu çi dixwazî ji bo xwarina êvarê?', en: 'Mother: "Baran, what do you want for dinner?"' },
      { ku: 'Baran: Ez birinc û goşt dixwazim. Tu jî çi dixwazî?', en: 'Baran: "I want rice and meat. What do you also want?"' },
      { ku: 'Dayik: Ez nan û sebze dixwazim. Sebze xweş e.', en: 'Mother: "I want bread and vegetables. Vegetables are delicious."' },
      { ku: 'Baran: Baş e! Ez jî sebze hez dikim. Sebze kesk in.', en: 'Baran: "Good! I also like vegetables. Vegetables are green."' },
      { ku: 'Dayik: Erê, sebze kesk û xweş in. Em nan, birinc, goşt û sebze amade dikin.', en: 'Mother: "Yes, vegetables are green and delicious. We prepare bread, rice, meat, and vegetables."' },
      { ku: 'Baran: Baş e! Ez dixwazim alîkariya te bikim.', en: 'Baran: "Good! I want to help you."' },
      { ku: 'Dayik: Spas! Tu dikarî sebzeyan bişo û deynî ser mase.', en: 'Mother: "Thank you! You can wash the vegetables and put them on the table."' },
      { ku: 'Baran: Baş e! Ez ê sebzeyan bişom û deynim ser mase.', en: 'Baran: "Good! I will wash the vegetables and put them on the table."' },
      { ku: 'Dayik: Spas, Baran! Tu zarokek baş î.', en: 'Mother: "Thank you, Baran! You are a good child."' },
      { ku: 'Baran: Spas, dayik! Ez ji alîkariya te kêfxweş im.', en: 'Baran: "Thank you, mother! I am happy to help you."' },
    ],
  },
  {
    id: 'story-13',
    title: 'Hevpeyvîna Hewayê – Weather Conversation',
    summary: 'A conversation about the weather and what to do.',
    paragraphs: [
      { ku: 'Rojin: Silav, Hêvî! Îro hewa çawa ye?', en: 'Rojin: "Hello, Hêvî! How is the weather today?"' },
      { ku: 'Hêvî: Silav, Rojin! Îro roj derdikeve. Hewa germ e.', en: 'Hêvî: "Hello, Rojin! Today the sun comes out. The weather is warm."' },
      { ku: 'Rojin: Baş e! Em dikarin derkevin baxçe û bilîzin.', en: 'Rojin: "Good! We can go out to the garden and play."' },
      { ku: 'Hêvî: Erê, baş e! Lê ez dibînim ku ewrek heye. Dibe ku baran bibare.', en: 'Hêvî: "Yes, good! But I see there is a cloud. It might rain."' },
      { ku: 'Rojin: Baş e! Em dikarin li malê bimînin û li pencereyê binêrin.', en: 'Rojin: "Good! We can stay at home and look at the window."' },
      { ku: 'Hêvî: Baş e! Ez jî li malê dimînim. Em dikarin lîstikan bilîzin.', en: 'Hêvî: "Good! I also stay at home. We can play games."' },
      { ku: 'Rojin: Baş e! Em ê di odeyê de bilîzin.', en: 'Rojin: "Good! We will play in the room."' },
      { ku: 'Hêvî: Baş e! Ez ê bi te re werim.', en: 'Hêvî: "Good! I will come with you."' },
      { ku: 'Rojin: Spas, Hêvî! Em ê kêfxweş bibin.', en: 'Rojin: "Thank you, Hêvî! We will be happy."' },
      { ku: 'Hêvî: Belê, em ê kêfxweş bibin.', en: 'Hêvî: "Yes, we will be happy!"' },
    ],
  },
  {
    id: 'story-14',
    title: 'Hevpeyvîna Ajelan – Animals Conversation',
    summary: 'A conversation about animals and counting them.',
    paragraphs: [
      { ku: 'Ava: Silav, Dara! Tu çi dikî?', en: 'Ava: "Hello, Dara! What are you doing?"' },
      { ku: 'Dara: Silav, Ava! Ez li baxçê me. Ez ajelan dibînim.', en: 'Dara: "Hello, Ava! I am in our garden. I see animals."' },
      { ku: 'Ava: Baş e! Tu çend ajel dibînî?', en: 'Ava: "Good! How many animals do you see?"' },
      { ku: 'Dara: Ez du pisîk dibînim. Pisîk spî ne. Ez yek se dibînim. Se reş e.', en: 'Dara: "I see two cats. The cats are white. I see one dog. The dog is black."' },
      { ku: 'Ava: Baş e! Ez jî ajel hez dikim. Tu çend balinde dibînî?', en: 'Ava: "Good! I also like animals. How many birds do you see?"' },
      { ku: 'Dara: Ez sê balinde dibînim. Balinde şîn in. Balinde difirin.', en: 'Dara: "I see three birds. The birds are blue. The birds fly."' },
      { ku: 'Ava: Baş e! Em dikarin ajelan binêrin û hejmaran fêr bibin.', en: 'Ava: "Good! We can look at animals and learn numbers."' },
      { ku: 'Dara: Baş e! Ez ê ajelan bijmêrim. Yek, du, sê, çar, pênc.', en: 'Dara: "Good! I will count the animals. One, two, three, four, five."' },
      { ku: 'Ava: Baş e! Tu ajelan baş dizanî. Ez jî dixwazim ajelan fêr bibim.', en: 'Ava: "Good! You know animals well. I also want to learn animals."' },
      { ku: 'Dara: Baş e! Em dikarin bi hev re ajelan fêr bibin.', en: 'Dara: "Good! We can learn animals together."' },
    ],
  },
  {
    id: 'story-15',
    title: 'Hevpeyvîna Malê – House Conversation',
    summary: 'A conversation about objects in the house and their colors.',
    paragraphs: [
      { ku: 'Berîvan: Silav, Rojda! Tu li ku yî?', en: 'Berîvan: "Hello, Rojda! Where are you?"' },
      { ku: 'Rojda: Silav, Berîvan! Ez li malê me. Ez li odeyê me.', en: 'Rojda: "Hello, Berîvan! I am in our house. I am in my room."' },
      { ku: 'Berîvan: Baş e! Di odeyê de çi heye?', en: 'Berîvan: "Good! What is in the room?"' },
      { ku: 'Rojda: Di odeyê de mase heye. Mase sor e. Di odeyê de kursî heye. Kursî kesk e.', en: 'Rojda: "In the room there is a table. The table is red. In the room there is a chair. The chair is green."' },
      { ku: 'Berîvan: Baş e! Tu çend pencere dibînî?', en: 'Berîvan: "Good! How many windows do you see?"' },
      { ku: 'Rojda: Ez du pencereyan dibînim. Pencere şîn in. Pencere xweşik in.', en: 'Rojda: "I see two windows. The windows are blue. The windows are nice."' },
      { ku: 'Berîvan: Baş e! Di odeyê de nivîn heye?', en: 'Berîvan: "Good! Is there a bed in the room?"' },
      { ku: 'Rojda: Erê, nivînek heye. Nivîn spî ye.', en: 'Rojda: "Yes, there is a bed. The bed is white."' },
      { ku: 'Berîvan: Baş e! Odeya te xweş e. Ez jî dixwazim odeya xwe bibînim.', en: 'Berîvan: "Good! Your room is nice. I also want to see my room."' },
      { ku: 'Rojda: Baş e! Em dikarin bi hev re odeyan bibînin.', en: 'Rojda: "Good! We can see the rooms together."' },
    ],
  },
]

// Extract vocabulary from a story
function extractVocabulary(story: Story): Array<{ word: string; translation: string }> {
  const vocabSet = new Set<string>()
  const vocab: Array<{ word: string; translation: string }> = []
  
  story.paragraphs.forEach(para => {
    // Split Kurdish text into words (simple approach)
    const words = para.ku
      .replace(/[.,!?";:]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2) // Filter out very short words
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().trim()
      if (cleanWord && vocabularyDict[cleanWord] && !vocabSet.has(cleanWord)) {
        vocabSet.add(cleanWord)
        vocab.push({
          word: cleanWord,
          translation: vocabularyDict[cleanWord]
        })
      }
    })
  })
  
  return vocab.sort((a, b) => a.word.localeCompare(b.word))
}

// Progress tracking functions
function getStoriesProgress(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const saved = localStorage.getItem('stories-read')
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

function saveStoriesProgress(readStories: Set<string>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('stories-read', JSON.stringify(Array.from(readStories)))
  } catch {}
}

export default function StoriesPage() {
  const [activeId, setActiveId] = useState<string | null>(stories[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showEnglish, setShowEnglish] = useState(false)
  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string; x: number; y: number } | null>(null)
  const [readStories, setReadStories] = useState<Set<string>>(getStoriesProgress())
  const [showVocabulary, setShowVocabulary] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const browserTTSRef = useRef<SpeechSynthesisUtterance | null>(null)
  const translationTooltipRef = useRef<HTMLDivElement>(null)

  const active = stories.find(s => s.id === activeId) || stories[0]
  const activeVocab = extractVocabulary(active)
  const isRead = readStories.has(activeId || '')

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Close translation tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (translationTooltipRef.current && !translationTooltipRef.current.contains(event.target as Node)) {
        setSelectedWord(null)
      }
    }

    if (selectedWord) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedWord])

  // Don't automatically mark stories as read - user must manually mark them

  // Handle word click for highlighting
  const handleWordClick = (word: string, event: React.MouseEvent) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?";:]/g, '').trim()
    const translation = vocabularyDict[cleanWord]
    
    if (translation) {
      setSelectedWord({
        word: cleanWord,
        translation,
        x: event.clientX,
        y: event.clientY
      })
    }
  }

  // Extract speech content from conversation format (remove name and quotes)
  const extractSpeechContent = (text: string): string => {
    // Check if it's a conversation format (has ":")
    if (text.includes(':')) {
      // Extract content after the colon
      const afterColon = text.split(':').slice(1).join(':').trim()
      // Remove quotes if present
      return afterColon.replace(/^["']|["']$/g, '').trim()
    }
    // For non-conversation text, remove quotes and clean
    return text.replace(/^["']|["']$/g, '').trim()
  }

  // Text-to-speech for Kurdish paragraphs using Kurdish TTS API (kurdishtts.com)
  const playKurdishAudio = async (text: string, paragraphIndex: number) => {
    // Stop any current speech
    stopSpeaking()
    
    // Extract speech content (no names, no quotes)
    let cleanText = extractSpeechContent(text)
    
    if (!cleanText) return
    
    setIsPlaying(true)
    setCurrentParagraphIndex(paragraphIndex)
    
    try {
      // Priority 1: Try local MP3 file first (downloaded audio)
      const filename = getAudioFilename(cleanText)
      // Try stories folder first, then fallback to root for backwards compatibility
      const mp3Paths = [
        `/audio/kurdish-tts-mp3/stories/${filename}.mp3`,
        `/audio/kurdish-tts-mp3/${filename}.mp3`
      ]
      
      for (const mp3Path of mp3Paths) {
        try {
          const audio = new Audio(mp3Path)
          
          // Test if file exists by trying to load it
          await new Promise((resolve, reject) => {
            audio.onloadeddata = resolve
            audio.onerror = reject
            audio.load()
          })
          
          // File exists and loaded successfully
          setAudioRef(audio)
          audio.onended = () => {
            setIsPlaying(false)
            setCurrentParagraphIndex(null)
            setAudioRef(null)
          }
          
          audio.onerror = () => {
            setIsPlaying(false)
            setCurrentParagraphIndex(null)
            setAudioRef(null)
          }
          
          await audio.play()
          return
        } catch (localError) {
          // File doesn't exist in this location, try next path
          continue
        }
      }
      // If neither path worked, continue to cache/API
      
      const cacheKey = cleanText.toLowerCase()
      
      // Priority 2: Check cache - INSTANT playback if cached!
      if (kurdishTTSCache.has(cacheKey)) {
        const audioUrl = kurdishTTSCache.get(cacheKey)!
        const audio = new Audio(audioUrl)
        setAudioRef(audio)
        
        audio.onended = () => {
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
          setAudioRef(null)
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
          setAudioRef(null)
        }
        
        await audio.play()
        return
      }
      
      // Priority 3: Not cached - fetch from Kurdish TTS API
      const response = await fetch('https://www.kurdishtts.com/api/tts-proxy', {
        method: 'POST',
        headers: {
          'x-api-key': '399af84a0973b4cc4a8dec8c69ee48c06d3ac172',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: cleanText,
          speaker_id: 'kurmanji_12'
        })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Cache for next time
        kurdishTTSCache.set(cacheKey, audioUrl)
        
        const audio = new Audio(audioUrl)
        setAudioRef(audio)
        console.log(`✅ TTS ready`)
        
        audio.onended = () => {
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
          setAudioRef(null)
        }
        
        audio.onerror = (e) => {
          console.error('Audio playback error:', e)
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
          setAudioRef(null)
        }
        
        await audio.play()
      } else if (response.status === 503) {
        console.log(`⚠️ TTS service temporarily unavailable, using browser fallback...`)
        // Fallback to browser TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanText)
          utterance.lang = 'ku'
          utterance.rate = 0.7
          utterance.pitch = 1.0
          utterance.volume = 0.8
          
          utterance.onend = () => {
            setIsPlaying(false)
            setCurrentParagraphIndex(null)
          }
          
          utterance.onerror = () => {
            setIsPlaying(false)
            setCurrentParagraphIndex(null)
          }
          
          window.speechSynthesis.speak(utterance)
        } else {
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
        }
      } else {
        console.error(`TTS API error: ${response.status}`)
        setIsPlaying(false)
        setCurrentParagraphIndex(null)
      }
    } catch (error) {
      // Fallback to browser TTS on error
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.lang = 'ku'
        utterance.rate = 0.7
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        utterance.onend = () => {
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
        }
        
        utterance.onerror = () => {
          setIsPlaying(false)
          setCurrentParagraphIndex(null)
        }
        
        window.speechSynthesis.speak(utterance)
      } else {
        setIsPlaying(false)
        setCurrentParagraphIndex(null)
      }
    }
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    // Also stop browser TTS if it's running
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setCurrentParagraphIndex(null)
  }
  
  // Store audio reference for cleanup
  const setAudioRef = (audio: HTMLAudioElement | null) => {
    audioRef.current = audio
  }

  // List of known names in stories (to exclude from translations)
  const knownNames = new Set([
    'baran', 'dilan', 'dayik', 'rojin', 'hêvî', 'ava', 'dara'
  ])

  // Split text into words for highlighting
  const splitIntoWords = (text: string) => {
    const words: Array<{ text: string; isWord: boolean; isName?: boolean }> = []
    // Match words (including Kurdish characters) and punctuation separately
    const regex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]+|[^\s])/g
    let lastIndex = 0
    let match
    
    while ((match = regex.exec(text)) !== null) {
      // Add space before if needed
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index)
        words.push({ text: beforeText, isWord: false })
      }
      // Check if it's a word (contains letters) or punctuation
      const isWord = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]/.test(match[0])
      
      if (isWord) {
        const cleanWord = match[0].toLowerCase().replace(/[.,!?";:]/g, '').trim()
        // Check if it's a name: appears in known names list AND the previous text ends with colon
        const beforeWord = text.substring(0, match.index).trim()
        const isNameWord = knownNames.has(cleanWord) && beforeWord.endsWith(':')
        words.push({ text: match[0], isWord: true, isName: isNameWord })
      } else {
        words.push({ text: match[0], isWord: false })
      }
      
      lastIndex = regex.lastIndex
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      words.push({ text: text.substring(lastIndex), isWord: false })
    }
    
    return words
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream">
      <div className="flex">
        {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primaryBlue" />
                  Stories
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Story List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {stories.map((story, index) => {
                  const isRead = readStories.has(story.id)
                  return (
                    <motion.button
                      key={story.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => {
                        setActiveId(story.id)
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false)
                        }
                      }}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 relative ${
                        activeId === story.id
                          ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold mb-1 flex-1">{story.title}</div>
                        {isRead && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className={`text-sm ${
                        activeId === story.id ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        {story.summary}
                      </p>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Interactive Stories</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Story Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
            >
              {/* Story Header */}
              <div className="bg-gradient-to-r from-primaryBlue/10 to-supportLavender/10 p-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{active.title}</h2>
                    <p className="text-gray-600 text-sm sm:text-base">{active.summary}</p>
                  </div>
                  {isRead && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-semibold">Read</span>
                    </div>
                  )}
                </div>
                
                {/* Control Bar - Reading Modes, Vocabulary, Read Status */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-200">
                  {/* Reading Mode Toggle */}
                  <button
                    onClick={() => setShowEnglish(!showEnglish)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                      showEnglish 
                        ? 'bg-primaryBlue text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showEnglish ? (
                      <>
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold whitespace-nowrap">English On</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold whitespace-nowrap">English Off</span>
                      </>
                    )}
                  </button>
                  
                  {/* Vocabulary Toggle */}
                  <button
                    onClick={() => setShowVocabulary(!showVocabulary)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                      showVocabulary 
                        ? 'bg-supportLavender text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BookMarked className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold whitespace-nowrap">
                      {showVocabulary ? 'Hide' : 'Show'} Vocab ({activeVocab.length})
                    </span>
                  </button>
                  
                  {/* Mark as Read/Unread */}
                  <button
                    onClick={() => {
                      const newReadStories = new Set(readStories)
                      if (isRead) {
                        newReadStories.delete(activeId || '')
                      } else {
                        newReadStories.add(activeId || '')
                      }
                      setReadStories(newReadStories)
                      saveStoriesProgress(newReadStories)
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                      isRead 
                        ? 'bg-green-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isRead ? (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold whitespace-nowrap">Read</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold whitespace-nowrap">Mark Read</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Vocabulary Panel */}
              {showVocabulary && (
                <div className="bg-gradient-to-r from-primaryBlue/5 to-supportLavender/5 p-4 sm:p-6 border-b border-gray-200">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookMarked className="w-4 h-4 sm:w-5 sm:h-5 text-primaryBlue" />
                    Vocabulary ({activeVocab.length} words)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {activeVocab.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-lg border border-gray-200 hover:border-primaryBlue transition-colors"
                      >
                        <div className="font-semibold text-gray-800">{item.word}</div>
                        <div className="text-sm text-gray-600">{item.translation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Story Content - Two Column Layout */}
              <div className="grid md:grid-cols-2 divide-x divide-gray-200">
                {/* Left Column */}
                <div className="p-8 md:p-10 bg-white">
                  <div className="prose max-w-none font-serif leading-relaxed text-base sm:text-lg">
                    {active.paragraphs.slice(0, Math.ceil(active.paragraphs.length/2)).map((p, i) => {
                      const words = splitIntoWords(p.ku)
                      const paragraphIndex = i
                      return (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="mb-6"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed">
                              {words.map((item, idx) => {
                                if (!item.isWord) {
                                  return <span key={idx}>{item.text}</span>
                                }
                                // Skip names - don't make them clickable
                                if (item.isName) {
                                  return <span key={idx}>{item.text}</span>
                                }
                                const cleanWord = item.text.toLowerCase().replace(/[.,!?";:]/g, '').trim()
                                const hasTranslation = vocabularyDict[cleanWord]
                                return (
                                  <span
                                    key={idx}
                                    onClick={(e) => hasTranslation && handleWordClick(item.text, e)}
                                    className={hasTranslation ? 'cursor-pointer hover:bg-yellow-200 hover:underline transition-colors rounded px-1' : ''}
                                  >
                                    {item.text}
                                  </span>
                                )
                              })}
                            </span>
                            <button
                              onClick={() => {
                                if (isPlaying && currentParagraphIndex === paragraphIndex) {
                                  stopSpeaking()
                                } else {
                                  playKurdishAudio(p.ku, paragraphIndex)
                                }
                              }}
                              className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                                isPlaying && currentParagraphIndex === paragraphIndex
                                  ? 'bg-primaryBlue text-white shadow-md'
                                  : 'bg-primaryBlue/10 text-primaryBlue hover:bg-primaryBlue/20 hover:shadow-sm'
                              }`}
                              title="Play audio"
                            >
                              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                          {showEnglish && (
                            <span className="text-sm text-gray-500 italic mt-2 block">{p.en}</span>
                          )}
                        </motion.p>
                      )
                    })}
                  </div>
                </div>

                {/* Right Column */}
                <div className="p-8 md:p-10 bg-gradient-to-br from-backgroundCream/50 to-white">
                  <div className="prose max-w-none font-serif leading-relaxed text-base sm:text-lg">
                    {active.paragraphs.slice(Math.ceil(active.paragraphs.length/2)).map((p, i) => {
                      const words = splitIntoWords(p.ku)
                      const paragraphIndex = Math.ceil(active.paragraphs.length/2) + i
                      return (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="mb-6"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-base sm:text-lg md:text-xl text-gray-800 leading-relaxed">
                              {words.map((item, idx) => {
                                if (!item.isWord) {
                                  return <span key={idx}>{item.text}</span>
                                }
                                // Skip names - don't make them clickable
                                if (item.isName) {
                                  return <span key={idx}>{item.text}</span>
                                }
                                const cleanWord = item.text.toLowerCase().replace(/[.,!?";:]/g, '').trim()
                                const hasTranslation = vocabularyDict[cleanWord]
                                return (
                                  <span
                                    key={idx}
                                    onClick={(e) => hasTranslation && handleWordClick(item.text, e)}
                                    className={hasTranslation ? 'cursor-pointer hover:bg-yellow-200 hover:underline transition-colors rounded px-1' : ''}
                                  >
                                    {item.text}
                                  </span>
                                )
                              })}
                            </span>
                            <button
                              onClick={() => {
                                if (isPlaying && currentParagraphIndex === paragraphIndex) {
                                  stopSpeaking()
                                } else {
                                  playKurdishAudio(p.ku, paragraphIndex)
                                }
                              }}
                              className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                                isPlaying && currentParagraphIndex === paragraphIndex
                                  ? 'bg-primaryBlue text-white shadow-md'
                                  : 'bg-primaryBlue/10 text-primaryBlue hover:bg-primaryBlue/20 hover:shadow-sm'
                              }`}
                              title="Play audio"
                            >
                              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                          {showEnglish && (
                            <span className="text-sm text-gray-500 italic mt-2 block">{p.en}</span>
                          )}
                        </motion.p>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>

      {/* Word Translation Tooltip */}
      {selectedWord && (
        <div
          ref={translationTooltipRef}
          className="fixed bg-white border-2 border-primaryBlue rounded-lg shadow-xl p-4 z-50 max-w-xs"
          style={{
            left: `${selectedWord.x + 10}px`,
            top: `${selectedWord.y + 10}px`,
          }}
        >
          <div className="font-bold text-primaryBlue text-sm sm:text-base md:text-lg mb-2">{selectedWord.word}</div>
          <div className="text-gray-700 text-xs sm:text-sm">{selectedWord.translation}</div>
        </div>
      )}
    </div>
  )
}
