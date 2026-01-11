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
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';

const { width } = Dimensions.get('window');

const LESSON_ID = '21'; // Possessive Pronouns lesson ID

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

// Possessive pronouns reference table
const possessiveTable = [
  { ku: "min", en: "my", example: "pirtûka min", exampleEn: "my book", usage: "First person singular" },
  { ku: "te", en: "your", example: "malê te", exampleEn: "your house", usage: "Second person singular" },
  { ku: "wî", en: "his", example: "pirtûka wî", exampleEn: "his book", usage: "Third person singular (masculine)" },
  { ku: "wê", en: "her", example: "pirtûka wê", exampleEn: "her book", usage: "Third person singular (feminine)" },
  { ku: "me", en: "our", example: "malê me", exampleEn: "our house", usage: "First person plural" },
  { ku: "we", en: "your (plural)", example: "pirtûkên we", exampleEn: "your books", usage: "Second person plural" },
  { ku: "wan", en: "their", example: "malên wan", exampleEn: "their houses", usage: "Third person plural" },
  { ku: "xwe", en: "self/own", example: "nanê xwe", exampleEn: "his/her own bread", usage: "Reflexive (refers back to subject)" }
];

const presentTenseExamples = [
  {
    title: 'Basic Possessive Forms',
    examples: [
      { ku: "Pirtûka min.", en: "my book", audio: true, audioText: "Pirtûka min." },
      { ku: "Malê te.", en: "your house", audio: true, audioText: "Malê te." },
      { ku: "Pirtûka wî.", en: "his book", audio: true, audioText: "Pirtûka wî." },
      { ku: "Pirtûka wê.", en: "her book", audio: true, audioText: "Pirtûka wê." },
      { ku: "Malê me.", en: "our house", audio: true, audioText: "Malê me." },
      { ku: "Pirtûkên we.", en: "your books", audio: true, audioText: "Pirtûkên we." },
      { ku: "Malên wan.", en: "their houses", audio: true, audioText: "Malên wan." }
    ]
  },
  {
    title: 'Possessive Pronouns in Sentences',
    examples: [
      { ku: "Ez pirtûka min dixwînim.", en: "I read my book", audio: true, audioText: "Ez pirtûka min dixwînim." },
      { ku: "Tu malê te dibînî.", en: "You see your house", audio: true, audioText: "Tu malê te dibînî." },
      { ku: "Ew nanê xwe dixwe.", en: "He/She eats his/her own bread", audio: true, audioText: "Ew nanê xwe dixwe." },
      { ku: "Em pirtûkên xwe dixwînin.", en: "We read our books", audio: true, audioText: "Em pirtûkên xwe dixwînin." },
      { ku: "Ewan malên wan dibînin.", en: "They see their houses", audio: true, audioText: "Ewan malên wan dibînin." }
    ]
  },
  {
    title: 'Body Parts with Possessives',
    examples: [
      { ku: "Çavên min.", en: "my eyes", audio: true, audioText: "Çavên min." },
      { ku: "Dengê te.", en: "your voice", audio: true, audioText: "Dengê te." },
      { ku: "Destê wî.", en: "his hand", audio: true, audioText: "Destê wî." },
      { ku: "Serê wê.", en: "her head", audio: true, audioText: "Serê wê." },
      { ku: "Lingên me.", en: "our legs", audio: true, audioText: "Lingên me." }
    ]
  },
  {
    title: 'Family Members with Possessives',
    examples: [
      { ku: "Bavê min.", en: "my father", audio: true, audioText: "Bavê min." },
      { ku: "Dayika te.", en: "your mother", audio: true, audioText: "Dayika te." },
      { ku: "Bira wî.", en: "his brother", audio: true, audioText: "Bira wî." },
      { ku: "Xwişka wê.", en: "her sister", audio: true, audioText: "Xwişka wê." },
      { ku: "Zarokên me.", en: "our children", audio: true, audioText: "Zarokên me." }
    ]
  },
  {
    title: 'Using "xwe" (self/own)',
    examples: [
      { ku: "Ez nanê xwe dixwim.", en: "I eat my own bread", audio: true, audioText: "Ez nanê xwe dixwim." },
      { ku: "Tu pirtûka xwe dixwînî.", en: "You read your own book", audio: true, audioText: "Tu pirtûka xwe dixwînî." },
      { ku: "Ew malê xwe dibîne.", en: "He/She sees his/her own house", audio: true, audioText: "Ew malê xwe dibîne." },
      { ku: "Em odeyên xwe dibînin.", en: "We see our own rooms", audio: true, audioText: "Em odeyên xwe dibînin." }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "min pirtûk",
    correct: "pirtûka min",
    explanation: "Possessive pronouns come AFTER the noun, not before. The noun also gets an ending (-a, -ê, -ên) before the possessive."
  },
  {
    wrong: "pirtûk min",
    correct: "pirtûka min",
    explanation: "Don't forget the ending on the noun! 'pirtûk' becomes 'pirtûka' before 'min' (my)."
  },
  {
    wrong: "pirtûka ez",
    correct: "pirtûka min",
    explanation: "Use possessive pronouns (min, te, wî, wê, me, we, wan), not subject pronouns (ez, tu, ew, em, hûn, ewan). 'ez' = I, but 'min' = my."
  },
  {
    wrong: "pirtûka ew",
    correct: "pirtûka wî or pirtûka wê",
    explanation: "For 'his/her', use 'wî' (his) or 'wê' (her), not 'ew'. 'ew' is the subject pronoun (he/she), not possessive."
  },
  {
    wrong: "pirtûkên min",
    correct: "pirtûkên min",
    explanation: "Actually this is correct! For plural nouns, use '-ên' ending: pirtûkên min (my books)."
  }
];

const practiceExercises = [
  {
    question: "How do you say 'my book' in Kurdish?",
    options: ["min pirtûk", "pirtûk min", "pirtûka min", "pirtûka ez"],
    correct: 2,
    explanation: "Possessive comes after noun with ending: pirtûka min (my book)"
  },
  {
    question: "What possessive pronoun means 'your' (singular)?",
    options: ["tu", "te", "we", "wan"],
    correct: 1,
    explanation: "'te' means 'your' (singular). 'tu' is the subject pronoun (you), 'we' is your (plural), 'wan' is their."
  },
  {
    question: "How do you say 'his book'?",
    options: ["pirtûka ew", "pirtûka wî", "pirtûka wê", "pirtûka wan"],
    correct: 1,
    explanation: "Use 'wî' for 'his': pirtûka wî (his book). 'ew' is subject pronoun, 'wê' is her, 'wan' is their."
  },
  {
    question: "How do you say 'her book'?",
    options: ["pirtûka ew", "pirtûka wî", "pirtûka wê", "pirtûka wan"],
    correct: 2,
    explanation: "Use 'wê' for 'her': pirtûka wê (her book)"
  },
  {
    question: "What is 'our house' in Kurdish?",
    options: ["malê em", "malê me", "malên me", "malê we"],
    correct: 1,
    explanation: "Use 'me' for 'our': malê me (our house). 'em' is subject pronoun (we), 'we' is your (plural)."
  },
  {
    question: "How do you say 'their books'?",
    options: ["pirtûkên wan", "pirtûka wan", "pirtûkên we", "pirtûka we"],
    correct: 0,
    explanation: "For plural: pirtûkên wan (their books). Use '-ên' for plural nouns and 'wan' for their."
  },
  {
    question: "What does 'xwe' mean?",
    options: ["my", "your", "self/own", "their"],
    correct: 2,
    explanation: "'xwe' means 'self' or 'own' - it refers back to the subject. Example: nanê xwe (his/her own bread)."
  },
  {
    question: "How do you say 'my eyes'?",
    options: ["çavên min", "çavê min", "çav min", "min çavên"],
    correct: 0,
    explanation: "For plural body parts: çavên min (my eyes). Use '-ên' for plural and possessive comes after."
  },
  {
    question: "What is the correct form for 'your voice'?",
    options: ["dengê te", "deng te", "te dengê", "dengê tu"],
    correct: 0,
    explanation: "Use 'dengê te' (your voice). The noun gets '-ê' ending and possessive 'te' comes after."
  },
  {
    question: "How do you say 'I read my book'?",
    options: ["Ez pirtûka min dixwînim", "Ez min pirtûk dixwînim", "Ez pirtûk min dixwînim", "Min pirtûka ez dixwînim"],
    correct: 0,
    explanation: "SOV order: Ez (I) + pirtûka min (my book) + dixwînim (read) = Ez pirtûka min dixwînim"
  },
  {
    question: "What possessive pronoun means 'your (plural)'?",
    options: ["te", "we", "me", "wan"],
    correct: 1,
    explanation: "'we' means 'your (plural)'. 'te' is your (singular), 'me' is our, 'wan' is their."
  },
  {
    question: "How do you say 'our children'?",
    options: ["zarokên me", "zaroka me", "zarok me", "me zarokên"],
    correct: 0,
    explanation: "For plural: zarokên me (our children). Use '-ên' for plural and 'me' for our."
  },
  {
    question: "What is 'his hand' in Kurdish?",
    options: ["destê wî", "dest wî", "wî destê", "destê ew"],
    correct: 0,
    explanation: "Use 'destê wî' (his hand). The noun gets '-ê' ending and 'wî' (his) comes after."
  },
  {
    question: "How do you say 'He eats his own bread'?",
    options: ["Ew nanê xwe dixwe", "Ew nanê wî dixwe", "Ew nanê wê dixwe", "Ew nanê wan dixwe"],
    correct: 0,
    explanation: "Use 'xwe' (own) when the subject and possessor are the same: Ew nanê xwe dixwe (He eats his own bread)."
  },
  {
    question: "What is the correct order for possessive constructions?",
    options: ["Possessive + Noun", "Noun + Possessive", "Noun + Ending + Possessive", "Possessive + Ending + Noun"],
    correct: 2,
    explanation: "The order is: Noun + Ending (-a, -ê, -ên) + Possessive. Example: pirtûka min (my book)."
  },
  {
    question: "How do you say 'your books' (plural)?",
    options: ["pirtûkên te", "pirtûkên we", "pirtûka we", "pirtûkên tu"],
    correct: 1,
    explanation: "For plural 'your': pirtûkên we (your books). Use '-ên' for plural and 'we' for your (plural)."
  },
  {
    question: "What ending is used for singular nouns before possessives?",
    options: ["-a or -ê", "-ên", "-an", "-ek"],
    correct: 0,
    explanation: "Singular nouns use '-a' or '-ê' before possessives: pirtûka min (my book), malê te (your house)."
  },
  {
    question: "How do you say 'her sister'?",
    options: ["xwişka wê", "xwişka wî", "xwişka ew", "xwişka te"],
    correct: 0,
    explanation: "Use 'wê' for 'her': xwişka wê (her sister)"
  },
  {
    question: "What is 'my father' in Kurdish?",
    options: ["bavê min", "bav min", "min bavê", "bavê ez"],
    correct: 0,
    explanation: "Use 'bavê min' (my father). The noun gets '-ê' ending and 'min' (my) comes after."
  },
  {
    question: "When do you use 'xwe' instead of 'wî' or 'wê'?",
    options: ["Always", "When the possessor is the same as the subject", "Never", "Only for plural"],
    correct: 1,
    explanation: "Use 'xwe' when the possessor is the same as the subject. Example: Ew nanê xwe dixwe (He eats his own bread)."
  }
];

// Audio assets
const audioAssets: Record<string, any> = {
  'pirtuka-min': require('../../assets/audio/grammar/pirtuka-min.mp3'),
  'male-te': require('../../assets/audio/grammar/male-te.mp3'),
  'pirtuka-wi': require('../../assets/audio/grammar/pirtuka-wi.mp3'),
  'pirtuka-we': require('../../assets/audio/grammar/pirtuka-we.mp3'),
  'male-me': require('../../assets/audio/grammar/male-me.mp3'),
  'pirtuken-we': require('../../assets/audio/grammar/pirtuken-we.mp3'),
  'malen-wan': require('../../assets/audio/grammar/malen-wan.mp3'),
  'ez-pirtuka-min-dixwinim': require('../../assets/audio/grammar/ez-pirtuka-min-dixwinim.mp3'),
  'tu-male-te-dibini': require('../../assets/audio/grammar/tu-male-te-dibini.mp3'),
  'ew-nane-xwe-dixwe': require('../../assets/audio/grammar/ew-nane-xwe-dixwe.mp3'),
  'em-pirtuken-xwe-dixwinin': require('../../assets/audio/grammar/em-pirtuken-xwe-dixwinin.mp3'),
  'ewan-malen-wan-dibinin': require('../../assets/audio/grammar/ewan-malen-wan-dibinin.mp3'),
  'caven-min': require('../../assets/audio/grammar/caven-min.mp3'),
  'denge-te': require('../../assets/audio/grammar/denge-te.mp3'),
  'deste-wi': require('../../assets/audio/grammar/deste-wi.mp3'),
  'sere-we': require('../../assets/audio/grammar/sere-we.mp3'),
  'lingen-me': require('../../assets/audio/grammar/lingen-me.mp3'),
  'bave-min': require('../../assets/audio/grammar/bave-min.mp3'),
  'dayika-te': require('../../assets/audio/grammar/dayika-te.mp3'),
  'bira-wi': require('../../assets/audio/grammar/bira-wi.mp3'),
  'xwiska-we': require('../../assets/audio/grammar/xwiska-we.mp3'),
  'zaroken-me': require('../../assets/audio/grammar/zaroken-me.mp3'),
  'ez-nane-xwe-dixwim': require('../../assets/audio/grammar/ez-nane-xwe-dixwim.mp3'),
  'tu-pirtuka-xwe-dixwini': require('../../assets/audio/grammar/tu-pirtuka-xwe-dixwini.mp3'),
  'ew-male-xwe-dibine': require('../../assets/audio/grammar/ew-male-xwe-dibine.mp3'),
  'em-odeyen-xwe-dibinin': require('../../assets/audio/grammar/em-odeyen-xwe-dibinin.mp3'),
};

export default function PossessivePronounsPage() {
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
    // Audio clicks: max 30% (10 clicks = 30%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 3);
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
        <Text style={styles.headerTitle}>Possessive Pronouns</Text>
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
            {/* How It Works */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>How Possessive Pronouns Work in Kurdish</Text>
              <Text style={styles.sectionText}>
                In Kurdish, possessive pronouns come <Text style={styles.highlight}>after</Text> the noun, not before it like in English.
              </Text>
              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>The Structure:</Text>
                <Text style={styles.structureFormula}>
                  Noun + <Text style={styles.highlightBox}>Ending</Text> + <Text style={styles.highlightBox}>Possessive</Text>
                </Text>
                <View style={styles.structureSteps}>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepLabel}>Step 1:</Text>
                    <Text style={styles.stepText}>Take the noun</Text>
                    <Text style={styles.stepExample}>Example: <Text style={styles.stepExampleBold}>pirtûk</Text> (book)</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepLabel}>Step 2:</Text>
                    <Text style={styles.stepText}>Add ending (-a, -ê, or -ên)</Text>
                    <Text style={styles.stepExample}><Text style={styles.stepExampleBold}>pirtûk</Text> → <Text style={styles.highlightBox}>pirtûka</Text> (for singular)</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepLabel}>Step 3:</Text>
                    <Text style={styles.stepText}>Add possessive pronoun</Text>
                    <Text style={styles.stepExample}><Text style={styles.highlightBox}>pirtûka</Text> + <Text style={styles.stepExampleBold}>min</Text> (my)</Text>
                    <Text style={styles.stepExample}>= <Text style={styles.stepExampleBold}>pirtûka min</Text> (my book)</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  💡 Tip: Remember: <Text style={styles.tipBold}>Noun + Ending + Possessive</Text> - the opposite of English! Also, use subject pronouns (ez, tu, ew) for subjects, but possessive pronouns (min, te, wî) for possessives.
                </Text>
              </View>
            </View>

            {/* Possessive Pronouns Reference Table */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Possessive Pronouns Reference</Text>
              <View style={styles.tableContainer}>
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 0.8 }]} numberOfLines={1}>Kurdish</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.0 }]} numberOfLines={1}>English</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.5 }]} numberOfLines={1}>Example</Text>
                </View>
                {/* Table Rows */}
                {possessiveTable.map((row, index) => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
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
  progressInfoSeparator: {
    color: '#9ca3af',
  },
  progressInfoComplete: {
    color: '#10b981',
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
  structureFormula: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'monospace',
    marginBottom: 16,
    textAlign: 'center',
  },
  highlightBox: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '700',
  },
  structureSteps: {
    gap: 12,
  },
  stepItem: {
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  stepExample: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
    marginLeft: 16,
  },
  stepExampleBold: {
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
  tipBold: {
    fontWeight: '700',
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
  tableCellUsage: {
    fontSize: 12,
    color: '#6b7280',
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

