import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { restoreRefsFromProgress } from '../../lib/utils/progressHelper';
import { useLessonProgressTimer } from '../../lib/utils/useLessonProgressTimer';
import DayCard from '../components/DayCard';
import PhraseCard from '../components/PhraseCard';

const { width } = Dimensions.get('window');

const LESSON_ID = '3'; // Days lesson ID

// Helper function to get audio filename for each day
function getDayAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "yekşem": "yeksem",
    "duşem": "dusem",
    "sêşem": "sesem",
    "çarşem": "carsem",
    "pêncşem": "pencsem",
    "în": "in",
    "şemî": "semi",
  };
  return mapping[ku] || ku.toLowerCase();
}

// Days data
const days = [
  { ku: "yekşem", en: "Sunday", description: "First day of the week", order: 1 },
  { ku: "duşem", en: "Monday", description: "Second day of the week", order: 2 },
  { ku: "sêşem", en: "Tuesday", description: "Third day of the week", order: 3 },
  { ku: "çarşem", en: "Wednesday", description: "Fourth day of the week", order: 4 },
  { ku: "pêncşem", en: "Thursday", description: "Fifth day of the week", order: 5 },
  { ku: "în", en: "Friday", description: "Sixth day of the week", order: 6 },
  { ku: "şemî", en: "Saturday", description: "Seventh day of the week", order: 7 }
];

const timePhrases = [
  { ku: "Îro", en: "Today", filename: "iro" },
  { ku: "Sibê", en: "Tomorrow", filename: "sibe" },
  { ku: "Duh", en: "Yesterday", filename: "duh" },
];

const weekPhrases = [
  { ku: "Ev hefte", en: "This week", filename: "ev-hefte" },
  { ku: "Hefteya din", en: "Next week", filename: "hefteya-din" },
];

const dayPhrases = [
  { ku: "Li duşemê", en: "On Monday", filename: "li-duseme" },
  { ku: "Her roj", en: "Every day", filename: "her-roj" },
];

const usageExamples = [
  { ku: "Îro duşem e.", en: "Today is Monday", filename: "iro-dusem-e" },
  { ku: "Sibê sêşem e.", en: "Tomorrow is Tuesday", filename: "sibe-sesem-e" },
  { ku: "Duh yekşem bû.", en: "Yesterday was Sunday", filename: "duh-yeksem-bu" },
  { ku: "Îro çi roj e?", en: "What day is it?", filename: "iro-ci-roj-e" },
  { ku: "Ez diçim dibistanê li duşemê.", en: "I go to school on Monday", filename: "ez-dicim-dibistane-li-duseme" },
  { ku: "Em li înê bêhna xwe vedidim.", en: "We rest on Friday", filename: "em-li-ine-behna-xwe-vedidim" },
  { ku: "Hefteya dawî şemî û yekşem e.", en: "The weekend is Saturday and Sunday", filename: "hefteya-dawi-semi-u-yeksem-e" },
  { ku: "Sibê çi roj e?", en: "What day is tomorrow?", filename: "sibe-ci-roj-e" },
];

// Audio asset map
const audioAssets: Record<string, any> = {
  // Days
  'yeksem': require('../../assets/audio/days/yeksem.mp3'),
  'dusem': require('../../assets/audio/days/dusem.mp3'),
  'sesem': require('../../assets/audio/days/sesem.mp3'),
  'carsem': require('../../assets/audio/days/carsem.mp3'),
  'pencsem': require('../../assets/audio/days/pencsem.mp3'),
  'in': require('../../assets/audio/days/in.mp3'),
  'semi': require('../../assets/audio/days/semi.mp3'),
  // Time phrases
  'iro': require('../../assets/audio/days/iro.mp3'),
  'sibe': require('../../assets/audio/days/sibe.mp3'),
  'duh': require('../../assets/audio/days/duh.mp3'),
  // Week phrases
  'ev-hefte': require('../../assets/audio/days/ev-hefte.mp3'),
  'hefteya-din': require('../../assets/audio/days/hefteya-din.mp3'),
  // Day phrases
  'li-duseme': require('../../assets/audio/days/li-duseme.mp3'),
  'her-roj': require('../../assets/audio/days/her-roj.mp3'),
  // Usage examples
  'iro-dusem-e': require('../../assets/audio/days/iro-dusem-e.mp3'),
  'sibe-sesem-e': require('../../assets/audio/days/sibe-sesem-e.mp3'),
  'duh-yeksem-bu': require('../../assets/audio/days/duh-yeksem-bu.mp3'),
  'iro-ci-roj-e': require('../../assets/audio/days/iro-ci-roj-e.mp3'),
  'ez-dicim-dibistane-li-duseme': require('../../assets/audio/days/ez-dicim-dibistane-li-duseme.mp3'),
  'em-li-ine-behna-xwe-vedidim': require('../../assets/audio/days/em-li-ine-behna-xwe-vedidim.mp3'),
  'hefteya-dawi-semi-u-yeksem-e': require('../../assets/audio/days/hefteya-dawi-semi-u-yeksem-e.mp3'),
  'sibe-ci-roj-e': require('../../assets/audio/days/sibe-ci-roj-e.mp3'),
};

// Get current day of week (0 = Sunday, 1 = Monday, etc.)
function getCurrentDayIndex(): number {
  const today = new Date().getDay();
  // Convert JavaScript day (0=Sunday) to our order (1=Sunday)
  return today === 0 ? 1 : today + 1;
}

type DayItem = {
  ku: string;
  en: string;
  description: string;
  order: number;
};

export default function DaysPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();

  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 22, // 7 days + 3 time phrases + 2 week phrases + 2 day phrases + 8 usage examples
    hasPractice: true,
    audioWeight: 30,
    timeWeight: 20,
    practiceWeight: 50,
    audioMultiplier: 1.36, // 30% / 22 audios ≈ 1.36% per audio
  };
  
  // Snapshot of played keys for dimming (restored from storage on mount)
  const [playedKeysSnapshot, setPlayedKeysSnapshot] = useState<string[]>(() => getLessonProgress(LESSON_ID).playedAudioKeys || []);

  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID);
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set((storedProgress.playedAudioKeys || []) as string[]));
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);

  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [practiceGame, setPracticeGame] = useState<'order' | 'matching'>('order');

  // Day order quiz state
  const [shuffledDays, setShuffledDays] = useState(days);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<boolean | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderScore, setOrderScore] = useState<number | undefined>(undefined);

  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ ku: string; en: string; matched: boolean }>>([]);
  const [shuffledKurdish, setShuffledKurdish] = useState<string[]>([]);
  const [shuffledEnglish, setShuffledEnglish] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'ku' | 'en'; value: string } | null>(null);
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 });
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'ku' | 'en'; value: string }>>([]);
  const [matchingCompleted, setMatchingCompleted] = useState(false);
  const [matchingScore, setMatchingScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
      return;
    }

    const progress = getLessonProgress(LESSON_ID);
    console.log('🚀 Days page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
    });
    
    // Mark lesson as in progress on mount
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
  }, [isAuthenticated]);

  // Initialize day order quiz
  const initializeOrderQuiz = () => {
    const shuffled = [...days].sort(() => Math.random() - 0.5);
    setShuffledDays(shuffled);
    setSelectedOrder([]);
    setOrderFeedback(null);
    setOrderCompleted(false);
    setOrderScore(undefined);
  };

  // Initialize matching game
  const initializeMatching = () => {
    const pairs = days.map(d => ({ ku: d.ku, en: d.en, matched: false }));
    const kurdish = days.map(d => d.ku).sort(() => Math.random() - 0.5);
    const english = days.map(d => d.en).sort(() => Math.random() - 0.5);

    setMatchingPairs(pairs);
    setShuffledKurdish(kurdish);
    setShuffledEnglish(english);
    setSelectedMatch(null);
    setMatchScore({ correct: 0, total: 0 });
    setIncorrectMatches([]);
    setMatchingCompleted(false);
    setMatchingScore(undefined);
  };

  // Initialize exercises when switching to practice mode
  useEffect(() => {
    if (mode === 'practice') {
      if (practiceGame === 'order') initializeOrderQuiz();
      if (practiceGame === 'matching') initializeMatching();
    }
  }, [mode, practiceGame]);

  // Use useEffect to watch for both games being completed
  useEffect(() => {
    console.log('🔍 Practice completion check:', {
      orderCompleted,
      matchingCompleted,
      orderScore,
      matchingScore,
    });
    
    if (orderCompleted && matchingCompleted && orderScore !== undefined && matchingScore !== undefined) {
      // Both games completed - calculate combined practice score
      const combinedScore = (orderScore + matchingScore) / 2;
      const isPracticePassed = combinedScore >= 70;
      
      console.log('🎯 Both practice games completed:', {
        orderScore,
        matchingScore,
        combinedScore,
        isPracticePassed,
      });
      
      // Calculate total time spent (base + session)
      const currentProgress = getLessonProgress(LESSON_ID);
      const baseTimeSpent = currentProgress?.timeSpent || 0;
      const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
      const safeTimeSpent = Math.min(1000, totalTimeSpent);
      
      const progress = calculateProgress(isPracticePassed ? combinedScore : undefined);
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS';
      
      console.log('💾 Updating lesson progress:', {
        progress,
        status,
        combinedScore,
        isPracticePassed,
        safeTimeSpent,
      });
      
      // Pass total time spent (not session only) - updateLessonProgress will handle it correctly
      updateLessonProgress(LESSON_ID, progress, status, isPracticePassed ? combinedScore : undefined, safeTimeSpent);
    } else {
      console.log('⏳ Waiting for both games to complete...');
    }
  }, [orderCompleted, matchingCompleted, orderScore, matchingScore]);

  // Handle day order selection
  const handleDaySelect = (dayKu: string) => {
    if (selectedOrder.includes(dayKu)) {
      setSelectedOrder(prev => prev.filter(d => d !== dayKu));
    } else {
      setSelectedOrder(prev => [...prev, dayKu]);
    }
  };

  // Check day order
  const checkDayOrder = () => {
    const correctOrder = days.map(d => d.ku);
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(correctOrder);
    setOrderFeedback(isCorrect);
    if (isCorrect) {
      const score = 100; // Perfect score for correct order
      setOrderScore(score);
      setOrderCompleted(true);
      // Don't update progress here - wait for both games to complete
    }
  };

  // Handle matching game selection
  const handleMatchSelect = (type: 'ku' | 'en', value: string) => {
    if (!selectedMatch) {
      setSelectedMatch({ type, value });
      setIncorrectMatches([]);
    } else {
      if (selectedMatch.type !== type) {
        let isCorrect = false;

        if (type === 'ku' && selectedMatch.type === 'en') {
          const enValue = selectedMatch.value;
          const kuValue = value;
          const pair = matchingPairs.find(p => p.ku === kuValue && p.en === enValue);
          if (pair && !pair.matched) {
            isCorrect = true;
            setMatchingPairs(prev => {
              const updated = prev.map(p =>
                p.ku === kuValue ? { ...p, matched: true } : p
              );
              // Check if all matched after update
              if (updated.every(p => p.matched) && !matchingCompleted) {
                // Calculate practice score (matching game)
                const currentScore = matchScore.total > 0 
                  ? Math.round(((matchScore.correct + 1) / (matchScore.total + 1)) * 100)
                  : 100;
                
                console.log('✅ Matching game completed:', {
                  correct: matchScore.correct + 1,
                  total: matchScore.total + 1,
                  score: currentScore,
                });
                
                // Use setTimeout to ensure state updates happen after this update
                setTimeout(() => {
                  setMatchingCompleted(true);
                  setMatchingScore(currentScore);
                }, 0);
              }
              return updated;
            });
            setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
          } else {
            setMatchScore(prev => ({ ...prev, total: prev.total + 1 }));
            setIncorrectMatches([
              { type: 'ku', value: kuValue },
              { type: 'en', value: enValue }
            ]);
            setTimeout(() => {
              setIncorrectMatches([]);
              setSelectedMatch(null);
            }, 1000);
            return;
          }
        } else if (type === 'en' && selectedMatch.type === 'ku') {
          const kuValue = selectedMatch.value;
          const enValue = value;
          const pair = matchingPairs.find(p => p.ku === kuValue && p.en === enValue);
          if (pair && !pair.matched) {
            isCorrect = true;
            setMatchingPairs(prev => {
              const updated = prev.map(p =>
                p.ku === kuValue ? { ...p, matched: true } : p
              );
              // Check if all matched after update
              if (updated.every(p => p.matched) && !matchingCompleted) {
                // Calculate practice score (matching game)
                const currentScore = matchScore.total > 0 
                  ? Math.round(((matchScore.correct + 1) / (matchScore.total + 1)) * 100)
                  : 100;
                
                console.log('✅ Matching game completed:', {
                  correct: matchScore.correct + 1,
                  total: matchScore.total + 1,
                  score: currentScore,
                });
                
                // Use setTimeout to ensure state updates happen after this update
                setTimeout(() => {
                  setMatchingCompleted(true);
                  setMatchingScore(currentScore);
                }, 0);
              }
              return updated;
            });
            setMatchScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
          } else {
            setMatchScore(prev => ({ ...prev, total: prev.total + 1 }));
            setIncorrectMatches([
              { type: 'ku', value: kuValue },
              { type: 'en', value: enValue }
            ]);
            setTimeout(() => {
              setIncorrectMatches([]);
              setSelectedMatch(null);
            }, 1000);
            return;
          }
        }

        setSelectedMatch(null);
        setIncorrectMatches([]);
      } else {
        setSelectedMatch({ type, value });
        setIncorrectMatches([]);
      }
    }
  };

  const calculateProgress = (practiceScore?: number) => {
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
    
    // 1. Audio progress: from persisted played keys (exact count)
    const totalUniqueAudios = uniqueAudiosPlayedRef.current.size;
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios);
    const audioProgress = Math.min(30, (effectiveUniqueAudios / progressConfig.totalAudios) * 30);
    
    // 2. Time progress: Calculate from total time spent (max 20%, 4 minutes = 20%)
    const timeProgress = Math.min(20, totalTimeSpent * 5);
    
    // 3. Practice progress: Only if practice was completed
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
    
    // 4. Total progress = audio + time + practice (capped at 100%)
    const totalProgress = Math.min(100, audioProgress + timeProgress + practiceProgress);
    
    console.log('📊 Progress calculation (from state):', {
      totalUniqueAudios,
      effectiveUniqueAudios,
      audioProgress: audioProgress.toFixed(2),
      totalTimeSpent,
      timeProgress: timeProgress.toFixed(2),
      practiceProgress: practiceProgress.toFixed(2),
      totalProgress: totalProgress.toFixed(2),
    });
    
    return totalProgress;
  };

  useLessonProgressTimer({
    lessonId: LESSON_ID,
    startTimeRef,
    calculateProgress: () => calculateProgress(),
    getLessonProgress,
    updateLessonProgress,
  });

  const handleAudioPlay = (audioKey: string) => {
    if (uniqueAudiosPlayedRef.current.has(audioKey)) return;

    uniqueAudiosPlayedRef.current.add(audioKey);
    setPlayedKeysSnapshot(Array.from(uniqueAudiosPlayedRef.current));

    const currentProgress = getLessonProgress(LESSON_ID);
    const progress = calculateProgress(undefined);
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS');
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const baseTimeSpent = currentProgress.timeSpent || 0;
    const safeBaseTimeSpent = baseTimeSpent > 10000 ? 0 : Math.max(baseTimeSpent, 0);
    const safeTimeSpent = Math.min(1000, safeBaseTimeSpent + Math.max(sessionTimeMinutes, 0));
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  const progress = getLessonProgress(LESSON_ID);
  const progressText = `${Math.round(progress.progress)}%`;
  
  const totalExamples = progressConfig.totalAudios;
  const learnedCount = Math.min(totalExamples, uniqueAudiosPlayedRef.current.size);
  const currentDayIndex = getCurrentDayIndex();

  const renderDay = ({ item, index }: { item: DayItem; index: number }) => {
    const audioFile = getDayAudioFile(item.ku);
    const audioKey = `day-${item.ku}`;
    const alreadyPlayed = playedKeysSnapshot.includes(audioKey);
    const padding = 12 * 2;
    const cardMargin = 6;
    const gap = cardMargin * 2;
    const cardWidth = (width - padding - gap) / 2;
    return (
      <View style={{ width: cardWidth }}>
        <DayCard
          day={item}
          audioFile={audioFile}
          audioAssets={audioAssets}
          onPlay={() => handleAudioPlay(audioKey)}
          style={alreadyPlayed ? styles.playedCard : undefined}
        />
      </View>
    );
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Days of the Week</Text>
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

      {/* Practice Mode - Game Selector Tabs */}
      {mode === 'practice' && (
        <View style={styles.segmentedControl}>
          <Pressable
            onPress={() => setPracticeGame('order')}
            style={({ pressed }) => [
              styles.segmentedButton,
              styles.segmentedButtonLeft,
              practiceGame === 'order' && styles.segmentedButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="shuffle"
              size={16}
              color={practiceGame === 'order' ? '#ffffff' : '#4b5563'}
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentedButtonText,
                practiceGame === 'order' && styles.segmentedButtonTextActive,
              ]}
            >
              Day Order
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPracticeGame('matching')}
            style={({ pressed }) => [
              styles.segmentedButton,
              styles.segmentedButtonRight,
              practiceGame === 'matching' && styles.segmentedButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="shuffle"
              size={16}
              color={practiceGame === 'matching' ? '#ffffff' : '#4b5563'}
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentedButtonText,
                practiceGame === 'matching' && styles.segmentedButtonTextActive,
              ]}
            >
              Matching
            </Text>
          </Pressable>
        </View>
      )}

      {/* Learn Mode */}
      {mode === 'learn' && (
        <FlatList
          data={days}
          renderItem={renderDay}
          keyExtractor={(item) => item.ku}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          ListFooterComponent={
            <>
              {/* Calendar Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={24} color="#3A86FF" />
                  <Text style={styles.sectionTitle}>Week Calendar</Text>
                </View>
                <View style={styles.calendarContainer}>
                  <FlatList
                    data={days}
                    numColumns={2}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.ku}
                    renderItem={({ item: day, index }) => {
                      const isToday = day.order === currentDayIndex;
                      const padding = 16 * 2; // padding on both sides
                      const gap = 8; // gap between items
                      const cardWidth = (width - padding - gap) / 2;
                      const isLastInRow = index % 2 === 1; // odd indices are last in row
                      return (
                        <View
                          style={[
                            styles.calendarDay,
                            { width: cardWidth },
                            !isLastInRow && styles.calendarDayMarginRight,
                            isToday && styles.calendarDayToday,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarDayShort,
                              isToday && styles.calendarDayTextToday,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.7}
                          >
                            {day.en}
                          </Text>
                          <Text
                            style={[
                              styles.calendarDayKurdish,
                              isToday && styles.calendarDayTextToday,
                            ]}
                            numberOfLines={2}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.85}
                          >
                            {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
                          </Text>
                          {isToday && (
                            <Text 
                              style={styles.calendarDayTodayLabel} 
                              numberOfLines={1}
                              adjustsFontSizeToFit={true}
                              minimumFontScale={0.8}
                            >
                              Today
                            </Text>
                          )}
                        </View>
                      );
                    }}
                    columnWrapperStyle={styles.calendarRow}
                    contentContainerStyle={styles.calendarListContent}
                  />
                </View>
              </View>

              {/* Time Phrases Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="time" size={24} color="#f59e0b" />
                  <Text style={styles.sectionTitle}>Time Phrases</Text>
                </View>
                <View style={styles.phrasesList}>
                  {timePhrases.map((phrase, index) => (
                    <PhraseCard
                      key={index}
                      kurdish={phrase.ku}
                      english={phrase.en}
                      audioFile={phrase.filename}
                      audioAssets={audioAssets}
                      onPlay={() => handleAudioPlay(`time-phrase-${phrase.filename}`)}
                    />
                  ))}
                </View>
              </View>

              {/* Week Phrases Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={24} color="#059669" />
                  <Text style={styles.sectionTitle}>Week Phrases</Text>
                </View>
                <View style={styles.phrasesList}>
                  {weekPhrases.map((phrase, index) => (
                    <PhraseCard
                      key={index}
                      kurdish={phrase.ku}
                      english={phrase.en}
                      audioFile={phrase.filename}
                      audioAssets={audioAssets}
                      onPlay={() => handleAudioPlay(`week-phrase-${phrase.filename}`)}
                    />
                  ))}
                </View>
              </View>

              {/* Day Phrases Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-clear" size={24} color="#7c3aed" />
                  <Text style={styles.sectionTitle}>Day Phrases</Text>
                </View>
                <View style={styles.phrasesList}>
                  {dayPhrases.map((phrase, index) => (
                    <PhraseCard
                      key={index}
                      kurdish={phrase.ku}
                      english={phrase.en}
                      audioFile={phrase.filename}
                      audioAssets={audioAssets}
                      onPlay={() => handleAudioPlay(`day-phrase-${phrase.filename}`)}
                    />
                  ))}
                </View>
              </View>

              {/* Usage Examples Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb" size={24} color="#dc2626" />
                  <Text style={styles.sectionTitle}>Usage Examples</Text>
                </View>
                <View style={styles.examplesList}>
                  {usageExamples.map((example, index) => (
                    <PhraseCard
                      key={index}
                      kurdish={example.ku}
                      english={example.en}
                      audioFile={example.filename}
                      audioAssets={audioAssets}
                      onPlay={() => handleAudioPlay(`example-${example.filename}`)}
                    />
                  ))}
                </View>
              </View>
            </>
          }
        />
      )}

      {/* Practice Mode - Day Order Quiz */}
      {mode === 'practice' && practiceGame === 'order' && (
        <ScrollView
          style={styles.practiceScrollView}
          contentContainerStyle={styles.practiceContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.practiceCard}>
            <View style={styles.practiceHeader}>
              <View style={styles.practiceHeaderLeft}>
                <Ionicons name="shuffle" size={24} color="#3A86FF" />
                <Text style={styles.practiceTitle}>Arrange Days in Order</Text>
              </View>
              <Pressable
                onPress={initializeOrderQuiz}
                style={({ pressed }) => [
                  styles.resetButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="refresh" size={18} color="#3A86FF" />
                <Text style={styles.resetButtonText}>Reset</Text>
              </Pressable>
            </View>

            {orderCompleted ? (
              <View style={styles.completedCard}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                <Text style={styles.completedTitle}>Perfect!</Text>
                <Text style={styles.completedText}>You arranged the days correctly!</Text>
                <Pressable
                  onPress={initializeOrderQuiz}
                  style={({ pressed }) => [
                    styles.tryAgainButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="refresh" size={20} color="#ffffff" />
                  <Text style={styles.tryAgainButtonText}>Try Again</Text>
              </Pressable>
            </View>
            ) : (
              <View>
                <View style={styles.selectedOrderContainer}>
                  <Text style={styles.selectedOrderLabel}>Selected order:</Text>
                  <View style={styles.selectedOrderBox}>
                    {selectedOrder.length === 0 ? (
                      <Text style={styles.selectedOrderPlaceholder}>
                        Click days below to arrange them in order
                      </Text>
                    ) : (
                      selectedOrder.map((dayKu, index) => {
                        const day = days.find(d => d.ku === dayKu);
                        return (
                          <Pressable
                            key={index}
                            onPress={() => handleDaySelect(dayKu)}
                            style={styles.selectedOrderTag}
                          >
                            <Text style={styles.selectedOrderTagText}>
                              {day ? day.ku.charAt(0).toUpperCase() + day.ku.slice(1) : ''}
                            </Text>
                          </Pressable>
                        );
                      })
                    )}
                  </View>
                </View>

                <FlatList
                  data={shuffledDays}
                  numColumns={2}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.ku}
                  renderItem={({ item: day, index }) => {
                    const isSelected = selectedOrder.includes(day.ku);
                    const containerPadding = 20 * 2; // practiceContainer padding on both sides
                    const cardPadding = 16 * 2; // practiceCard padding on both sides
                    const gap = 12; // gap between items
                    const cardWidth = (width - containerPadding - cardPadding - gap) / 2;
                    return (
                      <View style={[{ width: cardWidth, flexShrink: 0, flexGrow: 0 }, index % 2 === 0 && styles.shuffledDayButtonWrapperMarginRight]}>
                        <Pressable
                          onPress={() => handleDaySelect(day.ku)}
                          style={[
                            styles.shuffledDayButton,
                            isSelected && styles.shuffledDayButtonSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.shuffledDayText,
                              isSelected && styles.shuffledDayTextSelected,
                            ]}
                          >
                            {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  }}
                  columnWrapperStyle={styles.shuffledDaysRow}
                  contentContainerStyle={styles.shuffledDaysGrid}
                />

                <View style={styles.checkButtonContainer}>
                  <Pressable
                    onPress={checkDayOrder}
                    disabled={selectedOrder.length !== 7}
                    style={[
                      styles.checkButton,
                      selectedOrder.length !== 7 && styles.checkButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkButtonText,
                        selectedOrder.length !== 7 && styles.checkButtonTextDisabled,
                      ]}
                    >
                      Check Order
                    </Text>
                  </Pressable>
                </View>

                {orderFeedback !== null && !orderCompleted && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>Incorrect order. Try again!</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Practice Mode - Matching Game */}
      {mode === 'practice' && practiceGame === 'matching' && (
        <ScrollView
          style={styles.practiceScrollView}
          contentContainerStyle={styles.practiceContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.practiceCard}>
            <View style={styles.practiceHeader}>
              <View style={styles.practiceHeaderLeft}>
                <Ionicons name="shuffle" size={24} color="#3A86FF" />
                <Text style={styles.practiceTitle}>Match Days</Text>
              </View>
              <View style={styles.practiceHeaderRight}>
                <Text style={styles.scoreText}>
                  Score: {matchScore.correct}/{matchScore.total}
                </Text>
                <Pressable
                  onPress={initializeMatching}
                  style={({ pressed }) => [
                    styles.resetButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="refresh" size={18} color="#3A86FF" />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.matchingGrid}>
              {/* Kurdish Days Column */}
              <View style={styles.matchingColumn}>
                <Text style={styles.matchingColumnTitle}>Kurdish</Text>
                <View style={styles.matchingTilesGrid}>
                  {shuffledKurdish.map((ku, index) => {
                    const pair = matchingPairs.find(p => p.ku === ku);
                    const isMatched = pair?.matched || false;
                    const isSelected = selectedMatch?.type === 'ku' && selectedMatch.value === ku;
                    const isIncorrect = incorrectMatches.some(m => m.type === 'ku' && m.value === ku);
                    return (
                      <Pressable
                        key={`ku-${ku}-${index}`}
                        onPress={() => !isMatched && handleMatchSelect('ku', ku)}
                        disabled={isMatched}
                        style={[
                          styles.matchingTile,
                          isMatched && styles.matchingTileMatched,
                          isIncorrect && styles.matchingTileIncorrect,
                          isSelected && styles.matchingTileSelected,
                        ]}
                      >
                        <Text style={styles.matchingTileText}>{ku}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* English Days Column */}
              <View style={styles.matchingColumn}>
                <Text style={styles.matchingColumnTitle}>English</Text>
                <View style={styles.matchingTilesGrid}>
                  {shuffledEnglish.map((en, index) => {
                    const pair = matchingPairs.find(p => p.en === en);
                    const isMatched = pair?.matched || false;
                    const isSelected = selectedMatch?.type === 'en' && selectedMatch.value === en;
                    const isIncorrect = incorrectMatches.some(m => m.type === 'en' && m.value === en);
                    return (
                      <Pressable
                        key={`en-${en}-${index}`}
                        onPress={() => !isMatched && handleMatchSelect('en', en)}
                        disabled={isMatched}
                        style={[
                          styles.matchingTile,
                          isMatched && styles.matchingTileMatched,
                          isIncorrect && styles.matchingTileIncorrect,
                          isSelected && styles.matchingTileSelected,
                        ]}
                      >
                        <Text style={styles.matchingTileText}>{en}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {matchingPairs.every(p => p.matched) && (
              <View style={styles.completedCard}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                <Text style={styles.completedTitle}>Great job!</Text>
                <Text style={styles.completedText}>You matched all days correctly!</Text>
              </View>
            )}
          </View>
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
  pressed: { backgroundColor: '#f3f4f6', opacity: 0.8 },
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
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'flex-start',
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  calendarContainer: {
    paddingHorizontal: 16,
  },
  calendarListContent: {
    padding: 0,
  },
  calendarRow: {
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  calendarDay: {
    flexShrink: 0,
    flexGrow: 0,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 100,
  },
  calendarDayMarginRight: {
    marginRight: 8,
  },
  calendarDayToday: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  calendarDayShort: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  calendarDayKurdish: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 18,
  },
  calendarDayTextToday: {
    color: '#ffffff',
  },
  calendarDayTodayLabel: {
    fontSize: 8,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
    textAlign: 'center',
  },
  phrasesList: {
    gap: 12,
  },
  examplesList: {
    gap: 12,
  },
  // Practice styles
  practiceScrollView: {
    flex: 1,
  },
  practiceContainer: {
    padding: 20,
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  practiceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  practiceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A86FF',
  },
  selectedOrderContainer: {
    marginBottom: 16,
  },
  selectedOrderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  selectedOrderBox: {
    minHeight: 56,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedOrderPlaceholder: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  selectedOrderTag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3A86FF',
    borderRadius: 8,
  },
  selectedOrderTagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  shuffledDaysGrid: {
    paddingBottom: 0,
    marginBottom: 24,
  },
  shuffledDaysRow: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  shuffledDayButtonWrapperMarginRight: {
    marginRight: 12,
  },
  shuffledDayButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shuffledDayButtonSelected: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  shuffledDayText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  shuffledDayTextSelected: {
    color: '#ffffff',
  },
  checkButtonContainer: {
    marginTop: 8,
  },
  checkButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3A86FF',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  checkButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  checkButtonTextDisabled: {
    color: '#9ca3af',
  },
  feedbackContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  completedCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 16,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3A86FF',
  },
  tryAgainButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  matchingGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  matchingColumn: {
    flex: 1,
  },
  matchingColumnTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  matchingTilesGrid: {
    gap: 12,
  },
  matchingTile: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  matchingTileSelected: {
    borderColor: '#3A86FF',
    backgroundColor: '#eff6ff',
  },
  matchingTileMatched: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    opacity: 0.6,
  },
  matchingTileIncorrect: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  matchingTileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
