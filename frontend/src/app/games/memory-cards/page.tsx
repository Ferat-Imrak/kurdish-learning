'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, Clock, Star, ArrowLeft } from 'lucide-react'

interface CardPair {
  kurdish: string
  english: string
  image: string
}

interface Card {
  id: number
  kurdish: string
  english: string
  image: string
  type: 'kurdish' | 'image'
  pairId: number
}

interface Deck {
  name: string
  description: string
  icon: string
  pairs: CardPair[]
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
    // Use plain text for all numbers to keep them consistent
    const numTextMap: Record<string, string> = {
      "One": "1", "Two": "2", "Three": "3", "Four": "4",
      "Five": "5", "Six": "6", "Seven": "7", "Eight": "8",
      "Nine": "9", "Ten": "10",
      "Eleven": "11", "Twelve": "12", "Thirteen": "13", "Fourteen": "14",
      "Fifteen": "15", "Sixteen": "16", "Seventeen": "17", "Eighteen": "18",
      "Nineteen": "19", "Twenty": "20"
    }
    return numTextMap[english] || "🔢"
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

// Helper function to create CardPairs from flashcard cards
function createCardPairs(
  cards: Array<{ english: string; kurdish: string }>, 
  category: string
): CardPair[] {
  return cards.map(card => ({
    kurdish: card.kurdish,
    english: card.english.toLowerCase(),
    image: getIcon(category, card.english, card.kurdish)
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

// Create card pairs from flashcard data
const colorsPairs = createCardPairs(colorsCards, "colors")
const animalsPairs = createCardPairs(animalsCards, "animals")
const foodPairs = createCardPairs(foodCards, "food")
const familyPairs = createCardPairs(familyCards, "family")
const naturePairs = createCardPairs(natureCards, "nature")
const timePairs = createCardPairs(timeCards, "time")
const weatherPairs = createCardPairs(weatherCards, "weather")
const housePairs = createCardPairs(houseCards, "house")
const numbersPairs = createCardPairs(numbersCards, "numbers")
const daysMonthsPairs = createCardPairs(daysMonthsCards, "daysMonths")
const questionWordsPairs = createCardPairs(questionWordsCards, "questions")
const pronounsPairs = createCardPairs(pronounsCards, "pronouns")
const bodyPartsPairs = createCardPairs(bodyPartsCards, "bodyParts")

  // Combine all pairs for Master Challenge
  const allPairs = [
    ...colorsPairs,
    ...animalsPairs,
    ...foodPairs,
    ...naturePairs,
    ...housePairs,
    ...weatherPairs,
    ...numbersPairs,
    ...bodyPartsPairs
  ]

  // Create decks
  const decks: Deck[] = [
    {
      name: "Colors",
      description: "Match colors in Kurdish",
      icon: "🎨",
      pairs: colorsPairs
    },
    {
      name: "Animals",
      description: "Match animal names",
      icon: "🐾",
      pairs: animalsPairs
    },
    {
      name: "Food & Meals",
      description: "Match food vocabulary",
      icon: "🍽️",
      pairs: foodPairs
    },
    {
      name: "Nature",
      description: "Match nature vocabulary",
      icon: "🌿",
      pairs: naturePairs
    },
    {
      name: "Weather & Seasons",
      description: "Match weather vocabulary",
      icon: "🌤️",
      pairs: weatherPairs
    },
    {
      name: "House & Objects",
      description: "Match household items",
      icon: "🏠",
      pairs: housePairs
    },
    {
      name: "Numbers",
    description: "Match numbers 1-20",
      icon: "🔢",
      pairs: numbersPairs
    },
    {
      name: "Body Parts",
      description: "Match body part names",
      icon: "👤",
      pairs: bodyPartsPairs
    },
    {
      name: "Master Challenge",
      description: "All vocabulary categories mixed together",
      icon: "🏆",
      pairs: [] // Will be populated dynamically
    }
  ]

// Helper functions for progress tracking
const getMemoryCardsProgress = (deckName: string): { completed: boolean; completedDifficulties: number; percentage: number } | null => {
  if (typeof window === 'undefined') return null
  // Check all difficulty levels - category is completed only when all 3 are done
  const difficulties = ['easy', 'medium', 'hard']
  let completedCount = 0
  
  for (const difficulty of difficulties) {
    const stored = localStorage.getItem(`memorycards-progress-${deckName}-${difficulty}`)
    if (stored) {
      const progress = JSON.parse(stored)
      if (progress.completed) {
        completedCount++
      }
    }
  }
  
  const percentage = Math.round((completedCount / 3) * 100)
  const completed = completedCount === 3
  
  return { completed, completedDifficulties: completedCount, percentage }
}

const saveMemoryCardsProgress = (deckName: string, difficulty: string) => {
  if (typeof window === 'undefined') return
  const key = `memorycards-progress-${deckName}-${difficulty}`
  localStorage.setItem(key, JSON.stringify({ completed: true, difficulty }))
}

export default function MemoryCardsPage() {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameStarted && !gameWon) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [gameStarted, gameWon])

  useEffect(() => {
    if (matchedPairs.length === cards.length / 2 && cards.length > 0) {
      setGameWon(true)
      setGameStarted(false)
      // Save progress when game is won
      if (selectedDeck) {
        saveMemoryCardsProgress(selectedDeck.name, difficulty)
      }
    }
  }, [matchedPairs.length, cards.length, selectedDeck, difficulty])

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Handle deck selection
  const handleDeckSelect = (deck: Deck) => {
    // Map deck names to their corresponding pairs arrays
    const deckPairsMap: { [key: string]: CardPair[] } = {
      "Colors": colorsPairs,
      "Animals": animalsPairs,
      "Food & Meals": foodPairs,
      "Nature": naturePairs,
      "Weather & Seasons": weatherPairs,
      "House & Objects": housePairs,
      "Numbers": numbersPairs,
      "Body Parts": bodyPartsPairs
    }

    // Get the source pairs for this deck
    let sourcePairs = deckPairsMap[deck.name] || deck.pairs

    // For Master Challenge, use all pairs
    if (deck.name === "Master Challenge") {
      sourcePairs = shuffleArray(allPairs)
    } else {
      sourcePairs = shuffleArray(sourcePairs)
    }

    setSelectedDeck({ ...deck, pairs: sourcePairs })
    setDifficulty('easy') // Reset to easy when selecting new deck
    setGameStarted(false)
    setGameWon(false)
  }

  // Reset deck selection
  const resetDeck = () => {
    setSelectedDeck(null)
    setCards([])
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setGameWon(false)
    setGameStarted(false)
    setTimeElapsed(0)
    setDifficulty('easy')
  }

  const getDifficultyPairs = () => {
    switch (difficulty) {
      case 'easy': return 6
      case 'medium': return 8
      case 'hard': return 12
      default: return 6
    }
  }

  const initializeGame = () => {
    if (!selectedDeck) return

    const numPairs = Math.min(getDifficultyPairs(), selectedDeck.pairs.length)
    const selectedPairs = selectedDeck.pairs.slice(0, numPairs)
    
    const gameCards: Card[] = []
    selectedPairs.forEach((pair, index) => {
      gameCards.push({
        id: index * 2,
        kurdish: pair.kurdish,
        english: pair.english,
        image: pair.image,
        type: 'kurdish',
        pairId: index
      })
      gameCards.push({
        id: index * 2 + 1,
        kurdish: pair.kurdish,
        english: pair.english,
        image: pair.image,
        type: 'image',
        pairId: index
      })
    })

    const shuffledCards = shuffleArray(gameCards)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setGameWon(false)
    setGameStarted(true)
    setTimeElapsed(0)
  }

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedPairs.includes(cards.find(c => c.id === cardId)?.pairId || -1)) {
      return
    }

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)
      
      const card1 = cards.find(c => c.id === newFlippedCards[0])
      const card2 = cards.find(c => c.id === newFlippedCards[1])

      if (card1 && card2 && card1.pairId === card2.pairId) {
        setMatchedPairs([...matchedPairs, card1.pairId])
        setFlippedCards([])
      } else {
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const resetGame = () => {
    setCards([])
    setFlippedCards([])
    setMatchedPairs([])
    setMoves(0)
    setGameWon(false)
    setGameStarted(false)
    setTimeElapsed(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getGridCols = () => {
    switch (difficulty) {
      case 'easy': return 'grid-cols-4'
      case 'medium': return 'grid-cols-4'
      case 'hard': return 'grid-cols-6'
      default: return 'grid-cols-4'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      {/* Game Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Memory Cards</h1>
            </div>

        {!selectedDeck ? (
          /* Deck Selection Screen */
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-lg text-gray-700 mb-8">
              Choose a category to start matching Kurdish words with pictures!
            </p>
            
            {/* Deck Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {decks.map((deck) => {
                const progress = getMemoryCardsProgress(deck.name)
                const isCompleted = progress?.completed || false
                const percentage = progress?.percentage || 0
                
                return (
                  <button
                    key={deck.name}
                    onClick={() => handleDeckSelect(deck)}
                    className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center"
                  >
                    <div className="text-4xl mb-3">{deck.icon}</div>
                    <div className="font-semibold text-gray-800">{deck.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {deck.name === "Master Challenge" 
                        ? `${allPairs.length} pairs` 
                        : `${deck.pairs.length} pairs`}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className={`text-xs font-semibold ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {isCompleted ? 'Completed' : `${percentage}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-600' 
                              : 'bg-gradient-to-r from-primaryBlue to-supportLavender'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Game Screen */
        <div className="max-w-4xl mx-auto">
          {!gameStarted && !gameWon ? (
              /* Difficulty Selection */
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{selectedDeck.icon}</div>
                  <h2 className="text-3xl font-bold text-textNavy mb-2">{selectedDeck.name}</h2>
                  <p className="text-gray-600">{selectedDeck.description}</p>
                </div>
              
              {/* Difficulty Selection */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-textNavy">Choose Difficulty:</h3>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {[
                    { level: 'easy' as const, label: 'Easy', pairs: 6, color: 'bg-green-100 text-green-800' },
                    { level: 'medium' as const, label: 'Medium', pairs: 8, color: 'bg-yellow-100 text-yellow-800' },
                    { level: 'hard' as const, label: 'Hard', pairs: 12, color: 'bg-red-100 text-red-800' }
                  ].map(({ level, label, pairs, color }) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`p-4 rounded-xl font-bold border-2 transition-all ${
                        difficulty === level 
                          ? 'border-kurdish-green bg-kurdish-green text-white' 
                          : `border-gray-300 ${color}`
                      }`}
                    >
                      <div>{label}</div>
                      <div className="text-sm opacity-80">{pairs} pairs</div>
                    </button>
                  ))}
                </div>
              </div>

                <div className="flex gap-4 justify-center">
              <button
                onClick={initializeGame}
                className="bg-kurdish-green text-white px-8 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-transform duration-200"
              >
                Start Game
              </button>
                </div>
            </div>
          ) : gameWon ? (
            /* Victory Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center"
            >
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-textNavy mb-6">Congratulations!</h2>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-backgroundCream p-4 rounded-lg">
                  <div className="text-2xl font-bold text-kurdish-red">{moves}</div>
                  <div className="text-sm text-gray-600">Moves</div>
                </div>
                <div className="bg-backgroundCream p-4 rounded-lg">
                  <div className="text-2xl font-bold text-kurdish-red">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-gray-600">Time</div>
                </div>
                <div className="bg-backgroundCream p-4 rounded-lg">
                  <div className="text-2xl font-bold text-kurdish-red">{difficulty}</div>
                  <div className="text-sm text-gray-600">Level</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={initializeGame}
                  className="bg-kurdish-green text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-200"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          ) : (
            /* Game Board */
            <div className="space-y-6">
                {/* Stats Bar */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-kurdish-red">{moves}</div>
                      <div className="text-sm text-gray-600">Moves</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-kurdish-red">{formatTime(timeElapsed)}</div>
                      <div className="text-sm text-gray-600">Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-kurdish-red">{matchedPairs.length} / {cards.length / 2}</div>
                      <div className="text-sm text-gray-600">Matched</div>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-kurdish-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(matchedPairs.length / (cards.length / 2)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Cards Grid */}
              <div className={`grid ${getGridCols()} gap-4`}>
                {cards.map((card) => {
                  const isFlipped = flippedCards.includes(card.id)
                  const isMatched = matchedPairs.includes(card.pairId)
                  
                  return (
                    <motion.div
                      key={card.id}
                      className="aspect-square"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className={`w-full h-full rounded-xl cursor-pointer relative ${
                          isMatched 
                            ? 'bg-green-100 border-2 border-green-400' 
                            : 'bg-white border-2 border-gray-300 hover:border-kurdish-green'
                        }`}
                        onClick={() => handleCardClick(card.id)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isFlipped || isMatched ? (
                            <div className="text-center">
                              {card.type === 'image' ? (
                                <div className={`mb-1 ${/^\d+$/.test(card.image) ? 'text-5xl font-bold text-kurdish-red' : 'text-4xl'}`}>
                                  {card.image}
                                </div>
                              ) : (
                                <div className="text-lg font-bold text-kurdish-red">{card.kurdish}</div>
                              )}
                              {isMatched && (
                                <Star className="w-6 h-6 text-yellow-500 mx-auto mt-1" />
                              )}
                            </div>
                          ) : (
                            <div className="text-4xl text-gray-400">?</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={resetGame}
                    className="bg-gray-500 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-200 flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset Game
                  </button>
                </div>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}
