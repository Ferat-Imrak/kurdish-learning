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
import PhraseCard from '../components/PhraseCard';

const { width } = Dimensions.get('window');

const LESSON_ID = '18'; // Sentence Structure & Pronouns lesson ID

// Layout constants
const KURDISH_COLUMN_WIDTH = 72;
const ENGLISH_COLUMN_WIDTH = 72;
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

// Pronoun reference table
const pronounTable = [
  { ku: "ez", en: "I", example: "Ez xwendekar im", exampleEn: "I am a student" },
  { ku: "tu", en: "you", example: "Tu çawa yî?", exampleEn: "How are you?" },
  { ku: "ew", en: "he/she", example: "Ew li malê ye", exampleEn: "He/She is at home" },
  { ku: "em", en: "we", example: "Em xwendekar in", exampleEn: "We are students" },
  { ku: "hûn", en: "you (plural)", example: "Hûn çawa ne?", exampleEn: "How are you (all)?" },
  { ku: "ewan", en: "they", example: "Ewan li Kurdistanê ne", exampleEn: "They are in Kurdistan" }
];

const presentTenseExamples = [
  {
    title: 'Basic SOV Sentences',
    examples: [
      { ku: "Ez nan dixwim.", en: "I eat bread", audio: true, audioText: "Ez nan dixwim" },
      { ku: "Ew sêv dixwe.", en: "He/She eats an apple", audio: true, audioText: "Ew sêv dixwe" },
      { ku: "Tu pirtûk dixwînî.", en: "You read a book", audio: true, audioText: "Tu pirtûk dixwînî" },
      { ku: "Em çayê vedixwin.", en: "We drink tea", audio: true, audioText: "Em çayê vedixwin" },
      { ku: "Ewan li malê ne.", en: "They are at home", audio: true, audioText: "Ewan li malê ne" }
    ]
  },
  {
    title: 'Pronouns with "To Be"',
    examples: [
      { ku: "Ez xwendekar im.", en: "I am a student", audio: true, audioText: "Ez xwendekar im" },
      { ku: "Tu çawa yî?", en: "How are you?", audio: true, audioText: "Tu çawa yî" },
      { ku: "Ew ji Kurdistanê ye.", en: "He is from Kurdistan", audio: true, audioText: "Ew ji Kurdistanê ye" },
      { ku: "Em li malê ne.", en: "We are at home", audio: true, audioText: "Em li malê ne" },
      { ku: "Ewan xwendekar in.", en: "They are students", audio: true, audioText: "Ewan xwendekar in" },
      { ku: "Hûn çawa ne?", en: "How are you (all)?", audio: true, audioText: "Hûn çawa ne" }
    ]
  },
  {
    title: 'More Complex Sentences',
    examples: [
      { ku: "Ez çavên te dibînim.", en: "I see your eyes", audio: true, audioText: "Ez çavên te dibînim" },
      { ku: "Tu dengê min dibihîzî.", en: "You hear my voice", audio: true, audioText: "Tu dengê min dibihîzî" },
      { ku: "Ew nanê xwe dixwe.", en: "He/She eats his/her bread", audio: true, audioText: "Ew nanê xwe dixwe" },
      { ku: "Em pirtûkên xwe dixwînin.", en: "We read our books", audio: true, audioText: "Em pirtûkên xwe dixwînin" },
      { ku: "Ew di baxçê de dilîzin.", en: "They play in the garden", audio: true, audioText: "Ew di baxçê de dilîzin" }
    ]
  },
  {
    title: 'Questions with Pronouns',
    examples: [
      { ku: "Tu ku yî?", en: "Where are you?", audio: true, audioText: "Tu ku yî" },
      { ku: "Ew çi dike?", en: "What does he/she do?", audio: true, audioText: "Ew çi dike" },
      { ku: "Em kengî diçin?", en: "When do we go?", audio: true, audioText: "Em kengî diçin" },
      { ku: "Ewan kî ne?", en: "Who are they?", audio: true, audioText: "Ewan kî ne" }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "Nan ez dixwim",
    correct: "Ez nan dixwim",
    explanation: "Remember: Subject comes first! Kurdish is SOV (Subject-Object-Verb), not OSV."
  },
  {
    wrong: "Ez dixwim nan",
    correct: "Ez nan dixwim",
    explanation: "The verb must come at the END of the sentence. Object comes before the verb."
  },
  {
    wrong: "Em xwendekar im",
    correct: "Em xwendekar in",
    explanation: "For plural pronouns (Em, Hûn, Ewan), use 'in' not 'im'. 'im' is only for 'Ez' (I)."
  },
  {
    wrong: "Tu xwendekar e",
    correct: "Tu xwendekar î",
    explanation: "For 'Tu' (you), use '-î' ending, not '-e'. '-e' is for 'Ew' (he/she)."
  },
  {
    wrong: "Ew xwendekar î",
    correct: "Ew xwendekar e",
    explanation: "For 'Ew' (he/she), use '-e' ending, not '-î'. '-î' is for 'Tu' (you)."
  }
];

const practiceExercises = [
  {
    question: "What is the correct word order in Kurdish?",
    options: ["Subject-Verb-Object (SVO)", "Subject-Object-Verb (SOV)", "Verb-Subject-Object (VSO)", "Object-Subject-Verb (OSV)"],
    correct: 1,
    explanation: "Kurdish follows SOV (Subject-Object-Verb) order. The verb always comes at the end."
  },
  {
    question: "How do you say 'I eat bread' in Kurdish?",
    options: ["Nan ez dixwim", "Ez nan dixwim", "Ez dixwim nan", "Dixwim ez nan"],
    correct: 1,
    explanation: "Correct order: Ez (I) + nan (bread) + dixwim (eat) = Ez nan dixwim"
  },
  {
    question: "What pronoun means 'we' in Kurdish?",
    options: ["ez", "tu", "em", "ew"],
    correct: 2,
    explanation: "'em' means 'we' in Kurdish. 'ez' = I, 'tu' = you, 'ew' = he/she"
  },
  {
    question: "How do you say 'They are students'?",
    options: ["Ewan xwendekar in", "Ewan xwendekar im", "Ewan xwendekar e", "Ewan xwendekar î"],
    correct: 0,
    explanation: "For plural 'Ewan' (they), use 'in' ending. 'im' is for 'Ez', 'e' is for 'Ew', 'î' is for 'Tu'."
  },
  {
    question: "What is the correct sentence structure for 'You read a book'?",
    options: ["Tu pirtûk dixwînî", "Pirtûk tu dixwînî", "Tu dixwînî pirtûk", "Dixwînî tu pirtûk"],
    correct: 0,
    explanation: "SOV order: Tu (you) + pirtûk (book) + dixwînî (read) = Tu pirtûk dixwînî"
  },
  {
    question: "Which pronoun is used for 'he' or 'she'?",
    options: ["ez", "tu", "ew", "em"],
    correct: 2,
    explanation: "'ew' means both 'he' and 'she' in Kurdish. There's no gender distinction in pronouns."
  },
  {
    question: "How do you say 'We are at home'?",
    options: ["Em li malê ne", "Em li malê im", "Em li malê e", "Em li malê î"],
    correct: 0,
    explanation: "For 'Em' (we), use 'ne' ending. 'im' is for 'Ez', 'e' is for 'Ew', 'î' is for 'Tu'."
  },
  {
    question: "What is the correct ending for 'Tu' (you) with 'to be'?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 1,
    explanation: "'Tu' always uses '-î' ending. Example: Tu çawa yî? (How are you?)"
  },
  {
    question: "In the sentence 'Ew nan dixwe', what is the subject?",
    options: ["nan", "dixwe", "ew", "none"],
    correct: 2,
    explanation: "'Ew' (he/she) is the subject. 'nan' (bread) is the object, 'dixwe' (eats) is the verb."
  },
  {
    question: "How do you say 'I see your eyes'?",
    options: ["Ez çavên te dibînim", "Çavên te ez dibînim", "Ez dibînim çavên te", "Dibînim ez çavên te"],
    correct: 0,
    explanation: "SOV order: Ez (I) + çavên te (your eyes) + dibînim (see) = Ez çavên te dibînim"
  },
  {
    question: "What pronoun means 'you (plural)'?",
    options: ["tu", "hûn", "em", "ewan"],
    correct: 1,
    explanation: "'hûn' means 'you (plural)' or 'you all'. 'tu' is singular 'you'."
  },
  {
    question: "How do you say 'He/She is from Kurdistan'?",
    options: ["Ew ji Kurdistanê ye", "Ew ji Kurdistanê im", "Ew ji Kurdistanê in", "Ew ji Kurdistanê î"],
    correct: 0,
    explanation: "For 'Ew' (he/she), use 'ye' (is). 'im' is for 'Ez', 'in' is for plural, 'î' is for 'Tu'."
  },
  {
    question: "What is the correct order for 'We drink tea'?",
    options: ["Em çayê vedixwin", "Çayê em vedixwin", "Em vedixwin çayê", "Vedixwin em çayê"],
    correct: 0,
    explanation: "SOV: Em (we) + çayê (tea) + vedixwin (drink) = Em çayê vedixwin"
  },
  {
    question: "Which ending is used for plural pronouns (Em, Hûn, Ewan)?",
    options: ["-im", "-î", "-e", "-in"],
    correct: 3,
    explanation: "All plural pronouns (Em, Hûn, Ewan) use '-in' ending with 'to be'."
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu ku yî?", "Tu ku im?", "Tu ku e?", "Tu ku in?"],
    correct: 0,
    explanation: "For 'Tu' (you), use '-î' ending: Tu ku yî? (Where are you?)"
  },
  {
    question: "In Kurdish, what comes first in a sentence?",
    options: ["Verb", "Object", "Subject", "Adjective"],
    correct: 2,
    explanation: "The subject always comes first in Kurdish sentences (SOV order)."
  },
  {
    question: "What is the correct sentence for 'They play in the garden'?",
    options: ["Ew di baxçê de dilîzin", "Di baxçê de ew dilîzin", "Ew dilîzin di baxçê de", "Dilîzin ew di baxçê de"],
    correct: 0,
    explanation: "SOV order: Ew (they) + di baxçê de (in the garden) + dilîzin (play) = Ew di baxçê de dilîzin"
  },
  {
    question: "How do you say 'What does he/she do?'?",
    options: ["Ew çi dike?", "Çi ew dike?", "Ew dike çi?", "Dike ew çi?"],
    correct: 0,
    explanation: "SOV order: Ew (he/she) + çi (what) + dike (does) = Ew çi dike?"
  },
  {
    question: "What pronoun would you use to say 'We are students'?",
    options: ["ez", "tu", "em", "ew"],
    correct: 2,
    explanation: "'em' means 'we'. Example: Em xwendekar in (We are students)."
  },
  {
    question: "In the sentence 'Ez nan dixwim', what is the verb?",
    options: ["Ez", "nan", "dixwim", "all of them"],
    correct: 2,
    explanation: "'dixwim' (I eat) is the verb. 'Ez' is the subject, 'nan' is the object."
  }
];

// Audio assets
const audioAssets: Record<string, any> = {
  'ez-nan-dixwim': require('../../assets/audio/grammar/ez-nan-dixwim.mp3'),
  'ew-sev-dixwe': require('../../assets/audio/grammar/ew-sev-dixwe.mp3'),
  'tu-pirtuk-dixwini': require('../../assets/audio/grammar/tu-pirtuk-dixwini.mp3'),
  'em-caye-vedixwin': require('../../assets/audio/grammar/em-caye-vedixwin.mp3'),
  'ewan-li-male-ne': require('../../assets/audio/grammar/ewan-li-male-ne.mp3'),
  'ez-xwendekar-im': require('../../assets/audio/grammar/ez-xwendekar-im.mp3'),
  'tu-cawa-yi': require('../../assets/audio/grammar/tu-cawa-yi.mp3'),
  'ew-ji-kurdistane-ye': require('../../assets/audio/grammar/ew-ji-kurdistane-ye.mp3'),
  'em-li-male-ne': require('../../assets/audio/grammar/em-li-male-ne.mp3'),
  'ewan-xwendekar-in': require('../../assets/audio/grammar/ewan-xwendekar-in.mp3'),
  'hun-cawa-ne': require('../../assets/audio/grammar/hun-cawa-ne.mp3'),
  'ez-caven-te-dibinim': require('../../assets/audio/grammar/ez-caven-te-dibinim.mp3'),
  'tu-denge-min-dibihizi': require('../../assets/audio/grammar/tu-denge-min-dibihizi.mp3'),
  'ew-nane-xwe-dixwe': require('../../assets/audio/grammar/ew-nane-xwe-dixwe.mp3'),
  'em-pirtuken-xwe-dixwinin': require('../../assets/audio/grammar/em-pirtuken-xwe-dixwinin.mp3'),
  'ew-di-baxce-de-dilizin': require('../../assets/audio/grammar/ew-di-baxce-de-dilizin.mp3'),
  'tu-ku-yi': require('../../assets/audio/grammar/tu-ku-yi.mp3'),
  'ew-ci-dike': require('../../assets/audio/grammar/ew-ci-dike.mp3'),
  'em-kengi-dicin': require('../../assets/audio/grammar/em-kengi-dicin.mp3'),
  'ewan-ki-ne': require('../../assets/audio/grammar/ewan-ki-ne.mp3'),
};

export default function SentenceStructurePronounsPage() {
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
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 21, // Total unique audios in presentTenseExamples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.43, // 30% / 21 audios ≈ 1.43% per audio
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
    console.log('🚀 Sentence-Structure-Pronouns page mounted, initial progress:', {
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
      
      // Track unique audios played (only count new ones)
      if (!uniqueAudiosPlayedRef.current.has(audioFile)) {
        uniqueAudiosPlayedRef.current.add(audioFile);
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
    
    // Audio progress: new unique audios played this session only
    const currentUniqueAudios = uniqueAudiosPlayedRef.current.size;
    const newUniqueAudios = currentUniqueAudios - previousUniqueAudiosCountRef.current;
    const newAudioProgress = Math.min(30, newUniqueAudios * 1.43);
    // Update previous count for next calculation
    previousUniqueAudiosCountRef.current = currentUniqueAudios;
    
    // Time progress: new session time only (max 20%, 4 minutes = 20%)
    const newTimeProgress = Math.min(20, sessionTimeMinutes * 5);
    
    // Get base progress from stored progress
    const baseProgress = currentProgress?.progress || 0;
    
    // Practice progress: only if practice was just completed
    let practiceProgress = 0;
    if (practiceScore !== undefined) {
      // Practice just completed - give full 50% if passed (>= 70%)
      if (practiceScore >= 70) {
        practiceProgress = 50;
      } else {
        // Failed - proportional score (0-49%)
        practiceProgress = Math.min(49, practiceScore * 0.5);
      }
    } else if (currentProgress?.status === 'COMPLETED') {
      // Practice was completed before - give full 50%
      practiceProgress = 50;
    }
    
    // Calculate new progress from session activity
    const calculatedProgress = Math.min(100, baseProgress + newAudioProgress + newTimeProgress + practiceProgress);
    
    // Use Math.max to prevent progress from dropping due to new calculation method
    return Math.max(baseProgress, calculatedProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
    
    // Safeguard: ensure timeSpent is reasonable (max 1000 minutes = ~16 hours)
    const safeTimeSpent = Math.min(1000, totalTimeSpent);
    
    const progress = calculateProgress(undefined); // Don't pass practice score here
    updateLessonProgress(LESSON_ID, progress, 'IN_PROGRESS', undefined, safeTimeSpent);
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
      
      // Only mark lesson as completed if practice is passed
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS';
      updateLessonProgress(LESSON_ID, progress, status, isPracticePassed ? practiceScorePercent : undefined, safeTimeSpent);
    }
  };

  const handleRestart = () => {
    setCurrentExercise(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setIsCompleted(false);
  };

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
          <Text style={styles.headerTitle}>Sentence Structure & Pronouns</Text>
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

      {mode === 'learn' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* How It Works */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>💡</Text>
              <Text style={styles.sectionTitle}>How Kurdish Sentences Work</Text>
            </View>
            <Text style={styles.sectionText}>
              Kurdish follows <Text style={styles.highlight}>Subject-Object-Verb (SOV)</Text> word order. This means the verb always comes at the end of the sentence.
            </Text>
            <View style={styles.structureBox}>
              <Text style={styles.structureLabel}>The Structure:</Text>
              <View style={styles.structureRow}>
                <View style={styles.structureTag}>
                  <Text style={styles.structureTagText}>Subject</Text>
                </View>
                <Text style={styles.structurePlus}>+</Text>
                <View style={styles.structureTag}>
                  <Text style={styles.structureTagText}>Object</Text>
                </View>
                <Text style={styles.structurePlus}>+</Text>
                <View style={styles.structureTag}>
                  <Text style={styles.structureTagText}>Verb</Text>
                </View>
              </View>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>Example: "I eat bread"</Text>
                <Text style={styles.exampleText}>
                  <Text style={styles.exampleTag}>Ez</Text> (I) + <Text style={styles.exampleTag}>nan</Text> (bread) + <Text style={styles.exampleTag}>dixwim</Text> (eat)
                </Text>
                <Text style={styles.exampleResult}>
                  = <Text style={styles.exampleResultBold}>Ez nan dixwim</Text>
                </Text>
              </View>
            </View>
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                <Text style={styles.tipBold}>💡 Tip:</Text> Always remember: <Text style={styles.tipBold}>Verb comes last!</Text> This is different from English where verbs come in the middle.
              </Text>
            </View>
          </View>

          {/* Pronoun Reference - Mobile Card Layout */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📊 Personal Pronouns Reference</Text>
            <View style={styles.pronounTableContainer}>
              {/* Header Row */}
              <View style={styles.pronounHeaderRow}>
                <View style={[styles.pronounHeaderCell, { width: KURDISH_COLUMN_WIDTH }]}>
                  <Text style={styles.pronounHeaderText}>Kurdish</Text>
                </View>
                <View style={[styles.pronounHeaderCell, { width: ENGLISH_COLUMN_WIDTH }]}>
                  <Text style={styles.pronounHeaderText}>English</Text>
                </View>
                <View style={styles.pronounHeaderCellExample}>
                  <Text style={styles.pronounHeaderText}>Example</Text>
                </View>
              </View>
              {/* Data Rows */}
              {pronounTable.map((row, index) => (
                <View key={index}>
                  <View style={styles.pronounRow}>
                    <View style={[styles.pronounCellKurdish, { width: KURDISH_COLUMN_WIDTH }]}>
                      <Text style={styles.pronounCellKurdishText}>{row.ku}</Text>
                    </View>
                    <View style={[styles.pronounCellEnglish, { width: ENGLISH_COLUMN_WIDTH }]}>
                      <Text style={styles.pronounCellEnglishText}>{row.en}</Text>
                    </View>
                    <View style={styles.pronounCellExample}>
                      <Text style={styles.pronounCellExampleText}>{row.example}</Text>
                      <Text style={styles.pronounCellExampleEn}>{row.exampleEn}</Text>
                    </View>
                  </View>
                  {index < pronounTable.length - 1 && <View style={styles.pronounRowSeparator} />}
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
          {presentTenseExamples.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.examples.map((example, exampleIndex) => (
                <React.Fragment key={`example-${sectionIndex}-${exampleIndex}`}>
                  <View style={styles.exampleCard}>
                    {(section.title === 'Basic SOV Sentences' || section.title === 'Pronouns with "To Be"' || section.title === 'More Complex Sentences' || section.title === 'Questions with Pronouns') ? (
                      // Vertical layout for all example sections
                      <View style={styles.exampleCardVertical}>
                        <View style={styles.exampleCardVerticalContent}>
                          <Text 
                            style={styles.exampleKurdishVertical}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {example.ku}
                          </Text>
                          <Text 
                            style={styles.exampleEnglishVertical}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {example.en}
                          </Text>
                        </View>
                        {example.audio && (
                          <View style={styles.audioButtonContainer}>
                            <Pressable
                              onPress={() => playAudio(getAudioFilename(example.audioText || example.ku))}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={({ pressed }) => [
                                styles.audioButton,
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons
                                name={playingAudio === getAudioFilename(example.audioText || example.ku) ? 'volume-high' : 'volume-low-outline'}
                                size={20}
                                color="#4b5563"
                              />
                            </Pressable>
                          </View>
                        )}
                      </View>
                    ) : (
                      // Horizontal layout for other sections
                      <>
                        <View style={styles.exampleCardContent}>
                          <Text 
                            style={styles.exampleKurdish}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {example.ku}
                          </Text>
                          <Text style={styles.exampleDivider}>|</Text>
                          <Text 
                            style={styles.exampleEnglish}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {example.en}
                          </Text>
                        </View>
                        {example.audio && (
                          <View style={styles.audioButtonContainer}>
                            <Pressable
                              onPress={() => playAudio(getAudioFilename(example.audioText || example.ku))}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                              style={({ pressed }) => [
                                styles.audioButton,
                                pressed && styles.pressed,
                              ]}
                            >
                              <Ionicons
                                name={playingAudio === getAudioFilename(example.audioText || example.ku) ? 'volume-high' : 'volume-low-outline'}
                                size={20}
                                color="#4b5563"
                              />
                            </Pressable>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                  {exampleIndex < section.examples.length - 1 && (
                    <View style={styles.exampleSeparator} />
                  )}
                </React.Fragment>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        /* Practice Mode */
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.practiceContent}
          showsVerticalScrollIndicator={false}
        >
          {!isCompleted ? (
            <View style={styles.practiceCard}>
              <View style={styles.practiceHeader}>
                <Text style={styles.practiceTitle}>Practice Exercise</Text>
                <Text style={styles.practiceCounter}>
                  {currentExercise + 1} of {practiceExercises.length}
                </Text>
              </View>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentExercise + 1) / practiceExercises.length) * 100}%` },
                  ]}
                />
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
                        showResult && isSelected && !isCorrect && styles.optionButtonIncorrect,
                        !showResult && isSelected && styles.optionButtonSelected,
                      ]}
                    >
                      <View style={styles.optionContent}>
                        {showResult && isCorrect && (
                          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <Ionicons name="close-circle" size={24} color="#dc2626" />
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
            <View style={styles.completedCard}>
              <Text style={styles.completedEmoji}>🎉</Text>
              <Text style={styles.completedTitle}>Practice Complete!</Text>
              <Text style={styles.completedText}>
                You got <Text style={styles.completedScore}>{score.correct}</Text> out of{' '}
                <Text style={styles.completedTotal}>{score.total}</Text> correct!
              </Text>
              <Text style={styles.completedPercentage}>
                {Math.round((score.correct / score.total) * 100)}%
              </Text>
              <Pressable
                onPress={handleRestart}
                style={({ pressed }) => [
                  styles.restartButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.restartButtonText}>Try Again</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
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
  backHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 32,
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
  sectionEmoji: {
    fontSize: 24,
    marginRight: 8,
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
  structureBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  structureLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  structureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  structureTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  structureTagText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  structurePlus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 4,
  },
  exampleBox: {
    marginTop: 12,
  },
  exampleLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  exampleTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  exampleResult: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  exampleResultBold: {
    fontWeight: '700',
  },
  tipBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '700',
  },
  // Pronoun Reference - Mobile Card Layout Styles
  pronounTableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  pronounHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#d1fae5',
  },
  pronounHeaderCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pronounHeaderCellExample: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  pronounHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  pronounRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    minHeight: 56,
  },
  pronounCellKurdish: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pronounCellKurdishText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  pronounCellEnglish: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  pronounCellEnglishText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  pronounCellExample: {
    flex: 1,
    paddingLeft: 12,
    minWidth: 0,
  },
  pronounCellExampleText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 4,
  },
  pronounCellExampleEn: {
    fontSize: 12,
    color: '#6b7280',
  },
  pronounRowSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 16,
    marginRight: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exampleCardVertical: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minWidth: 0,
    paddingRight: 12,
  },
  exampleCardVerticalContent: {
    flex: 1,
    minWidth: 0,
  },
  exampleCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    paddingRight: 12,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
    flex: 1,
  },
  exampleKurdishVertical: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  exampleDivider: {
    fontSize: 20,
    color: '#9ca3af',
    flexShrink: 0,
  },
  exampleEnglish: {
    fontSize: 16,
    color: '#374151',
    flexShrink: 1,
    flex: 1,
    fontWeight: '400',
  },
  exampleEnglishVertical: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  audioButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleSeparator: {
    height: 12,
  },
  practiceContent: {
    padding: 16,
    paddingBottom: 32,
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
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3A86FF',
    borderRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  optionButtonSelected: {
    borderColor: '#3A86FF',
    backgroundColor: '#eff6ff',
  },
  optionButtonCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  optionButtonIncorrect: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  feedbackBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  completedCard: {
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
  completedEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  completedScore: {
    fontWeight: '700',
    color: '#dc2626',
  },
  completedTotal: {
    fontWeight: '700',
    color: '#111827',
  },
  completedPercentage: {
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
    fontWeight: '700',
    color: '#ffffff',
  },
});

