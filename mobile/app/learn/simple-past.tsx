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

const LESSON_ID = '16'; // Simple Past Tense lesson ID

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
  { pronoun: "Min", pronounEn: "I", example: "xwar", exampleEn: "I ate" },
  { pronoun: "Te", pronounEn: "You", example: "xwar", exampleEn: "You ate" },
  { pronoun: "Wî", pronounEn: "He", example: "xwar", exampleEn: "He ate" },
  { pronoun: "Wê", pronounEn: "She", example: "xwar", exampleEn: "She ate" },
  { pronoun: "Me", pronounEn: "We", example: "xwar", exampleEn: "We ate" },
  { pronoun: "We", pronounEn: "You (plural)", example: "xwar", exampleEn: "You ate" },
  { pronoun: "Wan", pronounEn: "They", example: "xwar", exampleEn: "They ate" }
];

const pronounComparison = [
  { present: "Ez", past: "Min", en: "I" },
  { present: "Tu", past: "Te", en: "You" },
  { present: "Ew", past: "Wî/Wê", en: "He/She" },
  { present: "Em", past: "Me", en: "We" },
  { present: "Hûn", past: "We", en: "You (plural)" },
  { present: "Ewan", past: "Wan", en: "They" }
];

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", past: "xwar" },
  { infinitive: "çûn", en: "to go", past: "çû" },
  { infinitive: "kirin", en: "to do", past: "kir" },
  { infinitive: "xwendin", en: "to read", past: "xwend" },
  { infinitive: "hatin", en: "to come", past: "hat" },
  { infinitive: "dîtin", en: "to see", past: "dît" },
  { infinitive: "bihîstin", en: "to hear", past: "bihîst" },
  { infinitive: "axaftin", en: "to speak", past: "axaft" }
];

const pastTenseExamples = [
  {
    title: 'Daily Activities - Past Tense',
    examples: [
      { ku: "Min nan xwar.", en: "I ate bread", audio: true, audioText: "Min nan xwar" },
      { ku: "Te pirtûk xwend.", en: "You read a book", audio: true, audioText: "Te pirtûk xwend" },
      { ku: "Wî çû malê.", en: "He went home", audio: true, audioText: "Wî çû malê" },
      { ku: "Min îro çi kir?", en: "What did I do today?", audio: true, audioText: "Min îro çi kir" },
      { ku: "Te çayê vexwar.", en: "You drank tea", audio: true, audioText: "Te çayê vexwar" },
      { ku: "Wê pirtûkek kirî.", en: "She bought a book", audio: true, audioText: "Wê pirtûkek kirî" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Min dît.", en: "I saw", audio: true, audioText: "Min dît" },
      { ku: "Te bihîst.", en: "You heard", audio: true, audioText: "Te bihîst" },
      { ku: "Wî axaft.", en: "He spoke", audio: true, audioText: "Wî axaft" },
      { ku: "Me kir.", en: "We did", audio: true, audioText: "Me kir" },
      { ku: "Ew hatin.", en: "They came", audio: true, audioText: "Ew hatin" },
      { ku: "Min çû bazarê.", en: "I went to the market", audio: true, audioText: "Min çû bazarê" }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Min nexwar.", en: "I didn't eat", audio: true, audioText: "Min nexwar" },
      { ku: "Te nexwar.", en: "You didn't eat", audio: true, audioText: "Te nexwar" },
      { ku: "Wî nexwar.", en: "He didn't eat", audio: true, audioText: "Wî nexwar" },
      { ku: "Me nexwar.", en: "We didn't eat", audio: true, audioText: "Me nexwar" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Te çi xwar?", en: "What did you eat?", audio: true, audioText: "Te çi xwar" },
      { ku: "Wî çû ku derê?", en: "Where did he go?", audio: true, audioText: "Wî çû ku derê" },
      { ku: "Tu kengî hatî?", en: "When did you come?", audio: true, audioText: "Tu kengî hatî" },
      { ku: "Min çi kir?", en: "What did I do?", audio: true, audioText: "Min çi kir" }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "Ez xwar",
    correct: "Min xwar",
    explanation: "Past tense uses 'Min' instead of 'Ez'. Always remember: past tense = different pronouns!"
  },
  {
    wrong: "Tu dixwar",
    correct: "Te xwar",
    explanation: "Past tense doesn't use 'di-' prefix. Also use 'Te' instead of 'Tu'."
  },
  {
    wrong: "Ew xwar",
    correct: "Wî xwar (or Wê xwar)",
    explanation: "For 'Ew' in past tense, use 'Wî' (he) or 'Wê' (she), not 'Ew'."
  },
  {
    wrong: "Min dixwar",
    correct: "Min xwar",
    explanation: "Past tense verbs don't have the 'di-' prefix. The verb form is simpler and shorter."
  }
];

// Practice exercises
const practiceExercises = [
  {
    question: "How do you say 'I ate' in Kurdish?",
    options: ["Ez xwar", "Min xwar", "Min dixwar", "Ez dixwim"],
    correct: 1,
    explanation: "Past tense uses 'Min' (not 'Ez') and no 'di-' prefix. Just 'Min xwar'."
  },
  {
    question: "What is the correct past tense form for 'You went'?",
    options: ["Tu çûyî", "Te çû", "Tu diçî", "Te diçû"],
    correct: 1,
    explanation: "Past tense: Te (not Tu) + past verb form (çû). No 'di-' prefix needed."
  },
  {
    question: "Which pronoun is used for 'I' in past tense?",
    options: ["Ez", "Min", "Me", "Wî"],
    correct: 1,
    explanation: "Past tense always uses 'Min' for 'I', never 'Ez'."
  },
  {
    question: "How do you say 'He didn't eat'?",
    options: ["Wî nexwar", "Ew nexwar", "Wî naxwar", "Ew naxwe"],
    correct: 0,
    explanation: "Past negative: Wî (not Ew) + ne- prefix + past verb = Wî nexwar"
  },
  {
    question: "What is the main difference between present and past tense pronouns?",
    options: ["They are the same", "Past uses different pronouns (Min/Te/Wî)", "Past uses longer forms", "No difference"],
    correct: 1,
    explanation: "Past tense uses completely different pronouns: Min/Te/Wî instead of Ez/Tu/Ew"
  },
  {
    question: "How do you say 'I read' in past tense?",
    options: ["Ez xwend", "Min xwend", "Ez dixwînim", "Min dixwend"],
    correct: 1,
    explanation: "Past tense: Min (not Ez) + past verb form (xwend) = Min xwend"
  },
  {
    question: "What is 'Te xwar' in English?",
    options: ["I ate", "You ate", "He ate", "We ate"],
    correct: 1,
    explanation: "Te = You (past tense), xwar = ate"
  },
  {
    question: "Which is correct for 'She went'?",
    options: ["Ew çû", "Wê çû", "Ew diçe", "Wê diçe"],
    correct: 1,
    explanation: "Past tense: Wê (not Ew) + past verb (çû) = Wê çû"
  },
  {
    question: "How do you say 'They came' in past tense?",
    options: ["Ewan hatin", "Ew hatin", "Ewan hat", "Wan hat"],
    correct: 1,
    explanation: "Past tense: Ew + past verb (hatin) = Ew hatin"
  },
  {
    question: "What is the negative form of 'Min xwar'?",
    options: ["Min nexwar", "Ez naxwim", "Min naxwar", "Ez nexwar"],
    correct: 0,
    explanation: "Past negative: Min + ne- prefix + past verb = Min nexwar"
  },
  {
    question: "Which pronoun is used for 'You' in past tense?",
    options: ["Tu", "Te", "We", "Hûn"],
    correct: 1,
    explanation: "Past tense always uses 'Te' for 'You', never 'Tu'."
  },
  {
    question: "How do you say 'I did' in past tense?",
    options: ["Ez dikim", "Min kir", "Ez bikim", "Min dikir"],
    correct: 1,
    explanation: "Past tense: Min (not Ez) + past verb (kir) = Min kir"
  },
  {
    question: "What is 'Wî çû' in English?",
    options: ["I went", "You went", "He went", "We went"],
    correct: 2,
    explanation: "Wî = He (past tense), çû = went"
  },
  {
    question: "How do you say 'You read' in past tense?",
    options: ["Tu xwend", "Te xwend", "Tu dixwînî", "Te dixwend"],
    correct: 1,
    explanation: "Past tense: Te (not Tu) + past verb (xwend) = Te xwend"
  },
  {
    question: "Which is the correct structure for past tense?",
    options: ["Subject + di- + verb", "Past pronoun + past verb", "Subject + ê + bi- + verb", "Subject + verb + ending"],
    correct: 1,
    explanation: "Past tense structure: Past pronoun (Min/Te/Wî) + past verb form (no prefix needed)"
  },
  {
    question: "How do you say 'We ate' in past tense?",
    options: ["Em dixwin", "Me xwar", "Em xwar", "Me dixwar"],
    correct: 1,
    explanation: "Past tense: Me (not Em) + past verb (xwar) = Me xwar"
  },
  {
    question: "What is the negative of 'Te çû'?",
    options: ["Te neçû", "Tu neçî", "Te naxwar", "Tu naxwî"],
    correct: 0,
    explanation: "Past negative: Te + ne- prefix + past verb = Te neçû"
  },
  {
    question: "Which pronoun is used for 'He' in past tense?",
    options: ["Ew", "Wî", "Wê", "Wan"],
    correct: 1,
    explanation: "Past tense uses 'Wî' for 'He', 'Wê' for 'She', not 'Ew'."
  },
  {
    question: "How do you say 'I saw' in past tense?",
    options: ["Ez dît", "Min dît", "Ez dibînim", "Min bidît"],
    correct: 1,
    explanation: "Past tense: Min (not Ez) + past verb (dît) = Min dît"
  },
  {
    question: "What is 'Wan kir' in English?",
    options: ["I did", "You did", "We did", "They did"],
    correct: 3,
    explanation: "Wan = They (past tense), kir = did"
  },
  {
    question: "How do you say 'You (plural) went' in past tense?",
    options: ["Hûn diçin", "We çû", "Hûn çû", "We diçû"],
    correct: 1,
    explanation: "Past tense: We (not Hûn) + past verb (çû) = We çû"
  }
];

// Audio assets mapping - using grammar audio files
const audioAssets: Record<string, any> = {
  // Infinitives
  'xwarin': require('../../assets/audio/grammar/xwarin.mp3'),
  'cun': require('../../assets/audio/grammar/cun.mp3'),
  'kirin': require('../../assets/audio/grammar/kirin.mp3'),
  'xwendin': require('../../assets/audio/grammar/xwendin.mp3'),
  'hatin': require('../../assets/audio/grammar/hatin.mp3'),
  'ditin': require('../../assets/audio/grammar/ditin.mp3'),
  'bihistin': require('../../assets/audio/grammar/bihistin.mp3'),
  'axaftin': require('../../assets/audio/grammar/axaftin.mp3'),
  // Simple conjugations - xwar (to eat)
  'min-xwar': require('../../assets/audio/grammar/min-xwar.mp3'),
  'te-xwar': require('../../assets/audio/grammar/te-xwar.mp3'),
  'wi-xwar': require('../../assets/audio/grammar/wi-xwar.mp3'),
  'we-female-xwar': require('../../assets/audio/grammar/we-female-xwar.mp3'),
  'me-xwar': require('../../assets/audio/grammar/me-xwar.mp3'),
  'we-xwar': require('../../assets/audio/grammar/we-xwar.mp3'),
  'wan-xwar': require('../../assets/audio/grammar/wan-xwar.mp3'),
  // Simple conjugations - çû (to go)
  'min-cu': require('../../assets/audio/grammar/min-cu.mp3'),
  'te-cu': require('../../assets/audio/grammar/te-cu.mp3'),
  'wi-cu': require('../../assets/audio/grammar/wi-cu.mp3'),
  'we-female-cu': require('../../assets/audio/grammar/we-female-cu.mp3'),
  'me-cu': require('../../assets/audio/grammar/me-cu.mp3'),
  'we-cu': require('../../assets/audio/grammar/we-cu.mp3'),
  'wan-cu': require('../../assets/audio/grammar/wan-cu.mp3'),
  // Simple conjugations - kir (to do)
  'min-kir': require('../../assets/audio/grammar/min-kir.mp3'),
  'te-kir': require('../../assets/audio/grammar/te-kir.mp3'),
  'wi-kir': require('../../assets/audio/grammar/wi-kir.mp3'),
  'we-female-kir': require('../../assets/audio/grammar/we-female-kir.mp3'),
  'me-kir': require('../../assets/audio/grammar/me-kir.mp3'),
  'we-kir': require('../../assets/audio/grammar/we-kir.mp3'),
  'wan-kir': require('../../assets/audio/grammar/wan-kir.mp3'),
  // Simple conjugations - xwend (to read)
  'min-xwend': require('../../assets/audio/grammar/min-xwend.mp3'),
  'te-xwend': require('../../assets/audio/grammar/te-xwend.mp3'),
  'wi-xwend': require('../../assets/audio/grammar/wi-xwend.mp3'),
  'we-female-xwend': require('../../assets/audio/grammar/we-female-xwend.mp3'),
  'me-xwend': require('../../assets/audio/grammar/me-xwend.mp3'),
  'we-xwend': require('../../assets/audio/grammar/we-xwend.mp3'),
  'wan-xwend': require('../../assets/audio/grammar/wan-xwend.mp3'),
  // Simple conjugations - hat (to come)
  'min-hat': require('../../assets/audio/grammar/min-hat.mp3'),
  'te-hat': require('../../assets/audio/grammar/te-hat.mp3'),
  'wi-hat': require('../../assets/audio/grammar/wi-hat.mp3'),
  'we-female-hat': require('../../assets/audio/grammar/we-female-hat.mp3'),
  'me-hat': require('../../assets/audio/grammar/me-hat.mp3'),
  'we-hat': require('../../assets/audio/grammar/we-hat.mp3'),
  'wan-hat': require('../../assets/audio/grammar/wan-hat.mp3'),
  // Simple conjugations - dît (to see)
  'min-dit': require('../../assets/audio/grammar/min-dit.mp3'),
  'te-dit': require('../../assets/audio/grammar/te-dit.mp3'),
  'wi-dit': require('../../assets/audio/grammar/wi-dit.mp3'),
  'we-female-dit': require('../../assets/audio/grammar/we-female-dit.mp3'),
  'me-dit': require('../../assets/audio/grammar/me-dit.mp3'),
  'we-dit': require('../../assets/audio/grammar/we-dit.mp3'),
  'wan-dit': require('../../assets/audio/grammar/wan-dit.mp3'),
  // Simple conjugations - bihîst (to hear)
  'min-bihist': require('../../assets/audio/grammar/min-bihist.mp3'),
  'te-bihist': require('../../assets/audio/grammar/te-bihist.mp3'),
  'wi-bihist': require('../../assets/audio/grammar/wi-bihist.mp3'),
  'we-female-bihist': require('../../assets/audio/grammar/we-female-bihist.mp3'),
  'me-bihist': require('../../assets/audio/grammar/me-bihist.mp3'),
  'we-bihist': require('../../assets/audio/grammar/we-bihist.mp3'),
  'wan-bihist': require('../../assets/audio/grammar/wan-bihist.mp3'),
  // Simple conjugations - axaft (to speak)
  'min-axaft': require('../../assets/audio/grammar/min-axaft.mp3'),
  'te-axaft': require('../../assets/audio/grammar/te-axaft.mp3'),
  'wi-axaft': require('../../assets/audio/grammar/wi-axaft.mp3'),
  'we-female-axaft': require('../../assets/audio/grammar/we-female-axaft.mp3'),
  'me-axaft': require('../../assets/audio/grammar/me-axaft.mp3'),
  'we-axaft': require('../../assets/audio/grammar/we-axaft.mp3'),
  'wan-axaft': require('../../assets/audio/grammar/wan-axaft.mp3'),
  // Examples with objects
  'min-nan-xwar': require('../../assets/audio/grammar/min-nan-xwar.mp3'),
  'te-pirtuk-xwend': require('../../assets/audio/grammar/te-pirtuk-xwend.mp3'),
  'wi-cu-male': require('../../assets/audio/grammar/wi-cu-male.mp3'),
  'min-iro-ci-kir': require('../../assets/audio/grammar/min-iro-ci-kir.mp3'),
  'te-caye-vexwar': require('../../assets/audio/grammar/te-caye-vexwar.mp3'),
  'we-pirtukek-kiri': require('../../assets/audio/grammar/we-pirtukek-kiri.mp3'),
  'min-cu-bazare': require('../../assets/audio/grammar/min-cu-bazare.mp3'),
  'te-iro-ci-kir': require('../../assets/audio/grammar/te-iro-ci-kir.mp3'),
  'wi-ku-cu': require('../../assets/audio/grammar/wi-ku-cu.mp3'),
  'min-ci-kir': require('../../assets/audio/grammar/min-ci-kir.mp3'),
  // Negative forms
  'min-nexwar': require('../../assets/audio/grammar/min-nexwar.mp3'),
  'te-nexwar': require('../../assets/audio/grammar/te-nexwar.mp3'),
  'wi-nexwar': require('../../assets/audio/grammar/wi-nexwar.mp3'),
  'me-nexwar': require('../../assets/audio/grammar/me-nexwar.mp3'),
  // Questions
  'te-ci-xwar': require('../../assets/audio/grammar/te-ci-xwar.mp3'),
  'wi-cu-ku-dere': require('../../assets/audio/grammar/wi-cu-ku-dere.mp3'),
  'tu-kengi-hati': require('../../assets/audio/grammar/tu-kengi-hati.mp3'),
  'ew-hatin': require('../../assets/audio/grammar/ew-hatin.mp3'),
};

export default function SimplePastPage() {
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
    totalAudios: 20, // Total unique audios in pastTenseExamples
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
    console.log('🚀 Simple-Past page mounted, initial progress:', {
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

  const playAudio = async (audioKey: string, audioText: string, actualAudioFile?: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Extract actual audio file name from audioKey
      let audioFileToLookup = actualAudioFile || audioKey;
      if (audioKey.includes('-')) {
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'example' || parts[0] === 'conjugation' || parts[0] === 'verb')) {
          // For verb-* keys, we want to use the audioText to generate the filename
          if (parts[0] === 'verb' && audioText) {
            // Special handling for "verb-we-female-{index}" (Wê/she) to avoid conflict with "verb-we-{index}" (We/you plural)
            if (parts.length >= 4 && parts[1] === 'we' && parts[2] === 'female') {
              // For Wê (she), use "we-female-{verb}" format
              const verbIndex = parseInt(parts[parts.length - 1]);
              if (!isNaN(verbIndex) && commonVerbs[verbIndex]) {
                const verb = commonVerbs[verbIndex];
                audioFileToLookup = `we-female-${getAudioFilename(verb.past)}`;
              } else {
                audioFileToLookup = getAudioFilename(audioText);
              }
            } else {
              audioFileToLookup = getAudioFilename(audioText);
            }
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
      
      // Track unique audios played (only count new ones) - use audioKey as identifier
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

  // Calculate total examples count for Learn progress
  const totalExamples = pastTenseExamples.reduce((sum, section) => sum + section.examples.length, 0);
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

  const progress = getLessonProgress(LESSON_ID);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Simple Past Tense</Text>
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
              {progress.score !== undefined ? `${Math.round(progress.score)}%` : (progress.status === 'COMPLETED' ? 'Done' : 'Pending')}
            </Text>
          </View>
        </View>

      {/* Segmented Control - Mode Toggle */}
      <View style={styles.segmentedControl}>
        <Pressable
          onPress={() => {
            setMode('learn');
            setCurrentExercise(0);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setScore({ correct: 0, total: 0 });
            setIsCompleted(false);
          }}
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
          onPress={() => {
            setMode('practice');
            setCurrentExercise(0);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setScore({ correct: 0, total: 0 });
            setIsCompleted(false);
          }}
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
            {/* How Past Tense Works */}
            <View style={[styles.sectionCard, styles.howItWorksCard]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>💡</Text>
                <Text style={styles.sectionTitle}>How Past Tense Works in Kurdish</Text>
              </View>
              <View style={styles.howItWorksContent}>
                <Text style={styles.howItWorksText}>
                  In Kurdish, past tense is different from present tense in two important ways:{' '}
                  <Text style={styles.howItWorksBold}>different pronouns</Text> and{' '}
                  <Text style={styles.howItWorksBold}>different verb forms</Text>.
                </Text>
                
                <View style={styles.howItWorksBox}>
                  <Text style={styles.howItWorksBoxTitle}>The Structure:</Text>
                  <Text style={styles.howItWorksStructure}>
                    <Text style={styles.howItWorksHighlight}>Past Pronoun</Text> + past verb form
                  </Text>
                  
                  <View style={styles.howItWorksStep}>
                    <Text style={styles.howItWorksStepTitle}>Step 1: Use past tense pronouns (different from present tense!)</Text>
                    <View style={styles.howItWorksStepBox}>
                      <Text style={styles.howItWorksStepText}>Present: Ez, Tu, Ew</Text>
                      <Text style={styles.howItWorksStepTextBold}>Past:</Text>
                      <Text style={styles.howItWorksStepItem}>• <Text style={styles.howItWorksStepBold}>Min</Text> (I) - instead of "Ez"</Text>
                      <Text style={styles.howItWorksStepItem}>• <Text style={styles.howItWorksStepBold}>Te</Text> (You) - instead of "Tu"</Text>
                      <Text style={styles.howItWorksStepItem}>• <Text style={styles.howItWorksStepBold}>Wî</Text> (He) / <Text style={styles.howItWorksStepBold}>Wê</Text> (She) - instead of "Ew"</Text>
                    </View>
                  </View>
                  
                  <View style={styles.howItWorksStep}>
                    <Text style={styles.howItWorksStepTitle}>Step 2: Change the verb to its past form</Text>
                    <Text style={styles.howItWorksExample}>
                      Example: <Text style={styles.howItWorksBold}>xwarin</Text> (to eat) → <Text style={styles.howItWorksHighlight}>xwar</Text> (ate)
                    </Text>
                    <Text style={styles.howItWorksExample}>
                      Example: <Text style={styles.howItWorksBold}>çûn</Text> (to go) → <Text style={styles.howItWorksHighlight}>çû</Text> (went)
                    </Text>
                  </View>
                </View>
                
                <View style={styles.howItWorksBox}>
                  <Text style={styles.howItWorksBoxTitle}>Complete Examples:</Text>
                  <Text style={styles.howItWorksExampleItem}>• <Text style={styles.howItWorksBold}>Min xwar</Text> = I ate (not "Ez xwar")</Text>
                  <Text style={styles.howItWorksExampleItem}>• <Text style={styles.howItWorksBold}>Te çû</Text> = You went (not "Tu çû")</Text>
                  <Text style={styles.howItWorksExampleItem}>• <Text style={styles.howItWorksBold}>Wî kir</Text> = He did (not "Ew kir")</Text>
                </View>
                
                <View style={styles.howItWorksNote}>
                  <Text style={styles.howItWorksNoteText}>
                    <Text style={styles.howItWorksNoteBold}>💡 Important:</Text> Always remember to use <Text style={styles.howItWorksBold}>Min/Te/Wî</Text> for past tense, never <Text style={styles.howItWorksBold}>Ez/Tu/Ew</Text>! The verb form also changes - it becomes shorter and simpler.
                  </Text>
                </View>
              </View>
            </View>

            {/* Pronoun Comparison Table */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🔄</Text>
                <Text style={styles.sectionTitle}>Pronoun Comparison: Present vs Past</Text>
              </View>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>English</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Present Tense</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Past Tense</Text>
                </View>
                {pronounComparison.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1 }]}>{row.en}</Text>
                    <Text style={[styles.tableCell, { flex: 1, fontWeight: '700', color: '#3b82f6' }]}>{row.present}</Text>
                    <Text style={[styles.tableCell, { flex: 1, fontWeight: '700', color: '#111827' }]}>{row.past}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.tableNote}>
                <Text style={styles.tableNoteBold}>⚠️ Remember:</Text> Past tense uses completely different pronouns! This is the most important thing to remember.
              </Text>
            </View>

            {/* Conjugation Table */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📊</Text>
                <Text style={styles.sectionTitle}>Conjugation Table - Verb "xwarin" (to eat)</Text>
              </View>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Pronoun</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]}>Kurdish</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.3 }]}>English</Text>
                </View>
                {conjugationTable.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1.2 }]}>
                      <Text style={[styles.tableCellText, { fontWeight: '700', color: '#111827' }]}>{row.pronoun}</Text>
                      <Text style={[styles.tableCellText, { fontSize: 12, color: '#6b7280' }]}> ({row.pronounEn})</Text>
                    </View>
                    <Text style={[styles.tableCell, { flex: 1.5, fontFamily: 'monospace', color: '#111827' }]}>
                      {row.pronoun} {row.example}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.3 }]}>{row.exampleEn}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.tableNote}>
                <Text style={styles.tableNoteBold}>Note:</Text> Notice how the verb form "xwar" stays the same for all pronouns, but the pronouns are different from present tense!
              </Text>
            </View>

            {/* Common Verbs - Card Layout */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📚</Text>
                <Text style={styles.sectionTitle}>Common Verbs in Past Tense</Text>
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
                        <Text style={styles.verbPronoun} numberOfLines={1}>Min:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Min {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-min-${verbIndex}`, `Min ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-min-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Te:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Te {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-te-${verbIndex}`, `Te ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-te-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Wî:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Wî {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-wi-${verbIndex}`, `Wî ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-wi-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Wê:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Wê {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-we-female-${verbIndex}`, `Wê ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-we-female-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Me:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Me {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-me-${verbIndex}`, `Me ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-me-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={styles.verbConjugationRow}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>We:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>We {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-we-${verbIndex}`, `We ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-we-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.verbRowSeparator} />
                      <View style={[styles.verbConjugationRow, { marginBottom: 0 }]}>
                        <Text style={styles.verbPronoun} numberOfLines={1}>Wan:</Text>
                        <Text style={styles.verbConjugation} numberOfLines={1}>Wan {verb.past}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-wan-${verbIndex}`, `Wan ${verb.past}`)}
                          style={[styles.audioButtonContainer, { marginLeft: 8 }]}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name={playingAudio === `verb-wan-${verbIndex}` ? "volume-high" : "volume-low-outline"}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
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
            {pastTenseExamples.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.examplesGrid}>
                  {section.examples.map((example, exampleIndex) => {
                    const audioKey = `example-${sectionIndex}-${exampleIndex}`;
                    const audioText = example.audioText || example.ku;
                    return (
                      <View key={exampleIndex} style={styles.exampleCard}>
                        <View style={styles.exampleContent}>
                          <Text style={styles.exampleKurdish}>{example.ku}</Text>
                          <Text style={styles.exampleEnglish}>{example.en}</Text>
                        </View>
                        {example.audio && (
                          <Pressable
                            onPress={() => playAudio(audioKey, audioText)}
                            style={styles.audioButtonContainer}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name={playingAudio === audioKey ? 'volume-high' : 'volume-low-outline'}
                              size={20}
                              color="#4b5563"
                            />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
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

                <Text style={styles.practiceQuestion}>
                  {practiceExercises[currentExercise].question}
                </Text>
                
                <View style={styles.optionsList}>
                  {practiceExercises[currentExercise].options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === practiceExercises[currentExercise].correct;
                    const showResult = showFeedback;
                    
                    return (
                      <Pressable
                        key={index}
                        onPress={() => handleAnswerSelect(index)}
                        disabled={showFeedback}
                        style={({ pressed }) => [
                          styles.optionButton,
                          showResult && isCorrect && styles.optionButtonCorrect,
                          showResult && isSelected && !isCorrect && styles.optionButtonWrong,
                          isSelected && !showResult && styles.optionButtonSelected,
                          pressed && !showFeedback && styles.pressed,
                        ]}
                      >
                        <View style={styles.optionContent}>
                          {showResult && isCorrect && (
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                          )}
                          <Text style={styles.optionText}>{option}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {showFeedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackTitle}>Explanation:</Text>
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
  progressBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  pressed: { opacity: 0.6 },
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
  sectionTitleInline: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    flexShrink: 1,
  },
  howItWorksCard: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
    borderWidth: 2,
  },
  howItWorksContent: {
    gap: 16,
  },
  howItWorksText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  howItWorksBold: {
    fontWeight: '700',
    color: '#111827',
  },
  howItWorksBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 12,
  },
  howItWorksBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  howItWorksStructure: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 12,
  },
  howItWorksHighlight: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '700',
  },
  howItWorksStep: {
    gap: 8,
  },
  howItWorksStepTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  howItWorksStepBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 4,
  },
  howItWorksStepText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  howItWorksStepTextBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  howItWorksStepItem: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    marginBottom: 2,
  },
  howItWorksStepBold: {
    fontWeight: '700',
    color: '#111827',
  },
  howItWorksExample: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#111827',
    marginTop: 4,
  },
  howItWorksExampleItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  howItWorksNote: {
    backgroundColor: '#fed7aa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  howItWorksNoteText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  howItWorksNoteBold: {
    fontWeight: '700',
    color: '#111827',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 2,
    borderBottomColor: '#d1fae5',
  },
  tableHeaderCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: '700',
    color: '#111827',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
  },
  tableCellText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tableNote: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
  tableNoteBold: {
    fontWeight: '700',
    color: '#111827',
  },
  verbsTableScrollView: {
    marginHorizontal: -16,
  },
  verbsTableScrollContent: {
    paddingHorizontal: 0,
  },
  verbsTableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    width: width - 32, // Full width minus scrollContent padding (16*2)
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
  mistakeLabelCorrect: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    marginRight: 8,
  },
  mistakeWrong: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#dc2626',
    textDecorationLine: 'line-through',
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
    lineHeight: 20,
    marginTop: 4,
  },
  examplesGrid: {
    gap: 12,
    marginTop: 12,
  },
  exampleCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleContent: {
    flex: 1,
    marginRight: 8,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '600',
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
    padding: 16,
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
    fontSize: 18,
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
  practiceQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#eff6ff',
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
    fontFamily: 'monospace',
    color: '#111827',
    flex: 1,
  },
  feedbackContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#1e3a8a',
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
    color: '#10b981',
  },
  completionTotal: {
    fontWeight: '700',
    color: '#111827',
  },
  completionPercentage: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3A86FF',
    marginTop: 8,
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

