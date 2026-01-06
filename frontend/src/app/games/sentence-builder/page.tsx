"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Volume2 } from "lucide-react"
import AudioButton from "../../../components/lessons/AudioButton"

type Sentence = {
  id: string
  english: string
  kurdish: string
  words: string[] // Words in correct order
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

type Deck = {
  name: string
  description: string
  icon: string
  sentences: Sentence[]
}

// Helper function to shuffle array
const shuffleArray = <T extends unknown>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Helper function to get audio file path for Sentence Builder
const getSentenceBuilderAudioPath = (kurdishText: string): string => {
  const filename = kurdishText
    .toLowerCase()
    .replace(/[îÎ]/g, 'i')
    .replace(/[êÊ]/g, 'e')
    .replace(/[ûÛ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  return `/audio/kurdish-tts-mp3/sentence-builder/${filename}.mp3`
}

// Sentence templates by category
const colorsSentences: Sentence[] = [
  {
    id: 'colors-1',
    english: 'The apple is red.',
    kurdish: 'Sêv sor e.',
    words: ['Sêv', 'sor', 'e'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-2',
    english: 'The grass is green.',
    kurdish: 'Gîya kesk e.',
    words: ['Gîya', 'kesk', 'e'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-3',
    english: 'The sky is blue.',
    kurdish: 'Esman şîn e.',
    words: ['Esman', 'şîn', 'e'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-4',
    english: 'The sun is yellow.',
    kurdish: 'Roj zer e.',
    words: ['Roj', 'zer', 'e'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-5',
    english: 'I like red color.',
    kurdish: 'Ez ji rengê sor hez dikim.',
    words: ['Ez', 'ji', 'rengê', 'sor', 'hez', 'dikim'],
    category: 'colors',
    difficulty: 'hard'
  },
  {
    id: 'colors-6',
    english: 'The car is black.',
    kurdish: 'Otomobîl reş e.',
    words: ['Otomobîl', 'reş', 'e'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-7',
    english: 'The snow is white.',
    kurdish: 'Berf spî ye.',
    words: ['Berf', 'spî', 'ye'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-8',
    english: 'I see a purple flower.',
    kurdish: 'Ez gulek mor dibînim.',
    words: ['Ez', 'gulek', 'mor', 'dibînim'],
    category: 'colors',
    difficulty: 'medium'
  },
  {
    id: 'colors-9',
    english: 'The orange is orange.',
    kurdish: 'Pirteqal porteqalî ye.',
    words: ['Pirteqal', 'porteqalî', 'ye'],
    category: 'colors',
    difficulty: 'medium'
  },
  {
    id: 'colors-10',
    english: 'My shirt is blue.',
    kurdish: 'Kirasê min şîn e.',
    words: ['Kirasê', 'min', 'şîn', 'e'],
    category: 'colors',
    difficulty: 'medium'
  },
  {
    id: 'colors-11',
    english: 'The book is brown.',
    kurdish: 'Pirtûk qehweyî ye.',
    words: ['Pirtûk', 'qehweyî', 'ye'],
    category: 'colors',
    difficulty: 'medium'
  },
  {
    id: 'colors-12',
    english: 'I like green color.',
    kurdish: 'Ez ji rengê kesk hez dikim.',
    words: ['Ez', 'ji', 'rengê', 'kesk', 'hez', 'dikim'],
    category: 'colors',
    difficulty: 'hard'
  },
  {
    id: 'colors-13',
    english: 'The rose is red.',
    kurdish: 'Gul sor e.',
    words: ['Gul', 'sor', 'e'],
    category: 'colors',
    difficulty: 'easy'
  },
  {
    id: 'colors-14',
    english: 'Your dress is yellow.',
    kurdish: 'Kirasê te zer e.',
    words: ['Kirasê', 'te', 'zer', 'e'],
    category: 'colors',
    difficulty: 'medium'
  },
  {
    id: 'colors-15',
    english: 'We paint the wall white.',
    kurdish: 'Em dîwarê spî dikin.',
    words: ['Em', 'dîwarê', 'spî', 'dikin'],
    category: 'colors',
    difficulty: 'hard'
  }
]

const animalsSentences: Sentence[] = [
  {
    id: 'animals-1',
    english: 'The cat is sleeping.',
    kurdish: 'Pisîk radizê.',
    words: ['Pisîk', 'radizê'],
    category: 'animals',
    difficulty: 'easy'
  },
  {
    id: 'animals-2',
    english: 'The dog is running.',
    kurdish: 'Se direyê.',
    words: ['Se', 'direyê'],
    category: 'animals',
    difficulty: 'easy'
  },
  {
    id: 'animals-3',
    english: 'I see a bird.',
    kurdish: 'Ez balindek dibînim.',
    words: ['Ez', 'balindek', 'dibînim'],
    category: 'animals',
    difficulty: 'medium'
  },
  {
    id: 'animals-4',
    english: 'The horse is fast.',
    kurdish: 'Hesp lezgîn e.',
    words: ['Hesp', 'lezgîn', 'e'],
    category: 'animals',
    difficulty: 'medium'
  },
  {
    id: 'animals-5',
    english: 'I love animals.',
    kurdish: 'Ez ji ajelan hez dikim.',
    words: ['Ez', 'ji', 'ajelan', 'hez', 'dikim'],
    category: 'animals',
    difficulty: 'hard'
  },
  {
    id: 'animals-6',
    english: 'The cow gives milk.',
    kurdish: 'Çêlek şîr dide.',
    words: ['Çêlek', 'şîr', 'dide'],
    category: 'animals',
    difficulty: 'medium'
  },
  {
    id: 'animals-7',
    english: 'I hear a bird singing.',
    kurdish: 'Ez balindekê dibihîzim ku stran dike.',
    words: ['Ez', 'balindekê', 'dibihîzim', 'ku', 'stran', 'dike'],
    category: 'animals',
    difficulty: 'hard'
  },
  {
    id: 'animals-8',
    english: 'The fish swims in water.',
    kurdish: 'Masî di avê de ajnê dike.',
    words: ['Masî', 'di', 'avê', 'de', 'ajnê', 'dike'],
    category: 'animals',
    difficulty: 'hard'
  },
  {
    id: 'animals-9',
    english: 'My cat is small.',
    kurdish: 'Pisîka min biçûk e.',
    words: ['Pisîka', 'min', 'biçûk', 'e'],
    category: 'animals',
    difficulty: 'medium'
  },
  {
    id: 'animals-10',
    english: 'The lion is strong.',
    kurdish: 'Şêr bihêz e.',
    words: ['Şêr', 'bihêz', 'e'],
    category: 'animals',
    difficulty: 'easy'
  },
  {
    id: 'animals-11',
    english: 'I see two dogs.',
    kurdish: 'Ez du se dibînim.',
    words: ['Ez', 'du', 'se', 'dibînim'],
    category: 'animals',
    difficulty: 'medium'
  },
  {
    id: 'animals-12',
    english: 'The bird flies in the sky.',
    kurdish: 'Balinde di esmanê de difire.',
    words: ['Balinde', 'di', 'esmanê', 'de', 'difire'],
    category: 'animals',
    difficulty: 'hard'
  },
  {
    id: 'animals-13',
    english: 'The rabbit is fast.',
    kurdish: 'Kevroşk lezgîn e.',
    words: ['Kevroşk', 'lezgîn', 'e'],
    category: 'animals',
    difficulty: 'easy'
  },
  {
    id: 'animals-14',
    english: 'We feed the animals.',
    kurdish: 'Em ajelan xwedî dikin.',
    words: ['Em', 'ajelan', 'xwedî', 'dikin'],
    category: 'animals',
    difficulty: 'hard'
  },
  {
    id: 'animals-15',
    english: 'The sheep is white.',
    kurdish: 'Pez spî ye.',
    words: ['Pez', 'spî', 'ye'],
    category: 'animals',
    difficulty: 'easy'
  }
]

const foodSentences: Sentence[] = [
  {
    id: 'food-1',
    english: 'I eat bread.',
    kurdish: 'Ez nan dixwim.',
    words: ['Ez', 'nan', 'dixwim'],
    category: 'food',
    difficulty: 'easy'
  },
  {
    id: 'food-2',
    english: 'You drink tea.',
    kurdish: 'Tu çayê vedixwî.',
    words: ['Tu', 'çayê', 'vedixwî'],
    category: 'food',
    difficulty: 'medium'
  },
  {
    id: 'food-3',
    english: 'We cook food.',
    kurdish: 'Em xwarinê çêdikin.',
    words: ['Em', 'xwarinê', 'çêdikin'],
    category: 'food',
    difficulty: 'medium'
  },
  {
    id: 'food-4',
    english: 'I like apples.',
    kurdish: 'Ez ji sêvan hez dikim.',
    words: ['Ez', 'ji', 'sêvan', 'hez', 'dikim'],
    category: 'food',
    difficulty: 'hard'
  },
  {
    id: 'food-5',
    english: 'The food is good.',
    kurdish: 'Xwarinê baş e.',
    words: ['Xwarinê', 'baş', 'e'],
    category: 'food',
    difficulty: 'easy'
  },
  {
    id: 'food-6',
    english: 'I buy vegetables.',
    kurdish: 'Ez sebze dikirim.',
    words: ['Ez', 'sebze', 'dikirim'],
    category: 'food',
    difficulty: 'medium'
  },
  {
    id: 'food-7',
    english: 'We eat breakfast in the morning.',
    kurdish: 'Em di sibehê de taştê dixwin.',
    words: ['Em', 'di', 'sibehê', 'de', 'taştê', 'dixwin'],
    category: 'food',
    difficulty: 'hard'
  },
  {
    id: 'food-8',
    english: 'The apple is sweet.',
    kurdish: 'Sêv şîrîn e.',
    words: ['Sêv', 'şîrîn', 'e'],
    category: 'food',
    difficulty: 'easy'
  },
  {
    id: 'food-9',
    english: 'I drink water.',
    kurdish: 'Ez avê vedixwim.',
    words: ['Ez', 'avê', 'vedixwim'],
    category: 'food',
    difficulty: 'medium'
  },
  {
    id: 'food-10',
    english: 'You eat rice.',
    kurdish: 'Tu birinc dixwî.',
    words: ['Tu', 'birinc', 'dixwî'],
    category: 'food',
    difficulty: 'medium'
  },
  {
    id: 'food-11',
    english: 'We make soup.',
    kurdish: 'Em şorbe çêdikin.',
    words: ['Em', 'şorbe', 'çêdikin'],
    category: 'food',
    difficulty: 'medium'
  },
  {
    id: 'food-12',
    english: 'I like meat.',
    kurdish: 'Ez ji goşt hez dikim.',
    words: ['Ez', 'ji', 'goşt', 'hez', 'dikim'],
    category: 'food',
    difficulty: 'hard'
  },
  {
    id: 'food-13',
    english: 'The milk is cold.',
    kurdish: 'Şîr sar e.',
    words: ['Şîr', 'sar', 'e'],
    category: 'food',
    difficulty: 'easy'
  },
  {
    id: 'food-14',
    english: 'I cook eggs.',
    kurdish: 'Ez hêkan çêdikim.',
    words: ['Ez', 'hêkan', 'çêdikim'],
    category: 'food',
    difficulty: 'hard'
  },
  {
    id: 'food-15',
    english: 'We eat dinner at night.',
    kurdish: 'Em di şevê de xwarina êvarê dixwin.',
    words: ['Em', 'di', 'şevê', 'de', 'xwarina', 'êvarê', 'dixwin'],
    category: 'food',
    difficulty: 'hard'
  }
]

const familySentences: Sentence[] = [
  {
    id: 'family-1',
    english: 'My mother is kind.',
    kurdish: 'Dayika min qenc e.',
    words: ['Dayika', 'min', 'qenc', 'e'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-2',
    english: 'My father works.',
    kurdish: 'Bavê min kar dike.',
    words: ['Bavê', 'min', 'kar', 'dike'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-3',
    english: 'I love my family.',
    kurdish: 'Ez ji malbata xwe hez dikim.',
    words: ['Ez', 'ji', 'malbata', 'xwe', 'hez', 'dikim'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-4',
    english: 'My sister is young.',
    kurdish: 'Xwişka min ciwan e.',
    words: ['Xwişka', 'min', 'ciwan', 'e'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-5',
    english: 'My brother is tall.',
    kurdish: 'Birayê min dirêj e.',
    words: ['Birayê', 'min', 'dirêj', 'e'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-6',
    english: 'My grandmother is old.',
    kurdish: 'Dapîra min kal e.',
    words: ['Dapîra', 'min', 'kal', 'e'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-7',
    english: 'I visit my grandfather.',
    kurdish: 'Ez bapîra xwe serdan dikim.',
    words: ['Ez', 'bapîra', 'xwe', 'serdan', 'dikim'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-8',
    english: 'My uncle is a teacher.',
    kurdish: 'Apê min mamoste ye.',
    words: ['Apê', 'min', 'mamoste', 'ye'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-9',
    english: 'I have a big family.',
    kurdish: 'Malbateke mezin min heye.',
    words: ['Malbateke', 'mezin', 'min', 'heye'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-10',
    english: 'My cousin is my friend.',
    kurdish: 'Pismama min hevalê min e.',
    words: ['Pismama', 'min', 'hevalê', 'min', 'e'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-11',
    english: 'We are a happy family.',
    kurdish: 'Em malbateke kêfxweş in.',
    words: ['Em', 'malbateke', 'kêfxweş', 'in'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-12',
    english: 'My aunt is kind.',
    kurdish: 'Metê min qenc e.',
    words: ['Metê', 'min', 'qenc', 'e'],
    category: 'family',
    difficulty: 'medium'
  },
  {
    id: 'family-13',
    english: 'I love my parents.',
    kurdish: 'Ez ji dêûbavên xwe hez dikim.',
    words: ['Ez', 'ji', 'dêûbavên', 'xwe', 'hez', 'dikim'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-14',
    english: 'My nephew is a child.',
    kurdish: 'Kurê birayê min zarok e.',
    words: ['Kurê', 'birayê', 'min', 'zarok', 'e'],
    category: 'family',
    difficulty: 'hard'
  },
  {
    id: 'family-15',
    english: 'We eat together as a family.',
    kurdish: 'Em wek malbat bi hev re dixwin.',
    words: ['Em', 'wek', 'malbat', 'bi', 'hev', 're', 'dixwin'],
    category: 'family',
    difficulty: 'hard'
  }
]

const natureSentences: Sentence[] = [
  {
    id: 'nature-1',
    english: 'The tree is tall.',
    kurdish: 'Dare dirêj e.',
    words: ['Dare', 'dirêj', 'e'],
    category: 'nature',
    difficulty: 'easy'
  },
  {
    id: 'nature-2',
    english: 'The flower is beautiful.',
    kurdish: 'Gul xweşik e.',
    words: ['Gul', 'xweşik', 'e'],
    category: 'nature',
    difficulty: 'medium'
  },
  {
    id: 'nature-3',
    english: 'I see a mountain.',
    kurdish: 'Ez çiyayek dibînim.',
    words: ['Ez', 'çiyayek', 'dibînim'],
    category: 'nature',
    difficulty: 'medium'
  },
  {
    id: 'nature-4',
    english: 'The sun is shining.',
    kurdish: 'Roj dişewitê.',
    words: ['Roj', 'dişewitê'],
    category: 'nature',
    difficulty: 'easy'
  },
  {
    id: 'nature-5',
    english: 'We walk in the forest.',
    kurdish: 'Em di daristanê de digerin.',
    words: ['Em', 'di', 'daristanê', 'de', 'digerin'],
    category: 'nature',
    difficulty: 'hard'
  },
  {
    id: 'nature-6',
    english: 'The river flows.',
    kurdish: 'Çem diherike.',
    words: ['Çem', 'diherike'],
    category: 'nature',
    difficulty: 'easy'
  },
  {
    id: 'nature-7',
    english: 'I see a beautiful lake.',
    kurdish: 'Ez golek xweşik dibînim.',
    words: ['Ez', 'golek', 'xweşik', 'dibînim'],
    category: 'nature',
    difficulty: 'medium'
  },
  {
    id: 'nature-8',
    english: 'The moon is bright.',
    kurdish: 'Hîv ronî ye.',
    words: ['Hîv', 'ronî', 'ye'],
    category: 'nature',
    difficulty: 'easy'
  },
  {
    id: 'nature-9',
    english: 'We climb the mountain.',
    kurdish: 'Em çiyayê radikin.',
    words: ['Em', 'çiyayê', 'radikin'],
    category: 'nature',
    difficulty: 'hard'
  },
  {
    id: 'nature-10',
    english: 'The leaf falls from the tree.',
    kurdish: 'Pel ji dare diqewime.',
    words: ['Pel', 'ji', 'dare', 'diqewime'],
    category: 'nature',
    difficulty: 'hard'
  },
  {
    id: 'nature-11',
    english: 'I love nature.',
    kurdish: 'Ez ji xwezayê hez dikim.',
    words: ['Ez', 'ji', 'xwezayê', 'hez', 'dikim'],
    category: 'nature',
    difficulty: 'hard'
  },
  {
    id: 'nature-12',
    english: 'The star shines at night.',
    kurdish: 'Stêr di şevê de dibiriqe.',
    words: ['Stêr', 'di', 'şevê', 'de', 'dibiriqe'],
    category: 'nature',
    difficulty: 'hard'
  },
  {
    id: 'nature-13',
    english: 'The grass is green.',
    kurdish: 'Gîya kesk e.',
    words: ['Gîya', 'kesk', 'e'],
    category: 'nature',
    difficulty: 'easy'
  },
  {
    id: 'nature-14',
    english: 'We swim in the sea.',
    kurdish: 'Em di deryayê de ajnê dikin.',
    words: ['Em', 'di', 'deryayê', 'de', 'ajnê', 'dikin'],
    category: 'nature',
    difficulty: 'hard'
  },
  {
    id: 'nature-15',
    english: 'The wind blows.',
    kurdish: 'Ba diweje.',
    words: ['Ba', 'diweje'],
    category: 'nature',
    difficulty: 'easy'
  }
]

const timeSentences: Sentence[] = [
  {
    id: 'time-1',
    english: 'It is morning.',
    kurdish: 'Sibeh e.',
    words: ['Sibeh', 'e'],
    category: 'time',
    difficulty: 'easy'
  },
  {
    id: 'time-2',
    english: 'I wake up early.',
    kurdish: 'Ez zû radihêzim.',
    words: ['Ez', 'zû', 'radihêzim'],
    category: 'time',
    difficulty: 'medium'
  },
  {
    id: 'time-3',
    english: 'What time is it?',
    kurdish: 'Saet çend e?',
    words: ['Saet', 'çend', 'e'],
    category: 'time',
    difficulty: 'medium'
  },
  {
    id: 'time-4',
    english: 'I go to school at eight.',
    kurdish: 'Ez saet heştan diçim dibistanê.',
    words: ['Ez', 'saet', 'heştan', 'diçim', 'dibistanê'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-5',
    english: 'We eat lunch at noon.',
    kurdish: 'Em di nîvro de xwarina nîvro dixwin.',
    words: ['Em', 'di', 'nîvro', 'de', 'xwarina', 'nîvro', 'dixwin'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-6',
    english: 'It is afternoon.',
    kurdish: 'Nîvro ye.',
    words: ['Nîvro', 'ye'],
    category: 'time',
    difficulty: 'easy'
  },
  {
    id: 'time-7',
    english: 'I sleep at night.',
    kurdish: 'Ez di şevê de radizim.',
    words: ['Ez', 'di', 'şevê', 'de', 'radizim'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-8',
    english: 'What day is today?',
    kurdish: 'Îro çi roj e?',
    words: ['Îro', 'çi', 'roj', 'e'],
    category: 'time',
    difficulty: 'medium'
  },
  {
    id: 'time-9',
    english: 'I work during the day.',
    kurdish: 'Ez di rojê de kar dikim.',
    words: ['Ez', 'di', 'rojê', 'de', 'kar', 'dikim'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-10',
    english: 'It is evening now.',
    kurdish: 'Niha êvar e.',
    words: ['Niha', 'êvar', 'e'],
    category: 'time',
    difficulty: 'easy'
  },
  {
    id: 'time-11',
    english: 'We meet tomorrow.',
    kurdish: 'Em sibê hevdîtin dikin.',
    words: ['Em', 'sibê', 'hevdîtin', 'dikin'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-12',
    english: 'I study in the morning.',
    kurdish: 'Ez di sibehê de xwendinê dikim.',
    words: ['Ez', 'di', 'sibehê', 'de', 'xwendinê', 'dikim'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-13',
    english: 'The clock shows the time.',
    kurdish: 'Saet demê nîşan dide.',
    words: ['Saet', 'demê', 'nîşan', 'dide'],
    category: 'time',
    difficulty: 'hard'
  },
  {
    id: 'time-14',
    english: 'I come at seven.',
    kurdish: 'Ez saet heftan tên.',
    words: ['Ez', 'saet', 'heftan', 'tên'],
    category: 'time',
    difficulty: 'medium'
  },
  {
    id: 'time-15',
    english: 'We play in the afternoon.',
    kurdish: 'Em di nîvro de dilîzin.',
    words: ['Em', 'di', 'nîvro', 'de', 'dilîzin'],
    category: 'time',
    difficulty: 'hard'
  }
]

const weatherSentences: Sentence[] = [
  {
    id: 'weather-1',
    english: 'It is sunny today.',
    kurdish: 'Îro roj heye.',
    words: ['Îro', 'roj', 'heye'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-2',
    english: 'It is raining.',
    kurdish: 'Baran dibare.',
    words: ['Baran', 'dibare'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-3',
    english: 'The weather is cold.',
    kurdish: 'Hewa sar e.',
    words: ['Hewa', 'sar', 'e'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-4',
    english: 'It is hot in summer.',
    kurdish: 'Di havînê de germ e.',
    words: ['Di', 'havînê', 'de', 'germ', 'e'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-5',
    english: 'I like spring weather.',
    kurdish: 'Ez ji hewaya biharê hez dikim.',
    words: ['Ez', 'ji', 'hewaya', 'biharê', 'hez', 'dikim'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-6',
    english: 'It snows in winter.',
    kurdish: 'Di zivistanê de berf dibare.',
    words: ['Di', 'zivistanê', 'de', 'berf', 'dibare'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-7',
    english: 'The wind is strong.',
    kurdish: 'Ba bihêz e.',
    words: ['Ba', 'bihêz', 'e'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-8',
    english: 'I see clouds in the sky.',
    kurdish: 'Ez ewr di esmanê de dibînim.',
    words: ['Ez', 'ewr', 'di', 'esmanê', 'de', 'dibînim'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-9',
    english: 'The weather is nice today.',
    kurdish: 'Îro hewa baş e.',
    words: ['Îro', 'hewa', 'baş', 'e'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-10',
    english: 'It is warm in spring.',
    kurdish: 'Di biharê de germ e.',
    words: ['Di', 'biharê', 'de', 'germ', 'e'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-11',
    english: 'The sun is hot.',
    kurdish: 'Roj germ e.',
    words: ['Roj', 'germ', 'e'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-12',
    english: 'I like rainy days.',
    kurdish: 'Ez ji rojên baranî hez dikim.',
    words: ['Ez', 'ji', 'rojên', 'baranî', 'hez', 'dikim'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-13',
    english: 'The storm is coming.',
    kurdish: 'Bahoz tê.',
    words: ['Bahoz', 'tê'],
    category: 'weather',
    difficulty: 'easy'
  },
  {
    id: 'weather-14',
    english: 'We stay inside when it rains.',
    kurdish: 'Gava baran dibare em di hundur de dimînin.',
    words: ['Gava', 'baran', 'dibare', 'em', 'di', 'hundur', 'de', 'dimînin'],
    category: 'weather',
    difficulty: 'hard'
  },
  {
    id: 'weather-15',
    english: 'The weather changes.',
    kurdish: 'Hewa diguhere.',
    words: ['Hewa', 'diguhere'],
    category: 'weather',
    difficulty: 'medium'
  }
]

const houseSentences: Sentence[] = [
  {
    id: 'house-1',
    english: 'The chair is in the room.',
    kurdish: 'Kursî di odeyê de ye.',
    words: ['Kursî', 'di', 'odeyê', 'de', 'ye'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-2',
    english: 'I sit on the chair.',
    kurdish: 'Ez li ser kursiyê rû dinim.',
    words: ['Ez', 'li', 'ser', 'kursiyê', 'rû', 'dinim'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-3',
    english: 'The table is big.',
    kurdish: 'Mase mezin e.',
    words: ['Mase', 'mezin', 'e'],
    category: 'house',
    difficulty: 'easy'
  },
  {
    id: 'house-4',
    english: 'I open the door.',
    kurdish: 'Ez deriyê vedikim.',
    words: ['Ez', 'deriyê', 'vedikim'],
    category: 'house',
    difficulty: 'medium'
  },
  {
    id: 'house-5',
    english: 'The window is open.',
    kurdish: 'Pencere vekirî ye.',
    words: ['Pencere', 'vekirî', 'ye'],
    category: 'house',
    difficulty: 'medium'
  },
  {
    id: 'house-6',
    english: 'I close the window.',
    kurdish: 'Ez pencereyê digirim.',
    words: ['Ez', 'pencereyê', 'digirim'],
    category: 'house',
    difficulty: 'medium'
  },
  {
    id: 'house-7',
    english: 'The bed is in the bedroom.',
    kurdish: 'Nivîn di odeya razanê de ye.',
    words: ['Nivîn', 'di', 'odeya', 'razanê', 'de', 'ye'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-8',
    english: 'I sleep in my bed.',
    kurdish: 'Ez di nivîna xwe de radizim.',
    words: ['Ez', 'di', 'nivîna', 'xwe', 'de', 'radizim'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-9',
    english: 'The lamp is on the table.',
    kurdish: 'Lampa li ser maseyê ye.',
    words: ['Lampa', 'li', 'ser', 'maseyê', 'ye'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-10',
    english: 'I turn on the light.',
    kurdish: 'Ez ronahiyê vekim.',
    words: ['Ez', 'ronahiyê', 'vekim'],
    category: 'house',
    difficulty: 'medium'
  },
  {
    id: 'house-11',
    english: 'The kitchen is clean.',
    kurdish: 'Aşxane paqij e.',
    words: ['Aşxane', 'paqij', 'e'],
    category: 'house',
    difficulty: 'medium'
  },
  {
    id: 'house-12',
    english: 'We cook in the kitchen.',
    kurdish: 'Em di aşxaneyê de xwarinê çêdikin.',
    words: ['Em', 'di', 'aşxaneyê', 'de', 'xwarinê', 'çêdikin'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-13',
    english: 'The bathroom is small.',
    kurdish: 'Hemam biçûk e.',
    words: ['Hemam', 'biçûk', 'e'],
    category: 'house',
    difficulty: 'easy'
  },
  {
    id: 'house-14',
    english: 'I clean the house.',
    kurdish: 'Ez malê paqij dikim.',
    words: ['Ez', 'malê', 'paqij', 'dikim'],
    category: 'house',
    difficulty: 'hard'
  },
  {
    id: 'house-15',
    english: 'The room is big.',
    kurdish: 'Ode mezin e.',
    words: ['Ode', 'mezin', 'e'],
    category: 'house',
    difficulty: 'easy'
  }
]

const numbersSentences: Sentence[] = [
  {
    id: 'numbers-1',
    english: 'I have one book.',
    kurdish: 'Pirtûkek min heye.',
    words: ['Pirtûkek', 'min', 'heye'],
    category: 'numbers',
    difficulty: 'easy'
  },
  {
    id: 'numbers-2',
    english: 'I see two cats.',
    kurdish: 'Ez du pisîkan dibînim.',
    words: ['Ez', 'du', 'pisîkan', 'dibînim'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-3',
    english: 'I have three apples.',
    kurdish: 'Sê sêvên min hene.',
    words: ['Sê', 'sêvên', 'min', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-4',
    english: 'There are five students.',
    kurdish: 'Pênc xwendekar hene.',
    words: ['Pênc', 'xwendekar', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-5',
    english: 'I count to ten.',
    kurdish: 'Ez heta deh jimêrim.',
    words: ['Ez', 'heta', 'deh', 'jimêrim'],
    category: 'numbers',
    difficulty: 'hard'
  },
  {
    id: 'numbers-6',
    english: 'I have four pens.',
    kurdish: 'Çar qelemên min hene.',
    words: ['Çar', 'qelemên', 'min', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-7',
    english: 'There are six chairs.',
    kurdish: 'Şeş kursî hene.',
    words: ['Şeş', 'kursî', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-8',
    english: 'I see seven birds.',
    kurdish: 'Ez heft balinde dibînim.',
    words: ['Ez', 'heft', 'balinde', 'dibînim'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-9',
    english: 'We are eight friends.',
    kurdish: 'Em heşt heval in.',
    words: ['Em', 'heşt', 'heval', 'in'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-10',
    english: 'I have nine books.',
    kurdish: 'Neh pirtûkên min hene.',
    words: ['Neh', 'pirtûkên', 'min', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-11',
    english: 'There are ten students.',
    kurdish: 'Deh xwendekar hene.',
    words: ['Deh', 'xwendekar', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-12',
    english: 'I count the numbers.',
    kurdish: 'Ez hejmaran jimêrim.',
    words: ['Ez', 'hejmaran', 'jimêrim'],
    category: 'numbers',
    difficulty: 'hard'
  },
  {
    id: 'numbers-13',
    english: 'I have twenty books.',
    kurdish: 'Bîst pirtûkên min hene.',
    words: ['Bîst', 'pirtûkên', 'min', 'hene'],
    category: 'numbers',
    difficulty: 'medium'
  },
  {
    id: 'numbers-14',
    english: 'We are three people.',
    kurdish: 'Em sê kes in.',
    words: ['Em', 'sê', 'kes', 'in'],
    category: 'numbers',
    difficulty: 'easy'
  },
  {
    id: 'numbers-15',
    english: 'I see five cars.',
    kurdish: 'Ez pênc otomobîl dibînim.',
    words: ['Ez', 'pênc', 'otomobîl', 'dibînim'],
    category: 'numbers',
    difficulty: 'medium'
  }
]

const daysMonthsSentences: Sentence[] = [
  {
    id: 'days-1',
    english: 'Today is Monday.',
    kurdish: 'Îro duşem e.',
    words: ['Îro', 'duşem', 'e'],
    category: 'days',
    difficulty: 'easy'
  },
  {
    id: 'days-2',
    english: 'Tomorrow is Tuesday.',
    kurdish: 'Sibê sêşem e.',
    words: ['Sibê', 'sêşem', 'e'],
    category: 'days',
    difficulty: 'easy'
  },
  {
    id: 'days-3',
    english: 'This month is January.',
    kurdish: 'Ev meh çile ye.',
    words: ['Ev', 'meh', 'çile', 'ye'],
    category: 'days',
    difficulty: 'medium'
  },
  {
    id: 'days-4',
    english: 'My birthday is in May.',
    kurdish: 'Rojbûna min di gulanê de ye.',
    words: ['Rojbûna', 'min', 'di', 'gulanê', 'de', 'ye'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-5',
    english: 'We meet on Friday.',
    kurdish: 'Em di înê de hevdîtin dikin.',
    words: ['Em', 'di', 'înê', 'de', 'hevdîtin', 'dikin'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-6',
    english: 'Today is Wednesday.',
    kurdish: 'Îro çarşem e.',
    words: ['Îro', 'çarşem', 'e'],
    category: 'days',
    difficulty: 'easy'
  },
  {
    id: 'days-7',
    english: 'I work on Saturday.',
    kurdish: 'Ez di şemiyê de kar dikim.',
    words: ['Ez', 'di', 'şemiyê', 'de', 'kar', 'dikim'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-8',
    english: 'Sunday is a holiday.',
    kurdish: 'Yekşem rojek betlaneyê ye.',
    words: ['Yekşem', 'rojek', 'betlaneyê', 'ye'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-9',
    english: 'This month is February.',
    kurdish: 'Ev meh sibat e.',
    words: ['Ev', 'meh', 'sibat', 'e'],
    category: 'days',
    difficulty: 'medium'
  },
  {
    id: 'days-10',
    english: 'Spring starts in March.',
    kurdish: 'Bihar di adarê de dest pê dike.',
    words: ['Bihar', 'di', 'adarê', 'de', 'dest', 'pê', 'dike'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-11',
    english: 'I was born in June.',
    kurdish: 'Ez di hezîranê de hatim dinê.',
    words: ['Ez', 'di', 'hezîranê', 'de', 'hatim', 'dinê'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-12',
    english: 'We go on vacation in July.',
    kurdish: 'Em di tîrmehê de diçin betlaneyê.',
    words: ['Em', 'di', 'tîrmehê', 'de', 'diçin', 'betlaneyê'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-13',
    english: 'September is autumn.',
    kurdish: 'Îlon payiz e.',
    words: ['Îlon', 'payiz', 'e'],
    category: 'days',
    difficulty: 'medium'
  },
  {
    id: 'days-14',
    english: 'Winter comes in December.',
    kurdish: 'Zivistan di kanûnê de tê.',
    words: ['Zivistan', 'di', 'kanûnê', 'de', 'tê'],
    category: 'days',
    difficulty: 'hard'
  },
  {
    id: 'days-15',
    english: 'Every day is a new day.',
    kurdish: 'Her roj rojek nû ye.',
    words: ['Her', 'roj', 'rojek', 'nû', 'ye'],
    category: 'days',
    difficulty: 'hard'
  }
]

const questionsSentences: Sentence[] = [
  {
    id: 'questions-1',
    english: 'Who is that?',
    kurdish: 'Ew kî ye?',
    words: ['Ew', 'kî', 'ye'],
    category: 'questions',
    difficulty: 'easy'
  },
  {
    id: 'questions-2',
    english: 'What is your name?',
    kurdish: 'Navê te çi ye?',
    words: ['Navê', 'te', 'çi', 'ye'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-3',
    english: 'Where are you from?',
    kurdish: 'Tu ji ku yî?',
    words: ['Tu', 'ji', 'ku', 'yî'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-4',
    english: 'When do you come?',
    kurdish: 'Tu kengî tê?',
    words: ['Tu', 'kengî', 'tê'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-5',
    english: 'How many books do you have?',
    kurdish: 'Çend pirtûkên te hene?',
    words: ['Çend', 'pirtûkên', 'te', 'hene'],
    category: 'questions',
    difficulty: 'hard'
  },
  {
    id: 'questions-6',
    english: 'How are you?',
    kurdish: 'Tu çawa yî?',
    words: ['Tu', 'çawa', 'yî'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-7',
    english: 'Why are you here?',
    kurdish: 'Tu çima li vir yî?',
    words: ['Tu', 'çima', 'li', 'vir', 'yî'],
    category: 'questions',
    difficulty: 'hard'
  },
  {
    id: 'questions-8',
    english: 'What do you want?',
    kurdish: 'Tu çi dixwazî?',
    words: ['Tu', 'çi', 'dixwazî'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-9',
    english: 'Where do you live?',
    kurdish: 'Tu li ku dijî?',
    words: ['Tu', 'li', 'ku', 'dijî'],
    category: 'questions',
    difficulty: 'hard'
  },
  {
    id: 'questions-10',
    english: 'What time is it?',
    kurdish: 'Saet çend e?',
    words: ['Saet', 'çend', 'e'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-11',
    english: 'How old are you?',
    kurdish: 'Tu çend salî yî?',
    words: ['Tu', 'çend', 'salî', 'yî'],
    category: 'questions',
    difficulty: 'hard'
  },
  {
    id: 'questions-12',
    english: 'What do you do?',
    kurdish: 'Tu çi kar dikî?',
    words: ['Tu', 'çi', 'kar', 'dikî'],
    category: 'questions',
    difficulty: 'medium'
  },
  {
    id: 'questions-13',
    english: 'Which book do you read?',
    kurdish: 'Tu kîjan pirtûkê dixwînî?',
    words: ['Tu', 'kîjan', 'pirtûkê', 'dixwînî'],
    category: 'questions',
    difficulty: 'hard'
  },
  {
    id: 'questions-14',
    english: 'Where is the school?',
    kurdish: 'Dibistan li ku ye?',
    words: ['Dibistan', 'li', 'ku', 'ye'],
    category: 'questions',
    difficulty: 'hard'
  },
  {
    id: 'questions-15',
    english: 'What is this?',
    kurdish: 'Ev çi ye?',
    words: ['Ev', 'çi', 'ye'],
    category: 'questions',
    difficulty: 'easy'
  }
]

const pronounsSentences: Sentence[] = [
  {
    id: 'pronouns-1',
    english: 'I am a student.',
    kurdish: 'Ez xwendekar im.',
    words: ['Ez', 'xwendekar', 'im'],
    category: 'pronouns',
    difficulty: 'easy'
  },
  {
    id: 'pronouns-2',
    english: 'You are my friend.',
    kurdish: 'Tu hevalê min î.',
    words: ['Tu', 'hevalê', 'min', 'î'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-3',
    english: 'We are here.',
    kurdish: 'Em li vir in.',
    words: ['Em', 'li', 'vir', 'in'],
    category: 'pronouns',
    difficulty: 'easy'
  },
  {
    id: 'pronouns-4',
    english: 'They are students.',
    kurdish: 'Ew xwendekar in.',
    words: ['Ew', 'xwendekar', 'in'],
    category: 'pronouns',
    difficulty: 'easy'
  },
  {
    id: 'pronouns-5',
    english: 'This is my book.',
    kurdish: 'Ev pirtûka min e.',
    words: ['Ev', 'pirtûka', 'min', 'e'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-6',
    english: 'That is your car.',
    kurdish: 'Ew otomobîla te ye.',
    words: ['Ew', 'otomobîla', 'te', 'ye'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-7',
    english: 'He is a teacher.',
    kurdish: 'Ew mamoste ye.',
    words: ['Ew', 'mamoste', 'ye'],
    category: 'pronouns',
    difficulty: 'easy'
  },
  {
    id: 'pronouns-8',
    english: 'She is my sister.',
    kurdish: 'Ew xwişka min e.',
    words: ['Ew', 'xwişka', 'min', 'e'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-9',
    english: 'We are friends.',
    kurdish: 'Em heval in.',
    words: ['Em', 'heval', 'in'],
    category: 'pronouns',
    difficulty: 'easy'
  },
  {
    id: 'pronouns-10',
    english: 'You are students.',
    kurdish: 'Hûn xwendekar in.',
    words: ['Hûn', 'xwendekar', 'in'],
    category: 'pronouns',
    difficulty: 'easy'
  },
  {
    id: 'pronouns-11',
    english: 'I see them.',
    kurdish: 'Ez wan dibînim.',
    words: ['Ez', 'wan', 'dibînim'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-12',
    english: 'This is our house.',
    kurdish: 'Ev mala me ye.',
    words: ['Ev', 'mala', 'me', 'ye'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-13',
    english: 'That is their car.',
    kurdish: 'Ew otomobîla wan e.',
    words: ['Ew', 'otomobîla', 'wan', 'e'],
    category: 'pronouns',
    difficulty: 'medium'
  },
  {
    id: 'pronouns-14',
    english: 'I give it to you.',
    kurdish: 'Ez wê didim te.',
    words: ['Ez', 'wê', 'didim', 'te'],
    category: 'pronouns',
    difficulty: 'hard'
  },
  {
    id: 'pronouns-15',
    english: 'We help them.',
    kurdish: 'Em alîkariya wan dikin.',
    words: ['Em', 'alîkariya', 'wan', 'dikin'],
    category: 'pronouns',
    difficulty: 'hard'
  }
]

const bodyPartsSentences: Sentence[] = [
  {
    id: 'body-1',
    english: 'My head hurts.',
    kurdish: 'Serê min diêşe.',
    words: ['Serê', 'min', 'diêşe'],
    category: 'body',
    difficulty: 'medium'
  },
  {
    id: 'body-2',
    english: 'I see with my eyes.',
    kurdish: 'Ez bi çavên xwe dibînim.',
    words: ['Ez', 'bi', 'çavên', 'xwe', 'dibînim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-3',
    english: 'I hear with my ears.',
    kurdish: 'Ez bi guhên xwe dibihîzim.',
    words: ['Ez', 'bi', 'guhên', 'xwe', 'dibihîzim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-4',
    english: 'My hand is big.',
    kurdish: 'Destê min mezin e.',
    words: ['Destê', 'min', 'mezin', 'e'],
    category: 'body',
    difficulty: 'medium'
  },
  {
    id: 'body-5',
    english: 'I walk with my legs.',
    kurdish: 'Ez bi lingên xwe digerim.',
    words: ['Ez', 'bi', 'lingên', 'xwe', 'digerim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-6',
    english: 'I wash my face.',
    kurdish: 'Ez rûyê xwe dişom.',
    words: ['Ez', 'rûyê', 'xwe', 'dişom'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-7',
    english: 'My foot is small.',
    kurdish: 'Pêya min biçûk e.',
    words: ['Pêya', 'min', 'biçûk', 'e'],
    category: 'body',
    difficulty: 'medium'
  },
  {
    id: 'body-8',
    english: 'I brush my teeth.',
    kurdish: 'Ez diranên xwe firçe dikim.',
    words: ['Ez', 'diranên', 'xwe', 'firçe', 'dikim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-9',
    english: 'My nose is big.',
    kurdish: 'Lûtê min mezin e.',
    words: ['Lûtê', 'min', 'mezin', 'e'],
    category: 'body',
    difficulty: 'medium'
  },
  {
    id: 'body-10',
    english: 'I touch with my hand.',
    kurdish: 'Ez bi destê xwe dest lê dikim.',
    words: ['Ez', 'bi', 'destê', 'xwe', 'dest', 'lê', 'dikim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-11',
    english: 'My shoulder hurts.',
    kurdish: 'Milê min diêşe.',
    words: ['Milê', 'min', 'diêşe'],
    category: 'body',
    difficulty: 'medium'
  },
  {
    id: 'body-12',
    english: 'I open my mouth.',
    kurdish: 'Ez devê xwe vedikim.',
    words: ['Ez', 'devê', 'xwe', 'vedikim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-13',
    english: 'My back is straight.',
    kurdish: 'Pişta min rast e.',
    words: ['Pişta', 'min', 'rast', 'e'],
    category: 'body',
    difficulty: 'medium'
  },
  {
    id: 'body-14',
    english: 'I move my arm.',
    kurdish: 'Ez çenga xwe dilivînim.',
    words: ['Ez', 'çenga', 'xwe', 'dilivînim'],
    category: 'body',
    difficulty: 'hard'
  },
  {
    id: 'body-15',
    english: 'My heart beats.',
    kurdish: 'Dilê min dilize.',
    words: ['Dilê', 'min', 'dilize'],
    category: 'body',
    difficulty: 'medium'
  }
]

const allSentences: Sentence[] = [
  ...colorsSentences,
  ...animalsSentences,
  ...foodSentences,
  ...familySentences,
  ...natureSentences,
  ...timeSentences,
  ...weatherSentences,
  ...houseSentences,
  ...numbersSentences,
  ...daysMonthsSentences,
  ...questionsSentences,
  ...pronounsSentences,
  ...bodyPartsSentences
]

// Create decks (matching flashcards structure)
const decks: Deck[] = [
  {
    name: 'Colors',
    description: 'Learn basic colors in Kurdish',
    icon: '🎨',
    sentences: colorsSentences
  },
  {
    name: 'Animals',
    description: 'Common animals and pets',
    icon: '🐾',
    sentences: animalsSentences
  },
  {
    name: 'Food & Meals',
    description: 'Food vocabulary from our lessons',
    icon: '🍽️',
    sentences: foodSentences
  },
  {
    name: 'Family Members',
    description: 'Family relationships and members',
    icon: '👨‍👩‍👧‍👦',
    sentences: familySentences
  },
  {
    name: 'Nature',
    description: 'Natural world vocabulary',
    icon: '🌿',
    sentences: natureSentences
  },
  {
    name: 'Time & Schedule',
    description: 'Time-related vocabulary',
    icon: '⏰',
    sentences: timeSentences
  },
  {
    name: 'Weather & Seasons',
    description: 'Weather and seasonal vocabulary',
    icon: '🌤️',
    sentences: weatherSentences
  },
  {
    name: 'House & Objects',
    description: 'Things around the house',
    icon: '🏠',
    sentences: houseSentences
  },
  {
    name: 'Numbers',
    description: 'Kurdish numbers 1-20',
    icon: '🔢',
    sentences: numbersSentences
  },
  {
    name: 'Days & Months',
    description: 'Days of week and months',
    icon: '📅',
    sentences: daysMonthsSentences
  },
  {
    name: 'Basic Question Words',
    description: 'Essential question words for conversations',
    icon: '❓',
    sentences: questionsSentences
  },
  {
    name: 'Pronouns',
    description: 'Personal and possessive pronouns',
    icon: '👥',
    sentences: pronounsSentences
  },
  {
    name: 'Body Parts',
    description: 'Human body parts vocabulary',
    icon: '👤',
    sentences: bodyPartsSentences
  },
  {
    name: 'Master Challenge',
    description: 'Ultimate test with all vocabulary mixed together',
    icon: '🏆',
    sentences: [] // Will be populated dynamically
  }
]

// Progress tracking
const getProgress = (categoryName: string): { completed: number; total: number } => {
  if (typeof window === 'undefined') return { completed: 0, total: 0 }
  const stored = localStorage.getItem(`sentence-builder-progress-${categoryName}`)
  return stored ? JSON.parse(stored) : { completed: 0, total: 0 }
}

const saveProgress = (categoryName: string, completed: number, total: number) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(`sentence-builder-progress-${categoryName}`, JSON.stringify({ completed, total }))
}

export default function SentenceBuilderPage() {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [completedSentences, setCompletedSentences] = useState<Set<string>>(new Set())

  const currentSentence = selectedDeck?.sentences[currentSentenceIndex]

  // Initialize game when deck is selected
  useEffect(() => {
    if (selectedDeck && currentSentence) {
      // Shuffle words and make ALL words lowercase (no capitalization hint)
      const words = [...currentSentence.words]
      const shuffled = shuffleArray(words).map(word => word.toLowerCase())
      
      setAvailableWords(shuffled)
      setSelectedWords([])
      setIsCorrect(null)
      setShowResult(false)
    }
  }, [selectedDeck, currentSentenceIndex])

  // Initialize Master Challenge when deck is first selected
  useEffect(() => {
    if (selectedDeck?.name === 'Master Challenge' && selectedDeck.sentences.length === 0) {
      const masterDeck: Deck = {
        ...selectedDeck,
        sentences: shuffleArray([...allSentences]).slice(0, 20) // 20 random sentences
      }
      setSelectedDeck(masterDeck)
    }
  }, [selectedDeck])

  const handleWordClick = (word: string, index: number) => {
    if (showResult) return
    
    // Remove word from available and add to selected
    const newAvailable = [...availableWords]
    newAvailable.splice(index, 1)
    setAvailableWords(newAvailable)
    
    setSelectedWords([...selectedWords, word])
  }

  const handleSelectedWordClick = (word: string, index: number) => {
    if (showResult) return
    
    // Remove word from selected and add back to available
    const newSelected = [...selectedWords]
    newSelected.splice(index, 1)
    setSelectedWords(newSelected)
    
    setAvailableWords([...availableWords, word])
  }

  const checkSentence = () => {
    if (!currentSentence) return
    
    // Build user sentence (all lowercase for comparison)
    const userSentence = selectedWords.join(' ').toLowerCase()
    
    // Build correct sentence (all lowercase for comparison)
    const correctSentence = currentSentence.words.join(' ').toLowerCase()
    
    // Compare case-insensitively
    const correct = userSentence === correctSentence
    setIsCorrect(correct)
    setShowResult(true)
    setAttempts(attempts + 1)
    
    if (correct) {
      setScore(score + 1)
      setCompletedSentences(new Set([...Array.from(completedSentences), currentSentence.id]))
      
      // Save progress
      if (selectedDeck) {
        const progress = getProgress(selectedDeck.name)
        const newCompleted = completedSentences.has(currentSentence.id) 
          ? progress.completed 
          : progress.completed + 1
        saveProgress(selectedDeck.name, newCompleted, selectedDeck.sentences.length)
      }
    }
  }

  const nextSentence = () => {
    if (!selectedDeck) return
    
    const nextIndex = (currentSentenceIndex + 1) % selectedDeck.sentences.length
    setCurrentSentenceIndex(nextIndex)
    setShowResult(false)
    setIsCorrect(null)
  }

  const resetSentence = () => {
    if (!currentSentence) return
    
    // Shuffle words and make ALL words lowercase (no capitalization hint)
    const words = [...currentSentence.words]
    const shuffled = shuffleArray(words).map(word => word.toLowerCase())
    
    setAvailableWords(shuffled)
    setSelectedWords([])
    setIsCorrect(null)
    setShowResult(false)
  }

  const handleDeckSelect = (deck: Deck) => {
    const deckToUse = deck.name === 'Master Challenge' 
      ? { ...deck, sentences: shuffleArray([...allSentences]).slice(0, 20) }
      : deck
    
    setSelectedDeck(deckToUse)
    setCurrentSentenceIndex(0)
    setScore(0)
    setAttempts(0)
    setCompletedSentences(new Set())
    
    // Load progress
    const progress = getProgress(deckToUse.name)
    // Note: We'd need to track which specific sentences were completed
  }

  // Show deck selection
  if (!selectedDeck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kurdish-red/10 via-white to-kurdish-green/10">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-kurdish-red text-center">Sentence Builder</h1>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-center text-lg text-gray-700 mb-8">
              Choose a category to start building Kurdish sentences!
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {decks.map((deck) => {
                const totalSentences = deck.name === "Master Challenge" ? allSentences.length : deck.sentences.length
                const progress = getProgress(deck.name)
                // Use saved total if available and valid, otherwise use current totalSentences
                const effectiveTotal = (progress && progress.total > 0) ? progress.total : totalSentences
                const isCompleted = progress && progress.completed === effectiveTotal && effectiveTotal > 0
                // Calculate percentage safely, avoiding division by zero
                const progressPercentage = (progress && effectiveTotal > 0)
                  ? Math.round((progress.completed / effectiveTotal) * 100)
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
                      {totalSentences} sentences
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

  // Show game
  if (!currentSentence) return null

  const progress = getProgress(selectedDeck.name)
  const progressPercent = selectedDeck.sentences.length > 0
    ? Math.round((progress.completed / selectedDeck.sentences.length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-backgroundCream via-white to-backgroundCream">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="inline-flex items-center gap-2 text-primaryBlue hover:text-primaryBlue/80">
            <ArrowLeft className="w-4 h-4" />
            Back to Games
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Score: <span className="font-bold text-primaryBlue">{score}</span> / {attempts}
            </div>
            <div className="text-sm text-gray-600">
              {currentSentenceIndex + 1} / {selectedDeck.sentences.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{selectedDeck.name}</span>
            <span>{progress.completed} / {selectedDeck.sentences.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primaryBlue to-supportLavender h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* English Sentence */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-100 mb-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-800 mb-4">{currentSentence.english}</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Difficulty:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentSentence.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentSentence.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentSentence.difficulty.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Words (Building Area) */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Sentence:</h3>
          <div className="min-h-[80px] flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            {selectedWords.length === 0 ? (
              <p className="text-gray-400 italic">Click words below to build your sentence...</p>
            ) : (
              selectedWords.map((word, index) => (
                <motion.button
                  key={`${word}-${index}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => handleSelectedWordClick(word, index)}
                  className="px-4 py-2 bg-gradient-to-r from-primaryBlue to-supportLavender text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  {word}
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Available Words */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Words:</h3>
          <div className="flex flex-wrap gap-3">
            {availableWords.map((word, index) => (
              <motion.button
                key={`${word}-${index}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleWordClick(word, index)}
                disabled={showResult}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {word}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border-2 ${
                isCorrect ? 'border-green-300 bg-green-50/50' : 'border-red-300 bg-red-50/50'
              } mb-6`}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <h3 className="text-2xl font-bold text-green-700">Correct! 🎉</h3>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-500" />
                    <h3 className="text-2xl font-bold text-red-700">Not quite right</h3>
                  </>
                )}
              </div>
              
              <div className="text-center mb-4">
                <p className="text-lg text-gray-700 mb-2">Correct sentence:</p>
                <p className="text-2xl font-kurdish text-primaryBlue mb-4">{currentSentence.kurdish}</p>
                <AudioButton 
                  audioFile={getSentenceBuilderAudioPath(currentSentence.kurdish)}
                  kurdishText={currentSentence.kurdish}
                  phoneticText={currentSentence.kurdish.toUpperCase()}
                  label="Listen"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetSentence}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          
          {!showResult ? (
            <button
              onClick={checkSentence}
              disabled={selectedWords.length === 0}
              className="px-8 py-3 bg-gradient-to-r from-primaryBlue to-supportLavender text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextSentence}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Next Sentence
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
