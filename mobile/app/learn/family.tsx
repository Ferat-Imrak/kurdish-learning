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
    // Audio clicks: max 30% (24 family + 6 possessive + 4 age + 6 phrases + 6 questions = 46 total, so ~1 click = 0.65%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 0.65);
    // Time spent: max 20% (4 minutes = 20%)
    const timeProgress = Math.min(20, timeSpent * 5);
    // Practice score: max 50% (no practice section, so 0%)
    const practiceProgress = 0;
    return Math.min(100, audioProgress + timeProgress + practiceProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const progress = calculateProgress();
    updateLessonProgress(LESSON_ID, progress, 'IN_PROGRESS');
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
        <Text style={styles.headerTitle}>Family Members</Text>
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
        </Text>
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

