"use client"

import { useEffect, useState } from "react"

type Item = { id: string; left: string; right: string }

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

// Create items from flashcards data
function createItems(cards: Array<{ english: string; kurdish: string }>, category: string, prefix: string): Item[] {
  return cards.map((card, index) => ({
    id: `${prefix}${index + 1}`,
    left: `${getIcon(category, card.english, card.kurdish)} ${card.english}`,
    right: card.kurdish
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

// Create category pools
const categoryPools: Record<string, Item[]> = {
  colors: createItems(colorsCards, "colors", "c"),
  animals: createItems(animalsCards, "animals", "a"),
  food: createItems(foodCards, "food", "f"),
  family: createItems(familyCards, "family", "fm"),
  nature: createItems(natureCards, "nature", "n"),
  time: createItems(timeCards, "time", "t"),
  weather: createItems(weatherCards, "weather", "w"),
  house: createItems(houseCards, "house", "h"),
  numbers: createItems(numbersCards, "numbers", "num"),
  daysMonths: createItems(daysMonthsCards, "daysMonths", "d"),
  questions: createItems(questionWordsCards, "questions", "q"),
  pronouns: createItems(pronounsCards, "pronouns", "p"),
  bodyParts: createItems(bodyPartsCards, "bodyParts", "b")
}

// Combine all items for Master Challenge
const allItems = [
  ...categoryPools.colors,
  ...categoryPools.animals,
  ...categoryPools.food,
  ...categoryPools.family,
  ...categoryPools.nature,
  ...categoryPools.time,
  ...categoryPools.weather,
  ...categoryPools.house,
  ...categoryPools.numbers,
  ...categoryPools.daysMonths,
  ...categoryPools.questions,
  ...categoryPools.pronouns,
  ...categoryPools.bodyParts
]

const categories = [
  { id: "colors", name: "Colors", icon: "🎨" },
  { id: "animals", name: "Animals", icon: "🐾" },
  { id: "food", name: "Food & Meals", icon: "🍽️" },
  { id: "family", name: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "nature", name: "Nature", icon: "🌿" },
  { id: "time", name: "Time", icon: "⏰" },
  { id: "weather", name: "Weather", icon: "🌤️" },
  { id: "house", name: "House", icon: "🏠" },
  { id: "numbers", name: "Numbers", icon: "🔢" },
  { id: "daysMonths", name: "Days & Months", icon: "📅" },
  { id: "questions", name: "Question Words", icon: "❓" },
  { id: "pronouns", name: "Pronouns", icon: "👥" },
  { id: "bodyParts", name: "Body Parts", icon: "👤" }
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Helper functions for progress tracking
const getMatchingProgress = (categoryId: string): number => {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem(`matching-progress-${categoryId}`)
  return stored ? JSON.parse(stored) : 0
}

const saveMatchingProgress = (categoryId: string, roundsCompleted: number) => {
  if (typeof window === 'undefined') return
  const existing = localStorage.getItem(`matching-progress-${categoryId}`)
  const bestRounds = existing ? Math.max(JSON.parse(existing), roundsCompleted) : roundsCompleted
  localStorage.setItem(`matching-progress-${categoryId}`, JSON.stringify(bestRounds))
}

export default function MatchingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [deckIndex, setDeckIndex] = useState(0)
  const [leftList, setLeftList] = useState<Item[]>([])
  const [rightList, setRightList] = useState<Item[]>([])
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, boolean>>({})
  const [completed, setCompleted] = useState(false)

  // Initialize game when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const items = selectedCategory === "master" ? allItems : categoryPools[selectedCategory]
      if (items) {
        const size = Math.min(4, items.length)
        const candidates = shuffle(items).slice(0, size)
        setLeftList(candidates)
        setRightList(shuffle(candidates))
        setMatched({})
        setSelectedLeft(null)
        setCompleted(false)
      }
    }
  }, [selectedCategory, deckIndex])

  // Advance when all matched
  useEffect(() => {
    if (leftList.length > 0 && leftList.every(it => matched[it.id])) {
      setCompleted(true)
      
      // Save progress when a round is completed
      if (selectedCategory) {
        const categoryId = selectedCategory === "master" ? "master" : selectedCategory
        saveMatchingProgress(categoryId, deckIndex + 1)
      }
      
      const t = setTimeout(() => {
        setDeckIndex((i) => i + 1)
      }, 900)
      return () => clearTimeout(t)
    }
  }, [matched, leftList, selectedCategory, deckIndex])

  const handleRight = (id: string) => {
    if (!selectedLeft) return
    if (selectedLeft === id) {
      setMatched((m) => ({ ...m, [id]: true }))
      setSelectedLeft(null)
    } else {
      setSelectedLeft(null)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setDeckIndex(0)
  }

  // Show category selection screen
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-kurdish-red text-center">Matching Game</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm sm:text-base md:text-lg text-gray-700 mb-8">
              Choose a category to start matching Kurdish words with pictures!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const roundsCompleted = getMatchingProgress(category.id)
                const isCompleted = roundsCompleted >= 10
                const progressPercentage = Math.min(100, Math.round((roundsCompleted / 10) * 100))
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center"
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <div className="font-semibold text-gray-800">{category.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {categoryPools[category.id]?.length || 0} words
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className={`text-xs font-semibold ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {isCompleted ? 'Completed' : `${progressPercentage}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-600' 
                              : 'bg-gradient-to-r from-primaryBlue to-supportLavender'
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
                const roundsCompleted = getMatchingProgress("master")
                const isCompleted = roundsCompleted >= 50
                const progressPercentage = Math.min(100, Math.round((roundsCompleted / 50) * 100))
                
                return (
                  <button
                    onClick={() => handleCategorySelect("master")}
                    className="card p-6 hover:shadow-lg transition-all hover:scale-105 text-center"
                  >
                    <div className="text-4xl mb-3">🏆</div>
                    <div className="font-semibold text-gray-800">Master Challenge</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {allItems.length} words
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Progress</span>
                        <span className={`text-xs font-semibold ${
                          isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {isCompleted ? 'Completed' : `${progressPercentage}%`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-600' 
                              : 'bg-gradient-to-r from-primaryBlue to-supportLavender'
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

  const currentCategory = selectedCategory === "master" 
    ? { name: "Master Challenge", icon: "🏆" }
    : categories.find(c => c.id === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-kurdish-red text-center">
            {currentCategory?.icon} {currentCategory?.name}
          </h1>
        </div>

        <div className="max-w-3xl mx-auto mb-4 text-center text-gray-700">
          Round {deckIndex + 1} / {selectedCategory === "master" ? 50 : 10} {completed ? '• Great job!' : ''}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="card p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-4 text-center text-gray-700">English & Picture</h3>
            <div className="space-y-2">
              {leftList.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setSelectedLeft(it.id)}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl border text-sm sm:text-base ${selectedLeft === it.id ? 'border-kurdish-red bg-kurdish-red/5' : 'border-gray-200 hover:border-kurdish-red/50'} ${matched[it.id] ? 'opacity-50 cursor-default' : ''}`}
                  disabled={matched[it.id]}
                >
                  {it.left}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-4 text-center text-gray-700">Kurdish</h3>
            <div className="space-y-2">
              {rightList.map((it) => (
                <button
                  key={it.id}
                  onClick={() => handleRight(it.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border ${matched[it.id] ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-kurdish-red/50'}`}
                  disabled={matched[it.id]}
                >
                  {it.right}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
