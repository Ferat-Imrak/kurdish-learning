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
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';

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
  const startTimeRef = useRef<number>(Date.now());
  const audioPlaysRef = useRef<number>(0);

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

  // Mark lesson as in progress on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
      return;
    }

    const progress = getLessonProgress(LESSON_ID);
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
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
      audioPlaysRef.current += 1;
      handleAudioPlay();

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
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // minutes
    // Audio clicks: max 30% (29 animals + 4 questions = 33, so ~1 click = 0.91%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 0.91);
    // Time spent: max 20% (4 minutes = 20%)
    const timeProgress = Math.min(20, timeSpent * 5);
    // Practice score: max 50% (if practice exists)
    const practiceProgress = practiceScore !== undefined ? Math.min(50, practiceScore * 0.5) : 0;
    return Math.min(100, audioProgress + timeProgress + practiceProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const practiceScore = currentProgress.score !== undefined ? currentProgress.score : undefined;
    const progress = calculateProgress(practiceScore);
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    updateLessonProgress(LESSON_ID, progress, status);
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
        const isPracticePassed = practiceScorePercent >= 80;
        
        const progress = calculateProgress(practiceScorePercent);
        const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS';
        updateLessonProgress(LESSON_ID, progress, status, practiceScorePercent);
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
  const learnedCount = Math.min(audioPlaysRef.current, totalExamples);

  const progress = getLessonProgress(LESSON_ID);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#3A86FF" />
        </Pressable>
        <Text style={styles.headerTitle}>Animals</Text>
        <View style={styles.headerRight} />
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
            learnedCount === totalExamples && styles.progressInfoComplete
          ]}>
            {learnedCount}/{totalExamples}
          </Text>
          <Text style={styles.progressInfoSeparator}> • </Text>
          <Text style={styles.progressInfoLabel}>Practice: </Text>
          <Text style={[
            styles.progressInfoValue,
            progress.status === 'COMPLETED' && styles.progressInfoComplete
          ]}>
            {progress.score !== undefined ? `${Math.round(progress.score)}%` : (progress.status === 'COMPLETED' ? 'Done' : 'Pending')}
          </Text>
        </Text>
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
            {isCompleted ? (
              <View style={styles.completionCard}>
                <Text style={styles.completionEmoji}>🎉</Text>
                <Text style={styles.completionTitle}>Great job!</Text>
                <Text style={styles.completionText}>
                  You got <Text style={styles.completionScore}>{score.correct}</Text> out of{' '}
                  <Text style={styles.completionTotal}>{QUESTIONS_PER_SESSION}</Text> correct!
                </Text>
                <Text style={styles.completionPercentage}>
                  {Math.round((score.correct / QUESTIONS_PER_SESSION) * 100)}%
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
            ) : currentExercise ? (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: ICON_CONTAINER_WIDTH,
    height: ICON_CONTAINER_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: ICON_CONTAINER_WIDTH,
  },
  pressed: {
    opacity: 0.6,
  },
  progressInfoContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  progressInfoText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressInfoLabel: {
    fontWeight: '500',
  },
  progressInfoValue: {
    fontWeight: '700',
    color: '#111827',
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

