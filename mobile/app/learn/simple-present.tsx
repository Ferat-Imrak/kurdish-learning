import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { restoreRefsFromProgress, getLearnedCount } from '../../lib/utils/progressHelper';

const { width } = Dimensions.get('window');

const LESSON_ID = '15'; // Simple Present Tense lesson ID

// Layout constants
const ICON_CONTAINER_WIDTH = 44;

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

// Conjugation table data
const conjugationTable = [
  { pronoun: "Ez", pronounEn: "I", ending: "-im", example: "dixwim", exampleEn: "I eat" },
  { pronoun: "Tu", pronounEn: "You", ending: "-î", example: "dixwî", exampleEn: "You eat" },
  { pronoun: "Ew", pronounEn: "He/She", ending: "-e", example: "dixwe", exampleEn: "He/She eats" },
  { pronoun: "Em", pronounEn: "We", ending: "-in", example: "dixwin", exampleEn: "We eat" },
  { pronoun: "Hûn", pronounEn: "You (plural)", ending: "-in", example: "dixwin", exampleEn: "You eat" },
  { pronoun: "Ewan", pronounEn: "They", ending: "-in", example: "dixwin", exampleEn: "They eat" }
];

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", root: "xwar", ez: "dixwim", tu: "dixwî", ew: "dixwe", em: "dixwin", hun: "dixwin", ewan: "dixwin" },
  { infinitive: "çûn", en: "to go", root: "ç", ez: "diçim", tu: "diçî", ew: "diçe", em: "diçin", hun: "diçin", ewan: "diçin" },
  { infinitive: "kirin", en: "to do", root: "kir", ez: "dikim", tu: "dikî", ew: "dike", em: "dikin", hun: "dikin", ewan: "dikin" },
  { infinitive: "xwendin", en: "to read", root: "xwên", ez: "dixwînim", tu: "dixwînî", ew: "dixwîne", em: "dixwînin", hun: "dixwînin", ewan: "dixwînin" },
  { infinitive: "hatin", en: "to come", root: "hat", ez: "hatim", tu: "hatî", ew: "tê", em: "tên", hun: "tên", ewan: "tên" },
  { infinitive: "dîtin", en: "to see", root: "bîn", ez: "dibînim", tu: "dibînî", ew: "dibîne", em: "dibînin", hun: "dibînin", ewan: "dibînin" },
  { infinitive: "bihîstin", en: "to hear", root: "bihîs", ez: "dibihîzim", tu: "dibihîzî", ew: "dibihîze", em: "dibihîzin", hun: "dibihîzin", ewan: "dibihîzin" },
  { infinitive: "axaftin", en: "to speak", root: "axaft", ez: "diaxivim", tu: "diaxivî", ew: "diaxive", em: "diaxevin", hun: "diaxevin", ewan: "diaxevin" }
];

const presentTenseExamples = [
  {
    title: 'Daily Activities',
    examples: [
      { ku: "Ez nan dixwim.", en: "I eat bread", audio: true, audioText: "Ez nan dixwim" },
      { ku: "Tu pirtûk dixwînî.", en: "You read a book", audio: true, audioText: "Tu pirtûk dixwînî" },
      { ku: "Ew li malê ye.", en: "He/She is at home", audio: true, audioText: "Ew li malê ye" },
      { ku: "Ez xwendekar im.", en: "I am a student", audio: true, audioText: "Ez xwendekar im" },
      { ku: "Em diçin dibistanê.", en: "We go to school", audio: true, audioText: "Em diçin dibistanê" },
      { ku: "Tu çayê vedixwî.", en: "You drink tea", audio: true, audioText: "Tu çayê vedixwî" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Ez dibînim.", en: "I see", audio: true, audioText: "Ez dibînim" },
      { ku: "Tu dibihîzî.", en: "You hear", audio: true, audioText: "Tu dibihîzî" },
      { ku: "Ew diaxive.", en: "He/She speaks", audio: true, audioText: "Ew diaxive" },
      { ku: "Em dikin.", en: "We do", audio: true, audioText: "Em dikin" },
      { ku: "Ew tê.", en: "He/She comes", audio: true, audioText: "Ew tê" },
      { ku: "Ez diçim bazarê.", en: "I go to the market", audio: true, audioText: "Ez diçim bazarê" }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Ez naxwim.", en: "I don't eat", audio: true, audioText: "Ez naxwim" },
      { ku: "Tu naxwî.", en: "You don't eat", audio: true, audioText: "Tu naxwî" },
      { ku: "Ew naxwe.", en: "He/She doesn't eat", audio: true, audioText: "Ew naxwe" },
      { ku: "Em naxwin.", en: "We don't eat", audio: true, audioText: "Em naxwin" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Tu çi dixwî?", en: "What do you eat?", audio: true, audioText: "Tu çi dixwî?" },
      { ku: "Ew diçe ku derê?", en: "Where does he/she go?", audio: true, audioText: "Ew diçe ku derê?" },
      { ku: "Tu çawa yî?", en: "How are you?", audio: true, audioText: "Tu çawa yî?" },
      { ku: "Ez çi bikim?", en: "What should I do?", audio: true, audioText: "Ez çi bikim?" }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "Ez xwarim",
    correct: "Ez dixwim",
    explanation: "Don't forget the 'di-' prefix! Present tense always needs 'di-' before the verb root."
  },
  {
    wrong: "Tu xwar",
    correct: "Tu dixwî",
    explanation: "Present tense needs both 'di-' prefix and the correct ending (-î for 'Tu')."
  },
  {
    wrong: "Ew dixwar",
    correct: "Ew dixwe",
    explanation: "The ending for 'Ew' (He/She) is '-e', not '-ar'. Remember: Ew → -e ending."
  },
  {
    wrong: "Ez diçim malê",
    correct: "Ez diçim malê",
    note: "Actually correct! But remember 'li' is often used: 'Ez li malê me' (I am at home)."
  }
];

const practiceExercises = [
  {
    question: "How do you say 'I eat' in Kurdish?",
    options: ["Ez dixwim", "Min xwar", "Ez bixwim", "Ez xwarim"],
    correct: 0,
    explanation: "Present tense uses 'Ez' + 'di-' prefix + verb root + '-im' ending"
  },
  {
    question: "What is the correct present tense form for 'You go'?",
    options: ["Tu çûyî", "Tu diçî", "Tu biçî", "Te çû"],
    correct: 1,
    explanation: "Present tense: Tu + di- + ç + -î = Tu diçî"
  },
  {
    question: "Which ending is used for 'Ew' (He/She) in present tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 2,
    explanation: "Ew (He/She) always uses '-e' ending in present tense"
  },
  {
    question: "How do you say 'We don't eat'?",
    options: ["Em naxwin", "Em naxwar", "Em naxwim", "Em naxwe"],
    correct: 0,
    explanation: "Negative: Em + na- (instead of di-) + xwar + -in = Em naxwin"
  },
  {
    question: "What prefix is used for present tense?",
    options: ["bi-", "di-", "ê", "no prefix"],
    correct: 1,
    explanation: "Present tense always uses 'di-' prefix before the verb root"
  },
  {
    question: "How do you say 'I read' in present tense?",
    options: ["Ez xwend", "Ez dixwînim", "Min xwend", "Ez bixwînim"],
    correct: 1,
    explanation: "Present tense: Ez + di- + xwên + -im = Ez dixwînim"
  },
  {
    question: "What is 'Tu dixwî' in English?",
    options: ["I eat", "You eat", "He eats", "We eat"],
    correct: 1,
    explanation: "Tu = You, dixwî = eat (present tense with -î ending for Tu)"
  },
  {
    question: "Which is correct for 'She reads'?",
    options: ["Ew dixwîne", "Ew xwend", "Wê dixwîne", "Ew bixwîne"],
    correct: 0,
    explanation: "Present tense: Ew + di- + xwên + -e = Ew dixwîne"
  },
  {
    question: "How do you say 'They go' in present tense?",
    options: ["Ewan diçin", "Ewan çûn", "Ewan biçin", "Wan çû"],
    correct: 0,
    explanation: "Present tense: Ewan + di- + ç + -in = Ewan diçin"
  },
  {
    question: "What is the negative form of 'Ez dixwim'?",
    options: ["Ez naxwim", "Ez nexwar", "Min naxwar", "Ez naxwar"],
    correct: 0,
    explanation: "Negative present: Replace 'di-' with 'na-' = Ez naxwim"
  },
  {
    question: "Which ending is used for 'Em' (We) in present tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "Em (We) always uses '-in' ending in present tense"
  },
  {
    question: "How do you say 'I do' in present tense?",
    options: ["Ez dikim", "Min kir", "Ez bikim", "Ez kirim"],
    correct: 0,
    explanation: "Present tense: Ez + di- + kir + -im = Ez dikim"
  },
  {
    question: "What is 'Ew diçe' in English?",
    options: ["I go", "You go", "He/She goes", "We go"],
    correct: 2,
    explanation: "Ew = He/She, diçe = goes (present tense with -e ending)"
  },
  {
    question: "How do you say 'You read' in present tense?",
    options: ["Tu xwend", "Tu dixwînî", "Te xwend", "Tu bixwînî"],
    correct: 1,
    explanation: "Present tense: Tu + di- + xwên + -î = Tu dixwînî"
  },
  {
    question: "Which is the correct structure for present tense?",
    options: ["Subject + verb", "Subject + di- + verb + ending", "Subject + ê + bi- + verb", "Subject + past verb"],
    correct: 1,
    explanation: "Present tense structure: Subject + di- prefix + verb root + personal ending"
  },
  {
    question: "How do you say 'We eat' in present tense?",
    options: ["Em dixwin", "Me xwar", "Em naxwin", "Em bixwin"],
    correct: 0,
    explanation: "Present tense: Em + di- + xwar + -in = Em dixwin"
  },
  {
    question: "What is the negative of 'Tu diçî'?",
    options: ["Tu naçî", "Tu neçî", "Te çû", "Tu naxwî"],
    correct: 1,
    explanation: "Negative present: Replace 'di-' with 'ne-' = Tu neçî (for çûn verb)"
  },
  {
    question: "Which pronoun uses '-î' ending in present tense?",
    options: ["Ez", "Tu", "Ew", "Em"],
    correct: 1,
    explanation: "Tu (You) always uses '-î' ending in present tense"
  },
  {
    question: "How do you say 'I see' in present tense?",
    options: ["Ez dît", "Ez dibînim", "Min dît", "Ez bidînim"],
    correct: 1,
    explanation: "Present tense: Ez + di- + bîn + -im = Ez dibînim"
  },
  {
    question: "What is 'Hûn dixwin' in English?",
    options: ["I eat", "You eat (singular)", "You eat (plural)", "They eat"],
    correct: 2,
    explanation: "Hûn = You (plural), dixwin = eat (present tense with -in ending)"
  }
];

// Audio assets
const audioAssets: Record<string, any> = {
  // Daily Activities
  'ez-nan-dixwim': require('../../assets/audio/grammar/ez-nan-dixwim.mp3'),
  'tu-pirtuk-dixwini': require('../../assets/audio/grammar/tu-pirtuk-dixwini.mp3'),
  'ew-li-male-ye': require('../../assets/audio/grammar/ew-li-male-ye.mp3'),
  'ez-xwendekar-im': require('../../assets/audio/grammar/ez-xwendekar-im.mp3'),
  'em-dicin-dibistane': require('../../assets/audio/grammar/em-dicin-dibistane.mp3'),
  'tu-caye-vedixwi': require('../../assets/audio/grammar/tu-caye-vedixwi.mp3'),
  // More Examples
  'ez-dibinim': require('../../assets/audio/grammar/ez-dibinim.mp3'),
  'tu-dibihizi': require('../../assets/audio/grammar/tu-dibihizi.mp3'),
  'ew-diaxive': require('../../assets/audio/grammar/ew-diaxive.mp3'),
  'em-dikin': require('../../assets/audio/grammar/em-dikin.mp3'),
  'ew-te': require('../../assets/audio/grammar/ew-te.mp3'),
  'ez-dicim-bazare': require('../../assets/audio/grammar/ez-dicim-bazare.mp3'),
  // Negative Form
  'ez-naxwim': require('../../assets/audio/grammar/ez-naxwim.mp3'),
  'tu-naxwi': require('../../assets/audio/grammar/tu-naxwi.mp3'),
  'ew-naxwe': require('../../assets/audio/grammar/ew-naxwe.mp3'),
  'em-naxwin': require('../../assets/audio/grammar/em-naxwin.mp3'),
  // Questions
  'tu-ci-dixwi': require('../../assets/audio/grammar/tu-ci-dixwi.mp3'),
  'ew-dice-ku-dere': require('../../assets/audio/grammar/ew-dice-ku-dere.mp3'),
  'tu-cawa-yi': require('../../assets/audio/grammar/tu-cawa-yi.mp3'),
  'ez-ci-bikim': require('../../assets/audio/grammar/ez-ci-bikim.mp3'),
  
  // Common Verbs - Infinitives
  'xwarin': require('../../assets/audio/grammar/xwarin.mp3'),
  'cun': require('../../assets/audio/grammar/cun.mp3'),
  'kirin': require('../../assets/audio/grammar/kirin.mp3'),
  'xwendin': require('../../assets/audio/grammar/xwendin.mp3'),
  'hatin': require('../../assets/audio/grammar/hatin.mp3'),
  'ditin': require('../../assets/audio/grammar/ditin.mp3'),
  'bihistin': require('../../assets/audio/grammar/bihistin.mp3'),
  'axaftin': require('../../assets/audio/grammar/axaftin.mp3'),
  
  // Common Verbs Conjugations - xwarin (to eat)
  'ez-dixwim': require('../../assets/audio/grammar/ez-dixwim.mp3'),
  'tu-dixwi': require('../../assets/audio/grammar/tu-dixwi.mp3'),
  'ew-dixwe': require('../../assets/audio/grammar/ew-dixwe.mp3'),
  'em-dixwin': require('../../assets/audio/grammar/em-dixwin.mp3'),
  'hun-dixwin': require('../../assets/audio/grammar/hun-dixwin.mp3'),
  'ewan-dixwin': require('../../assets/audio/grammar/ewan-dixwin.mp3'),
  
  // Common Verbs Conjugations - çûn (to go)
  'ez-dicim': require('../../assets/audio/grammar/ez-dicim.mp3'),
  'tu-dici': require('../../assets/audio/grammar/tu-dici.mp3'),
  'ew-dice': require('../../assets/audio/grammar/ew-dice.mp3'),
  'em-dicin': require('../../assets/audio/grammar/em-dicin.mp3'),
  'hun-dicin': require('../../assets/audio/grammar/hun-dicin.mp3'),
  'ewan-dicin': require('../../assets/audio/grammar/ewan-dicin.mp3'),
  
  // Common Verbs Conjugations - kirin (to do)
  'ez-dikim': require('../../assets/audio/grammar/ez-dikim.mp3'),
  'tu-diki': require('../../assets/audio/grammar/tu-diki.mp3'),
  'ew-dike': require('../../assets/audio/grammar/ew-dike.mp3'),
  'em-dikin': require('../../assets/audio/grammar/em-dikin.mp3'),
  'hun-dikin': require('../../assets/audio/grammar/hun-dikin.mp3'),
  'ewan-dikin': require('../../assets/audio/grammar/ewan-dikin.mp3'),
  
  // Common Verbs Conjugations - xwendin (to read)
  'ez-dixwinim': require('../../assets/audio/grammar/ez-dixwinim.mp3'),
  'tu-dixwini': require('../../assets/audio/grammar/tu-dixwini.mp3'),
  'ew-dixwine': require('../../assets/audio/grammar/ew-dixwine.mp3'),
  'em-dixwinin': require('../../assets/audio/grammar/em-dixwinin.mp3'),
  'hun-dixwinin': require('../../assets/audio/grammar/hun-dixwinin.mp3'),
  'ewan-dixwinin': require('../../assets/audio/grammar/ewan-dixwinin.mp3'),
  
  // Common Verbs Conjugations - hatin (to come) - irregular
  'ez-hatim': require('../../assets/audio/grammar/ez-hatim.mp3'),
  'tu-hati': require('../../assets/audio/grammar/tu-hati.mp3'),
  'ew-te': require('../../assets/audio/grammar/ew-te.mp3'),
  'em-ten': require('../../assets/audio/grammar/em-ten.mp3'),
  'hun-ten': require('../../assets/audio/grammar/hun-ten.mp3'),
  'ewan-ten': require('../../assets/audio/grammar/ewan-ten.mp3'),
  
  // Common Verbs Conjugations - dîtin (to see)
  'ez-dibinim': require('../../assets/audio/grammar/ez-dibinim.mp3'),
  'tu-dibini': require('../../assets/audio/grammar/tu-dibini.mp3'),
  'ew-dibine': require('../../assets/audio/grammar/ew-dibine.mp3'),
  'em-dibinin': require('../../assets/audio/grammar/em-dibinin.mp3'),
  'hun-dibinin': require('../../assets/audio/grammar/hun-dibinin.mp3'),
  'ewan-dibinin': require('../../assets/audio/grammar/ewan-dibinin.mp3'),
  
  // Common Verbs Conjugations - bihîstin (to hear)
  'ez-dibihizim': require('../../assets/audio/grammar/ez-dibihizim.mp3'),
  'tu-dibihizi': require('../../assets/audio/grammar/tu-dibihizi.mp3'),
  'ew-dibihize': require('../../assets/audio/grammar/ew-dibihize.mp3'),
  'em-dibihizin': require('../../assets/audio/grammar/em-dibihizin.mp3'),
  'hun-dibihizin': require('../../assets/audio/grammar/hun-dibihizin.mp3'),
  'ewan-dibihizin': require('../../assets/audio/grammar/ewan-dibihizin.mp3'),
  
  // Common Verbs Conjugations - axaftin (to speak)
  'ez-diaxivim': require('../../assets/audio/grammar/ez-diaxivim.mp3'),
  'tu-diaxivi': require('../../assets/audio/grammar/tu-diaxivi.mp3'),
  'ew-diaxive': require('../../assets/audio/grammar/ew-diaxive.mp3'),
  'em-diaxivin': require('../../assets/audio/grammar/em-diaxivin.mp3'),
  'hun-diaxivin': require('../../assets/audio/grammar/hun-diaxivin.mp3'),
  'ewan-diaxivin': require('../../assets/audio/grammar/ewan-diaxivin.mp3'),
};

export default function SimplePresentPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playedKeysSnapshot, setPlayedKeysSnapshot] = useState<string[]>(() => getLessonProgress(LESSON_ID).playedAudioKeys || []);

  const progressConfig = {
    totalAudios: 20, // Total unique audios in presentTenseExamples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.5, // 30% / 20 audios = 1.5% per audio
  };
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID);
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
    console.log('🚀 Simple-Present page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
    });
    
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
    
    const currentProgress = getLessonProgress(LESSON_ID);
    const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig);
    startTimeRef.current = estimatedStartTime;
    baseAudioPlaysRef.current = estimatedAudioPlays;
    if (currentProgress.playedAudioKeys?.length) {
      uniqueAudiosPlayedRef.current = new Set(currentProgress.playedAudioKeys);
      setPlayedKeysSnapshot(currentProgress.playedAudioKeys);
    }
  }, [isAuthenticated]);

  const playAudio = async (audioKey: string, audioText: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Extract actual audio file name from audioKey
      let audioFileToLookup = audioKey;
      if (audioKey.includes('-')) {
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'example' || parts[0] === 'conjugation' || parts[0] === 'verb')) {
          // For verb-* keys, we want to use the audioText to generate the filename
          if (parts[0] === 'verb' && audioText) {
            audioFileToLookup = getAudioFilename(audioText);
          } else {
            audioFileToLookup = parts.slice(1).join('-');
          }
        }
      }

      // Try to find audio by the extracted filename first
      let audioAsset = audioAssets[audioFileToLookup];
      
      // If not found, try to find by filename generated from text
      if (!audioAsset && audioText) {
        const filename = getAudioFilename(audioText);
        audioAsset = audioAssets[filename];
      }
      
      // If still not found, try the original audioKey (fallback)
      if (!audioAsset) {
        audioAsset = audioAssets[audioKey];
      }
      
      if (!audioAsset) {
        console.warn(`Audio file not found: ${audioFileToLookup} (key: ${audioKey}, text: ${audioText}). Audio files will be generated/copied later.`);
        return;
      }

      await Asset.loadAsync(audioAsset);
      const asset = Asset.fromModule(audioAsset);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: asset.localUri || asset.uri },
        { shouldPlay: true, volume: 1.0 }
      );

      setSound(newSound);
      setPlayingAudio(audioKey);
      
      if (!uniqueAudiosPlayedRef.current.has(audioKey)) {
        uniqueAudiosPlayedRef.current.add(audioKey);
        setPlayedKeysSnapshot(Array.from(uniqueAudiosPlayedRef.current));
        handleAudioPlay();
      }

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (!status.isPlaying && status.didJustFinish) {
            setPlayingAudio(null);
          }
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const calculateProgress = (practiceScore?: number) => {
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate session time (time since restored start time)
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    
    const totalAudios = progressConfig.totalAudios;
    const currentUniqueAudios = uniqueAudiosPlayedRef.current.size;
    const newAudioProgress = Math.min(30, (currentUniqueAudios / totalAudios) * 30);
    const newTimeProgress = Math.min(20, sessionTimeMinutes * 5);

    let practiceProgress = 0;
    if (practiceScore !== undefined) {
      if (practiceScore >= 70) {
        practiceProgress = 50;
      } else {
        practiceProgress = Math.min(49, practiceScore * 0.5);
      }
    } else if (currentProgress?.status === 'COMPLETED') {
      practiceProgress = 50;
    }

    return Math.min(100, newAudioProgress + newTimeProgress + practiceProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
    
    // Safeguard: ensure timeSpent is reasonable (max 1000 minutes = ~16 hours)
    const safeTimeSpent = Math.min(1000, totalTimeSpent);
    
    const progress = calculateProgress(undefined);
    const status = progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  const handleAnswerSelect = (index: number) => {
    if (showFeedback || isCompleted) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    const isCorrect = index === practiceExercises[currentExercise].correct;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNext = () => {
    if (currentExercise < practiceExercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // Calculate practice score percentage
      const practiceScorePercent = (score.correct / score.total) * 100;
      const isPracticePassed = practiceScorePercent >= 70; // Changed from 80% to 70%
      
      setIsCompleted(isPracticePassed);
      
      // Calculate total time spent (base + session)
      const currentProgress = getLessonProgress(LESSON_ID);
      const baseTimeSpent = currentProgress?.timeSpent || 0;
      const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
      
      // Safeguard: ensure timeSpent is reasonable (max 1000 minutes = ~16 hours)
      const safeTimeSpent = Math.min(1000, totalTimeSpent);
      
      // Calculate combined progress with practice score
      const progress = calculateProgress(practiceScorePercent);
      
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS';
      updateLessonProgress(LESSON_ID, progress, status, isPracticePassed ? practiceScorePercent : undefined, safeTimeSpent, Array.from(uniqueAudiosPlayedRef.current));
    }
  };

  const handleRestart = () => {
    setCurrentExercise(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setIsCompleted(false);
  };

  // Process examples to add audioFile paths
  const examplesWithAudio = presentTenseExamples.map(section => ({
    ...section,
    examples: section.examples.map(example => {
      if (example.audio) {
        const textForAudio = example.audioText || example.ku;
        return {
          ...example,
          audioFile: getAudioFilename(textForAudio)
        };
      }
      return example;
    })
  }));

  const progress = getLessonProgress(LESSON_ID);
  // Calculate total examples count for Learn progress
  const totalExamples = presentTenseExamples.reduce((sum, section) => sum + section.examples.length, 0);
  // Use getLearnedCount to get estimated base + new unique audios
  const currentProgress = getLessonProgress(LESSON_ID);
  const progressState = {
    uniqueAudiosPlayed: uniqueAudiosPlayedRef.current,
    sessionStartTime: startTimeRef.current,
    baseProgress: currentProgress?.progress || 0,
    baseTimeSpent: currentProgress?.timeSpent || 0,
    practiceScore: currentProgress?.score,
  };
  const learnedCount = getLearnedCount(progressState, totalExamples);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Simple Present Tense</Text>
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
            <Text style={[styles.progressBarValue, learnedCount === totalExamples && styles.progressBarComplete]}>
              {learnedCount}/{totalExamples}
            </Text>
          </View>
          <View style={styles.progressBarDivider} />
          <View style={styles.progressBarSection}>
            <Text style={styles.progressBarLabel}>Practice</Text>
            <Text style={[styles.progressBarValue, progress.status === 'COMPLETED' && styles.progressBarComplete]}>
              {progress.status === 'COMPLETED' ? 'Done' : 'Pending'}
            </Text>
          </View>
        </View>

      {/* Segmented Control - Mode Toggle */}
      <View style={styles.segmentedControl}>
        <Pressable
          onPress={() => setMode('learn')}
          style={({ pressed }) => [
            styles.segmentedButton,
            styles.segmentedButtonLeft,
            mode === 'learn' && styles.segmentedButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.segmentedButtonText,
              mode === 'learn' && styles.segmentedButtonTextActive,
            ]}
          >
            Learn
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('practice')}
          style={({ pressed }) => [
            styles.segmentedButton,
            styles.segmentedButtonRight,
            mode === 'practice' && styles.segmentedButtonActive,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.segmentedButtonText,
              mode === 'practice' && styles.segmentedButtonTextActive,
            ]}
          >
            Practice
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'learn' ? (
          <>
            {/* How Present Tense Works */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                How Present Tense Works in Kurdish
              </Text>
              <Text style={styles.sectionText}>
                In Kurdish, present tense is formed by adding the prefix <Text style={styles.highlightText}>"di-"</Text> before the verb root. This prefix shows that the action is happening right now or happens regularly.
              </Text>
              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>The Structure:</Text>
                <View style={styles.structureBox}>
                  <Text style={styles.structureText}>
                    Subject + <Text style={styles.highlightBox}>di-</Text> + verb root + personal ending
                  </Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleBold}>Step 1:</Text>
                  <Text style={styles.ruleText}> Take the verb root (infinitive form)</Text>
                  <Text style={styles.ruleExample}>Example: xwarin (to eat)</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleBold}>Step 2:</Text>
                  <Text style={styles.ruleText}> Add <Text style={styles.highlightText}>"di-"</Text> prefix</Text>
                  <Text style={styles.ruleExample}>xwarin → dixwarin</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleBold}>Step 3:</Text>
                  <Text style={styles.ruleText}> Add personal ending based on the subject</Text>
                  <Text style={styles.ruleExample}>dixwar + im (I eat)</Text>
                </View>
              </View>
              <View style={styles.personalEndingsBox}>
                <Text style={styles.rulesTitle}>Personal Endings:</Text>
                <Text style={styles.endingItem}><Text style={styles.endingBold}>-im</Text> for "Ez" (I)</Text>
                <Text style={styles.endingItem}><Text style={styles.endingBold}>-î</Text> for "Tu" (You)</Text>
                <Text style={styles.endingItem}><Text style={styles.endingBold}>-e</Text> for "Ew" (He/She)</Text>
                <Text style={styles.endingItem}><Text style={styles.endingBold}>-in</Text> for "Em/Hûn/Ewan" (We/You/They)</Text>
              </View>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Tip: The "di-" prefix always stays the same, but the ending changes based on who is doing the action!
                </Text>
              </View>
            </View>

            {/* Conjugation Table */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Conjugation Table - Verb "xwarin" (to eat)</Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft, { flex: 1 }]}>Pronoun</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft, { flex: 1 }]}>Ending</Text>
                  <Text style={[styles.tableHeaderCell, styles.tableHeaderCellLeft, { flex: 1 }]}>Kurdish</Text>
                </View>
                {conjugationTable.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCellLeft, { flex: 1 }]}>
                      <Text style={styles.tableCellKurdish}>{row.pronoun}</Text>
                      <Text style={styles.tableCellText}> ({row.pronounEn})</Text>
                    </Text>
                    <Text style={[styles.tableCellLeft, styles.tableCellEnding, { flex: 1 }]}>{row.ending}</Text>
                    <View style={[styles.tableCellContainerLeft, { flex: 1 }]}>
                      <Text style={styles.tableCellExample}>{row.example}</Text>
                      <Text style={styles.tableCellEnglish}>{row.exampleEn}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.tableNote}>
                <Text style={styles.tableNoteBold}>Note:</Text> Notice how all forms use "di-" prefix, but the ending changes: -im, -î, -e, -in
              </Text>
            </View>

            {/* Common Verbs - Card Layout */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📚</Text>
                <Text style={styles.sectionTitle}>Common Verbs in Present Tense</Text>
              </View>
              <FlatList
                data={commonVerbs}
                keyExtractor={(item, index) => `verb-${index}`}
                renderItem={({ item: verb, index: verbIndex }) => (
                  <View style={styles.verbCard}>
                    <View style={styles.verbCardHeader}>
                      <View style={styles.verbCardHeaderText}>
                        <Text style={styles.verbInfinitive}>{verb.infinitive}</Text>
                        <Text style={styles.verbEnglish}>{verb.en}</Text>
                      </View>
                      <Pressable
                        onPress={() => playAudio(`verb-infinitive-${verbIndex}`, verb.infinitive)}
                        style={styles.audioButtonContainer}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={playingAudio === `verb-infinitive-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                          size={22}
                          color="#4b5563"
                        />
                      </Pressable>
                    </View>
                    <View style={styles.verbCardContent}>
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Ez:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Ez {verb.ez}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-ez-${verbIndex}`, `Ez ${verb.ez}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-ez-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Tu:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Tu {verb.tu}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-tu-${verbIndex}`, `Tu ${verb.tu}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-tu-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Ew:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Ew {verb.ew}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-ew-${verbIndex}`, `Ew ${verb.ew}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-ew-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Em:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Em {verb.em}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-em-${verbIndex}`, `Em ${verb.em}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-em-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Hûn:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Hûn {verb.hun}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-hun-${verbIndex}`, `Hûn ${verb.hun}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-hun-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={[styles.verbConjugationRow, { marginBottom: 0 }]}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Ewan:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Ewan {verb.ewan}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-ewan-${verbIndex}`, `Ewan ${verb.ewan}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-ewan-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => null}
              />
            </View>

            {/* Common Mistakes */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIconWarning}>⚠️</Text>
                <Text style={styles.sectionTitleInline}>Common Mistakes to Avoid</Text>
              </View>
              {commonMistakes.map((mistake, index) => (
                <View key={index} style={styles.mistakeCard}>
                  <View style={styles.mistakeContent}>
                    <Text style={styles.mistakeLabel}>Wrong:</Text>
                    <Text style={styles.mistakeWrong}>{mistake.wrong}</Text>
                  </View>
                  <View style={styles.mistakeContent}>
                    <Text style={styles.mistakeLabelCorrect}>Correct:</Text>
                    <Text style={styles.mistakeCorrect}>{mistake.correct}</Text>
                  </View>
                  <Text style={styles.mistakeExplanation}>{mistake.explanation}</Text>
                </View>
              ))}
            </View>

            {/* Examples */}
            {examplesWithAudio.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.examples.map((example, exampleIndex) => (
                  <View key={exampleIndex} style={styles.exampleCard}>
                    <View style={styles.exampleCardContent}>
                      <View style={styles.exampleTextContainer}>
                        <Text style={styles.exampleKurdish}>{example.ku}</Text>
                        <Text style={styles.exampleEnglish}>{example.en}</Text>
                      </View>
                      {example.audio && (
                        <Pressable
                          onPress={() => playAudio(`example-${sectionIndex}-${exampleIndex}`, example.audioText || example.ku)}
                          style={styles.audioButtonContainer}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `example-${sectionIndex}-${exampleIndex}` ? 'volume-high' : 'volume-low-outline'}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : (
          /* Practice Mode */
          <View style={styles.practiceContainer}>
            {!isCompleted ? (
              <View style={styles.practiceCard}>
                <View style={styles.practiceHeader}>
                  <Text style={styles.practiceTitle}>Practice Exercise</Text>
                  <Text style={styles.practiceCounter}>
                    Question {currentExercise + 1} of {practiceExercises.length}
                  </Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${((currentExercise + 1) / practiceExercises.length) * 100}%` }
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.questionText}>
                  {practiceExercises[currentExercise].question}
                </Text>
                
                <View style={styles.optionsContainer}>
                  {practiceExercises[currentExercise].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === practiceExercises[currentExercise].correct;
                    const showResult = showFeedback;
                    
                    return (
                      <Pressable
                        key={index}
                        onPress={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        style={[
                          styles.optionButton,
                          showResult && isCorrect && styles.optionButtonCorrect,
                          showResult && isSelected && !isCorrect && styles.optionButtonWrong,
                          !showResult && isSelected && styles.optionButtonSelected,
                        ]}
                      >
                        <View style={styles.optionContent}>
                          {showResult && isCorrect && (
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                          )}
                          <Text style={styles.optionText}>{option}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {showFeedback && (
                  <View style={styles.feedbackBox}>
                    <Text style={styles.feedbackLabel}>Explanation:</Text>
                    <Text style={styles.feedbackText}>
                      {practiceExercises[currentExercise].explanation}
                    </Text>
                  </View>
                )}

                {showFeedback && (
                  <Pressable
                    onPress={handleNext}
                    style={({ pressed }) => [
                      styles.nextButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentExercise < practiceExercises.length - 1 ? 'Next Question' : 'Finish'}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.completionCard}>
                <Text style={styles.completionEmoji}>🎉</Text>
                <Text style={styles.completionTitle}>Practice Complete!</Text>
                <Text style={styles.completionText}>
                  You got <Text style={styles.completionScore}>{score.correct}</Text> out of{' '}
                  <Text style={styles.completionTotal}>{score.total}</Text> correct!
                </Text>
                <Text style={styles.completionPercentage}>
                  {Math.round((score.correct / score.total) * 100)}%
                </Text>
                <Pressable
                  onPress={handleRestart}
                  style={({ pressed }) => [
                    styles.restartButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.restartButtonText}>Try Again</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  backButton: {
    width: ICON_CONTAINER_WIDTH,
    height: ICON_CONTAINER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  headerRight: { width: 44 },
  backHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
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
  progressBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  segmentedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  segmentedButtonLeft: {
    marginRight: 1,
  },
  segmentedButtonRight: {
    marginLeft: 1,
  },
  segmentedButtonActive: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  segmentedButtonTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 8,
    flexShrink: 0,
  },
  sectionIconWarning: {
    fontSize: 18,
    marginRight: 8,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    flex: 1,
    flexShrink: 1,
  },
  sectionTitleInline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    flexShrink: 1,
  },
  sectionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  highlightText: {
    fontWeight: '700',
    color: '#111827',
  },
  rulesBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  structureBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  structureText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ruleItem: {
    marginBottom: 12,
  },
  ruleBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  ruleText: {
    fontSize: 16,
    color: '#374151',
  },
  ruleExample: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    marginTop: 4,
    marginLeft: 16,
  },
  personalEndingsBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  endingItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 24,
  },
  endingBold: {
    fontWeight: '700',
    color: '#111827',
  },
  tipBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 2,
    borderBottomColor: '#d1fae5',
  },
  tableHeaderCell: {
    padding: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  tableHeaderCellLeft: {
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  tableCellLeft: {
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlign: 'left',
  },
  tableCellContainer: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellContainerLeft: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tableCellKurdish: {
    fontWeight: '700',
    color: '#111827',
  },
  tableCellText: {
    color: '#6b7280',
    fontSize: 12,
  },
  tableCellEnding: {
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#111827',
  },
  tableCellExample: {
    fontFamily: 'monospace',
    color: '#111827',
  },
  tableCellEnglish: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tableNote: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    lineHeight: 20,
  },
  tableNoteBold: {
    fontWeight: '700',
    color: '#111827',
  },
  mistakeCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  mistakeContent: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  mistakeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
    marginRight: 8,
  },
  mistakeWrong: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#dc2626',
    textDecorationLine: 'line-through',
  },
  mistakeLabelCorrect: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginRight: 8,
  },
  mistakeCorrect: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#10b981',
  },
  mistakeExplanation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  verbCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  verbCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  verbCardHeaderText: {
    flex: 1,
  },
  verbCardContent: {
    marginTop: 0,
  },
  verbConjugationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  verbPronoun: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    width: 70,
  },
  verbConjugation: {
    fontSize: 15,
    fontFamily: 'monospace',
    color: '#111827',
    flex: 1,
  },
  verbRowSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 3,
  },
  verbInfinitive: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 3,
  },
  verbEnglish: {
    fontSize: 13,
    color: '#6b7280',
  },
  exampleCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exampleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exampleTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  practiceContainer: {
    flex: 1,
  },
  practiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  practiceCounter: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3A86FF',
    borderRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  optionButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  optionButtonCorrect: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  optionButtonWrong: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  feedbackBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  completionEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  completionScore: {
    fontWeight: '700',
    color: '#dc2626',
  },
  completionTotal: {
    fontWeight: '700',
    color: '#111827',
  },
  completionPercentage: {
    fontSize: 36,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 24,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3A86FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

