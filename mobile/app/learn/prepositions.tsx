import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { Asset } from 'expo-asset';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { restoreRefsFromProgress, getLearnedCount } from '../../lib/utils/progressHelper';

const { width } = Dimensions.get('window');

const LESSON_ID = '22'; // Prepositions lesson ID

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

// Prepositions reference table
const prepositionsTable = [
  { ku: "li", en: "at/in/on", example: "li malê", exampleEn: "at home", usage: "Location - where something is" },
  { ku: "ji", en: "from", example: "ji Kurdistanê", exampleEn: "from Kurdistan", usage: "Origin or source" },
  { ku: "bi", en: "with", example: "bi min re", exampleEn: "with me", usage: "Accompaniment (needs 're' after pronoun)" },
  { ku: "bo", en: "for", example: "bo te", exampleEn: "for you", usage: "Purpose or recipient" },
  { ku: "ber", en: "before/in front of", example: "ber malê", exampleEn: "in front of the house", usage: "Position - in front" },
  { ku: "paş", en: "behind/after", example: "paş malê", exampleEn: "behind the house", usage: "Position - behind or time after" },
  { ku: "di...de", en: "in/inside", example: "di odeyê de", exampleEn: "in the room", usage: "Inside something (wraps around noun)" },
  { ku: "li ser", en: "on/on top of", example: "li ser maseyê", exampleEn: "on the table", usage: "Position - on top" }
];

const presentTenseExamples = [
  {
    title: 'Location - "li" (at/in/on)',
    examples: [
      { ku: "Li malê.", en: "at home", audio: true, audioText: "Li malê." },
      { ku: "Li dibistanê.", en: "at school", audio: true, audioText: "Li dibistanê." },
      { ku: "Li bazarê.", en: "at the market", audio: true, audioText: "Li bazarê." },
      { ku: "Ez li malê me.", en: "I am at home", audio: true, audioText: "Ez li malê me" },
      { ku: "Tu li ku yî?", en: "Where are you?", audio: true, audioText: "Tu li ku yî?" },
      { ku: "Ew li Kurdistanê ye.", en: "He/She is in Kurdistan", audio: true, audioText: "Ew li Kurdistanê ye" }
    ]
  },
  {
    title: 'Origin - "ji" (from)',
    examples: [
      { ku: "Ji Kurdistanê.", en: "from Kurdistan", audio: true, audioText: "Ji Kurdistanê." },
      { ku: "Ji malê.", en: "from home", audio: true, audioText: "Ji malê." },
      { ku: "Ji bazarê.", en: "from the market", audio: true, audioText: "Ji bazarê." },
      { ku: "Ez ji Kurdistanê me", en: "I am from Kurdistan", audio: true, audioText: "Ez ji Kurdistanê me" },
      { ku: "Tu ji ku yî?", en: "Where are you from?", audio: true, audioText: "Tu ji ku yî?" },
      { ku: "Ew ji malê tê", en: "He/She comes from home", audio: true, audioText: "Ew ji malê tê" }
    ]
  },
  {
    title: 'Accompaniment - "bi...re" (with)',
    examples: [
      { ku: "Bi min re.", en: "with me", audio: true, audioText: "Bi min re." },
      { ku: "Bi te re.", en: "with you", audio: true, audioText: "Bi te re." },
      { ku: "Bi wî re.", en: "with him", audio: true, audioText: "Bi wî re." },
      { ku: "Bi wê re.", en: "with her", audio: true, audioText: "Bi wê re." },
      { ku: "Ez bi te re diçim.", en: "I go with you", audio: true, audioText: "Ez bi te re diçim" },
      { ku: "Ew bi kurên xwe re ye.", en: "He is with his sons", audio: true, audioText: "Ew bi kurên xwe re ye" }
    ]
  },
  {
    title: 'Purpose - "bo" (for)',
    examples: [
      { ku: "Bo te.", en: "for you", audio: true, audioText: "Bo te." },
      { ku: "Bo min.", en: "for me", audio: true, audioText: "Bo min." },
      { ku: "Bo me.", en: "for us", audio: true, audioText: "Bo me." },
      { ku: "Ez bo te kar dikim", en: "I work for you", audio: true, audioText: "Ez bo te kar dikim" },
      { ku: "Ev pirtûk bo te ye", en: "This book is for you", audio: true, audioText: "Ev pirtûk bo te ye" }
    ]
  },
  {
    title: 'Position - "ber" and "paş" (before/behind)',
    examples: [
      { ku: "Ber malê.", en: "in front of the house", audio: true, audioText: "Ber malê." },
      { ku: "Paş malê.", en: "behind the house", audio: true, audioText: "Paş malê." },
      { ku: "Ez ber malê me.", en: "I am in front of the house", audio: true, audioText: "Ez ber malê me" },
      { ku: "Ew paş darê ye.", en: "He/She is behind the tree", audio: true, audioText: "Ew paş darê ye" }
    ]
  },
  {
    title: 'Inside - "di...de" (in/inside)',
    examples: [
      { ku: "Di odeyê de.", en: "in the room", audio: true, audioText: "Di odeyê de." },
      { ku: "Di malê de.", en: "in the house", audio: true, audioText: "Di malê de." },
      { ku: "Di dibistanê de.", en: "in the school", audio: true, audioText: "Di dibistanê de." },
      { ku: "Ez di odeyê de me.", en: "I am in the room", audio: true, audioText: "Ez di odeyê de me" },
      { ku: "Pirtûk di odeyê de ye.", en: "The book is in the room", audio: true, audioText: "Pirtûk di odeyê de ye" }
    ]
  },
  {
    title: 'On Top - "li ser" (on)',
    examples: [
      { ku: "Li ser maseyê.", en: "on the table", audio: true, audioText: "Li ser maseyê." },
      { ku: "Li ser kursiyê.", en: "on the chair", audio: true, audioText: "Li ser kursiyê." },
      { ku: "Pirtûk li ser maseyê ye.", en: "The book is on the table", audio: true, audioText: "Pirtûk li ser maseyê ye" },
      { ku: "Ez li ser kursiyê rûniştim.", en: "I sat on the chair", audio: true, audioText: "Ez li ser kursiyê rûniştim" }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "Ez malê me",
    correct: "Ez li malê me",
    explanation: "Don't forget 'li' when talking about location! 'li malê' means 'at home'."
  },
  {
    wrong: "Ez Kurdistanê me",
    correct: "Ez ji Kurdistanê me",
    explanation: "Use 'ji' (from) when talking about origin. 'ji Kurdistanê' means 'from Kurdistan'."
  },
  {
    wrong: "bi min",
    correct: "bi min re",
    explanation: "When using 'bi' (with) with pronouns, you need 're' after: 'bi min re' (with me), not just 'bi min'."
  },
  {
    wrong: "di odeyê",
    correct: "di odeyê de",
    explanation: "'di...de' wraps around the noun. You need both 'di' before and 'de' after: 'di odeyê de' (in the room)."
  },
  {
    wrong: "li ser mase",
    correct: "li ser maseyê",
    explanation: "Don't forget the ending on the noun! 'mase' becomes 'maseyê' (the table) after 'li ser'."
  }
];

const practiceExercises = [
  {
    question: "How do you say 'at home' in Kurdish?",
    options: ["malê", "li malê", "ji malê", "bo malê"],
    correct: 1,
    explanation: "Use 'li' for location: li malê (at home). 'ji' = from, 'bo' = for."
  },
  {
    question: "What preposition means 'from'?",
    options: ["li", "ji", "bi", "bo"],
    correct: 1,
    explanation: "'ji' means 'from'. 'li' = at/in, 'bi' = with, 'bo' = for."
  },
  {
    question: "How do you say 'with me'?",
    options: ["bi min", "bi min re", "li min", "ji min"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: bi min re (with me). You need both 'bi' and 're'."
  },
  {
    question: "How do you say 'I am from Kurdistan'?",
    options: ["Ez Kurdistanê me", "Ez li Kurdistanê me", "Ez ji Kurdistanê me", "Ez bo Kurdistanê me"],
    correct: 2,
    explanation: "Use 'ji' for origin: Ez ji Kurdistanê me (I am from Kurdistan)."
  },
  {
    question: "What is 'in the room' in Kurdish?",
    options: ["li odeyê", "ji odeyê", "di odeyê de", "bo odeyê"],
    correct: 2,
    explanation: "Use 'di...de' for inside: di odeyê de (in the room). It wraps around the noun."
  },
  {
    question: "How do you say 'on the table'?",
    options: ["li maseyê", "li ser maseyê", "di maseyê de", "ji maseyê"],
    correct: 1,
    explanation: "Use 'li ser' for on top: li ser maseyê (on the table)."
  },
  {
    question: "What preposition means 'for'?",
    options: ["li", "ji", "bi", "bo"],
    correct: 3,
    explanation: "'bo' means 'for'. 'li' = at/in, 'ji' = from, 'bi' = with."
  },
  {
    question: "How do you say 'in front of the house'?",
    options: ["li malê", "ber malê", "paş malê", "di malê de"],
    correct: 1,
    explanation: "Use 'ber' for in front: ber malê (in front of the house)."
  },
  {
    question: "What is 'behind the house'?",
    options: ["ber malê", "paş malê", "li malê", "ji malê"],
    correct: 1,
    explanation: "Use 'paş' for behind: paş malê (behind the house)."
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu ku yî?", "Tu li ku yî?", "Tu ji ku yî?", "Tu bo ku yî?"],
    correct: 1,
    explanation: "Use 'li ku' for location: Tu li ku yî? (Where are you?). 'ku' = where."
  },
  {
    question: "How do you say 'I go with you'?",
    options: ["Ez bi te diçim", "Ez bi te re diçim", "Ez li te diçim", "Ez ji te diçim"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: Ez bi te re diçim (I go with you)."
  },
  {
    question: "What is 'for you' in Kurdish?",
    options: ["li te", "ji te", "bi te", "bo te"],
    correct: 3,
    explanation: "Use 'bo' for for: bo te (for you)."
  },
  {
    question: "How do you say 'The book is on the table'?",
    options: ["Pirtûk li maseyê ye", "Pirtûk li ser maseyê ye", "Pirtûk di maseyê de ye", "Pirtûk ji maseyê ye"],
    correct: 1,
    explanation: "Use 'li ser' for on: Pirtûk li ser maseyê ye (The book is on the table)."
  },
  {
    question: "What preposition is used for 'inside'?",
    options: ["li", "di...de", "ber", "paş"],
    correct: 1,
    explanation: "'di...de' means 'in/inside'. It wraps around the noun: di odeyê de (in the room)."
  },
  {
    question: "How do you say 'Where are you from?'?",
    options: ["Tu ku yî?", "Tu li ku yî?", "Tu ji ku yî?", "Tu bo ku yî?"],
    correct: 2,
    explanation: "Use 'ji ku' for origin: Tu ji ku yî? (Where are you from?)."
  },
  {
    question: "What is the correct form for 'with him'?",
    options: ["bi wî", "bi wî re", "li wî", "ji wî"],
    correct: 1,
    explanation: "Use 'bi...re' with pronouns: bi wî re (with him)."
  },
  {
    question: "How do you say 'I am in the room'?",
    options: ["Ez li odeyê me", "Ez di odeyê de me", "Ez ji odeyê me", "Ez bo odeyê me"],
    correct: 1,
    explanation: "Use 'di...de' for inside: Ez di odeyê de me (I am in the room)."
  },
  {
    question: "What preposition means 'before/in front of'?",
    options: ["ber", "paş", "li", "ji"],
    correct: 0,
    explanation: "'ber' means 'before' or 'in front of'. 'paş' = behind, 'li' = at/in, 'ji' = from."
  },
  {
    question: "How do you say 'behind the tree'?",
    options: ["ber darê", "paş darê", "li darê", "di darê de"],
    correct: 1,
    explanation: "Use 'paş' for behind: paş darê (behind the tree)."
  },
  {
    question: "What is the structure for 'di...de'?",
    options: ["di + noun", "noun + de", "di + noun + de", "de + noun + di"],
    correct: 2,
    explanation: "'di...de' wraps around the noun: 'di' comes before and 'de' comes after. Example: di odeyê de (in the room)."
  }
];

// Audio assets
const audioAssets: Record<string, any> = {
  'li-male': require('../../assets/audio/grammar/li-male.mp3'),
  'li-dibistane': require('../../assets/audio/grammar/li-dibistane.mp3'),
  'li-bazare': require('../../assets/audio/grammar/li-bazare.mp3'),
  'ez-li-male-me': require('../../assets/audio/grammar/ez-li-male-me.mp3'),
  'tu-li-ku-yi': require('../../assets/audio/grammar/tu-li-ku-yi.mp3'),
  'ew-li-kurdistane-ye': require('../../assets/audio/grammar/ew-li-kurdistane-ye.mp3'),
  'ji-kurdistane': require('../../assets/audio/grammar/ji-kurdistane.mp3'),
  'ji-male': require('../../assets/audio/grammar/ji-male.mp3'),
  'ji-bazare': require('../../assets/audio/grammar/ji-bazare.mp3'),
  'ez-ji-kurdistane-me': require('../../assets/audio/grammar/ez-ji-kurdistane-me.mp3'),
  'tu-ji-ku-yi': require('../../assets/audio/grammar/tu-ji-ku-yi.mp3'),
  'ew-ji-male-te': require('../../assets/audio/grammar/ew-ji-male-te.mp3'),
  'bi-min-re': require('../../assets/audio/grammar/bi-min-re.mp3'),
  'bi-te-re': require('../../assets/audio/grammar/bi-te-re.mp3'),
  'bi-wi-re': require('../../assets/audio/grammar/bi-wi-re.mp3'),
  'bi-we-re': require('../../assets/audio/grammar/bi-we-re.mp3'),
  'ez-bi-te-re-dicim': require('../../assets/audio/grammar/ez-bi-te-re-dicim.mp3'),
  'ew-bi-kuren-xwe-re-ye': require('../../assets/audio/grammar/ew-bi-kuren-xwe-re-ye.mp3'),
  'bo-te': require('../../assets/audio/grammar/bo-te.mp3'),
  'bo-min': require('../../assets/audio/grammar/bo-min.mp3'),
  'bo-me': require('../../assets/audio/grammar/bo-me.mp3'),
  'ez-bo-te-kar-dikim': require('../../assets/audio/grammar/ez-bo-te-kar-dikim.mp3'),
  'ev-pirtuk-bo-te-ye': require('../../assets/audio/grammar/ev-pirtuk-bo-te-ye.mp3'),
  'ber-male': require('../../assets/audio/grammar/ber-male.mp3'),
  'pas-male': require('../../assets/audio/grammar/pas-male.mp3'),
  'ez-ber-male-me': require('../../assets/audio/grammar/ez-ber-male-me.mp3'),
  'ew-pas-dare-ye': require('../../assets/audio/grammar/ew-pas-dare-ye.mp3'),
  'di-odeye-de': require('../../assets/audio/grammar/di-odeye-de.mp3'),
  'di-male-de': require('../../assets/audio/grammar/di-male-de.mp3'),
  'di-dibistane-de': require('../../assets/audio/grammar/di-dibistane-de.mp3'),
  'ez-di-odeye-de-me': require('../../assets/audio/grammar/ez-di-odeye-de-me.mp3'),
  'pirtuk-di-odeye-de-ye': require('../../assets/audio/grammar/pirtuk-di-odeye-de-ye.mp3'),
  'li-ser-maseye': require('../../assets/audio/grammar/li-ser-maseye.mp3'),
  'li-ser-kursiye': require('../../assets/audio/grammar/li-ser-kursiye.mp3'),
  'pirtuk-li-ser-maseye-ye': require('../../assets/audio/grammar/pirtuk-li-ser-maseye-ye.mp3'),
  'ez-li-ser-kursiye-runistim': require('../../assets/audio/grammar/ez-li-ser-kursiye-runistim.mp3'),
};

export default function PrepositionsPage() {
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
    totalAudios: 36, // Total unique audios in presentTenseExamples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 0.83, // 30% / 36 audios ≈ 0.83% per audio
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
    console.log('🚀 Prepositions page mounted, initial progress:', {
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

  const playAudio = async (audioFile: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const audioAsset = audioAssets[audioFile];
      if (!audioAsset) {
        console.warn(`Audio file not found: ${audioFile}`);
        return;
      }

      await Asset.loadAsync(audioAsset);
      const asset = Asset.fromModule(audioAsset);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: asset.localUri || asset.uri },
        { shouldPlay: true, volume: 1.0 }
      );

      setSound(newSound);
      setPlayingAudio(audioFile);
      
      if (!uniqueAudiosPlayedRef.current.has(audioFile)) {
        uniqueAudiosPlayedRef.current.add(audioFile);
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
          <Text style={styles.headerTitle}>Prepositions</Text>
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
            {/* How It Works */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>How Prepositions Work in Kurdish</Text>
              <Text style={styles.sectionText}>
                Prepositions in Kurdish work similarly to English, but some have special rules. They usually come <Text style={styles.highlight}>before</Text> the noun.
              </Text>
              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>Important Rules:</Text>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleLabel}>"li" = at/in/on (location)</Text>
                  <Text style={styles.ruleExample}>Example: <Text style={styles.highlightBox}>li malê</Text> (at home)</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleLabel}>"ji" = from (origin)</Text>
                  <Text style={styles.ruleExample}>Example: <Text style={styles.highlightBox}>ji Kurdistanê</Text> (from Kurdistan)</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleLabel}>"bi...re" = with (needs "re" after pronoun)</Text>
                  <Text style={styles.ruleExample}>Example: <Text style={styles.highlightBox}>bi min re</Text> (with me)</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleLabel}>"di...de" = in/inside (wraps around noun)</Text>
                  <Text style={styles.ruleExample}>Example: <Text style={styles.highlightBox}>di odeyê de</Text> (in the room)</Text>
                </View>
              </View>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Tip: Remember: "bi" needs "re" with pronouns (bi min re), and "di...de" wraps around the noun (di odeyê de). Don't forget the ending on the noun!
                </Text>
              </View>
            </View>

            {/* Prepositions Reference Table */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Prepositions Reference</Text>
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 0.8 }]} numberOfLines={1}>Kurdish</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.0 }]} numberOfLines={1}>English</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]} numberOfLines={1}>Example</Text>
                </View>
                {/* Table Rows */}
                {prepositionsTable.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellKurdish, { flex: 0.8 }]}>{row.ku}</Text>
                    <Text style={[styles.tableCell, { flex: 1.0 }]}>{row.en}</Text>
                    <View style={[styles.tableCellContainerLeft, { flex: 1.5 }]}>
                      <Text style={styles.tableCellExample}>{row.example}</Text>
                      <Text style={styles.tableCellEnglish}>{row.exampleEn}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Common Mistakes */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmojiWarning}>⚠️</Text>
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
                          onPress={() => playAudio(example.audioFile)}
                          style={styles.audioButtonContainer}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name={playingAudio === example.audioFile ? 'volume-high' : 'volume-low-outline'}
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
  backButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.6,
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
    gap: 16,
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEmojiWarning: {
    fontSize: 18,
    marginRight: 8,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
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
  highlight: {
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
  ruleItem: {
    marginBottom: 12,
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  ruleExample: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    marginLeft: 16,
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
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
    paddingVertical: 12,
    paddingHorizontal: 6,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  tableCellKurdish: {
    fontWeight: '700',
    color: '#111827',
  },
  tableCellContainerLeft: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});


