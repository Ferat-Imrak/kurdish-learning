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

const LESSON_ID = '14'; // Common Verbs lesson ID

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

// Common verbs list
const commonVerbs = [
  { ku: "bûn", en: "to be", icon: "👤" },
  { ku: "kirin", en: "to do/make", icon: "🔨" },
  { ku: "çûn", en: "to go", icon: "🚶" },
  { ku: "hatin", en: "to come", icon: "🏃" },
  { ku: "xwarin", en: "to eat", icon: "🍽️" },
  { ku: "vexwarin", en: "to drink", icon: "🥤" },
  { ku: "xwendin", en: "to read", icon: "📖" },
  { ku: "nivîsîn", en: "to write", icon: "✍️" },
  { ku: "axaftin", en: "to speak", icon: "💬" },
  { ku: "bihîstin", en: "to hear", icon: "👂" },
  { ku: "dîtin", en: "to see", icon: "👁️" },
  { ku: "raketin", en: "to sleep", icon: "😴" },
  { ku: "hişyarbûn", en: "to wake up", icon: "⏰" },
  { ku: "rûniştin", en: "to sit", icon: "🪑" },
  { ku: "rabûn", en: "to stand", icon: "🧍" },
  { ku: "meşîn", en: "to walk", icon: "🚶" },
  { ku: "revîn", en: "to run", icon: "🏃" },
  { ku: "girtin", en: "to hold", icon: "✋" },
  { ku: "dayîn", en: "to give", icon: "🎁" },
  { ku: "stendin", en: "to take", icon: "🤲" },
  { ku: "kirîn", en: "to buy", icon: "🛒" },
  { ku: "firotin", en: "to sell", icon: "💰" },
  { ku: "xebat", en: "to work", icon: "💼" },
  { ku: "xwendin", en: "to study", icon: "📚" },
  { ku: "lîstin", en: "to play", icon: "🎮" }
];

// Verb conjugations
const verbConjugations = [
  {
    verb: "kirin",
    meaning: "to do/make",
    conjugations: [
      { pronoun: "ez", pronounEn: "I", form: "dikim", en: "I do" },
      { pronoun: "tu", pronounEn: "you", form: "dikî", en: "you do" },
      { pronoun: "ew", pronounEn: "he/she", form: "dike", en: "he/she does" },
      { pronoun: "em", pronounEn: "we", form: "dikin", en: "we do" },
      { pronoun: "hûn", pronounEn: "you (plural)", form: "dikin", en: "you do" },
      { pronoun: "ew", pronounEn: "they", form: "dikin", en: "they do" }
    ]
  },
  {
    verb: "çûn",
    meaning: "to go",
    conjugations: [
      { pronoun: "ez", pronounEn: "I", form: "diçim", en: "I go" },
      { pronoun: "tu", pronounEn: "you", form: "diçî", en: "you go" },
      { pronoun: "ew", pronounEn: "he/she", form: "diçe", en: "he/she goes" },
      { pronoun: "em", pronounEn: "we", form: "diçin", en: "we go" },
      { pronoun: "hûn", pronounEn: "you (plural)", form: "diçin", en: "you go" },
      { pronoun: "ew", pronounEn: "they", form: "diçin", en: "they go" }
    ]
  }
];

const practiceExercises = [
  {
    question: "What does 'kirin' mean?",
    options: ["to go", "to do/make", "to eat", "to come"],
    correct: 1,
    explanation: "'kirin' means 'to do' or 'to make' in Kurdish."
  },
  {
    question: "What does 'çûn' mean?",
    options: ["to go", "to come", "to see", "to do"],
    correct: 0,
    explanation: "'çûn' means 'to go' in Kurdish."
  },
  {
    question: "What is 'I do' in Kurdish?",
    options: ["dikim", "diçim", "dixwim", "dibînim"],
    correct: 0,
    explanation: "'I do' is 'dikim' (from the verb 'kirin' - to do/make)."
  },
  {
    question: "What is 'I go' in Kurdish?",
    options: ["dikim", "diçim", "dixwim", "dibînim"],
    correct: 1,
    explanation: "'I go' is 'diçim' (from the verb 'çûn' - to go)."
  },
  {
    question: "What does 'xwarin' mean?",
    options: ["to drink", "to eat", "to read", "to write"],
    correct: 1,
    explanation: "'xwarin' means 'to eat' in Kurdish."
  },
  {
    question: "What does 'vexwarin' mean?",
    options: ["to eat", "to drink", "to read", "to write"],
    correct: 1,
    explanation: "'vexwarin' means 'to drink' in Kurdish."
  },
  {
    question: "What is 'he/she does' in Kurdish?",
    options: ["dikim", "dikî", "dike", "dikin"],
    correct: 2,
    explanation: "'he/she does' is 'dike' (from 'kirin' - to do/make, with 'ew' pronoun)."
  },
  {
    question: "What is 'he/she goes' in Kurdish?",
    options: ["diçim", "diçî", "diçe", "diçin"],
    correct: 2,
    explanation: "'he/she goes' is 'diçe' (from 'çûn' - to go, with 'ew' pronoun)."
  },
  {
    question: "What does 'axaftin' mean?",
    options: ["to hear", "to speak", "to see", "to listen"],
    correct: 1,
    explanation: "'axaftin' means 'to speak' in Kurdish."
  },
  {
    question: "What does 'bihîstin' mean?",
    options: ["to speak", "to hear", "to see", "to listen"],
    correct: 1,
    explanation: "'bihîstin' means 'to hear' in Kurdish."
  },
  {
    question: "What is 'we do' in Kurdish?",
    options: ["dikim", "dikî", "dike", "dikin"],
    correct: 3,
    explanation: "'we do' is 'dikin' (from 'kirin' - to do/make, with 'em' pronoun)."
  },
  {
    question: "What is 'we go' in Kurdish?",
    options: ["diçim", "diçî", "diçe", "diçin"],
    correct: 3,
    explanation: "'we go' is 'diçin' (from 'çûn' - to go, with 'em' pronoun)."
  },
  {
    question: "What does 'raketin' mean?",
    options: ["to wake up", "to sleep", "to sit", "to stand"],
    correct: 1,
    explanation: "'raketin' means 'to sleep' in Kurdish."
  },
  {
    question: "What does 'hişyarbûn' mean?",
    options: ["to sleep", "to wake up", "to sit", "to stand"],
    correct: 1,
    explanation: "'hişyarbûn' means 'to wake up' in Kurdish."
  },
  {
    question: "What does 'girtin' mean?",
    options: ["to give", "to take", "to hold", "to buy"],
    correct: 2,
    explanation: "'girtin' means 'to hold' in Kurdish."
  },
  {
    question: "What does 'dayîn' mean?",
    options: ["to take", "to give", "to hold", "to buy"],
    correct: 1,
    explanation: "'dayîn' means 'to give' in Kurdish."
  },
  {
    question: "What does 'kirîn' mean?",
    options: ["to sell", "to buy", "to give", "to take"],
    correct: 1,
    explanation: "'kirîn' means 'to buy' in Kurdish."
  },
  {
    question: "What does 'firotin' mean?",
    options: ["to buy", "to sell", "to give", "to take"],
    correct: 1,
    explanation: "'firotin' means 'to sell' in Kurdish."
  },
  {
    question: "What does 'xebat' mean?",
    options: ["to study", "to work", "to play", "to read"],
    correct: 1,
    explanation: "'xebat' means 'to work' in Kurdish."
  },
  {
    question: "What does 'lîstin' mean?",
    options: ["to work", "to study", "to play", "to read"],
    correct: 2,
    explanation: "'lîstin' means 'to play' in Kurdish."
  }
];

// Audio assets - all audio files for common verbs
const audioAssets: Record<string, any> = {
  // Common verbs - infinitive forms
  'bun': require('../../assets/audio/grammar/bun.mp3'),
  'kirin': require('../../assets/audio/grammar/kirin.mp3'),
  'cun': require('../../assets/audio/grammar/cun.mp3'),
  'hatin': require('../../assets/audio/grammar/hatin.mp3'),
  'xwarin': require('../../assets/audio/grammar/xwarin.mp3'),
  'vexwarin': require('../../assets/audio/grammar/vexwarin.mp3'),
  'xwendin': require('../../assets/audio/grammar/xwendin.mp3'),
  'nivisin': require('../../assets/audio/grammar/nivisin.mp3'),
  'axaftin': require('../../assets/audio/grammar/axaftin.mp3'),
  'bihistin': require('../../assets/audio/grammar/bihistin.mp3'),
  'ditin': require('../../assets/audio/grammar/ditin.mp3'),
  'raketin': require('../../assets/audio/grammar/raketin.mp3'),
  'hisyarbun': require('../../assets/audio/grammar/hisyarbun.mp3'),
  'runistin': require('../../assets/audio/grammar/runistin.mp3'),
  'rabun': require('../../assets/audio/grammar/rabun.mp3'),
  'mesin': require('../../assets/audio/grammar/mesin.mp3'),
  'revin': require('../../assets/audio/grammar/revin.mp3'),
  'girtin': require('../../assets/audio/grammar/girtin.mp3'),
  'dayin': require('../../assets/audio/grammar/dayin.mp3'),
  'stendin': require('../../assets/audio/grammar/stendin.mp3'),
  'kirin-buy': require('../../assets/audio/grammar/kirin-buy.mp3'),
  'firotin': require('../../assets/audio/grammar/firotin.mp3'),
  'xebat': require('../../assets/audio/grammar/xebat.mp3'),
  'listin': require('../../assets/audio/grammar/listin.mp3'),
  // Verb conjugations - kirin
  'dikim': require('../../assets/audio/grammar/dikim.mp3'),
  'diki': require('../../assets/audio/grammar/diki.mp3'),
  'dike': require('../../assets/audio/grammar/dike.mp3'),
  'dikin': require('../../assets/audio/grammar/dikin.mp3'),
  // Verb conjugations - çûn
  'dicim': require('../../assets/audio/grammar/dicim.mp3'),
  'dici': require('../../assets/audio/grammar/dici.mp3'),
  'dice': require('../../assets/audio/grammar/dice.mp3'),
  'dicin': require('../../assets/audio/grammar/dicin.mp3'),
};

export default function VerbsPage() {
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
  const startTimeRef = useRef<number>(Date.now());
  const audioPlaysRef = useRef<number>(0);

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

  const playAudio = async (audioFile: string, uniqueKey?: string) => {
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
      const playKey = uniqueKey || audioFile;
      setPlayingAudio(playKey);
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
    // Audio clicks: max 30% (25 verbs + 12 conjugations = 37 total, so ~1 click = 0.8%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 0.8);
    // Time spent: max 20% (4 minutes = 20%)
    const timeProgress = Math.min(20, timeSpent * 5);
    // Practice score: max 50% (if practice exists)
    const practiceProgress = practiceScore !== undefined ? Math.min(50, practiceScore * 0.5) : 0;
    return Math.min(100, audioProgress + timeProgress + practiceProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const practiceScore = currentProgress.score !== undefined ? (currentProgress.score / 100) * 100 : undefined;
    const progress = calculateProgress(practiceScore);
    updateLessonProgress(LESSON_ID, progress, 'IN_PROGRESS');
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
      const isPracticePassed = practiceScorePercent >= 80;
      
      setIsCompleted(isPracticePassed);
      
      // Calculate combined progress
      const progress = calculateProgress(practiceScorePercent);
      
      // Only mark lesson as completed if practice is passed
      const status = isPracticePassed ? 'COMPLETED' : 'IN_PROGRESS';
      updateLessonProgress(LESSON_ID, progress, status, practiceScorePercent);
    }
  };

  const handleRestart = () => {
    setCurrentExercise(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setIsCompleted(false);
  };

  // Process verbs to add audioFile paths
  const verbsWithAudio = commonVerbs.map(verb => {
    const audioFile = getAudioFilename(verb.ku);
    return {
      ...verb,
      audioFile
    };
  });

  // Process conjugations to add audioFile paths
  const conjugationsWithAudio = verbConjugations.map(verb => ({
    ...verb,
    conjugations: verb.conjugations.map(conj => {
      const audioFile = getAudioFilename(conj.form);
      return {
        ...conj,
        audioFile
      };
    })
  }));

  const progress = getLessonProgress(LESSON_ID);
  // Calculate total examples count for Learn progress (25 verbs + 12 conjugations = 37)
  const totalExamples = commonVerbs.length + verbConjugations.reduce((sum, verb) => sum + verb.conjugations.length, 0);
  // Use actual audio plays count, capped at total examples
  const learnedCount = Math.min(audioPlaysRef.current, totalExamples);

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
        <Text style={styles.headerTitle}>Common Verbs</Text>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'learn' ? (
          <>
            {/* Introduction */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Common Verbs</Text>
              <Text style={styles.sectionText}>
                Essential action words for daily conversations and activities in Kurdish.
              </Text>
            </View>

            {/* Common Verbs Grid */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📚 Essential Verbs</Text>
              <View style={styles.verbsGrid}>
                {verbsWithAudio.map((verb, index) => (
                  <View key={index} style={styles.verbCard}>
                    <View style={styles.verbTextContainer}>
                      <Text style={styles.verbKurdish}>{verb.ku}</Text>
                      <Text style={styles.verbEnglish}>{verb.en}</Text>
                    </View>
                    <View style={styles.verbBottomRow}>
                      <Text style={styles.verbIcon}>{verb.icon}</Text>
                      <Pressable
                        onPress={() => playAudio(verb.audioFile)}
                        style={styles.audioButtonContainer}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={playingAudio === verb.audioFile ? 'volume-high' : 'volume-low-outline'}
                          size={22}
                          color="#4b5563"
                        />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Verb Conjugations */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📝 Verb Conjugations</Text>
              <Text style={styles.sectionText}>
                Learn how to conjugate common verbs in present tense.
              </Text>
              {conjugationsWithAudio.map((verb, verbIndex) => (
                <View key={verbIndex} style={styles.conjugationCard}>
                  <Text style={styles.conjugationVerbTitle}>
                    {verb.verb} - {verb.meaning}
                  </Text>
                  <View style={styles.conjugationsGrid}>
                    {verb.conjugations.map((conj, conjIndex) => {
                      const uniqueKey = `${verbIndex}-${conjIndex}-${conj.pronoun}`;
                      return (
                        <View key={conjIndex} style={styles.conjugationItem}>
                          <View style={styles.pronounBadge}>
                            <Text style={styles.pronounText}>{conj.pronoun}</Text>
                          </View>
                          <Text style={styles.conjugationForm}>{conj.form}</Text>
                          <Text style={styles.conjugationEnglish}>{conj.en}</Text>
                          <Pressable
                            onPress={() => playAudio(conj.audioFile, uniqueKey)}
                            style={styles.audioButtonContainer}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name={playingAudio === uniqueKey ? 'volume-high' : 'volume-low-outline'}
                              size={20}
                              color="#4b5563"
                            />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* Verb Usage Tips */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💡 Verb Usage Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>Present Tense:</Text> Add "di-" prefix to verb stem
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>Past Tense:</Text> Add "kir" suffix to verb stem
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>Future Tense:</Text> Use "dê" before the verb
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>Negation:</Text> Add "na-" prefix for negative forms
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>Compound Verbs:</Text> Many verbs are formed with "kirin" (to do)
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipBold}>Irregular Verbs:</Text> Some verbs like "bûn" (to be) have irregular forms
                  </Text>
                </View>
              </View>
            </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  verbsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  verbCard: {
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
  verbTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  verbKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  verbEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  verbBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  verbIcon: {
    fontSize: 28,
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  conjugationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conjugationVerbTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  conjugationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  conjugationItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  pronounBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pronounText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  conjugationForm: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  conjugationEnglish: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  tipBold: {
    fontWeight: '700',
    color: '#111827',
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

