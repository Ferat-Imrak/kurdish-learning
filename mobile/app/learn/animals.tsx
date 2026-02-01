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
import { restoreRefsFromProgress } from '../../lib/utils/progressHelper';

const { width } = Dimensions.get('window');

const LESSON_ID = '9'; // Animals lesson ID

// Layout constants
const ICON_CONTAINER_WIDTH = 44;
const QUESTIONS_PER_SESSION = 20;

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

// Animals data
const animals = [
  { en: "Cat", ku: "pisîk", icon: "🐱", audioFile: "pisik" },
  { en: "Dog", ku: "se", icon: "🐶", audioFile: "se" },
  { en: "Bird", ku: "balinde", icon: "🐦", audioFile: "balinde" },
  { en: "Cow", ku: "çêlek", icon: "🐮", audioFile: "celek" },
  { en: "Bull", ku: "ga", icon: "🐂", audioFile: "ga" },
  { en: "Horse", ku: "hesp", icon: "🐴", audioFile: "hesp" },
  { en: "Fish", ku: "masî", icon: "🐟", audioFile: "masi" },
  { en: "Lion", ku: "şêr", icon: "🦁", audioFile: "ser" },
  { en: "Goat", ku: "bizin", icon: "🐐", audioFile: "bizin" },
  { en: "Sheep", ku: "pez", icon: "🐑", audioFile: "pez" },
  { en: "Elephant", ku: "fîl", icon: "🐘", audioFile: "fil" },
  { en: "Monkey", ku: "meymûn", icon: "🐵", audioFile: "meymun" },
  { en: "Wolf", ku: "gur", icon: "🐺", audioFile: "gur" },
  { en: "Snake", ku: "mar", icon: "🐍", audioFile: "mar" },
  { en: "Rabbit", ku: "kevroşk", icon: "🐰", audioFile: "kevrosk" },
  { en: "Chicken", ku: "mirîşk", icon: "🐔", audioFile: "mirisk" },
  { en: "Rooster", ku: "dîk", icon: "🐓", audioFile: "dik" },
  { en: "Tiger", ku: "piling", icon: "🐯", audioFile: "piling" },
  { en: "Bear", ku: "hirç", icon: "🐻", audioFile: "hirc" },
  { en: "Fox", ku: "rovî", icon: "🦊", audioFile: "rovi" },
  { en: "Butterfly", ku: "perperok", icon: "🦋", audioFile: "perperok" },
  { en: "Mouse", ku: "mişk", icon: "🐭", audioFile: "misk" },
  { en: "Duck", ku: "werdek", icon: "🦆", audioFile: "werdek" },
  { en: "Pig", ku: "beraz", icon: "🐷", audioFile: "beraz" },
  { en: "Donkey", ku: "ker", icon: "🫏", audioFile: "ker" },
  { en: "Owl", ku: "kund", icon: "🦉", audioFile: "kund" },
  { en: "Turkey", ku: "elok", icon: "🦃", audioFile: "elok" },
  { en: "Hedgehog", ku: "jûjî", icon: "🦔", audioFile: "juji" },
  { en: "Crow", ku: "qel", icon: "🐦‍⬛", audioFile: "qel" },
];

// Animal questions
const animalQuestions = [
  { ku: "Ev çi heywan e?", en: "What animal is this?", audioFile: "ev-ci-heywan-e" },
  { ku: "Tu heywanekî xwe heye?", en: "Do you have a pet?", audioFile: "tu-heywanki-xwe-heye" },
  { ku: "Heywana te çi ye?", en: "What is your pet?", audioFile: "heywana-te-ci-ye" },
  { ku: "Tu kîjan heywanan hez dikî?", en: "Which animals do you like?", audioFile: "tu-kijan-heywanan-hez-diki" },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'balinde': require('../../assets/audio/animals/balinde.mp3'),
  'beraz': require('../../assets/audio/animals/beraz.mp3'),
  'bizin': require('../../assets/audio/animals/bizin.mp3'),
  'celek': require('../../assets/audio/animals/celek.mp3'),
  'dik': require('../../assets/audio/animals/dik.mp3'),
  'elok': require('../../assets/audio/animals/elok.mp3'),
  'ev-ci-heywan-e': require('../../assets/audio/animals/ev-ci-heywan-e.mp3'),
  'fil': require('../../assets/audio/animals/fil.mp3'),
  'ga': require('../../assets/audio/animals/ga.mp3'),
  'gur': require('../../assets/audio/animals/gur.mp3'),
  'hesp': require('../../assets/audio/animals/hesp.mp3'),
  'heywana-te-ci-ye': require('../../assets/audio/animals/heywana-te-ci-ye.mp3'),
  'hirc': require('../../assets/audio/animals/hirc.mp3'),
  'juji': require('../../assets/audio/animals/juji.mp3'),
  'ker': require('../../assets/audio/animals/ker.mp3'),
  'kevrosk': require('../../assets/audio/animals/kevrosk.mp3'),
  'kund': require('../../assets/audio/animals/kund.mp3'),
  'mar': require('../../assets/audio/animals/mar.mp3'),
  'masi': require('../../assets/audio/animals/masi.mp3'),
  'meymun': require('../../assets/audio/animals/meymun.mp3'),
  'mirisk': require('../../assets/audio/animals/mirisk.mp3'),
  'misk': require('../../assets/audio/animals/misk.mp3'),
  'perperok': require('../../assets/audio/animals/perperok.mp3'),
  'pez': require('../../assets/audio/animals/pez.mp3'),
  'piling': require('../../assets/audio/animals/piling.mp3'),
  'pisik': require('../../assets/audio/animals/pisik.mp3'),
  'qel': require('../../assets/audio/animals/qel.mp3'),
  'rovi': require('../../assets/audio/animals/rovi.mp3'),
  'se': require('../../assets/audio/animals/se.mp3'),
  'ser': require('../../assets/audio/animals/ser.mp3'),
  'tu-heywanki-xwe-heye': require('../../assets/audio/animals/tu-heywanki-xwe-heye.mp3'),
  'tu-kijan-heywanan-hez-diki': require('../../assets/audio/animals/tu-kijan-heywanan-hez-diki.mp3'),
  'werdek': require('../../assets/audio/animals/werdek.mp3')
};

interface ExerciseItem {
  ku: string;
  en: string;
  audioFile: string;
  icon: string;
}

export default function AnimalsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [currentExercise, setCurrentExercise] = useState<ExerciseItem | null>(null);
  const [options, setOptions] = useState<ExerciseItem[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<ExerciseItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: animals.length + animalQuestions.length, // 29 animals + 4 questions = 33
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 0.91, // 30% / 33 audios ≈ 0.91% per audio
  };
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID);
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set());
  // Base audio plays estimated from stored progress
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);
  // Track previous unique audio count to calculate increment
  const previousUniqueAudiosCountRef = useRef<number>(0);

  // Generate all possible exercise items from animals
  const allExerciseItems: ExerciseItem[] = animals.map(animal => ({
    ku: animal.ku,
    en: animal.en,
    audioFile: animal.audioFile,
    icon: animal.icon
  }));

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
    console.log('🚀 Animals page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
    });
    
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
    
    // Restore refs from stored progress (in case progress was updated after component mount)
    const currentProgress = getLessonProgress(LESSON_ID);
    const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig);
    startTimeRef.current = estimatedStartTime;
    baseAudioPlaysRef.current = estimatedAudioPlays;
    
    console.log('🔄 Restored refs:', {
      estimatedAudioPlays,
      estimatedStartTime: new Date(estimatedStartTime).toISOString(),
      uniqueAudiosPlayed: uniqueAudiosPlayedRef.current.size,
    });
    
    // Note: uniqueAudiosPlayedRef starts fresh each session, but we account for base progress
  }, [isAuthenticated]);

  // Initialize first exercise when switching to practice mode
  useEffect(() => {
    if (mode === 'practice' && !currentExercise && !isCompleted) {
      startPracticeSession();
    }
  }, [mode]);

  // Generate exercise when practice questions are ready or question index changes
  useEffect(() => {
    if (mode === 'practice' && practiceQuestions.length > 0 && currentQuestionIndex < practiceQuestions.length) {
      const currentItem = practiceQuestions[currentQuestionIndex];
      if (currentItem) {
        setCurrentExercise(currentItem);
        
        // Generate 3 wrong options
        const wrongOptions = allExerciseItems
          .filter(item => item.ku !== currentItem.ku)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        // Combine correct answer with wrong options and shuffle
        const allOptions = [currentItem, ...wrongOptions].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setSelectedAnswer(null);
        setShowFeedback(false);
      }
    }
  }, [practiceQuestions, currentQuestionIndex, mode]);

  const playAudio = async (audioKey: string, audioText: string, actualAudioFile?: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Extract actual audio file name from audioKey (remove prefix like "animal-", "question-", etc.)
      let audioFileToLookup = actualAudioFile || audioKey;
      if (audioKey.includes('-')) {
        // Try to extract the actual filename by removing common prefixes
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'animal' || parts[0] === 'question' || parts[0] === 'practice')) {
          audioFileToLookup = parts.slice(1).join('-');
        }
      }

      // Try to find audio by the extracted filename first
      let audioAsset = audioAssets[audioFileToLookup];
      
      // If not found, try the original audioKey
      if (!audioAsset) {
        audioAsset = audioAssets[audioKey];
      }
      
      // If not found, try to find by filename generated from text
      if (!audioAsset && audioText) {
        const filename = getAudioFilename(audioText);
        audioAsset = audioAssets[filename];
      }
      
      if (!audioAsset) {
        console.warn(`Audio file not found: ${audioFileToLookup} (key: ${audioKey}). Audio files will be generated/copied later.`);
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
      
      // Track unique audios played (only count new ones)
      if (!uniqueAudiosPlayedRef.current.has(audioKey)) {
        uniqueAudiosPlayedRef.current.add(audioKey);
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
    
    console.log('🔍 calculateProgress called:', {
      practiceScore,
      storedProgress: currentProgress?.progress,
      storedScore: currentProgress?.score,
      storedTimeSpent: currentProgress?.timeSpent,
    });
    
    // Calculate session time (time since restored start time)
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    
    // Audio progress: new unique audios played this session only
    // Each unique audio = 0.91% (30% max / 33 total audios)
    // CRITICAL: Only calculate progress for the INCREMENT since last update
    const currentUniqueAudios = uniqueAudiosPlayedRef.current.size;
    const newUniqueAudios = currentUniqueAudios - previousUniqueAudiosCountRef.current;
    const newAudioProgress = Math.min(30, newUniqueAudios * 0.91);
    // Update previous count for next calculation
    previousUniqueAudiosCountRef.current = currentUniqueAudios;
    
    // Time progress: new session time only (max 20%, 4 minutes = 20%)
    const newTimeProgress = Math.min(20, sessionTimeMinutes * 5);
    
    // Get base progress from stored progress
    const baseProgress = currentProgress?.progress || 0;
    
    // CRITICAL FIX: Only use score for practice if practice was JUST completed (practiceScore parameter)
    // The backend stores overall progress in the score field, so we can't trust stored score
    // as practice completion unless we know practice was just done.
    // Ignore stored score entirely - only use it if practiceScore is explicitly provided.
    // If practice is completed (status is COMPLETED and score >= 70%), give full 50% practice progress
    const storedPracticeScore = currentProgress?.score;
    const isPracticeCompleted = currentProgress?.status === 'COMPLETED' && storedPracticeScore !== undefined && storedPracticeScore >= 70;
    const practiceProgress = practiceScore !== undefined 
      ? (practiceScore >= 70 ? 50 : Math.min(50, practiceScore * 0.5))  // If score >= 70%, give full 50%; otherwise scale
      : (isPracticeCompleted ? 50 : 0);  // If practice was completed before with >= 70%, give full 50%
    
    // Calculate new total: base progress (which already includes previous audio+time) + new audio + new time + practice
    // But we need to cap audio+time at 50% total
    // If baseProgress is already at 50%, we can't add more audio+time progress
    const currentAudioTimeProgress = Math.min(50, baseProgress); // Cap base at 50% (audio+time max)
    // Only add NEW progress (newAudioProgress + newTimeProgress), not the full base
    const newAudioTimeProgress = Math.min(50 - currentAudioTimeProgress, newAudioProgress + newTimeProgress);
    const totalAudioTime = Math.min(50, currentAudioTimeProgress + newAudioTimeProgress);
    const totalProgress = Math.min(100, totalAudioTime + practiceProgress);
    
    console.log('📊 Progress calculation breakdown:', {
      newUniqueAudios,
      newAudioProgress: newAudioProgress.toFixed(2),
      sessionTimeMinutes,
      newTimeProgress: newTimeProgress.toFixed(2),
      baseProgress,
      currentAudioTimeProgress: currentAudioTimeProgress.toFixed(2),
      newAudioTimeProgress: newAudioTimeProgress.toFixed(2),
      practiceProgress: practiceProgress.toFixed(2),
      totalAudioTime: totalAudioTime.toFixed(2),
      totalProgress: totalProgress.toFixed(2),
    });
    
    return totalProgress;
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    console.log('🎵 handleAudioPlay called:', {
      uniqueAudiosCount: uniqueAudiosPlayedRef.current.size,
      currentProgress: currentProgress?.progress,
      currentScore: currentProgress?.score,
    });
    
    // Don't pass practiceScore - we're just playing audio, not doing practice
    const progress = calculateProgress(undefined);
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    
    // Calculate time spent for this update
    // timeSpent is stored in minutes, so we just add session time
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const baseTimeSpent = currentProgress.timeSpent || 0;
    // Safeguard: if baseTimeSpent is unreasonably large (> 10000 minutes = ~166 hours), reset it
    // This prevents corrupted values from breaking the calculation
    const safeBaseTimeSpent = baseTimeSpent > 10000 ? 0 : Math.max(baseTimeSpent, 0);
    const totalTimeSpent = safeBaseTimeSpent + Math.max(sessionTimeMinutes, 0);
    
    // CRITICAL: Never use stored score - it's overall progress, not practice
    // Only pass score when practice is explicitly completed
    const existingPracticeScore = undefined;
    
    console.log('💾 Updating progress:', {
      progress: progress.toFixed(2),
      status,
      existingPracticeScore,
      totalTimeSpent,
    });
    
    updateLessonProgress(LESSON_ID, progress, status, existingPracticeScore, totalTimeSpent);
  };

  // Generate 20 unique questions for practice session
  const generatePracticeQuestions = (): ExerciseItem[] => {
    // Shuffle all animals and take 20 unique ones
    const shuffled = [...allExerciseItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, shuffled.length));
  };


  // Start new practice session
  const startPracticeSession = () => {
    // Generate new unique set of 20 questions
    const newQuestions = generatePracticeQuestions();
    setPracticeQuestions(newQuestions);
    setScore({ correct: 0, total: 0 });
    setCurrentQuestion(1);
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
    // generateExercise will be called after state updates
  };

  const handleAnswerSelect = (answerKu: string) => {
    if (showFeedback || isCompleted) return;
    
    setSelectedAnswer(answerKu);
    const isCorrect = answerKu === currentExercise?.ku;
    setShowFeedback(true);
    const newTotal = score.total + 1;
    const newCorrect = score.correct + (isCorrect ? 1 : 0);
    setScore({
      correct: newCorrect,
      total: newTotal
    });
    
    // Check if this was the last question
    if (newTotal >= QUESTIONS_PER_SESSION) {
      setTimeout(() => {
        setIsCompleted(true);
        const practiceScorePercent = (newCorrect / newTotal) * 100;
        const isPracticePassed = practiceScorePercent >= 70; // Changed from 80% to 70% for consistency with frontend
        
        const progress = calculateProgress(practiceScorePercent);
        const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS';
        
        // Calculate time spent for this update
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
        const baseTimeSpent = getLessonProgress(LESSON_ID).timeSpent || 0;
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
        
        updateLessonProgress(LESSON_ID, progress, status, practiceScorePercent, totalTimeSpent);
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentQuestion >= QUESTIONS_PER_SESSION || currentQuestionIndex >= practiceQuestions.length - 1) {
      setIsCompleted(true);
      return;
    }
    setCurrentQuestion(prev => prev + 1);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    startPracticeSession();
  };

  // Calculate total examples count for Learn progress
  const totalExamples = animals.length + animalQuestions.length;
  // Learned count = estimated base count from previous sessions + new unique audios this session
  // Use baseAudioPlaysRef which stores the estimated audio plays from previous sessions
  const estimatedBaseCount = Math.min(baseAudioPlaysRef.current, totalExamples);
  const newUniqueAudios = uniqueAudiosPlayedRef.current.size;
  const learnedCount = Math.min(estimatedBaseCount + newUniqueAudios, totalExamples);

  const progress = getLessonProgress(LESSON_ID);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Animals</Text>
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
              {progress.status === 'COMPLETED'
                ? 'Done'
                : (progress.score !== undefined
                    ? (progress.score >= 70 ? 'Done' : `${Math.round(progress.score)}%`)
                    : 'Pending')}
            </Text>
          </View>
        </View>

      {/* Segmented Control - Mode Toggle */}
      <View style={styles.segmentedControl}>
        <Pressable
          onPress={() => {
            setMode('learn');
            setScore({ correct: 0, total: 0 });
            setCurrentExercise(null);
            setCurrentQuestion(0);
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
            startPracticeSession();
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
            {/* Animals Grid */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🐾</Text>
                <Text style={styles.sectionTitle}>Animals</Text>
              </View>
              <View style={styles.animalsGrid}>
                {animals.map((animal, index) => {
                  const audioKey = `animal-${animal.audioFile}`;
                  return (
                    <View key={index} style={styles.animalCard}>
                      <View style={styles.animalTextContainer}>
                        <Text style={styles.animalKurdish}>{animal.ku}</Text>
                        <Text style={styles.animalEnglish}>{animal.en}</Text>
                      </View>
                      <View style={styles.animalBottomRow}>
                        <Text style={styles.animalIcon}>{animal.icon}</Text>
                        <Pressable
                          onPress={() => playAudio(audioKey, animal.ku, animal.audioFile)}
                          style={styles.audioButtonContainer}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name={playingAudio === audioKey ? 'volume-high' : 'volume-low-outline'}
                            size={22}
                            color="#4b5563"
                          />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Animal Questions */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>❓</Text>
                <Text style={styles.sectionTitle}>Animal Questions</Text>
              </View>
              <View style={styles.questionsList}>
                {animalQuestions.map((item, index) => {
                  const audioKey = `question-${item.audioFile}`;
                  return (
                    <View key={index} style={styles.questionCard}>
                      <View style={styles.questionTextContainer}>
                        <Text style={styles.questionKurdish}>{item.ku}</Text>
                        <Text style={styles.questionEnglish}>{item.en}</Text>
                      </View>
                      <Pressable
                        onPress={() => playAudio(audioKey, item.ku, item.audioFile)}
                        style={styles.audioButtonContainer}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={playingAudio === audioKey ? 'volume-high' : 'volume-low-outline'}
                          size={22}
                          color="#4b5563"
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          /* Practice Mode - Listening Exercise */
          <View style={styles.practiceContainer}>
            {isCompleted ? (() => {
              const practiceScorePercent = Math.round((score.correct / QUESTIONS_PER_SESSION) * 100);
              const isPassed = practiceScorePercent >= 70;
              
              return (
                <View style={styles.completionCard}>
                  <Text style={styles.completionEmoji}>{isPassed ? '🎉' : '📚'}</Text>
                  <Text style={styles.completionTitle}>
                    {isPassed ? 'Great job!' : 'Keep practicing!'}
                  </Text>
                  <Text style={styles.completionText}>
                    You got <Text style={styles.completionScore}>{score.correct}</Text> out of{' '}
                    <Text style={styles.completionTotal}>{QUESTIONS_PER_SESSION}</Text> correct!
                  </Text>
                  <Text style={styles.completionPercentage}>
                    {practiceScorePercent}%
                  </Text>
                  {!isPassed && (
                    <Text style={[styles.completionText, { marginTop: 8, fontSize: 14, color: '#666' }]}>
                      You need at least 70% to complete this lesson. Keep trying!
                    </Text>
                  )}
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
              );
            })() : currentExercise ? (
              <View style={styles.practiceCard}>
                {/* Score and Progress */}
                <View style={styles.practiceHeader}>
                  <Text style={styles.practiceCounter}>
                    Question {currentQuestion} of {QUESTIONS_PER_SESSION}
                  </Text>
                  <Text style={styles.practiceScore}>
                    Score: {score.correct}/{score.total}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${(currentQuestion / QUESTIONS_PER_SESSION) * 100}%` }
                      ]}
                    />
                  </View>
                </View>

                {/* Audio Button */}
                <View style={styles.audioSection}>
                  <Text style={styles.audioSectionTitle}>Listen to the animal name:</Text>
                  <Pressable
                    onPress={() => playAudio(`practice-${currentExercise.audioFile}`, currentExercise.ku, currentExercise.audioFile)}
                    style={({ pressed }) => [
                      styles.practiceAudioButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={playingAudio === `practice-${currentExercise.audioFile}` ? 'volume-high' : 'volume-low-outline'}
                      size={28}
                      color="#3A86FF"
                    />
                    <Text style={styles.practiceAudioButtonText}>Play Audio</Text>
                  </Pressable>
                </View>

                {/* Answer Options */}
                <View style={styles.optionsGrid}>
                  {options.map((option, index) => {
                    const isSelected = selectedAnswer === option.ku;
                    const isCorrect = option.ku === currentExercise.ku;
                    const showCorrect = showFeedback && isCorrect;
                    const showIncorrect = showFeedback && isSelected && !isCorrect;

                    return (
                      <Pressable
                        key={index}
                        onPress={() => handleAnswerSelect(option.ku)}
                        disabled={showFeedback}
                        style={({ pressed }) => [
                          styles.optionButton,
                          showCorrect && styles.optionButtonCorrect,
                          showIncorrect && styles.optionButtonWrong,
                          isSelected && !showFeedback && styles.optionButtonSelected,
                          pressed && !showFeedback && styles.pressed,
                        ]}
                      >
                        <View style={styles.optionContent}>
                          <Text style={styles.optionIcon}>{option.icon}</Text>
                          <Text style={styles.optionText}>{option.en}</Text>
                          {showCorrect && (
                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                          )}
                          {showIncorrect && (
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Next Button */}
                {showFeedback && !isCompleted && (
                  <Pressable
                    onPress={handleNext}
                    style={({ pressed }) => [
                      styles.nextButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentQuestion >= QUESTIONS_PER_SESSION ? 'Finish' : 'Next Question'}
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : null}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    flexShrink: 1,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  animalTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  animalKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  animalEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  animalBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  animalIcon: {
    fontSize: 28,
  },
  questionsList: {
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  questionKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  questionEnglish: {
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
  practiceCounter: {
    fontSize: 14,
    color: '#6b7280',
  },
  practiceScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
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
  audioSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  audioSectionTitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
  },
  practiceAudioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3A86FF',
  },
  practiceAudioButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A86FF',
  },
  optionsGrid: {
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
  optionIcon: {
    fontSize: 32,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
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

