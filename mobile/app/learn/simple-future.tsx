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
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { restoreRefsFromProgress, getLearnedCount } from '../../lib/utils/progressHelper';
import { useLessonProgressTimer } from '../../lib/utils/useLessonProgressTimer';

const { width } = Dimensions.get('window');

const LESSON_ID = '17'; // Simple Future Tense lesson ID

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
  { pronoun: "Ez", pronounEn: "I", example: "ê bixwim", exampleEn: "I will eat" },
  { pronoun: "Tu", pronounEn: "You", example: "ê bixwî", exampleEn: "You will eat" },
  { pronoun: "Ew", pronounEn: "He/She", example: "ê bixwe", exampleEn: "He/She will eat" },
  { pronoun: "Em", pronounEn: "We", example: "ê bixwin", exampleEn: "We will eat" },
  { pronoun: "Hûn", pronounEn: "You (plural)", example: "ê bixwin", exampleEn: "You will eat" },
  { pronoun: "Ewan", pronounEn: "They", example: "ê bixwin", exampleEn: "They will eat" }
];

const commonVerbs = [
  { infinitive: "xwarin", en: "to eat", ez: "bixwim", tu: "bixwî", ew: "bixwe", em: "bixwin", hun: "bixwin", ewan: "bixwin" },
  { infinitive: "çûn", en: "to go", ez: "biçim", tu: "biçî", ew: "biçe", em: "biçin", hun: "biçin", ewan: "biçin" },
  { infinitive: "kirin", en: "to do", ez: "bikim", tu: "bikî", ew: "bike", em: "bikin", hun: "bikin", ewan: "bikin" },
  { infinitive: "xwendin", en: "to read", ez: "bixwînim", tu: "bixwînî", ew: "bixwîne", em: "bixwînin", hun: "bixwînin", ewan: "bixwînin" },
  { infinitive: "hatin", en: "to come", ez: "werim", tu: "werî", ew: "bê", em: "werin", hun: "werin", ewan: "werin" },
  { infinitive: "dîtin", en: "to see", ez: "bibînim", tu: "bibînî", ew: "bibîne", em: "bibînin", hun: "bibînin", ewan: "bibînin" },
  { infinitive: "bihîstin", en: "to hear", ez: "bibihîzim", tu: "bibihîzî", ew: "bibihîze", em: "bibihîzin", hun: "bibihîzin", ewan: "bibihîzin" },
  { infinitive: "axaftin", en: "to speak", ez: "biaxevim", tu: "biaxevî", ew: "biaxeve", em: "biaxevin", hun: "biaxevin", ewan: "biaxevin" }
];

const futureTenseExamples = [
  {
    title: 'Future Plans',
    examples: [
      { ku: "Ez ê sibê biçim malê.", en: "I will go home tomorrow", audio: true, audioText: "Ez ê sibê biçim malê" },
      { ku: "Tu ê pirtûk bixwînî.", en: "You will read a book", audio: true, audioText: "Tu ê pirtûk bixwînî" },
      { ku: "Ew ê nan bixwe.", en: "He/She will eat bread", audio: true, audioText: "Ew ê nan bixwe" },
      { ku: "Em ê biçin bazarê.", en: "We will go to the market", audio: true, audioText: "Em ê biçin bazarê" },
      { ku: "Hûn ê çay vexwin.", en: "You will drink tea", audio: true, audioText: "Hûn ê çay vexwin" },
      { ku: "Ewan ê werin.", en: "They will come", audio: true, audioText: "Ewan ê werin" }
    ]
  },
  {
    title: 'More Examples with Different Verbs',
    examples: [
      { ku: "Ez ê bibînim", en: "I will see", audio: true },
      { ku: "Tu ê bibihîzî", en: "You will hear", audio: true },
      { ku: "Ew ê biaxeve", en: "He/She will speak", audio: true },
      { ku: "Em ê bikin", en: "We will do", audio: true },
      { ku: "Ew ê bê", en: "He/She will come", audio: true },
      { ku: "Ez ê sibê biçim dibistanê", en: "I will go to school tomorrow", audio: true }
    ]
  },
  {
    title: 'Negative Form',
    examples: [
      { ku: "Ez ê nexwim.", en: "I will not eat", audio: true, audioText: "Ez ê nexwim" },
      { ku: "Tu ê nexwî.", en: "You will not eat", audio: true, audioText: "Tu ê nexwî" },
      { ku: "Ew ê nexwe.", en: "He/She will not eat", audio: true, audioText: "Ew ê nexwe" },
      { ku: "Em ê nexwin.", en: "We will not eat", audio: true, audioText: "Em ê nexwin" }
    ]
  },
  {
    title: 'Questions',
    examples: [
      { ku: "Tu ê çi bixwî?", en: "What will you eat?", audio: true },
      { ku: "Ew ê biçe ku derê?", en: "Where will he/she go?", audio: true, audioText: "Ew ê biçe ku derê" },
      { ku: "Tu ê kengî werî?", en: "When will you come?", audio: true },
      { ku: "Ez ê çi bikim?", en: "What should I do?", audio: true }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "Ez bixwim",
    correct: "Ez ê bixwim",
    explanation: "Don't forget 'ê'! Future tense needs both 'ê' after the subject AND 'bi-' prefix before the verb."
  },
  {
    wrong: "Ez ê dixwim",
    correct: "Ez ê bixwim",
    explanation: "Future tense uses 'bi-' prefix, not 'di-'. 'di-' is for present tense only."
  },
  {
    wrong: "Ez bixwar",
    correct: "Ez ê bixwim",
    explanation: "Future tense needs 'ê' after the subject, and the verb ending changes based on the subject (-im for Ez)."
  },
  {
    wrong: "Tu ê bixwar",
    correct: "Tu ê bixwî",
    explanation: "The ending for 'Tu' (You) is '-î', not '-ar'. Remember: Tu → -î ending."
  }
];

// Practice exercises
const practiceExercises = [
  {
    question: "How do you say 'I will eat' in Kurdish?",
    options: ["Ez dixwim", "Ez ê bixwim", "Min xwar", "Ez bixwar"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- prefix + verb root + -im ending = Ez ê bixwim"
  },
  {
    question: "What is the correct future tense form for 'You will go'?",
    options: ["Tu diçî", "Tu ê biçî", "Te çû", "Tu biçe"],
    correct: 1,
    explanation: "Future tense: Tu + ê + bi- + ç + -î = Tu ê biçî"
  },
  {
    question: "Which two components are needed for future tense?",
    options: ["di- prefix only", "ê and bi- prefix", "bi- prefix only", "ê only"],
    correct: 1,
    explanation: "Future tense requires BOTH 'ê' (after subject) AND 'bi-' prefix (before verb). Both are essential!"
  },
  {
    question: "How do you say 'We will not eat'?",
    options: ["Em ê nexwin", "Em naxwin", "Em nexwar", "Em ê naxwin"],
    correct: 0,
    explanation: "Future negative: Em + ê + ne- (instead of bi-) + xw + -in = Em ê nexwin"
  },
  {
    question: "What prefix is used for future tense?",
    options: ["di-", "bi-", "ê", "no prefix"],
    correct: 1,
    explanation: "Future tense uses 'bi-' prefix before the verb root. Remember: bi- = future, di- = present"
  },
  {
    question: "How do you say 'I will read' in future tense?",
    options: ["Ez xwend", "Ez ê bixwînim", "Ez dixwînim", "Min xwend"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- + xwên + -im = Ez ê bixwînim"
  },
  {
    question: "What is 'Tu ê bixwî' in English?",
    options: ["I will eat", "You will eat", "He will eat", "We will eat"],
    correct: 1,
    explanation: "Tu = You, ê = will, bixwî = will eat (future tense with -î ending for Tu)"
  },
  {
    question: "Which is correct for 'She will read'?",
    options: ["Ew ê bixwîne", "Wê bixwîne", "Ew dixwîne", "Wê dixwîne"],
    correct: 0,
    explanation: "Future tense: Ew + ê + bi- + xwên + -e = Ew ê bixwîne"
  },
  {
    question: "How do you say 'They will go' in future tense?",
    options: ["Ewan ê biçin", "Wan biçin", "Ewan diçin", "Wan çû"],
    correct: 0,
    explanation: "Future tense: Ewan + ê + bi- + ç + -in = Ewan ê biçin"
  },
  {
    question: "What is the negative form of 'Ez ê bixwim'?",
    options: ["Ez ê nexwim", "Ez naxwim", "Ez nexwar", "Min nexwar"],
    correct: 0,
    explanation: "Future negative: Replace 'bi-' with 'ne-' = Ez ê nexwim"
  },
  {
    question: "Which ending is used for 'Em' (We) in future tense?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "Em (We) always uses '-in' ending in future tense (same as present)"
  },
  {
    question: "How do you say 'I will do' in future tense?",
    options: ["Ez dikim", "Ez ê bikim", "Min kir", "Ez bikim"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- + kir + -im = Ez ê bikim"
  },
  {
    question: "What is 'Ew ê biçe' in English?",
    options: ["I will go", "You will go", "He/She will go", "We will go"],
    correct: 2,
    explanation: "Ew = He/She, ê = will, biçe = will go (future tense with -e ending)"
  },
  {
    question: "How do you say 'You will read' in future tense?",
    options: ["Tu xwend", "Tu ê bixwînî", "Te xwend", "Tu dixwînî"],
    correct: 1,
    explanation: "Future tense: Tu + ê + bi- + xwên + -î = Tu ê bixwînî"
  },
  {
    question: "Which is the correct structure for future tense?",
    options: ["Subject + verb", "Subject + di- + verb", "Subject + ê + bi- + verb + ending", "Subject + past verb"],
    correct: 2,
    explanation: "Future tense structure: Subject + ê + bi- prefix + verb root + personal ending"
  },
  {
    question: "How do you say 'We will eat' in future tense?",
    options: ["Em dixwin", "Em ê bixwin", "Me xwar", "Em bixwin"],
    correct: 1,
    explanation: "Future tense: Em + ê + bi- + xw + -in = Em ê bixwin"
  },
  {
    question: "What is the negative of 'Tu ê biçî'?",
    options: ["Tu ê neçî", "Tu neçî", "Te çû", "Tu naxwî"],
    correct: 0,
    explanation: "Future negative: Replace 'bi-' with 'ne-' = Tu ê neçî"
  },
  {
    question: "Which pronoun uses '-î' ending in future tense?",
    options: ["Ez", "Tu", "Ew", "Em"],
    correct: 1,
    explanation: "Tu (You) always uses '-î' ending in future tense (same as present)"
  },
  {
    question: "How do you say 'I will see' in future tense?",
    options: ["Ez dît", "Ez ê bibînim", "Min dît", "Ez dibînim"],
    correct: 1,
    explanation: "Future tense: Ez + ê + bi- + bîn + -im = Ez ê bibînim"
  },
  {
    question: "What is 'Hûn ê bixwin' in English?",
    options: ["I will eat", "You will eat (singular)", "You will eat (plural)", "They will eat"],
    correct: 2,
    explanation: "Hûn = You (plural), ê = will, bixwin = will eat (future tense with -in ending)"
  },
  {
    question: "What happens if you forget 'ê' in future tense?",
    options: ["It becomes present tense", "It becomes past tense", "It's incorrect", "All of the above"],
    correct: 2,
    explanation: "Both 'ê' and 'bi-' are required for future tense. Without 'ê', it's grammatically incorrect."
  }
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  // Future Plans
  'ez-e-sibe-bicim-male': require('../../assets/audio/grammar/ez-e-sibe-bicim-male.mp3'),
  'tu-e-pirtuk-bixwini': require('../../assets/audio/grammar/tu-e-pirtuk-bixwini.mp3'),
  'ew-e-nan-bixwe': require('../../assets/audio/grammar/ew-e-nan-bixwe.mp3'),
  'em-e-bicin-bazare': require('../../assets/audio/grammar/em-e-bicin-bazare.mp3'),
  'hun-e-cay-vexwin': require('../../assets/audio/grammar/hun-e-cay-vexwin.mp3'),
  'ewan-e-werin': require('../../assets/audio/grammar/ewan-e-werin.mp3'),
  // More Examples
  'ez-e-bibinim': require('../../assets/audio/grammar/ez-e-bibinim.mp3'),
  'tu-e-bibihizi': require('../../assets/audio/grammar/tu-e-bibihizi.mp3'),
  'ew-e-biaxeve': require('../../assets/audio/grammar/ew-e-biaxeve.mp3'),
  'em-e-bikin': require('../../assets/audio/grammar/em-e-bikin.mp3'),
  'ew-e-be': require('../../assets/audio/grammar/ew-e-be.mp3'),
  'ez-e-sibe-bicim-dibistane': require('../../assets/audio/grammar/ez-e-sibe-bicim-dibistane.mp3'),
  // Negative Form
  'ez-e-nexwim': require('../../assets/audio/grammar/ez-e-nexwim.mp3'),
  'tu-e-nexwi': require('../../assets/audio/grammar/tu-e-nexwi.mp3'),
  'ew-e-nexwe': require('../../assets/audio/grammar/ew-e-nexwe.mp3'),
  'em-e-nexwin': require('../../assets/audio/grammar/em-e-nexwin.mp3'),
  // Questions
  'tu-e-ci-bixwi': require('../../assets/audio/grammar/tu-e-ci-bixwi.mp3'),
  'ew-e-bice-ku-dere': require('../../assets/audio/grammar/ew-e-bice-ku-dere.mp3'),
  'tu-e-kengi-weri': require('../../assets/audio/grammar/tu-e-kengi-weri.mp3'),
  'ez-e-ci-bikim': require('../../assets/audio/grammar/ez-e-ci-bikim.mp3'),
  // Common Verbs Infinitives
  'xwarin': require('../../assets/audio/grammar/xwarin.mp3'),
  'cun': require('../../assets/audio/grammar/cun.mp3'),
  'kirin': require('../../assets/audio/grammar/kirin.mp3'),
  'xwendin': require('../../assets/audio/grammar/xwendin.mp3'),
  'hatin': require('../../assets/audio/grammar/hatin.mp3'),
  'ditin': require('../../assets/audio/grammar/ditin.mp3'),
  'bihistin': require('../../assets/audio/grammar/bihistin.mp3'),
  'axaftin': require('../../assets/audio/grammar/axaftin.mp3'),
  // Common Verbs Conjugations - xwarin
  'ez-e-bixwim': require('../../assets/audio/grammar/ez-e-bixwim.mp3'),
  'tu-e-bixwi': require('../../assets/audio/grammar/tu-e-bixwi.mp3'),
  'ew-e-bixwe': require('../../assets/audio/grammar/ew-e-bixwe.mp3'),
  'em-e-bixwin': require('../../assets/audio/grammar/em-e-bixwin.mp3'),
  'hun-e-bixwin': require('../../assets/audio/grammar/hun-e-bixwin.mp3'),
  'ewan-e-bixwin': require('../../assets/audio/grammar/ewan-e-bixwin.mp3'),
  // Common Verbs Conjugations - çûn
  'ez-e-bicim': require('../../assets/audio/grammar/ez-e-bicim.mp3'),
  'tu-e-bici': require('../../assets/audio/grammar/tu-e-bici.mp3'),
  'ew-e-bice': require('../../assets/audio/grammar/ew-e-bice.mp3'),
  'em-e-bicin': require('../../assets/audio/grammar/em-e-bicin.mp3'),
  'hun-e-bicin': require('../../assets/audio/grammar/hun-e-bicin.mp3'),
  'ewan-e-bicin': require('../../assets/audio/grammar/ewan-e-bicin.mp3'),
  // Common Verbs Conjugations - kirin
  'ez-e-bikim': require('../../assets/audio/grammar/ez-e-bikim.mp3'),
  'tu-e-biki': require('../../assets/audio/grammar/tu-e-biki.mp3'),
  'ew-e-bike': require('../../assets/audio/grammar/ew-e-bike.mp3'),
  'em-e-bikin': require('../../assets/audio/grammar/em-e-bikin.mp3'),
  'hun-e-bikin': require('../../assets/audio/grammar/hun-e-bikin.mp3'),
  'ewan-e-bikin': require('../../assets/audio/grammar/ewan-e-bikin.mp3'),
  // Common Verbs Conjugations - xwendin
  'ez-e-bixwinim': require('../../assets/audio/grammar/ez-e-bixwinim.mp3'),
  'tu-e-bixwini': require('../../assets/audio/grammar/tu-e-bixwini.mp3'),
  'ew-e-bixwine': require('../../assets/audio/grammar/ew-e-bixwine.mp3'),
  'em-e-bixwinin': require('../../assets/audio/grammar/em-e-bixwinin.mp3'),
  'hun-e-bixwinin': require('../../assets/audio/grammar/hun-e-bixwinin.mp3'),
  'ewan-e-bixwinin': require('../../assets/audio/grammar/ewan-e-bixwinin.mp3'),
  // Common Verbs Conjugations - hatin
  'ez-e-werim': require('../../assets/audio/grammar/ez-e-werim.mp3'),
  'tu-e-weri': require('../../assets/audio/grammar/tu-e-weri.mp3'),
  'ew-e-be': require('../../assets/audio/grammar/ew-e-be.mp3'),
  'em-e-werin': require('../../assets/audio/grammar/em-e-werin.mp3'),
  'hun-e-werin': require('../../assets/audio/grammar/hun-e-werin.mp3'),
  'ewan-e-werin': require('../../assets/audio/grammar/ewan-e-werin.mp3'),
  // Common Verbs Conjugations - dîtin
  'ez-e-bibinim': require('../../assets/audio/grammar/ez-e-bibinim.mp3'),
  'tu-e-bibini': require('../../assets/audio/grammar/tu-e-bibini.mp3'),
  'ew-e-bibine': require('../../assets/audio/grammar/ew-e-bibine.mp3'),
  'em-e-bibinin': require('../../assets/audio/grammar/em-e-bibinin.mp3'),
  'hun-e-bibinin': require('../../assets/audio/grammar/hun-e-bibinin.mp3'),
  'ewan-e-bibinin': require('../../assets/audio/grammar/ewan-e-bibinin.mp3'),
  // Common Verbs Conjugations - bihîstin
  'ez-e-bibihizim': require('../../assets/audio/grammar/ez-e-bibihizim.mp3'),
  'tu-e-bibihizi': require('../../assets/audio/grammar/tu-e-bibihizi.mp3'),
  'ew-e-bibihize': require('../../assets/audio/grammar/ew-e-bibihize.mp3'),
  'em-e-bibihizin': require('../../assets/audio/grammar/em-e-bibihizin.mp3'),
  'hun-e-bibihizin': require('../../assets/audio/grammar/hun-e-bibihizin.mp3'),
  'ewan-e-bibihizin': require('../../assets/audio/grammar/ewan-e-bibihizin.mp3'),
  // Common Verbs Conjugations - axaftin
  'ez-e-biaxevim': require('../../assets/audio/grammar/ez-e-biaxevim.mp3'),
  'tu-e-biaxevi': require('../../assets/audio/grammar/tu-e-biaxevi.mp3'),
  'ew-e-biaxeve': require('../../assets/audio/grammar/ew-e-biaxeve.mp3'),
  'em-e-biaxevin': require('../../assets/audio/grammar/em-e-biaxevin.mp3'),
  'hun-e-biaxevin': require('../../assets/audio/grammar/hun-e-biaxevin.mp3'),
  'ewan-e-biaxevin': require('../../assets/audio/grammar/ewan-e-biaxevin.mp3'),
};

export default function SimpleFuturePage() {
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
    totalAudios: 20, // Total unique audios in futureTenseExamples
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
    console.log('🚀 Simple-Future page mounted, initial progress:', {
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

      const audioFilename = getAudioFilename(audioText || audioKey);
      const audioAsset = audioAssets[audioFilename];

      if (!audioAsset) {
        console.warn(`Audio file not found: ${audioFilename}. Audio files will be generated/copied later.`);
        return;
      }

      setPlayingAudio(audioKey);
      const { sound: newSound } = await Audio.Sound.createAsync(audioAsset, { shouldPlay: true });
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          newSound.unloadAsync();
        }
      });

      if (!uniqueAudiosPlayedRef.current.has(audioKey)) {
        uniqueAudiosPlayedRef.current.add(audioKey);
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

  useLessonProgressTimer({
    lessonId: LESSON_ID,
    startTimeRef,
    calculateProgress: () => calculateProgress(),
    getLessonProgress,
    updateLessonProgress,
  });

  const handleAnswerSelect = (index: number) => {
    if (showFeedback || isCompleted) return;
    setSelectedAnswer(index);
    setShowFeedback(true);
    const isCorrect = index === practiceExercises[currentExercise].correct;
    const newCorrect = score.correct + (isCorrect ? 1 : 0);
    setScore(prev => ({
      correct: newCorrect,
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
  const examplesWithAudio = futureTenseExamples.map(section => ({
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
  const totalExamples = futureTenseExamples.reduce((sum, section) => sum + section.examples.length, 0);
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
          <Text style={styles.headerTitle}>Simple Future Tense</Text>
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

      {/* Mode Toggle */}
      <View style={styles.segmentedControl}>
        <Pressable
          onPress={() => setMode('learn')}
          style={[
            styles.segmentedButton,
            mode === 'learn' && styles.segmentedButtonActive,
          ]}
        >
          <Text style={[
            styles.segmentedButtonText,
            mode === 'learn' && styles.segmentedButtonTextActive,
          ]}>
            Learn
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('practice')}
          style={[
            styles.segmentedButton,
            mode === 'practice' && styles.segmentedButtonActive,
          ]}
        >
          <Text style={[
            styles.segmentedButtonText,
            mode === 'practice' && styles.segmentedButtonTextActive,
          ]}>
            Practice
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mode === 'learn' ? (
          <View style={styles.content}>
            {/* How Future Tense Works */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>💡</Text>
                <Text style={styles.sectionTitle}>How Future Tense Works in Kurdish</Text>
              </View>
              <Text style={styles.sectionText}>
                In Kurdish, future tense is formed by adding <Text style={styles.highlightText}>"ê"</Text> after the subject and the prefix <Text style={styles.highlightText}>"bi-"</Text> before the verb root. This shows that the action will happen later.
              </Text>
              
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>The Structure:</Text>
                <Text style={styles.structureText}>
                  Subject + <Text style={styles.highlightBox}>ê</Text> + <Text style={styles.highlightBox}>bi-</Text> + verb root + personal ending
                </Text>
                
                <Text style={styles.stepText}>
                  <Text style={styles.stepLabel}>Step 1:</Text> Start with the subject (Ez, Tu, Ew, etc.)
                </Text>
                <Text style={styles.exampleText}>Example: <Text style={styles.boldText}>Ez</Text> (I)</Text>
                
                <Text style={styles.stepText}>
                  <Text style={styles.stepLabel}>Step 2:</Text> Add <Text style={styles.boldText}>"ê"</Text> right after the subject
                </Text>
                <Text style={styles.exampleText}>
                  <Text style={styles.boldText}>Ez</Text> + <Text style={styles.highlightBox}>ê</Text>
                </Text>
                
                <Text style={styles.stepText}>
                  <Text style={styles.stepLabel}>Step 3:</Text> Add <Text style={styles.boldText}>"bi-"</Text> prefix before the verb root
                </Text>
                <Text style={styles.exampleText}>
                  <Text style={styles.boldText}>xwarin</Text> (to eat) → root: <Text style={styles.highlightBox}>xw</Text> → <Text style={styles.highlightBox}>bi</Text>xw
                </Text>
                
                <Text style={styles.stepText}>
                  <Text style={styles.stepLabel}>Step 4:</Text> Add personal ending based on the subject
                </Text>
                <Text style={styles.exampleText}>
                  Ez <Text style={styles.highlightBox}>ê</Text> <Text style={styles.highlightBox}>bi</Text>xw<Text style={styles.boldText}>im</Text> = I will eat
                </Text>
              </View>
              
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Key Points:</Text>
                <Text style={styles.keyPointText}>• <Text style={styles.boldText}>"ê"</Text> always comes right after the subject (Ez ê, Tu ê, Ew ê)</Text>
                <Text style={styles.keyPointText}>• <Text style={styles.boldText}>"bi-"</Text> prefix always comes before the verb root</Text>
                <Text style={styles.keyPointText}>• The personal ending changes based on the subject (same as present tense)</Text>
                <Text style={styles.keyPointText}>• Both <Text style={styles.boldText}>"ê"</Text> and <Text style={styles.boldText}>"bi-"</Text> are needed together to make future tense</Text>
              </View>
              
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Personal Endings (same as present tense):</Text>
                <Text style={styles.keyPointText}>• <Text style={styles.boldText}>-im</Text> for "Ez" (I)</Text>
                <Text style={styles.keyPointText}>• <Text style={styles.boldText}>-î</Text> for "Tu" (You)</Text>
                <Text style={styles.keyPointText}>• <Text style={styles.boldText}>-e</Text> for "Ew" (He/She)</Text>
                <Text style={styles.keyPointText}>• <Text style={styles.boldText}>-in</Text> for "Em/Hûn/Ewan" (We/You/They)</Text>
              </View>
              
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  <Text style={styles.boldText}>💡 Tip:</Text> Think of <Text style={styles.boldText}>"ê"</Text> as meaning "will" and <Text style={styles.boldText}>"bi-"</Text> as the future marker. You need both to make a future sentence!
                </Text>
              </View>
            </View>

            {/* Conjugation Table */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Conjugation Table - Verb "xwarin" (to eat)</Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Pronoun</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Structure</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Kurdish</Text>
                </View>
                {conjugationTable.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.pronounText}>{row.pronoun}</Text>
                      <Text style={styles.pronounEnText}>({row.pronounEn})</Text>
                    </View>
                    <Text style={[styles.tableCell, styles.tableCellSmall, { flex: 1 }]}>
                      {row.pronoun} + ê + bi- + root + ending
                    </Text>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.tableCellKurdish}>
                        {row.pronoun} {row.example}
                      </Text>
                      <Text style={styles.tableCellEnglish}>
                        {row.exampleEn}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.tableNote}>
                <Text style={styles.tableNoteBold}>Note:</Text> Notice how all forms use both "ê" (after subject) and "bi-" prefix, but the ending changes: -im, -î, -e, -in
              </Text>
            </View>

            {/* Common Verbs Cards */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📚 Common Verbs in Future Tense</Text>
              <FlatList
                data={commonVerbs}
                keyExtractor={(item, index) => `verb-${index}`}
                renderItem={({ item: verb, index: verbIndex }) => (
                  <View style={styles.verbCard}>
                    <View style={styles.verbCardHeader}>
                      <View style={styles.verbCardHeaderLeft}>
                        <Text style={styles.verbInfinitive}>{verb.infinitive}</Text>
                        <Text style={styles.verbEn}>{verb.en}</Text>
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
                        <Text style={styles.verbConjugation} numberOfLines={1}>Ez ê {verb.ez}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-ez-${verbIndex}`, `Ez ê ${verb.ez}`)}
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
                        <Text style={styles.verbConjugation} numberOfLines={1}>Tu ê {verb.tu}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-tu-${verbIndex}`, `Tu ê ${verb.tu}`)}
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
                        <Text style={styles.verbConjugation} numberOfLines={1}>Ew ê {verb.ew}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-ew-${verbIndex}`, `Ew ê ${verb.ew}`)}
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
                        <Text style={styles.verbConjugation} numberOfLines={1}>Em ê {verb.em}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-em-${verbIndex}`, `Em ê ${verb.em}`)}
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
                        <Text style={styles.verbConjugation} numberOfLines={1}>Hûn ê {verb.hun}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-hun-${verbIndex}`, `Hûn ê ${verb.hun}`)}
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
                        <Text style={styles.verbConjugation} numberOfLines={1}>Ewan ê {verb.ewan}</Text>
                        <Pressable
                          onPress={() => playAudio(`verb-ewan-${verbIndex}`, `Ewan ê ${verb.ewan}`)}
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
                    <View style={styles.exampleContent}>
                      <Text style={styles.exampleKurdish}>{example.ku}</Text>
                      <Text style={styles.exampleEnglish}>{example.en}</Text>
                    </View>
                    {example.audio && (
                      <Pressable
                        onPress={() => playAudio(`${sectionIndex}-${exampleIndex}`, example.audioFile || example.ku)}
                        style={styles.audioButtonContainer}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={playingAudio === `${sectionIndex}-${exampleIndex}` ? "volume-high" : "volume-low-outline"}
                          size={22}
                          color="#4b5563"
                        />
                      </Pressable>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
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
                  <View style={[
                    styles.progressBar,
                    { width: `${((currentExercise + 1) / practiceExercises.length) * 100}%` }
                  ]} />
                </View>

                <Text style={styles.practiceQuestion}>
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
                          showResult
                            ? isCorrect
                              ? styles.optionButtonCorrect
                              : isSelected
                              ? styles.optionButtonIncorrect
                              : styles.optionButtonDefault
                            : isSelected
                            ? styles.optionButtonSelected
                            : styles.optionButtonDefault
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
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>
                      <Text style={styles.feedbackLabel}>Explanation:</Text> {practiceExercises[currentExercise].explanation}
                    </Text>
                  </View>
                )}

                {showFeedback && (
                  <Pressable
                    onPress={handleNext}
                    style={styles.nextButton}
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
                  style={styles.restartButton}
                >
                  <Ionicons name="refresh" size={20} color="#ffffff" />
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  segmentedButtonActive: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
    shadowColor: '#3A86FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  segmentedButtonTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  tipBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  structureText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 12,
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  stepLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  exampleText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },
  keyPointText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
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
  tableCellSmall: {
    fontSize: 11,
    color: '#6b7280',
  },
  tableCellKurdish: {
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 4,
  },
  tableCellEnglish: {
    fontSize: 13,
    color: '#6b7280',
  },
  pronounText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  pronounEnText: {
    fontSize: 12,
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
  verbCardHeaderLeft: {
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
  verbInfinitive: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  verbEn: {
    fontSize: 13,
    color: '#6b7280',
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
  exampleCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleContent: {
    flex: 1,
    flexDirection: 'column',
  },
  exampleKurdish: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
  },
  audioButtonContainer: {
    padding: 8,
    marginLeft: 12,
  },
  practiceContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  practiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3A86FF',
    borderRadius: 4,
  },
  practiceQuestion: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionButtonDefault: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3A86FF',
  },
  optionButtonCorrect: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  optionButtonIncorrect: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  feedbackContainer: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  feedbackText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  feedbackLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  nextButton: {
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  completionScore: {
    fontWeight: '700',
    color: '#111827',
  },
  completionTotal: {
    fontWeight: '700',
    color: '#111827',
  },
  completionPercentage: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

