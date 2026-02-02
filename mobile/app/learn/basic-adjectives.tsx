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

const LESSON_ID = '24'; // Basic Adjectives lesson ID

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

// Basic adjectives reference table
const adjectivesTable = [
  { ku: "mezin", en: "big/large", category: "Size", example: "malê mezin", exampleEn: "big house", usage: "Describes size" },
  { ku: "biçûk", en: "small/little", category: "Size", example: "zarokê biçûk", exampleEn: "small child", usage: "Describes size" },
  { ku: "baş", en: "good", category: "Quality", example: "pirtûka baş", exampleEn: "good book", usage: "Describes quality" },
  { ku: "xirab", en: "bad", category: "Quality", example: "hewa xirab", exampleEn: "bad weather", usage: "Describes quality" },
  { ku: "germ", en: "hot", category: "Temperature", example: "hewa germ", exampleEn: "hot weather", usage: "Describes temperature" },
  { ku: "sar", en: "cold", category: "Temperature", example: "av sar", exampleEn: "cold water", usage: "Describes temperature" },
  { ku: "nû", en: "new", category: "Age", example: "pirtûka nû", exampleEn: "new book", usage: "Describes age" },
  { ku: "kevn", en: "old", category: "Age", example: "malê kevn", exampleEn: "old house", usage: "Describes age" },
  { ku: "xweş", en: "nice/pleasant", category: "Quality", example: "roja xweş", exampleEn: "nice day", usage: "Describes pleasantness" },
  { ku: "zû", en: "fast/quick", category: "Speed", example: "otomobîla zû", exampleEn: "fast car", usage: "Describes speed" },
  { ku: "hêdî", en: "slow", category: "Speed", example: "otomobîla hêdî", exampleEn: "slow car", usage: "Describes speed" },
  { ku: "hêsan", en: "easy", category: "Difficulty", example: "karê hêsan", exampleEn: "easy work", usage: "Describes difficulty" },
  { ku: "giran", en: "heavy/difficult", category: "Difficulty", example: "karê giran", exampleEn: "hard work", usage: "Describes difficulty or weight" },
  { ku: "dirêj", en: "long/tall", category: "Size", example: "darê dirêj", exampleEn: "tall tree", usage: "Describes length/height" },
  { ku: "kurt", en: "short", category: "Size", example: "mêra kurt", exampleEn: "short man", usage: "Describes length/height" },
  { ku: "fireh", en: "wide", category: "Size", example: "rêya fireh", exampleEn: "wide road", usage: "Describes width" },
  { ku: "teng", en: "narrow", category: "Size", example: "rêya teng", exampleEn: "narrow road", usage: "Describes width" },
  { ku: "giran", en: "heavy/difficult", category: "Weight", example: "pirtûka giran", exampleEn: "heavy book", usage: "Describes weight (can also mean difficult)" },
  { ku: "sivik", en: "light", category: "Weight", example: "pirtûka sivik", exampleEn: "light book", usage: "Describes weight" },
  { ku: "qelew", en: "fat/thick", category: "Size", example: "mêra qelew", exampleEn: "fat man", usage: "Describes thickness" },
  { ku: "tenik", en: "thin", category: "Size", example: "pirtûka tenik", exampleEn: "thin book", usage: "Describes thickness" }
];

const presentTenseExamples = [
  {
    title: 'Adjectives After Nouns',
    examples: [
      { ku: "Malê mezin.", en: "big house", audioText: "Malê mezin." },
      { ku: "Zarokê biçûk.", en: "small child", audioText: "Zarokê biçûk." },
      { ku: "Pirtûka baş.", en: "good book", audioText: "Pirtûka baş." },
      { ku: "Hewa xirab.", en: "bad weather", audioText: "Hewa xirab." },
      { ku: "Av germ.", en: "hot water", audioText: "Av germ." },
      { ku: "Av sar.", en: "cold water", audioText: "Av sar." }
    ]
  },
  {
    title: 'Adjectives in Sentences',
    examples: [
      { ku: "Malê min mezin e.", en: "My house is big", audioText: "Malê min mezin e" },
      { ku: "Zarokê te biçûk e.", en: "Your child is small", audioText: "Zarokê te biçûk e" },
      { ku: "Pirtûka wî baş e.", en: "His book is good", audioText: "Pirtûka wî baş e" },
      { ku: "Hewa xirab e.", en: "The weather is bad", audioText: "Hewa xirab e" },
      { ku: "Av germ e.", en: "The water is hot", audioText: "Av germ e" },
      { ku: "Pirtûka nû xweş e.", en: "The new book is nice", audioText: "Pirtûka nû xweş e" }
    ]
  },
  {
    title: 'Size Adjectives',
    examples: [
      { ku: "Darê dirêj.", en: "tall tree", audioText: "Darê dirêj." },
      { ku: "Mêra kurt.", en: "short man", audioText: "Mêra kurt." },
      { ku: "Rêya fireh.", en: "wide road", audioText: "Rêya fireh." },
      { ku: "Rêya teng.", en: "narrow road", audioText: "Rêya teng." },
      { ku: "Pirtûka giran.", en: "heavy book", audioText: "Pirtûka giran." },
      { ku: "Pirtûka sivik.", en: "light book", audioText: "Pirtûka sivik." }
    ]
  },
  {
    title: 'Quality & Difficulty',
    examples: [
      { ku: "Karê hêsan.", en: "easy work", audioText: "Karê hêsan." },
      { ku: "Karê giran.", en: "hard work", audioText: "Karê giran." },
      { ku: "Roja xweş.", en: "nice day", audioText: "Roja xweş." },
      { ku: "Pirtûka baş.", en: "good book", audioText: "Pirtûka baş." },
      { ku: "Otomobîla zû.", en: "fast car", audioText: "Otomobîla zû." },
      { ku: "Otomobîla hêdî.", en: "slow car", audioText: "Otomobîla hêdî." }
    ]
  },
  {
    title: 'Age & Condition',
    examples: [
      { ku: "Pirtûka nû.", en: "new book", audioText: "Pirtûka nû." },
      { ku: "Malê kevn.", en: "old house", audioText: "Malê kevn." },
      { ku: "Kûrsiyê nû.", en: "new chair", audioText: "Kûrsiyê nû." },
      { ku: "Kûrsiyê kevn.", en: "old chair", audioText: "Kûrsiyê kevn." }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "mezin mal",
    correct: "malê mezin",
    explanation: "In Kurdish, adjectives come AFTER the noun, not before. Also, the noun gets an ending (-ê, -a, -ên) before the adjective."
  },
  {
    wrong: "mal mezin",
    correct: "malê mezin",
    explanation: "Don't forget the ending on the noun! 'mal' becomes 'malê' before the adjective 'mezin' (big)."
  },
  {
    wrong: "baş pirtûk",
    correct: "pirtûka baş",
    explanation: "Adjectives always come after the noun in Kurdish. 'pirtûka baş' (good book), not 'baş pirtûk'."
  },
  {
    wrong: "germ hewa",
    correct: "hewa germ",
    explanation: "Some nouns don't need endings when used with adjectives. 'hewa germ' (hot weather) is correct - the adjective comes after."
  },
  {
    wrong: "mezin malê",
    correct: "malê mezin",
    explanation: "The ending goes on the noun, then the adjective follows. 'malê mezin' (big house), not 'mezin malê'."
  }
];

const practiceExercises = [
  {
    question: "How do you say 'big house' in Kurdish?",
    options: ["mezin mal", "mal mezin", "malê mezin", "mezin malê"],
    correct: 2,
    explanation: "Adjective comes after noun with ending: malê mezin (big house)"
  },
  {
    question: "What does 'biçûk' mean?",
    options: ["big", "small", "good", "bad"],
    correct: 1,
    explanation: "'biçûk' means 'small' or 'little'"
  },
  {
    question: "How do you say 'good book'?",
    options: ["baş pirtûk", "pirtûk baş", "pirtûka baş", "pirtûkê baş"],
    correct: 2,
    explanation: "Use 'pirtûka baş' - adjective comes after noun with ending"
  },
  {
    question: "What is 'cold water' in Kurdish?",
    options: ["sar av", "av sar", "ava sar", "sar avê"],
    correct: 1,
    explanation: "'av sar' (cold water) - some nouns like 'av' (water) don't need endings with certain adjectives"
  },
  {
    question: "What does 'nû' mean?",
    options: ["old", "new", "good", "bad"],
    correct: 1,
    explanation: "'nû' means 'new'"
  },
  {
    question: "How do you say 'hot weather'?",
    options: ["germ hewa", "hewa germ", "hewê germ", "germ hewê"],
    correct: 1,
    explanation: "'hewa germ' (hot weather) - adjective comes after"
  },
  {
    question: "What is 'small child' in Kurdish?",
    options: ["biçûk zarok", "zarok biçûk", "zarokê biçûk", "biçûk zarokê"],
    correct: 2,
    explanation: "'zarokê biçûk' (small child) - noun gets ending, adjective follows"
  },
  {
    question: "What does 'xirab' mean?",
    options: ["good", "bad", "big", "small"],
    correct: 1,
    explanation: "'xirab' means 'bad'"
  },
  {
    question: "How do you say 'old house'?",
    options: ["kevn mal", "mal kevn", "malê kevn", "kevn malê"],
    correct: 2,
    explanation: "'malê kevn' (old house) - adjective after noun with ending"
  },
  {
    question: "What is 'fast car' in Kurdish?",
    options: ["zû otomobîl", "otomobîl zû", "otomobîla zû", "zû otomobîla"],
    correct: 2,
    explanation: "'otomobîla zû' (fast car) - adjective comes after"
  },
  {
    question: "What does 'hêsan' mean?",
    options: ["hard", "easy", "fast", "slow"],
    correct: 1,
    explanation: "'hêsan' means 'easy'"
  },
  {
    question: "How do you say 'tall tree'?",
    options: ["dirêj dar", "dar dirêj", "darê dirêj", "dirêj darê"],
    correct: 2,
    explanation: "'darê dirêj' (tall tree) - adjective after noun"
  },
  {
    question: "What is 'heavy book' in Kurdish?",
    options: ["giran pirtûk", "pirtûk giran", "pirtûka giran", "giran pirtûka"],
    correct: 2,
    explanation: "'pirtûka giran' (heavy book) - adjective follows noun"
  },
  {
    question: "What does 'xweş' mean?",
    options: ["bad", "nice/pleasant", "big", "small"],
    correct: 1,
    explanation: "'xweş' means 'nice' or 'pleasant'"
  },
  {
    question: "How do you say 'wide road'?",
    options: ["fireh rê", "rê fireh", "rêya fireh", "fireh rêya"],
    correct: 2,
    explanation: "'rêya fireh' (wide road) - adjective after noun"
  },
  {
    question: "What is 'slow car' in Kurdish?",
    options: ["hêdî otomobîl", "otomobîl hêdî", "otomobîla hêdî", "hêdî otomobîla"],
    correct: 2,
    explanation: "'otomobîla hêdî' (slow car)"
  },
  {
    question: "What does 'giran' mean?",
    options: ["easy", "heavy/difficult", "fast", "slow"],
    correct: 1,
    explanation: "'giran' means 'heavy' or 'difficult' (can mean both depending on context)"
  },
  {
    question: "How do you say 'light book'?",
    options: ["sivik pirtûk", "pirtûk sivik", "pirtûka sivik", "sivik pirtûka"],
    correct: 2,
    explanation: "'pirtûka sivik' (light book)"
  },
  {
    question: "What is 'narrow road' in Kurdish?",
    options: ["teng rê", "rê teng", "rêya teng", "teng rêya"],
    correct: 2,
    explanation: "'rêya teng' (narrow road)"
  },
  {
    question: "What does 'kevn' mean?",
    options: ["new", "old", "good", "bad"],
    correct: 1,
    explanation: "'kevn' means 'old'"
  }
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  // Example phrases
  'male-mezin': require('../../assets/audio/grammar/male-mezin.mp3'),
  'zaroke-bicuk': require('../../assets/audio/grammar/zaroke-bicuk.mp3'),
  'pirtuka-bas': require('../../assets/audio/grammar/pirtuka-bas.mp3'),
  'hewa-xirab': require('../../assets/audio/grammar/hewa-xirab.mp3'),
  'av-germ': require('../../assets/audio/grammar/av-germ.mp3'),
  'av-sar': require('../../assets/audio/grammar/av-sar.mp3'),
  'male-min-mezin-e': require('../../assets/audio/grammar/male-min-mezin-e.mp3'),
  'zaroke-te-bicuk-e': require('../../assets/audio/grammar/zaroke-te-bicuk-e.mp3'),
  'pirtuka-wi-bas-e': require('../../assets/audio/grammar/pirtuka-wi-bas-e.mp3'),
  'hewa-xirab-e': require('../../assets/audio/grammar/hewa-xirab-e.mp3'),
  'av-germ-e': require('../../assets/audio/grammar/av-germ-e.mp3'),
  'pirtuka-nu-xwes-e': require('../../assets/audio/grammar/pirtuka-nu-xwes-e.mp3'),
  'dare-direj': require('../../assets/audio/grammar/dare-direj.mp3'),
  'mera-kurt': require('../../assets/audio/grammar/mera-kurt.mp3'),
  'reya-fireh': require('../../assets/audio/grammar/reya-fireh.mp3'),
  'reya-teng': require('../../assets/audio/grammar/reya-teng.mp3'),
  'pirtuka-giran': require('../../assets/audio/grammar/pirtuka-giran.mp3'),
  'pirtuka-sivik': require('../../assets/audio/grammar/pirtuka-sivik.mp3'),
  'kare-hesan': require('../../assets/audio/grammar/kare-hesan.mp3'),
  'kare-giran': require('../../assets/audio/grammar/kare-giran.mp3'),
  'roja-xwes': require('../../assets/audio/grammar/roja-xwes.mp3'),
  'otomobila-zu': require('../../assets/audio/grammar/otomobila-zu.mp3'),
  'otomobila-hedi': require('../../assets/audio/grammar/otomobila-hedi.mp3'),
  'pirtuka-nu': require('../../assets/audio/grammar/pirtuka-nu.mp3'),
  'male-kevn': require('../../assets/audio/grammar/male-kevn.mp3'),
  'kursiye-nu': require('../../assets/audio/grammar/kursiye-nu.mp3'),
  'kursiye-kevn': require('../../assets/audio/grammar/kursiye-kevn.mp3'),
};

export default function BasicAdjectivesPage() {
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
    totalAudios: 28, // Total unique audios in presentTenseExamples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.07, // 30% / 28 audios ≈ 1.07% per audio
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
    console.log('🚀 Basic-Adjectives page mounted, initial progress:', {
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
        console.warn(`Audio file not found: ${audioFile}. Audio files will be generated later.`);
        // Don't increment audio plays or update progress for missing files
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
    examples: section.examples.map(example => ({
      ...example,
      audioFile: getAudioFilename(example.audioText || example.ku)
    }))
  }));

  const progress = getLessonProgress(LESSON_ID);
  // Calculate total examples count for Learn progress (28 examples total)
  const totalExamples = examplesWithAudio.reduce((sum, section) => sum + section.examples.length, 0);
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
          <Text style={styles.headerTitle}>Basic Adjectives</Text>
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
            {/* Key Rule */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📝</Text>
                <Text style={styles.sectionTitle}>How Adjectives Work in Kurdish</Text>
              </View>
              <View style={styles.ruleContent}>
                <Text style={styles.ruleText}>
                  In Kurdish, adjectives come <Text style={styles.ruleHighlight}>after</Text> the noun, not before it like in English.
                </Text>
                <Text style={styles.ruleSubtitle}>The Structure:</Text>
                <View style={styles.structureBox}>
                  <Text style={styles.structureText}>
                    Noun + <Text style={styles.structureHighlight}>Ending</Text> + <Text style={styles.structureHighlight}>Adjective</Text>
                  </Text>
                </View>
                <Text style={styles.ruleExampleTitle}>Example:</Text>
                <Text style={styles.ruleExample}>
                  <Text style={styles.ruleBold}>mal</Text> (house) → <Text style={styles.structureHighlight}>malê</Text> (for singular)
                </Text>
                <Text style={styles.ruleExample}>
                  <Text style={styles.structureHighlight}>malê</Text> + <Text style={styles.ruleBold}>mezin</Text> (big)
                </Text>
                <Text style={styles.ruleExample}>
                  = <Text style={styles.ruleBold}>malê mezin</Text> (big house)
                </Text>
                <Text style={styles.ruleTip}>
                  💡 Tip: Remember: <Text style={styles.ruleBold}>Noun + Ending + Adjective</Text> - the opposite of English! Some nouns don't need endings (like "hewa germ" - hot weather).
                </Text>
              </View>
            </View>

            {/* Adjectives Reference Table */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>📊</Text>
                <Text style={styles.sectionTitle}>Basic Adjectives Reference</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 1.1 }]}>Kurdish</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.0 }]}>Category</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Example</Text>
                  </View>
                  {adjectivesTable.map((adj, index) => (
                    <View key={index} style={styles.tableRow}>
                      <View style={[styles.tableCellKurdishContainer, { flex: 1.1 }]}>
                        <Text style={styles.tableCellKurdish}>{adj.ku}</Text>
                        <Text style={styles.tableCellEnglish}>{adj.en}</Text>
                      </View>
                      <Text style={[styles.tableCellCategory, { flex: 1.0 }]}>{adj.category}</Text>
                      <View style={[styles.tableCellExampleContainer, { flex: 1.2 }]}>
                        <Text style={styles.tableCellExample}>{adj.example}</Text>
                        <Text style={styles.tableCellExampleTranslation}>{adj.exampleEn}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Common Mistakes */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionEmojiWarning}>⚠️</Text>
                <Text style={styles.sectionTitleInline}>Common Mistakes</Text>
              </View>
              <View style={styles.mistakesList}>
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
            </View>

            {/* Examples by Category */}
            {examplesWithAudio.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionIcon}>💬</Text>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <View style={styles.examplesList}>
                  {section.examples.map((example, index) => (
                    <View key={index} style={styles.exampleCard}>
                      <View style={styles.exampleTextContainer}>
                        <Text style={styles.exampleKurdish}>{example.ku}</Text>
                        <Text style={styles.exampleEnglish}>{example.en}</Text>
                      </View>
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
                    </View>
                  ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
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
  sectionEmojiWarning: {
    fontSize: 18,
    marginRight: 8,
    flexShrink: 0,
  },
  ruleContent: {
    gap: 12,
  },
  ruleText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  ruleHighlight: {
    fontWeight: '700',
    color: '#dc2626',
  },
  ruleSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  structureBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    marginVertical: 8,
  },
  structureText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
    color: '#111827',
  },
  structureHighlight: {
    backgroundColor: '#fef08a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '700',
  },
  ruleExampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  ruleExample: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 16,
    marginTop: 4,
    lineHeight: 22,
  },
  ruleBold: {
    fontWeight: '700',
    color: '#111827',
  },
  ruleTip: {
    fontSize: 15,
    color: '#374151',
    marginTop: 12,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: width - 64,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 2,
    borderBottomColor: '#d1fae5',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCellKurdishContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 90,
    justifyContent: 'center',
  },
  tableCellKurdish: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 4,
  },
  tableCellEnglish: {
    fontSize: 12,
    color: '#6b7280',
  },
  tableCellCategory: {
    fontSize: 12,
    color: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  tableCellExampleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  tableCellExample: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 4,
  },
  tableCellExampleTranslation: {
    fontSize: 12,
    color: '#6b7280',
  },
  mistakesList: {
    gap: 12,
  },
  mistakeCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  mistakeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
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
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#991b1b',
  },
  mistakeCorrect: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#059669',
  },
  mistakeExplanation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  examplesList: {
    gap: 12,
  },
  exampleCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleTextContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
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
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },
  feedbackBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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

