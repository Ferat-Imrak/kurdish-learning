import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import NumberCard from '../components/NumberCard';

const { width } = Dimensions.get('window');

const LESSON_ID = '2'; // Numbers lesson ID

// Helper function to get audio filename for each number
function getNumberAudioFile(ku: string): string {
  return ku
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

// Audio asset map - maps number audio filenames to require() paths
const audioAssets: Record<string, any> = {
  'bist': require('../../assets/audio/numbers/bist.mp3'),
  'bist-u-car': require('../../assets/audio/numbers/bist-u-car.mp3'),
  'bist-u-du': require('../../assets/audio/numbers/bist-u-du.mp3'),
  'bist-u-heft': require('../../assets/audio/numbers/bist-u-heft.mp3'),
  'bist-u-hest': require('../../assets/audio/numbers/bist-u-hest.mp3'),
  'bist-u-neh': require('../../assets/audio/numbers/bist-u-neh.mp3'),
  'bist-u-penc': require('../../assets/audio/numbers/bist-u-penc.mp3'),
  'bist-u-se': require('../../assets/audio/numbers/bist-u-se.mp3'),
  'bist-u-ses': require('../../assets/audio/numbers/bist-u-ses.mp3'),
  'bist-u-yek': require('../../assets/audio/numbers/bist-u-yek.mp3'),
  'car': require('../../assets/audio/numbers/car.mp3'),
  'carde': require('../../assets/audio/numbers/carde.mp3'),
  'cil': require('../../assets/audio/numbers/cil.mp3'),
  'dazde': require('../../assets/audio/numbers/dazde.mp3'),
  'deh': require('../../assets/audio/numbers/deh.mp3'),
  'du': require('../../assets/audio/numbers/du.mp3'),
  'heft': require('../../assets/audio/numbers/heft.mp3'),
  'hefte': require('../../assets/audio/numbers/hefte.mp3'),
  'hejde': require('../../assets/audio/numbers/hejde.mp3'),
  'hest': require('../../assets/audio/numbers/hest.mp3'),
  'heste': require('../../assets/audio/numbers/heste.mp3'),
  'hevde': require('../../assets/audio/numbers/hevde.mp3'),
  'neh': require('../../assets/audio/numbers/neh.mp3'),
  'not': require('../../assets/audio/numbers/not.mp3'),
  'nozde': require('../../assets/audio/numbers/nozde.mp3'),
  'pazde': require('../../assets/audio/numbers/pazde.mp3'),
  'penc': require('../../assets/audio/numbers/penc.mp3'),
  'penci': require('../../assets/audio/numbers/penci.mp3'),
  'sazde': require('../../assets/audio/numbers/sazde.mp3'),
  'se': require('../../assets/audio/numbers/se.mp3'),
  'sed': require('../../assets/audio/numbers/sed.mp3'),
  'ses': require('../../assets/audio/numbers/ses.mp3'),
  'sest': require('../../assets/audio/numbers/sest.mp3'),
  'sezde': require('../../assets/audio/numbers/sezde.mp3'),
  'si': require('../../assets/audio/numbers/si.mp3'),
  'yazde': require('../../assets/audio/numbers/yazde.mp3'),
  'yek': require('../../assets/audio/numbers/yek.mp3'),
  // Number usage examples audio
  'se-seven-min-hene': require('../../assets/audio/numbers/se-seven-min-hene.mp3'),
  'du-pirtuken-min-hene': require('../../assets/audio/numbers/du-pirtuken-min-hene.mp3'),
  'penc-kuren-min-hene': require('../../assets/audio/numbers/penc-kuren-min-hene.mp3'),
  'car-kecen-min-hene': require('../../assets/audio/numbers/car-kecen-min-hene.mp3'),
  'deh-zaroken-min-hene': require('../../assets/audio/numbers/deh-zaroken-min-hene.mp3'),
  'heft-rojen-min-hene': require('../../assets/audio/numbers/heft-rojen-min-hene.mp3'),
  'ses-kursiyen-min-hene': require('../../assets/audio/numbers/ses-kursiyen-min-hene.mp3'),
  'yek-male-min-heye': require('../../assets/audio/numbers/yek-male-min-heye.mp3'),
};

// Numbers 1-19
const basicNumbers: Record<number, { ku: string; en: string }> = {
  1: { ku: "yek", en: "one" },
  2: { ku: "du", en: "two" },
  3: { ku: "sê", en: "three" },
  4: { ku: "çar", en: "four" },
  5: { ku: "pênc", en: "five" },
  6: { ku: "şeş", en: "six" },
  7: { ku: "heft", en: "seven" },
  8: { ku: "heşt", en: "eight" },
  9: { ku: "neh", en: "nine" },
  10: { ku: "deh", en: "ten" },
  11: { ku: "yazde", en: "eleven" },
  12: { ku: "dazde", en: "twelve" },
  13: { ku: "sêzde", en: "thirteen" },
  14: { ku: "çarde", en: "fourteen" },
  15: { ku: "pazde", en: "fifteen" },
  16: { ku: "şazde", en: "sixteen" },
  17: { ku: "hevde", en: "seventeen" },
  18: { ku: "hejde", en: "eighteen" },
  19: { ku: "nozde", en: "nineteen" },
};

// Key numbers (20, 30, 40, 50, 60, 70, 80, 90, 100)
const keyNumbers: Record<number, { ku: string; en: string }> = {
  20: { ku: "bîst", en: "twenty" },
  30: { ku: "sî", en: "thirty" },
  40: { ku: "çil", en: "forty" },
  50: { ku: "pêncî", en: "fifty" },
  60: { ku: "şêst", en: "sixty" },
  70: { ku: "heftê", en: "seventy" },
  80: { ku: "heştê", en: "eighty" },
  90: { ku: "not", en: "ninety" },
  100: { ku: "sed", en: "one hundred" },
};

// Compound numbers (21-29)
const compoundNumbers: Record<number, { ku: string; en: string }> = {
  21: { ku: "bîst û yek", en: "twenty-one" },
  22: { ku: "bîst û du", en: "twenty-two" },
  23: { ku: "bîst û sê", en: "twenty-three" },
  24: { ku: "bîst û çar", en: "twenty-four" },
  25: { ku: "bîst û pênc", en: "twenty-five" },
  26: { ku: "bîst û şeş", en: "twenty-six" },
  27: { ku: "bîst û heft", en: "twenty-seven" },
  28: { ku: "bîst û heşt", en: "twenty-eight" },
  29: { ku: "bîst û neh", en: "twenty-nine" },
};

// Combine all numbers
const allNumbers = { ...basicNumbers, ...keyNumbers, ...compoundNumbers };

// Generate math problem
function generateMathProblem() {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;

  // Generate 3 wrong answers
  const wrongAnswers: number[] = [];
  const maxAnswer = Math.min(20, answer + 5);
  const minAnswer = Math.max(1, answer - 5);

  while (wrongAnswers.length < 3) {
    const wrongAnswer = Math.floor(Math.random() * (maxAnswer - minAnswer + 1)) + minAnswer;
    if (wrongAnswer !== answer && !wrongAnswers.includes(wrongAnswer) && allNumbers[wrongAnswer]) {
      wrongAnswers.push(wrongAnswer);
    }
  }

  // Combine correct answer with wrong answers and shuffle
  const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);

  return {
    num1,
    num2,
    answer,
    answerKu: allNumbers[answer]?.ku || '',
    question: `${allNumbers[num1]?.ku || ''} + ${allNumbers[num2]?.ku || ''} = ?`,
    options,
  };
}

// Number usage examples
const numberExamples = [
  { ku: "Sê sêvên min hene", en: "I have 3 apples", audioFile: "se-seven-min-hene" },
  { ku: "Du pirtûkên min hene", en: "I have 2 books", audioFile: "du-pirtuken-min-hene" },
  { ku: "Pênc kurên min hene", en: "I have 5 sons", audioFile: "penc-kuren-min-hene" },
  { ku: "Çar keçên min hene", en: "I have 4 daughters", audioFile: "car-kecen-min-hene" },
  { ku: "Deh zarokên min hene", en: "I have 10 children", audioFile: "deh-zaroken-min-hene" },
  { ku: "Heft rojên min hene", en: "I have 7 days", audioFile: "heft-rojen-min-hene" },
  { ku: "Şeş kursiyên min hene", en: "I have 6 chairs", audioFile: "ses-kursiyen-min-hene" },
  { ku: "Yek malê min heye", en: "I have 1 house", audioFile: "yek-male-min-heye" },
];

type NumberItem = {
  number: number;
  kurdish: string;
  english: string;
};

// Convert to array for FlatList
const numbers: NumberItem[] = Object.entries(allNumbers)
  .map(([num, data]) => ({
    number: parseInt(num),
    kurdish: data.ku,
    english: data.en,
  }))
  .sort((a, b) => a.number - b.number);

export default function NumbersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();

  // Mode state
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [practiceGame, setPracticeGame] = useState<'math' | 'matching'>('math');

  // Math quiz state
  const [mathProblem, setMathProblem] = useState(generateMathProblem());
  const [selectedMathAnswer, setSelectedMathAnswer] = useState<number | null>(null);
  const [mathFeedback, setMathFeedback] = useState<boolean | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [mathScore, setMathScore] = useState({ correct: 0, total: 0 });
  const [mathQuizCompleted, setMathQuizCompleted] = useState(false);

  // Matching game state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ digit: number; ku: string; matched: boolean }>>([]);
  const [shuffledDigits, setShuffledDigits] = useState<number[]>([]);
  const [shuffledKurdishWords, setShuffledKurdishWords] = useState<string[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<{ type: 'digit' | 'ku'; value: number | string } | null>(null);
  const [matchScore, setMatchScore] = useState({ correct: 0, total: 0 });
  const [incorrectMatches, setIncorrectMatches] = useState<Array<{ type: 'digit' | 'ku'; value: number | string }>>([]);

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

  // Initialize matching game
  const initializeMatchingGame = () => {
    const numbersToMatch = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const pairs = numbersToMatch.map((num) => ({
      digit: num,
      ku: allNumbers[num]?.ku || '',
      matched: false,
    }));

    // Shuffle digits and Kurdish words independently
    const digits = numbersToMatch.map((n) => n).sort(() => Math.random() - 0.5);
    const kurdishWords = numbersToMatch.map((n) => allNumbers[n]?.ku || '').sort(() => Math.random() - 0.5);

    setMatchingPairs(pairs);
    setShuffledDigits(digits);
    setShuffledKurdishWords(kurdishWords);
    setSelectedMatch(null);
    setMatchScore({ correct: 0, total: 0 });
    setIncorrectMatches([]);
  };

  // Handle matching game selection
  const handleMatchSelect = (type: 'digit' | 'ku', value: number | string) => {
    if (!selectedMatch) {
      setSelectedMatch({ type, value });
      setIncorrectMatches([]);
    } else {
      if (selectedMatch.type !== type) {
        // Check if it's a match
        let isCorrect = false;

        if (type === 'digit' && selectedMatch.type === 'ku') {
          const kuValue = selectedMatch.value as string;
          const digitValue = value as number;
          const pair = matchingPairs.find((p) => p.ku === kuValue);
          if (pair && pair.digit === digitValue && !pair.matched) {
            isCorrect = true;
            setMatchingPairs((prev) =>
              prev.map((p) => (p.digit === digitValue ? { ...p, matched: true } : p))
            );
            setMatchScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
          } else {
            setMatchScore((prev) => ({ ...prev, total: prev.total + 1 }));
            setIncorrectMatches([
              { type: 'digit', value: digitValue },
              { type: 'ku', value: kuValue },
            ]);
            setTimeout(() => {
              setIncorrectMatches([]);
              setSelectedMatch(null);
            }, 1000);
            return;
          }
        } else if (type === 'ku' && selectedMatch.type === 'digit') {
          const digitValue = selectedMatch.value as number;
          const kuValue = value as string;
          const pair = matchingPairs.find((p) => p.digit === digitValue);
          if (pair && pair.ku === kuValue && !pair.matched) {
            isCorrect = true;
            setMatchingPairs((prev) =>
              prev.map((p) => (p.digit === digitValue ? { ...p, matched: true } : p))
            );
            setMatchScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
          } else {
            setMatchScore((prev) => ({ ...prev, total: prev.total + 1 }));
            setIncorrectMatches([
              { type: 'digit', value: digitValue },
              { type: 'ku', value: kuValue },
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
        if (matchingPairs.every((p) => p.matched)) {
          updateLessonProgress(LESSON_ID, 100, 'COMPLETED');
        }
      } else {
        setSelectedMatch({ type, value });
        setIncorrectMatches([]);
      }
    }
  };

  // Initialize math quiz
  const initializeMathQuiz = () => {
    setMathProblem(generateMathProblem());
    setSelectedMathAnswer(null);
    setMathFeedback(null);
    setCurrentQuestion(1);
    setMathScore({ correct: 0, total: 0 });
    setMathQuizCompleted(false);
  };

  // Handle math answer selection
  const handleMathAnswer = (answerNum: number) => {
    setSelectedMathAnswer(answerNum);
    const isCorrect = answerNum === mathProblem.answer;
    setMathFeedback(isCorrect);
    setMathScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < 10) {
      setCurrentQuestion((prev) => prev + 1);
      setMathProblem(generateMathProblem());
      setSelectedMathAnswer(null);
      setMathFeedback(null);
    } else {
      setMathQuizCompleted(true);
      updateLessonProgress(LESSON_ID, 100, 'COMPLETED');
    }
  };

  // Initialize games when switching to practice mode
  useEffect(() => {
    if (mode === 'practice') {
      initializeMatchingGame();
      initializeMathQuiz();
    }
  }, [mode, practiceGame]);

  const handleAudioPlay = () => {
    const progress = getLessonProgress(LESSON_ID);
    const newProgress = Math.min(100, progress.progress + 2);
    updateLessonProgress(LESSON_ID, newProgress, 'IN_PROGRESS');
  };

  const progress = getLessonProgress(LESSON_ID);
  const progressText = `${Math.round(progress.progress)}%`;

  const renderNumber = ({ item }: { item: NumberItem }) => {
    const audioFile = getNumberAudioFile(item.kurdish);
    return (
      <NumberCard
        number={item.number}
        kurdish={item.kurdish}
        english={item.english}
        audioFile={audioFile}
        audioAssets={audioAssets}
        onPlay={handleAudioPlay}
      />
    );
  };

  // Example card component with audio playback
  const ExampleCard = ({
    kurdish,
    english,
    audioFile,
    audioAssets,
    onPlay,
  }: {
    kurdish: string;
    english: string;
    audioFile: string;
    audioAssets: Record<string, any>;
    onPlay?: () => void;
  }) => {
    const [playing, setPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const opacityAnim = React.useRef(new Animated.Value(1)).current;

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

    const playSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        if (sound) {
          await sound.unloadAsync();
        }

        const audioAsset = audioAssets[audioFile];
        if (!audioAsset) {
          setPlaying(false);
          return;
        }

        await Asset.loadAsync(audioAsset);
        const asset = Asset.fromModule(audioAsset);

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: asset.localUri || asset.uri },
          { shouldPlay: true, volume: 1.0 }
        );

        setSound(newSound);
        setPlaying(true);
        onPlay?.();

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.isPlaying) {
              setPlaying(true);
            } else if (status.didJustFinish) {
              setPlaying(false);
            }
          } else {
            setPlaying(false);
          }
        });
      } catch (error) {
        setPlaying(false);
      }
    };

    const handlePressIn = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePressOut = () => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const handlePress = () => {
      playSound();
    };

    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.exampleCardPressable}
      >
        <Animated.View
          style={[
            styles.exampleCard,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.exampleTextContainer}>
            <Text style={styles.exampleKurdish}>{kurdish}</Text>
            <Text style={styles.exampleEnglish}>{english}</Text>
          </View>
          <View style={styles.exampleSpeakerContainer}>
            <Ionicons
              name={playing ? 'volume-high' : 'volume-low-outline'}
              size={22}
              color="#4b5563"
            />
          </View>
        </Animated.View>
      </Pressable>
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
          <Text style={styles.headerTitle}>Numbers</Text>
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
            Math.floor((progress.progress / 100) * numbers.length) === numbers.length && styles.progressInfoComplete
          ]}>
            {Math.floor((progress.progress / 100) * numbers.length)}/{numbers.length}
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

      {/* Segmented Control - Game Selector (Practice Mode Only) */}
      {mode === 'practice' && (
        <View style={styles.segmentedControl}>
          <Pressable
            onPress={() => setPracticeGame('math')}
            style={({ pressed }) => [
              styles.segmentedButton,
              styles.segmentedButtonLeft,
              practiceGame === 'math' && styles.segmentedButtonActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="calculator"
              size={16}
              color={practiceGame === 'math' ? '#ffffff' : '#4b5563'}
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            <Text
              style={[
                styles.segmentedButtonText,
                practiceGame === 'math' && styles.segmentedButtonTextActive,
              ]}
            >
              Simple Math
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
              Match Words
            </Text>
          </Pressable>
        </View>
      )}

      {/* Learn Mode - Numbers Grid with FlatList */}
      {mode === 'learn' && (
        <FlatList
        data={numbers}
        renderItem={renderNumber}
        keyExtractor={(item) => item.number.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListFooterComponent={
          <>
            {/* Compound Numbers Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="link" size={24} color="#059669" />
                <Text style={styles.sectionTitle}>Compound Numbers</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Use "û" (and) to connect tens and ones:
              </Text>
              <View style={styles.compoundGrid}>
                <View style={styles.compoundRow}>
                  <View style={styles.compoundCard}>
                    <Text style={styles.compoundNumber}>21</Text>
                    <Text style={styles.compoundKurdish}>bîst û yek</Text>
                  </View>
                  <View style={styles.compoundCard}>
                    <Text style={styles.compoundNumber}>32</Text>
                    <Text style={styles.compoundKurdish}>sî û du</Text>
                  </View>
                </View>
                <View style={styles.compoundRow}>
                  <View style={styles.compoundCard}>
                    <Text style={styles.compoundNumber}>45</Text>
                    <Text style={styles.compoundKurdish}>çil û pênc</Text>
                  </View>
                  <View style={styles.compoundCard}>
                    <Text style={styles.compoundNumber}>67</Text>
                    <Text style={styles.compoundKurdish}>şêst û heft</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Number Usage Examples Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Number Usage Examples</Text>
              </View>
              <Text style={styles.sectionDescription}>
                See numbers in context:
              </Text>
              <View style={styles.examplesList}>
                {numberExamples.map((example, index) => (
                  <ExampleCard
                    key={index}
                    kurdish={example.ku}
                    english={example.en}
                    audioFile={example.audioFile}
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

      {/* Practice Mode - Simple Math */}
      {mode === 'practice' && practiceGame === 'math' && (
        <ScrollView
          style={styles.practiceScrollView}
          contentContainerStyle={styles.practiceContainer}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.practiceHeader}>
            <View style={styles.practiceHeaderLeft}>
              <Ionicons name="calculator" size={24} color="#3A86FF" />
              <Text style={styles.practiceTitle}>Simple Math in Kurdish</Text>
            </View>
            {!mathQuizCompleted && (
              <Text style={styles.questionCounter}>Question {currentQuestion}/10</Text>
            )}
          </View>

          {mathQuizCompleted ? (
            <View style={styles.completedCard}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              <Text style={styles.completedTitle}>Quiz Completed!</Text>
              <Text style={styles.completedScore}>
                Score: {mathScore.correct}/{mathScore.total}
              </Text>
              <Pressable
                onPress={initializeMathQuiz}
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
            <View style={styles.mathCard}>
              <View style={styles.mathQuestionContainer}>
                <Text style={styles.mathQuestion}>{mathProblem.question}</Text>
                <Text style={styles.mathQuestionHint}>Answer in Kurdish</Text>
              </View>

              <View style={styles.mathOptions}>
                {mathProblem.options.map((num) => {
                  const isSelected = selectedMathAnswer === num;
                  const isCorrect = num === mathProblem.answer;
                  const showFeedback = mathFeedback !== null;

                  return (
                    <Pressable
                      key={num}
                      onPress={() => handleMathAnswer(num)}
                      disabled={showFeedback}
                      style={({ pressed }) => [
                        styles.mathOption,
                        isSelected && styles.mathOptionSelected,
                        showFeedback && isCorrect && styles.mathOptionCorrect,
                        showFeedback && isSelected && !isCorrect && styles.mathOptionIncorrect,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.mathOptionText}>{allNumbers[num]?.ku || ''}</Text>
                      {showFeedback && isCorrect && (
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      )}
                      {showFeedback && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={20} color="#dc2626" />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={handleNextQuestion}
                disabled={mathFeedback === null}
                style={({ pressed }) => [
                  styles.nextButton,
                  mathFeedback === null && styles.nextButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.nextButtonText,
                    mathFeedback === null && styles.nextButtonTextDisabled,
                  ]}
                >
                  {currentQuestion < 10 ? 'Next' : 'Finish'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={mathFeedback === null ? '#9ca3af' : '#ffffff'}
                />
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}

      {/* Practice Mode - Matching Game */}
      {mode === 'practice' && practiceGame === 'matching' && (
        <ScrollView
          style={styles.practiceScrollView}
          contentContainerStyle={styles.practiceContainer}
          showsVerticalScrollIndicator={true}
        >
          {/* Game Header Card */}
          <View style={styles.gameHeaderCard}>
            <View style={styles.gameHeaderTop}>
              <View style={styles.gameHeaderTitleContainer}>
                <Text style={styles.gameHeaderTitle}>Match Words</Text>
                <Text style={styles.gameHeaderDescription}>
                  Match each digit with its Kurdish word
                </Text>
              </View>
            </View>
            <View style={styles.gameHeaderBottom}>
              <View style={styles.gameScoreContainer}>
                <Ionicons name="trophy" size={18} color="#3A86FF" />
                <Text style={styles.gameScoreText}>
                  {matchScore.correct}/{matchScore.total}
                </Text>
              </View>
              <Pressable
                onPress={initializeMatchingGame}
                style={({ pressed }) => [
                  styles.gameResetButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="refresh" size={16} color="#6b7280" />
                <Text style={styles.gameResetButtonText}>Reset</Text>
              </Pressable>
            </View>
          </View>

          {/* Play Area Card */}
          <View style={styles.playAreaCard}>
            <View style={styles.matchingGrid}>
              {/* Digits Column */}
              <View style={styles.matchingColumn}>
                <Text style={styles.playAreaTitle}>Digits</Text>
                <View style={styles.gameTilesGrid}>
                  {shuffledDigits.map((digit, index) => {
                    const pair = matchingPairs.find((p) => p.digit === digit);
                    const isMatched = pair?.matched || false;
                    const isSelected =
                      selectedMatch?.type === 'digit' && selectedMatch.value === digit;
                    const isIncorrect = incorrectMatches.some(
                      (m) => m.type === 'digit' && m.value === digit
                    );

                    return (
                      <Pressable
                        key={`digit-${digit}-${index}`}
                        onPress={() => !isMatched && handleMatchSelect('digit', digit)}
                        disabled={isMatched}
                        style={({ pressed }) => [
                          styles.gameTile,
                          isMatched && styles.gameTileMatched,
                          isIncorrect && styles.gameTileIncorrect,
                          isSelected && styles.gameTileSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.gameTileDigit,
                            isMatched && styles.gameTileTextMatched,
                          ]}
                        >
                          {digit}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Kurdish Words Column */}
              <View style={styles.matchingColumn}>
                <Text style={styles.playAreaTitle}>Kurdish Words</Text>
                <View style={styles.gameTilesGrid}>
                  {shuffledKurdishWords.map((ku, index) => {
                    const pair = matchingPairs.find((p) => p.ku === ku);
                    const isMatched = pair?.matched || false;
                    const isSelected = selectedMatch?.type === 'ku' && selectedMatch.value === ku;
                    const isIncorrect = incorrectMatches.some(
                      (m) => m.type === 'ku' && m.value === ku
                    );

                    return (
                      <Pressable
                        key={`ku-${ku}-${index}`}
                        onPress={() => !isMatched && handleMatchSelect('ku', ku)}
                        disabled={isMatched}
                        style={({ pressed }) => [
                          styles.gameTile,
                          isMatched && styles.gameTileMatched,
                          isIncorrect && styles.gameTileIncorrect,
                          isSelected && styles.gameTileSelected,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.gameTileWord,
                            isMatched && styles.gameTileTextMatched,
                          ]}
                        >
                          {ku}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {matchingPairs.every((p) => p.matched) && (
              <View style={styles.completedCard}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                <Text style={styles.completedTitle}>Great job!</Text>
                <Text style={styles.completedSubtitle}>
                  You matched all numbers correctly!
                </Text>
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
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
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
  progressInfoSeparator: {
    color: '#9ca3af',
  },
  progressInfoComplete: {
    color: '#10b981',
  },
  headerSpacer: {
    width: 40,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  // Section styles
  section: {
    marginTop: 32,
    marginHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 22,
  },
  // Compound Numbers Section
  compoundGrid: {
    gap: 12,
  },
  compoundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  compoundCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  compoundNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3A86FF',
    marginBottom: 8,
  },
  compoundKurdish: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  // Examples Section
  examplesList: {
    gap: 12,
  },
  exampleCardPressable: {
    width: '100%',
  },
  exampleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    position: 'relative',
  },
  exampleTextContainer: {
    flex: 1,
    paddingRight: 32,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  exampleSpeakerContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Segmented Control
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
  // Practice Container
  practiceScrollView: {
    flex: 1,
  },
  practiceContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  practiceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  practiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  questionCounter: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Game Header Card
  gameHeaderCard: {
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
  gameHeaderTop: {
    marginBottom: 12,
  },
  gameHeaderTitleContainer: {
    marginBottom: 4,
  },
  gameHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  gameHeaderDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  gameHeaderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  gameScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gameScoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A86FF',
  },
  gameResetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  gameResetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  // Play Area Card
  playAreaCard: {
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
  playAreaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Math Card
  mathCard: {
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
  mathQuestionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mathQuestion: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3A86FF',
    marginBottom: 8,
  },
  mathQuestionHint: {
    fontSize: 14,
    color: '#6b7280',
  },
  mathOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  mathOption: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  mathOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  mathOptionCorrect: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
  },
  mathOptionIncorrect: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  mathOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3A86FF',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#9ca3af',
  },
  // Completed Card
  completedCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
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
  completedScore: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 24,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
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
    fontWeight: '600',
    color: '#ffffff',
  },
  // Matching Game
  matchingGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  matchingColumn: {
    flex: 1,
  },
  // Game Tiles
  gameTilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  gameTile: {
    width: '48%',
    height: 40,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTileSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  gameTileMatched: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    opacity: 0.6,
  },
  gameTileIncorrect: {
    borderColor: '#dc2626',
    backgroundColor: '#fee2e2',
  },
  gameTileDigit: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14213D',
  },
  gameTileWord: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  gameTileTextMatched: {
    color: '#10b981',
  },
});

