import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
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
import { useLessonProgressTimer } from '../../lib/utils/useLessonProgressTimer';

const { width } = Dimensions.get('window');

const LESSON_ID = '19'; // Articles & Plurals lesson ID

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

// Article rules reference table
const articleRules = [
  { ending: "-ek", meaning: "a/an", example: "pirtûk → pirtûkek", exampleEn: "book → a book", usage: "Indefinite (one thing, not specific)" },
  { ending: "-ê", meaning: "the", example: "pirtûk → pirtûkê", exampleEn: "book → the book", usage: "Definite (specific thing)" },
  { ending: "-an", meaning: "plural", example: "mal → malan", exampleEn: "house → houses", usage: "More than one (some nouns)" },
  { ending: "-ên", meaning: "plural", example: "pirtûk → pirtûkên", exampleEn: "book → books", usage: "More than one (most nouns)" }
];

const presentTenseExamples = [
  {
    title: 'Indefinite Article - "a/an" (-ek)',
    examples: [
      { ku: "Pirtûkek", en: "a book", audio: true, audioText: "Pirtûkek." },
      { ku: "Pisîkek", en: "a cat", audio: true, audioText: "Pisîkek." },
      { ku: "Malek", en: "a house", audio: true, audioText: "Malek." },
      { ku: "Xwendekarek", en: "a student", audio: true, audioText: "Xwendekarek." },
      { ku: "Çayek", en: "a tea", audio: true, audioText: "Çayek." },
      { ku: "Ez pirtûkek dixwînim", en: "I read a book", audio: true, audioText: "Ez pirtûkek dixwînim" }
    ]
  },
  {
    title: 'Definite Article - "the" (-ê)',
    examples: [
      { ku: "Malê", en: "the house", audio: true, audioText: "Malê." },
      { ku: "Pirtûkê", en: "the book", audio: true, audioText: "Pirtûkê." },
      { ku: "Pisîkê", en: "the cat", audio: true, audioText: "Pisîkê." },
      { ku: "Çayê", en: "the tea", audio: true, audioText: "Çayê." },
      { ku: "Nanê", en: "the bread", audio: true, audioText: "Nanê." },
      { ku: "Ez pirtûkê dixwînim.", en: "I read the book", audio: true, audioText: "Ez pirtûkê dixwînim" }
    ]
  },
  {
    title: 'This and That (ev/ew)',
    examples: [
      { ku: "Ev pirtûk.", en: "this book", audio: true, audioText: "Ev pirtûk." },
      { ku: "Ew pisîk.", en: "that cat", audio: true, audioText: "Ew pisîk." },
      { ku: "Ev mal.", en: "this house", audio: true, audioText: "Ev mal." },
      { ku: "Ew av.", en: "that water", audio: true, audioText: "Ew av." },
      { ku: "Ev nan.", en: "this bread", audio: true, audioText: "Ev nan." },
      { ku: "Ev pirtûk xweş e.", en: "This book is good", audio: true, audioText: "Ev pirtûk xweş e" }
    ]
  },
  {
    title: 'Making Plurals',
    examples: [
      { ku: "mal → malan", en: "house → houses", audio: true, audioText: "malan" },
      { ku: "pirtûk → pirtûkên", en: "book → books", audio: true, audioText: "pirtûkên" },
      { ku: "xwendekar → xwendekarên", en: "student → students", audio: true, audioText: "xwendekarên" },
      { ku: "pisîk → pisîkan", en: "cat → cats", audio: true, audioText: "pisîkan" },
      { ku: "çav → çavên", en: "eye → eyes", audio: true, audioText: "çavên" },
      { ku: "Ez pirtûkên xwe dixwînim.", en: "I read my books", audio: true, audioText: "Ez pirtûkên xwe dixwînim" }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "pirtûk ek",
    correct: "pirtûkek",
    explanation: "The ending '-ek' is attached directly to the noun, not a separate word."
  },
  {
    wrong: "pirtûk ê",
    correct: "pirtûkê",
    explanation: "The ending '-ê' is attached directly to the noun, not a separate word."
  },
  {
    wrong: "malên",
    correct: "malan",
    explanation: "Some nouns use '-an' for plural, not '-ên'. 'mal' (house) becomes 'malan' (houses)."
  },
  {
    wrong: "ev pirtûkê",
    correct: "ev pirtûk",
    explanation: "When using 'ev' (this) or 'ew' (that), don't add '-ê'. Just use the noun: 'ev pirtûk' (this book)."
  },
  {
    wrong: "pirtûkekê",
    correct: "pirtûkek or pirtûkê",
    explanation: "You can't use both '-ek' and '-ê' together. Use '-ek' for 'a' or '-ê' for 'the', not both."
  }
];

const practiceExercises = [
  {
    question: "How do you say 'a book' in Kurdish?",
    options: ["pirtûk", "pirtûkek", "pirtûkê", "pirtûkên"],
    correct: 1,
    explanation: "Add '-ek' to the noun: pirtûk → pirtûkek (a book)"
  },
  {
    question: "How do you say 'the house' in Kurdish?",
    options: ["mal", "malek", "malê", "malan"],
    correct: 2,
    explanation: "Add '-ê' to the noun: mal → malê (the house)"
  },
  {
    question: "What ending means 'a' or 'an'?",
    options: ["-ek", "-ê", "-an", "-ên"],
    correct: 0,
    explanation: "'-ek' means 'a' or 'an' (indefinite article). '-ê' means 'the' (definite)."
  },
  {
    question: "How do you make 'book' plural?",
    options: ["pirtûkan", "pirtûkên", "pirtûkek", "pirtûkê"],
    correct: 1,
    explanation: "Most nouns use '-ên' for plural: pirtûk → pirtûkên (books)"
  },
  {
    question: "How do you say 'this book'?",
    options: ["ev pirtûk", "ev pirtûkê", "ev pirtûkek", "ev pirtûkên"],
    correct: 0,
    explanation: "With 'ev' (this) or 'ew' (that), use the noun without any ending: ev pirtûk"
  },
  {
    question: "What is the plural of 'mal' (house)?",
    options: ["malên", "malan", "malek", "malê"],
    correct: 1,
    explanation: "'mal' uses '-an' for plural: mal → malan (houses)"
  },
  {
    question: "How do you say 'the cat'?",
    options: ["pisîk", "pisîkek", "pisîkê", "pisîkan"],
    correct: 2,
    explanation: "Add '-ê' for 'the': pisîk → pisîkê (the cat)"
  },
  {
    question: "What ending means 'the' (definite)?",
    options: ["-ek", "-ê", "-an", "-ên"],
    correct: 1,
    explanation: "'-ê' means 'the' (definite article). '-ek' means 'a/an' (indefinite)."
  },
  {
    question: "How do you say 'cats' (plural)?",
    options: ["pisîkên", "pisîkan", "pisîkek", "pisîkê"],
    correct: 1,
    explanation: "'pisîk' uses '-an' for plural: pisîk → pisîkan (cats)"
  },
  {
    question: "How do you say 'that cat'?",
    options: ["ew pisîk", "ew pisîkê", "ew pisîkek", "ew pisîkan"],
    correct: 0,
    explanation: "With 'ew' (that), use the noun without any ending: ew pisîk"
  },
  {
    question: "What is 'a student' in Kurdish?",
    options: ["xwendekar", "xwendekarek", "xwendekarê", "xwendekarên"],
    correct: 1,
    explanation: "Add '-ek' for 'a': xwendekar → xwendekarek (a student)"
  },
  {
    question: "How do you say 'students' (plural)?",
    options: ["xwendekaran", "xwendekarên", "xwendekarek", "xwendekarê"],
    correct: 1,
    explanation: "Most nouns use '-ên' for plural: xwendekar → xwendekarên (students)"
  },
  {
    question: "What is the correct way to write 'a house'?",
    options: ["mal ek", "malek", "mal ê", "malê"],
    correct: 1,
    explanation: "The ending is attached directly: malek (not 'mal ek')"
  },
  {
    question: "How do you say 'the books'?",
    options: ["pirtûkên", "pirtûkan", "pirtûkê", "pirtûkek"],
    correct: 0,
    explanation: "Plural form: pirtûk → pirtûkên (books). The plural already implies 'the'."
  },
  {
    question: "What ending is used for most plurals?",
    options: ["-ek", "-ê", "-an", "-ên"],
    correct: 3,
    explanation: "Most nouns use '-ên' for plural. Some use '-an'."
  },
  {
    question: "How do you say 'this house'?",
    options: ["ev mal", "ev malê", "ev malek", "ev malan"],
    correct: 0,
    explanation: "With 'ev' (this), use the noun without ending: ev mal"
  },
  {
    question: "What is 'the tea' in Kurdish?",
    options: ["çay", "çayek", "çayê", "çayan"],
    correct: 2,
    explanation: "Add '-ê' for 'the': çay → çayê (the tea)"
  },
  {
    question: "How do you say 'eyes' (plural)?",
    options: ["çavên", "çavan", "çavek", "çavê"],
    correct: 0,
    explanation: "Most nouns use '-ên' for plural: çav → çavên (eyes)"
  },
  {
    question: "Can you use both '-ek' and '-ê' together?",
    options: ["Yes, always", "No, never", "Sometimes", "Only for plurals"],
    correct: 1,
    explanation: "No! You use either '-ek' (a/an) OR '-ê' (the), never both together."
  },
  {
    question: "What is the correct form for 'I read a book'?",
    options: ["Ez pirtûk dixwînim", "Ez pirtûkek dixwînim", "Ez pirtûkê dixwînim", "Ez pirtûkên dixwînim"],
    correct: 1,
    explanation: "Use 'pirtûkek' (a book) with the article ending: Ez pirtûkek dixwînim"
  }
];

// Audio assets
const audioAssets: Record<string, any> = {
  'pirtukek': require('../../assets/audio/grammar/pirtukek.mp3'),
  'pisikek': require('../../assets/audio/grammar/pisikek.mp3'),
  'malek': require('../../assets/audio/grammar/malek.mp3'),
  'xwendekarek': require('../../assets/audio/grammar/xwendekarek.mp3'),
  'cayek': require('../../assets/audio/grammar/cayek.mp3'),
  'ez-pirtukek-dixwinim': require('../../assets/audio/grammar/ez-pirtukek-dixwinim.mp3'),
  'male': require('../../assets/audio/grammar/male.mp3'),
  'pirtuke': require('../../assets/audio/grammar/pirtuke.mp3'),
  'pisike': require('../../assets/audio/grammar/pisike.mp3'),
  'caye': require('../../assets/audio/grammar/caye.mp3'),
  'nane': require('../../assets/audio/grammar/nane.mp3'),
  'ez-pirtuke-dixwinim': require('../../assets/audio/grammar/ez-pirtuke-dixwinim.mp3'),
  'ev-pirtuk': require('../../assets/audio/grammar/ev-pirtuk.mp3'),
  'ew-pisik': require('../../assets/audio/grammar/ew-pisik.mp3'),
  'ev-mal': require('../../assets/audio/grammar/ev-mal.mp3'),
  'ew-av': require('../../assets/audio/grammar/ew-av.mp3'),
  'ev-nan': require('../../assets/audio/grammar/ev-nan.mp3'),
  'ev-pirtuk-xwes-e': require('../../assets/audio/grammar/ev-pirtuk-xwes-e.mp3'),
  'malan': require('../../assets/audio/grammar/malan.mp3'),
  'pirtuken': require('../../assets/audio/grammar/pirtuken.mp3'),
  'xwendekaren': require('../../assets/audio/grammar/xwendekaren.mp3'),
  'pisikan': require('../../assets/audio/grammar/pisikan.mp3'),
  'caven': require('../../assets/audio/grammar/caven.mp3'),
  'ez-pirtuken-xwe-dixwinim': require('../../assets/audio/grammar/ez-pirtuken-xwe-dixwinim.mp3'),
};

export default function ArticlesPluralsPage() {
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
    totalAudios: 24, // Total unique audios in presentTenseExamples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.25, // 30% / 24 audios ≈ 1.25% per audio
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
    console.log('🚀 Articles-Plurals page mounted, initial progress:', {
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

  useLessonProgressTimer({
    lessonId: LESSON_ID,
    startTimeRef,
    calculateProgress: () => calculateProgress(),
    getLessonProgress,
    updateLessonProgress,
  });

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
          <Text style={styles.headerTitle}>Articles & Plurals</Text>
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
              <Text style={styles.sectionTitle}>
                How Articles & Plurals Work in Kurdish
              </Text>
              <Text style={styles.sectionText}>
                In Kurdish, you add endings to nouns to show if they are "a/an", "the", or plural (more than one).
              </Text>
              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>Simple Rules:</Text>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleBold}>"-ek"</Text>
                  <Text style={styles.ruleText}> = "a" or "an" (one thing)</Text>
                  <Text style={styles.ruleExample}>Example: pirtûk → pirtûkek (a book)</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleBold}>"-ê"</Text>
                  <Text style={styles.ruleText}> = "the" (specific thing)</Text>
                  <Text style={styles.ruleExample}>Example: pirtûk → pirtûkê (the book)</Text>
                </View>
                <View style={styles.ruleItem}>
                  <Text style={styles.ruleBold}>"-an" or "-ên"</Text>
                  <Text style={styles.ruleText}> = plural (many things)</Text>
                  <Text style={styles.ruleExample}>Example: pirtûk → pirtûkên (books)</Text>
                </View>
              </View>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Tip: Just add the ending to the noun! Kurdish is simpler than English - no separate words like "a" or "the" before the noun.
                </Text>
              </View>
            </View>

            {/* Article Rules Reference Table */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Article & Plural Endings Reference</Text>
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 0.7 }]} numberOfLines={1}>Ending</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 0.9 }]} numberOfLines={1}>Meaning</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.3 }]} numberOfLines={1}>Example</Text>
                </View>
                {/* Table Rows */}
                {articleRules.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellEnding, { flex: 0.7 }]}>{row.ending}</Text>
                    <Text style={[styles.tableCell, { flex: 0.9 }]}>{row.meaning}</Text>
                    <View style={[styles.tableCellContainerLeft, { flex: 1.3 }]}>
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
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  tableCellEnding: {
    fontFamily: 'monospace',
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

