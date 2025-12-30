"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, BookOpen, CheckCircle, ChevronDown } from "lucide-react"
import AudioButton from "../../../../components/lessons/AudioButton"
import { useLessonTracking } from "../../../../hooks/useLessonTracking"

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

const quickTips = [
  "Kurdish uses Subject-Object-Verb word order - verbs come at the end",
  "Pronouns are important - learn Ez, Tu, Ew, Em, Hûn, Ewan",
  "Add '-ek' for 'a/an' and '-ê' for 'the'",
  "To make plurals, add '-an' or '-ên' to nouns",
  "Use 'na-' before verbs to make negative sentences"
]

const grammarSections = [
  {
    id: 'basic-sentence-structure-pronouns',
    title: 'Basic Sentence Structure & Pronouns',
    description: 'Learn word order and essential pronouns in Kurdish',
    icon: '📝',
    rules: [
      {
        title: 'Subject-Object-Verb (SOV) Order',
        description: 'Kurdish typically follows Subject-Object-Verb word order. The verb always comes at the end.',
        examples: [
          { ku: "Ez nan dixwim", en: "I eat bread", audio: true },
          { ku: "Ew sêv dixwe", en: "He/She eats an apple", audio: true },
          { ku: "Tu pirtûk dixwînî", en: "You read a book", audio: true },
          { ku: "Ez çavên te dibînim", en: "I see your eyes", audio: true }
        ]
      },
      {
        title: 'Personal Pronouns',
        description: 'Basic pronouns you need to know',
        examples: [
          { ku: "ez", en: "I", audio: true },
          { ku: "tu", en: "you", audio: true },
          { ku: "ew", en: "he/she", audio: true },
          { ku: "em", en: "we", audio: true },
          { ku: "hûn", en: "you (plural)", audio: true },
          { ku: "ewan", en: "they", audio: true }
        ]
      },
      {
        title: 'Pronouns in Sentences',
        description: 'How pronouns work in simple sentences',
        examples: [
          { ku: "Ez xwendekar im", en: "I am a student", audio: true },
          { ku: "Tu çawa yî?", en: "How are you?", audio: true },
          { ku: "Ew ji Kurdistanê ye", en: "He is from Kurdistan", audio: true },
          { ku: "Em li malê ne", en: "We are at home", audio: true }
        ]
      }
    ]
  },
  {
    id: 'articles-plurals',
    title: 'Articles & Plurals',
    description: 'Learn "a/an", "the", "this/that" and how to make plurals',
    icon: '📚',
    rules: [
      {
        title: 'Indefinite Article - "a/an" (-ek)',
        description: 'Add "-ek" to make nouns indefinite (a/an)',
        examples: [
          { ku: "pirtûkek", en: "a book", audio: true },
          { ku: "pisîkek", en: "a cat", audio: true },
          { ku: "malek", en: "a house", audio: true },
          { ku: "xwendekarek", en: "a student", audio: true }
        ]
      },
      {
        title: 'Definite Article - "the" (-ê)',
        description: 'Use "-ê" for definite nouns (equivalent to "the")',
        examples: [
          { ku: "malê", en: "the house", audio: true },
          { ku: "pirtûkê", en: "the book", audio: true },
          { ku: "pisîkê", en: "the cat", audio: true },
          { ku: "çayê", en: "the tea", audio: true }
        ]
      },
      {
        title: 'This and That (ev/ew)',
        description: 'Use "ev" for "this" and "ew" for "that"',
        examples: [
          { ku: "ev pirtûk", en: "this book", audio: true },
          { ku: "ew pisîk", en: "that cat", audio: true },
          { ku: "ev mal", en: "this house", audio: true },
          { ku: "ew av", en: "that water", audio: true }
        ]
      },
      {
        title: 'Making Plurals',
        description: 'Add "-an" or "-ên" to make nouns plural',
        examples: [
          { ku: "mal → malan", en: "house → houses", audio: false },
          { ku: "pirtûk → pirtûkên", en: "book → books", audio: false },
          { ku: "xwendekar → xwendekarên", en: "student → students", audio: false },
          { ku: "pisîk → pisîkan", en: "cat → cats", audio: false }
        ]
      }
    ]
  },
  {
    id: 'questions-negation',
    title: 'Questions & Negation',
    description: 'Learn how to ask questions and make negative sentences',
    icon: '❓',
    rules: [
      {
        title: 'Question Words',
        description: 'Essential question words you need to know',
        examples: [
          { ku: "kî", en: "who", audio: true },
          { ku: "çi", en: "what", audio: true },
          { ku: "kû", en: "where", audio: true },
          { ku: "kengî", en: "when", audio: true },
          { ku: "çima", en: "why", audio: true },
          { ku: "çawa", en: "how", audio: true }
        ]
      },
      {
        title: 'Asking Questions',
        description: 'Simple question examples',
        examples: [
          { ku: "Tu çawa yî?", en: "How are you?", audio: true },
          { ku: "Ev çi ye?", en: "What is this?", audio: true },
          { ku: "Tu kû yî?", en: "Where are you?", audio: true },
          { ku: "Tu çi dixwî?", en: "What do you eat?", audio: true },
          { ku: "Ew kengî hat?", en: "When did he come?", audio: true }
        ]
      },
      {
        title: 'Negative Sentences',
        description: 'How to say "no" or "not" - Add "na-" before verb or use "nîn"',
        examples: [
          { ku: "ez naxwim", en: "I don't eat", audio: true },
          { ku: "tu naxwî", en: "you don't eat", audio: true },
          { ku: "ew naxwe", en: "he/she doesn't eat", audio: true },
          { ku: "Ez xwendekar nînim", en: "I am not a student", audio: true },
          { ku: "Ew malê nîne", en: "He/She is not at home", audio: true }
        ]
      }
    ]
  }
]

// Process grammar sections to add audioFile paths
const grammarSectionsWithAudio = grammarSections.map(section => ({
  ...section,
  rules: section.rules.map(rule => ({
    ...rule,
    examples: rule.examples.map(example => {
      if (example.audio) {
        return {
          ...example,
          audioFile: `/audio/kurdish-tts-mp3/grammar/${getAudioFilename(example.ku)}.mp3`
        };
      }
      return example;
    })
  }))
}));

// Organize sections into tabs (simplified for beginners)
const grammarTabs = {
  section1: {
    id: 'section1',
    label: 'Structure & Pronouns',
    icon: '📝',
    sectionIds: ['basic-sentence-structure-pronouns']
  },
  section2: {
    id: 'section2',
    label: 'Articles & Plurals',
    icon: '📚',
    sectionIds: ['articles-plurals']
  },
  section3: {
    id: 'section3',
    label: 'Questions & Negation',
    icon: '❓',
    sectionIds: ['questions-negation']
  }
}

export default function GrammarPage({ params }: { params: { dialect: string } }) {
  const dialectLabel = params.dialect === 'kurmanji' ? 'Kurmanji' : 'Sorani'
  const [activeTab, setActiveTab] = useState<string>('section1')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic-sentence-structure-pronouns']))
  const lessonId = '2' // Basic Grammar lesson ID
  
  const {
    startSectionTracking,
    stopSectionTracking,
    recordInteraction,
    getSectionProgress
  } = useLessonTracking({
    lessonId,
    totalSections: grammarSections.length, // Will automatically include new sections
    minTimePerSection: 15, // 15 seconds minimum
    minInteractionsPerSection: 2 // at least 2 interactions (audio plays)
  })

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
        stopSectionTracking(sectionId)
      } else {
        newSet.add(sectionId)
        startSectionTracking(sectionId)
      }
      return newSet
    })
  }

  // Track when section is expanded
  useEffect(() => {
    expandedSections.forEach(sectionId => {
      startSectionTracking(sectionId)
    })
    return () => {
      expandedSections.forEach(sectionId => {
        stopSectionTracking(sectionId)
      })
    }
  }, [expandedSections, startSectionTracking, stopSectionTracking])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">
            Kurdish Grammar
          </h1>
          <div />
        </div>

        <p className="text-gray-700 mb-8 text-center max-w-3xl mx-auto">
          Learn Kurdish grammar fundamentals with audio pronunciation.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {Object.values(grammarTabs).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                // Auto-expand first section of new tab
                const firstSectionId = tab.sectionIds[0]
                if (firstSectionId) {
                  setExpandedSections(new Set([firstSectionId]))
                }
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Grammar Sections - Filtered by Active Tab */}
        <div className="space-y-4">
          {grammarSectionsWithAudio
            .filter(section => grammarTabs[activeTab as keyof typeof grammarTabs].sectionIds.includes(section.id))
            .map((section, sectionIndex) => {
            const isExpanded = expandedSections.has(section.id)
            
            return (
              <motion.div 
                key={section.id}
                initial={{opacity:0, y:20}} 
                animate={{opacity:1, y:0}}
                transition={{ delay: sectionIndex * 0.1 }}
                className="card overflow-hidden"
              >
                {/* Section Header - Clickable */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{section.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
                      <p className="text-gray-600">{section.description}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>

                {/* Section Content - Collapsible */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-6">
                        {section.rules.map((rule, ruleIndex) => (
                          <motion.div 
                            key={ruleIndex}
                            initial={{opacity:0, x:-10}} 
                            animate={{opacity:1, x:0}}
                            transition={{ delay: ruleIndex * 0.1 }}
                            className="border-l-4 border-purple-200 pl-4"
                          >
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-purple-600" />
                              {rule.title}
                            </h3>
                            <p className="text-gray-700 mb-4 text-sm">{rule.description}</p>
                            
                            <div className="space-y-4">
                              {rule.examples.map((example, exampleIndex) => (
                                <motion.div 
                                  key={exampleIndex}
                                  className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      {/* Main sentence with | divider */}
                                      <div className="flex items-center gap-4 mb-2">
                                        <div className="text-kurdish-red font-medium text-lg">{example.ku}</div>
                                        <div className="text-gray-400 text-xl">|</div>
                                        <div className="text-gray-600 text-lg">{example.en}</div>
                                      </div>
                                      
                                      {/* Gender label for nouns */}
                                      {example.gender && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {example.gender}
                                        </div>
                                      )}
                                    </div>
                                    {example.audio && (
                                      <AudioButton 
                                        kurdishText={example.ku} 
                                        phoneticText={example.en} 
                                        audioFile={example.audioFile}
                                        label="Play" 
                                        size="small"
                                        onPlay={() => recordInteraction(section.id)}
                                      />
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Tips Section */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.8 }}
          className="mt-8 card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gab-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Quick Grammar Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {quickTips.map((tip, index) => (
              <motion.div 
                key={index}
                initial={{opacity:0, x:10}} 
                animate={{opacity:1, x:0}}
                transition={{ delay: 0.9 + (index * 0.1) }}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-green-600 text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}