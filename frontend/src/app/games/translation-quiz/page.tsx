'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CheckCircle, XCircle, Trophy, ArrowLeft } from 'lucide-react'
import BackLink from '../../../components/BackLink'
import { useGamesProgress } from '../../../contexts/GamesProgressContext'

interface QuizItem {
  kurdish: string
  english: string
  image: string
  category: string
  options: string[]
}

interface Deck {
  name: string
  description: string
  icon: string
  items: QuizItem[]
}

// Helper function to get icon for a word (same as matching game)
function getIcon(category: string, english: string, kurdish: string): string {
  // Colors
  if (category === "colors") {
    const colorMap: Record<string, string> = {
      "Red": "🔴", "Green": "🟢", "Blue": "🔵", "Yellow": "🟡",
      "Orange": "🟠", "Purple": "🟣", "Black": "⚫", "White": "⚪",
      "Gold": "🟨", "Silver": "🔘", "Gray": "⬜"
    }
    return colorMap[english] || "🎨"
  }
  
  // Animals
  if (category === "animals") {
    const animalMap: Record<string, string> = {
      "Cat": "🐱", "Dog": "🐶", "Bird": "🐦", "Cow": "🐮", "Bull": "🐂",
      "Horse": "🐴", "Fish": "🐟", "Lion": "🦁", "Goat": "🐐", "Sheep": "🐑",
      "Elephant": "🐘", "Monkey": "🐵", "Wolf": "🐺", "Snake": "🐍",
      "Rabbit": "🐰", "Chicken": "🐔", "Rooster": "🐓", "Tiger": "🐯",
      "Bear": "🐻", "Fox": "🦊", "Butterfly": "🦋", "Mouse": "🐭",
      "Duck": "🦆", "Pig": "🐷", "Donkey": "🫏", "Owl": "🦉",
      "Turkey": "🦃", "Hedgehog": "🦔", "Crow": "🐦‍⬛"
    }
    return animalMap[english] || "🐾"
  }
  
  // Food
  if (category === "food") {
    const foodMap: Record<string, string> = {
      "Apple": "🍎", "Orange": "🍊", "Banana": "🍌", "Mulberry": "🫐",
      "Pomegranate": "🔴", "Peach": "🍑", "Fig": "🟤", "Olive": "🫒",
      "Grape": "🍇", "Lemon": "🍋", "Watermelon": "🍉",
      "Carrot": "🥕", "Potato": "🥔", "Onion": "🧅", "Garlic": "🧄",
      "Tomato": "🍅", "Cucumber": "🥒", "Cabbage": "🥬", "Spinach": "🥬",
      "Eggplant": "🍆", "Pepper": "🫑", "Mushroom": "🍄", "Corn": "🌽",
      "Fish": "🐟", "Egg": "🥚", "Meat": "🥩", "Chicken": "🐔",
      "Lamb": "🐑", "Beans": "🫘", "Lentils": "🫘", "Turkey": "🦃",
      "Pistachios": "🥜", "Almonds": "🥜", "Milk": "🥛", "Yogurt": "🍶",
      "Cheese": "🧀", "Butter": "🧈", "Cream": "🥛", "Yogurt drink": "🥛",
      "Bread": "🍞", "Rice": "🍚", "Wheat": "🌾", "Barley": "🌾",
      "Bulgur": "🌾", "Pasta": "🍝", "Cake": "🍰", "Cookie": "🍪",
      "Coffee": "☕", "Tea": "🍵", "Water": "💧", "Sherbet": "🧃", "Lemonade": "🍋"
    }
    return foodMap[english] || "🍽️"
  }
  
  // Family
  if (category === "family") {
    const familyMap: Record<string, string> = {
      "Family": "👨‍👩‍👧‍👦", "Mother": "👩", "Father": "👨", "Sister": "👧",
      "Brother": "👦", "Daughter": "👧", "Son": "👦", "Grandmother": "👵",
      "Grandfather": "👴", "Baby": "👶", "Groom": "🤵", "Bride": "👰"
    }
    return familyMap[english] || "👨‍👩‍👧‍👦"
  }
  
  // Nature
  if (category === "nature") {
    const natureMap: Record<string, string> = {
      "Tree": "🌳", "Oak": "🌲", "Pine": "🌲", "Palm": "🌴",
      "Flower": "🌸", "Rose": "🌹", "Sunflower": "🌻", "Lily": "🌺",
      "Mountain": "🏔️", "Valley": "🏞️", "Forest": "🌲", "Desert": "🏜️",
      "River": "🏞️", "Lake": "🏞️", "Sea": "🌊", "Sun": "☀️",
      "Rain": "🌧️", "Snow": "❄️", "Wind": "💨", "Cloud": "☁️",
      "Storm": "⛈️", "Hail": "🧊", "Leaf": "🍃", "Grass": "🌱"
    }
    return natureMap[english] || "🌿"
  }
  
  // Time
  if (category === "time") {
    return "⏰"
  }
  
  // Weather
  if (category === "weather") {
    const weatherMap: Record<string, string> = {
      "Weather": "🌤️", "Sun": "☀️", "Cloud": "☁️", "Rain": "🌧️",
      "Snow": "❄️", "Wind": "💨", "Hot": "🌡️", "Cold": "🧊",
      "Spring": "🌸", "Summer": "☀️", "Fall": "🍂", "Winter": "❄️"
    }
    return weatherMap[english] || "🌤️"
  }
  
  // House
  if (category === "house") {
    const houseMap: Record<string, string> = {
      "House": "🏠", "Room": "🚪", "Door": "🚪", "Window": "🪟",
      "Bed": "🛏️", "Chair": "🪑", "Sofa": "🛋️", "Lamp": "💡",
      "Television": "📺", "Refrigerator": "🧊", "Kitchen": "🍳", "Table": "⬜"
    }
    return houseMap[english] || "🏠"
  }
  
  // Numbers
  if (category === "numbers") {
    const numMap: Record<string, string> = {
      "One": "1️⃣", "Two": "2️⃣", "Three": "3️⃣", "Four": "4️⃣",
      "Five": "5️⃣", "Six": "6️⃣", "Seven": "7️⃣", "Eight": "8️⃣",
      "Nine": "9️⃣", "Ten": "🔟"
    }
    return numMap[english] || "🔢"
  }
  
  // Days & Months
  if (category === "daysMonths") {
    return "📅"
  }
  
  // Question Words
  if (category === "questions") {
    return "❓"
  }
  
  // Pronouns
  if (category === "pronouns") {
    return "👤"
  }
  
  // Body Parts
  if (category === "bodyParts") {
    const bodyMap: Record<string, string> = {
      "Head": "👤", "Eye": "👁️", "Ear": "👂", "Nose": "👃",
      "Mouth": "👄", "Tooth": "🦷", "Tongue": "👅", "Neck": "🔶",
      "Shoulder": "💪", "Hand": "✋", "Finger": "👆", "Chest": "👤",
      "Stomach": "🫃", "Back": "🔶", "Leg": "🦵", "Foot": "🦶",
      "Ankle": "🦴", "Knee": "🦵", "Eyebrow": "🤨", "Eyelash": "👁️",
      "Fingernail": "💅", "Wrist": "⌚", "Elbow": "🦾"
    }
    return bodyMap[english] || "👤"
  }
  
  return "📝"
}

// Helper function to generate options (1 correct + 3 incorrect from same category)
function generateOptions(correct: string, allWords: string[]): string[] {
  const incorrect = allWords.filter(w => w !== correct)
  const shuffled = [...incorrect].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 3)
  const options = [correct, ...selected]
  return options.sort(() => Math.random() - 0.5) // Shuffle options
}

// Helper function to create QuizItems from flashcard cards
function createQuizItems(
  cards: Array<{ english: string; kurdish: string }>, 
  category: string
): QuizItem[] {
  const allKurdishWords = cards.map(c => c.kurdish)
  return cards.map(card => ({
    kurdish: card.kurdish,
    english: card.english.toLowerCase(),
    image: getIcon(category, card.english, card.kurdish),
    category: category,
    options: generateOptions(card.kurdish, allKurdishWords)
  }))
}

// Import card data (same as flashcards)
const colorsCards = [
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

const animalsCards = [
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

const foodCards = [
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
  { english: "Milk", kurdish: "şîr" },
  { english: "Yogurt", kurdish: "mast" },
  { english: "Cheese", kurdish: "penîr" },
  { english: "Butter", kurdish: "rûn" },
  { english: "Cream", kurdish: "qeymax" },
  { english: "Yogurt drink", kurdish: "dew" },
  { english: "Bread", kurdish: "nan" },
  { english: "Rice", kurdish: "birinc" },
  { english: "Wheat", kurdish: "genim" },
  { english: "Barley", kurdish: "ceh" },
  { english: "Bulgur", kurdish: "bulgur" },
  { english: "Pasta", kurdish: "makarna" },
  { english: "Cake", kurdish: "kek" },
  { english: "Cookie", kurdish: "kurabiye" },
  { english: "Coffee", kurdish: "qehwe" },
  { english: "Tea", kurdish: "çay" },
  { english: "Water", kurdish: "av" },
  { english: "Sherbet", kurdish: "şerbet" },
  { english: "Lemonade", kurdish: "limonata" }
]

const familyCards = [
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

const natureCards = [
  { english: "Tree", kurdish: "dar" },
  { english: "Oak", kurdish: "berû" },
  { english: "Pine", kurdish: "sûs" },
  { english: "Palm", kurdish: "darê bejî" },
  { english: "Sycamore", kurdish: "darê çinar" },
  { english: "Flower", kurdish: "gul" },
  { english: "Rose", kurdish: "gulên sor" },
  { english: "Sunflower", kurdish: "gulên rojê" },
  { english: "Lily", kurdish: "gulên sîrî" },
  { english: "Blossom", kurdish: "gulên çîçek" },
  { english: "Mountain", kurdish: "çiya" },
  { english: "Valley", kurdish: "newal" },
  { english: "Forest", kurdish: "daristan" },
  { english: "Spring", kurdish: "çavkanî" },
  { english: "Desert", kurdish: "çol" },
  { english: "Plain", kurdish: "deşt" },
  { english: "River", kurdish: "çem" },
  { english: "Lake", kurdish: "gol" },
  { english: "Sea", kurdish: "behr" },
  { english: "Rain", kurdish: "barîn" },
  { english: "Sun", kurdish: "roj" },
  { english: "Snow", kurdish: "berf" },
  { english: "Wind", kurdish: "ba" },
  { english: "Cloud", kurdish: "ewr" },
  { english: "Storm", kurdish: "bahoz" },
  { english: "Hail", kurdish: "zîpik" },
  { english: "Leaf", kurdish: "pel" },
  { english: "Root", kurdish: "kok" },
  { english: "Grass", kurdish: "gîha" },
  { english: "Seed", kurdish: "tohum" },
  { english: "Moss", kurdish: "giyayê çavkanî" },
  { english: "Mud", kurdish: "herrî" },
  { english: "Land/Soil", kurdish: "zevî" }
]

const timeCards = [
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

const weatherCards = [
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

const houseCards = [
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

const numbersCards = [
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

const daysMonthsCards = [
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

const questionWordsCards = [
  { english: "Who", kurdish: "kî" },
  { english: "What", kurdish: "çi" },
  { english: "Where", kurdish: "ku" },
  { english: "When", kurdish: "kengî" },
  { english: "Why", kurdish: "çima" },
  { english: "How", kurdish: "çawa" },
  { english: "How many/much", kurdish: "çend" },
  { english: "Which", kurdish: "kîjan" }
]

const pronounsCards = [
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

const bodyPartsCards = [
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

// Create quiz items from flashcard data
const colorsItems = createQuizItems(colorsCards, "colors")
const animalsItems = createQuizItems(animalsCards, "animals")
const foodItems = createQuizItems(foodCards, "food")
const familyItems = createQuizItems(familyCards, "family")
const natureItems = createQuizItems(natureCards, "nature")
const timeItems = createQuizItems(timeCards, "time")
const weatherItems = createQuizItems(weatherCards, "weather")
const houseItems = createQuizItems(houseCards, "house")
const numbersItems = createQuizItems(numbersCards, "numbers")
const daysMonthsItems = createQuizItems(daysMonthsCards, "daysMonths")
const questionWordsItems = createQuizItems(questionWordsCards, "questions")
const pronounsItems = createQuizItems(pronounsCards, "pronouns")
const bodyPartsItems = createQuizItems(bodyPartsCards, "bodyParts")

// Combine all items for Master Challenge
const allItems = [
    ...colorsItems,
    ...animalsItems,
    ...foodItems,
    ...familyItems,
    ...natureItems,
    ...houseItems,
    ...timeItems,
    ...weatherItems,
    ...numbersItems,
    ...daysMonthsItems,
    ...questionWordsItems,
    ...pronounsItems,
    ...bodyPartsItems
  ]

const PICTUREQUIZ_KEY = (name: string) => `picturequiz-progress-${name}`

export default function PictureQuiz() {
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress } = useGamesProgress()

  const getPictureQuizProgress = (deckName: string): { score: number; total: number } | null => {
    const raw = getGamesProgress(PICTUREQUIZ_KEY(deckName))
    return raw && typeof raw === 'object' && 'score' in (raw as object) ? (raw as { score: number; total: number }) : null
  }

  const savePictureQuizProgress = (deckName: string, score: number, total: number) => {
    if (score / total >= 0.8) {
      const existing = getPictureQuizProgress(deckName)
      const bestScore = existing ? Math.max(existing.score, score) : score
      saveGamesProgress(PICTUREQUIZ_KEY(deckName), { score: bestScore, total })
    }
  }
  // Create decks
  const decks: Deck[] = [
    {
      name: "Colors",
      description: "Learn colors in Kurdish",
      icon: "🎨",
      items: colorsItems
    },
    {
      name: "Animals",
      description: "Learn animal names",
      icon: "🐾",
      items: animalsItems
    },
    {
      name: "Food & Meals",
      description: "Learn food vocabulary",
      icon: "🍽️",
      items: foodItems
    },
    {
      name: "Family Members",
      description: "Learn family relationships",
      icon: "👨‍👩‍👧‍👦",
      items: familyItems
    },
    {
      name: "Nature",
      description: "Learn nature vocabulary",
      icon: "🌿",
      items: natureItems
    },
    {
      name: "Time & Schedule",
      description: "Learn time-related words",
      icon: "⏰",
      items: timeItems
    },
    {
      name: "Weather & Seasons",
      description: "Learn weather vocabulary",
      icon: "🌤️",
      items: weatherItems
    },
    {
      name: "House & Objects",
      description: "Learn household items",
      icon: "🏠",
      items: houseItems
    },
    {
      name: "Numbers",
      description: "Learn numbers 1-10",
      icon: "🔢",
      items: numbersItems
    },
    {
      name: "Days & Months",
      description: "Learn calendar vocabulary",
      icon: "📅",
      items: daysMonthsItems
    },
    {
      name: "Basic Question Words",
      description: "Learn essential questions",
      icon: "❓",
      items: questionWordsItems
    },
    {
      name: "Pronouns",
      description: "Learn personal pronouns",
      icon: "👥",
      items: pronounsItems
    },
    {
      name: "Body Parts",
      description: "Learn body part names",
      icon: "👤",
      items: bodyPartsItems
    },
    {
      name: "Master Challenge",
      description: "Ultimate test with all vocabulary mixed together",
      icon: "🏆",
      items: [] // Will be populated dynamically
    }
  ]

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [questions, setQuestions] = useState<QuizItem[]>([])

  // Shuffle function for randomizing arrays
  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Sync browser history with category vs in-game view so browser back works correctly
  useEffect(() => {
    const onPopState = () => {
      setSelectedDeck(null)
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setScore(0)
      setShowResult(false)
      setGameFinished(false)
      setQuestions([])
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Handle deck selection
  const handleDeckSelect = (deck: Deck) => {
    window.history.pushState({ view: 'game', deck: deck.name }, '', window.location.pathname)
    let shuffledDeck = { ...deck }
    
    // Map deck names to their corresponding item arrays
    const deckItemsMap: { [key: string]: QuizItem[] } = {
      "Colors": colorsItems,
      "Animals": animalsItems,
      "Food & Meals": foodItems,
      "Family Members": familyItems,
      "Nature": natureItems,
      "Time & Schedule": timeItems,
      "Weather & Seasons": weatherItems,
      "House & Objects": houseItems,
      "Numbers": numbersItems,
      "Days & Months": daysMonthsItems,
      "Basic Question Words": questionWordsItems,
      "Pronouns": pronounsItems,
      "Body Parts": bodyPartsItems
    }
    
    // Get the source items for this deck
    const sourceItems = deckItemsMap[deck.name] || deck.items
    
    // For Master Challenge, use all items
    if (deck.name === "Master Challenge") {
      shuffledDeck.items = shuffleArray(allItems)
    } else {
      shuffledDeck.items = shuffleArray(sourceItems)
    }
    
    setSelectedDeck(shuffledDeck)
    setScore(0)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setGameFinished(false)
    
    // Select questions from the deck (25 for regular, 50 for Master Challenge)
    const questionCount = deck.name === "Master Challenge" ? 50 : 25
    
    // If we have enough unique items, use them without repeating
    // If we have fewer items, we'll need to repeat some
    let selectedQuestions: QuizItem[] = []
    if (shuffledDeck.items.length >= questionCount) {
      // Enough items, no repeats needed
      selectedQuestions = shuffledDeck.items.slice(0, questionCount)
    } else {
      // Not enough items, repeat to reach questionCount
      const repeatsNeeded = Math.ceil(questionCount / shuffledDeck.items.length)
      for (let i = 0; i < repeatsNeeded; i++) {
        selectedQuestions = [...selectedQuestions, ...shuffledDeck.items]
      }
      selectedQuestions = selectedQuestions.slice(0, questionCount)
      // Shuffle again to mix up the repeated items
      selectedQuestions = shuffleArray(selectedQuestions)
    }
    
    setQuestions(selectedQuestions)
  }

  // Reset deck selection
  const resetDeck = () => {
    setSelectedDeck(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setGameFinished(false)
    setQuestions([])
  }


  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)
    
    const correct = answer === questions[currentQuestion]?.kurdish
    const newScore = correct ? score + 1 : score
    if (correct) {
      setScore(newScore)
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setShowResult(false)
      } else {
        setGameFinished(true)
        // Save progress when quiz is finished
        if (selectedDeck) {
          savePictureQuizProgress(selectedDeck.name, newScore, questions.length)
        }
      }
    }, 2000)
  }

  const restartQuiz = () => {
    if (!selectedDeck) return
    
    // Get new shuffled questions from the same deck (25 for regular, 50 for Master Challenge)
    const questionCount = selectedDeck.name === "Master Challenge" ? 50 : 25
    
    // Shuffle the deck items first
    const shuffledItems = shuffleArray(selectedDeck.items)
    
    // If we have enough unique items, use them without repeating
    // If we have fewer items, we'll need to repeat some
    let newQuestions: QuizItem[] = []
    if (shuffledItems.length >= questionCount) {
      // Enough items, no repeats needed
      newQuestions = shuffledItems.slice(0, questionCount)
    } else {
      // Not enough items, repeat to reach questionCount
      const repeatsNeeded = Math.ceil(questionCount / shuffledItems.length)
      for (let i = 0; i < repeatsNeeded; i++) {
        newQuestions = [...newQuestions, ...shuffledItems]
      }
      newQuestions = newQuestions.slice(0, questionCount)
      // Shuffle again to mix up the repeated items
      newQuestions = shuffleArray(newQuestions)
    }
    
    setQuestions(newQuestions)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setGameFinished(false)
  }

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100
    if (percentage >= 90) return { message: "Outstanding! 🌟", color: "text-yellow-600" }
    if (percentage >= 70) return { message: "Great job! 🎉", color: "text-green-600" }
    if (percentage >= 50) return { message: "Good effort! 👍", color: "text-blue-600" }
    return { message: "Keep practicing! 💪", color: "text-purple-600" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      {/* Game Area */}
      <div className="container mx-auto px-4 py-8 md:max-w-[1320px]">
        {!selectedDeck ? (
          /* Deck Selection Screen */
          <>
            <BackLink href="/games" label="Back to Games" />
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-kurdish-red text-center">Translation Quiz</h1>
            </div>
            <div className="max-w-4xl mx-auto md:max-w-none">
              <p className="text-center text-lg text-gray-700 mb-8 md:text-base md:text-gray-500 md:mb-6">
                Choose a category to practice translating English words to Kurdish!
              </p>
              
              {/* Deck Selection Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 md:max-w-[1320px] md:mx-auto">
                {decks.map((deck) => {
                  const progress = getPictureQuizProgress(deck.name)
                  const isCompleted = progress && progress.score / progress.total >= 0.8
                  const progressPercentage = progress 
                    ? Math.round((progress.score / progress.total) * 100)
                    : 0
                  const showPercent = progressPercentage > 0 || isCompleted
                  
                  return (
                    <button
                      key={deck.name}
                      onClick={() => handleDeckSelect(deck)}
                      className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center md:p-5 md:rounded-2xl md:flex md:flex-col md:h-full md:items-stretch md:text-left md:hover:shadow-xl md:hover:-translate-y-0.5 md:hover:ring-2 md:hover:ring-primaryBlue/30 md:focus-visible:outline md:focus-visible:ring-2 md:focus-visible:ring-primaryBlue md:focus-visible:ring-offset-2 cursor-pointer"
                    >
                      <div className="text-4xl mb-3 md:mb-4 md:flex md:justify-center">
                        <span className="md:w-11 md:h-11 md:rounded-2xl md:bg-primaryBlue/5 md:flex md:items-center md:justify-center md:inline-flex md:text-2xl">
                          {deck.icon}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-800 md:text-lg md:font-semibold md:mb-1">{deck.name}</div>
                      <div className="text-sm text-gray-500 mt-1 md:text-sm md:text-gray-500">
                        {deck.name === "Master Challenge" 
                          ? "50 questions" 
                          : "25 questions"}
                      </div>
                      <div className="mt-2 md:mt-4 md:flex-1 md:flex md:flex-col md:justify-end">
                        {showPercent && (
                          <span className={`text-xs font-semibold block mb-1 md:text-xs md:text-gray-500 ${isCompleted ? 'text-green-600' : ''}`}>
                            {isCompleted ? 'Completed' : `${progressPercentage}%`}
                          </span>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2 md:bg-gray-100">
                          <div 
                            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                              isCompleted 
                                ? 'bg-green-600' 
                                : 'bg-primaryBlue'
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
          </>
        ) : (
          /* Game Screen */
          <div className="max-w-2xl mx-auto">
            <button
              type="button"
              onClick={() => {
                resetDeck()
                window.history.back()
              }}
              className="text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors inline-flex items-center gap-1.5 mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Categories
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center mb-6">
              {selectedDeck.icon} {selectedDeck.name}
            </h1>
            
            {/* Game Description and Progress */}
            <div className="text-center mb-8">
              <p className="text-gray-700 mb-2">
                Translate English words to Kurdish!
              </p>
              {selectedDeck && (() => {
                const totalQuestions = selectedDeck.name === "Master Challenge" ? 50 : 25
                return (
                  <div className="text-gray-700">
                    <div className="text-lg font-semibold">
                      {score} / {totalQuestions}
                    </div>
                    <div className="text-sm text-gray-500">Correct Answers</div>
                  </div>
                )
              })()}
            </div>

            {questions.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="text-4xl mb-4">🔄</div>
                  <p className="text-gray-600">Loading quiz...</p>
                </div>
              </div>
            ) : (
              <>
                {!gameFinished ? (
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">
                          Question {currentQuestion + 1} of {questions.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-kurdish-green h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-8 text-center"
                      >
                        <h2 className="text-2xl font-bold text-textNavy mb-8">
                          What is <span className="text-green-600 font-semibold">{questions[currentQuestion].english}</span> in Kurdish?
                        </h2>

                        {/* Answer Options */}
                        <div className="grid grid-cols-2 gap-4">
                          {questions[currentQuestion].options.map((option) => {
                            const correctKurdish = questions[currentQuestion].kurdish
                            const isSelected = selectedAnswer === option
                            const isCorrect = option === correctKurdish
                            const showAsCorrect = showResult && isCorrect
                            const showAsWrong = showResult && isSelected && !isCorrect
                            const optionBg = showAsCorrect
                              ? 'bg-green-600 text-white'
                              : showAsWrong
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100'
                            return (
                              <motion.button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                className={`${optionBg} p-4 rounded-xl font-bold text-lg transition-colors cursor-pointer`}
                                whileTap={!showResult ? { scale: 0.95 } : undefined}
                                disabled={showResult}
                              >
                                {option}
                              </motion.button>
                            )
                          })}
                        </div>
                        {showResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 mt-6"
                          >
                            <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                              selectedAnswer === questions[currentQuestion].kurdish
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {selectedAnswer === questions[currentQuestion].kurdish ? (
                                <>
                                  <CheckCircle className="w-8 h-8" />
                                  Correct! 🎉
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-8 h-8" />
                                  Incorrect!
                                </>
                              )}
                            </div>
                            {selectedAnswer !== questions[currentQuestion].kurdish && (
                              <div className="text-lg text-gray-700">
                                The correct answer is: <strong>{questions[currentQuestion].kurdish.charAt(0).toUpperCase() + questions[currentQuestion].kurdish.slice(1)}</strong>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  /* Final Results */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-lg p-8 text-center"
                  >
                    <div className="text-6xl mb-6">🏆</div>
                    <h2 className="text-3xl font-bold text-textNavy mb-4">Quiz Complete!</h2>
                    
                    <div className="space-y-4 mb-8">
                      <div className="text-4xl font-bold text-kurdish-red">
                        {score} / {questions.length}
                      </div>
                      <div className={`text-2xl font-bold ${getScoreMessage().color}`}>
                        {getScoreMessage().message}
                      </div>
                      <div className="text-gray-600">
                        You got {Math.round((score / questions.length) * 100)}% correct!
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={restartQuiz}
                        className="bg-kurdish-red text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
                      >
                        <Trophy className="w-5 h-5" />
                        Play Again
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
