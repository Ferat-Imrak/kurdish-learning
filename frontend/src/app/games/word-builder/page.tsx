'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle, RotateCcw, CheckCircle, XCircle, Star, ArrowLeft, Play } from 'lucide-react'
import BackLink from '../../../components/BackLink'
import { useGamesProgress } from '../../../contexts/GamesProgressContext'

interface Word {
  kurdish: string
  english: string
  letters: string[]
  image: string
}

interface Deck {
  name: string
  description: string
  icon: string
  words: Word[]
}

// Helper function to get icon for a word
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

// Helper function to split Kurdish word into letters array
function splitToLetters(kurdish: string): string[] {
  // Handle multi-character Kurdish letters and spaces
  const letters: string[] = []
  let i = 0
  while (i < kurdish.length) {
    const char = kurdish[i]
    // Handle spaces
    if (char === ' ') {
      letters.push(' ')
      i++
      continue
    }
    // Handle special Kurdish characters that might be multi-byte
    letters.push(char)
    i++
  }
  return letters
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

// Convert flashcard cards to Word format
function createWords(cards: Array<{ english: string; kurdish: string }>, category: string): Word[] {
  return cards.map(card => ({
    kurdish: card.kurdish,
    english: card.english.toLowerCase(),
    letters: splitToLetters(card.kurdish),
    image: getIcon(category, card.english, card.kurdish)
  }))
}

// Create category word arrays
const colorsWords = createWords(colorsCards, "colors")
const animalsWords = createWords(animalsCards, "animals")
const foodWords = createWords(foodCards, "food")
const familyWords = createWords(familyCards, "family")
const natureWords = createWords(natureCards, "nature")
const timeWords = createWords(timeCards, "time")
const weatherWords = createWords(weatherCards, "weather")
const houseWords = createWords(houseCards, "house")
const numbersWords = createWords(numbersCards, "numbers")
const daysMonthsWords = createWords(daysMonthsCards, "daysMonths")
const questionWords = createWords(questionWordsCards, "questions")
const pronounsWords = createWords(pronounsCards, "pronouns")
const bodyPartsWords = createWords(bodyPartsCards, "bodyParts")

// Combine all words for Master Challenge
const allWords = [
  ...colorsWords,
  ...animalsWords,
  ...foodWords,
  ...familyWords,
  ...natureWords,
  ...timeWords,
  ...weatherWords,
  ...houseWords,
  ...numbersWords,
  ...daysMonthsWords,
  ...questionWords,
  ...pronounsWords,
  ...bodyPartsWords
]

const categories = [
  { id: "colors", name: "Colors", icon: "🎨", words: colorsWords },
  { id: "animals", name: "Animals", icon: "🐾", words: animalsWords },
  { id: "food", name: "Food & Meals", icon: "🍽️", words: foodWords },
  { id: "family", name: "Family", icon: "👨‍👩‍👧‍👦", words: familyWords },
  { id: "nature", name: "Nature", icon: "🌿", words: natureWords },
  { id: "time", name: "Time", icon: "⏰", words: timeWords },
  { id: "weather", name: "Weather", icon: "🌤️", words: weatherWords },
  { id: "house", name: "House", icon: "🏠", words: houseWords },
  { id: "numbers", name: "Numbers", icon: "🔢", words: numbersWords },
  { id: "daysMonths", name: "Days & Months", icon: "📅", words: daysMonthsWords },
  { id: "questions", name: "Question Words", icon: "❓", words: questionWords },
  { id: "pronouns", name: "Pronouns", icon: "👥", words: pronounsWords },
  { id: "bodyParts", name: "Body Parts", icon: "👤", words: bodyPartsWords }
]

const WORDBUILDER_KEY = (id: string) => `wordbuilder-progress-${id}`

export default function WordBuilderPage() {
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress } = useGamesProgress()

  const getWordBuilderProgress = (categoryId: string): { uniqueWords: number; completedWords: string[] } => {
    const raw = getGamesProgress(WORDBUILDER_KEY(categoryId))
    if (!raw) return { uniqueWords: 0, completedWords: [] }
    if (typeof raw === 'number') return { uniqueWords: raw, completedWords: [] }
    const o = raw as Record<string, unknown>
    return {
      uniqueWords: (o.uniqueWords as number) ?? 0,
      completedWords: Array.isArray(o.completedWords) ? (o.completedWords as string[]) : []
    }
  }

  const saveWordBuilderProgress = (categoryId: string, completedWords: string[]) => {
    saveGamesProgress(WORDBUILDER_KEY(categoryId), { uniqueWords: completedWords.length, completedWords })
  }
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([])
  const [playerWord, setPlayerWord] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [lastWord, setLastWord] = useState<Word | null>(null)
  const [savedCompletedWords, setSavedCompletedWords] = useState<string[]>([]) // Saved progress from localStorage
  const [sessionCompletedWords, setSessionCompletedWords] = useState<string[]>([]) // Words completed in this session
  const [gameCompleted, setGameCompleted] = useState(false) // Track if game is completed
  const [wordsToShow, setWordsToShow] = useState<Word[]>([]) // Pool of words to show (20 unique words)
  const [shownWords, setShownWords] = useState<string[]>([]) // Track which words have been shown in this session

  const shuffleArray = <T extends unknown>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleCategorySelect = (categoryId: string) => {
    window.history.pushState({ view: 'game', category: categoryId }, '', window.location.pathname)
    // Handle Master Challenge separately
    if (categoryId === "master") {
      const allCategoryWords = shuffleArray(allWords)
      // Master Challenge: 30 words
      const targetWords = 30
      let uniqueWordsPool: Word[] = []
      
      if (allCategoryWords.length >= targetWords) {
        // Use exactly 30 unique words (no repeats)
        uniqueWordsPool = allCategoryWords.slice(0, targetWords)
      } else {
        // Repeat words to reach exactly 30
        const repeatsNeeded = Math.ceil(targetWords / allCategoryWords.length)
        for (let i = 0; i < repeatsNeeded; i++) {
          uniqueWordsPool = [...uniqueWordsPool, ...allCategoryWords]
        }
        // Take exactly 30 words
        uniqueWordsPool = uniqueWordsPool.slice(0, targetWords)
      }
      
      const deck: Deck = {
        name: "Master Challenge",
        description: "Ultimate test with all vocabulary mixed together",
        icon: "🏆",
        words: uniqueWordsPool
      }
      
      setSelectedCategory("master")
      setSelectedDeck(deck)
      setWordsToShow(shuffleArray([...uniqueWordsPool]))
      setShownWords([])
      setScore(0)
      setAttempts(0)
      setLastWord(null)
      setGameCompleted(false)
      setSessionCompletedWords([])
      const progress = getWordBuilderProgress("master")
      setSavedCompletedWords(progress.completedWords)
      startNewWord(deck)
      return
    }
    
    // Handle regular categories
    const category = categories.find(c => c.id === categoryId)
    if (!category) return
    
    const allCategoryWords = shuffleArray(category.words)
    
    // Create pool of exactly 20 words
    // If category has < 20 words, repeat words to reach 20
    // If category has >= 20 words, use exactly 20 unique words
    const targetWords = 20
    let uniqueWordsPool: Word[] = []
    
    if (allCategoryWords.length >= targetWords) {
      // Use exactly 20 unique words (no repeats)
      uniqueWordsPool = allCategoryWords.slice(0, targetWords)
    } else {
      // Repeat words to reach exactly 20
      const repeatsNeeded = Math.ceil(targetWords / allCategoryWords.length)
      for (let i = 0; i < repeatsNeeded; i++) {
        uniqueWordsPool = [...uniqueWordsPool, ...allCategoryWords]
      }
      // Take exactly 20 words
      uniqueWordsPool = uniqueWordsPool.slice(0, targetWords)
    }
    
    const deck: Deck = {
      name: categoryId === "master" ? "Master Challenge" : category.name,
      description: categoryId === "master" ? "Ultimate test with all vocabulary mixed together" : `Build ${category.name.toLowerCase()} words`,
      icon: categoryId === "master" ? "🏆" : category.icon,
      words: uniqueWordsPool
    }
    
    setSelectedCategory(categoryId)
    setSelectedDeck(deck)
    setWordsToShow(shuffleArray([...uniqueWordsPool])) // Shuffled copy for this session
    setShownWords([]) // Reset shown words
    setScore(0)
    setAttempts(0)
    setLastWord(null) // Reset last word when starting a new category
    setGameCompleted(false) // Reset game completed state - allow replay even if completed
    setSessionCompletedWords([]) // Reset session progress
    // Load existing completed words for this category (for progress tracking/display)
    const progress = getWordBuilderProgress(categoryId === "master" ? "master" : categoryId)
    setSavedCompletedWords(progress.completedWords)
    // Always start a new game session, even if previously completed
    startNewWord(deck)
  }

  const startNewWord = (deck: Deck = selectedDeck!) => {
    if (!deck || deck.words.length === 0) return
    
    // Use wordsToShow if available, otherwise use deck.words
    const availableWordsPool = wordsToShow.length > 0 ? wordsToShow : deck.words
    
    if (availableWordsPool.length === 0) return
    
    // If we've shown all words in the pool, reset the shown words list
    if (shownWords.length >= availableWordsPool.length && availableWordsPool.length > 0) {
      setShownWords([])
    }
    
    // Filter out words that have already been shown in this session
    const availableWords = availableWordsPool.filter(w => !shownWords.includes(w.kurdish))
    
    // If all words have been shown, reset and use all words
    const wordsToChooseFrom = availableWords.length > 0 ? availableWords : availableWordsPool
    
    // Also filter out the last word to avoid consecutive repeats
    const finalWords = lastWord 
      ? wordsToChooseFrom.filter(w => w.kurdish !== lastWord.kurdish)
      : wordsToChooseFrom
    
    const wordsForSelection = finalWords.length > 0 ? finalWords : wordsToChooseFrom
    
    // Safety check: ensure we have words to choose from
    if (wordsForSelection.length === 0) {
      // Fallback to all words in the pool
      const fallbackWords = availableWordsPool.length > 0 ? availableWordsPool : deck.words
      if (fallbackWords.length === 0) return
      const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
      if (!randomWord || !randomWord.kurdish) return
      setCurrentWord(randomWord)
      setLastWord(randomWord)
      setShownWords([...shownWords, randomWord.kurdish])
      // Set up letters for the word
      const extraLetters = ['a', 'e', 'i', 'o', 'u', 'r', 't', 'n', 's', 'k', 'm', 'p']
      const allLetters = [...randomWord.letters]
      const numExtra = Math.min(4, Math.max(2, 10 - allLetters.length))
      for (let i = 0; i < numExtra; i++) {
        const randomExtra = extraLetters[Math.floor(Math.random() * extraLetters.length)]
        allLetters.push(randomExtra)
      }
      setShuffledLetters(shuffleArray(allLetters))
      setPlayerWord([])
      setIsCorrect(null)
      return
    }
    
    const randomWord = wordsForSelection[Math.floor(Math.random() * wordsForSelection.length)]
    
    // Safety check: ensure randomWord exists
    if (!randomWord || !randomWord.kurdish) {
      return
    }
    
    setCurrentWord(randomWord)
    setLastWord(randomWord)
    // Mark this word as shown
    setShownWords([...shownWords, randomWord.kurdish])
    
    // Add some extra letters to make it challenging
    const extraLetters = ['a', 'e', 'i', 'o', 'u', 'r', 't', 'n', 's', 'k', 'm', 'p']
    const allLetters = [...randomWord.letters]
    
    // Add 2-4 random extra letters
    const numExtra = Math.min(4, Math.max(2, 10 - allLetters.length))
    for (let i = 0; i < numExtra; i++) {
      const randomExtra = extraLetters[Math.floor(Math.random() * extraLetters.length)]
      if (!allLetters.includes(randomExtra)) {
        allLetters.push(randomExtra)
      }
    }
    
    setShuffledLetters(shuffleArray(allLetters))
    setPlayerWord([])
    setIsCorrect(null)
  }

  const addLetter = (letter: string, index: number) => {
    if (!currentWord || playerWord.length >= currentWord.letters.length) return
      setPlayerWord([...playerWord, letter])
      setShuffledLetters(shuffledLetters.filter((_, i) => i !== index))
  }

  const removeLetter = (index: number) => {
    const letter = playerWord[index]
    setPlayerWord(playerWord.filter((_, i) => i !== index))
    setShuffledLetters([...shuffledLetters, letter])
  }

  const checkWord = () => {
    if (!currentWord) return
    const built = playerWord.join('')
    const correct = built === currentWord.kurdish
    setIsCorrect(correct)
    setAttempts(attempts + 1)
    
    if (correct) {
      const newScore = score + 1
      setScore(newScore)
      
      // Track unique word completions for this session
      if (selectedCategory && !sessionCompletedWords.includes(currentWord.kurdish)) {
        const updatedSessionWords = [...sessionCompletedWords, currentWord.kurdish]
        setSessionCompletedWords(updatedSessionWords)
        
        // Save progress only if this is a new word not in saved progress
        if (!savedCompletedWords.includes(currentWord.kurdish)) {
          const updatedSavedWords = [...savedCompletedWords, currentWord.kurdish]
          setSavedCompletedWords(updatedSavedWords)
          const categoryId = selectedCategory === "master" ? "master" : selectedCategory
          saveWordBuilderProgress(categoryId, updatedSavedWords)
        }
        
        // Check if game is completed
        // Master Challenge: 30 words, regular categories: 20 words
        const targetWords = selectedCategory === "master" ? 30 : 20
        if (updatedSessionWords.length >= targetWords) {
          setGameCompleted(true)
          return // Don't start a new word if game is completed
        }
      }
      
      // Only start new word if game is not completed
      // Use a small delay to ensure state updates
      setTimeout(() => {
        if (!gameCompleted) {
          startNewWord()
        }
      }, 2000)
    }
  }

  const resetWord = () => {
    setShuffledLetters([...shuffledLetters, ...playerWord])
    setPlayerWord([])
    setIsCorrect(null)
  }

  const shuffleLetters = () => {
    setShuffledLetters(shuffleArray(shuffledLetters))
  }

  // Sync browser history with category vs in-game view so browser back works correctly
  useEffect(() => {
    const onPopState = () => resetDeck()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const resetDeck = () => {
    setSelectedCategory(null)
    setSelectedDeck(null)
    setCurrentWord(null)
    setShuffledLetters([])
    setPlayerWord([])
    setIsCorrect(null)
    setScore(0)
    setAttempts(0)
    setLastWord(null)
    setSavedCompletedWords([])
    setSessionCompletedWords([])
    setGameCompleted(false)
    setWordsToShow([])
    setShownWords([])
  }

  // Show category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6 md:max-w-[1320px]">
          <BackLink href="/games" label="Back to Games" />
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-kurdish-red text-center">Word Builder</h1>
          </div>

          <div className="max-w-4xl mx-auto md:max-w-none">
            <p className="text-center text-lg text-gray-700 mb-8 md:text-base md:text-gray-500 md:mb-6">
              Choose a category to start building Kurdish words letter by letter!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 md:max-w-[1320px] md:mx-auto">
              {/* Category cards */}
              {categories.map((category) => {
                const progress = getWordBuilderProgress(category.id)
                const uniqueWordsCompleted = progress.uniqueWords
                const targetWords = 20
                const isCompleted = uniqueWordsCompleted >= targetWords
                const progressPercentage = Math.min(100, Math.round((uniqueWordsCompleted / targetWords) * 100))
                const showPercent = progressPercentage > 0 || isCompleted
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center md:p-5 md:rounded-2xl md:flex md:flex-col md:h-full md:items-stretch md:text-left md:hover:shadow-xl md:hover:-translate-y-0.5 md:hover:ring-2 md:hover:ring-primaryBlue/30 md:focus-visible:outline md:focus-visible:ring-2 md:focus-visible:ring-primaryBlue md:focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <div className="text-4xl mb-3 md:mb-4 md:flex md:justify-center">
                      <span className="md:w-11 md:h-11 md:rounded-2xl md:bg-primaryBlue/5 md:flex md:items-center md:justify-center md:inline-flex md:text-2xl">
                        {category.icon}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800 md:text-lg md:font-semibold md:mb-1">{category.name}</div>
                    <div className="text-sm text-gray-500 mt-1 md:text-sm md:text-gray-500">
                      20 words
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
                          style={{ width: `${isCompleted ? 100 : progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                )
              })}
              
              {/* Master Challenge */}
              {(() => {
                const progress = getWordBuilderProgress("master")
                const uniqueWordsCompleted = progress.uniqueWords
                const targetWords = 30 // Master Challenge: 30 words
                const isCompleted = uniqueWordsCompleted >= targetWords
                const progressPercentage = Math.min(100, Math.round((uniqueWordsCompleted / targetWords) * 100))
                const showPercent = progressPercentage > 0 || isCompleted
                
                return (
                  <button
                    onClick={() => handleCategorySelect("master")}
                    className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center md:p-5 md:rounded-2xl md:flex md:flex-col md:h-full md:items-stretch md:text-left md:hover:shadow-xl md:hover:-translate-y-0.5 md:hover:ring-2 md:hover:ring-primaryBlue/30 md:focus-visible:outline md:focus-visible:ring-2 md:focus-visible:ring-primaryBlue md:focus-visible:ring-offset-2 cursor-pointer"
                  >
                    <div className="text-4xl mb-3 md:mb-4 md:flex md:justify-center">
                      <span className="md:w-11 md:h-11 md:rounded-2xl md:bg-primaryBlue/5 md:flex md:items-center md:justify-center md:inline-flex md:text-2xl">
                        🏆
                      </span>
                    </div>
                    <div className="font-semibold text-gray-800 md:text-lg md:font-semibold md:mb-1">Master Challenge</div>
                    <div className="text-sm text-gray-500 mt-1 md:text-sm md:text-gray-500">
                      30 words
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
                          style={{ width: `${isCompleted ? 100 : progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentCategory = categories.find(c => c.id === selectedCategory) || { name: "Master Challenge", icon: "🏆" }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                resetDeck()
                window.history.back()
              }}
              className="text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Categories
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">
            {currentCategory.icon} {currentCategory.name}
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Game Description and Progress */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-2">
              Build Kurdish words letter by letter!
            </p>
            {selectedDeck && (() => {
              const targetWords = selectedDeck.words.length
              return (
                <div className="text-gray-700">
                  <div className="text-lg font-semibold">
                    {sessionCompletedWords.length} / {targetWords}
                  </div>
                  <div className="text-sm text-gray-500">Words Completed</div>
                </div>
              )
            })()}
          </div>
          
          {/* Game Completed Screen */}
          {gameCompleted && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-kurdish-red mb-4">
                Congratulations!
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                You've completed this category!
              </p>
              <div className="flex gap-4 justify-center">
              </div>
            </div>
          )}
          
          {/* Word to Build */}
          {currentWord && !gameCompleted && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
              <div className="text-6xl mb-4">{currentWord.image}</div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                Build: {currentWord.english.charAt(0).toUpperCase() + currentWord.english.slice(1)}
              </div>
            </div>
          )}

          {/* Player's Word */}
          {currentWord && !gameCompleted && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Your Word:</h3>
              <div className="flex justify-center gap-2 mb-4 min-h-[60px]">
                {Array.from({ length: currentWord.letters.length }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => playerWord[index] && removeLetter(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {playerWord[index] && (
                      <span className="text-xl font-bold text-kurdish-red">
                        {playerWord[index]}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetWord}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={shuffleLetters}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
                <button
                  onClick={checkWord}
                  disabled={!currentWord || playerWord.length !== currentWord.letters.length}
                  className="bg-kurdish-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-kurdish-green/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Check Word
                </button>
              </div>
            </div>
          )}

          {/* Available Letters */}
          {currentWord && !gameCompleted && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Available Letters:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {shuffledLetters.map((letter, index) => (
                  <motion.button
                    key={`${letter}-${index}`}
                    onClick={() => addLetter(letter, index)}
                    className="w-12 h-12 bg-kurdish-red text-white rounded-lg font-bold text-lg hover:bg-kurdish-red/90 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {isCorrect !== null && currentWord && !gameCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`text-center p-6 rounded-xl ${
                  isCorrect 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-8 h-8" />
                      Excellent! 🎉
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8" />
                      Try again! 💪
                    </>
                  )}
                </div>
                {isCorrect && (
                  <div className="mt-2">
                    The word {currentWord.kurdish.charAt(0).toUpperCase() + currentWord.kurdish.slice(1)} means {currentWord.english.charAt(0).toUpperCase() + currentWord.english.slice(1)}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
