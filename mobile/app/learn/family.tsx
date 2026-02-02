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

const LESSON_ID = '8'; // Family Members lesson ID

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

// Family members data
const family = [
  { en: "Family", ku: "malbat", icon: "👨‍👩‍👧‍👦" },
  { en: "Mother", ku: "dayik", icon: "👩" },
  { en: "Father", ku: "bav", icon: "👨" },
  { en: "Sister", ku: "xwişk", icon: "👧" },
  { en: "Brother", ku: "bira", icon: "👦" },
  { en: "Daughter", ku: "keç", icon: "👧" },
  { en: "Son", ku: "kur", icon: "👦" },
  { en: "Grandmother", ku: "dapîr", icon: "👵" },
  { en: "Grandfather", ku: "bapîr", icon: "👴" },
  { en: "Paternal uncle", ku: "apo", icon: "👨" },
  { en: "Maternal uncle", ku: "xalo", icon: "👨" },
  { en: "Paternal aunt", ku: "metê", icon: "👩" },
  { en: "Maternal aunt", ku: "xaltî", icon: "👩" },
  { en: "Parents", ku: "dewûbav", icon: "👨‍👩‍👧" },
  { en: "Baby", ku: "zarok", icon: "👶" },
  { en: "Cousin", ku: "pismam", icon: "👫" },
  { en: "Uncle's daughter", ku: "dotmam", icon: "👧" },
  { en: "Uncle's son", ku: "kurap", icon: "👦" },
  { en: "Mother-in-law", ku: "xesû", icon: "👩" },
  { en: "Father-in-law", ku: "xezûr", icon: "👨" },
  { en: "Sister-in-law", ku: "jinbira", icon: "👩" },
  { en: "Brother-in-law", ku: "tîbira", icon: "👨" },
  { en: "Groom", ku: "zava", icon: "🤵" },
  { en: "Bride", ku: "bûk", icon: "👰" },
];

// Possessive forms
const possessiveForms = [
  { ku: "dayika min", en: "my mother" },
  { ku: "bavê te", en: "your father" },
  { ku: "xwişka wî", en: "his sister" },
  { ku: "xwişka wê", en: "her sister" },
  { ku: "birayê min", en: "my brother" },
  { ku: "malbata min", en: "my family" },
];

// Age-related terms for siblings
const ageTerms = [
  { ku: "birayê mezin", en: "elder brother" },
  { ku: "birayê piçûk", en: "younger brother" },
  { ku: "xwişka mezin", en: "elder sister" },
  { ku: "xwişka piçûk", en: "younger sister" },
];

// Family phrases
const familyPhrases = [
  { ku: "Ez malbata xwe hez dikim", en: "I love my family" },
  { ku: "Ev dayika min e", en: "This is my mother" },
  { ku: "Ev bava min e", en: "This is my father" },
  { ku: "Ev xwişka min e", en: "This is my sister" },
  { ku: "Ez birayê xwe hez dikim", en: "I love my brother" },
  { ku: "Malbata min mezin e", en: "My family is big" },
];

// Family questions
const familyQuestions = [
  { ku: "Çend xwişk û birayên te hene?", en: "How many sisters and brothers do you have?" },
  { ku: "Ev kî ye?", en: "Who is this?" },
  { ku: "Dayika te li ku ye?", en: "Where is your mother?" },
  { ku: "Malbata te li ku ye?", en: "Where is your family?" },
  { ku: "Tu zewicî yî?", en: "Are you married?" },
  { ku: "Bavê te li ku ye?", en: "Where is your father?" },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  // Family members
  'malbat': require('../../assets/audio/family/malbat.mp3'),
  'dayik': require('../../assets/audio/family/dayik.mp3'),
  'bav': require('../../assets/audio/family/bav.mp3'),
  'xwisk': require('../../assets/audio/family/xwisk.mp3'),
  'bira': require('../../assets/audio/family/bira.mp3'),
  'kec': require('../../assets/audio/family/kec.mp3'),
  'kur': require('../../assets/audio/family/kur.mp3'),
  'dapir': require('../../assets/audio/family/dapir.mp3'),
  'bapir': require('../../assets/audio/family/bapir.mp3'),
  'apo': require('../../assets/audio/family/apo.mp3'),
  'xalo': require('../../assets/audio/family/xalo.mp3'),
  'mete': require('../../assets/audio/family/mete.mp3'),
  'xalti': require('../../assets/audio/family/xalti.mp3'),
  'dewubav': require('../../assets/audio/family/dewubav.mp3'),
  'zarok': require('../../assets/audio/family/zarok.mp3'),
  'pismam': require('../../assets/audio/family/pismam.mp3'),
  'dotmam': require('../../assets/audio/family/dotmam.mp3'),
  'kurap': require('../../assets/audio/family/kurap.mp3'),
  'xesu': require('../../assets/audio/family/xesu.mp3'),
  'xezur': require('../../assets/audio/family/xezur.mp3'),
  'jinbira': require('../../assets/audio/family/jinbira.mp3'),
  'tibira': require('../../assets/audio/family/tibira.mp3'),
  'zava': require('../../assets/audio/family/zava.mp3'),
  'buk': require('../../assets/audio/family/buk.mp3'),
  // Possessive forms
  'dayika-min': require('../../assets/audio/family/dayika-min.mp3'),
  'bave-te': require('../../assets/audio/family/bave-te.mp3'),
  'xwiska-wi': require('../../assets/audio/family/xwiska-wi.mp3'),
  'xwiska-we': require('../../assets/audio/family/xwiska-we.mp3'),
  'biraye-min': require('../../assets/audio/family/biraye-min.mp3'),
  'malbata-min': require('../../assets/audio/family/malbata-min.mp3'),
  // Age-related terms
  'biraye-mezin': require('../../assets/audio/family/biraye-mezin.mp3'),
  'biraye-picuk': require('../../assets/audio/family/biraye-picuk.mp3'),
  'xwiska-mezin': require('../../assets/audio/family/xwiska-mezin.mp3'),
  'xwiska-picuk': require('../../assets/audio/family/xwiska-picuk.mp3'),
  // Family phrases
  'ez-malbata-xwe-hez-dikim': require('../../assets/audio/family/ez-malbata-xwe-hez-dikim.mp3'),
  'ev-dayika-min-e': require('../../assets/audio/family/ev-dayika-min-e.mp3'),
  'ev-bava-min-e': require('../../assets/audio/family/ev-bava-min-e.mp3'),
  'ev-xwiska-min-e': require('../../assets/audio/family/ev-xwiska-min-e.mp3'),
  'ez-biraye-xwe-hez-dikim': require('../../assets/audio/family/ez-biraye-xwe-hez-dikim.mp3'),
  'malbata-min-mezin-e': require('../../assets/audio/family/malbata-min-mezin-e.mp3'),
  // Family questions
  'cend-xwisk-u-birayen-te-hene': require('../../assets/audio/family/cend-xwisk-u-birayen-te-hene.mp3'),
  'ev-ki-ye': require('../../assets/audio/family/ev-ki-ye.mp3'),
  'dayika-te-li-ku-ye': require('../../assets/audio/family/dayika-te-li-ku-ye.mp3'),
  'malbata-te-li-ku-ye': require('../../assets/audio/family/malbata-te-li-ku-ye.mp3'),
  'tu-zewici-yi': require('../../assets/audio/family/tu-zewici-yi.mp3'),
  'bave-te-li-ku-ye': require('../../assets/audio/family/bave-te-li-ku-ye.mp3'),
};

export default function FamilyPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Progress configuration (no practice section - allow 100% from audio + time)
  const progressConfig = {
    totalAudios: 46, // 24 family + 6 possessive + 4 age + 6 phrases + 6 questions
    hasPractice: false,
    audioWeight: 50, // 50% from audio (instead of 30% since no practice)
    timeWeight: 50, // 50% from time (instead of 20% since no practice)
    audioMultiplier: 1.087, // 50% / 46 audios ≈ 1.087% per audio
    timeMultiplier: 10, // 50% / 5 minutes = 10% per minute
  };
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID);
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set((storedProgress.playedAudioKeys || []) as string[]));
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);
  const previousUniqueAudiosCountRef = useRef<number>(0);
  const [playedKeysSnapshot, setPlayedKeysSnapshot] = useState<string[]>(() => (getLessonProgress(LESSON_ID).playedAudioKeys || []) as string[]);

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

  const calculateProgress = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const totalExamples = progressConfig.totalAudios;
    const currentUniqueAudiosCount = uniqueAudiosPlayedRef.current.size;
    const baseTimeSpent = currentProgress.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const safeBaseTimeSpent = baseTimeSpent > 10000 ? 0 : baseTimeSpent;
    const safeTotalTimeSpent = Math.min(10000, safeBaseTimeSpent + sessionTimeMinutes);
    const progress = Math.min(100, Math.round((currentUniqueAudiosCount / totalExamples) * 100));
    return { progress, timeSpent: safeTotalTimeSpent };
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const { progress, timeSpent } = calculateProgress();
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS');
    updateLessonProgress(LESSON_ID, progress, status, undefined, timeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  // Process family members to add audioFile paths
  const familyWithAudio = family.map(member => {
    const audioFile = getAudioFilename(member.ku);
    return {
      ...member,
      audioFile
    };
  });

  // Process other sections to add audioFile paths
  const possessiveWithAudio = possessiveForms.map(item => {
    const audioFile = getAudioFilename(item.ku);
    return {
      ...item,
      audioFile
    };
  });

  const ageTermsWithAudio = ageTerms.map(item => {
    const audioFile = getAudioFilename(item.ku);
    return {
      ...item,
      audioFile
    };
  });

  const phrasesWithAudio = familyPhrases.map(item => {
    const audioFile = getAudioFilename(item.ku);
    return {
      ...item,
      audioFile
    };
  });

  const questionsWithAudio = familyQuestions.map(item => {
    const audioFile = getAudioFilename(item.ku);
    return {
      ...item,
      audioFile
    };
  });

  const progress = getLessonProgress(LESSON_ID);
  // Calculate total examples count for Learn progress (24 + 6 + 4 + 6 + 6 = 46)
  const totalExamples = family.length + possessiveForms.length + ageTerms.length + familyPhrases.length + familyQuestions.length;
  // Show accumulated unique audios (base + new in this session)
  const learnedCount = Math.min(totalExamples, uniqueAudiosPlayedRef.current.size);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Family Members</Text>
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
        </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Family Members */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.sectionTitle}>Family Members</Text>
          </View>
          <View style={styles.familyGrid}>
            {familyWithAudio.map((member, index) => (
              <View key={index} style={styles.familyCard}>
                <View style={styles.familyTextContainer}>
                  <Text style={styles.familyKurdish}>{member.ku}</Text>
                  <Text style={styles.familyEnglish}>{member.en}</Text>
                </View>
                <View style={styles.familyBottomRow}>
                  <Text style={styles.familyIcon}>{member.icon}</Text>
                  <Pressable
                    onPress={() => playAudio(member.audioFile)}
                    style={styles.audioButtonContainer}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={playingAudio === member.audioFile ? 'volume-high' : 'volume-low-outline'}
                      size={22}
                      color="#4b5563"
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Possessive Forms */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💬</Text>
            <Text style={styles.sectionTitle}>Possessive Forms</Text>
          </View>
          <View style={styles.examplesGrid}>
            {possessiveWithAudio.map((item, index) => (
              <View key={index} style={styles.exampleCard}>
                <View style={styles.exampleTextContainer}>
                  <Text style={styles.exampleKurdish}>{item.ku}</Text>
                  <Text style={styles.exampleEnglish}>{item.en}</Text>
                </View>
                <Pressable
                  onPress={() => playAudio(item.audioFile)}
                  style={styles.audioButtonContainer}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={playingAudio === item.audioFile ? 'volume-high' : 'volume-low-outline'}
                    size={22}
                    color="#4b5563"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Age-Related Terms */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👥</Text>
            <Text style={styles.sectionTitle}>Age-Related Terms</Text>
          </View>
          <View style={styles.examplesGrid}>
            {ageTermsWithAudio.map((item, index) => (
              <View key={index} style={styles.exampleCard}>
                <View style={styles.exampleTextContainer}>
                  <Text style={styles.exampleKurdish}>{item.ku}</Text>
                  <Text style={styles.exampleEnglish}>{item.en}</Text>
                </View>
                <Pressable
                  onPress={() => playAudio(item.audioFile)}
                  style={styles.audioButtonContainer}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={playingAudio === item.audioFile ? 'volume-high' : 'volume-low-outline'}
                    size={22}
                    color="#4b5563"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Family Phrases */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💭</Text>
            <Text style={styles.sectionTitle}>Family Phrases</Text>
          </View>
          <View style={styles.phrasesList}>
            {phrasesWithAudio.map((item, index) => (
              <View key={index} style={styles.phraseCard}>
                <View style={styles.exampleTextContainer}>
                  <Text style={styles.exampleKurdish}>{item.ku}</Text>
                  <Text style={styles.exampleEnglish}>{item.en}</Text>
                </View>
                <Pressable
                  onPress={() => playAudio(item.audioFile)}
                  style={styles.audioButtonContainer}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={playingAudio === item.audioFile ? 'volume-high' : 'volume-low-outline'}
                    size={22}
                    color="#4b5563"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Family Questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❓</Text>
            <Text style={styles.sectionTitle}>Family Questions</Text>
          </View>
          <View style={styles.phrasesList}>
            {questionsWithAudio.map((item, index) => (
              <View key={index} style={styles.phraseCard}>
                <View style={styles.exampleTextContainer}>
                  <Text style={styles.exampleKurdish}>{item.ku}</Text>
                  <Text style={styles.exampleEnglish}>{item.en}</Text>
                </View>
                <Pressable
                  onPress={() => playAudio(item.audioFile)}
                  style={styles.audioButtonContainer}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={playingAudio === item.audioFile ? 'volume-high' : 'volume-low-outline'}
                    size={22}
                    color="#4b5563"
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
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
  familyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  familyCard: {
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
  familyTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  familyKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  familyEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  familyBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  familyIcon: {
    fontSize: 28,
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  exampleCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleTextContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
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
  phrasesList: {
    gap: 12,
  },
  phraseCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

