'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Users, ShoppingCart, Utensils, MapPin, Phone, Heart, Coffee, Car } from 'lucide-react'
import PageContainer from '../../../components/PageContainer'
import BackLink from '../../../components/BackLink'
import AudioButton from '../../../components/lessons/AudioButton'
import { useProgress } from '../../../contexts/ProgressContext'
import { restoreRefsFromProgress } from '../../../lib/progressHelper'

const LESSON_ID = '10' // Daily Conversations lesson ID

interface Conversation {
  id: string
  category: string
  title: string
  english: string
  kurdish: string
  pronunciation: string
  context: string
  icon: React.ReactNode
  audio?: string
}

interface ConversationCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const categories: ConversationCategory[] = [
  {
    id: 'greetings',
    name: 'Greetings & Small Talk',
    description: 'Basic greetings and polite conversation',
    icon: <MessageCircle className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'shopping',
    name: 'Shopping & Market',
    description: 'Buying things and asking prices',
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'food',
    name: 'Restaurant & Food',
    description: 'Ordering food and dining out',
    icon: <Utensils className="w-4 h-4" />,
    color: 'bg-orange-100 text-orange-800'
  },
  {
    id: 'directions',
    name: 'Directions & Location',
    description: 'Asking for and giving directions',
    icon: <MapPin className="w-4 h-4" />,
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'emergency',
    name: 'Emergency & Help',
    description: 'Important phrases for emergencies',
    icon: <Phone className="w-4 h-4" />,
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'social',
    name: 'Social & Friends',
    description: 'Meeting people and making friends',
    icon: <Heart className="w-4 h-4" />,
    color: 'bg-pink-100 text-pink-800'
  },
  {
    id: 'coffee',
    name: 'Coffee & Tea Time',
    description: 'Traditional Kurdish hospitality',
    icon: <Coffee className="w-4 h-4" />,
    color: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'transport',
    name: 'Transportation',
    description: 'Getting around and travel',
    icon: <Car className="w-4 h-4" />,
    color: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'phrases',
    name: 'Daily Phrases',
    description: 'Essential Kurdish phrases for everyday use',
    icon: <MessageCircle className="w-4 h-4" />,
    color: 'bg-teal-100 text-teal-800'
  }
]

const conversations: Conversation[] = [
  // Greetings & Small Talk (9 conversations)
  {
    id: 'greet1',
    category: 'greetings',
    title: 'Good Morning',
    english: 'Good morning! How are you?',
    kurdish: 'Rojbaş! Tu çawa yî?',
    pronunciation: 'ROHZH-bash! Tu CHA-wa YEE?',
    context: 'Use this in the morning until about 11 AM',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'greet2',
    category: 'greetings',
    title: 'Good Evening',
    english: 'Good evening! How was your day?',
    kurdish: 'Êvar baş! Rojê te çawa bû?',
    pronunciation: 'AY-var BASH! Ro-JEH te CHA-wa BOO?',
    context: 'Use this after 6 PM',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'greet3',
    category: 'greetings',
    title: 'Nice to Meet You',
    english: 'Nice to meet you!',
    kurdish: 'Bi nasîna te ez kêfxweş bûm.',
    pronunciation: 'Bi na-SEE-na te ez KEF-khwe-shim boom.',
    context: 'When meeting someone for the first time',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'greet4',
    category: 'greetings',
    title: 'How Are You?',
    english: 'How are you? I am fine, thank you.',
    kurdish: 'Tu çawa yî? Ez baş im, spas.',
    pronunciation: 'Tu CHA-wa YEE? Ez BASH im, spas.',
    context: 'Standard greeting response',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'greet5',
    category: 'greetings',
    title: 'Good Night',
    english: 'Good night! Sleep well.',
    kurdish: 'Şev baş! Baş razê.',
    pronunciation: 'Shev BASH! BASH ra-ZEH.',
    context: 'When saying goodbye at night',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'greet6',
    category: 'greetings',
    title: 'Good Afternoon',
    english: 'Good afternoon! How is your day?',
    kurdish: 'Nîvro baş! Roja te çawa ye?',
    pronunciation: 'NEEV-ro BASH! Ro-JA te CHA-wa yeh?',
    context: 'Use this in the afternoon',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'greet7',
    category: 'greetings',
    title: 'Have a Good Day',
    english: 'Have a good day!',
    kurdish: 'Roja te baş be!',
    pronunciation: 'Ro-JA te BASH beh!',
    context: 'When parting ways during the day',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'greet8',
    category: 'greetings',
    title: 'See You Later',
    english: 'See you later!',
    kurdish: 'Paşê dîtina hev!',
    pronunciation: 'Pa-SHEH dee-ti-NA hev!',
    context: 'When you plan to meet again',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'greet9',
    category: 'greetings',
    title: 'Take Care',
    english: 'Take care of yourself!',
    kurdish: 'Xwe baş parêze!',
    pronunciation: 'Khweh BASH pa-REH-zeh!',
    context: 'A caring way to say goodbye',
    icon: <Heart className="w-5 h-5" />
  },

  // Shopping & Market (9 conversations)
  {
    id: 'shop1',
    category: 'shopping',
    title: 'How Much Is This?',
    english: 'How much is this?',
    kurdish: 'Ev çend e?',
    pronunciation: 'Ev CHEND eh?',
    context: 'Asking about price in shops',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop2',
    category: 'shopping',
    title: 'Too Expensive',
    english: 'This is too expensive. Can you reduce the price?',
    kurdish: 'Ev pir biha ye. Tu dikarî bihayê kêm bikî?',
    pronunciation: 'Ev peer bi-HA yeh. Tu di-ka-REE bi-ha-YEH kem bi-KEE?',
    context: 'Bargaining at markets',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop3',
    category: 'shopping',
    title: 'I Will Take It',
    english: 'I will take this one.',
    kurdish: 'Ez ê vê bigirim.',
    pronunciation: 'Ez AY veh bi-GEE-rim.',
    context: 'When you decide to buy something',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop4',
    category: 'shopping',
    title: 'Do You Have...?',
    english: 'Do you have bread?',
    kurdish: 'Nan heye?',
    pronunciation: 'Nan HE-ye?',
    context: 'Asking if something is available',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop5',
    category: 'shopping',
    title: 'Where Can I Buy...?',
    english: 'Where can I buy fruits?',
    kurdish: 'Ez fêkiyan ji ku bikirim?',
    pronunciation: 'Ez feh-KEE-yan zhee koo bi-KEE-rim?',
    context: 'Asking for directions to shops',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop6',
    category: 'shopping',
    title: 'Is This Fresh?',
    english: 'Is this fresh?',
    kurdish: 'Ev taze ye?',
    pronunciation: 'Ev ta-ZEH yeh?',
    context: 'Asking about food quality',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop7',
    category: 'shopping',
    title: 'How much is this?',
    english: 'How much is this?',
    kurdish: 'Ev çiqas e?',
    pronunciation: 'Ev CHEE-kas eh?',
    context: 'Asking about the price of an item',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop8',
    category: 'shopping',
    title: 'Do You Accept Cards?',
    english: 'Do you accept credit cards?',
    kurdish: 'Tu kartên kredî qebûl dikî?',
    pronunciation: 'Tu kar-TEN ke-re-DEE ka-BOOL di-KEE?',
    context: 'Asking about payment methods',
    icon: <ShoppingCart className="w-5 h-5" />
  },
  {
    id: 'shop9',
    category: 'shopping',
    title: 'Thank You',
    english: 'Thank you for your help.',
    kurdish: 'Spas ji bo alîkariya te.',
    pronunciation: 'Spas zhee bo a-lee-ka-ri-YA te.',
    context: 'Thanking shopkeepers',
    icon: <ShoppingCart className="w-5 h-5" />
  },

  // Restaurant & Food (9 conversations)
  {
    id: 'food1',
    category: 'food',
    title: 'Table for Two',
    english: 'Table for two, please.',
    kurdish: 'Masek ji bo du kesan, ji kerema xwe.',
    pronunciation: 'Ma-SEK zhee bo doo KE-san, zhee ke-re-MA khwe.',
    context: 'When entering a restaurant',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food2',
    category: 'food',
    title: 'What Do You Recommend?',
    english: 'What do you recommend?',
    kurdish: 'Tu çi pêşniyar dikî?',
    pronunciation: 'Tu CHEE pesh-ni-YAR di-KEE?',
    context: 'Asking for food recommendations',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food3',
    category: 'food',
    title: 'The Bill Please',
    english: 'The bill, please.',
    kurdish: 'Hesab, ji kerema xwe.',
    pronunciation: 'He-SAB, zhee ke-re-MA khwe.',
    context: 'When you want to pay',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food4',
    category: 'food',
    title: 'It Was Delicious',
    english: 'It was delicious!',
    kurdish: 'Xweş bû!',
    pronunciation: 'Khwesh BOO!',
    context: 'Complimenting the food',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food5',
    category: 'food',
    title: 'I Am Hungry',
    english: 'I am hungry. What do you have?',
    kurdish: 'Ez birçî me. Çi te heye?',
    pronunciation: 'Ez beer-CHEE meh. CHEE te he-YEH?',
    context: 'When you are ready to order',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food6',
    category: 'food',
    title: 'Is It Spicy?',
    english: 'Is this food spicy?',
    kurdish: 'Ev xwarin tûj e?',
    pronunciation: 'Ev khwa-RIN tooj eh?',
    context: 'Asking about food heat level',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food7',
    category: 'food',
    title: 'I Am Allergic',
    english: 'I am allergic to mushroom.',
    kurdish: 'Ez ji kivarkan re alerjîk im.',
    pronunciation: 'Ez zhee ki-var-kan re a-ler-JEEK im.',
    context: 'Informing about food allergies',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food8',
    category: 'food',
    title: 'More Water Please',
    english: 'More water, please.',
    kurdish: 'Zêdetir av, ji kerema xwe.',
    pronunciation: 'Zeh-de-TIR av, zhee ke-re-MA khwe.',
    context: 'Asking for more drinks',
    icon: <Utensils className="w-5 h-5" />
  },
  {
    id: 'food9',
    category: 'food',
    title: 'Can I Have the Menu?',
    english: 'Can I have the menu, please?',
    kurdish: 'Ez dikarim menuyê bibînim?',
    pronunciation: 'Ez di-ka-RIM me-nu-YEH bi-BEE-nim?',
    context: 'Requesting the restaurant menu',
    icon: <Utensils className="w-5 h-5" />
  },

  // Directions & Location (9 conversations)
  {
    id: 'dir1',
    category: 'directions',
    title: 'Where Is...?',
    english: 'Where is the hospital?',
    kurdish: 'Nexweşxane li ku ye?',
    pronunciation: 'Nekh-wesh-KHA-neh li koo yeh?',
    context: 'Asking for directions to important places',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir2',
    category: 'directions',
    title: 'Go Straight',
    english: 'Go straight ahead.',
    kurdish: 'Rast biçe.',
    pronunciation: 'Rast bi-CHE.',
    context: 'Giving simple directions',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir3',
    category: 'directions',
    title: 'Turn Left/Right',
    english: 'Turn left at the corner.',
    kurdish: 'Li quncikê çep bizivire.',
    pronunciation: 'Li kun-CHEE-keh chep bi-zee-VEE-re.',
    context: 'Giving turning directions',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir4',
    category: 'directions',
    title: 'I Am Lost',
    english: 'I am lost. Can you help me?',
    kurdish: 'Ez winda bûme. Tu dikarî alîkariya min bikî?',
    pronunciation: 'Ez win-DA boo-meh. Tu di-ka-REE a-lee-ka-ri-YA min bi-KEE?',
    context: 'When you need help finding your way',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir5',
    category: 'directions',
    title: 'How Far Is It?',
    english: 'How far is the market?',
    kurdish: 'Bazar çiqas dûr e?',
    pronunciation: 'Ba-ZAR CHEE-kas door eh?',
    context: 'Asking about distance',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir6',
    category: 'directions',
    title: 'Is It Near Here?',
    english: 'Is it near here?',
    kurdish: 'Ew nêzîkî vir e?',
    pronunciation: 'Ew neh-ZEE-kee vir eh?',
    context: 'Checking if destination is close',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir7',
    category: 'directions',
    title: 'Can You Show Me?',
    english: 'Can you show me on the map?',
    kurdish: 'Tu dikarî li ser nexşeyê nîşanî min bidî?',
    pronunciation: 'Tu di-ka-REE li ser nekh-SHE-YEH nee-sha-NEE min bi-DEE?',
    context: 'Asking for map assistance',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir8',
    category: 'directions',
    title: 'Which Bus Goes There?',
    english: 'Which bus goes to the city center?',
    kurdish: 'Kîjan otobûs diçe navenda bajêr?',
    pronunciation: 'Kee-JAN o-to-BOOS di-CHE na-VEN-da ba-JERH?',
    context: 'Asking about public transportation',
    icon: <MapPin className="w-5 h-5" />
  },
  {
    id: 'dir9',
    category: 'directions',
    title: 'Walk for 5 Minutes',
    english: 'Walk straight for 5 minutes.',
    kurdish: 'Ji bo pênc deqîqeyan rast biçe.',
    pronunciation: 'Zhee bo PENCH de-kee-ke-YAN rast bi-CHE.',
    context: 'Giving walking directions',
    icon: <MapPin className="w-5 h-5" />
  },

  // Emergency & Help (9 conversations)
  {
    id: 'emerg1',
    category: 'emergency',
    title: 'Help Me',
    english: 'Help me!',
    kurdish: 'Alîkariya min bike!',
    pronunciation: 'A-lee-ka-ri-YA min bi-KEH!',
    context: 'In urgent situations',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg2',
    category: 'emergency',
    title: 'Call the Police',
    english: 'Call the police!',
    kurdish: 'Polîsê bang bike!',
    pronunciation: 'Po-LEE-seh bang bi-KEH!',
    context: 'In emergency situations',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg3',
    category: 'emergency',
    title: 'I Need a Doctor',
    english: 'I need a doctor.',
    kurdish: 'Ez pêdiviya doktor heye.',
    pronunciation: 'Ez peh-di-VI-ya dok-TOR he-YEH.',
    context: 'When you need medical help',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg4',
    category: 'emergency',
    title: 'Where Is the Bathroom?',
    english: 'Where is the bathroom?',
    kurdish: 'Tualet li ku ye?',
    pronunciation: 'Too-a-LET li koo yeh?',
    context: 'Essential question when you need to go',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg5',
    category: 'emergency',
    title: 'I Lost My Wallet',
    english: 'I lost my wallet.',
    kurdish: 'Ez cizdana xwe winda kirim.',
    pronunciation: 'Ez ciz-da-NA khwe win-DA ki-rim.',
    context: 'Reporting lost items',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg6',
    category: 'emergency',
    title: 'Call an Ambulance',
    english: 'Call an ambulance!',
    kurdish: 'Ambulansê bang bike!',
    pronunciation: 'Am-boo-LAN-seh bang bi-KEH!',
    context: 'Medical emergency',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg7',
    category: 'emergency',
    title: 'Fire!',
    english: 'Fire!',
    kurdish: 'Agir!',
    pronunciation: 'A-GIR!',
    context: 'Fire emergency',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg8',
    category: 'emergency',
    title: 'I Need Help',
    english: 'I need help immediately.',
    kurdish: 'Ez pêdiviya alîkariyê heye.',
    pronunciation: 'Ez peh-di-VI-ya a-lee-ka-ri-YEH he-YEH.',
    context: 'General help request',
    icon: <Phone className="w-5 h-5" />
  },
  {
    id: 'emerg9',
    category: 'emergency',
    title: 'Where Is the Hospital?',
    english: 'Where is the nearest hospital?',
    kurdish: 'Nexweşxaneya herî nêzik li ku ye?',
    pronunciation: 'Nekh-wesh-kha-NE-ya he-REE neh-ZEEK li koo yeh?',
    context: 'Looking for medical facilities',
    icon: <Phone className="w-5 h-5" />
  },

  // Social & Friends (9 conversations)
  {
    id: 'social1',
    category: 'social',
    title: 'What Is Your Name?',
    english: 'What is your name?',
    kurdish: 'Navê te çi ye?',
    pronunciation: 'Na-VEH te CHEE yeh?',
    context: 'When meeting new people',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'social2',
    category: 'social',
    title: 'Where Are You From?',
    english: 'Where are you from?',
    kurdish: 'Tu ji ku yî?',
    pronunciation: 'Tu zhee koo YEE?',
    context: 'Getting to know someone',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'social3',
    category: 'social',
    title: 'Do You Speak English?',
    english: 'Do you speak English?',
    kurdish: 'Tu înglîzî dizanî?',
    pronunciation: 'Tu ing-LEE-zee di-za-NEE?',
    context: 'When you need to communicate',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'social4',
    category: 'social',
    title: 'See You Later',
    english: 'See you later!',
    kurdish: 'Paşê dîtina hev!',
    pronunciation: 'Pa-SHEH dee-ti-NA hev!',
    context: 'Friendly goodbye',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'social5',
    category: 'social',
    title: 'How Old Are You?',
    english: 'How old are you?',
    kurdish: 'Tu çend salî yî?',
    pronunciation: 'Tu CHEND sa-LEE YEE?',
    context: 'Getting to know someone',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'social6',
    category: 'social',
    title: 'What Do You Do?',
    english: 'What do you do for work?',
    kurdish: 'Tu çi kar dikî?',
    pronunciation: 'Tu CHEE kar di-KEE?',
    context: 'Asking about profession',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'social7',
    category: 'social',
    title: 'Nice to Meet You',
    english: 'Nice to meet you!',
    kurdish: 'Bi nasîna te ez kêfxweş bûm.',
    pronunciation: 'Bi na-SEE-na te ez KEF-khwe-shim boom.',
    context: 'When meeting someone new',
    icon: <Heart className="w-5 h-5" />
  },
  {
    id: 'social8',
    category: 'social',
    title: 'Do You Have Children?',
    english: 'Do you have children?',
    kurdish: 'Zarokên te hene?',
    pronunciation: 'Za-ro-KEN te he-NEH?',
    context: 'Family conversation',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'social9',
    category: 'social',
    title: 'Let\'s Be Friends',
    english: 'Let\'s be friends!',
    kurdish: 'Em bibin heval!',
    pronunciation: 'Em bi-BIN he-VAL!',
    context: 'Making new friends',
    icon: <Heart className="w-5 h-5" />
  },

  // Coffee & Tea Time (9 conversations)
  {
    id: 'coffee1',
    category: 'coffee',
    title: 'Would You Like Coffee?',
    english: 'Would you like coffee or tea?',
    kurdish: 'Tu qehwe dixwazî an çayê?',
    pronunciation: 'Tu ka-WEH dikh-WA-zee an cha-YEH?',
    context: 'Traditional Kurdish hospitality',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee2',
    category: 'coffee',
    title: 'Yes Please',
    english: 'Yes, please. Thank you.',
    kurdish: 'Erê, ji kerema xwe. Spas.',
    pronunciation: 'E-REH, zhee ke-re-MA khwe. Spas.',
    context: 'Accepting hospitality',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee3',
    category: 'coffee',
    title: 'It Is Very Good',
    english: 'The coffee is very good!',
    kurdish: 'Qehwe pir xweş e!',
    pronunciation: 'Ka-WEH peer khwesh eh!',
    context: 'Complimenting the coffee',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee4',
    category: 'coffee',
    title: 'No Sugar Please',
    english: 'No sugar, please.',
    kurdish: 'Bê şekir, ji kerema xwe.',
    pronunciation: 'Beh she-KIR, zhee ke-re-MA khwe.',
    context: 'Preference for coffee',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee5',
    category: 'coffee',
    title: 'More Coffee Please',
    english: 'More coffee, please.',
    kurdish: 'Zêdetir qehwe, ji kerema xwe.',
    pronunciation: 'Zeh-de-TIR ka-WEH, zhee ke-re-MA khwe.',
    context: 'Asking for refill',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee6',
    category: 'coffee',
    title: 'Black Coffee',
    english: 'Black coffee, please.',
    kurdish: 'Qehweya reş, ji kerema xwe.',
    pronunciation: 'Ka-WEH-ya resh, zhee ke-re-MA khwe.',
    context: 'Ordering specific type',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee7',
    category: 'coffee',
    title: 'Green Tea',
    english: 'Green tea, please.',
    kurdish: 'Çayê kesk, ji kerema xwe.',
    pronunciation: 'Cha-YEH kesk, zhee ke-re-MA khwe.',
    context: 'Alternative to coffee',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee8',
    category: 'coffee',
    title: 'Too Hot',
    english: 'It\'s too hot.',
    kurdish: 'Pir germ e.',
    pronunciation: 'Peer germ eh.',
    context: 'Temperature preference',
    icon: <Coffee className="w-5 h-5" />
  },
  {
    id: 'coffee9',
    category: 'coffee',
    title: 'Perfect Temperature',
    english: 'Perfect temperature!',
    kurdish: 'Germahiya biqas e!',
    pronunciation: 'Ger-ma-hee-YA bi-KAS eh!',
    context: 'Complimenting the drink',
    icon: <Coffee className="w-5 h-5" />
  },

  // Transportation (9 conversations)
  {
    id: 'trans1',
    category: 'transport',
    title: 'Where Is the Bus Stop?',
    english: 'Where is the bus stop?',
    kurdish: 'Rawestgeha otobûsê li ku ye?',
    pronunciation: 'Ra-wes-te-GA o-to-BOO-seh li koo yeh?',
    context: 'Using public transportation',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans2',
    category: 'transport',
    title: 'How Much to the City?',
    english: 'How much is it to the city center?',
    kurdish: 'Ji bo navenda bajêr çend e?',
    pronunciation: 'Zhee bo na-VEN-da ba-JERH CHEND eh?',
    context: 'Asking about taxi or bus fare',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans3',
    category: 'transport',
    title: 'Stop Here Please',
    english: 'Stop here, please.',
    kurdish: 'Li vir rawestîne, ji kerema xwe.',
    pronunciation: 'Li veer ra-wes-TEE-neh, zhee ke-re-MA khwe.',
    context: 'Telling driver where to stop',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans4',
    category: 'transport',
    title: 'Taxi Please',
    english: 'I need a taxi.',
    kurdish: 'Ez pêdiviya taksî heye.',
    pronunciation: 'Ez peh-di-VI-ya tak-SEE he-YEH.',
    context: 'Calling for taxi',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans5',
    category: 'transport',
    title: 'Airport Please',
    english: 'Take me to the airport.',
    kurdish: 'Min berde balafirgehê.',
    pronunciation: 'Min ber-DEH ba-la-fir-GEH-eh.',
    context: 'Going to airport',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans6',
    category: 'transport',
    title: 'Train Station',
    english: 'Where is the train station?',
    kurdish: 'Stasyona trenê li ku ye?',
    pronunciation: 'Sta-syo-NA tre-NEH li koo yeh?',
    context: 'Looking for train station',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans7',
    category: 'transport',
    title: 'When Does It Leave?',
    english: 'When does the bus leave?',
    kurdish: 'Otobûs kengê diçe?',
    pronunciation: 'O-to-BOOS ken-GEH di-CHE?',
    context: 'Checking departure times',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans8',
    category: 'transport',
    title: 'How Long Does It Take?',
    english: 'How long does it take?',
    kurdish: 'Çend dem dixwaze?',
    pronunciation: 'CHEND dem dikh-WA-zeh?',
    context: 'Asking about travel time',
    icon: <Car className="w-5 h-5" />
  },
  {
    id: 'trans9',
    category: 'transport',
    title: 'Drive Slowly',
    english: 'Please drive slowly.',
    kurdish: 'Ji kerema xwe, hêdî bajo.',
    pronunciation: 'Zhee ke-re-MA khwe, heh-DEE ba-JO.',
    context: 'Requesting careful driving',
    icon: <Car className="w-5 h-5" />
  },

  // Daily Phrases (9 phrases)
  {
    id: 'phrase1',
    category: 'phrases',
    title: 'I Am Learning Kurdish',
    english: 'I am learning Kurdish.',
    kurdish: 'Ez kurdî fêr dibim.',
    pronunciation: 'Ez koor-DEE fehr dee-BEEM.',
    context: 'When someone asks what you are doing',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase2',
    category: 'phrases',
    title: 'I Don\'t Understand',
    english: 'I don\'t understand.',
    kurdish: 'Ez fêm nakim.',
    pronunciation: 'Ez FEHM na-KIM.',
    context: 'When you need clarification',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase3',
    category: 'phrases',
    title: 'Please Repeat',
    english: 'Please repeat that.',
    kurdish: 'Ji kerema xwe, dîsa bêje.',
    pronunciation: 'Zhee ke-re-MA khwe, DEE-sa BEH-jeh.',
    context: 'When you need someone to say it again',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase4',
    category: 'phrases',
    title: 'Speak Slowly',
    english: 'Please speak slowly.',
    kurdish: 'Ji kerema xwe, hêdî biaxive.',
    pronunciation: 'Zhee ke-re-MA khwe, heh-DEE bee-ah-khee-VEH.',
    context: 'When someone speaks too fast',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase5',
    category: 'phrases',
    title: 'What Does This Mean?',
    english: 'What does this mean?',
    kurdish: 'Ev çi wate dike?',
    pronunciation: 'Ev CHEE wa-TEH di-KEH?',
    context: 'Asking for word or phrase meaning',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase6',
    category: 'phrases',
    title: 'How Do You Say...?',
    english: 'How do you say "hello" in Kurdish?',
    kurdish: 'Tu "hello" bi kurdî çawa dibêjî?',
    pronunciation: 'Tu "hello" bi koor-DEE CHA-wa di-BEH-jee?',
    context: 'Learning new words',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase7',
    category: 'phrases',
    title: 'Is This Correct?',
    english: 'Is this correct?',
    kurdish: 'Ev rast e?',
    pronunciation: 'Ev rast eh?',
    context: 'Checking if you said something right',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase8',
    category: 'phrases',
    title: 'I Need Help',
    english: 'I need help with Kurdish.',
    kurdish: 'Ez pêdiviya alîkariyê heye ji bo kurdî.',
    pronunciation: 'Ez peh-di-VI-ya a-lee-ka-ri-YEH he-YEH zhee bo koor-DEE.',
    context: 'Asking for language help',
    icon: <MessageCircle className="w-5 h-5" />
  },
  {
    id: 'phrase9',
    category: 'phrases',
    title: 'Can You Help Me?',
    english: 'Can you help me practice?',
    kurdish: 'Tu dikarî alîkariya min bikî ji bo pratîkê?',
    pronunciation: 'Tu di-ka-REE a-lee-ka-ri-YA min bi-KEE zhee bo pra-TEEK-eh?',
    context: 'Asking someone to practice with you',
    icon: <MessageCircle className="w-5 h-5" />
  }
]

export default function DailyConversationsPage() {
  const { updateLessonProgress, getLessonProgress } = useProgress()
  
  // Progress tracking configuration
  const progressConfig = {
    totalAudios: 81, // 9 greetings + 9 shopping + 9 food + 9 directions + 9 emergency + 9 social + 9 coffee + 9 transport + 9 phrases
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 100 / 81, // ~1.23% per audio
  }
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID)
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig)
  const startTimeRef = useRef<number>(estimatedStartTime)
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set())
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays)
  const refsInitializedRef = useRef(false)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredConversations = selectedCategory === 'all' 
    ? conversations 
    : conversations.filter(conv => conv.category === selectedCategory)

  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory)

  // Calculate progress based on unique audios played and time spent
  const calculateProgress = (): number => {
    const currentProgress = getLessonProgress(LESSON_ID)
    const storedProgress = currentProgress?.progress || 0
    
    // Calculate total unique audios played (base + session)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios)
    
    // Audio progress: 50% weight
    const audioProgress = Math.min(progressConfig.audioWeight, (effectiveUniqueAudios / progressConfig.totalAudios) * progressConfig.audioWeight)
    
    // Time progress: 50% weight (3 minutes = 50%)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const timeProgress = Math.min(progressConfig.timeWeight, (totalTimeSpent / 3) * progressConfig.timeWeight)
    
    // Combined progress
    let calculatedProgress = audioProgress + timeProgress
    
    // Special case: if all audios are played, force 100% completion (prioritizing audio completion)
    if (effectiveUniqueAudios >= progressConfig.totalAudios) {
      calculatedProgress = 100
    }
    
    // Prevent progress from decreasing
    return Math.max(storedProgress, Math.round(calculatedProgress))
  }

  // Handle audio play - track unique audios
  const handleAudioPlay = (audioKey: string) => {
    // Track unique audios played (only count new ones) - check BEFORE adding
    if (uniqueAudiosPlayedRef.current.has(audioKey)) {
      // Already played this audio, don't update progress
      console.log('🔇 Audio already played, skipping:', audioKey)
      return
    }
    
    console.log('🔊 New unique audio played:', audioKey, 'Total unique:', uniqueAudiosPlayedRef.current.size + 1)
    uniqueAudiosPlayedRef.current.add(audioKey)
    
    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
    const safeTimeSpent = Math.min(1000, totalTimeSpent)
    
    const progress = calculateProgress()
    
    // Set status to COMPLETED when progress reaches 100%, otherwise preserve existing status or set to IN_PROGRESS
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
    
    console.log('📊 Progress update:', {
      progress,
      status,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    })
    
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
  }

  // Initial setup: restore refs from stored progress and mark lesson as in progress
  useEffect(() => {
    if (refsInitializedRef.current) {
      return
    }

    const currentProgress = getLessonProgress(LESSON_ID)
    
    // Mark lesson as IN_PROGRESS if not already completed
    if (currentProgress?.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS')
    }
    
    // Restore refs from stored progress (only once)
    if (currentProgress) {
      const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig)
      startTimeRef.current = estimatedStartTime
      
      // Only restore baseAudioPlaysRef if progress is significant (>20%)
      if (currentProgress.progress > 20) {
        baseAudioPlaysRef.current = Math.min(estimatedAudioPlays, progressConfig.totalAudios)
      } else {
        baseAudioPlaysRef.current = 0
        console.log('🔄 Progress is low (<20%), resetting baseAudioPlaysRef to 0 for accurate tracking')
      }
      
      // Safety check: if baseAudioPlaysRef is already at or near totalAudios, reset it
      if (baseAudioPlaysRef.current >= progressConfig.totalAudios - 2) {
        console.warn('⚠️ baseAudioPlaysRef is too high, resetting to 0 to prevent progress jump')
        baseAudioPlaysRef.current = 0
      }
      
      // Check if progress is 100% but status is not COMPLETED
      if (currentProgress.progress >= 100 && currentProgress.status !== 'COMPLETED') {
        console.log('✅ Progress is 100% but status is not COMPLETED, updating status...')
        updateLessonProgress(LESSON_ID, currentProgress.progress, 'COMPLETED', undefined, currentProgress.timeSpent)
      }
    }
    
    refsInitializedRef.current = true
  }, [getLessonProgress, updateLessonProgress])

  // Periodic progress update based on time spent
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProgress = getLessonProgress(LESSON_ID)
      const progress = calculateProgress()
      
      // Only update if progress changed
      if (progress !== currentProgress.progress) {
        const baseTimeSpent = currentProgress?.timeSpent || 0
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60)
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes
        const safeTimeSpent = Math.min(1000, totalTimeSpent)
        
        const status = progress >= 100 ? 'COMPLETED' : (currentProgress?.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS')
        updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent)
      }
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [getLessonProgress, updateLessonProgress])

  // Recovery check: if all audios are played but progress is not 100%
  useEffect(() => {
    const currentProgress = getLessonProgress(LESSON_ID)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
    
    if (totalUniqueAudios >= progressConfig.totalAudios && currentProgress.progress < 100) {
      console.log('🔍 All audios played but progress is not 100%, forcing to 100%...')
      updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
    }
  }, [getLessonProgress, updateLessonProgress])

  // Check on page visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentProgress = getLessonProgress(LESSON_ID)
        const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size
        
        if (totalUniqueAudios >= progressConfig.totalAudios && currentProgress.progress < 100) {
          console.log('👁️ Page visible - fixing progress to 100% (all audios played)')
          updateLessonProgress(LESSON_ID, 100, 'COMPLETED', undefined, currentProgress.timeSpent)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [getLessonProgress, updateLessonProgress])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <PageContainer>
        <BackLink />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8 text-kurdish-red" />
            <h1 className="text-3xl md:text-4xl font-bold text-kurdish-red">
              Daily Conversations
            </h1>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-kurdish-red text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Conversations
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === category.id
                    ? 'bg-kurdish-red text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category Description */}
        {selectedCategoryInfo && selectedCategory !== 'all' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6 text-center"
          >
            <p className="text-gray-600">{selectedCategoryInfo.description}</p>
          </motion.div>
        )}

        {/* Conversations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                {conversation.icon}
                <h3 className="font-bold text-lg text-gray-800 whitespace-nowrap truncate">
                  {conversation.title}
                </h3>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Kurdish:</p>
                  <p className="font-bold text-kurdish-red text-lg">{conversation.kurdish}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 text-sm mb-1">English:</p>
                  <p className="font-medium text-gray-800">{conversation.english}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <AudioButton
                  kurdishText={conversation.kurdish}
                  phoneticText={conversation.pronunciation}
                  label="Listen"
                  size="small"
                  onPlay={(audioKey) => handleAudioPlay(audioKey || `conversation-${conversation.id}-${conversation.kurdish}`)}
                />
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  categories.find(cat => cat.id === conversation.category)?.color
                }`}>
                  {categories.find(cat => cat.id === conversation.category)?.name}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </PageContainer>

    </div>
  )
}
