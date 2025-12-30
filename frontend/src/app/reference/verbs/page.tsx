"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

const commonVerbs = [
  { ku: "bûn", en: "to be", icon: "👤" },
  { ku: "kirin", en: "to do/make", icon: "🔨" },
  { ku: "çûn", en: "to go", icon: "🚶" },
  { ku: "hatin", en: "to come", icon: "🏃" },
  { ku: "xwarin", en: "to eat", icon: "🍽️" },
  { ku: "vexwarin", en: "to drink", icon: "🥤" },
  { ku: "xwendin", en: "to read", icon: "📖" },
  { ku: "nivîsîn", en: "to write", icon: "✍️" },
  { ku: "axaftin", en: "to speak", icon: "💬" },
  { ku: "bihîstin", en: "to hear", icon: "👂" },
  { ku: "dîtin", en: "to see", icon: "👁️" },
  { ku: "raketin", en: "to sleep", icon: "😴" },
  { ku: "hişyarbûn", en: "to wake up", icon: "⏰" },
  { ku: "rûniştin", en: "to sit", icon: "🪑" },
  { ku: "rabûn", en: "to stand", icon: "🧍" },
  { ku: "meşîn", en: "to walk", icon: "🚶" },
  { ku: "revîn", en: "to run", icon: "🏃" },
  { ku: "girtin", en: "to hold", icon: "✋" },
  { ku: "dayîn", en: "to give", icon: "🎁" },
  { ku: "stendin", en: "to take", icon: "🤲" },
  { ku: "kirîn", en: "to buy", icon: "🛒" },
  { ku: "firotin", en: "to sell", icon: "💰" },
  { ku: "xebat", en: "to work", icon: "💼" },
  { ku: "xwendin", en: "to study", icon: "📚" },
  { ku: "lîstin", en: "to play", icon: "🎮" }
]

const verbConjugations = [
  {
    verb: "kirin",
    meaning: "to do/make",
    conjugations: [
      { pronoun: "ez", form: "dikim", en: "I do" },
      { pronoun: "tu", form: "dikî", en: "you do" },
      { pronoun: "ew", form: "dike", en: "he/she does" },
      { pronoun: "em", form: "dikin", en: "we do" },
      { pronoun: "hûn", form: "dikin", en: "you do" },
      { pronoun: "ew", form: "dikin", en: "they do" }
    ]
  },
  {
    verb: "çûn",
    meaning: "to go",
    conjugations: [
      { pronoun: "ez", form: "diçim", en: "I go" },
      { pronoun: "tu", form: "diçî", en: "you go" },
      { pronoun: "ew", form: "diçe", en: "he/she goes" },
      { pronoun: "em", form: "diçin", en: "we go" },
      { pronoun: "hûn", form: "diçin", en: "you go" },
      { pronoun: "ew", form: "diçin", en: "they go" }
    ]
  }
]

export default function VerbsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red">Common Verbs</h1>
          <div />
        </div>

        <p className="text-gray-700 mb-8 text-center max-w-2xl mx-auto">
          Essential action words for daily conversations and activities in Kurdish.
        </p>

        {/* Common Verbs */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          className="card p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center text-lg">🏃</span>
            Common Verbs
          </h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {commonVerbs.map((verb, index) => (
              <motion.div key={index} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-5">
                <div className="font-bold text-gray-800 text-center">{verb.ku.charAt(0).toUpperCase() + verb.ku.slice(1)}</div>
                <div className="text-gray-600 mb-4 text-center">{verb.en}</div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                    <span className="text-xl">{verb.icon}</span>
                  </div>
                  <AudioButton 
                    kurdishText={verb.ku} 
                    phoneticText={verb.en.toUpperCase()} 
                    label="Listen" 
                    size="medium"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Verb Conjugations */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center text-lg">📝</span>
            Verb Conjugations
          </h2>
          
          <div className="space-y-6">
            {verbConjugations.map((verb, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-bold text-kurdish-red mb-4">
                  {verb.verb} - {verb.meaning}
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {verb.conjugations.map((conjugation, conjIndex) => (
                    <motion.div key={conjIndex} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="card p-4">
                      <div className="font-bold text-gray-800 text-center">{conjugation.form.charAt(0).toUpperCase() + conjugation.form.slice(1)}</div>
                      <div className="text-gray-600 mb-4 text-center text-sm">{conjugation.en}</div>
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow">
                          <span className="text-sm font-bold text-kurdish-red">{conjugation.pronoun}</span>
                        </div>
                        <AudioButton 
                          kurdishText={conjugation.form} 
                          phoneticText={conjugation.en.toUpperCase()} 
                          label="Listen" 
                          size="medium"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Verb Usage Tips */}
        <motion.div 
          initial={{opacity:0, y:10}} 
          animate={{opacity:1, y:0}}
          transition={{ delay: 0.2 }}
          className="mt-8 card p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Verb Usage Tips</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p>• <strong>Present Tense:</strong> Add "di-" prefix to verb stem</p>
            <p>• <strong>Past Tense:</strong> Add "kir" suffix to verb stem</p>
            <p>• <strong>Future Tense:</strong> Use "dê" before the verb</p>
            <p>• <strong>Negation:</strong> Add "na-" prefix for negative forms</p>
            <p>• <strong>Compound Verbs:</strong> Many verbs are formed with "kirin" (to do)</p>
            <p>• <strong>Irregular Verbs:</strong> Some verbs like "bûn" (to be) have irregular forms</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
