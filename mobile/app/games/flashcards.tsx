import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Match Games page: header + background
const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { useGamesProgressStore } from '../../lib/store/gamesProgressStore';
import CategoryCard from '../components/CategoryCard';

const { width } = Dimensions.get('window');

type Card = {
  english: string;
  kurdish: string;
  audio?: string;
};

type Deck = {
  name: string;
  description: string;
  icon: string;
  cards: Card[];
};

// Function to shuffle array randomly
const shuffleArray = <T extends unknown>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Individual category arrays
const colorsCards: Card[] = [
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
  { english: "Gold", kurdish: "zêr" },
];

const animalsCards: Card[] = [
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
  { english: "Crow", kurdish: "qel" },
];

const foodCards: Card[] = [
  // Fruits
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
  // Vegetables
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
  // Proteins
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
  // Dairy
  { english: "Milk", kurdish: "şîr" },
  { english: "Yogurt", kurdish: "mast" },
  { english: "Cheese", kurdish: "penîr" },
  { english: "Butter", kurdish: "rûn" },
  { english: "Cream", kurdish: "qeymax" },
  { english: "Yogurt drink", kurdish: "dew" },
  // Grains
  { english: "Bread", kurdish: "nan" },
  { english: "Rice", kurdish: "birinc" },
  { english: "Wheat", kurdish: "genim" },
  { english: "Barley", kurdish: "ceh" },
  { english: "Bulgur", kurdish: "bulgur" },
  { english: "Pasta", kurdish: "makarna" },
  { english: "Cake", kurdish: "kek" },
  { english: "Cookie", kurdish: "kurabiye" },
  // Drinks
  { english: "Coffee", kurdish: "qehwe" },
  { english: "Tea", kurdish: "çay" },
  { english: "Water", kurdish: "av" },
  { english: "Sherbet", kurdish: "şerbet" },
  { english: "Lemonade", kurdish: "limonata" },
];

const familyCards: Card[] = [
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
  { english: "Bride", kurdish: "bûk" },
];

const natureCards: Card[] = [
  // Trees
  { english: "Tree", kurdish: "dar" },
  { english: "Oak", kurdish: "berû" },
  { english: "Pine", kurdish: "sûs" },
  { english: "Palm", kurdish: "darê bejî" },
  { english: "Sycamore", kurdish: "darê çinar" },
  // Flowers
  { english: "Flower", kurdish: "gul" },
  { english: "Rose", kurdish: "gulên sor" },
  { english: "Sunflower", kurdish: "gulên rojê" },
  { english: "Lily", kurdish: "gulên sîrî" },
  { english: "Blossom", kurdish: "gulên çîçek" },
  // Landscapes
  { english: "Mountain", kurdish: "çiya" },
  { english: "Valley", kurdish: "newal" },
  { english: "Forest", kurdish: "daristan" },
  { english: "Spring", kurdish: "çavkanî" },
  { english: "Desert", kurdish: "çol" },
  { english: "Plain", kurdish: "deşt" },
  { english: "River", kurdish: "çem" },
  { english: "Lake", kurdish: "gol" },
  { english: "Sea", kurdish: "behr" },
  // Weather
  { english: "Rain", kurdish: "barîn" },
  { english: "Sun", kurdish: "roj" },
  { english: "Snow", kurdish: "berf" },
  { english: "Wind", kurdish: "ba" },
  { english: "Cloud", kurdish: "ewr" },
  { english: "Storm", kurdish: "bahoz" },
  { english: "Hail", kurdish: "zîpik" },
  // Plants
  { english: "Leaf", kurdish: "pel" },
  { english: "Root", kurdish: "kok" },
  { english: "Grass", kurdish: "gîha" },
  { english: "Seed", kurdish: "tohum" },
  { english: "Moss", kurdish: "giyayê çavkanî" },
  { english: "Mud", kurdish: "herrî" },
  { english: "Land/Soil", kurdish: "zevî" },
];

const timeCards: Card[] = [
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
  { english: "Before", kurdish: "berî" },
];

const weatherCards: Card[] = [
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
  { english: "Winter", kurdish: "zivistan" },
];

const houseCards: Card[] = [
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
  { english: "Table", kurdish: "mase" },
];

const numbersCards: Card[] = [
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
  { english: "Twenty", kurdish: "bîst" },
];

const daysMonthsCards: Card[] = [
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
  { english: "December", kurdish: "kanûn" },
];

const questionWordsCards: Card[] = [
  { english: "Who", kurdish: "kî" },
  { english: "What", kurdish: "çi" },
  { english: "Where", kurdish: "ku" },
  { english: "When", kurdish: "kengî" },
  { english: "Why", kurdish: "çima" },
  { english: "How", kurdish: "çawa" },
  { english: "How many/much", kurdish: "çend" },
  { english: "Which", kurdish: "kîjan" },
];

const pronounsCards: Card[] = [
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
  { english: "Their", kurdish: "wan" },
];

const bodyPartsCards: Card[] = [
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
  { english: "Elbow", kurdish: "enîşk" },
];

// All cards from all categories
const allCards: Card[] = [
  ...colorsCards,
  ...animalsCards,
  ...foodCards,
  ...familyCards,
  ...natureCards,
  ...timeCards,
  ...weatherCards,
  ...houseCards,
  ...numbersCards,
  ...daysMonthsCards,
  ...questionWordsCards,
  ...pronounsCards,
  ...bodyPartsCards,
];

const decks: Deck[] = [
  {
    name: "Colors",
    description: "Learn basic colors in Kurdish",
    icon: "🎨",
    cards: colorsCards,
  },
  {
    name: "Animals",
    description: "Common animals and pets",
    icon: "🐾",
    cards: animalsCards,
  },
  {
    name: "Food & Meals",
    description: "Food vocabulary from our lessons",
    icon: "🍽️",
    cards: foodCards,
  },
  {
    name: "Family Members",
    description: "Family relationships and members",
    icon: "👨‍👩‍👧‍👦",
    cards: familyCards,
  },
  {
    name: "Nature",
    description: "Natural world vocabulary",
    icon: "🌿",
    cards: natureCards,
  },
  {
    name: "Time & Schedule",
    description: "Time-related vocabulary",
    icon: "⏰",
    cards: timeCards,
  },
  {
    name: "Weather & Seasons",
    description: "Weather and seasonal vocabulary",
    icon: "🌤️",
    cards: weatherCards,
  },
  {
    name: "House & Objects",
    description: "Things around the house",
    icon: "🏠",
    cards: houseCards,
  },
  {
    name: "Numbers",
    description: "Kurdish numbers 1-20",
    icon: "🔢",
    cards: numbersCards,
  },
  {
    name: "Days & Months",
    description: "Days of week and months",
    icon: "📅",
    cards: daysMonthsCards,
  },
  {
    name: "Basic Question Words",
    description: "Essential question words for conversations",
    icon: "❓",
    cards: questionWordsCards,
  },
  {
    name: "Pronouns",
    description: "Personal and possessive pronouns",
    icon: "👥",
    cards: pronounsCards,
  },
  {
    name: "Body Parts",
    description: "Human body parts vocabulary",
    icon: "👤",
    cards: bodyPartsCards,
  },
  {
    name: "Master Challenge",
    description: "Ultimate test with all vocabulary mixed together",
    icon: "🏆",
    cards: [], // Will be populated dynamically
  },
];

const FLASHCARDS_KEY = (name: string) => `flashcards-progress-${name}`;

export default function FlashcardsPage() {
  const router = useRouter();
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress, data: gamesData } = useGamesProgressStore();
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [markedCards, setMarkedCards] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [incorrectCards, setIncorrectCards] = useState<Card[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewCardIndex, setReviewCardIndex] = useState(0);
  const [reviewFlipped, setReviewFlipped] = useState(false);
  const [reviewCardsFlipped, setReviewCardsFlipped] = useState<Set<number>>(new Set());
  const [reviewCompleted, setReviewCompleted] = useState(false);
  const [showReviewCompletion, setShowReviewCompletion] = useState(false);
  const [deckProgress, setDeckProgress] = useState<Record<string, { correct: number; total: number }>>({});

  const getProgress = (categoryName: string): { correct: number; total: number } | null => {
    const raw = getGamesProgress(FLASHCARDS_KEY(categoryName));
    if (!raw || typeof raw !== 'object' || !('correct' in (raw as object))) return null;
    return raw as { correct: number; total: number };
  };

  const saveProgress = async (categoryName: string, correct: number, total: number) => {
    const existing = getProgress(categoryName);
    const bestCorrect = existing ? Math.max(existing.correct, correct) : correct;
    await saveGamesProgress(FLASHCARDS_KEY(categoryName), { correct: bestCorrect, total });
    setDeckProgress((prev) => ({ ...prev, [categoryName]: { correct: bestCorrect, total } }));
  };

  // Flip animation
  const flipAnimation = React.useRef(new Animated.Value(0)).current;

  const currentCard = selectedDeck?.cards[currentCardIndex];
  const isCurrentCardMarked = markedCards[currentCardIndex] !== undefined;
  const allCardsMarked = selectedDeck && Object.keys(markedCards).length === selectedDeck.cards.length;

  // Load progress for all decks
  useEffect(() => {
    const progressMap: Record<string, { correct: number; total: number }> = {};
    for (const deck of decks) {
      const progress = getProgress(deck.name);
      if (progress) progressMap[deck.name] = progress;
    }
    setDeckProgress(progressMap);
  }, [gamesData]);

  // Reset flip state whenever card index changes
  useEffect(() => {
    setIsFlipped(false);
    setCardKey(prev => prev + 1);
    flipAnimation.setValue(0);
  }, [currentCardIndex]);

  // Reset review flipped state when review card index changes
  useEffect(() => {
    if (showReview) {
      setReviewFlipped(reviewCardsFlipped.has(reviewCardIndex));
    }
  }, [reviewCardIndex, showReview, reviewCardsFlipped]);

  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnimation, {
      toValue,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const flipReviewCard = () => {
    const newFlipped = !reviewFlipped;
    setReviewFlipped(newFlipped);
    if (newFlipped) {
      setReviewCardsFlipped(prev => new Set([...Array.from(prev), reviewCardIndex]));
    }
  };

  const nextCard = () => {
    if (!selectedDeck) return;

    if (Object.keys(markedCards).length === selectedDeck.cards.length) {
      if (incorrectCards.length > 0) {
        setTimeout(() => setShowReview(true), 500);
      }
      return;
    }

    let nextIndex = (currentCardIndex + 1) % selectedDeck.cards.length;
    let attempts = 0;

    while (markedCards[nextIndex] !== undefined && attempts < selectedDeck.cards.length) {
      nextIndex = (nextIndex + 1) % selectedDeck.cards.length;
      attempts++;
    }

    if (markedCards[nextIndex] !== undefined) {
      if (incorrectCards.length > 0) {
        setTimeout(() => setShowReview(true), 500);
      }
      return;
    }

    setCurrentCardIndex(nextIndex);
  };

  const prevCard = () => {
    if (selectedDeck) {
      setCurrentCardIndex((i) => (i - 1 + selectedDeck.cards.length) % selectedDeck.cards.length);
    }
  };

  const nextReviewCard = () => {
    if (reviewCardIndex < incorrectCards.length - 1 && reviewFlipped) {
      const nextIndex = reviewCardIndex + 1;
      setReviewCardIndex(nextIndex);
      setReviewFlipped(reviewCardsFlipped.has(nextIndex));
    }
  };

  const prevReviewCard = () => {
    if (reviewCardIndex > 0) {
      setReviewCardIndex(reviewCardIndex - 1);
      setReviewFlipped(reviewCardsFlipped.has(reviewCardIndex - 1));
    }
  };

  const finishReview = async () => {
    if (selectedDeck) {
      const originalDeckName = selectedDeck.name.replace(' - Review', '');
      const totalCards = originalDeckName === "Master Challenge" ? allCards.length :
        decks.find(d => d.name === originalDeckName)?.cards.length || selectedDeck.cards.length;
      await saveProgress(originalDeckName, correctCount, totalCards);
    }

    setShowReview(false);
    setShowReviewCompletion(true);
    setReviewCardIndex(0);
    setReviewFlipped(false);
    setReviewCardsFlipped(new Set());
    setReviewCompleted(true);
  };

  const reviewAgain = () => {
    setShowReviewCompletion(false);
    setReviewCardIndex(0);
    setReviewFlipped(false);
    setReviewCardsFlipped(new Set());
    setShowReview(true);
    setReviewCompleted(false);
  };

  const resetSameSession = () => {
    if (!selectedDeck) return;

    const originalDeckName = selectedDeck.name.replace(' - Review', '');
    const deckCardsMap: { [key: string]: Card[] } = {
      "Master Challenge": allCards,
      "Colors": colorsCards,
      "Animals": animalsCards,
      "Food & Meals": foodCards,
      "Family Members": familyCards,
      "Nature": natureCards,
      "Time & Schedule": timeCards,
      "Weather & Seasons": weatherCards,
      "House & Objects": houseCards,
      "Numbers": numbersCards,
      "Days & Months": daysMonthsCards,
      "Basic Question Words": questionWordsCards,
      "Pronouns": pronounsCards,
      "Body Parts": bodyPartsCards,
    };

    const sourceCards = deckCardsMap[originalDeckName] || selectedDeck.cards;
    const originalDeck = decks.find(d => d.name === originalDeckName);

    const shuffledDeck: Deck = {
      name: originalDeckName,
      description: originalDeck?.description || selectedDeck.description,
      icon: originalDeck?.icon || selectedDeck.icon,
      cards: shuffleArray([...sourceCards]),
    };

    setSelectedDeck(shuffledDeck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setCardKey(0);
    setMarkedCards({});
    setIncorrectCards([]);
    setShowReview(false);
    setShowReviewCompletion(false);
    setReviewCardIndex(0);
    setReviewFlipped(false);
    setReviewCardsFlipped(new Set());
    setReviewCompleted(false);
  };

  const resetDeck = () => {
    setSelectedDeck(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setCardKey(0);
    setMarkedCards({});
    setIncorrectCards([]);
    setShowReview(false);
    setShowReviewCompletion(false);
    setReviewCardIndex(0);
    setReviewFlipped(false);
    setReviewCardsFlipped(new Set());
    setReviewCompleted(false);
  };

  const handleDeckSelect = (deck: Deck) => {
    let shuffledDeck = { ...deck };
    const deckCardsMap: { [key: string]: Card[] } = {
      "Master Challenge": allCards,
      "Colors": colorsCards,
      "Animals": animalsCards,
      "Food & Meals": foodCards,
      "Family Members": familyCards,
      "Nature": natureCards,
      "Time & Schedule": timeCards,
      "Weather & Seasons": weatherCards,
      "House & Objects": houseCards,
      "Numbers": numbersCards,
      "Days & Months": daysMonthsCards,
      "Basic Question Words": questionWordsCards,
      "Pronouns": pronounsCards,
      "Body Parts": bodyPartsCards,
    };

    const sourceCards = deckCardsMap[deck.name] || deck.cards;
    shuffledDeck.cards = shuffleArray(sourceCards);

    setSelectedDeck(shuffledDeck);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setCardKey(0);
    setMarkedCards({});
    setIncorrectCards([]);
    setShowReview(false);
    setShowReviewCompletion(false);
    setReviewCardIndex(0);
    setReviewFlipped(false);
    setReviewCardsFlipped(new Set());
    setReviewCompleted(false);
  };

  const markCorrect = () => {
    if (!selectedDeck || !currentCard) return;
    if (markedCards[currentCardIndex]) return;

    const newMarkedCards: Record<number, 'correct' | 'incorrect'> = { ...markedCards, [currentCardIndex]: 'correct' };
    setMarkedCards(newMarkedCards);
    setCorrectCount(c => c + 1);
  };

  const markIncorrect = () => {
    if (!selectedDeck || !currentCard) return;
    if (markedCards[currentCardIndex]) return;

    const newMarkedCards: Record<number, 'correct' | 'incorrect'> = { ...markedCards, [currentCardIndex]: 'incorrect' };
    setMarkedCards(newMarkedCards);
    setIncorrectCount(c => c + 1);

    const cardExists = incorrectCards.find(c => c.kurdish === currentCard.kurdish && c.english === currentCard.english);
    if (!cardExists) {
      setIncorrectCards(prev => [...prev, currentCard]);
    }
  };

  // Calculate flip rotation
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const renderDeckItem = ({ item: deck }: { item: Deck }) => {
    const totalCards = deck.name === 'Master Challenge' ? allCards.length : deck.cards.length;
    const progress = deckProgress[deck.name];
    const isCompleted = progress && progress.correct === totalCards && progress.total === totalCards;
    const progressPercentage = progress
      ? Math.round((progress.correct / progress.total) * 100)
      : 0;
    return (
      <CategoryCard
        title={deck.name}
        subtitle={`${totalCards} cards`}
        icon={deck.icon}
        progressPercent={progressPercentage}
        isCompleted={!!isCompleted}
        onPress={() => handleDeckSelect(deck)}
      />
    );
  };

  // Show deck selection if no deck is selected
  if (!selectedDeck) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.categoriesContainer} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Flashcards</Text>
            <View style={styles.headerRight} />
          </View>

        <Text style={styles.description}>
          Choose a category to start learning with interactive flashcards!
        </Text>

        <FlatList
          data={decks}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={styles.deckRow}
          contentContainerStyle={styles.deckListContent}
          renderItem={renderDeckItem}
          showsVerticalScrollIndicator={false}
        />
        </SafeAreaView>
      </View>
    );
  }

  // Show completion screen if all cards are marked and all are correct
  if (allCardsMarked && incorrectCards.length === 0 && !showReview) {
    // Save progress when all cards are completed correctly
    if (selectedDeck) {
      const totalCards = selectedDeck.name === "Master Challenge" ? allCards.length : selectedDeck.cards.length;
      saveProgress(selectedDeck.name, totalCards, totalCards);
    }

    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Perfect Score!</Text>
          <Text style={styles.completionText}>
            You got all {selectedDeck?.cards.length} cards correct! Great job!
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#6b7280' }]}>{selectedDeck?.cards.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.completionButtons}>
            <Pressable onPress={resetSameSession} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Try Same Category</Text>
            </Pressable>
            <Pressable onPress={resetDeck} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to Categories</Text>
            </Pressable>
          </View>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show review completion screen after finishing review
  if (showReviewCompletion && reviewCompleted) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.completionContainer}>
            <Text style={styles.completionEmoji}>📚</Text>
            <Text style={styles.completionTitle}>Review Complete!</Text>
          <Text style={styles.completionText}>
            You've reviewed all {incorrectCards.length} cards you marked as "Don't Know". Great effort!
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{incorrectCount}</Text>
              <Text style={styles.statLabel}>Need Practice</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#6b7280' }]}>{selectedDeck?.cards.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          <View style={styles.completionButtons}>
            <Pressable onPress={reviewAgain} style={styles.reviewButton}>
              <Text style={styles.reviewButtonText}>Review Again</Text>
            </Pressable>
            <Pressable onPress={resetSameSession} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Try Same Category</Text>
            </Pressable>
            <Pressable onPress={resetDeck} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back to Categories</Text>
            </Pressable>
          </View>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show review screen if all cards are marked and there are incorrect cards
  if (showReview && incorrectCards.length > 0) {
    const reviewCard = incorrectCards[reviewCardIndex];
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={finishReview} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Review Mode</Text>
            <View style={styles.headerRight} />
          </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{incorrectCards.length}</Text>
            <Text style={styles.statLabel}>To Review</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#6b7280' }]}>
              {reviewCardIndex + 1} / {incorrectCards.length}
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.navigationRow}>
            <Pressable
              onPress={prevReviewCard}
              disabled={reviewCardIndex === 0}
              style={[styles.navButton, reviewCardIndex === 0 && styles.navButtonDisabled]}
            >
              <Text style={[styles.navButtonText, reviewCardIndex === 0 && styles.navButtonTextDisabled]}>
                Previous
              </Text>
            </Pressable>
            <Text style={styles.cardCounter}>
              Card {reviewCardIndex + 1} of {incorrectCards.length}
            </Text>
            <Pressable
              onPress={nextReviewCard}
              disabled={reviewCardIndex === incorrectCards.length - 1 || !reviewFlipped}
              style={[
                styles.navButton,
                (reviewCardIndex === incorrectCards.length - 1 || !reviewFlipped) && styles.navButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.navButtonText,
                  (reviewCardIndex === incorrectCards.length - 1 || !reviewFlipped) && styles.navButtonTextDisabled,
                ]}
              >
                Next
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={flipReviewCard} style={styles.flashcard}>
            <Animated.View style={[styles.cardFront, frontAnimatedStyle, !reviewFlipped && styles.cardVisible]}>
              <Text style={styles.cardKurdish}>
                {reviewCard?.kurdish.charAt(0).toUpperCase() + reviewCard?.kurdish.slice(1)}
              </Text>
              <Text style={styles.cardHint}>Tap to reveal translation</Text>
            </Animated.View>
            <Animated.View style={[styles.cardBack, backAnimatedStyle, reviewFlipped && styles.cardVisible]}>
              <Text style={styles.cardEnglish}>{reviewCard?.english}</Text>
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={finishReview}
            disabled={reviewCardsFlipped.size < incorrectCards.length}
            style={[
              styles.finishButton,
              reviewCardsFlipped.size < incorrectCards.length && styles.finishButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.finishButtonText,
                reviewCardsFlipped.size < incorrectCards.length && styles.finishButtonTextDisabled,
              ]}
            >
              Finish Review
            </Text>
          </Pressable>

          {reviewCardsFlipped.size < incorrectCards.length && (
            <Text style={styles.hintText}>
              Flip all {incorrectCards.length} cards to finish review ({reviewCardsFlipped.size}/{incorrectCards.length} flipped)
            </Text>
          )}
        </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show flashcard game interface
  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={resetDeck} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerIcon}>{selectedDeck.icon}</Text>
            <Text style={styles.headerTitle}>{selectedDeck.name}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

      <Text style={styles.deckDescription}>{selectedDeck.description}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{correctCount}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#6b7280' }]}>
            {Object.keys(markedCards).length} / {selectedDeck.cards.length}
          </Text>
          <Text style={styles.statLabel}>Marked</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{incorrectCount}</Text>
          <Text style={styles.statLabel}>Incorrect</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.navigationRow}>
          <Pressable onPress={prevCard} style={styles.navButton}>
            <Text style={styles.navButtonText}>Previous</Text>
          </Pressable>
          <Text style={styles.cardCounter}>
            Card {currentCardIndex + 1} of {selectedDeck.cards.length}
          </Text>
          <Pressable
            onPress={nextCard}
            disabled={!isCurrentCardMarked}
            style={[styles.navButton, !isCurrentCardMarked && styles.navButtonDisabled]}
          >
            <Text style={[styles.navButtonText, !isCurrentCardMarked && styles.navButtonTextDisabled]}>Next</Text>
          </Pressable>
        </View>

        <Pressable onPress={flipCard} style={styles.flashcard}>
          <Animated.View style={[styles.cardFront, frontAnimatedStyle, !isFlipped && styles.cardVisible]}>
            <Text style={styles.cardKurdish}>
              {currentCard?.kurdish
                ? currentCard.kurdish.charAt(0).toUpperCase() + currentCard.kurdish.slice(1)
                : ''}
            </Text>
            <Text style={styles.cardHint}>Tap to reveal translation</Text>
          </Animated.View>
          <Animated.View style={[styles.cardBack, backAnimatedStyle, isFlipped && styles.cardVisible]}>
            <Text style={styles.cardEnglish}>{currentCard?.english}</Text>
          </Animated.View>
        </Pressable>

        <View style={styles.actionButtons}>
          <Pressable
            onPress={markIncorrect}
            disabled={isCurrentCardMarked}
            style={[styles.markButton, styles.markIncorrectButton, isCurrentCardMarked && styles.markButtonDisabled]}
          >
            <Ionicons name="close-circle" size={20} color={isCurrentCardMarked ? '#9ca3af' : '#ef4444'} />
            <Text style={[styles.markButtonText, isCurrentCardMarked && styles.markButtonTextDisabled]}>
              Don't Know
            </Text>
          </Pressable>
          <Pressable
            onPress={markCorrect}
            disabled={isCurrentCardMarked}
            style={[styles.markButton, styles.markCorrectButton, isCurrentCardMarked && styles.markButtonDisabled]}
          >
            <Ionicons name="checkmark-circle" size={20} color={isCurrentCardMarked ? '#9ca3af' : '#10b981'} />
            <Text style={[styles.markButtonText, isCurrentCardMarked && styles.markButtonTextDisabled]}>Got It!</Text>
          </Pressable>
        </View>

        {isCurrentCardMarked && (
          <View style={styles.markedIndicator}>
            <View
              style={[
                styles.markedBadge,
                markedCards[currentCardIndex] === 'correct' ? styles.markedBadgeCorrect : styles.markedBadgeIncorrect,
              ]}
            >
              <Ionicons
                name={markedCards[currentCardIndex] === 'correct' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={markedCards[currentCardIndex] === 'correct' ? '#10b981' : '#ef4444'}
              />
              <Text
                style={[
                  styles.markedBadgeText,
                  markedCards[currentCardIndex] === 'correct' ? styles.markedBadgeTextCorrect : styles.markedBadgeTextIncorrect,
                ]}
              >
                {markedCards[currentCardIndex] === 'correct' ? 'Marked as "Got It!"' : 'Marked as "Don\'t Know"'}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.hintText}>
          {!isCurrentCardMarked
            ? "Mark this card as 'Got It!' or 'Don't Know' before moving to the next card"
            : "Tap the card to flip between Kurdish and English"}
        </Text>
      </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 44,
  },
  deckDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 8,
  },
  categoriesContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingTop: 4,
  },
  deckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  deckListContent: {
    paddingBottom: 40,
    paddingTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  progressTextComplete: {
    color: '#10b981',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardContainer: {
    flex: 1,
    padding: 20,
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
  cardCounter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  flashcard: {
    height: 320,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backfaceVisibility: 'hidden',
  },
  cardVisible: {
    zIndex: 1,
  },
  cardKurdish: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardEnglish: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  cardHint: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  markCorrectButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  markIncorrectButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  markButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  markButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  markButtonTextDisabled: {
    color: '#9ca3af',
  },
  markedIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  markedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markedBadgeCorrect: {
    backgroundColor: '#f0fdf4',
  },
  markedBadgeIncorrect: {
    backgroundColor: '#fef2f2',
  },
  markedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  markedBadgeTextCorrect: {
    color: '#10b981',
  },
  markedBadgeTextIncorrect: {
    color: '#ef4444',
  },
  hintText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  completionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  reviewButton: {
    backgroundColor: '#f97316',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  finishButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  finishButtonTextDisabled: {
    color: '#9ca3af',
  },
});


