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

const LESSON_ID = '6'; // Things Around the House lesson ID

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

// House items data
const houseItems = [
  { ku: "mal", en: "house", icon: "🏠", audioFile: "mal" },
  { ku: "ode", en: "room", icon: "🚪", audioFile: "ode" },
  { ku: "derî", en: "door", icon: "🚪", audioFile: "deri" },
  { ku: "pencere", en: "window", icon: "🪟", audioFile: "pencere" },
  { ku: "kursî", en: "chair", icon: "🪑", audioFile: "kursi" },
  { ku: "mase", en: "table", icon: "⬜", audioFile: "mase" },
  { ku: "nivîn", en: "bed", icon: "🛏️", audioFile: "nivin" },
  { ku: "qenepe", en: "sofa", icon: "🛋️", audioFile: "qenepe" },
  { ku: "çira", en: "lamp", icon: "💡", audioFile: "cira" },
  { ku: "televîzyon", en: "television", icon: "📺", audioFile: "televizyon" },
  { ku: "sarinc", en: "refrigerator", icon: "🧊", audioFile: "sarinc" },
  { ku: "aşxane", en: "kitchen", icon: "🍳", audioFile: "asxane" },
];

// Room types
const roomTypes = [
  { ku: "odeya xewê", en: "bedroom", audioFile: "odeya-xewe" },
  { ku: "aşxane", en: "kitchen", audioFile: "asxane" },
  { ku: "odeya rûniştinê", en: "living room", audioFile: "odeya-runistine" },
  { ku: "hemam", en: "bathroom", audioFile: "hemam" },
];

// House questions
const houseQuestions = [
  { ku: "Malê te çend ode hene?", en: "How many rooms does your house have?", audioFile: "male-te-cend-ode-hene" },
  { ku: "Tu li ku radizî?", en: "Where do you sleep?", audioFile: "tu-li-ku-radizi-sleep" },
  { ku: "Tu li ku dixwî?", en: "Where do you eat?", audioFile: "tu-li-ku-dixewi-eat" },
  { ku: "Mala te mezin e?", en: "Is your house big?", audioFile: "mala-te-mezin-e" },
  { ku: "Tu li ku derê xwarinê çêdikî?", en: "Where do you cook?", audioFile: "tu-li-ku-dere-xwarine-cediki" },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'asxane': require('../../assets/audio/house/asxane.mp3'),
  'cira': require('../../assets/audio/house/cira.mp3'),
  'deri': require('../../assets/audio/house/deri.mp3'),
  'hemam': require('../../assets/audio/house/hemam.mp3'),
  'kursi': require('../../assets/audio/house/kursi.mp3'),
  'mal': require('../../assets/audio/house/mal.mp3'),
  'mala-te-mezin-e': require('../../assets/audio/house/mala-te-mezin-e.mp3'),
  'male-te-cend-ode-hene': require('../../assets/audio/house/male-te-cend-ode-hene.mp3'),
  'male-te-mezin-e': require('../../assets/audio/house/male-te-mezin-e.mp3'),
  'mase': require('../../assets/audio/house/mase.mp3'),
  'nivin': require('../../assets/audio/house/nivin.mp3'),
  'ode': require('../../assets/audio/house/ode.mp3'),
  'odeya-runistine': require('../../assets/audio/house/odeya-runistine.mp3'),
  'odeya-xewe': require('../../assets/audio/house/odeya-xewe.mp3'),
  'odeya-xwendine': require('../../assets/audio/house/odeya-xwendine.mp3'),
  'pencere': require('../../assets/audio/house/pencere.mp3'),
  'qenepe': require('../../assets/audio/house/qenepe.mp3'),
  'sarinc': require('../../assets/audio/house/sarinc.mp3'),
  'televizyon': require('../../assets/audio/house/televizyon.mp3'),
  'tu-li-ku-dere-xwarine-cediki': require('../../assets/audio/house/tu-li-ku-dere-xwarine-cediki.mp3'),
  'tu-li-ku-dixewi-cook': require('../../assets/audio/house/tu-li-ku-dixewi-cook.mp3'),
  'tu-li-ku-dixewi-eat': require('../../assets/audio/house/tu-li-ku-dixewi-eat.mp3'),
  'tu-li-ku-dixewi-sleep': require('../../assets/audio/house/tu-li-ku-dixewi-sleep.mp3'),
  'tu-li-ku-radizi-sleep': require('../../assets/audio/house/tu-li-ku-radizi-sleep.mp3'),
};

export default function HousePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 21, // houseItems (12) + roomTypes (4) + houseQuestions (5)
    hasPractice: false, // No practice section
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 2.38, // 50% / 21 audios ≈ 2.38% per audio
    timeMultiplier: 10, // 50% / 5 minutes = 10% per minute
  };
  
  const [playedKeysSnapshot, setPlayedKeysSnapshot] = useState<string[]>(() => getLessonProgress(LESSON_ID).playedAudioKeys || []);

  const storedProgress = getLessonProgress(LESSON_ID);
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set((storedProgress.playedAudioKeys || []) as string[]));
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);

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
    console.log('🚀 House page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      timeSpent: progress.timeSpent,
    });
    
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

  const playAudio = async (audioKey: string, audioText: string, actualAudioFile?: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Extract actual audio file name from audioKey (remove prefix like "item-", "room-", etc.)
      let audioFileToLookup = actualAudioFile || audioKey;
      if (audioKey.includes('-')) {
        // Try to extract the actual filename by removing common prefixes
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'item' || parts[0] === 'room' || parts[0] === 'question')) {
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
      
      if (!uniqueAudiosPlayedRef.current.has(audioKey)) {
        uniqueAudiosPlayedRef.current.add(audioKey);
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
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate session time (time since restored start time)
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    
    // Audio progress: new unique audios played this session only
    const currentUniqueAudios = uniqueAudiosPlayedRef.current.size;
    const newUniqueAudios = currentUniqueAudios - previousUniqueAudiosCountRef.current;
    const newAudioProgress = Math.min(50, newUniqueAudios * 2.38);
    // Update previous count for next calculation
    previousUniqueAudiosCountRef.current = currentUniqueAudios;
    
    // Time progress: new session time only (max 50%, 5 minutes = 50%)
    const newTimeProgress = Math.min(50, sessionTimeMinutes * 10);
    
    // Get base progress from stored progress
    const baseProgress = currentProgress?.progress || 0;
    
    // For lessons without practice: audio + time can reach 100%
    // Ensure that when all audios are played, audio progress contributes its full weight
    let effectiveAudioCount = currentUniqueAudios;
    if (effectiveAudioCount >= 21 && 21 > 0) {
      effectiveAudioCount = 21; // Cap at total
      // Force full audio contribution when all are played
      const fullAudioProgress = 50;
      const calculatedProgress = Math.min(100, baseProgress + fullAudioProgress + newTimeProgress);
      return Math.max(baseProgress, calculatedProgress);
    }
    
    // Calculate new progress from session activity
    const calculatedProgress = Math.min(100, baseProgress + newAudioProgress + newTimeProgress);
    
    // Use Math.max to prevent progress from dropping due to new calculation method
    return Math.max(baseProgress, calculatedProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const safeTimeSpent = Math.min(1000, baseTimeSpent + sessionTimeMinutes);
    const progress = calculateProgress();
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS');
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  const totalExamples = houseItems.length + roomTypes.length + houseQuestions.length;
  const learnedCount = Math.min(totalExamples, uniqueAudiosPlayedRef.current.size);

  const progress = getLessonProgress(LESSON_ID);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Things Around the House</Text>
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
        {/* House Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏠</Text>
            <Text style={styles.sectionTitle}>House Items</Text>
          </View>
          <View style={styles.itemsGrid}>
            {houseItems.map((item, index) => {
              const audioKey = `item-${item.audioFile}`;
              return (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemTextContainer}>
                    <Text style={styles.itemKurdish}>{item.ku}</Text>
                    <Text style={styles.itemEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.itemBottomRow}>
                    <Text style={styles.itemIcon}>{item.icon}</Text>
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
                </View>
              );
            })}
          </View>
        </View>

        {/* Types of Rooms */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🛏️</Text>
            <Text style={styles.sectionTitle}>Types of Rooms</Text>
          </View>
          <View style={styles.roomsGrid}>
            {roomTypes.map((item, index) => {
              const audioKey = `room-${item.audioFile}`;
              const alreadyPlayed = playedKeysSnapshot.includes(audioKey);
              return (
                <View key={index} style={[styles.roomCard, alreadyPlayed && styles.playedCard]}>
                  <View style={styles.roomTextContainer}>
                    <Text style={styles.roomKurdish}>{item.ku}</Text>
                    <Text style={styles.roomEnglish}>{item.en}</Text>
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

        {/* House Questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❓</Text>
            <Text style={styles.sectionTitle}>Talking About Your House</Text>
          </View>
          <View style={styles.questionsList}>
            {houseQuestions.map((item, index) => {
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
  playedCard: { opacity: 0.65 },
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
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
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
  itemTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  itemKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  itemEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  itemIcon: {
    fontSize: 28,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roomCard: {
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
    minHeight: 120,
  },
  roomTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  roomKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  roomEnglish: {
    fontSize: 14,
    color: '#6b7280',
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
});

