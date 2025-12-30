'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ArrowRight, RotateCcw, Star, ArrowLeft } from 'lucide-react'
import AudioButton from '../../../components/lessons/AudioButton'

interface StoryChoice {
  text: string
  kurdish: string
  nextScene: number
}

interface StoryScene {
  id: number
  title: string
  text: string
  kurdish: string
  image: string
  choices: StoryChoice[]
  isEnding?: boolean
  ending?: string
}

export default function StoryTimePage() {
  const stories: StoryScene[] = [
    {
      id: 1,
      title: "The Little Kurdish Fox",
      text: "Once upon a time, in the beautiful mountains of Kurdistan, there lived a curious little fox named Berîvan.",
      kurdish: "Careke li çiyayên xweş ên Kurdistanê, rovîkek piçûk ê bi navê Berîvan dijî.",
      image: "🦊",
      choices: [
        { text: "Go to the forest", kurdish: "Here daristanê", nextScene: 2 },
        { text: "Visit the village", kurdish: "Serdana gund bike", nextScene: 3 }
      ]
    },
    {
      id: 2,
      title: "In the Forest",
      text: "Berîvan walked into the green forest and heard beautiful bird songs.",
      kurdish: "Berîvan çû nav daristana kesk û dengê strana çûkan ê xweş bihîst.",
      image: "🌲",
      choices: [
        { text: "Follow the birds", kurdish: "Şopa çûkan bike", nextScene: 4 },
        { text: "Find the river", kurdish: "Çem bibîne", nextScene: 5 }
      ]
    },
    {
      id: 3,
      title: "At the Village",
      text: "In the village, Berîvan met friendly children playing traditional Kurdish games.",
      kurdish: "Li gund, Berîvan bi zarokên dilovan ên ku lîstikên kevneşopî yên kurdî dilîstin re hev kir.",
      image: "🏘️",
      choices: [
        { text: "Join the games", kurdish: "Beşdarî lîstikoyan bike", nextScene: 6 },
        { text: "Listen to stories", kurdish: "Guhdarî çîrokan bike", nextScene: 7 }
      ]
    },
    {
      id: 4,
      title: "Following the Birds",
      text: "The birds led Berîvan to a magical tree full of golden apples!",
      kurdish: "Çûk Berîvan birin ber darekî sihrbaz ê tijî sêvên zêrîn!",
      image: "🌳✨",
      choices: [
        { text: "Take one apple", kurdish: "Yek sêv bistîne", nextScene: 8 },
        { text: "Thank the birds", kurdish: "Spas ji çûkan bike", nextScene: 9 }
      ]
    },
    {
      id: 5,
      title: "By the River",
      text: "Berîvan found a crystal-clear river where fish were dancing in the water.",
      kurdish: "Berîvan çemek zelal dît ku masî di avê de disekinin.",
      image: "🐟💫",
      choices: [
        { text: "Dance with fish", kurdish: "Bi masîyan re bisekinî", nextScene: 10 },
        { text: "Drink water", kurdish: "Av vexwe", nextScene: 11 }
      ]
    },
    {
      id: 6,
      title: "Playing Games",
      text: "Berîvan learned to play 'Gol û Gîya' (Flower and Grass) and made many friends.",
      kurdish: "Berîvan 'Gol û Gîya' fêr bû û gelek heval peyda kir.",
      image: "🌸",
      isEnding: true,
      ending: "Berîvan returned home happy, having made wonderful friends and learned new games!",
      choices: []
    },
    {
      id: 7,
      title: "Story Circle",
      text: "The village elder told ancient Kurdish legends about brave heroes and magical creatures.",
      kurdish: "Pîrê gund çîrokên kevn ên derbarê lehengên wêrek û bûyerên sihrbaz de got.",
      image: "👴",
      isEnding: true,
      ending: "Berîvan's mind was filled with wonderful stories to share with others!",
      choices: []
    },
    {
      id: 8,
      title: "The Golden Apple",
      text: "The apple granted Berîvan the ability to understand all animal languages!",
      kurdish: "Sêv ji Berîvan re bihêzahiya fehimkirina hemû zimanên heywanan da!",
      image: "🍎✨",
      isEnding: true,
      ending: "Now Berîvan could talk to all the animals in Kurdistan and became their friend!",
      choices: []
    },
    {
      id: 9,
      title: "Grateful Heart",
      text: "The birds were so happy with Berîvan's kindness that they taught her to fly!",
      kurdish: "Çûk ji dilovaniya Berîvan kêfxweş bûn û firîn jê re hîn kirin!",
      image: "🦊🕊️",
      isEnding: true,
      ending: "Berîvan soared over Kurdistan, seeing the beauty of her homeland from above!",
      choices: []
    },
    {
      id: 10,
      title: "Dancing with Fish",
      text: "The fish taught Berîvan ancient water dances that brought rain to the mountains!",
      kurdish: "Masî dansên avê yên kevn ên ku baranê li çiyan tînin, ji Berîvan re hîn kirin!",
      image: "💃🌧️",
      isEnding: true,
      ending: "Berîvan became the guardian of water, ensuring Kurdistan always had enough rain!",
      choices: []
    },
    {
      id: 11,
      title: "The Magic Water",
      text: "The water was enchanted and gave Berîvan the wisdom of all Kurdish ancestors!",
      kurdish: "Av sihrbaz bû û zanyariya hemû bavkalên kurd da Berîvan!",
      image: "💧🧠",
      isEnding: true,
      ending: "With ancient wisdom, Berîvan helped solve problems for all the forest creatures!",
      choices: []
    }
  ]

  const [currentScene, setCurrentScene] = useState(1)
  const [storyPath, setStoryPath] = useState<number[]>([1])
  const [showTranslation, setShowTranslation] = useState(false)

  const getCurrentScene = () => {
    return stories.find(scene => scene.id === currentScene) || stories[0]
  }

  const makeChoice = (nextScene: number) => {
    setCurrentScene(nextScene)
    setStoryPath([...storyPath, nextScene])
    setShowTranslation(false)
  }

  const restartStory = () => {
    setCurrentScene(1)
    setStoryPath([1])
    setShowTranslation(false)
  }

  const scene = getCurrentScene()

  return (
    <div className="min-h-screen bg-backgroundCream">
      {/* Header */}
      <div className="bg-primaryBlue text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold">Interactive Stories</h1>
              <p className="text-lg opacity-90">Choose your own Kurdish adventure!</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-xl font-bold">{storyPath.length}</div>
                <div className="text-sm">Chapters</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Story Progress */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto">
              {storyPath.map((sceneId, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    sceneId === currentScene 
                      ? 'bg-primaryBlue text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < storyPath.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Story Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              {/* Story Image */}
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{scene.image}</div>
                <h2 className="text-2xl font-bold text-textNavy">{scene.title}</h2>
              </div>

              {/* Story Text */}
              <div className="space-y-4 mb-8">
                <div className="text-lg leading-relaxed text-gray-700">
                  {scene.text}
                </div>
                
                {/* Kurdish Translation Toggle */}
                <div className="border-t pt-4">
                  <button
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="text-primaryBlue hover:underline mb-2 flex items-center gap-2"
                  >
                    {showTranslation ? 'Hide' : 'Show'} Kurdish Translation
                    <BookOpen className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {showTranslation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-backgroundCream p-4 rounded-lg"
                      >
                        <div className="text-lg font-kurdish leading-relaxed text-textNavy mb-2">
                          {scene.kurdish}
                        </div>
                        <AudioButton 
                          kurdishText={scene.kurdish} 
                          phoneticText={scene.kurdish.toUpperCase()} 
                          label="Listen" 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Story Choices or Ending */}
              {scene.isEnding ? (
                <div className="text-center space-y-6">
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                      <Star className="w-5 h-5" />
                      The End
                    </div>
                    <p className="text-yellow-700">{scene.ending}</p>
                  </div>
                  
                  <button
                    onClick={restartStory}
                    className="bg-primaryBlue text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform duration-200 flex items-center gap-2 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Start New Adventure
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-textNavy text-center">
                    What should Berîvan do next?
                  </h3>
                  <div className="grid gap-4">
                    {scene.choices.map((choice, index) => (
                      <motion.button
                        key={index}
                        onClick={() => makeChoice(choice.nextScene)}
                        className="bg-primaryBlue text-white p-4 rounded-xl text-left hover:bg-blue-600 transition-colors group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{choice.text}</div>
                            <div className="text-sm opacity-90 font-kurdish">{choice.kurdish}</div>
                          </div>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
