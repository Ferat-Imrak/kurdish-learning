"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Apple, Coffee, Circle, Triangle, ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

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

const foodItems = [
  // Fruits (12 items)
  { ku: "sêv", en: "apple", icon: "🍎", category: "fruit" },
  { ku: "pirteqal", en: "orange", icon: "🍊", category: "fruit" },
  { ku: "mûz", en: "banana", icon: "🍌", category: "fruit" },
  { ku: "tû", en: "mulberry", icon: "🫐", category: "fruit" },
  { ku: "hinar", en: "pomegranate", icon: "🔴", category: "fruit" },
  { ku: "xox", en: "peach", icon: "🍑", category: "fruit" },
  { ku: "hêjîr", en: "fig", icon: "🟤", category: "fruit" },
  { ku: "zeytûn", en: "olive", icon: "🫒", category: "fruit" },
  { ku: "tirî", en: "grape", icon: "🍇", category: "fruit" },
  { ku: "leymûn", en: "lemon", icon: "🍋", category: "fruit" },
  { ku: "zebeş", en: "watermelon", icon: "🍉", category: "fruit" },
  { ku: "şeftalî", en: "peach", icon: "🍑", category: "fruit" },
  
  // Vegetables (12 items)
  { ku: "gizêr", en: "carrot", icon: "🥕", category: "vegetable" },
  { ku: "kartol", en: "potato", icon: "🥔", category: "vegetable" },
  { ku: "pîvaz", en: "onion", icon: "🧅", category: "vegetable" },
  { ku: "sîr", en: "garlic", icon: "🧄", category: "vegetable" },
  { ku: "bacansor", en: "tomato", icon: "🍅", category: "vegetable" },
  { ku: "xiyar", en: "cucumber", icon: "🥒", category: "vegetable" },
  { ku: "kelem", en: "cabbage", icon: "🥬", category: "vegetable" },
  { ku: "îspenax", en: "spinach", icon: "🥬", category: "vegetable" },
  { ku: "bacanreş", en: "eggplant", icon: "🍆", category: "vegetable" },
  { ku: "îsot", en: "pepper", icon: "🫑", category: "vegetable" },
  { ku: "kivark", en: "mushroom", icon: "🍄", category: "vegetable" },
  { ku: "garis", en: "corn", icon: "🌽", category: "vegetable" },
  
  // Proteins (12 items)
  { ku: "masî", en: "fish", icon: "🐟", category: "protein" },
  { ku: "hêk", en: "egg", icon: "🥚", category: "protein" },
  { ku: "goşt", en: "meat", icon: "🥩", category: "protein" },
  { ku: "mirîşk", en: "chicken", icon: "🐔", category: "protein" },
  { ku: "berx", en: "lamb", icon: "🐑", category: "protein" },
  { ku: "nok", en: "beans", icon: "🫘", category: "protein" },
  { ku: "nîsk", en: "lentils", icon: "🫘", category: "protein" },
  { ku: "elok", en: "turkey", icon: "🦃", category: "protein" },
  { ku: "fistîq", en: "pistachios", icon: "🥜", category: "protein" },
  { ku: "behîv", en: "almonds", icon: "🥜", category: "protein" },
  
  // Dairy (12 items)
  { ku: "şîr", en: "milk", icon: "🥛", category: "dairy" },
  { ku: "mast", en: "yogurt", icon: "🍶", category: "dairy" },
  { ku: "penîr", en: "cheese", icon: "🧀", category: "dairy" },
  { ku: "rûn", en: "butter", icon: "🧈", category: "dairy" },
  { ku: "qeymax", en: "cream", icon: "🥛", category: "dairy" },
  { ku: "dew", en: "yogurt drink", icon: "🥛", category: "dairy" },
  
  // Grains (12 items)
  { ku: "nan", en: "bread", icon: "🍞", category: "grain" },
  { ku: "birinc", en: "rice", icon: "🍚", category: "grain" },
  { ku: "genim", en: "wheat", icon: "🌾", category: "grain" },
  { ku: "ceh", en: "barley", icon: "🌾", category: "grain" },
  { ku: "bulgur", en: "bulgur", icon: "🌾", category: "grain" },
  { ku: "makarna", en: "pasta", icon: "🍝", category: "grain" },
  { ku: "kek", en: "cake", icon: "🍰", category: "grain" },
  { ku: "kurabiye", en: "cookie", icon: "🍪", category: "grain" },
  
  // Drinks (12 items)
  { ku: "qehwe", en: "coffee", icon: "☕", category: "drink" },
  { ku: "çay", en: "tea", icon: "🍵", category: "drink" },
  { ku: "av", en: "water", icon: "💧", category: "drink" },
  { ku: "şerbet", en: "sherbet", icon: "🧃", category: "drink" },
  { ku: "limonata", en: "lemonade", icon: "🍋", category: "drink" },
  
]

// Add audioFile paths for food items
const foodItemsWithAudio = foodItems.map(item => {
  // Special case: "şîr" (milk) needs a different filename to avoid collision with "sîr" (garlic)
  let filename = getAudioFilename(item.ku);
  if (item.ku === "şîr") {
    filename = "shir-milk";
  }
  return {
    ...item,
    audioFile: `/audio/kurdish-tts-mp3/food/${filename}.mp3`
  };
})

const mealTimes = [
  { ku: "taştê", en: "breakfast", icon: "🌅", audioFile: "/audio/kurdish-tts-mp3/food/taste.mp3" },
  { ku: "xwarina nîvro", en: "lunch", icon: "☀️", audioFile: "/audio/kurdish-tts-mp3/food/xwarina-nivro.mp3" },
  { ku: "xwarina êvarê", en: "dinner", icon: "🌙", audioFile: "/audio/kurdish-tts-mp3/food/xwarina-evare.mp3" },
  { ku: "çay", en: "snack", icon: "🍪", audioFile: "/audio/kurdish-tts-mp3/food/cay.mp3" },
]

const foodQuestions = [
  { ku: "Tu çi dixwazî ji bo taştê?", en: "What do you want for breakfast?", audioFile: "/audio/kurdish-tts-mp3/food/tu-ci-dixwazi-ji-bo-taste.mp3" },
  { ku: "Tu taştê hez dikî?", en: "Do you like breakfast?", audioFile: "/audio/kurdish-tts-mp3/food/tu-taste-hez-diki.mp3" },
  { ku: "Tu çi dixwazî ji bo xwarina êvarê?", en: "What do you want for dinner?", audioFile: "/audio/kurdish-tts-mp3/food/tu-ci-dixwazi-ji-bo-xwarina-evare.mp3" },
  { ku: "Tu çi xwarin hez dikî?", en: "What food do you like?", audioFile: "/audio/kurdish-tts-mp3/food/tu-ci-xwarin-hez-diki.mp3" },
  { ku: "Tu çi vexwarin hez dikî?", en: "What drink do you like?", audioFile: "/audio/kurdish-tts-mp3/food/tu-ci-vexwarin-hez-diki.mp3" },
  { ku: "Tu masî hez dikî?", en: "Do you like fish?", audioFile: "/audio/kurdish-tts-mp3/food/tu-masi-hez-diki.mp3" },
  { ku: "Tu goşt hez dikî?", en: "Do you like meat?", audioFile: "/audio/kurdish-tts-mp3/food/tu-gost-hez-diki.mp3" },
  { ku: "Tu sêv hez dikî?", en: "Do you like apples?", audioFile: "/audio/kurdish-tts-mp3/food/tu-sev-hez-diki.mp3" },
]

const responses = [
  { ku: "Erê, ez hez dikim", en: "Yes, I like it", audioFile: "/audio/kurdish-tts-mp3/food/ere-ez-hez-dikim.mp3" },
  { ku: "Na, ez hez nakim", en: "No, I don't like it", audioFile: "/audio/kurdish-tts-mp3/food/na-ez-hez-nakim.mp3" },
  { ku: "Ez hez dikim", en: "I like it", audioFile: "/audio/kurdish-tts-mp3/food/ez-hez-dikim.mp3" },
  { ku: "Ez hez nakim", en: "I don't like it", audioFile: "/audio/kurdish-tts-mp3/food/ez-hez-nakim.mp3" },
  { ku: "Ez pir hez dikim", en: "I really like it", audioFile: "/audio/kurdish-tts-mp3/food/ez-pir-hez-dikim.mp3" },
  { ku: "Xweş e", en: "It's good", audioFile: "/audio/kurdish-tts-mp3/food/xwes-e.mp3" },
  { ku: "Xweş nîne", en: "It's not good", audioFile: "/audio/kurdish-tts-mp3/food/xwes-nine.mp3" },
  { ku: "Pir xweş e", en: "It's very good", audioFile: "/audio/kurdish-tts-mp3/food/pir-xwes-e.mp3" },
  { ku: "Ez birçî me", en: "I'm hungry", audioFile: "/audio/kurdish-tts-mp3/food/ez-birci-me.mp3" },
  { ku: "Ez tî me", en: "I'm thirsty", audioFile: "/audio/kurdish-tts-mp3/food/ez-ti-me.mp3" },
  { ku: "Ez têr im", en: "I'm full", audioFile: "/audio/kurdish-tts-mp3/food/ez-ter-im.mp3" },
  { ku: "Spas", en: "Thank you", audioFile: "/audio/kurdish-tts-mp3/food/spas.mp3" },
  { ku: "Rica dikim", en: "You're welcome", audioFile: "/audio/kurdish-tts-mp3/food/rica-dikim.mp3" },
  { ku: "Ez dixwazim", en: "I want", audioFile: "/audio/kurdish-tts-mp3/food/ez-dixwazim.mp3" },
  { ku: "Ez naxwazim", en: "I don't want", audioFile: "/audio/kurdish-tts-mp3/food/ez-naxwazim.mp3" },
  { ku: "Çend e?", en: "How much is it?", audioFile: "/audio/kurdish-tts-mp3/food/cend-e.mp3" },
  { ku: "Ev çi ye?", en: "What is this?", audioFile: "/audio/kurdish-tts-mp3/food/ev-ci-ye.mp3" },
  { ku: "Ez ji te re dixwazim", en: "I want it for you", audioFile: "/audio/kurdish-tts-mp3/food/ez-ji-te-re-dixwazim.mp3" },
  { ku: "Ez ji xwe re dixwazim", en: "I want it for myself", audioFile: "/audio/kurdish-tts-mp3/food/ez-ji-xwe-re-dixwazim.mp3" },
]

export default function FoodPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showAllFoods, setShowAllFoods] = useState(false)

  const categories = ["all", "fruit", "vegetable", "protein", "dairy", "grain", "drink"]
  
  const filteredFoods = selectedCategory === "all" 
    ? foodItemsWithAudio // Show all items when "All" is selected
    : foodItemsWithAudio.filter(food => food.category === selectedCategory)
  
  const displayedFoods = showAllFoods ? filteredFoods : filteredFoods.slice(0, 12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Food & Meals</h1>
        </div>

        <p className="text-gray-700 mb-6">Learn food vocabulary and how to talk about meals and preferences in Kurdish.</p>

        {/* Food Categories Filter */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Food Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primaryBlue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Food Items */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🍎</span>
            Food Items
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedFoods.map((item, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="font-bold text-gray-800 text-center">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{item.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="medium"
                    audioFile={item.audioFile}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredFoods.length > 12 && (
            <motion.div 
              initial={{opacity:0, y:10}} 
              animate={{opacity:1, y:0}}
              transition={{ delay: 0.3 }}
              className="text-center mt-6"
            >
              <button
                onClick={() => setShowAllFoods(!showAllFoods)}
                className="px-4 py-2 text-sm bg-primaryBlue text-white rounded-lg hover:bg-primaryBlue/90 transition-colors flex items-center gap-2 mx-auto"
              >
                {showAllFoods ? (
                  <>
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <span>See More ({filteredFoods.length - 12} more items)</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Meal Times */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            Meal Times
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealTimes.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow mx-auto mb-3">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="text-lg font-bold text-kurdish-red mb-1">{item.ku}</div>
                  <div className="text-sm text-gray-600 mb-3">{item.en}</div>
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Food Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">❓</span>
            Food Questions
          </h2>
          <div className="space-y-4">
            {foodQuestions.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku}</div>
                    <div className="text-gray-600">{item.en}</div>
                  </div>
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="medium"
                    audioFile={item.audioFile}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Common Responses */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Common Responses
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {responses.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku}</div>
                  <div className="text-sm text-gray-600 mb-3">{item.en}</div>
                  <AudioButton 
                    kurdishText={item.ku} 
                    phoneticText={item.en.toUpperCase()} 
                    label="Listen"
                    size="small"
                    audioFile={item.audioFile}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
