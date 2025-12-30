"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Sun, Cloud, CloudRain, Snowflake, Wind, Thermometer, ArrowLeft } from "lucide-react"
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

const weatherTypes = [
  { ku: "hewa", en: "weather", icon: Sun, color: "text-yellow-500", audioFile: "/audio/kurdish-tts-mp3/weather/hewa.mp3" },
  { ku: "roj", en: "sun", icon: Sun, color: "text-yellow-500", audioFile: "/audio/kurdish-tts-mp3/weather/roj.mp3" },
  { ku: "ewr", en: "cloud", icon: Cloud, color: "text-gray-500", audioFile: "/audio/kurdish-tts-mp3/weather/ewr.mp3" },
  { ku: "baran", en: "rain", icon: CloudRain, color: "text-blue-500", audioFile: "/audio/kurdish-tts-mp3/weather/baran.mp3" },
  { ku: "berf", en: "snow", icon: Snowflake, color: "text-blue-200", audioFile: "/audio/kurdish-tts-mp3/weather/berf.mp3" },
  { ku: "ba", en: "wind", icon: Wind, color: "text-gray-400", audioFile: "/audio/kurdish-tts-mp3/weather/ba.mp3" },
  { ku: "germ", en: "hot", icon: Thermometer, color: "text-red-500", audioFile: "/audio/kurdish-tts-mp3/weather/germ.mp3" },
  { ku: "sar", en: "cold", icon: Thermometer, color: "text-blue-500", audioFile: "/audio/kurdish-tts-mp3/weather/sar.mp3" },
  { ku: "pir germ", en: "very hot", icon: Thermometer, color: "text-red-600", audioFile: "/audio/kurdish-tts-mp3/weather/pir-germ.mp3" },
  { ku: "pir sar", en: "very cold", icon: Thermometer, color: "text-blue-600", audioFile: "/audio/kurdish-tts-mp3/weather/pir-sar.mp3" },
  { ku: "germik", en: "warm", icon: Thermometer, color: "text-orange-500", audioFile: "/audio/kurdish-tts-mp3/weather/germik.mp3" },
]

const weatherDescriptions = [
  { ku: "Hewa baş e", en: "The weather is good", icon: "🌤️", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-bas-e.mp3" },
  { ku: "Roj derketiye", en: "The sun is out", icon: "☀️", audioFile: "/audio/kurdish-tts-mp3/weather/roj-derketiye.mp3" },
  { ku: "Baran dibare", en: "It's raining", icon: "🌧️", audioFile: "/audio/kurdish-tts-mp3/weather/baran-dibare.mp3" },
  { ku: "Berf dibare", en: "It's snowing", icon: "❄️", audioFile: "/audio/kurdish-tts-mp3/weather/berf-dibare.mp3" },
  { ku: "Hewa germ e", en: "The weather is hot", icon: "🔥", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-germ-e.mp3" },
  { ku: "Hewa sar e", en: "The weather is cold", icon: "🧊", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-sar-e.mp3" },
  { ku: "Ba heye", en: "There is wind", icon: "💨", audioFile: "/audio/kurdish-tts-mp3/weather/ba-heye.mp3" },
  { ku: "Ewr hene", en: "There are clouds", icon: "☁️", audioFile: "/audio/kurdish-tts-mp3/weather/ewr-hene.mp3" },
  { ku: "Hewa xweş e", en: "The weather is nice", icon: "🌤️", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-xwes-e.mp3" },
  { ku: "Hewa nebaş e", en: "The weather is bad", icon: "🌩️", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-nebas-e.mp3" },
  { ku: "Hewa sar û baranî ye", en: "The weather is cold and rainy", icon: "🌧️", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-sar-u-barani-ye.mp3" },
  { ku: "Hewa germ û rojîn e", en: "The weather is hot and sunny", icon: "☀️", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-germ-u-rojin-e.mp3" },
]

const weatherQuestions = [
  { ku: "Hewa çawa ye?", en: "How is the weather?", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-cawa-ye.mp3" },
  { ku: "Îro hewa çawa ye?", en: "How is the weather today?", audioFile: "/audio/kurdish-tts-mp3/weather/iro-hewa-cawa-ye.mp3" },
  { ku: "Tu hewa çawa hez dikî?", en: "What kind of weather do you like?", audioFile: "/audio/kurdish-tts-mp3/weather/tu-hewa-cawa-hez-diki.mp3" },
  { ku: "Baran dibare?", en: "Is it raining?", audioFile: "/audio/kurdish-tts-mp3/weather/baran-dibare.mp3" },
  { ku: "Roj derketiye?", en: "Is the sun out?", audioFile: "/audio/kurdish-tts-mp3/weather/roj-derketiye.mp3" },
  { ku: "Hewa germ e?", en: "Is it hot?", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-germ-e.mp3" },
  { ku: "Hewa sar e?", en: "Is it cold?", audioFile: "/audio/kurdish-tts-mp3/weather/hewa-sar-e.mp3" },
  { ku: "Ba heye?", en: "Is there wind?", audioFile: "/audio/kurdish-tts-mp3/weather/ba-heye.mp3" },
  { ku: "Berf dibare?", en: "Is it snowing?", audioFile: "/audio/kurdish-tts-mp3/weather/berf-dibare.mp3" },
  { ku: "Tu çi demê hez dikî?", en: "What season do you like?", audioFile: "/audio/kurdish-tts-mp3/weather/tu-ci-deme-hez-diki.mp3" },
]

const seasons = [
  { ku: "bihar", en: "spring", icon: "🌸", color: "text-pink-500", audioFile: "/audio/kurdish-tts-mp3/weather/bihar.mp3" },
  { ku: "havîn", en: "summer", icon: "☀️", color: "text-yellow-500", audioFile: "/audio/kurdish-tts-mp3/weather/havin.mp3" },
  { ku: "payiz", en: "fall", icon: "🍂", color: "text-orange-500", audioFile: "/audio/kurdish-tts-mp3/weather/payiz.mp3" },
  { ku: "zivistan", en: "winter", icon: "❄️", color: "text-blue-400", audioFile: "/audio/kurdish-tts-mp3/weather/zivistan.mp3" },
]

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/learn" className="text-kurdish-red font-bold flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Weather & Seasons</h1>
        </div>

        <p className="text-gray-700 mb-6 text-center">Learn weather vocabulary and how to describe the weather in Kurdish.</p>

        {/* Seasons */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primaryBlue" />
            Seasons
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {seasons.map((season, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="font-bold text-gray-800 text-center">{season.ku.charAt(0).toUpperCase() + season.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{season.en}</div>
                <div className="flex items-center justify-between">
                  <AudioButton 
                    kurdishText={season.ku} 
                    phoneticText={season.en.toUpperCase()} 
                    label="Listen"
                    size="medium"
                    audioFile={season.audioFile}
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{season.icon}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weather Types */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primaryBlue" />
            Weather Types
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {weatherTypes.map((item, index) => (
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
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weather Descriptions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primaryBlue" />
            Describing Weather
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {weatherDescriptions.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                      <div className="text-gray-600">{item.en}</div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <AudioButton 
                      kurdishText={item.ku} 
                      phoneticText={item.en.toUpperCase()} 
                      label="Listen"
                      size="small"
                      audioFile={item.audioFile}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weather Questions */}
        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primaryBlue" />
            Weather Questions
          </h2>
          <div className="space-y-4">
            {weatherQuestions.map((item, index) => (
              <div key={index} className="p-4 rounded-2xl border bg-white hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-kurdish-red mb-1">{item.ku.charAt(0).toUpperCase() + item.ku.slice(1)}</div>
                    <div className="text-gray-600">{item.en}</div>
                  </div>
                  <div className="ml-4">
                    <AudioButton 
                      kurdishText={item.ku} 
                      phoneticText={item.en.toUpperCase()} 
                      label="Listen"
                      size="small"
                      audioFile={item.audioFile}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
