import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import MonthCard from '../components/MonthCard';
import PhraseCard from '../components/PhraseCard';

const { width } = Dimensions.get('window');

const LESSON_ID = '4'; // Months lesson ID

// Helper function to get audio filename for each month
function getMonthAudioFile(ku: string): string {
  const mapping: Record<string, string> = {
    "çile": "cile",
    "sibat": "sibat",
    "adar": "adar",
    "nîsan": "nisan",
    "gulan": "gulan",
    "hezîran": "heziran",
    "tîrmeh": "tirmeh",
    "tebax": "tebax",
    "îlon": "ilon",
    "cotmeh": "cotmeh",
    "mijdar": "mijdar",
    "kanûn": "kanun",
  };
  return mapping[ku] || ku.toLowerCase();
}

// Months data
const months = [
  { ku: "çile", en: "January", icon: "❄️", season: "Winter", order: 1 },
  { ku: "sibat", en: "February", icon: "🌨️", season: "Winter", order: 2 },
  { ku: "adar", en: "March", icon: "🌸", season: "Spring", order: 3 },
  { ku: "nîsan", en: "April", icon: "🌺", season: "Spring", order: 4 },
  { ku: "gulan", en: "May", icon: "🌷", season: "Spring", order: 5 },
  { ku: "hezîran", en: "June", icon: "☀️", season: "Summer", order: 6 },
  { ku: "tîrmeh", en: "July", icon: "🌞", season: "Summer", order: 7 },
  { ku: "tebax", en: "August", icon: "🌻", season: "Summer", order: 8 },
  { ku: "îlon", en: "September", icon: "🍂", season: "Fall", order: 9 },
  { ku: "cotmeh", en: "October", icon: "🍁", season: "Fall", order: 10 },
  { ku: "mijdar", en: "November", icon: "🌧️", season: "Fall", order: 11 },
  { ku: "kanûn", en: "December", icon: "🎄", season: "Winter", order: 12 }
];

const timePhrases = [
  { ku: "Ev meh", en: "This month", filename: "ev-meh" },
  { ku: "Meha din", en: "Next month", filename: "meha-din" },
  { ku: "Meha borî", en: "Last month", filename: "meha-bori" },
];

const monthPhrases = [
  { ku: "Di çileyê de", en: "In January", filename: "di-cileye-de" },
  { ku: "Her meh", en: "Every month", filename: "her-meh" },
];

const usageExamples = [
  { ku: "Îro çi meh e?", en: "What month is it?", filename: "iro-ci-meh-e" },
  { ku: "Çile ye.", en: "It's January", filename: "cile-ye" },
  { ku: "Roja jidayikbûna min di gulanê de ye.", en: "My birthday is in May", filename: "roja-jidayikbuna-min-di-gulane-de-ye" },
  { ku: "Bihar di adarê de dest pê dike.", en: "Spring starts in March", filename: "bihar-di-adare-de-dest-pe-dike" },
  { ku: "Ez di hezîranê de diçim betlaneyê.", en: "I go on vacation in June", filename: "ez-di-hezirane-de-dicim-betlaneye" },
  { ku: "Zivistan di kanûnê de dest pê dike.", en: "Winter starts in December", filename: "zivistan-di-kanune-de-dest-pe-dike" },
  { ku: "Meha borî çi meh bû?", en: "What month was last month?", filename: "meha-bori-ci-meh-bu" },
  { ku: "Meha din çi meh e?", en: "What month is next month?", filename: "meha-din-ci-meh-e" },
];

// Audio asset map - Note: Audio files need to be added to mobile/assets/audio/months/
const audioAssets: Record<string, any> = {
  // Months
  'cile': require('../../assets/audio/months/cile.mp3'),
  'sibat': require('../../assets/audio/months/sibat.mp3'),
  'adar': require('../../assets/audio/months/adar.mp3'),
  'nisan': require('../../assets/audio/months/nisan.mp3'),
  'gulan': require('../../assets/audio/months/gulan.mp3'),
  'heziran': require('../../assets/audio/months/heziran.mp3'),
  'tirmeh': require('../../assets/audio/months/tirmeh.mp3'),
  'tebax': require('../../assets/audio/months/tebax.mp3'),
  'ilon': require('../../assets/audio/months/ilon.mp3'),
  'cotmeh': require('../../assets/audio/months/cotmeh.mp3'),
  'mijdar': require('../../assets/audio/months/mijdar.mp3'),
  'kanun': require('../../assets/audio/months/kanun.mp3'),
  // Time phrases
  'ev-meh': require('../../assets/audio/months/ev-meh.mp3'),
  'meha-din': require('../../assets/audio/months/meha-din.mp3'),
  'meha-bori': require('../../assets/audio/months/meha-bori.mp3'),
  // Month phrases
  'di-cileye-de': require('../../assets/audio/months/di-cileye-de.mp3'),
  'her-meh': require('../../assets/audio/months/her-meh.mp3'),
  // Usage examples
  'iro-ci-meh-e': require('../../assets/audio/months/iro-ci-meh-e.mp3'),
  'cile-ye': require('../../assets/audio/months/cile-ye.mp3'),
  'roja-jidayikbuna-min-di-gulane-de-ye': require('../../assets/audio/months/roja-jidayikbuna-min-di-gulane-de-ye.mp3'),
  'bihar-di-adare-de-dest-pe-dike': require('../../assets/audio/months/bihar-di-adare-de-dest-pe-dike.mp3'),
  'ez-di-hezirane-de-dicim-betlaneye': require('../../assets/audio/months/ez-di-hezirane-de-dicim-betlaneye.mp3'),
  'zivistan-di-kanune-de-dest-pe-dike': require('../../assets/audio/months/zivistan-di-kanune-de-dest-pe-dike.mp3'),
  'meha-bori-ci-meh-bu': require('../../assets/audio/months/meha-bori-ci-meh-bu.mp3'),
  'meha-din-ci-meh-e': require('../../assets/audio/months/meha-din-ci-meh-e.mp3'),
};

// Get current month index (1 = January, 12 = December)
function getCurrentMonthIndex(): number {
  return new Date().getMonth() + 1; // JavaScript months are 0-11, our order is 1-12
}

type MonthItem = {
  ku: string;
  en: string;
  icon: string;
  season: string;
  order: number;
};

export default function MonthsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();

  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [practiceGame, setPracticeGame] = useState<'order' | 'matching'>('order');

  // Month order quiz state
  const [shuffledMonths, setShuffledMonths] = useState(months);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [orderFeedback, setOrderFeedback] = useState<boolean | null>(null);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ ku: string; en: string; matched: boolean }>>([]);
  const [shuffledKurdish, setShuffledKurdish] = useState<string[]>([]);
  const [shuffledEnglish, setShuffledEnglish] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'ku' | 'en'; value: string } | null>(null);
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 });
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'ku' | 'en'; value: string }>>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
      return;
    }

    // Mark lesson as in progress on mount
    const progress = getLessonProgress(LESSON_ID);
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
  }, [isAuthenticated]);

  // Initialize month order quiz
  const initializeOrderQuiz = () => {
    const shuffled = [...months].sort(() => Math.random() - 0.5);
    setShuffledMonths(shuffled);
    setSelectedOrder([]);
    setOrderFeedback(null);
    setOrderCompleted(false);
  };

  // Initialize matching game
  const initializeMatching = () => {
    const pairs = months.map(m => ({ ku: m.ku, en: m.en, matched: false }));
    const kurdish = months.map(m => m.ku).sort(() => Math.random() - 0.5);
    const english = months.map(m => m.en).sort(() => Math.random() - 0.5);

    setMatchingPairs(pairs);
    setShuffledKurdish(kurdish);
    setShuffledEnglish(english);
    setSelectedMatch(null);
    setMatchScore({ correct: 0, total: 0 });
    setIncorrectMatches([]);
  };

  // Initialize exercises when switching to practice mode
  useEffect(() => {
    if (mode === 'practice') {
      if (practiceGame === 'order') initializeOrderQuiz();
      if (practiceGame === 'matching') initializeMatching();
    }
  }, [mode, practiceGame]);

  // Handle month order selection
  const handleMonthSelect = (monthKu: string) => {
    if (selectedOrder.includes(monthKu)) {
      setSelectedOrder(prev => prev.filter(m => m !== monthKu));
    } else {
      setSelectedOrder(prev => [...prev, monthKu]);
    }
  };

  // Check month order
  const checkMonthOrder = () => {
    const correctOrder = months.map(m => m.ku);
    const isCorrect = JSON.stringify(selectedOrder) === JSON.stringify(correctOrder);
    setOrderFeedback(isCorrect);
    if (isCorrect) {
      setOrderCompleted(true);
      updateLessonProgress(LESSON_ID, 100, 'COMPLETED');
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
            setMatchingPairs(prev => prev.map(p =>
              p.ku === kuValue ? { ...p, matched: true } : p
            ));
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
            setMatchingPairs(prev => prev.map(p =>
              p.ku === kuValue ? { ...p, matched: true } : p
            ));
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

        // Check if all matched
        if (matchingPairs.every(p => p.matched || (p.ku === (type === 'ku' ? value : selectedMatch.value) && p.en === (type === 'en' ? value : selectedMatch.value)))) {
          const allMatched = matchingPairs.every(p => p.matched);
          if (allMatched) {
            updateLessonProgress(LESSON_ID, 100, 'COMPLETED');
          }
        }
      } else {
        setSelectedMatch({ type, value });
        setIncorrectMatches([]);
      }
    }
  };

  const handleAudioPlay = () => {
    const progress = getLessonProgress(LESSON_ID);
    const newProgress = Math.min(100, progress.progress + 2);
    updateLessonProgress(LESSON_ID, newProgress, 'IN_PROGRESS');
  };

  const progress = getLessonProgress(LESSON_ID);
  const currentMonthIndex = getCurrentMonthIndex();

  const renderMonth = ({ item, index }: { item: MonthItem; index: number }) => {
    const audioFile = getMonthAudioFile(item.ku);
    const padding = 12 * 2; // listContent padding on both sides
    const cardMargin = 6; // MonthCard has margin: 6 on all sides
    const gap = cardMargin * 2; // gap between items (margin on each side)
    const cardWidth = (width - padding - gap) / 2;
    return (
      <View style={{ width: cardWidth }}>
        <MonthCard
          month={item}
          audioFile={audioFile}
          audioAssets={audioAssets}
          onPlay={handleAudioPlay}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Months of the Year</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Info */}
      <View style={styles.progressInfoContainer}>
        <Text style={styles.progressInfoText}>
          <Text style={styles.progressInfoLabel}>Progress: </Text>
          <Text style={[
            styles.progressInfoValue,
            progress.progress === 100 && styles.progressInfoComplete
          ]}>
            {Math.round(progress.progress)}%
          </Text>
          <Text style={styles.progressInfoSeparator}> • </Text>
          <Text style={styles.progressInfoLabel}>Learn: </Text>
          <Text style={[
            styles.progressInfoValue,
            Math.floor((progress.progress / 100) * months.length) === months.length && styles.progressInfoComplete
          ]}>
            {Math.floor((progress.progress / 100) * months.length)}/{months.length}
          </Text>
          <Text style={styles.progressInfoSeparator}> • </Text>
          <Text style={styles.progressInfoLabel}>Practice: </Text>
          <Text style={[
            styles.progressInfoValue,
            progress.status === 'COMPLETED' && styles.progressInfoComplete
          ]}>
            {progress.status === 'COMPLETED' ? 'Done' : 'Pending'}
          </Text>
        </Text>
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
              Month Order
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
          data={months}
          renderItem={renderMonth}
          keyExtractor={(item) => item.ku}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          ListFooterComponent={
            <>
              {/* Year Calendar Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={24} color="#3A86FF" />
                  <Text style={styles.sectionTitle}>Year Calendar</Text>
                </View>
                <View style={styles.calendarContainer}>
                  <FlatList
                    data={months}
                    numColumns={3}
                    scrollEnabled={false}
                    keyExtractor={(item) => item.ku}
                    renderItem={({ item: month, index }) => {
                      const isCurrentMonth = month.order === currentMonthIndex;
                      const padding = 16 * 2; // padding on both sides
                      const gap = 8; // gap between items
                      const cardWidth = (width - padding - gap * 2) / 3;
                      const isLastInRow = (index + 1) % 3 === 0;
                      return (
                        <View
                          style={[
                            styles.calendarMonth,
                            { width: cardWidth },
                            !isLastInRow && styles.calendarMonthMarginRight,
                            isCurrentMonth && styles.calendarMonthCurrent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarMonthShort,
                              isCurrentMonth && styles.calendarMonthTextCurrent,
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.7}
                          >
                            {month.en}
                          </Text>
                          <Text
                            style={[
                              styles.calendarMonthKurdish,
                              isCurrentMonth && styles.calendarMonthTextCurrent,
                            ]}
                            numberOfLines={2}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.85}
                          >
                            {month.ku.charAt(0).toUpperCase() + month.ku.slice(1)}
                          </Text>
                          {isCurrentMonth && (
                            <Text 
                              style={styles.calendarMonthCurrentLabel} 
                              numberOfLines={1}
                              adjustsFontSizeToFit={true}
                              minimumFontScale={0.8}
                            >
                              Now
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
                      onPlay={handleAudioPlay}
                    />
                  ))}
                </View>
              </View>

              {/* Month Phrases Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={24} color="#059669" />
                  <Text style={styles.sectionTitle}>Month Phrases</Text>
                </View>
                <View style={styles.phrasesList}>
                  {monthPhrases.map((phrase, index) => (
                    <PhraseCard
                      key={index}
                      kurdish={phrase.ku}
                      english={phrase.en}
                      audioFile={phrase.filename}
                      audioAssets={audioAssets}
                      onPlay={handleAudioPlay}
                    />
                  ))}
                </View>
              </View>

              {/* Seasons Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🌍 Seasons</Text>
                </View>
                <View style={styles.seasonsGrid}>
                  <View style={styles.seasonCard}>
                    <Text style={styles.seasonIcon}>🌸</Text>
                    <Text style={styles.seasonKurdish}>Bihar</Text>
                    <Text style={styles.seasonEnglish}>Spring</Text>
                    <Text style={styles.seasonMonths}>Adar, Nîsan, Gulan</Text>
                  </View>
                  <View style={styles.seasonCard}>
                    <Text style={styles.seasonIcon}>☀️</Text>
                    <Text style={styles.seasonKurdish}>Havîn</Text>
                    <Text style={styles.seasonEnglish}>Summer</Text>
                    <Text style={styles.seasonMonths}>Hezîran, Tîrmeh, Tebax</Text>
                  </View>
                  <View style={styles.seasonCard}>
                    <Text style={styles.seasonIcon}>🍂</Text>
                    <Text style={styles.seasonKurdish}>Payiz</Text>
                    <Text style={styles.seasonEnglish}>Fall</Text>
                    <Text style={styles.seasonMonths}>Îlon, Cotmeh, Mijdar</Text>
                  </View>
                  <View style={styles.seasonCard}>
                    <Text style={styles.seasonIcon}>❄️</Text>
                    <Text style={styles.seasonKurdish}>Zivistan</Text>
                    <Text style={styles.seasonEnglish}>Winter</Text>
                    <Text style={styles.seasonMonths}>Çile, Sibat, Kanûn</Text>
                  </View>
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
                      onPlay={handleAudioPlay}
                    />
                  ))}
                </View>
              </View>
            </>
          }
        />
      )}

      {/* Practice Mode - Month Order Quiz */}
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
                <Text style={styles.practiceTitle}>Arrange Months in Order</Text>
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
                <Text style={styles.completedText}>You arranged the months correctly!</Text>
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
                        Click months below to arrange them in order
                      </Text>
                    ) : (
                      selectedOrder.map((monthKu, index) => {
                        const month = months.find(m => m.ku === monthKu);
                        return (
                          <Pressable
                            key={index}
                            onPress={() => handleMonthSelect(monthKu)}
                            style={styles.selectedOrderTag}
                          >
                            <Text style={styles.selectedOrderTagText}>
                              {month ? month.ku.charAt(0).toUpperCase() + month.ku.slice(1) : ''}
                            </Text>
                          </Pressable>
                        );
                      })
                    )}
                  </View>
                </View>

                <FlatList
                  data={shuffledMonths}
                  numColumns={2}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.ku}
                  renderItem={({ item: month, index }) => {
                    const isSelected = selectedOrder.includes(month.ku);
                    const containerPadding = 20 * 2; // practiceContainer padding on both sides
                    const cardPadding = 16 * 2; // practiceCard padding on both sides
                    const gap = 12; // gap between items
                    const cardWidth = (width - containerPadding - cardPadding - gap) / 2;
                    return (
                      <View style={[{ width: cardWidth, flexShrink: 0, flexGrow: 0 }, index % 2 === 0 && styles.shuffledMonthButtonWrapperMarginRight]}>
                        <Pressable
                          onPress={() => handleMonthSelect(month.ku)}
                          style={[
                            styles.shuffledMonthButton,
                            isSelected && styles.shuffledMonthButtonSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.shuffledMonthText,
                              isSelected && styles.shuffledMonthTextSelected,
                            ]}
                          >
                            {month.ku.charAt(0).toUpperCase() + month.ku.slice(1)}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  }}
                  columnWrapperStyle={styles.shuffledMonthsRow}
                  contentContainerStyle={styles.shuffledMonthsGrid}
                />

                <View style={styles.checkButtonContainer}>
                  <Pressable
                    onPress={checkMonthOrder}
                    disabled={selectedOrder.length !== 12}
                    style={[
                      styles.checkButton,
                      selectedOrder.length !== 12 && styles.checkButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkButtonText,
                        selectedOrder.length !== 12 && styles.checkButtonTextDisabled,
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
                <Text style={styles.practiceTitle}>Match Months</Text>
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
              {/* Kurdish Months Column */}
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

              {/* English Months Column */}
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
                <Text style={styles.completedText}>You matched all months correctly!</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
  },
  pressed: {
    backgroundColor: '#f3f4f6',
    opacity: 0.8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  progressInfoContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  progressInfoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    flexWrap: 'nowrap',
  },
  progressInfoLabel: {
    fontWeight: '600',
    color: '#374151',
  },
  progressInfoValue: {
    fontWeight: '700',
    color: '#6b7280',
  },
  progressInfoComplete: {
    color: '#10b981',
  },
  progressInfoSeparator: {
    color: '#9ca3af',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
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
  calendarMonth: {
    flexShrink: 0,
    flexGrow: 0,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 90,
    marginBottom: 8,
  },
  calendarMonthMarginRight: {
    marginRight: 8,
  },
  calendarMonthCurrent: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  calendarMonthShort: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textAlign: 'center',
  },
  calendarMonthKurdish: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 16,
  },
  calendarMonthTextCurrent: {
    color: '#ffffff',
  },
  calendarMonthCurrentLabel: {
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
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  seasonCard: {
    flex: 1,
    minWidth: (width - 48 - 12) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  seasonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  seasonKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  seasonEnglish: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  seasonMonths: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
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
  shuffledMonthsGrid: {
    paddingBottom: 0,
    marginBottom: 24,
  },
  shuffledMonthsRow: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  shuffledMonthButtonWrapperMarginRight: {
    marginRight: 12,
  },
  shuffledMonthButton: {
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
  shuffledMonthButtonSelected: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  shuffledMonthText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  shuffledMonthTextSelected: {
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

