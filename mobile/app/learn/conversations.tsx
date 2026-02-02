import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { Audio } from 'expo-av';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { restoreRefsFromProgress, getLearnedCount } from '../../lib/utils/progressHelper';

const { width } = Dimensions.get('window');

const LESSON_ID = '10'; // Daily Conversations lesson ID

// Helper function to sanitize Kurdish text for filename lookup
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

interface Conversation {
  id: string;
  category: string;
  title: string;
  english: string;
  kurdish: string;
  pronunciation: string;
  context: string;
  icon: string;
}

interface ConversationCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const categories: ConversationCategory[] = [
  {
    id: 'greetings',
    name: 'Greetings & Small Talk',
    description: 'Basic greetings and polite conversation',
    icon: '💬',
    color: '#10b981',
  },
  {
    id: 'shopping',
    name: 'Shopping & Market',
    description: 'Buying things and asking prices',
    icon: '🛒',
    color: '#3b82f6',
  },
  {
    id: 'food',
    name: 'Restaurant & Food',
    description: 'Ordering food and dining out',
    icon: '🍽️',
    color: '#f97316',
  },
  {
    id: 'directions',
    name: 'Directions & Location',
    description: 'Asking for and giving directions',
    icon: '📍',
    color: '#a855f7',
  },
  {
    id: 'emergency',
    name: 'Emergency & Help',
    description: 'Important phrases for emergencies',
    icon: '📞',
    color: '#ef4444',
  },
  {
    id: 'social',
    name: 'Social & Friends',
    description: 'Meeting people and making friends',
    icon: '❤️',
    color: '#ec4899',
  },
  {
    id: 'coffee',
    name: 'Coffee & Tea Time',
    description: 'Traditional Kurdish hospitality',
    icon: '☕',
    color: '#f59e0b',
  },
  {
    id: 'transport',
    name: 'Transportation',
    description: 'Getting around and travel',
    icon: '🚗',
    color: '#6366f1',
  },
  {
    id: 'phrases',
    name: 'Daily Phrases',
    description: 'Essential Kurdish phrases for everyday use',
    icon: '💬',
    color: '#14b8a6',
  },
];

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
    icon: '💬',
  },
  {
    id: 'greet2',
    category: 'greetings',
    title: 'Good Evening',
    english: 'Good evening! How was your day?',
    kurdish: 'Êvar baş! Rojê te çawa bû?',
    pronunciation: 'AY-var BASH! Ro-JEH te CHA-wa BOO?',
    context: 'Use this after 6 PM',
    icon: '💬',
  },
  {
    id: 'greet3',
    category: 'greetings',
    title: 'Nice to Meet You',
    english: 'Nice to meet you!',
    kurdish: 'Bi nasîna te ez kêfxweş bûm.',
    pronunciation: 'Bi na-SEE-na te ez KEF-khwe-shim boom.',
    context: 'When meeting someone for the first time',
    icon: '👥',
  },
  {
    id: 'greet4',
    category: 'greetings',
    title: 'How Are You?',
    english: 'How are you? I am fine, thank you.',
    kurdish: 'Tu çawa yî? Ez baş im, spas.',
    pronunciation: 'Tu CHA-wa YEE? Ez BASH im, spas.',
    context: 'Standard greeting response',
    icon: '❤️',
  },
  {
    id: 'greet5',
    category: 'greetings',
    title: 'Good Night',
    english: 'Good night! Sleep well.',
    kurdish: 'Şev baş! Baş razê.',
    pronunciation: 'Shev BASH! BASH ra-ZEH.',
    context: 'When saying goodbye at night',
    icon: '💬',
  },
  {
    id: 'greet6',
    category: 'greetings',
    title: 'Good Afternoon',
    english: 'Good afternoon! How is your day?',
    kurdish: 'Nîvro baş! Roja te çawa ye?',
    pronunciation: 'NEEV-ro BASH! Ro-JA te CHA-wa yeh?',
    context: 'Use this in the afternoon',
    icon: '💬',
  },
  {
    id: 'greet7',
    category: 'greetings',
    title: 'Have a Good Day',
    english: 'Have a good day!',
    kurdish: 'Roja te baş be!',
    pronunciation: 'Ro-JA te BASH beh!',
    context: 'When parting ways during the day',
    icon: '❤️',
  },
  {
    id: 'greet8',
    category: 'greetings',
    title: 'See You Later',
    english: 'See you later!',
    kurdish: 'Paşê dîtina hev!',
    pronunciation: 'Pa-SHEH dee-ti-NA hev!',
    context: 'When you plan to meet again',
    icon: '👥',
  },
  {
    id: 'greet9',
    category: 'greetings',
    title: 'Take Care',
    english: 'Take care of yourself!',
    kurdish: 'Xwe baş parêze!',
    pronunciation: 'Khweh BASH pa-REH-zeh!',
    context: 'A caring way to say goodbye',
    icon: '❤️',
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
    icon: '🛒',
  },
  {
    id: 'shop2',
    category: 'shopping',
    title: 'Too Expensive',
    english: 'This is too expensive. Can you reduce the price?',
    kurdish: 'Ev pir biha ye. Tu dikarî bihayê kêm bikî?',
    pronunciation: 'Ev peer bi-HA yeh. Tu di-ka-REE bi-ha-YEH kem bi-KEE?',
    context: 'Bargaining at markets',
    icon: '🛒',
  },
  {
    id: 'shop3',
    category: 'shopping',
    title: 'I Will Take It',
    english: 'I will take this one.',
    kurdish: 'Ez ê vê bigirim.',
    pronunciation: 'Ez AY veh bi-GEE-rim.',
    context: 'When you decide to buy something',
    icon: '🛒',
  },
  {
    id: 'shop4',
    category: 'shopping',
    title: 'Do You Have...?',
    english: 'Do you have bread?',
    kurdish: 'Nan heye?',
    pronunciation: 'Nan HE-ye?',
    context: 'Asking if something is available',
    icon: '🛒',
  },
  {
    id: 'shop5',
    category: 'shopping',
    title: 'Where Can I Buy...?',
    english: 'Where can I buy fruits?',
    kurdish: 'Ez fêkiyan ji ku bikirim?',
    pronunciation: 'Ez feh-KEE-yan zhee koo bi-KEE-rim?',
    context: 'Asking for directions to shops',
    icon: '🛒',
  },
  {
    id: 'shop6',
    category: 'shopping',
    title: 'Is This Fresh?',
    english: 'Is this fresh?',
    kurdish: 'Ev taze ye?',
    pronunciation: 'Ev ta-ZEH yeh?',
    context: 'Asking about food quality',
    icon: '🛒',
  },
  {
    id: 'shop7',
    category: 'shopping',
    title: 'How much is this?',
    english: 'How much is this?',
    kurdish: 'Ev çiqas e?',
    pronunciation: 'Ev CHEE-kas eh?',
    context: 'Asking about the price of an item',
    icon: '🛒',
  },
  {
    id: 'shop8',
    category: 'shopping',
    title: 'Do You Accept Cards?',
    english: 'Do you accept credit cards?',
    kurdish: 'Tu kartên kredî qebûl dikî?',
    pronunciation: 'Tu kar-TEN ke-re-DEE ka-BOOL di-KEE?',
    context: 'Asking about payment methods',
    icon: '🛒',
  },
  {
    id: 'shop9',
    category: 'shopping',
    title: 'Thank You',
    english: 'Thank you for your help.',
    kurdish: 'Spas ji bo alîkariya te.',
    pronunciation: 'Spas zhee bo a-lee-ka-ri-YA te.',
    context: 'Thanking shopkeepers',
    icon: '🛒',
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
    icon: '🍽️',
  },
  {
    id: 'food2',
    category: 'food',
    title: 'What Do You Recommend?',
    english: 'What do you recommend?',
    kurdish: 'Tu çi pêşniyar dikî?',
    pronunciation: 'Tu CHEE pesh-ni-YAR di-KEE?',
    context: 'Asking for food recommendations',
    icon: '🍽️',
  },
  {
    id: 'food3',
    category: 'food',
    title: 'The Bill Please',
    english: 'The bill, please.',
    kurdish: 'Hesab, ji kerema xwe.',
    pronunciation: 'He-SAB, zhee ke-re-MA khwe.',
    context: 'When you want to pay',
    icon: '🍽️',
  },
  {
    id: 'food4',
    category: 'food',
    title: 'It Was Delicious',
    english: 'It was delicious!',
    kurdish: 'Xweş bû!',
    pronunciation: 'Khwesh BOO!',
    context: 'Complimenting the food',
    icon: '🍽️',
  },
  {
    id: 'food5',
    category: 'food',
    title: 'I Am Hungry',
    english: 'I am hungry. What do you have?',
    kurdish: 'Ez birçî me. Çi te heye?',
    pronunciation: 'Ez beer-CHEE meh. CHEE te he-YEH?',
    context: 'When you are ready to order',
    icon: '🍽️',
  },
  {
    id: 'food6',
    category: 'food',
    title: 'Is It Spicy?',
    english: 'Is this food spicy?',
    kurdish: 'Ev xwarin tûj e?',
    pronunciation: 'Ev khwa-RIN tooj eh?',
    context: 'Asking about food heat level',
    icon: '🍽️',
  },
  {
    id: 'food7',
    category: 'food',
    title: 'I Am Allergic',
    english: 'I am allergic to mushroom.',
    kurdish: 'Ez ji kivarkan re alerjîk im.',
    pronunciation: 'Ez zhee ki-var-kan re a-ler-JEEK im.',
    context: 'Informing about food allergies',
    icon: '🍽️',
  },
  {
    id: 'food8',
    category: 'food',
    title: 'More Water Please',
    english: 'More water, please.',
    kurdish: 'Zêdetir av, ji kerema xwe.',
    pronunciation: 'Zeh-de-TIR av, zhee ke-re-MA khwe.',
    context: 'Asking for more drinks',
    icon: '🍽️',
  },
  {
    id: 'food9',
    category: 'food',
    title: 'Can I Have the Menu?',
    english: 'Can I have the menu, please?',
    kurdish: 'Ez dikarim menuyê bibînim?',
    pronunciation: 'Ez di-ka-RIM me-nu-YEH bi-BEE-nim?',
    context: 'Requesting the restaurant menu',
    icon: '🍽️',
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
    icon: '📍',
  },
  {
    id: 'dir2',
    category: 'directions',
    title: 'Go Straight',
    english: 'Go straight ahead.',
    kurdish: 'Rast biçe.',
    pronunciation: 'Rast bi-CHE.',
    context: 'Giving simple directions',
    icon: '📍',
  },
  {
    id: 'dir3',
    category: 'directions',
    title: 'Turn Left/Right',
    english: 'Turn left at the corner.',
    kurdish: 'Li quncikê çep bizivire.',
    pronunciation: 'Li kun-CHEE-keh chep bi-zee-VEE-re.',
    context: 'Giving turning directions',
    icon: '📍',
  },
  {
    id: 'dir4',
    category: 'directions',
    title: 'I Am Lost',
    english: 'I am lost. Can you help me?',
    kurdish: 'Ez winda bûme. Tu dikarî alîkariya min bikî?',
    pronunciation: 'Ez win-DA boo-meh. Tu di-ka-REE a-lee-ka-ri-YA min bi-KEE?',
    context: 'When you need help finding your way',
    icon: '📍',
  },
  {
    id: 'dir5',
    category: 'directions',
    title: 'How Far Is It?',
    english: 'How far is the market?',
    kurdish: 'Bazar çiqas dûr e?',
    pronunciation: 'Ba-ZAR CHEE-kas door eh?',
    context: 'Asking about distance',
    icon: '📍',
  },
  {
    id: 'dir6',
    category: 'directions',
    title: 'Is It Near Here?',
    english: 'Is it near here?',
    kurdish: 'Ew nêzîkî vir e?',
    pronunciation: 'Ew neh-ZEE-kee vir eh?',
    context: 'Checking if destination is close',
    icon: '📍',
  },
  {
    id: 'dir7',
    category: 'directions',
    title: 'Can You Show Me?',
    english: 'Can you show me on the map?',
    kurdish: 'Tu dikarî li ser nexşeyê nîşanî min bidî?',
    pronunciation: 'Tu di-ka-REE li ser nekh-SHE-YEH nee-sha-NEE min bi-DEE?',
    context: 'Asking for map assistance',
    icon: '📍',
  },
  {
    id: 'dir8',
    category: 'directions',
    title: 'Which Bus Goes There?',
    english: 'Which bus goes to the city center?',
    kurdish: 'Kîjan otobûs diçe navenda bajêr?',
    pronunciation: 'Kee-JAN o-to-BOOS di-CHE na-VEN-da ba-JERH?',
    context: 'Asking about public transportation',
    icon: '📍',
  },
  {
    id: 'dir9',
    category: 'directions',
    title: 'Walk for 5 Minutes',
    english: 'Walk straight for 5 minutes.',
    kurdish: 'Ji bo pênc deqîqeyan rast biçe.',
    pronunciation: 'Zhee bo PENCH de-kee-ke-YAN rast bi-CHE.',
    context: 'Giving walking directions',
    icon: '📍',
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
    icon: '📞',
  },
  {
    id: 'emerg2',
    category: 'emergency',
    title: 'Call the Police',
    english: 'Call the police!',
    kurdish: 'Polîsê bang bike!',
    pronunciation: 'Po-LEE-seh bang bi-KEH!',
    context: 'In emergency situations',
    icon: '📞',
  },
  {
    id: 'emerg3',
    category: 'emergency',
    title: 'I Need a Doctor',
    english: 'I need a doctor.',
    kurdish: 'Ez pêdiviya doktor heye.',
    pronunciation: 'Ez peh-di-VI-ya dok-TOR he-YEH.',
    context: 'When you need medical help',
    icon: '📞',
  },
  {
    id: 'emerg4',
    category: 'emergency',
    title: 'Where Is the Bathroom?',
    english: 'Where is the bathroom?',
    kurdish: 'Tualet li ku ye?',
    pronunciation: 'Too-a-LET li koo yeh?',
    context: 'Essential question when you need to go',
    icon: '📞',
  },
  {
    id: 'emerg5',
    category: 'emergency',
    title: 'I Lost My Wallet',
    english: 'I lost my wallet.',
    kurdish: 'Ez cizdana xwe winda kirim.',
    pronunciation: 'Ez ciz-da-NA khwe win-DA ki-rim.',
    context: 'Reporting lost items',
    icon: '📞',
  },
  {
    id: 'emerg6',
    category: 'emergency',
    title: 'Call an Ambulance',
    english: 'Call an ambulance!',
    kurdish: 'Ambulansê bang bike!',
    pronunciation: 'Am-boo-LAN-seh bang bi-KEH!',
    context: 'Medical emergency',
    icon: '📞',
  },
  {
    id: 'emerg7',
    category: 'emergency',
    title: 'Fire!',
    english: 'Fire!',
    kurdish: 'Agir!',
    pronunciation: 'A-GIR!',
    context: 'Fire emergency',
    icon: '📞',
  },
  {
    id: 'emerg8',
    category: 'emergency',
    title: 'I Need Help',
    english: 'I need help immediately.',
    kurdish: 'Ez pêdiviya alîkariyê heye.',
    pronunciation: 'Ez peh-di-VI-ya a-lee-ka-ri-YEH he-YEH.',
    context: 'General help request',
    icon: '📞',
  },
  {
    id: 'emerg9',
    category: 'emergency',
    title: 'Where Is the Hospital?',
    english: 'Where is the nearest hospital?',
    kurdish: 'Nexweşxaneya herî nêzik li ku ye?',
    pronunciation: 'Nekh-wesh-kha-NE-ya he-REE neh-ZEEK li koo yeh?',
    context: 'Looking for medical facilities',
    icon: '📞',
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
    icon: '👥',
  },
  {
    id: 'social2',
    category: 'social',
    title: 'Where Are You From?',
    english: 'Where are you from?',
    kurdish: 'Tu ji ku yî?',
    pronunciation: 'Tu zhee koo YEE?',
    context: 'Getting to know someone',
    icon: '👥',
  },
  {
    id: 'social3',
    category: 'social',
    title: 'Do You Speak English?',
    english: 'Do you speak English?',
    kurdish: 'Tu înglîzî dizanî?',
    pronunciation: 'Tu ing-LEE-zee di-za-NEE?',
    context: 'When you need to communicate',
    icon: '👥',
  },
  {
    id: 'social4',
    category: 'social',
    title: 'See You Later',
    english: 'See you later!',
    kurdish: 'Paşê dîtina hev!',
    pronunciation: 'Pa-SHEH dee-ti-NA hev!',
    context: 'Friendly goodbye',
    icon: '❤️',
  },
  {
    id: 'social5',
    category: 'social',
    title: 'How Old Are You?',
    english: 'How old are you?',
    kurdish: 'Tu çend salî yî?',
    pronunciation: 'Tu CHEND sa-LEE YEE?',
    context: 'Getting to know someone',
    icon: '👥',
  },
  {
    id: 'social6',
    category: 'social',
    title: 'What Do You Do?',
    english: 'What do you do for work?',
    kurdish: 'Tu çi kar dikî?',
    pronunciation: 'Tu CHEE kar di-KEE?',
    context: 'Asking about profession',
    icon: '👥',
  },
  {
    id: 'social7',
    category: 'social',
    title: 'Nice to Meet You',
    english: 'Nice to meet you!',
    kurdish: 'Bi nasîna te ez kêfxweş bûm.',
    pronunciation: 'Bi na-SEE-na te ez KEF-khwe-shim boom.',
    context: 'When meeting someone new',
    icon: '❤️',
  },
  {
    id: 'social8',
    category: 'social',
    title: 'Do You Have Children?',
    english: 'Do you have children?',
    kurdish: 'Zarokên te hene?',
    pronunciation: 'Za-ro-KEN te he-NEH?',
    context: 'Family conversation',
    icon: '👥',
  },
  {
    id: 'social9',
    category: 'social',
    title: 'Let\'s Be Friends',
    english: 'Let\'s be friends!',
    kurdish: 'Em bibin heval!',
    pronunciation: 'Em bi-BIN he-VAL!',
    context: 'Making new friends',
    icon: '❤️',
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
    icon: '☕',
  },
  {
    id: 'coffee2',
    category: 'coffee',
    title: 'Yes Please',
    english: 'Yes, please. Thank you.',
    kurdish: 'Erê, ji kerema xwe. Spas.',
    pronunciation: 'E-REH, zhee ke-re-MA khwe. Spas.',
    context: 'Accepting hospitality',
    icon: '☕',
  },
  {
    id: 'coffee3',
    category: 'coffee',
    title: 'It Is Very Good',
    english: 'The coffee is very good!',
    kurdish: 'Qehwe pir xweş e!',
    pronunciation: 'Ka-WEH peer khwesh eh!',
    context: 'Complimenting the coffee',
    icon: '☕',
  },
  {
    id: 'coffee4',
    category: 'coffee',
    title: 'No Sugar Please',
    english: 'No sugar, please.',
    kurdish: 'Bê şekir, ji kerema xwe.',
    pronunciation: 'Beh she-KIR, zhee ke-re-MA khwe.',
    context: 'Preference for coffee',
    icon: '☕',
  },
  {
    id: 'coffee5',
    category: 'coffee',
    title: 'More Coffee Please',
    english: 'More coffee, please.',
    kurdish: 'Zêdetir qehwe, ji kerema xwe.',
    pronunciation: 'Zeh-de-TIR ka-WEH, zhee ke-re-MA khwe.',
    context: 'Asking for refill',
    icon: '☕',
  },
  {
    id: 'coffee6',
    category: 'coffee',
    title: 'Black Coffee',
    english: 'Black coffee, please.',
    kurdish: 'Qehweya reş, ji kerema xwe.',
    pronunciation: 'Ka-WEH-ya resh, zhee ke-re-MA khwe.',
    context: 'Ordering specific type',
    icon: '☕',
  },
  {
    id: 'coffee7',
    category: 'coffee',
    title: 'Green Tea',
    english: 'Green tea, please.',
    kurdish: 'Çayê kesk, ji kerema xwe.',
    pronunciation: 'Cha-YEH kesk, zhee ke-re-MA khwe.',
    context: 'Alternative to coffee',
    icon: '☕',
  },
  {
    id: 'coffee8',
    category: 'coffee',
    title: 'Too Hot',
    english: 'It\'s too hot.',
    kurdish: 'Pir germ e.',
    pronunciation: 'Peer germ eh.',
    context: 'Temperature preference',
    icon: '☕',
  },
  {
    id: 'coffee9',
    category: 'coffee',
    title: 'Perfect Temperature',
    english: 'Perfect temperature!',
    kurdish: 'Germahiya biqas e!',
    pronunciation: 'Ger-ma-hee-YA bi-KAS eh!',
    context: 'Complimenting the drink',
    icon: '☕',
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
    icon: '🚗',
  },
  {
    id: 'trans2',
    category: 'transport',
    title: 'How Much to the City?',
    english: 'How much is it to the city center?',
    kurdish: 'Ji bo navenda bajêr çend e?',
    pronunciation: 'Zhee bo na-VEN-da ba-JERH CHEND eh?',
    context: 'Asking about taxi or bus fare',
    icon: '🚗',
  },
  {
    id: 'trans3',
    category: 'transport',
    title: 'Stop Here Please',
    english: 'Stop here, please.',
    kurdish: 'Li vir rawestîne, ji kerema xwe.',
    pronunciation: 'Li veer ra-wes-TEE-neh, zhee ke-re-MA khwe.',
    context: 'Telling driver where to stop',
    icon: '🚗',
  },
  {
    id: 'trans4',
    category: 'transport',
    title: 'Taxi Please',
    english: 'I need a taxi.',
    kurdish: 'Ez pêdiviya taksî heye.',
    pronunciation: 'Ez peh-di-VI-ya tak-SEE he-YEH.',
    context: 'Calling for taxi',
    icon: '🚗',
  },
  {
    id: 'trans5',
    category: 'transport',
    title: 'Airport Please',
    english: 'Take me to the airport.',
    kurdish: 'Min berde balafirgehê.',
    pronunciation: 'Min ber-DEH ba-la-fir-GEH-eh.',
    context: 'Going to airport',
    icon: '🚗',
  },
  {
    id: 'trans6',
    category: 'transport',
    title: 'Train Station',
    english: 'Where is the train station?',
    kurdish: 'Stasyona trenê li ku ye?',
    pronunciation: 'Sta-syo-NA tre-NEH li koo yeh?',
    context: 'Looking for train station',
    icon: '🚗',
  },
  {
    id: 'trans7',
    category: 'transport',
    title: 'When Does It Leave?',
    english: 'When does the bus leave?',
    kurdish: 'Otobûs kengê diçe?',
    pronunciation: 'O-to-BOOS ken-GEH di-CHE?',
    context: 'Checking departure times',
    icon: '🚗',
  },
  {
    id: 'trans8',
    category: 'transport',
    title: 'How Long Does It Take?',
    english: 'How long does it take?',
    kurdish: 'Çend dem dixwaze?',
    pronunciation: 'CHEND dem dikh-WA-zeh?',
    context: 'Asking about travel time',
    icon: '🚗',
  },
  {
    id: 'trans9',
    category: 'transport',
    title: 'Drive Slowly',
    english: 'Please drive slowly.',
    kurdish: 'Ji kerema xwe, hêdî bajo.',
    pronunciation: 'Zhee ke-re-MA khwe, heh-DEE ba-JO.',
    context: 'Requesting careful driving',
    icon: '🚗',
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
    icon: '💬',
  },
  {
    id: 'phrase2',
    category: 'phrases',
    title: 'I Don\'t Understand',
    english: 'I don\'t understand.',
    kurdish: 'Ez fêm nakim.',
    pronunciation: 'Ez FEHM na-KIM.',
    context: 'When you need clarification',
    icon: '💬',
  },
  {
    id: 'phrase3',
    category: 'phrases',
    title: 'Please Repeat',
    english: 'Please repeat that.',
    kurdish: 'Ji kerema xwe, dîsa bêje.',
    pronunciation: 'Zhee ke-re-MA khwe, DEE-sa BEH-jeh.',
    context: 'When you need someone to say it again',
    icon: '💬',
  },
  {
    id: 'phrase4',
    category: 'phrases',
    title: 'Speak Slowly',
    english: 'Please speak slowly.',
    kurdish: 'Ji kerema xwe, hêdî biaxive.',
    pronunciation: 'Zhee ke-re-MA khwe, heh-DEE bee-ah-khee-VEH.',
    context: 'When someone speaks too fast',
    icon: '💬',
  },
  {
    id: 'phrase5',
    category: 'phrases',
    title: 'What Does This Mean?',
    english: 'What does this mean?',
    kurdish: 'Ev çi wate dike?',
    pronunciation: 'Ev CHEE wa-TEH di-KEH?',
    context: 'Asking for word or phrase meaning',
    icon: '💬',
  },
  {
    id: 'phrase6',
    category: 'phrases',
    title: 'How Do You Say...?',
    english: 'How do you say "hello" in Kurdish?',
    kurdish: 'Tu "hello" bi kurdî çawa dibêjî?',
    pronunciation: 'Tu "hello" bi koor-DEE CHA-wa di-BEH-jee?',
    context: 'Learning new words',
    icon: '💬',
  },
  {
    id: 'phrase7',
    category: 'phrases',
    title: 'Is This Correct?',
    english: 'Is this correct?',
    kurdish: 'Ev rast e?',
    pronunciation: 'Ev rast eh?',
    context: 'Checking if you said something right',
    icon: '💬',
  },
  {
    id: 'phrase8',
    category: 'phrases',
    title: 'I Need Help',
    english: 'I need help with Kurdish.',
    kurdish: 'Ez pêdiviya alîkariyê heye ji bo kurdî.',
    pronunciation: 'Ez peh-di-VI-ya a-lee-ka-ri-YEH he-YEH zhee bo koor-DEE.',
    context: 'Asking for language help',
    icon: '💬',
  },
  {
    id: 'phrase9',
    category: 'phrases',
    title: 'Can You Help Me?',
    english: 'Can you help me practice?',
    kurdish: 'Tu dikarî alîkariya min bikî ji bo pratîkê?',
    pronunciation: 'Tu di-ka-REE a-lee-ka-ri-YA min bi-KEE zhee bo pra-TEEK-eh?',
    context: 'Asking someone to practice with you',
    icon: '💬',
  },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'rojbas-tu-cawa-yi': require('../../assets/audio/conversations/rojbas-tu-cawa-yi.mp3'),
  'evar-bas-roje-te-cawa-bu': require('../../assets/audio/conversations/evar-bas-roja-te-cawa-bu.mp3'),
  'bi-nasina-te-ez-kefxwes-bum': require('../../assets/audio/conversations/bi-nasina-te-ez-kefxwes-bum.mp3'),
  'tu-cawa-yi-ez-bas-im-spas': require('../../assets/audio/conversations/tu-cawa-yi-ez-bas-im-spas.mp3'),
  'sev-bas-bas-raze': require('../../assets/audio/conversations/sev-bas-bas-raze.mp3'),
  'nivro-bas-roja-te-cawa-ye': require('../../assets/audio/conversations/nivro-bas-roja-te-cawa-ye.mp3'),
  'roja-te-bas-be': require('../../assets/audio/conversations/roja-te-bas-be.mp3'),
  'pase-ditina-hev': require('../../assets/audio/conversations/pase-ditina-hev.mp3'),
  'xwe-bas-pareze': require('../../assets/audio/conversations/xwe-bas-pareze.mp3'),
  'ev-cend-e': require('../../assets/audio/conversations/ev-cend-e.mp3'),
  'ev-pir-biha-ye-tu-dikari-bihaye-kem-biki': require('../../assets/audio/conversations/ev-pir-biha-ye-tu-dikari-bihaye-kem-biki.mp3'),
  'ez-e-ve-bigirim': require('../../assets/audio/conversations/ez-e-ve-bigirim.mp3'),
  'nan-heye': require('../../assets/audio/conversations/nan-heye.mp3'),
  'ez-fekiyan-ji-ku-bikirim': require('../../assets/audio/conversations/ez-fekiyan-ji-ku-bikirim.mp3'),
  'ev-taze-ye': require('../../assets/audio/conversations/ev-taze-ye.mp3'),
  'ev-ciqas-e': require('../../assets/audio/conversations/ev-ciqas-e.mp3'),
  'tu-karten-kredi-qebul-diki': require('../../assets/audio/conversations/tu-karten-kredi-qebul-diki.mp3'),
  'spas-ji-bo-alikariya-te': require('../../assets/audio/conversations/spas-ji-bo-alikariya-te.mp3'),
  'masek-ji-bo-du-kesan-ji-kerema-xwe': require('../../assets/audio/conversations/masek-ji-bo-du-kesan-ji-kerema-xwe.mp3'),
  'tu-ci-pesniyar-diki': require('../../assets/audio/conversations/tu-ci-pesniyar-diki.mp3'),
  'hesab-ji-kerema-xwe': require('../../assets/audio/conversations/hesab-ji-kerema-xwe.mp3'),
  'xwes-bu': require('../../assets/audio/conversations/xwes-bu.mp3'),
  'ez-birci-me-ci-te-heye': require('../../assets/audio/conversations/ez-birci-me-ci-te-heye.mp3'),
  'ev-xwarin-tuj-e': require('../../assets/audio/conversations/ev-xwarin-tuj-e.mp3'),
  'ez-ji-kivarkan-re-alerjik-im': require('../../assets/audio/conversations/ez-ji-kivarkan-re-alerjik-im.mp3'),
  'zedetir-av-ji-kerema-xwe': require('../../assets/audio/conversations/zedetir-av-ji-kerema-xwe.mp3'),
  'ez-dikarim-menuye-bibinim': require('../../assets/audio/conversations/ez-dikarim-menuye-bibinim.mp3'),
  'nexwesxane-li-ku-ye': require('../../assets/audio/conversations/nexwesxane-li-ku-ye.mp3'),
  'rast-bice': require('../../assets/audio/conversations/rast-bice.mp3'),
  'li-quncike-cep-bizivire': require('../../assets/audio/conversations/li-quncike-cep-bizivire.mp3'),
  'ez-winda-bume-tu-dikari-alikariya-min-biki': require('../../assets/audio/conversations/ez-winda-bume-tu-dikari-alikariya-min-biki.mp3'),
  'bazar-ciqas-dur-e': require('../../assets/audio/conversations/bazar-ciqas-dur-e.mp3'),
  'ew-neziki-vir-e': require('../../assets/audio/conversations/ew-neziki-vir-e.mp3'),
  'tu-dikari-li-ser-nexseye-nisani-min-bidi': require('../../assets/audio/conversations/tu-dikari-li-ser-nexseye-nisani-min-bidi.mp3'),
  'kijan-otobus-dice-navenda-bajer': require('../../assets/audio/conversations/kijan-otobus-dice-navenda-bajer.mp3'),
  'ji-bo-penc-deqiqeyan-rast-bice': require('../../assets/audio/conversations/ji-bo-penc-deqiqeyan-rast-bice.mp3'),
  'alikariya-min-bike': require('../../assets/audio/conversations/alikariya-min-bike.mp3'),
  'polise-bang-bike': require('../../assets/audio/conversations/polise-bang-bike.mp3'),
  'ez-pediviya-doktor-heye': require('../../assets/audio/conversations/ez-pediviya-doktor-heye.mp3'),
  'tualet-li-ku-ye': require('../../assets/audio/conversations/tualet-li-ku-ye.mp3'),
  'ez-cizdana-xwe-winda-kirim': require('../../assets/audio/conversations/ez-cizdana-xwe-winda-kirim.mp3'),
  'ambulanse-bang-bike': require('../../assets/audio/conversations/ambulanse-bang-bike.mp3'),
  'agir': require('../../assets/audio/conversations/agir.mp3'),
  'ez-pediviya-alikariye-heye': require('../../assets/audio/conversations/ez-pediviya-alikariye-heye.mp3'),
  'nexwesxaneya-heri-nezik-li-ku-ye': require('../../assets/audio/conversations/nexwesxaneya-heri-nezik-li-ku-ye.mp3'),
  'nave-te-ci-ye': require('../../assets/audio/conversations/nave-te-ci-ye.mp3'),
  'tu-ji-ku-yi': require('../../assets/audio/conversations/tu-ji-ku-yi.mp3'),
  'tu-inglizi-dizani': require('../../assets/audio/conversations/tu-inglizi-dizani.mp3'),
  'tu-cend-sali-yi': require('../../assets/audio/conversations/tu-cend-sali-yi.mp3'),
  'tu-ci-kar-diki': require('../../assets/audio/conversations/tu-ci-kar-diki.mp3'),
  'zaroken-te-hene': require('../../assets/audio/conversations/zaroken-te-hene.mp3'),
  'em-bibin-heval': require('../../assets/audio/conversations/em-bibin-heval.mp3'),
  'tu-qehwe-dixwazi-an-caye': require('../../assets/audio/conversations/tu-qehwe-dixwazi-an-caye.mp3'),
  'ere-ji-kerema-xwe-spas': require('../../assets/audio/conversations/ere-ji-kerema-xwe-spas.mp3'),
  'qehwe-pir-xwes-e': require('../../assets/audio/conversations/qehwe-pir-xwes-e.mp3'),
  'be-sekir-ji-kerema-xwe': require('../../assets/audio/conversations/be-sekir-ji-kerema-xwe.mp3'),
  'zedetir-qehwe-ji-kerema-xwe': require('../../assets/audio/conversations/zedetir-qehwe-ji-kerema-xwe.mp3'),
  'qehweya-res-ji-kerema-xwe': require('../../assets/audio/conversations/qehweya-res-ji-kerema-xwe.mp3'),
  'caye-kesk-ji-kerema-xwe': require('../../assets/audio/conversations/caye-kesk-ji-kerema-xwe.mp3'),
  'pir-germ-e': require('../../assets/audio/conversations/pir-germ-e.mp3'),
  'germahiya-biqas-e': require('../../assets/audio/conversations/germahiya-biqas-e.mp3'),
  'rawestgeha-otobuse-li-ku-ye': require('../../assets/audio/conversations/rawestgeha-otobuse-li-ku-ye.mp3'),
  'ji-bo-navenda-bajer-cend-e': require('../../assets/audio/conversations/ji-bo-navenda-bajer-cend-e.mp3'),
  'li-vir-rawestine-ji-kerema-xwe': require('../../assets/audio/conversations/li-vir-rawestine-ji-kerema-xwe.mp3'),
  'ez-pediviya-taksi-heye': require('../../assets/audio/conversations/ez-pediviya-taksi-heye.mp3'),
  'min-berde-balafirgehe': require('../../assets/audio/conversations/min-berde-balafirgehe.mp3'),
  'stasyona-trene-li-ku-ye': require('../../assets/audio/conversations/stasyona-trene-li-ku-ye.mp3'),
  'otobus-kenge-dice': require('../../assets/audio/conversations/otobus-kenge-dice.mp3'),
  'cend-dem-dixwaze': require('../../assets/audio/conversations/cend-dem-dixwaze.mp3'),
  'ji-kerema-xwe-hedi-bajo': require('../../assets/audio/conversations/ji-kerema-xwe-hedi-bajo.mp3'),
  'ez-kurdi-fer-dibim': require('../../assets/audio/conversations/ez-kurdi-fer-dibim.mp3'),
  'ez-fem-nakim': require('../../assets/audio/conversations/ez-fem-nakim.mp3'),
  'ji-kerema-xwe-disa-beje': require('../../assets/audio/conversations/ji-kerema-xwe-disa-beje.mp3'),
  'ji-kerema-xwe-hedi-biaxive': require('../../assets/audio/conversations/ji-kerema-xwe-hedi-biaxive.mp3'),
  'ev-ci-wate-dike': require('../../assets/audio/conversations/ev-ci-wate-dike.mp3'),
  'tu-hello-bi-kurdi-cawa-dibeji': require('../../assets/audio/conversations/tu-hello-bi-kurdi-cawa-dibeji.mp3'),
  'ev-rast-e': require('../../assets/audio/conversations/ev-rast-e.mp3'),
  'ez-pediviya-alikariye-heye-ji-bo-kurdi': require('../../assets/audio/conversations/ez-pediviya-alikariye-heye-ji-bo-kurdi.mp3'),
  'tu-dikari-alikariya-min-biki-ji-bo-pratike': require('../../assets/audio/conversations/tu-dikari-alikariya-min-biki-ji-bo-pratike.mp3'),
};

// Conversation Card Component (Memoized)
const ConversationCard = React.memo(({
  conversation,
  categoryInfo,
  isPlaying,
  isExpanded,
  onPress,
  onAudioPress,
}: {
  conversation: Conversation;
  categoryInfo: ConversationCategory | undefined;
  isPlaying: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onAudioPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationCard,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardContent}>
        {/* Header: Title + Category + Audio */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle}>{conversation.title}</Text>
            {categoryInfo && (
              <View style={[styles.categoryPill, { backgroundColor: categoryInfo.color + '15' }]}>
                <Text style={[styles.categoryPillText, { color: categoryInfo.color }]}>
                  {categoryInfo.name}
                </Text>
              </View>
            )}
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onAudioPress();
            }}
            style={({ pressed }) => [
              styles.audioButtonCircle,
              pressed && styles.audioButtonPressed,
              isPlaying && styles.audioButtonPlaying,
            ]}
          >
            <Ionicons
              name={isPlaying ? "volume-high" : "play-outline"}
              size={24}
              color={isPlaying ? "#ffffff" : "#3A86FF"}
            />
          </Pressable>
        </View>

        {/* Collapsed Content */}
        <View style={styles.cardBody}>
          <Text style={styles.cardEnglish} numberOfLines={1}>
            {conversation.english}
          </Text>
          <Text style={styles.cardKurdish} numberOfLines={1}>
            {conversation.kurdish}
          </Text>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.cardExpanded}>
            <Text style={styles.cardPronunciation}>
              {conversation.pronunciation}
            </Text>
            <Text style={styles.cardContext}>
              {conversation.context}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

ConversationCard.displayName = 'ConversationCard';

export default function DailyConversationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const [playedKeysSnapshot, setPlayedKeysSnapshot] = useState<string[]>(() => getLessonProgress(LESSON_ID).playedAudioKeys || []);

  const getProgressConfig = () => {
    const totalAudios = conversations.length;
    return {
      totalAudios,
      hasPractice: false,
      audioWeight: 50,
      timeWeight: 50,
      audioMultiplier: totalAudios > 0 ? 50 / totalAudios : 0,
      timeMultiplier: 10,
    };
  };

  const storedProgress = getLessonProgress(LESSON_ID);
  const progressConfig = getProgressConfig();
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set((storedProgress.playedAudioKeys || []) as string[]));
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);

  // Initialize audio mode
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Mark lesson as in progress on mount and restore refs
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
      return;
    }

    const progress = getLessonProgress(LESSON_ID);
    console.log('🚀 Conversations page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      timeSpent: progress.timeSpent,
    });
    
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
    
    const currentProgress = getLessonProgress(LESSON_ID);
    const currentConfig = getProgressConfig();
    const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, currentConfig);
    startTimeRef.current = estimatedStartTime;
    baseAudioPlaysRef.current = estimatedAudioPlays;
    if (currentProgress.playedAudioKeys?.length) {
      uniqueAudiosPlayedRef.current = new Set(currentProgress.playedAudioKeys);
      setPlayedKeysSnapshot(currentProgress.playedAudioKeys);
    }
  }, [isAuthenticated]);

  const playAudio = async (conversationId: string, kurdishText: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const audioFilename = getAudioFilename(kurdishText);
      const audioAsset = audioAssets[audioFilename];

      if (!audioAsset) {
        console.warn(`Audio file not found: ${audioFilename}. Audio files will be generated/copied later.`);
        return;
      }

      setPlayingAudio(conversationId);
      const { sound: newSound } = await Audio.Sound.createAsync(audioAsset, { shouldPlay: true });
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          newSound.unloadAsync();
        }
      });

      if (!uniqueAudiosPlayedRef.current.has(conversationId)) {
        uniqueAudiosPlayedRef.current.add(conversationId);
        setPlayedKeysSnapshot(Array.from(uniqueAudiosPlayedRef.current));
        handleAudioPlay();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const safeTimeSpent = Math.min(1000, baseTimeSpent + sessionTimeMinutes);
    const progress = calculateProgress();
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS');
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  const calculateProgress = () => {
    const totalAudios = conversations.length;
    const currentUniqueAudios = uniqueAudiosPlayedRef.current.size;
    if (totalAudios > 0 && currentUniqueAudios >= totalAudios) return 100;
    const audioProgress = totalAudios > 0 ? Math.min(50, (currentUniqueAudios / totalAudios) * 50) : 0;
    const currentProgress = getLessonProgress(LESSON_ID);
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const timeProgress = Math.min(50, (baseTimeSpent + sessionTimeMinutes) * 10);
    return Math.min(100, audioProgress + timeProgress);
  };

  const filteredConversations = useMemo(() => {
    return selectedCategory === 'all'
      ? conversations
      : conversations.filter(conv => conv.category === selectedCategory);
  }, [selectedCategory]);

  const selectedCategoryInfo = useMemo(() => {
    return categories.find(cat => cat.id === selectedCategory);
  }, [selectedCategory]);

  const progress = getLessonProgress(LESSON_ID);
  const totalConversations = conversations.length;
  const learnedCount = Math.min(totalConversations, uniqueAudiosPlayedRef.current.size);

  // Category chips data with "All" first
  const categoryChips = useMemo(() => {
    return [{ id: 'all', name: 'All', icon: null as string | null }, ...categories];
  }, []);

  // Toggle card expansion
  const toggleCardExpansion = useCallback((conversationId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  }, []);

  // Render conversation card
  const renderConversationCard = useCallback(({ item }: { item: Conversation }) => {
    const categoryInfo = categories.find(cat => cat.id === item.category);
    const isExpanded = expandedCards.has(item.id);
    const isPlaying = playingAudio === item.id;
    const alreadyPlayed = playedKeysSnapshot.includes(item.id);

    return (
      <View style={alreadyPlayed ? styles.playedCard : undefined}>
        <ConversationCard
          conversation={item}
          categoryInfo={categoryInfo}
          isPlaying={isPlaying}
          isExpanded={isExpanded}
          onPress={() => toggleCardExpansion(item.id)}
          onAudioPress={() => playAudio(item.id, item.kurdish)}
        />
      </View>
    );
  }, [expandedCards, playingAudio, categories, playedKeysSnapshot]);

  // Render category chip
  const renderCategoryChip = useCallback(({ item }: { item: ConversationCategory | { id: 'all'; name: string; icon: string | null } }) => {
    const isActive = selectedCategory === item.id;
    const hasIcon = 'icon' in item && item.icon;

    return (
      <Pressable
        onPress={() => setSelectedCategory(item.id)}
        style={({ pressed }) => [
          styles.categoryChip,
          isActive && styles.categoryChipActive,
          pressed && styles.chipPressed,
        ]}
      >
        {hasIcon && <Text style={styles.categoryChipIcon}>{item.icon}</Text>}
        <Text style={[
          styles.categoryChipText,
          isActive && styles.categoryChipTextActive,
        ]}>
          {item.name}
        </Text>
      </Pressable>
    );
  }, [selectedCategory]);

  const keyExtractor = useCallback((item: Conversation) => item.id, []);
  const categoryKeyExtractor = useCallback((item: ConversationCategory | { id: 'all'; name: string; icon: string | null }) => item.id, []);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Daily Conversations</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.progressBarCard}>
          <View style={styles.progressBarSection}>
            <Text style={styles.progressBarLabel}>Progress</Text>
            <Text style={[styles.progressBarValue, progress.progress === 100 && styles.progressBarComplete]}>
              {Math.round(progress.progress)}%
            </Text>
          </View>
          <View style={styles.progressBarDivider} />
          <View style={styles.progressBarSection}>
            <Text style={styles.progressBarLabel}>Learn</Text>
            <Text style={[styles.progressBarValue, learnedCount === totalConversations && styles.progressBarComplete]}>
              {learnedCount}/{totalConversations}
            </Text>
          </View>
        </View>

      {/* Category Chips - Horizontal Scrollable */}
      <View style={styles.categorySection}>
        <FlatList
          data={categoryChips}
          renderItem={renderCategoryChip}
          keyExtractor={categoryKeyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContainer}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        />
      </View>

      {/* Category Description */}
      {selectedCategoryInfo && selectedCategory !== 'all' && (
        <View style={styles.categoryDescription}>
          <Text style={styles.categoryDescriptionText}>
            {selectedCategoryInfo.description}
          </Text>
        </View>
      )}

      {/* Conversations List - FlatList for Performance */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.conversationsList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={() => <View style={{ height: 24 }} />}
      />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 44,
  },
  backHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerRight: { width: 44 },
  progressBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  progressBarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 1,
  },
  progressBarValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  progressBarComplete: { color: '#10b981' },
  playedCard: { opacity: 0.65 },
  progressBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  // Category Section - Compact Horizontal
  categorySection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryChipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3A86FF',
  },
  categoryChipIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  chipPressed: {
    opacity: 0.7,
  },
  categoryDescription: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  categoryDescriptionText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Conversations List
  conversationsList: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  // Conversation Card - Modern Tap-to-Expand
  conversationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  cardContent: {
    gap: 12,
  },
  // Card Header: Title + Category + Audio
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 24,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Audio Button - Circular, Right-Aligned
  audioButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  audioButtonPressed: {
    opacity: 0.7,
  },
  audioButtonPlaying: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  // Card Body - Collapsed View
  cardBody: {
    gap: 6,
  },
  cardEnglish: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 22,
  },
  cardKurdish: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
  },
  // Card Expanded - Additional Info
  cardExpanded: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  cardPronunciation: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6b7280',
    lineHeight: 18,
  },
  cardContext: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 18,
  },
});

