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

const LESSON_ID = '20'; // Questions & Negation lesson ID

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

// Question words reference table
const questionWordsTable = [
  { ku: "kî", en: "who", example: "Ew kî ye?", exampleEn: "Who is he/she?" },
  { ku: "çi", en: "what", example: "Ev çi ye?", exampleEn: "What is this?" },
  { ku: "ku", en: "where", example: "Tu ku yî?", exampleEn: "Where are you?" },
  { ku: "kengî", en: "when", example: "Tu kengî diçî?", exampleEn: "When do you go?" },
  { ku: "çima", en: "why", example: "Tu çima li vir yî?", exampleEn: "Why are you here?" },
  { ku: "çawa", en: "how", example: "Tu çawa yî?", exampleEn: "How are you?" }
];

const presentTenseExamples = [
  {
    title: 'Question Words',
    examples: [
      { ku: "kî", en: "who", audio: true },
      { ku: "çi", en: "what", audio: true },
      { ku: "ku", en: "where", audio: true },
      { ku: "kengî", en: "when", audio: true },
      { ku: "çima", en: "why", audio: true },
      { ku: "çawa", en: "how", audio: true }
    ]
  },
  {
    title: 'Asking Questions',
    examples: [
      { ku: "Tu çawa yî?", en: "How are you?", audio: true, audioText: "Tu çawa yî?" },
      { ku: "Ev çi ye?", en: "What is this?", audio: true, audioText: "Ev çi ye?" },
      { ku: "Tu ku yî?", en: "Where are you?", audio: true, audioText: "Tu ku yî?" },
      { ku: "Tu çi dixwî?", en: "What do you eat?", audio: true, audioText: "Tu çi dixwî?" },
      { ku: "Ew kengî hat?", en: "When did he come?", audio: true, audioText: "Ew kengî hat?" },
      { ku: "Tu çima li vir yî?", en: "Why are you here?", audio: true, audioText: "Tu çima li vir yî?" },
      { ku: "Ew kî ye?", en: "Who is he/she?", audio: true, audioText: "Ew kî ye?" }
    ]
  },
  {
    title: 'Negative Sentences - Verbs',
    examples: [
      { ku: "Ez naxwim.", en: "I don't eat", audio: true, audioText: "Ez naxwim." },
      { ku: "Tu naxwî.", en: "you don't eat", audio: true, audioText: "Tu naxwî." },
      { ku: "Ew naxwe.", en: "he/she doesn't eat", audio: true, audioText: "Ew naxwe." },
      { ku: "Em naxwin.", en: "we don't eat", audio: true, audioText: "Em naxwin." },
      { ku: "Ez naçim.", en: "I don't go", audio: true, audioText: "Ez naçim." },
      { ku: "Tu naxwînî.", en: "you don't read", audio: true, audioText: "Tu naxwînî." }
    ]
  },
  {
    title: 'Negative Sentences - "To Be"',
    examples: [
      { ku: "Ez xwendekar nînim.", en: "I am not a student", audio: true, audioText: "Ez xwendekar nînim" },
      { ku: "Ew malê nîne.", en: "He/She is not at home", audio: true, audioText: "Ew malê nîne" },
      { ku: "Em li derve nînin.", en: "We are not outside", audio: true, audioText: "Em li derve nînin" },
      { ku: "Tu li vir nînî.", en: "You are not here", audio: true, audioText: "Tu li vir nînî" },
      { ku: "Ewan xwendekar nînin.", en: "They are not students", audio: true, audioText: "Ewan xwendekar nînin" }
    ]
  },
  {
    title: 'Negative Questions',
    examples: [
      { ku: "Tu çi naxwî?", en: "What don't you eat?", audio: true, audioText: "Tu çi naxwî?" },
      { ku: "Ew naçe ku derê?", en: "Where doesn't he/she go?", audio: true, audioText: "Ew naçe ku derê?" },
      { ku: "Tu çima naxwînî?", en: "Why don't you read?", audio: true, audioText: "Tu çima naxwînî?" }
    ]
  }
];

const commonMistakes = [
  {
    wrong: "Tu çawa î?",
    correct: "Tu çawa yî?",
    explanation: "For 'Tu' (you), use 'yî' not 'î' when asking 'how are you?'"
  },
  {
    wrong: "Ez naxwim nan",
    correct: "Ez nan naxwim",
    explanation: "Remember SOV order! Even in negative sentences: Subject + Object + Verb. 'nan' (bread) comes before 'naxwim' (don't eat)."
  },
  {
    wrong: "Ez xwendekar nînim",
    correct: "Ez xwendekar nînim",
    explanation: "Actually this is correct! But remember: 'nînim' is for 'Ez' (I). For 'Ew' use 'nîne', for plural use 'nînin'."
  },
  {
    wrong: "Tu naxwî nan",
    correct: "Tu nan naxwî",
    explanation: "SOV order applies to negative sentences too: Tu (you) + nan (bread) + naxwî (don't eat) = Tu nan naxwî"
  },
  {
    wrong: "Ew çi ye?",
    correct: "Ev çi ye?",
    explanation: "Actually both can be correct! 'Ev çi ye?' = 'What is this?' and 'Ew çi ye?' = 'What is that?' But 'Ev çi ye?' is more common."
  }
];

const practiceExercises = [
  {
    question: "What question word means 'who'?",
    options: ["çi", "kî", "ku", "kengî"],
    correct: 1,
    explanation: "'kî' means 'who'. 'çi' = what, 'ku' = where, 'kengî' = when"
  },
  {
    question: "How do you say 'How are you?'?",
    options: ["Tu çawa î?", "Tu çawa yî?", "Tu çawa e?", "Tu çawa in?"],
    correct: 1,
    explanation: "For 'Tu' (you), use 'yî': Tu çawa yî? (How are you?)"
  },
  {
    question: "What is the negative of 'Ez dixwim' (I eat)?",
    options: ["Ez naxwim", "Ez nedixwim", "Ez dixwim ne", "Ez ne dixwim"],
    correct: 0,
    explanation: "Replace 'di-' with 'na-': dixwim → naxwim (I don't eat)"
  },
  {
    question: "How do you say 'I am not a student'?",
    options: ["Ez xwendekar nînim", "Ez xwendekar nîne", "Ez xwendekar nînin", "Ez xwendekar nîyî"],
    correct: 0,
    explanation: "For 'Ez' (I), use 'nînim': Ez xwendekar nînim (I am not a student)"
  },
  {
    question: "What question word means 'where'?",
    options: ["kî", "çi", "ku", "çima"],
    correct: 2,
    explanation: "'ku' means 'where'. 'kî' = who, 'çi' = what, 'çima' = why"
  },
  {
    question: "How do you say 'What is this?'?",
    options: ["Ev çi ye?", "Ew çi ye?", "Ev çi e?", "Ew çi e?"],
    correct: 0,
    explanation: "'Ev çi ye?' = 'What is this?' Use 'Ev' for 'this' and 'ye' for 'is'"
  },
  {
    question: "What is the negative of 'Tu dixwî' (You eat)?",
    options: ["Tu naxwî", "Tu nedixwî", "Tu dixwî ne", "Tu ne dixwî"],
    correct: 0,
    explanation: "Replace 'di-' with 'na-': dixwî → naxwî (you don't eat)"
  },
  {
    question: "How do you say 'Where are you?'?",
    options: ["Tu ku yî?", "Tu ku î?", "Tu ku e?", "Tu ku in?"],
    correct: 0,
    explanation: "For 'Tu' (you), use 'yî': Tu ku yî? (Where are you?)"
  },
  {
    question: "What question word means 'when'?",
    options: ["kengî", "ku", "çima", "çawa"],
    correct: 0,
    explanation: "'kengî' means 'when'. 'ku' = where, 'çima' = why, 'çawa' = how"
  },
  {
    question: "How do you say 'We don't eat'?",
    options: ["Em naxwin", "Em nedixwin", "Em dixwin ne", "Em ne dixwin"],
    correct: 0,
    explanation: "Replace 'di-' with 'na-': dixwin → naxwin (we don't eat)"
  },
  {
    question: "What is the negative of 'Ew li malê ye' (He/She is at home)?",
    options: ["Ew li malê nîne", "Ew li malê nînim", "Ew li malê nînin", "Ew li malê nîyî"],
    correct: 0,
    explanation: "For 'Ew' (he/she), use 'nîne': Ew li malê nîne (He/She is not at home)"
  },
  {
    question: "How do you say 'Why are you here?'?",
    options: ["Tu çima li vir yî?", "Tu çima li vir î?", "Tu çima li vir e?", "Tu çima li vir in?"],
    correct: 0,
    explanation: "For 'Tu' (you), use 'yî': Tu çima li vir yî? (Why are you here?)"
  },
  {
    question: "What question word means 'why'?",
    options: ["çima", "çawa", "kengî", "ku"],
    correct: 0,
    explanation: "'çima' means 'why'. 'çawa' = how, 'kengî' = when, 'ku' = where"
  },
  {
    question: "How do you say 'They are not students'?",
    options: ["Ewan xwendekar nînin", "Ewan xwendekar nînim", "Ewan xwendekar nîne", "Ewan xwendekar nîyî"],
    correct: 0,
    explanation: "For plural 'Ewan' (they), use 'nînin': Ewan xwendekar nînin"
  },
  {
    question: "What is the correct negative sentence for 'I don't go'?",
    options: ["Ez naçim", "Ez neçim", "Ez çim ne", "Ez ne çim"],
    correct: 0,
    explanation: "For 'çûn' (to go), use 'naçim' (I don't go). Some verbs use 'ne-' instead of 'na-'."
  },
  {
    question: "How do you say 'What do you eat?'?",
    options: ["Tu çi dixwî?", "Tu çi naxwî?", "Tu çi ye?", "Tu çi dike?"],
    correct: 0,
    explanation: "Question word 'çi' (what) + subject + verb: Tu çi dixwî? (What do you eat?)"
  },
  {
    question: "What is the negative of 'Em li derve ne' (We are outside)?",
    options: ["Em li derve nînin", "Em li derve nînim", "Em li derve nîne", "Em li derve nîyî"],
    correct: 0,
    explanation: "For 'Em' (we), use 'nînin': Em li derve nînin (We are not outside)"
  },
  {
    question: "How do you say 'When do you go?'?",
    options: ["Tu kengî diçî?", "Tu kengî naçî?", "Tu kengî yî?", "Tu kengî e?"],
    correct: 0,
    explanation: "Question word 'kengî' (when) + subject + verb: Tu kengî diçî? (When do you go?)"
  },
  {
    question: "What question word means 'how'?",
    options: ["çawa", "çima", "kengî", "ku"],
    correct: 0,
    explanation: "'çawa' means 'how'. 'çima' = why, 'kengî' = when, 'ku' = where"
  },
  {
    question: "In negative sentences, what prefix replaces 'di-'?",
    options: ["na-", "ne-", "nî-", "both na- and ne-"],
    correct: 3,
    explanation: "Most verbs use 'na-' (naxwim), but some use 'ne-' (neçim). It depends on the verb."
  }
];

// Audio assets
const audioAssets: Record<string, any> = {
  // Question words
  'ki': require('../../assets/audio/grammar/ki.mp3'),
  'ci': require('../../assets/audio/grammar/ci.mp3'),
  'ku': require('../../assets/audio/grammar/ku.mp3'),
  'kengi': require('../../assets/audio/grammar/kengi.mp3'),
  'cima': require('../../assets/audio/grammar/cima.mp3'),
  'cawa': require('../../assets/audio/grammar/cawa.mp3'),
  // Questions
  'tu-cawa-yi': require('../../assets/audio/grammar/tu-cawa-yi.mp3'),
  'ev-ci-ye': require('../../assets/audio/grammar/ev-ci-ye.mp3'),
  'tu-ku-yi': require('../../assets/audio/grammar/tu-ku-yi.mp3'),
  // Note: Audio files for "Ew diçe ku derê?" and "Ew naçe ku derê?" need to be generated
  'tu-ci-dixwi': require('../../assets/audio/grammar/tu-ci-dixwi.mp3'),
  'ew-kengi-hat': require('../../assets/audio/grammar/ew-kengi-hat.mp3'),
  'tu-cima-li-vir-yi': require('../../assets/audio/grammar/tu-cima-li-vir-yi.mp3'),
  'ew-ki-ye': require('../../assets/audio/grammar/ew-ki-ye.mp3'),
  // Negative verbs
  'ez-naxwim': require('../../assets/audio/grammar/ez-naxwim.mp3'),
  'tu-naxwi': require('../../assets/audio/grammar/tu-naxwi.mp3'),
  'ew-naxwe': require('../../assets/audio/grammar/ew-naxwe.mp3'),
  'em-naxwin': require('../../assets/audio/grammar/em-naxwin.mp3'),
  'ez-nacim': require('../../assets/audio/grammar/ez-nacim.mp3'),
  'tu-naxwini': require('../../assets/audio/grammar/tu-naxwini.mp3'),
  // Negative "to be"
  'ez-xwendekar-ninim': require('../../assets/audio/grammar/ez-xwendekar-ninim.mp3'),
  'ew-male-nine': require('../../assets/audio/grammar/ew-male-nine.mp3'),
  'em-li-derve-ninin': require('../../assets/audio/grammar/em-li-derve-ninin.mp3'),
  'tu-li-vir-nini': require('../../assets/audio/grammar/tu-li-vir-nini.mp3'),
  'ewan-xwendekar-ninin': require('../../assets/audio/grammar/ewan-xwendekar-ninin.mp3'),
  // Negative questions
  'tu-ci-naxwi': require('../../assets/audio/grammar/tu-ci-naxwi.mp3'),
  'ew-nace-ku-dere': require('../../assets/audio/grammar/ew-nace-ku-dere.mp3'),
  'tu-cima-naxwini': require('../../assets/audio/grammar/tu-cima-naxwini.mp3'),
};

export default function QuestionsNegationPage() {
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
        <Text style={styles.headerTitle}>Questions & Negation</Text>
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
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>How Questions & Negation Work in Kurdish</Text>
              </View>
              <View style={styles.howItWorksContent}>
                <View style={styles.howItWorksItem}>
                  <Text style={styles.howItWorksSubtitle}>Asking Questions:</Text>
                  <Text style={styles.howItWorksText}>
                    Just use question words (who, what, where, when, why, how) at the beginning of the sentence. The word order stays the same (SOV)!
                  </Text>
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>
                      <Text style={styles.exampleHighlight}>Tu</Text> (you) + <Text style={styles.exampleHighlight}>çi</Text> (what) + <Text style={styles.exampleHighlight}>dixwî</Text> (eat) = <Text style={styles.exampleBold}>Tu çi dixwî?</Text> (What do you eat?)
                    </Text>
                  </View>
                </View>
                
                <View style={styles.howItWorksItem}>
                  <Text style={styles.howItWorksSubtitle}>Making Negative Sentences:</Text>
                  <Text style={styles.howItWorksText}>
                    For verbs: Replace <Text style={styles.exampleBold}>"di-"</Text> with <Text style={styles.exampleBold}>"na-"</Text>
                  </Text>
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>
                      <Text style={styles.exampleHighlight}>dixwim</Text> (I eat) → <Text style={styles.exampleHighlight}>naxwim</Text> (I don't eat)
                    </Text>
                  </View>
                  <Text style={styles.howItWorksText}>
                    For "to be": Use <Text style={styles.exampleBold}>"nîn"</Text> or <Text style={styles.exampleBold}>"nînim"</Text>
                  </Text>
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleText}>
                      <Text style={styles.exampleHighlight}>Ez xwendekar im</Text> (I am a student) → <Text style={styles.exampleHighlight}>Ez xwendekar nînim</Text> (I am not a student)
                    </Text>
                  </View>
                </View>
                
                <View style={styles.tipBox}>
                  <Text style={styles.tipText}>
                    <Text style={styles.tipEmoji}>💡</Text> Tip: Questions are easy - just add a question word! Negation is simple - just change "di-" to "na-" for verbs. Remember SOV order applies to both!
                  </Text>
                </View>
              </View>
            </View>

            {/* Question Words Reference Table */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📊 Question Words Reference</Text>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                    <Text style={styles.tableHeaderText} numberOfLines={1}>Kurdish</Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                    <Text style={styles.tableHeaderText} numberOfLines={1}>English</Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                    <Text style={styles.tableHeaderText} numberOfLines={1}>Example</Text>
                  </View>
                </View>
                {questionWordsTable.map((row, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.tableCellKurdish}>{row.ku}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 1 }]}>
                      <Text style={styles.tableCellText}>{row.en}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      <Text style={styles.tableCellKurdish}>{row.example}</Text>
                      <Text style={[styles.tableCellText, { marginTop: 4 }]}>{row.exampleEn}</Text>
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
              <View style={styles.mistakesContainer}>
                {commonMistakes.map((mistake, index) => (
                  <View key={index} style={styles.mistakeCard}>
                    <View style={styles.mistakeContent}>
                      <Text style={styles.mistakeLabel}>Wrong:</Text>
                      <Text style={styles.mistakeWrong}>{mistake.wrong}</Text>
                    </View>
                    <View style={styles.mistakeContent}>
                      <Text style={styles.mistakeLabel}>Correct:</Text>
                      <Text style={styles.mistakeCorrect}>{mistake.correct}</Text>
                    </View>
                    <Text style={styles.mistakeExplanation}>{mistake.explanation}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Examples */}
            {examplesWithAudio.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.examplesContainer}>
                  {section.examples.map((example, exampleIndex) => (
                    <View key={exampleIndex} style={styles.exampleCard}>
                      <View style={styles.exampleContent}>
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

                <Text style={styles.practiceQuestion}>
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
                        style={({ pressed }) => [
                          styles.optionButton,
                          isSelected && !showResult && styles.optionButtonSelected,
                          showResult && isCorrect && styles.optionButtonCorrect,
                          showResult && isSelected && !isCorrect && styles.optionButtonWrong,
                          pressed && styles.pressed,
                        ]}
                      >
                        <View style={styles.optionContent}>
                          {showResult && isCorrect && (
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                          )}
                          <Text style={[
                            styles.optionText,
                            showResult && isCorrect && styles.optionTextCorrect,
                            showResult && isSelected && !isCorrect && styles.optionTextWrong,
                          ]}>
                            {option}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {showFeedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackText}>
                      <Text style={styles.feedbackLabel}>Explanation:</Text> {practiceExercises[currentExercise].explanation}
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
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  sectionEmojiWarning: {
    fontSize: 18,
    marginRight: 8,
  },
  howItWorksContent: {
    gap: 16,
  },
  howItWorksItem: {
    gap: 8,
  },
  howItWorksSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  howItWorksText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  exampleBox: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exampleText: {
    fontSize: 13,
    color: '#111827',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  exampleHighlight: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  exampleBold: {
    fontWeight: '700',
  },
  tipBox: {
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  tipEmoji: {
    fontSize: 16,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 2,
    borderBottomColor: '#d1fae5',
  },
  tableHeaderCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    justifyContent: 'center',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  tableCellKurdish: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  tableCellText: {
    fontSize: 14,
    color: '#4b5563',
  },
  mistakesContainer: {
    gap: 12,
    marginTop: 8,
  },
  mistakeCard: {
    backgroundColor: '#fce7f3',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  mistakeContent: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  mistakeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#dc2626',
  },
  mistakeWrong: {
    fontSize: 14,
    color: '#ef4444',
    textDecorationLine: 'line-through',
    fontFamily: 'monospace',
  },
  mistakeCorrect: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
    fontFamily: 'monospace',
  },
  mistakeExplanation: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  examplesContainer: {
    gap: 12,
    marginTop: 8,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exampleContent: {
    flex: 1,
    gap: 4,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  practiceCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 13,
    color: '#6b7280',
  },
  progressBarContainer: {
    marginBottom: 20,
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
  practiceQuestion: {
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
    padding: 16,
    borderRadius: 8,
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
  optionButtonWrong: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  optionTextCorrect: {
    color: '#065f46',
    fontWeight: '600',
  },
  optionTextWrong: {
    color: '#991b1b',
  },
  feedbackContainer: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  feedbackText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  feedbackLabel: {
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3A86FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completionCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  completionScore: {
    fontWeight: '700',
    color: '#ef4444',
  },
  completionTotal: {
    fontWeight: '700',
    color: '#111827',
  },
  completionPercentage: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ef4444',
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

