'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle, XCircle, Play, Volume2, 
  ArrowRight, Lock, Star, Trophy, Clock, Target,
  ArrowLeftRight, HelpCircle
} from 'lucide-react'
import { useProgress } from '../../../contexts/ProgressContext'
import AudioButton from '../../../components/lessons/AudioButton'
import { useLessonTracking } from '../../../hooks/useLessonTracking'

// Helper function to get audio filename for each pronoun
function getPronounAudioFile(ku: string): string {
  if (ku === "wê") return "we-her"
  if (ku === "we") return "we-your"
  if (ku === "hûn") return "hun"
  if (ku === "wî") return "wi"
  return ku.toLowerCase()
}

// Helper function to get audio filename for each letter
function getLetterAudioFile(glyph: string): string {
  const letterMap: Record<string, string> = {
    'A': 'a',
    'B': 'b',
    'C': 'c',
    'Ç': 'cedilla-c',
    'D': 'd',
    'E': 'e',
    'Ê': 'circumflex-e',
    'F': 'f',
    'G': 'g',
    'H': 'h',
    'I': 'i',
    'Î': 'circumflex-i',
    'J': 'j',
    'K': 'k',
    'L': 'l',
    'M': 'm',
    'N': 'n',
    'O': 'o',
    'P': 'p',
    'Q': 'q',
    'R': 'r',
    'S': 's',
    'Ş': 'cedilla-s',
    'T': 't',
    'U': 'u',
    'Û': 'circumflex-u',
    'V': 'v',
    'W': 'w',
    'X': 'x',
    'Y': 'y',
    'Z': 'z'
  };
  return letterMap[glyph] || glyph.toLowerCase();
}

const allLetters = [
  { glyph: "A", word: "av", meaning: "water" },
  { glyph: "B", word: "bav", meaning: "father" },
  { glyph: "C", word: "cîran", meaning: "neighbors" },
  { glyph: "Ç", word: "çav", meaning: "eyes" },
  { glyph: "D", word: "dest", meaning: "hand" },
  { glyph: "E", word: "ev", meaning: "this" },
  { glyph: "Ê", word: "êvar", meaning: "evening" },
  { glyph: "F", word: "fîl", meaning: "elephant" },
  { glyph: "G", word: "gur", meaning: "wolf" },
  { glyph: "H", word: "hesp", meaning: "horse" },
  { glyph: "I", word: "isal", meaning: "this year" },
  { glyph: "Î", word: "îro", meaning: "today" },
  { glyph: "J", word: "jin", meaning: "woman" },
  { glyph: "K", word: "kur", meaning: "son" },
  { glyph: "L", word: "ling", meaning: "leg" },
  { glyph: "M", word: "mal", meaning: "house" },
  { glyph: "N", word: "nav", meaning: "name" },
  { glyph: "O", word: "ode", meaning: "room" },
  { glyph: "P", word: "poz", meaning: "nose" },
  { glyph: "Q", word: "qel", meaning: "crow" },
  { glyph: "R", word: "roj", meaning: "sun" },
  { glyph: "S", word: "sor", meaning: "red" },
  { glyph: "Ş", word: "şêr", meaning: "lion" },
  { glyph: "T", word: "tili", meaning: "finger" },
  { glyph: "U", word: "usta", meaning: "master" },
  { glyph: "Û", word: "ûr", meaning: "fire" },
  { glyph: "V", word: "vexwarin", meaning: "to drink" },
  { glyph: "W", word: "welat", meaning: "country" },
  { glyph: "X", word: "xwişk", meaning: "sister" },
  { glyph: "Y", word: "yek", meaning: "one" },
  { glyph: "Z", word: "ziman", meaning: "tongue" },
]

const personalPronouns = [
  { ku: "ez", en: "I", example: "Ez xwendekar im", exampleEn: "I am a student" },
  { ku: "tu", en: "you (singular)", example: "Tu çi dikî?", exampleEn: "What are you doing?" },
  { ku: "ew", en: "he/she/it", example: "Ew xwendekar e", exampleEn: "He/She is a student" },
  { ku: "em", en: "we", example: "Em xwendekar in", exampleEn: "We are students" },
  { ku: "hûn", en: "you (plural/formal)", example: "Hûn çi dikin?", exampleEn: "What are you doing?" },
  { ku: "ew", en: "they", example: "Ew xwendekar in", exampleEn: "They are students" },
]

// Helper function to get audio filename for question words
function getQuestionAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "kî": "ki",
    "çi": "ci",
    "ku": "ku",
    "kengî": "kengi",
    "çima": "cima",
    "çawa": "cawa",
    "çend": "cend",
    "kîjan": "kijan",
  };
  return mapping[ku] || ku.toLowerCase();
}

function getCommonQuestionAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "Ew kî ye?": "ew-ki-ye",
    "Navê te çi ye?": "nave-te-ci-ye",
    "Tu çend salî yî?": "tu-cend-sali-yi",
    "Tu li ku dijî?": "tu-li-ku-diji",
    "Tu çi kar dikî?": "tu-ci-kar-diki",
    "Tu çi dixwî?": "tu-ci-dixwi",
    "Tu çi dixwînî?": "tu-ci-dixwini",
    "Tu çawa yî?": "tu-cawa-yi",
    "Tu kengî hatî?": "tu-kengi-hati",
    "Tu kengî diçî?": "tu-kengi-dici",
    "Tu çima li vir yî?": "tu-cima-li-vir-yi",
    "Tu kîjan pirtûk dixwînî?": "tu-kijan-pirtuk-dixwini",
  };
  return mapping[ku] || ku.toLowerCase().replace(/[îÎ]/g, 'i').replace(/[êÊ]/g, 'e').replace(/[ûÛ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[çÇ]/g, 'c').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

const questionWords = [
  { ku: "kî", en: "who", example: "Ew kî ye?", exampleEn: "Who is that?" },
  { ku: "çi", en: "what", example: "Tu çi dikî?", exampleEn: "What are you doing?" },
  { ku: "ku", en: "where", example: "Tu li ku yî?", exampleEn: "Where are you?" },
  { ku: "kengî", en: "when", example: "Ew kengî tê?", exampleEn: "When is he/she coming?" },
  { ku: "çima", en: "why", example: "Tu çima li malê yî?", exampleEn: "Why are you at home?" },
  { ku: "çawa", en: "how", example: "Tu çawa yî?", exampleEn: "How are you?" },
  { ku: "çend", en: "how many/much", example: "Tu çend salî yî?", exampleEn: "How old are you?" },
  { ku: "kîjan", en: "which", example: "Tu kîjan pirtûk dixwînî?", exampleEn: "Which book are you reading?" }
]

const commonQuestions = [
  { ku: "Ew kî ye?", en: "Who is that?" },
  { ku: "Navê te çi ye?", en: "What is your name?" },
  { ku: "Tu çend salî yî?", en: "How old are you?" },
  { ku: "Tu li ku dijî?", en: "Where do you live?" },
  { ku: "Tu çi kar dikî?", en: "What do you do for work?" },
  { ku: "Tu çi dixwî?", en: "What are you eating?" },
  { ku: "Tu çi dixwînî?", en: "What are you reading?" },
  { ku: "Tu çawa yî?", en: "How are you?" },
  { ku: "Tu kengî hatî?", en: "When did you come?" },
  { ku: "Tu kengî diçî?", en: "When are you going?" },
  { ku: "Tu çima li vir yî?", en: "Why are you here?" },
  { ku: "Tu kîjan pirtûk dixwînî?", en: "Which book are you reading?" }
]

// Helper function for numbers
function getNumberAudioFile(ku: string): string {
  return ku.toLowerCase().replace(/[îÎ]/g, 'i').replace(/[êÊ]/g, 'e').replace(/[ûÛ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[çÇ]/g, 'c').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

// Helper function for grammar audio
function getGrammarAudioFile(text: string): string {
  return text.toLowerCase().replace(/[îÎ]/g, 'i').replace(/[êÊ]/g, 'e').replace(/[ûÛ]/g, 'u').replace(/[şŞ]/g, 's').replace(/[çÇ]/g, 'c').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

const basicNumbers: Record<number, { ku: string; en: string }> = {
  1: { ku: "yek", en: "one" },
  2: { ku: "du", en: "two" },
  3: { ku: "sê", en: "three" },
  4: { ku: "çar", en: "four" },
  5: { ku: "pênc", en: "five" },
  6: { ku: "şeş", en: "six" },
  7: { ku: "heft", en: "seven" },
  8: { ku: "heşt", en: "eight" },
  9: { ku: "neh", en: "nine" },
  10: { ku: "deh", en: "ten" },
  11: { ku: "yazde", en: "eleven" },
  12: { ku: "dazde", en: "twelve" },
  13: { ku: "sêzde", en: "thirteen" },
  14: { ku: "çarde", en: "fourteen" },
  15: { ku: "pazde", en: "fifteen" },
  16: { ku: "şazde", en: "sixteen" },
  17: { ku: "hevde", en: "seventeen" },
  18: { ku: "hejde", en: "eighteen" },
  19: { ku: "nozde", en: "nineteen" },
}

const keyNumbers: Record<number, { ku: string; en: string }> = {
  20: { ku: "bîst", en: "twenty" },
  30: { ku: "sî", en: "thirty" },
  40: { ku: "çil", en: "forty" },
  50: { ku: "pêncî", en: "fifty" },
  60: { ku: "şêst", en: "sixty" },
  70: { ku: "heftê", en: "seventy" },
  80: { ku: "heştê", en: "eighty" },
  90: { ku: "not", en: "ninety" },
  100: { ku: "sed", en: "one hundred" },
}

// Lesson content data
const lessonData: Record<string, any> = {
  '1': {
    title: 'Kurdish Alphabet & Pronunciation',
    description: 'Learn all 31 letters of the Kurdish alphabet with proper pronunciation',
    icon: '🔤',
    sections: [
      {
        id: 'all-letters',
        title: 'All 31 Letters',
        content: 'Learn Kurdish letters with pronunciation and example words.',
        type: 'alphabet-grid'
      },
      {
        id: 'letter-comparison',
        title: 'Letter Comparison',
        content: 'Compare similar-looking letters with different sounds:',
        type: 'letter-comparison'
      },
      {
        id: 'pronunciation-tips',
        title: 'Pronunciation Tips for Special Characters',
        content: 'Learn how to pronounce special Kurdish characters:',
        type: 'pronunciation-tips'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'How many letters are in the Kurdish alphabet?',
          type: 'multiple-choice',
          options: ['28', '30', '31', '32'],
          correct: 2
        },
        {
          id: '2',
          question: 'What sound does "Ç" make?',
          type: 'multiple-choice',
          options: ['s', 'ch', 'sh', 'j'],
          correct: 1
        },
        {
          id: '3',
          question: 'What sound does "X" make?',
          type: 'multiple-choice',
          options: ['ks', 'kh (guttural)', 'z', 's'],
          correct: 1
        },
        {
          id: '4',
          question: 'How many vowels are in Kurdish?',
          type: 'multiple-choice',
          options: ['5', '6', '7', '8'],
          correct: 3
        },
        {
          id: '5',
          question: 'What does "mal" mean?',
          type: 'multiple-choice',
          options: ['bread', 'house', 'water', 'sun'],
          correct: 1
        }
      ]
    }
  },
  '2': {
    title: 'Pronouns (I, You, He/She)',
    description: 'Master personal pronouns and their usage in sentences',
    icon: '👤',
    sections: [
      {
        id: 'personal-pronouns',
        title: 'Personal Pronouns',
        content: 'Learn subject pronouns used in Kurdish sentences.',
        type: 'pronouns-list'
      },
      {
        id: 'usage-notes',
        title: 'Usage Notes',
        content: 'Important notes about how to use pronouns correctly.',
        type: 'usage-notes'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'What does "ez" mean?',
          type: 'multiple-choice',
          options: ['you', 'I', 'he/she', 'we'],
          correct: 1
        },
        {
          id: '2',
          question: 'What does "tu" mean?',
          type: 'multiple-choice',
          options: ['I', 'you (singular)', 'he/she', 'they'],
          correct: 1
        },
        {
          id: '3',
          question: 'What does "hûn" mean?',
          type: 'multiple-choice',
          options: ['I', 'you (singular)', 'you (plural/formal)', 'we'],
          correct: 2
        },
        {
          id: '4',
          question: 'What does "ew" mean?',
          type: 'multiple-choice',
          options: ['I', 'you', 'he/she/it or they', 'we'],
          correct: 2
        },
        {
          id: '5',
          question: 'What does "em" mean?',
          type: 'multiple-choice',
          options: ['I', 'you', 'he/she', 'we'],
          correct: 3
        }
      ]
    }
  },
  '3': {
    title: 'Question Words',
    description: 'Learn essential question words: who, what, where, when, why, how',
    icon: '❓',
    sections: [
      {
        id: 'question-words',
        title: 'Basic Question Words',
        content: 'Essential question words for asking and understanding questions in Kurdish.',
        type: 'question-words-list'
      },
      {
        id: 'common-questions',
        title: 'Common Questions',
        content: 'Learn common question phrases used in daily conversations.',
        type: 'common-questions-list'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'What does "kî" mean?',
          type: 'multiple-choice',
          options: ['what', 'who', 'where', 'when'],
          correct: 1
        },
        {
          id: '2',
          question: 'What does "çi" mean?',
          type: 'multiple-choice',
          options: ['who', 'what', 'where', 'why'],
          correct: 1
        },
        {
          id: '3',
          question: 'What does "ku" mean?',
          type: 'multiple-choice',
          options: ['who', 'what', 'where', 'how'],
          correct: 2
        },
        {
          id: '4',
          question: 'What does "kengî" mean?',
          type: 'multiple-choice',
          options: ['where', 'when', 'why', 'how'],
          correct: 1
        },
        {
          id: '5',
          question: 'What does "çawa" mean?',
          type: 'multiple-choice',
          options: ['what', 'where', 'why', 'how'],
          correct: 3
        }
      ]
    }
  },
  '4': {
    title: 'Kurdish Numbers',
    description: 'Master numbers from 1 to 100 with pronunciation and examples',
    icon: '🔢',
    sections: [
      {
        id: 'basic-numbers',
        title: 'Numbers 1-19',
        content: 'Learn basic numbers from one to nineteen.',
        type: 'numbers-basic'
      },
      {
        id: 'key-numbers',
        title: 'Key Numbers (20, 30, 40...)',
        content: 'Learn key numbers: 20, 30, 40, 50, 60, 70, 80, 90, 100.',
        type: 'numbers-key'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'What is "yek" in English?',
          type: 'multiple-choice',
          options: ['two', 'one', 'three', 'four'],
          correct: 1
        },
        {
          id: '2',
          question: 'What is "pênc" in English?',
          type: 'multiple-choice',
          options: ['four', 'five', 'six', 'seven'],
          correct: 1
        },
        {
          id: '3',
          question: 'What is "bîst" in English?',
          type: 'multiple-choice',
          options: ['ten', 'twenty', 'thirty', 'forty'],
          correct: 1
        },
        {
          id: '4',
          question: 'What is "sed" in English?',
          type: 'multiple-choice',
          options: ['ninety', 'one hundred', 'two hundred', 'fifty'],
          correct: 1
        },
        {
          id: '5',
          question: 'How do you say "12" in Kurdish?',
          type: 'multiple-choice',
          options: ['yazde', 'dazde', 'sêzde', 'çarde'],
          correct: 1
        }
      ]
    }
  },
  '5': {
    title: 'Grammar: Sentence Structure & Pronouns',
    description: 'Learn basic sentence structure and pronoun usage in Kurdish',
    icon: '📝',
    sections: [
      {
        id: 'sentence-structure',
        title: 'Basic Sentence Structure',
        content: 'Learn the fundamental word order and structure in Kurdish.',
        type: 'grammar-sentence-structure'
      },
      {
        id: 'pronoun-usage',
        title: 'Pronoun Usage in Sentences',
        content: 'How pronouns work in sentences with examples.',
        type: 'grammar-pronouns'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'What is the typical word order in Kurdish?',
          type: 'multiple-choice',
          options: ['SVO (Subject-Verb-Object)', 'SOV (Subject-Object-Verb)', 'VSO (Verb-Subject-Object)', 'OVS (Object-Verb-Subject)'],
          correct: 1
        },
        {
          id: '2',
          question: 'Where do verbs typically appear in Kurdish sentences?',
          type: 'multiple-choice',
          options: ['At the beginning', 'In the middle', 'At the end', 'After the subject'],
          correct: 2
        },
        {
          id: '3',
          question: 'Which sentence is correct?',
          type: 'multiple-choice',
          options: ['Ez nan dixwim', 'Nan ez dixwim', 'Dixwim ez nan', 'Ez dixwim nan'],
          correct: 0
        }
      ]
    }
  },
  '6': {
    title: 'Grammar: Verbs & Conjugation',
    description: 'Master verb conjugation in present and past tense',
    icon: '🔄',
    sections: [
      {
        id: 'present-tense',
        title: 'Present Tense Verbs',
        content: 'Learn how verbs change based on subjects in present tense.',
        type: 'grammar-present-tense'
      },
      {
        id: 'past-tense',
        title: 'Past Tense Verbs',
        content: 'Learn how to express actions that happened before.',
        type: 'grammar-past-tense'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'How do you say "I eat" in Kurdish?',
          type: 'multiple-choice',
          options: ['ez dixwim', 'tu dixwî', 'ew dixwe', 'em dixwin'],
          correct: 0
        },
        {
          id: '2',
          question: 'How do you say "I went" in Kurdish?',
          type: 'multiple-choice',
          options: ['ez diçim', 'ez çûm', 'ez hatim', 'ez kirim'],
          correct: 1
        }
      ]
    }
  },
  '7': {
    title: 'Grammar: Negation & Articles',
    description: 'Learn how to form negative sentences and use articles',
    icon: '❌',
    sections: [
      {
        id: 'negation',
        title: 'Negation',
        content: 'How to make negative sentences.',
        type: 'grammar-negation'
      },
      {
        id: 'articles',
        title: 'Articles and Plural Formation',
        content: 'Understanding definite articles and making nouns plural.',
        type: 'grammar-articles'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'How do you say "I don\'t eat" in Kurdish?',
          type: 'multiple-choice',
          options: ['ez naxwim', 'ez dixwim', 'ez xwarim', 'ez nexwarim'],
          correct: 0
        },
        {
          id: '2',
          question: 'How do you make "mal" (house) plural?',
          type: 'multiple-choice',
          options: ['mals', 'malan', 'malên', 'malên'],
          correct: 1
        }
      ]
    }
  },
  '8': {
    title: 'Grammar: Adjectives & Prepositions',
    description: 'Master adjectives, colors, and prepositions in Kurdish',
    icon: '📍',
    sections: [
      {
        id: 'adjectives',
        title: 'Adjectives & Colors',
        content: 'How to describe things and use colors.',
        type: 'grammar-adjectives'
      },
      {
        id: 'prepositions',
        title: 'Prepositions',
        content: 'Common prepositions for location and direction.',
        type: 'grammar-prepositions'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'Where do adjectives typically appear in Kurdish?',
          type: 'multiple-choice',
          options: ['Before the noun', 'After the noun', 'At the beginning', 'At the end'],
          correct: 1
        },
        {
          id: '2',
          question: 'How do you say "at home" in Kurdish?',
          type: 'multiple-choice',
          options: ['li malê', 'bi malê', 'ji malê', 'bo malê'],
          correct: 0
        }
      ]
    }
  },
  '9': {
    title: 'Common Verbs',
    description: 'Learn essential action words for daily conversations',
    icon: '🏃',
    sections: [
      {
        id: 'verbs-list',
        title: 'Common Verbs',
        content: 'Essential action words for daily conversations and activities in Kurdish.',
        type: 'verbs-list'
      },
      {
        id: 'verb-conjugations',
        title: 'Verb Conjugations',
        content: 'Learn how to conjugate common verbs.',
        type: 'verbs-conjugations'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'What does "kirin" mean?',
          type: 'multiple-choice',
          options: ['to go', 'to do/make', 'to eat', 'to come'],
          correct: 1
        },
        {
          id: '2',
          question: 'What does "çûn" mean?',
          type: 'multiple-choice',
          options: ['to go', 'to come', 'to see', 'to do'],
          correct: 0
        }
      ]
    }
  },
  '10': {
    title: 'Daily Conversations',
    description: 'Practice essential greetings and everyday conversations',
    icon: '💬',
    sections: [
      {
        id: 'greetings',
        title: 'Greetings & Small Talk',
        content: 'Basic greetings and polite conversation.',
        type: 'conversations-greetings'
      },
      {
        id: 'common-phrases',
        title: 'Common Phrases',
        content: 'Essential phrases for everyday situations.',
        type: 'conversations-phrases'
      }
    ],
    quiz: {
      questions: [
        {
          id: '1',
          question: 'How do you say "Hello" in Kurdish?',
          type: 'multiple-choice',
          options: ['Slav', 'Çav', 'Roj baş', 'Baş e'],
          correct: 0
        },
        {
          id: '2',
          question: 'How do you say "Thank you" in Kurdish?',
          type: 'multiple-choice',
          options: ['Spas', 'Baş e', 'Çav', 'Slav'],
          correct: 0
        }
      ]
    }
  }
}

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  const lesson = lessonData[lessonId]
  const progress = getLessonProgress(lessonId)
  
  const [currentSection, setCurrentSection] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [startTime] = useState(Date.now())

  // Calculate content-aware requirements for each section
  const getSectionRequirements = (sectionType: string, sectionContent: any) => {
    // Base requirements by section type
    const baseRequirements: Record<string, { minTime: number; minInteractions: number; minUniqueInteractions: number }> = {
      'alphabet-grid': { minTime: 45, minInteractions: 5, minUniqueInteractions: 10 }, // Many letters
      'letter-comparison': { minTime: 30, minInteractions: 3, minUniqueInteractions: 3 },
      'pronunciation-tips': { minTime: 40, minInteractions: 4, minUniqueInteractions: 4 },
      'pronouns-list': { minTime: 30, minInteractions: 4, minUniqueInteractions: 4 },
      'usage-notes': { minTime: 20, minInteractions: 1, minUniqueInteractions: 1 },
      'question-words-list': { minTime: 35, minInteractions: 5, minUniqueInteractions: 6 },
      'common-questions-list': { minTime: 40, minInteractions: 4, minUniqueInteractions: 4 },
      'numbers-basic': { minTime: 40, minInteractions: 6, minUniqueInteractions: 10 },
      'numbers-key': { minTime: 30, minInteractions: 5, minUniqueInteractions: 7 },
      'text': { minTime: 15, minInteractions: 0, minUniqueInteractions: 0 }, // Simple text sections
      'grammar-sentence-structure': { minTime: 60, minInteractions: 3, minUniqueInteractions: 3 },
      'grammar-present-tense': { minTime: 60, minInteractions: 4, minUniqueInteractions: 4 },
      'grammar-past-tense': { minTime: 50, minInteractions: 3, minUniqueInteractions: 3 },
      'grammar-negation': { minTime: 40, minInteractions: 3, minUniqueInteractions: 3 },
      'grammar-articles': { minTime: 40, minInteractions: 3, minUniqueInteractions: 3 },
      'grammar-adjectives': { minTime: 35, minInteractions: 3, minUniqueInteractions: 3 },
      'grammar-prepositions': { minTime: 35, minInteractions: 3, minUniqueInteractions: 3 },
      'grammar-pronouns': { minTime: 30, minInteractions: 3, minUniqueInteractions: 3 },
      'verbs-list': { minTime: 50, minInteractions: 8, minUniqueInteractions: 10 },
      'verbs-conjugations': { minTime: 45, minInteractions: 5, minUniqueInteractions: 5 },
      'conversations-greetings': { minTime: 45, minInteractions: 6, minUniqueInteractions: 6 },
      'conversations-phrases': { minTime: 50, minInteractions: 8, minUniqueInteractions: 8 }
    }
    
    return baseRequirements[sectionType] || { minTime: 30, minInteractions: 3, minUniqueInteractions: 2 }
  }

  // Build requirements map for all sections
  const sectionRequirementsMap = lesson ? lesson.sections.reduce((acc, section) => {
    acc[section.id] = getSectionRequirements(section.type, section)
    return acc
  }, {} as Record<string, any>) : {}

  // Use lesson tracking hook with content-aware requirements
  const {
    startSectionTracking,
    stopSectionTracking,
    recordInteraction,
    getSectionProgress
  } = useLessonTracking({
    lessonId,
    totalSections: lesson?.sections.length || 0,
    sectionRequirements: sectionRequirementsMap
  })

  useEffect(() => {
    if (!lesson) {
      return
    }

    // Mark lesson as in progress
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(lessonId, 0, 'IN_PROGRESS')
    }
  }, [lesson, lessonId, progress.status, updateLessonProgress])

  // Start tracking when section changes
  useEffect(() => {
    if (!lesson) return
    
    const currentSectionId = lesson.sections[currentSection]?.id
    if (currentSectionId) {
      startSectionTracking(currentSectionId)
    }

    return () => {
      if (currentSectionId) {
        stopSectionTracking(currentSectionId)
      }
    }
  }, [currentSection, lesson, startSectionTracking, stopSectionTracking])

  // Handle audio button interaction with unique item tracking
  const handleAudioPlay = (itemId?: string) => {
    if (!lesson) return
    const currentSectionId = lesson.sections[currentSection]?.id
    if (currentSectionId) {
      // Use itemId if provided (e.g., letter, pronoun, number), otherwise generate one
      const uniqueId = itemId || `audio-${Date.now()}`
      recordInteraction(currentSectionId, uniqueId)
    }
  }

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (!lesson.quiz) return

    // Handle lessons with no quiz questions (placeholder lessons)
    if (!lesson.quiz.questions || lesson.quiz.questions.length === 0) {
      const timeSpent = Math.round((Date.now() - startTime) / 60000)
      updateLessonProgress(lessonId, 100, 'COMPLETED', 100, timeSpent)
      setQuizSubmitted(true)
      setQuizScore(100)
      return
    }

    let correct = 0
    lesson.quiz.questions.forEach((q: any, index: number) => {
      if (quizAnswers[q.id] === q.correct) {
        correct++
      }
    })

    const score = Math.round((correct / lesson.quiz.questions.length) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    // Calculate time spent
    const timeSpent = Math.round((Date.now() - startTime) / 60000) // minutes

    // Calculate progress based on section completion scores
    let totalCompletionScore = 0
    lesson.sections.forEach((section: any) => {
      const sectionProgress = getSectionProgress(section.id)
      totalCompletionScore += sectionProgress.completionScore || 0
    })
    
    // Average section completion (sections are 80% of progress, quiz is 20%)
    const sectionsAverage = lesson.sections.length > 0 ? totalCompletionScore / lesson.sections.length : 0
    const quizWeight = score >= 80 ? 100 : score // Quiz contributes 0-100 based on score
    const progressPercentage = Math.round((sectionsAverage * 0.8) + (quizWeight * 0.2))
    
    // If score is 80% or higher, complete the lesson
    if (score >= 80) {
      updateLessonProgress(lessonId, 100, 'COMPLETED', score, timeSpent)
    } else {
      // Still update progress but don't mark as completed
      updateLessonProgress(lessonId, progressPercentage, 'IN_PROGRESS', score, timeSpent)
    }
  }

  // Handle quiz answer selection
  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    if (quizSubmitted) return
    setQuizAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }

  // Check if current section can be completed (allow progression at 70% completion)
  const canCompleteCurrentSection = () => {
    if (!lesson) return false
    const currentSectionId = lesson.sections[currentSection]?.id
    if (!currentSectionId) return false
    
    const sectionProgress = getSectionProgress(currentSectionId)
    // Allow progression at 70% completion, but 100% is needed for full completion
    return sectionProgress.completionScore >= 70
  }

  // Navigate to next section
  const nextSection = () => {
    if (!lesson) return
    
    // Check if current section meets requirements - silently prevent if not
    if (!canCompleteCurrentSection()) {
      return
    }

    // Stop tracking current section
    const currentSectionId = lesson.sections[currentSection]?.id
    if (currentSectionId) {
      stopSectionTracking(currentSectionId)
    }

    if (currentSection < lesson.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // All sections done, show quiz
      setShowQuiz(true)
    }
  }

  // Navigate to previous section
  const prevSection = () => {
    if (showQuiz) {
      setShowQuiz(false)
      setCurrentSection(lesson.sections.length - 1)
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Lesson not found</p>
          <Link href="/lessons" className="text-primaryBlue hover:underline">
            Back to Lessons
          </Link>
        </div>
      </div>
    )
  }

  const currentSectionData = lesson.sections[currentSection]
  const currentSectionId = currentSectionData?.id
  const currentSectionProgress = currentSectionId ? getSectionProgress(currentSectionId) : { 
    timeSpent: 0, 
    interactions: 0, 
    uniqueInteractions: new Set<string>(),
    completionScore: 0,
    completed: false 
  }
  const canProceedToQuiz = currentSection === lesson.sections.length - 1 && canCompleteCurrentSection()
  const quizComplete = quizSubmitted && quizScore >= 80

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/lessons" 
            className="text-primaryBlue font-bold flex items-center gap-2 mb-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Lessons
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{lesson.icon}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{lesson.title}</h1>
                  <p className="text-gray-600">{lesson.description}</p>
                </div>
              </div>
            </div>
            {progress.status === 'COMPLETED' && (
              <div className="flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Completed</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {showQuiz ? 'Quiz' : `Section ${currentSection + 1} of ${lesson.sections.length}`}
              </span>
              <span className="text-sm text-gray-500">{progress.progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 rounded-full transition-all duration-300 bg-gradient-to-r from-primaryBlue to-supportLavender"
                style={{ width: `${Math.max(progress.progress, 0)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        {!showQuiz ? (
          <div className="max-w-6xl mx-auto">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primaryBlue/20 to-supportLavender/20 rounded-2xl flex items-center justify-center">
                  {currentSectionProgress.completed ? (
                    <CheckCircle className="w-6 h-6 text-brand-green" />
                  ) : (
                    <Target className="w-6 h-6 text-primaryBlue" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{currentSectionData.title}</h2>
              </div>

              <p className="text-gray-700 mb-6 text-center">{currentSectionData.content}</p>

              {currentSectionData.type === 'alphabet-grid' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {allLetters.map((l) => (
                      <motion.div
                        key={l.glyph}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card p-5"
                      >
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-kurdish-red">{l.glyph}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <AudioButton
                            kurdishText={l.glyph.toLowerCase()}
                            phoneticText={l.glyph.toUpperCase()}
                            label="Listen"
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/alphabet/${getLetterAudioFile(l.glyph)}.mp3`}
                            onPlay={() => handleAudioPlay(`letter-${l.glyph}`)}
                          />
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-800">{l.word}</div>
                            <div className="text-xs text-gray-500">{l.meaning}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentSectionData.type === 'letter-comparison' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-8 card p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-kurdish-red" />
                    Letter Comparison
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">Compare similar-looking letters with different sounds:</p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* I vs Î */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-kurdish-red mb-2">I</div>
                          <div className="text-xs text-gray-500 mb-1">Short sound</div>
                          <AudioButton
                            kurdishText="i"
                            phoneticText="I"
                            label="Listen"
                            size="small"
                            audioFile="/audio/kurdish-tts-mp3/alphabet/i.mp3"
                            onPlay={() => handleAudioPlay('letter-I')}
                          />
                          <div className="text-sm font-medium text-gray-800 mt-2">isal</div>
                          <div className="text-xs text-gray-500">this year</div>
                        </div>
                        <div className="text-2xl text-gray-400">vs</div>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-kurdish-red mb-2">Î</div>
                          <div className="text-xs text-gray-500 mb-1">Long sound</div>
                          <AudioButton
                            kurdishText="î"
                            phoneticText="Î"
                            label="Listen"
                            size="small"
                            audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-i.mp3"
                            onPlay={() => handleAudioPlay('letter-Î')}
                          />
                          <div className="text-sm font-medium text-gray-800 mt-2">îro</div>
                          <div className="text-xs text-gray-500">today</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                        <strong>Tip:</strong> I is short like "it", Î is long like "ee" in "see"
                      </div>
                    </div>

                    {/* U vs Û */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-purple-50 to-white">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-kurdish-red mb-2">U</div>
                          <div className="text-xs text-gray-500 mb-1">Short sound</div>
                          <AudioButton
                            kurdishText="u"
                            phoneticText="U"
                            label="Listen"
                            size="small"
                            audioFile="/audio/kurdish-tts-mp3/alphabet/u.mp3"
                            onPlay={() => handleAudioPlay('letter-U')}
                          />
                          <div className="text-sm font-medium text-gray-800 mt-2">usta</div>
                          <div className="text-xs text-gray-500">master</div>
                        </div>
                        <div className="text-2xl text-gray-400">vs</div>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-kurdish-red mb-2">Û</div>
                          <div className="text-xs text-gray-500 mb-1">Long sound</div>
                          <AudioButton
                            kurdishText="û"
                            phoneticText="Û"
                            label="Listen"
                            size="small"
                            audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-u.mp3"
                            onPlay={() => handleAudioPlay('letter-Û')}
                          />
                          <div className="text-sm font-medium text-gray-800 mt-2">ûr</div>
                          <div className="text-xs text-gray-500">fire</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                        <strong>Tip:</strong> U is short like "put", Û is long like "oo" in "moon"
                      </div>
                    </div>

                    {/* S vs Ş */}
                    <div className="p-5 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-green-50 to-white">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-kurdish-red mb-2">S</div>
                          <div className="text-xs text-gray-500 mb-1">Regular S</div>
                          <AudioButton
                            kurdishText="s"
                            phoneticText="S"
                            label="Listen"
                            size="small"
                            audioFile="/audio/kurdish-tts-mp3/alphabet/s.mp3"
                            onPlay={() => handleAudioPlay('letter-S')}
                          />
                          <div className="text-sm font-medium text-gray-800 mt-2">sor</div>
                          <div className="text-xs text-gray-500">red</div>
                        </div>
                        <div className="text-2xl text-gray-400">vs</div>
                        <div className="text-center">
                          <div className="text-5xl font-bold text-kurdish-red mb-2">Ş</div>
                          <div className="text-xs text-gray-500 mb-1">Sh sound</div>
                          <AudioButton
                            kurdishText="ş"
                            phoneticText="Ş"
                            label="Listen"
                            size="small"
                            audioFile="/audio/kurdish-tts-mp3/alphabet/cedilla-s.mp3"
                            onPlay={() => handleAudioPlay('letter-Ş')}
                          />
                          <div className="text-sm font-medium text-gray-800 mt-2">şêr</div>
                          <div className="text-xs text-gray-500">lion</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 text-center bg-gray-100 rounded-lg p-2">
                        <strong>Tip:</strong> S is like "sun", Ş is like "sh" in "shoe"
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentSectionData.type === 'pronunciation-tips' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 card p-6"
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-kurdish-red" />
                    Pronunciation Tips for Special Characters
                  </h2>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Ç */}
                    <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-kurdish-red">Ç</div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">çav</div>
                          <div className="text-xs text-gray-500">eyes</div>
                        </div>
                        <AudioButton
                          kurdishText="ç"
                          phoneticText="Ç"
                          label="Listen"
                          size="small"
                          audioFile="/audio/kurdish-tts-mp3/alphabet/cedilla-c.mp3"
                          onPlay={() => handleAudioPlay('letter-Ç')}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Sound:</strong> Like "ch" in "chair" or "church"
                      </div>
                    </div>

                    {/* Ê */}
                    <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-kurdish-red">Ê</div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">êvar</div>
                          <div className="text-xs text-gray-500">evening</div>
                        </div>
                        <AudioButton
                          kurdishText="ê"
                          phoneticText="Ê"
                          label="Listen"
                          size="small"
                          audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-e.mp3"
                          onPlay={() => handleAudioPlay('letter-Ê')}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Sound:</strong> Long "e" like "ay" in "say" or "e" in "they"
                      </div>
                    </div>

                    {/* Î */}
                    <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-kurdish-red">Î</div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">îro</div>
                          <div className="text-xs text-gray-500">today</div>
                        </div>
                        <AudioButton
                          kurdishText="î"
                          phoneticText="Î"
                          label="Listen"
                          size="small"
                          audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-i.mp3"
                          onPlay={() => handleAudioPlay('letter-Î')}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Sound:</strong> Long "ee" like "ee" in "see" or "i" in "machine"
                      </div>
                    </div>

                    {/* Ş */}
                    <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-kurdish-red">Ş</div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">şêr</div>
                          <div className="text-xs text-gray-500">lion</div>
                        </div>
                        <AudioButton
                          kurdishText="ş"
                          phoneticText="Ş"
                          label="Listen"
                          size="small"
                          audioFile="/audio/kurdish-tts-mp3/alphabet/cedilla-s.mp3"
                          onPlay={() => handleAudioPlay('letter-Ş')}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Sound:</strong> Like "sh" in "shoe" or "sh" in "wish"
                      </div>
                    </div>

                    {/* Û */}
                    <div className="p-4 rounded-xl border bg-white hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl font-bold text-kurdish-red">Û</div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">ûr</div>
                          <div className="text-xs text-gray-500">fire</div>
                        </div>
                        <AudioButton
                          kurdishText="û"
                          phoneticText="Û"
                          label="Listen"
                          size="small"
                          audioFile="/audio/kurdish-tts-mp3/alphabet/circumflex-u.mp3"
                          onPlay={() => handleAudioPlay('letter-Û')}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>Sound:</strong> Long "oo" like "oo" in "moon" or "u" in "rule"
                      </div>
                    </div>
                  </div>
                </motion.div>
                )}

                {currentSectionData.type === 'pronouns-list' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {personalPronouns.map((pronoun, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="card p-5"
                        >
                          <div className="text-center mb-4">
                            <div className="text-2xl font-bold text-kurdish-red mb-2">
                              {pronoun.ku.charAt(0).toUpperCase() + pronoun.ku.slice(1)}
                            </div>
                            <div className="text-sm text-gray-600">{pronoun.en}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <AudioButton 
                              kurdishText={pronoun.ku} 
                              phoneticText={pronoun.en.toUpperCase()} 
                              label="Listen" 
                              size="medium"
                              audioFile={`/audio/kurdish-tts-mp3/pronouns/${getPronounAudioFile(pronoun.ku)}.mp3`}
                              onPlay={() => handleAudioPlay(`pronoun-${pronoun.ku}`)}
                            />
                            <div className="text-right">
                              <div className="text-sm text-gray-700 mb-1">{pronoun.example}</div>
                              <div className="text-xs text-gray-600">{pronoun.exampleEn}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSectionData.type === 'usage-notes' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 card p-6"
                  >
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Usage Notes</h3>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>• <strong>ez</strong> - Used for "I" in all contexts</p>
                      <p>• <strong>tu</strong> - Informal "you" for friends and family</p>
                      <p>• <strong>hûn</strong> - Formal "you" or plural "you"</p>
                      <p>• <strong>ew</strong> - Can mean "he", "she", "it", or "they" depending on context</p>
                      <p>• <strong>wî/wê</strong> - "wî" for masculine, "wê" for feminine (used with possessive)</p>
                    </div>
                  </motion.div>
                )}

                {currentSectionData.type === 'text' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-gray-700 text-lg">{currentSectionData.content}</p>
                  </div>
                )}

                {currentSectionData.type === 'list' && (
                  <div className="space-y-4">
                    {currentSectionData.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-bold text-2xl text-primaryBlue mb-1">{item.ku}</div>
                          <div className="text-gray-600 text-sm">{item.en}</div>
                          {item.example && (
                            <div className="text-gray-500 text-sm mt-1 italic">{item.example}</div>
                          )}
                        </div>
                        {item.audio !== false && (
                          <AudioButton kurdishText={item.ku} onPlay={() => handleAudioPlay(item.ku || `item-${index}`)} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {currentSectionData.type === 'practice' && (
                  <div className="space-y-4">
                    {currentSectionData.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-primaryBlue/5 to-supportLavender/5 rounded-xl border border-primaryBlue/20"
                      >
                        <div>
                          <div className="font-bold text-2xl text-primaryBlue mb-1">{item.ku}</div>
                          <div className="text-gray-600">{item.en}</div>
                        </div>
                        {item.audio && <AudioButton kurdishText={item.ku} onPlay={() => handleAudioPlay(item.ku || `item-${idx}`)} />}
                      </div>
                    ))}
                  </div>
                )}

                {currentSectionData.type === 'question-words-list' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {questionWords.map((word, index) => (
                        <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                          <div className="text-center mb-4">
                            <div className="text-2xl font-bold text-kurdish-red mb-2">{word.ku.charAt(0).toUpperCase() + word.ku.slice(1)}</div>
                            <div className="text-sm text-gray-600">{word.en}</div>
                          </div>
                          <div className="flex items-center justify-between">
                          <AudioButton 
                            kurdishText={word.ku} 
                            phoneticText={word.en.toUpperCase()} 
                            label="Listen" 
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/questions/${getQuestionAudioFile(word.ku)}.mp3`}
                            onPlay={() => handleAudioPlay(`question-${word.ku}`)}
                          />
                            <div className="text-right">
                              <div className="text-sm text-gray-700 mb-1">{word.example}</div>
                              <div className="text-xs text-gray-600">{word.exampleEn}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSectionData.type === 'common-questions-list' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      {commonQuestions.map((question, index) => (
                        <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-kurdish-red font-medium mb-2">{question.ku}</div>
                            <div className="text-gray-600 text-sm">{question.en}</div>
                          </div>
                          <AudioButton 
                            kurdishText={question.ku} 
                            phoneticText={question.en.toUpperCase()} 
                            label="Listen" 
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/questions/${getCommonQuestionAudioFile(question.ku)}.mp3`}
                            onPlay={() => handleAudioPlay(`common-question-${index}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSectionData.type === 'numbers-basic' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {Object.entries(basicNumbers).map(([num, data]) => (
                        <motion.div key={num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 text-center">
                          <div className="text-3xl font-bold text-kurdish-red mb-2">{num}</div>
                          <div className="text-lg font-semibold text-gray-800 mb-2">{data.ku}</div>
                          <div className="text-sm text-gray-600 mb-3">{data.en}</div>
                          <AudioButton 
                            kurdishText={data.ku} 
                            phoneticText={data.en.toUpperCase()} 
                            label="Listen" 
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/numbers/${getNumberAudioFile(data.ku)}.mp3`}
                            onPlay={() => handleAudioPlay(`number-${num}`)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentSectionData.type === 'numbers-key' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Object.entries(keyNumbers).map(([num, data]) => (
                        <motion.div key={num} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 text-center">
                          <div className="text-3xl font-bold text-kurdish-red mb-2">{num}</div>
                          <div className="text-lg font-semibold text-gray-800 mb-2">{data.ku}</div>
                          <div className="text-sm text-gray-600 mb-3">{data.en}</div>
                          <AudioButton 
                            kurdishText={data.ku} 
                            phoneticText={data.en.toUpperCase()} 
                            label="Listen" 
                            size="small"
                            audioFile={`/audio/kurdish-tts-mp3/numbers/${getNumberAudioFile(data.ku)}.mp3`}
                            onPlay={() => handleAudioPlay(`number-${num}`)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {(currentSectionData.type === 'grammar-sentence-structure' || 
                  currentSectionData.type === 'grammar-present-tense' || 
                  currentSectionData.type === 'grammar-past-tense' ||
                  currentSectionData.type === 'grammar-negation' ||
                  currentSectionData.type === 'grammar-articles' ||
                  currentSectionData.type === 'grammar-adjectives' ||
                  currentSectionData.type === 'grammar-prepositions' ||
                  currentSectionData.type === 'grammar-pronouns' ||
                  currentSectionData.type === 'verbs-list' ||
                  currentSectionData.type === 'verbs-conjugations' ||
                  currentSectionData.type === 'conversations-greetings' ||
                  currentSectionData.type === 'conversations-phrases') && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="card p-6"
                  >
                    <div className="text-center text-gray-600 py-8">
                      <p className="text-lg">This content section is being prepared. Please check back soon!</p>
                      <p className="text-sm mt-2">Lesson structure is in place and will be populated with full content.</p>
                    </div>
                  </motion.div>
                )}
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={prevSection}
                disabled={currentSection === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={nextSection}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-gradient-to-r from-primaryBlue to-supportLavender text-white hover:from-primaryBlue/90 hover:to-supportLavender/90 shadow-lg hover:shadow-xl transition-all"
              >
                {currentSection === lesson.sections.length - 1 ? 'Take Quiz' : 'Next Section'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Section */
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accentCoral/20 to-brand-orange/20 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-accentCoral" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Lesson Quiz</h2>
              </div>

              {lesson.quiz.questions && lesson.quiz.questions.length > 0 ? (
                <>
                  <p className="text-gray-600 mb-6">
                    Answer all questions correctly. You need at least 80% to complete this lesson.
                  </p>

                  <div className="space-y-6 mb-6">
                    {lesson.quiz.questions.map((q: any, index: number) => {
                  const isCorrect = quizAnswers[q.id] === q.correct
                  const isAnswered = quizAnswers[q.id] !== undefined
                  const showResult = quizSubmitted

                  return (
                    <div 
                      key={q.id}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        showResult
                          ? isCorrect
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-800">
                          {index + 1}. {q.question}
                        </h3>
                        {showResult && (
                          isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                          )
                        )}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((option: string, optIndex: number) => (
                          <button
                            key={optIndex}
                            onClick={() => handleQuizAnswer(q.id, optIndex)}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-4 rounded-xl font-medium transition-all ${
                              showResult && optIndex === q.correct
                                ? 'bg-green-200 border-2 border-green-400'
                                : showResult && quizAnswers[q.id] === optIndex && optIndex !== q.correct
                                ? 'bg-red-200 border-2 border-red-400'
                                : quizAnswers[q.id] === optIndex
                                ? 'bg-primaryBlue/20 border-2 border-primaryBlue'
                                : 'bg-white border-2 border-gray-200 hover:border-primaryBlue/50'
                            } ${quizSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <p className="text-gray-700 text-center">This lesson doesn't have a quiz yet. Content is coming soon!</p>
                </div>
              )}

              {quizSubmitted ? (
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-4 ${quizScore >= 80 ? 'text-brand-green' : 'text-accentCoral'}`}>
                    Score: {quizScore}%
                  </div>
                  {quizScore >= 80 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-brand-green to-supportMint rounded-2xl p-6 text-white mb-6"
                    >
                      <Trophy className="w-12 h-12 mx-auto mb-3" />
                      <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
                      <p className="mb-4">You've completed this lesson!</p>
                      <Link
                        href="/lessons"
                        className="inline-block bg-white text-brand-green px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back to Lessons
                      </Link>
                    </motion.div>
                  ) : (
                    <div className="bg-red-50 rounded-2xl p-6 mb-6">
                      <p className="text-red-700 mb-4">
                        You scored {quizScore}%. You need at least 80% to complete this lesson.
                      </p>
                      <button
                        onClick={() => {
                          setQuizSubmitted(false)
                          setQuizAnswers({})
                        }}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowQuiz(false)
                      setCurrentSection(lesson.sections.length - 1)
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Review Material
                  </button>

                  <button
                    onClick={handleQuizSubmit}
                    disabled={lesson.quiz.questions && lesson.quiz.questions.length > 0 && Object.keys(quizAnswers).length !== lesson.quiz.questions.length}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                      !lesson.quiz.questions || lesson.quiz.questions.length === 0 || Object.keys(quizAnswers).length === lesson.quiz.questions.length
                        ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white hover:from-primaryBlue/90 hover:to-supportLavender/90 shadow-lg hover:shadow-xl'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {lesson.quiz.questions && lesson.quiz.questions.length > 0 ? 'Submit Quiz' : 'Complete Lesson'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

