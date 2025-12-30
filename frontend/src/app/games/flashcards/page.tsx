"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, RotateCcw, CheckCircle, XCircle } from "lucide-react"

type Card = {
  english: string
  kurdish: string
  audio?: string
}

type Deck = {
  name: string
  description: string
  icon: string
  cards: Card[]
}

// Function to shuffle array randomly
const shuffleArray = <T extends unknown>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Individual category arrays for shuffling
const colorsCards: Card[] = [
  { english: "Red", kurdish: "sor" },
  { english: "Green", kurdish: "kesk" },
  { english: "Blue", kurdish: "şîn" },
  { english: "Yellow", kurdish: "zer" },
  { english: "Orange", kurdish: "porteqalî" },
  { english: "Purple", kurdish: "mor" },
  { english: "Silver", kurdish: "zîv" },
  { english: "Black", kurdish: "reş" },
  { english: "White", kurdish: "spî" },
  { english: "Gray", kurdish: "xwelî" },
  { english: "Gold", kurdish: "zêr" }
]

const animalsCards: Card[] = [
  { english: "Cat", kurdish: "pisîk" },
  { english: "Dog", kurdish: "se" },
  { english: "Bird", kurdish: "balinde" },
  { english: "Cow", kurdish: "çêlek" },
  { english: "Bull", kurdish: "ga" },
  { english: "Horse", kurdish: "hesp" },
  { english: "Fish", kurdish: "masî" },
  { english: "Lion", kurdish: "şêr" },
  { english: "Goat", kurdish: "bizin" },
  { english: "Sheep", kurdish: "pez" },
  { english: "Elephant", kurdish: "fîl" },
  { english: "Monkey", kurdish: "meymûn" },
  { english: "Wolf", kurdish: "gur" },
  { english: "Snake", kurdish: "mar" },
  { english: "Rabbit", kurdish: "kevroşk" },
  { english: "Chicken", kurdish: "mirîşk" },
  { english: "Rooster", kurdish: "dîk" },
  { english: "Tiger", kurdish: "piling" },
  { english: "Bear", kurdish: "hirç" },
  { english: "Fox", kurdish: "rovî" },
  { english: "Butterfly", kurdish: "perperok" },
  { english: "Mouse", kurdish: "mişk" },
  { english: "Duck", kurdish: "werdek" },
  { english: "Pig", kurdish: "beraz" },
  { english: "Donkey", kurdish: "ker" },
  { english: "Owl", kurdish: "kund" },
  { english: "Turkey", kurdish: "elok" },
  { english: "Hedgehog", kurdish: "jûjî" },
  { english: "Crow", kurdish: "qel" }
]

const foodCards: Card[] = [
  // Fruits
  { english: "Apple", kurdish: "sêv" },
  { english: "Orange", kurdish: "pirteqal" },
  { english: "Banana", kurdish: "mûz" },
  { english: "Mulberry", kurdish: "tû" },
  { english: "Pomegranate", kurdish: "hinar" },
  { english: "Peach", kurdish: "xox" },
  { english: "Fig", kurdish: "hêjîr" },
  { english: "Olive", kurdish: "zeytûn" },
  { english: "Grape", kurdish: "tirî" },
  { english: "Lemon", kurdish: "leymûn" },
  { english: "Watermelon", kurdish: "zebeş" },
  { english: "Peach", kurdish: "şeftalî" },
  // Vegetables
  { english: "Carrot", kurdish: "gizêr" },
  { english: "Potato", kurdish: "kartol" },
  { english: "Onion", kurdish: "pîvaz" },
  { english: "Garlic", kurdish: "sîr" },
  { english: "Tomato", kurdish: "bacansor" },
  { english: "Cucumber", kurdish: "xiyar" },
  { english: "Cabbage", kurdish: "kelem" },
  { english: "Spinach", kurdish: "îspenax" },
  { english: "Eggplant", kurdish: "bacanreş" },
  { english: "Pepper", kurdish: "îsot" },
  { english: "Mushroom", kurdish: "kivark" },
  { english: "Corn", kurdish: "garis" },
  // Proteins
  { english: "Fish", kurdish: "masî" },
  { english: "Egg", kurdish: "hêk" },
  { english: "Meat", kurdish: "goşt" },
  { english: "Chicken", kurdish: "mirîşk" },
  { english: "Lamb", kurdish: "berx" },
  { english: "Beans", kurdish: "nok" },
  { english: "Lentils", kurdish: "nîsk" },
  { english: "Turkey", kurdish: "elok" },
  { english: "Pistachios", kurdish: "fistîq" },
  { english: "Almonds", kurdish: "behîv" },
  // Dairy
  { english: "Milk", kurdish: "şîr" },
  { english: "Yogurt", kurdish: "mast" },
  { english: "Cheese", kurdish: "penîr" },
  { english: "Butter", kurdish: "rûn" },
  { english: "Cream", kurdish: "qeymax" },
  { english: "Yogurt drink", kurdish: "dew" },
  // Grains
  { english: "Bread", kurdish: "nan" },
  { english: "Rice", kurdish: "birinc" },
  { english: "Wheat", kurdish: "genim" },
  { english: "Barley", kurdish: "ceh" },
  { english: "Bulgur", kurdish: "bulgur" },
  { english: "Pasta", kurdish: "makarna" },
  { english: "Cake", kurdish: "kek" },
  { english: "Cookie", kurdish: "kurabiye" },
  // Drinks
  { english: "Coffee", kurdish: "qehwe" },
  { english: "Tea", kurdish: "çay" },
  { english: "Water", kurdish: "av" },
  { english: "Sherbet", kurdish: "şerbet" },
  { english: "Lemonade", kurdish: "limonata" }
]

const familyCards: Card[] = [
  { english: "Family", kurdish: "malbat" },
  { english: "Mother", kurdish: "dayik" },
  { english: "Father", kurdish: "bav" },
  { english: "Sister", kurdish: "xwişk" },
  { english: "Brother", kurdish: "bira" },
  { english: "Daughter", kurdish: "keç" },
  { english: "Son", kurdish: "kur" },
  { english: "Grandmother", kurdish: "dapîr" },
  { english: "Grandfather", kurdish: "bapîr" },
  { english: "Paternal uncle", kurdish: "apo" },
  { english: "Maternal uncle", kurdish: "xalo" },
  { english: "Paternal aunt", kurdish: "metê" },
  { english: "Maternal aunt", kurdish: "xaltî" },
  { english: "Parents", kurdish: "dewûbav" },
  { english: "Baby", kurdish: "zarok" },
  { english: "Cousin", kurdish: "pismam" },
  { english: "Uncle's daughter", kurdish: "dotmam" },
  { english: "Uncle's son", kurdish: "kurap" },
  { english: "Mother-in-law", kurdish: "xesû" },
  { english: "Father-in-law", kurdish: "xezûr" },
  { english: "Sister-in-law", kurdish: "jinbira" },
  { english: "Brother-in-law", kurdish: "tîbira" },
  { english: "Groom", kurdish: "zava" },
  { english: "Bride", kurdish: "bûk" }
]

const natureCards: Card[] = [
  // Trees
  { english: "Tree", kurdish: "dar" },
  { english: "Oak", kurdish: "berû" },
  { english: "Pine", kurdish: "sûs" },
  { english: "Palm", kurdish: "darê bejî" },
  { english: "Sycamore", kurdish: "darê çinar" },
  // Flowers
  { english: "Flower", kurdish: "gul" },
  { english: "Rose", kurdish: "gulên sor" },
  { english: "Sunflower", kurdish: "gulên rojê" },
  { english: "Lily", kurdish: "gulên sîrî" },
  { english: "Blossom", kurdish: "gulên çîçek" },
  // Landscapes
  { english: "Mountain", kurdish: "çiya" },
  { english: "Valley", kurdish: "newal" },
  { english: "Forest", kurdish: "daristan" },
  { english: "Spring", kurdish: "çavkanî" },
  { english: "Desert", kurdish: "çol" },
  { english: "Plain", kurdish: "deşt" },
  { english: "River", kurdish: "çem" },
  { english: "Lake", kurdish: "gol" },
  { english: "Sea", kurdish: "behr" },
  // Weather
  { english: "Rain", kurdish: "barîn" },
  { english: "Sun", kurdish: "roj" },
  { english: "Snow", kurdish: "berf" },
  { english: "Wind", kurdish: "ba" },
  { english: "Cloud", kurdish: "ewr" },
  { english: "Storm", kurdish: "bahoz" },
  { english: "Hail", kurdish: "zîpik" },
  // Plants
  { english: "Leaf", kurdish: "pel" },
  { english: "Root", kurdish: "kok" },
  { english: "Grass", kurdish: "gîha" },
  { english: "Seed", kurdish: "tohum" },
  { english: "Moss", kurdish: "giyayê çavkanî" },
  { english: "Mud", kurdish: "herrî" },
  { english: "Land/Soil", kurdish: "zevî" }
]

const timeCards: Card[] = [
  { english: "Morning", kurdish: "sibê" },
  { english: "Noon", kurdish: "nîvro" },
  { english: "Evening", kurdish: "êvar" },
  { english: "Night", kurdish: "şev" },
  { english: "Today", kurdish: "îro" },
  { english: "Tomorrow", kurdish: "sibê" },
  { english: "Yesterday", kurdish: "duh" },
  { english: "Now", kurdish: "niha" },
  { english: "Later", kurdish: "paşê" },
  { english: "Earlier", kurdish: "berê" },
  { english: "Five minutes", kurdish: "pênc deqe" },
  { english: "Half hour", kurdish: "nîv saet" },
  { english: "Around", kurdish: "nêzîkê" },
  { english: "After", kurdish: "piştî" },
  { english: "Before", kurdish: "berî" }
]

const weatherCards: Card[] = [
  { english: "Weather", kurdish: "hewa" },
  { english: "Sun", kurdish: "roj" },
  { english: "Cloud", kurdish: "ewr" },
  { english: "Rain", kurdish: "baran" },
  { english: "Snow", kurdish: "berf" },
  { english: "Wind", kurdish: "ba" },
  { english: "Hot", kurdish: "germ" },
  { english: "Cold", kurdish: "sar" },
  { english: "Very hot", kurdish: "pir germ" },
  { english: "Very cold", kurdish: "pir sar" },
  { english: "Warm", kurdish: "germik" },
  { english: "Spring", kurdish: "bihar" },
  { english: "Summer", kurdish: "havîn" },
  { english: "Fall", kurdish: "payiz" },
  { english: "Winter", kurdish: "zivistan" }
]

const houseCards: Card[] = [
  { english: "House", kurdish: "mal" },
  { english: "Room", kurdish: "ode" },
  { english: "Door", kurdish: "derî" },
  { english: "Window", kurdish: "pencere" },
  { english: "Bed", kurdish: "nivîn" },
  { english: "Chair", kurdish: "kursî" },
  { english: "Sofa", kurdish: "qenepe" },
  { english: "Lamp", kurdish: "çira" },
  { english: "Television", kurdish: "televîzyon" },
  { english: "Refrigerator", kurdish: "sarinc" },
  { english: "Kitchen", kurdish: "aşxane" },
  { english: "Table", kurdish: "mase" }
]

const numbersCards: Card[] = [
  { english: "One", kurdish: "yek" },
  { english: "Two", kurdish: "du" },
  { english: "Three", kurdish: "sê" },
  { english: "Four", kurdish: "çar" },
  { english: "Five", kurdish: "pênc" },
  { english: "Six", kurdish: "şeş" },
  { english: "Seven", kurdish: "heft" },
  { english: "Eight", kurdish: "heşt" },
  { english: "Nine", kurdish: "neh" },
  { english: "Ten", kurdish: "deh" },
  { english: "Eleven", kurdish: "yanzdeh" },
  { english: "Twelve", kurdish: "danzdeh" },
  { english: "Thirteen", kurdish: "sêzdeh" },
  { english: "Fourteen", kurdish: "çardeh" },
  { english: "Fifteen", kurdish: "pênzdeh" },
  { english: "Sixteen", kurdish: "şanzdeh" },
  { english: "Seventeen", kurdish: "hevdeh" },
  { english: "Eighteen", kurdish: "hejdeh" },
  { english: "Nineteen", kurdish: "nozdeh" },
  { english: "Twenty", kurdish: "bîst" }
]

const daysMonthsCards: Card[] = [
  { english: "Monday", kurdish: "duşem" },
  { english: "Tuesday", kurdish: "sêşem" },
  { english: "Wednesday", kurdish: "çarşem" },
  { english: "Thursday", kurdish: "pêncşem" },
  { english: "Friday", kurdish: "în" },
  { english: "Saturday", kurdish: "şemî" },
  { english: "Sunday", kurdish: "yekşem" },
  { english: "January", kurdish: "çile" },
  { english: "February", kurdish: "sibat" },
  { english: "March", kurdish: "adar" },
  { english: "April", kurdish: "nîsan" },
  { english: "May", kurdish: "gulan" },
  { english: "June", kurdish: "hezîran" },
  { english: "July", kurdish: "tîrmeh" },
  { english: "August", kurdish: "tebax" },
  { english: "September", kurdish: "îlon" },
  { english: "October", kurdish: "cotmeh" },
  { english: "November", kurdish: "mijdar" },
  { english: "December", kurdish: "kanûn" }
]

const questionWordsCards: Card[] = [
  { english: "Who", kurdish: "kî" },
  { english: "What", kurdish: "çi" },
  { english: "Where", kurdish: "ku" },
  { english: "When", kurdish: "kengî" },
  { english: "Why", kurdish: "çima" },
  { english: "How", kurdish: "çawa" },
  { english: "How many/much", kurdish: "çend" },
  { english: "Which", kurdish: "kîjan" }
]

const pronounsCards: Card[] = [
  { english: "I", kurdish: "ez" },
  { english: "You (singular)", kurdish: "tu" },
  { english: "He/She/It", kurdish: "ew" },
  { english: "We", kurdish: "em" },
  { english: "You (plural/formal)", kurdish: "hûn" },
  { english: "They", kurdish: "ew" },
  { english: "My", kurdish: "min" },
  { english: "Your (singular)", kurdish: "te" },
  { english: "His", kurdish: "wî" },
  { english: "Her", kurdish: "wê" },
  { english: "Our", kurdish: "me" },
  { english: "Your (plural/formal)", kurdish: "we" },
  { english: "Their", kurdish: "wan" }
]

const bodyPartsCards: Card[] = [
  { english: "Head", kurdish: "ser" },
  { english: "Eye", kurdish: "çav" },
  { english: "Ear", kurdish: "guh" },
  { english: "Nose", kurdish: "poz" },
  { english: "Mouth", kurdish: "dev" },
  { english: "Tooth", kurdish: "didan" },
  { english: "Tongue", kurdish: "ziman" },
  { english: "Neck", kurdish: "stû" },
  { english: "Shoulder", kurdish: "mil" },
  { english: "Hand", kurdish: "dest" },
  { english: "Finger", kurdish: "tili" },
  { english: "Chest", kurdish: "sîng" },
  { english: "Stomach", kurdish: "zik" },
  { english: "Back", kurdish: "pişt" },
  { english: "Leg", kurdish: "ling" },
  { english: "Foot", kurdish: "pê" },
  { english: "Ankle", kurdish: "pêçî" },
  { english: "Knee", kurdish: "çok" },
  { english: "Eyebrow", kurdish: "birû" },
  { english: "Eyelash", kurdish: "mijang" },
  { english: "Fingernail", kurdish: "neynok" },
  { english: "Wrist", kurdish: "zendik" },
  { english: "Elbow", kurdish: "enîşk" }
]

// All cards from all categories
const allCards: Card[] = [
  ...colorsCards,
  ...animalsCards,
  ...foodCards,
  ...familyCards,
  ...natureCards,
  ...timeCards,
  ...weatherCards,
  ...houseCards,
  ...numbersCards,
  ...daysMonthsCards,
  ...questionWordsCards,
  ...pronounsCards,
  ...bodyPartsCards
]

const decks: Deck[] = [
  {
    name: "Colors",
    description: "Learn basic colors in Kurdish",
    icon: "🎨",
    cards: colorsCards
  },
  {
    name: "Animals",
    description: "Common animals and pets",
    icon: "🐾",
    cards: animalsCards
  },
  {
    name: "Food & Meals",
    description: "Food vocabulary from our lessons",
    icon: "🍽️",
    cards: foodCards
  },
  {
    name: "Family Members",
    description: "Family relationships and members",
    icon: "👨‍👩‍👧‍👦",
    cards: familyCards
  },
  {
    name: "Nature",
    description: "Natural world vocabulary",
    icon: "🌿",
    cards: natureCards
  },
  {
    name: "Time & Schedule",
    description: "Time-related vocabulary",
    icon: "⏰",
    cards: timeCards
  },
  {
    name: "Weather & Seasons",
    description: "Weather and seasonal vocabulary",
    icon: "🌤️",
    cards: weatherCards
  },
  {
    name: "House & Objects",
    description: "Things around the house",
    icon: "🏠",
    cards: houseCards
  },
  {
    name: "Numbers",
    description: "Kurdish numbers 1-20",
    icon: "🔢",
    cards: [
      { english: "One", kurdish: "yek" },
      { english: "Two", kurdish: "du" },
      { english: "Three", kurdish: "sê" },
      { english: "Four", kurdish: "çar" },
      { english: "Five", kurdish: "pênc" },
      { english: "Six", kurdish: "şeş" },
      { english: "Seven", kurdish: "heft" },
      { english: "Eight", kurdish: "heşt" },
      { english: "Nine", kurdish: "neh" },
      { english: "Ten", kurdish: "deh" },
      { english: "Eleven", kurdish: "yanzdeh" },
      { english: "Twelve", kurdish: "danzdeh" },
      { english: "Thirteen", kurdish: "sêzdeh" },
      { english: "Fourteen", kurdish: "çardeh" },
      { english: "Fifteen", kurdish: "pênzdeh" },
      { english: "Sixteen", kurdish: "şanzdeh" },
      { english: "Seventeen", kurdish: "hevdeh" },
      { english: "Eighteen", kurdish: "hejdeh" },
      { english: "Nineteen", kurdish: "nozdeh" },
      { english: "Twenty", kurdish: "bîst" },
    ]
  },
  {
    name: "Days & Months",
    description: "Days of week and months",
    icon: "📅",
    cards: [
      // Days
      { english: "Monday", kurdish: "duşem" },
      { english: "Tuesday", kurdish: "sêşem" },
      { english: "Wednesday", kurdish: "çarşem" },
      { english: "Thursday", kurdish: "pêncşem" },
      { english: "Friday", kurdish: "în" },
      { english: "Saturday", kurdish: "şemî" },
      { english: "Sunday", kurdish: "yekşem" },
      // Months
      { english: "January", kurdish: "çile" },
      { english: "February", kurdish: "sibat" },
      { english: "March", kurdish: "adar" },
      { english: "April", kurdish: "nîsan" },
      { english: "May", kurdish: "gulan" },
      { english: "June", kurdish: "hezîran" },
      { english: "July", kurdish: "tîrmeh" },
      { english: "August", kurdish: "tebax" },
      { english: "September", kurdish: "îlon" },
      { english: "October", kurdish: "cotmeh" },
      { english: "November", kurdish: "mijdar" },
      { english: "December", kurdish: "kanûn" },
    ]
  },
  {
    name: "Basic Question Words",
    description: "Essential question words for conversations",
    icon: "❓",
    cards: [
      { english: "Who", kurdish: "kî" },
      { english: "What", kurdish: "çi" },
      { english: "Where", kurdish: "ku" },
      { english: "When", kurdish: "kengî" },
      { english: "Why", kurdish: "çima" },
      { english: "How", kurdish: "çawa" },
      { english: "How many/much", kurdish: "çend" },
      { english: "Which", kurdish: "kîjan" },
    ]
  },
  {
    name: "Pronouns",
    description: "Personal and possessive pronouns",
    icon: "👥",
    cards: [
      // Personal Pronouns
      { english: "I", kurdish: "ez" },
      { english: "You (singular)", kurdish: "tu" },
      { english: "He/She/It", kurdish: "ew" },
      { english: "We", kurdish: "em" },
      { english: "You (plural/formal)", kurdish: "hûn" },
      { english: "They", kurdish: "ew" },
      // Possessive Pronouns
      { english: "My", kurdish: "min" },
      { english: "Your (singular)", kurdish: "te" },
      { english: "His", kurdish: "wî" },
      { english: "Her", kurdish: "wê" },
      { english: "Our", kurdish: "me" },
      { english: "Your (plural/formal)", kurdish: "we" },
      { english: "Their", kurdish: "wan" },
    ]
  },
  {
    name: "Body Parts",
    description: "Human body parts vocabulary",
    icon: "👤",
    cards: bodyPartsCards
  },
  {
    name: "Master Challenge",
    description: "Ultimate test with all vocabulary mixed together",
    icon: "🏆",
    cards: [] // Will be populated dynamically with shuffled cards
  }
]

// Helper functions for progress tracking
const getProgress = (categoryName: string): { correct: number; total: number } | null => {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(`flashcards-progress-${categoryName}`)
  return stored ? JSON.parse(stored) : null
}

const saveProgress = (categoryName: string, correct: number, total: number) => {
  if (typeof window === 'undefined') return
  // Get existing progress and keep the highest correct count
  const existing = getProgress(categoryName)
  const bestCorrect = existing ? Math.max(existing.correct, correct) : correct
  localStorage.setItem(`flashcards-progress-${categoryName}`, JSON.stringify({ correct: bestCorrect, total }))
}

export default function FlashcardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [cardKey, setCardKey] = useState(0) // Key to force card re-render
  const [markedCards, setMarkedCards] = useState<Record<number, 'correct' | 'incorrect'>>({})
  const [incorrectCards, setIncorrectCards] = useState<Card[]>([])
  const [showReview, setShowReview] = useState(false)
  const [reviewCardIndex, setReviewCardIndex] = useState(0)
  const [reviewFlipped, setReviewFlipped] = useState(false)
  const [reviewCardsFlipped, setReviewCardsFlipped] = useState<Set<number>>(new Set())
  const [reviewCompleted, setReviewCompleted] = useState(false)
  const [showReviewCompletion, setShowReviewCompletion] = useState(false)

  const currentCard = selectedDeck?.cards[currentCardIndex]
  const isCurrentCardMarked = markedCards[currentCardIndex] !== undefined
  const allCardsMarked = selectedDeck && Object.keys(markedCards).length === selectedDeck.cards.length

  // Reset flip state whenever card index changes
  useEffect(() => {
    setIsFlipped(false)
    setCardKey(prev => prev + 1) // Force card re-render
  }, [currentCardIndex])

  // Note: Review mode is now triggered by nextCard() when all cards are marked
  // This gives users time to see the last card's translation

  // Reset review flipped state when review card index changes
  useEffect(() => {
    if (showReview) {
      // Check if current review card was previously flipped
      setReviewFlipped(reviewCardsFlipped.has(reviewCardIndex))
    }
  }, [reviewCardIndex, showReview, reviewCardsFlipped])

  const nextCard = () => {
    if (!selectedDeck) return
    
    // Check if all cards are marked first
    if (Object.keys(markedCards).length === selectedDeck.cards.length) {
      // All cards are marked, show review or completion screen
      if (incorrectCards.length > 0) {
        setTimeout(() => setShowReview(true), 500)
      }
      // If no incorrect cards, the completion screen will show automatically
      return
    }
    
    // Find next unmarked card
    let nextIndex = (currentCardIndex + 1) % selectedDeck.cards.length
    let attempts = 0
    
    // Look for unmarked card (max attempts to avoid infinite loop)
    while (markedCards[nextIndex] !== undefined && attempts < selectedDeck.cards.length) {
      nextIndex = (nextIndex + 1) % selectedDeck.cards.length
      attempts++
    }
    
    // If we couldn't find an unmarked card, all cards are marked
    if (markedCards[nextIndex] !== undefined) {
      // All cards marked, show review or completion screen
      if (incorrectCards.length > 0) {
        setTimeout(() => setShowReview(true), 500)
      }
      return
    }
    
    setCurrentCardIndex(nextIndex)
  }

  const prevCard = () => {
    if (selectedDeck) {
      // Find previous card (can go back to marked cards)
      setCurrentCardIndex((i) => (i - 1 + selectedDeck.cards.length) % selectedDeck.cards.length)
    }
  }

  const nextReviewCard = () => {
    if (reviewCardIndex < incorrectCards.length - 1 && reviewFlipped) {
      const nextIndex = reviewCardIndex + 1
      setReviewCardIndex(nextIndex)
      // Check if the next card was previously flipped
      setReviewFlipped(reviewCardsFlipped.has(nextIndex))
    }
  }

  const prevReviewCard = () => {
    if (reviewCardIndex > 0) {
      setReviewCardIndex(reviewCardIndex - 1)
      // Check if this card was previously flipped
      setReviewFlipped(reviewCardsFlipped.has(reviewCardIndex - 1))
    }
  }

  const handleReviewCardFlip = () => {
    const newFlipped = !reviewFlipped
    setReviewFlipped(newFlipped)
    
    // Track that this review card has been flipped
    if (newFlipped) {
      setReviewCardsFlipped(prev => new Set([...prev, reviewCardIndex]))
    }
  }

  const finishReview = () => {
    // Save progress when review is finished
    if (selectedDeck) {
      const originalDeckName = selectedDeck.name.replace(' - Review', '')
      const totalCards = originalDeckName === "Master Challenge" ? allCards.length : 
        decks.find(d => d.name === originalDeckName)?.cards.length || selectedDeck.cards.length
      saveProgress(originalDeckName, correctCount, totalCards)
    }
    
    setShowReview(false)
    setShowReviewCompletion(true)
    setReviewCardIndex(0)
    setReviewFlipped(false)
    setReviewCardsFlipped(new Set())
    setReviewCompleted(true)
  }

  const reviewAgain = () => {
    // Restart review mode with the same incorrect cards
    setShowReviewCompletion(false)
    setReviewCardIndex(0)
    setReviewFlipped(false)
    setReviewCardsFlipped(new Set())
    setShowReview(true)
    setReviewCompleted(false)
  }

  const resetSameSession = () => {
    // Reset the same session - keep the deck but reset all progress
    if (!selectedDeck) return
    
    // Get the original deck name (remove "- Review" suffix if present)
    const originalDeckName = selectedDeck.name.replace(' - Review', '')
    
    // Find the original deck cards
    const deckCardsMap: { [key: string]: Card[] } = {
      "Master Challenge": allCards,
      "Colors": colorsCards,
      "Animals": animalsCards,
      "Food & Meals": foodCards,
      "Family Members": familyCards,
      "Nature": natureCards,
      "Time & Schedule": timeCards,
      "Weather & Seasons": weatherCards,
      "House & Objects": houseCards,
      "Numbers": numbersCards,
      "Days & Months": daysMonthsCards,
      "Basic Question Words": questionWordsCards,
      "Pronouns": pronounsCards,
      "Body Parts": bodyPartsCards
    }
    
    // Use original deck cards if available, otherwise use current deck cards
    const sourceCards = deckCardsMap[originalDeckName] || selectedDeck.cards
    
    // Get original description from decks array
    const originalDeck = decks.find(d => d.name === originalDeckName)
    const deckDescription = originalDeck?.description || selectedDeck.description
    const deckIcon = originalDeck?.icon || selectedDeck.icon
    
    const shuffledDeck: Deck = {
      name: originalDeckName,
      description: deckDescription,
      icon: deckIcon,
      cards: shuffleArray([...sourceCards])
    }
    
    // Reset all states
    setSelectedDeck(shuffledDeck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCardKey(0)
    setMarkedCards({})
    setIncorrectCards([])
    setShowReview(false)
    setShowReviewCompletion(false)
    setReviewCardIndex(0)
    setReviewFlipped(false)
    setReviewCardsFlipped(new Set())
    setReviewCompleted(false)
  }

  const retryIncorrectCards = () => {
    if (!selectedDeck || incorrectCards.length === 0) return
    
    // Save the incorrect cards for the retry session
    const cardsToRetry = [...incorrectCards]
    
    // Create a new deck with only the incorrect cards
    const retryDeck: Deck = {
      name: `${selectedDeck.name} - Review`,
      description: `Practice the ${cardsToRetry.length} cards you marked as "Don't Know"`,
      icon: selectedDeck.icon,
      cards: shuffleArray(cardsToRetry)
    }
    
    // Reset all states for the retry session
    setSelectedDeck(retryDeck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCardKey(0)
    setMarkedCards({})
    setIncorrectCards([]) // Will be populated as user marks cards in retry
    setShowReview(false)
    setShowReviewCompletion(false)
    setReviewCardIndex(0)
    setReviewFlipped(false)
    setReviewCardsFlipped(new Set())
    setReviewCompleted(false)
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  const resetDeck = () => {
    setSelectedDeck(null)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCardKey(0)
    setMarkedCards({})
    setIncorrectCards([])
    setShowReview(false)
    setShowReviewCompletion(false)
    setReviewCardIndex(0)
    setReviewFlipped(false)
    setReviewCardsFlipped(new Set())
    setReviewCompleted(false)
  }

  const handleDeckSelect = (deck: Deck) => {
    // Shuffle all decks randomly for variety and challenge
    let shuffledDeck = { ...deck }
    
    // Map deck names to their corresponding card arrays
    const deckCardsMap: { [key: string]: Card[] } = {
      "Master Challenge": allCards,
      "Colors": colorsCards,
      "Animals": animalsCards,
      "Food & Meals": foodCards,
      "Family Members": familyCards,
      "Nature": natureCards,
      "Time & Schedule": timeCards,
      "Weather & Seasons": weatherCards,
      "House & Objects": houseCards,
      "Numbers": numbersCards,
      "Days & Months": daysMonthsCards,
      "Basic Question Words": questionWordsCards,
      "Pronouns": pronounsCards,
      "Body Parts": bodyPartsCards
    }
    
    // Get the appropriate cards for this deck and shuffle them
    const sourceCards = deckCardsMap[deck.name] || deck.cards
    shuffledDeck.cards = shuffleArray(sourceCards)
    
    setSelectedDeck(shuffledDeck)
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setCorrectCount(0)
    setIncorrectCount(0)
    setCardKey(0)
    setMarkedCards({})
    setIncorrectCards([])
    setShowReview(false)
    setShowReviewCompletion(false)
    setReviewCardIndex(0)
    setReviewFlipped(false)
    setReviewCardsFlipped(new Set())
    setReviewCompleted(false)
  }

  const markCorrect = () => {
    if (!selectedDeck || !currentCard) return
    
    // Prevent marking if already marked
    if (markedCards[currentCardIndex]) return
    
    // Mark current card as correct
    const newMarkedCards = { ...markedCards, [currentCardIndex]: 'correct' }
    setMarkedCards(newMarkedCards)
    setCorrectCount(c => c + 1)
  }

  const markIncorrect = () => {
    if (!selectedDeck || !currentCard) return
    
    // Prevent marking if already marked
    if (markedCards[currentCardIndex]) return
    
    // Mark current card as incorrect and add to review list
    const newMarkedCards = { ...markedCards, [currentCardIndex]: 'incorrect' }
    setMarkedCards(newMarkedCards)
    setIncorrectCount(c => c + 1)
    
    // Add to incorrect cards if not already there
    const cardExists = incorrectCards.find(c => c.kurdish === currentCard.kurdish && c.english === currentCard.english)
    if (!cardExists) {
      setIncorrectCards(prev => [...prev, currentCard])
    }
  }

  // Show deck selection if no deck is selected
  if (!selectedDeck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Flashcards</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-center text-lg text-gray-700 mb-8">
              Choose a category to start learning with interactive flashcards!
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {decks.map((deck) => {
                const totalCards = deck.name === "Master Challenge" ? allCards.length : deck.cards.length
                const progress = getProgress(deck.name)
                const isCompleted = progress && progress.correct === totalCards && progress.total === totalCards
                const progressPercentage = progress 
                  ? Math.round((progress.correct / progress.total) * 100)
                  : 0
                
                return (
                  <button
                    key={deck.name}
                    onClick={() => handleDeckSelect(deck)}
                    className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center"
                  >
                    <div className="text-4xl mb-3">{deck.icon}</div>
                    <div className="font-semibold text-gray-800">{deck.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {totalCards} cards
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className={`text-xs font-semibold ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {isCompleted ? 'Completed' : progress ? `${progressPercentage}%` : '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-600' 
                              : 'bg-gradient-to-r from-primaryBlue to-supportLavender'
                          }`}
                          style={{ width: `${isCompleted ? 100 : (progress ? progressPercentage : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show completion screen if all cards are marked and all are correct
  if (allCardsMarked && incorrectCards.length === 0 && !showReview) {
    // Save progress when all cards are completed correctly
    if (selectedDeck) {
      const totalCards = selectedDeck.name === "Master Challenge" ? allCards.length : selectedDeck.cards.length
      saveProgress(selectedDeck.name, totalCards, totalCards)
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-xl p-8 mt-12"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-kurdish-red mb-4">Perfect Score!</h2>
              <p className="text-gray-600 mb-6">
                You got all {selectedDeck?.cards.length} cards correct! Great job!
              </p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-xs text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{selectedDeck?.cards.length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <button
                  onClick={resetSameSession}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all shadow-lg hover:shadow-xl"
                >
                  Try Same Category
                </button>
                <button
                  onClick={resetDeck}
                  className="px-6 py-3 rounded-full bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Back to Categories
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Show review completion screen after finishing review
  if (showReviewCompletion && reviewCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-xl p-8 mt-12"
            >
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-3xl font-bold text-kurdish-red mb-4">Review Complete!</h2>
              <p className="text-gray-600 mb-6">
                You've reviewed all {incorrectCards.length} cards you marked as "Don't Know". Great effort!
              </p>
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-xs text-gray-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
                  <div className="text-xs text-gray-600">Need Practice</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{selectedDeck?.cards.length}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={reviewAgain}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-accentCoral to-brand-orange text-white font-semibold hover:from-accentCoral/90 hover:to-brand-orange/90 transition-all shadow-lg hover:shadow-xl"
                  >
                    Review Again
                  </button>
                  <button
                    onClick={resetSameSession}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-primaryBlue to-supportLavender text-white font-semibold hover:from-primaryBlue/90 hover:to-supportLavender/90 transition-all shadow-lg hover:shadow-xl"
                  >
                    Try Same Category
                  </button>
                </div>
                <button
                  onClick={resetDeck}
                  className="px-6 py-3 rounded-full bg-gray-500 text-white font-semibold hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Back to Categories
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Show review screen if all cards are marked and there are incorrect cards
  if (showReview && incorrectCards.length > 0) {
    const reviewCard = incorrectCards[reviewCardIndex]
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={finishReview}
                className="text-kurdish-red font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">📚</span>
                <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">Review Mode</h1>
              </div>
              <p className="text-gray-600 text-sm">Review the cards you marked as "Don't Know"</p>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{incorrectCards.length}</div>
              <div className="text-xs text-gray-600">To Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{reviewCardIndex + 1} / {incorrectCards.length}</div>
              <div className="text-xs text-gray-600">Progress</div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={prevReviewCard} 
                disabled={reviewCardIndex === 0}
                className={`px-4 py-2 rounded-full border shadow transition-all ${
                  reviewCardIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:shadow-md'
                }`}
              >
                Previous
              </button>
              <div className="text-sm font-medium text-gray-600">
                Card {reviewCardIndex + 1} of {incorrectCards.length}
              </div>
              <button 
                onClick={nextReviewCard} 
                disabled={reviewCardIndex === incorrectCards.length - 1 || !reviewFlipped}
                className={`px-4 py-2 rounded-full border shadow transition-all ${
                  reviewCardIndex === incorrectCards.length - 1 || !reviewFlipped
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:shadow-md'
                }`}
              >
                Next
              </button>
            </div>

            {/* Review Flashcard */}
            <div className="relative h-80 mb-6">
              <motion.div
                key={reviewCardIndex}
                className="card h-full cursor-pointer"
                onClick={handleReviewCardFlip}
                animate={{ rotateY: reviewFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of card */}
                <div 
                  className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center backface-hidden"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-4xl font-bold text-gray-800 mb-4">
                    {reviewCard?.kurdish.charAt(0).toUpperCase() + reviewCard?.kurdish.slice(1)}
                  </div>
                  <div className="text-gray-500">Tap to reveal translation</div>
                </div>

                {/* Back of card */}
                <div 
                  className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center backface-hidden"
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                >
                  <div className="text-4xl font-bold text-primaryBlue mb-2">
                    {reviewCard?.kurdish.charAt(0).toUpperCase() + reviewCard?.kurdish.slice(1)}
                  </div>
                  <div className="text-xl text-gray-600">
                    {reviewCard?.english}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Finish Review Button */}
            <div className="flex justify-center">
              <button 
                onClick={finishReview}
                disabled={reviewCardsFlipped.size < incorrectCards.length}
                className={`px-6 py-3 rounded-full font-semibold transition-all shadow-lg ${
                  reviewCardsFlipped.size < incorrectCards.length
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primaryBlue to-supportLavender text-white hover:from-primaryBlue/90 hover:to-supportLavender/90 hover:shadow-xl'
                }`}
              >
                Finish Review
              </button>
            </div>
            
            {/* Progress indicator */}
            {reviewCardsFlipped.size < incorrectCards.length && (
              <div className="text-center mt-2 text-sm text-gray-500">
                Flip all {incorrectCards.length} cards to finish review ({reviewCardsFlipped.size}/{incorrectCards.length} flipped)
              </div>
            )}

            {/* Instructions */}
            <div className="text-center mt-6 text-sm text-gray-500">
              {!reviewFlipped 
                ? "Tap the card to reveal the translation before proceeding"
                : "Tap the card to flip between Kurdish and English"}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show flashcard game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={resetDeck}
              className="text-kurdish-red font-bold flex items-center gap-2"
            >
            <ArrowLeft className="w-4 h-4" />
            Back
            </button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{selectedDeck.icon}</span>
              <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">{selectedDeck.name}</h1>
            </div>
            <p className="text-gray-600 text-sm">{selectedDeck.description}</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-xs text-gray-600">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{Object.keys(markedCards).length} / {selectedDeck.cards.length}</div>
            <div className="text-xs text-gray-600">Marked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{incorrectCount}</div>
            <div className="text-xs text-gray-600">Incorrect</div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={prevCard} 
              className="px-4 py-2 rounded-full bg-white border shadow hover:shadow-md transition-all"
            >
              Previous
            </button>
            <div className="text-sm font-medium text-gray-600">
              Card {currentCardIndex + 1} of {selectedDeck.cards.length}
            </div>
            <button 
              onClick={nextCard} 
              disabled={!isCurrentCardMarked}
              className={`px-4 py-2 rounded-full border shadow transition-all ${
                isCurrentCardMarked 
                  ? 'bg-white hover:shadow-md' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>

          {/* Flashcard */}
          <div className="relative h-80 mb-6">
              <motion.div
              key={cardKey} // Force re-render when card changes
              className="card h-full cursor-pointer"
              onClick={flipCard}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front of card */}
              <div 
                className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="text-4xl font-bold text-gray-800 mb-4">
                  {currentCard?.kurdish.charAt(0).toUpperCase() + currentCard?.kurdish.slice(1)}
                </div>
                <div className="text-gray-500">Tap to reveal translation</div>
              </div>

              {/* Back of card */}
              <div 
                className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center backface-hidden"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="text-4xl font-bold text-primaryBlue mb-2">
                  {currentCard?.kurdish.charAt(0).toUpperCase() + currentCard?.kurdish.slice(1)}
                </div>
                <div className="text-xl text-gray-600">
                  {currentCard?.english}
                </div>
              </div>
              </motion.div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={markIncorrect}
              disabled={isCurrentCardMarked}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                isCurrentCardMarked
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <XCircle className="w-5 h-5" />
              Don't Know
            </button>
            <button 
              onClick={markCorrect}
              disabled={isCurrentCardMarked}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${
                isCurrentCardMarked
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Got It!
            </button>
          </div>
          
          {/* Marked indicator */}
          {isCurrentCardMarked && (
            <div className="text-center mt-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                markedCards[currentCardIndex] === 'correct'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {markedCards[currentCardIndex] === 'correct' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Marked as "Got It!"
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Marked as "Don't Know"
                  </>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center mt-6 text-sm text-gray-500">
            {!isCurrentCardMarked 
              ? "Mark this card as 'Got It!' or 'Don't Know' before moving to the next card"
              : "Tap the card to flip between Kurdish and English"}
          </div>
        </div>
      </div>
    </div>
  )
}
