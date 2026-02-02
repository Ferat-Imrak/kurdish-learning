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

const LESSON_ID = '13'; // Body Parts lesson ID

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

// Body parts data
const bodyParts = [
  { ku: "ser", en: "head", icon: "👤", audioFile: "ser" },
  { ku: "çav", en: "eye", icon: "👁️", audioFile: "cav" },
  { ku: "guh", en: "ear", icon: "👂", audioFile: "guh" },
  { ku: "poz", en: "nose", icon: "👃", audioFile: "poz" },
  { ku: "dev", en: "mouth", icon: "👄", audioFile: "dev" },
  { ku: "didan", en: "tooth", icon: "🦷", audioFile: "didan" },
  { ku: "ziman", en: "tongue", icon: "👅", audioFile: "ziman" },
  { ku: "stû", en: "neck", icon: "🔶", audioFile: "stu" },
  { ku: "mil", en: "shoulder", icon: "💪", audioFile: "mil" },
  { ku: "dest", en: "hand", icon: "✋", audioFile: "dest" },
  { ku: "tili", en: "finger", icon: "👆", audioFile: "tili" },
  { ku: "sîng", en: "chest", icon: "👤", audioFile: "sing" },
  { ku: "zik", en: "stomach", icon: "🫃", audioFile: "zik" },
  { ku: "pişt", en: "back", icon: "🔶", audioFile: "pist" },
  { ku: "ling", en: "leg", icon: "🦵", audioFile: "ling" },
  { ku: "pê", en: "foot", icon: "🦶", audioFile: "pe" },
  { ku: "pêçî", en: "ankle", icon: "🦴", audioFile: "peci" },
  { ku: "çok", en: "knee", icon: "🦴", audioFile: "cok" },
];

// Body actions data
const bodyActions = [
  { 
    ku: "bînî", 
    en: "see", 
    example: "Ez çavên te dibînim", 
    exampleEn: "I see your eyes", 
    icon: "👁️",
    audioFile: "ez-caven-te-dibinim"
  },
  { 
    ku: "bihîze", 
    en: "hear", 
    example: "Ez dengê te dibihîzim", 
    exampleEn: "I hear your voice", 
    icon: "👂",
    audioFile: "ez-denge-te-dibihizim"
  },
  { 
    ku: "bêje", 
    en: "speak", 
    example: "Tu bi devê xwe dibêjî", 
    exampleEn: "You speak with your mouth", 
    icon: "💬",
    audioFile: "tu-bi-deve-xwe-dibeji"
  },
  { 
    ku: "bixwe", 
    en: "eat", 
    example: "Ez bi devê xwe dixwim", 
    exampleEn: "I eat with my mouth", 
    icon: "🍽️",
    audioFile: "ez-bi-deve-xwe-dixwim"
  },
  { 
    ku: "bimeşe", 
    en: "walk", 
    example: "Ez bi lingên xwe dimeşim", 
    exampleEn: "I walk with my legs", 
    icon: "🚶",
    audioFile: "ez-bi-lingen-xwe-dimesim"
  },
  { 
    ku: "bigire", 
    en: "hold", 
    example: "Ez bi destên xwe digirim", 
    exampleEn: "I hold with my hands", 
    icon: "✋",
    audioFile: "ez-bi-desten-xwe-digirim"
  },
];

// Usage notes
const usageNotes = [
  { text: "çav", note: 'Can mean both "eye" and "eyes" (context determines)' },
  { text: "dest", note: 'Usually refers to "hand" but can mean "hands"' },
  { text: "ling", note: 'Can mean "leg" or "foot" depending on context' },
  { text: "pê", note: 'Specifically means "foot" (not leg)' },
  { text: "Body parts", note: 'Body parts are often used with possessive pronouns (destê min, çavên te)' },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'bese-lase-te-li-ku-diese': require('../../assets/audio/body/bese-lase-te-li-ku-diese.mp3'),
  'bi-deste-xwe-sere-xwe-bigire': require('../../assets/audio/body/bi-deste-xwe-sere-xwe-bigire.mp3'),
  'bi-lingen-xwe-rabe': require('../../assets/audio/body/bi-lingen-xwe-rabe.mp3'),
  'biru': require('../../assets/audio/body/biru.mp3'),
  'cav': require('../../assets/audio/body/cav.mp3'),
  'cave-cep': require('../../assets/audio/body/cave-cep.mp3'),
  'cave-rast': require('../../assets/audio/body/cave-rast.mp3'),
  'caven-xwe-bigire': require('../../assets/audio/body/caven-xwe-bigire.mp3'),
  'ci-pirsgirek-e': require('../../assets/audio/body/ci-pirsgirek-e.mp3'),
  'cok': require('../../assets/audio/body/cok.mp3'),
  'coka-min-diese': require('../../assets/audio/body/coka-min-diese.mp3'),
  'coka-xwe-cemke': require('../../assets/audio/body/coka-xwe-cemke.mp3'),
  'dest': require('../../assets/audio/body/dest.mp3'),
  'deste-cep': require('../../assets/audio/body/deste-cep.mp3'),
  'deste-min-diese': require('../../assets/audio/body/deste-min-diese.mp3'),
  'deste-rast': require('../../assets/audio/body/deste-rast.mp3'),
  'deste-xwe-bilind-bike': require('../../assets/audio/body/deste-xwe-bilind-bike.mp3'),
  'dev': require('../../assets/audio/body/dev.mp3'),
  'deve-xwe-bigire': require('../../assets/audio/body/deve-xwe-bigire.mp3'),
  'deve-xwe-veke': require('../../assets/audio/body/deve-xwe-veke.mp3'),
  'didan': require('../../assets/audio/body/didan.mp3'),
  'didana-min-diese': require('../../assets/audio/body/didana-min-diese.mp3'),
  'enisk': require('../../assets/audio/body/enisk.mp3'),
  'ez-bi-desten-xwe-digirim': require('../../assets/audio/body/ez-bi-desten-xwe-digirim.mp3'),
  'ez-bi-deve-xwe-dixwim': require('../../assets/audio/body/ez-bi-deve-xwe-dixwim.mp3'),
  'ez-bi-lingen-xwe-dimesim': require('../../assets/audio/body/ez-bi-lingen-xwe-dimesim.mp3'),
  'ez-caven-te-dibinim': require('../../assets/audio/body/ez-caven-te-dibinim.mp3'),
  'ez-denge-te-dibihizim': require('../../assets/audio/body/ez-denge-te-dibihizim.mp3'),
  'guh': require('../../assets/audio/body/guh.mp3'),
  'guhe-cep': require('../../assets/audio/body/guhe-cep.mp3'),
  'guhe-rast': require('../../assets/audio/body/guhe-rast.mp3'),
  'guhe-xwe-bigire': require('../../assets/audio/body/guhe-xwe-bigire.mp3'),
  'guhen-xwe-bigire': require('../../assets/audio/body/guhen-xwe-bigire.mp3'),
  'kijan-bese-lase': require('../../assets/audio/body/kijan-bese-lase.mp3'),
  'li-ku-diese': require('../../assets/audio/body/li-ku-diese.mp3'),
  'ling': require('../../assets/audio/body/ling.mp3'),
  'linge-cep': require('../../assets/audio/body/linge-cep.mp3'),
  'linge-rast': require('../../assets/audio/body/linge-rast.mp3'),
  'linge-xwe-direj-bike': require('../../assets/audio/body/linge-xwe-direj-bike.mp3'),
  'mijang': require('../../assets/audio/body/mijang.mp3'),
  'mil': require('../../assets/audio/body/mil.mp3'),
  'mile-xwe-bilind-bike': require('../../assets/audio/body/mile-xwe-bilind-bike.mp3'),
  'neynok': require('../../assets/audio/body/neynok.mp3'),
  'pe': require('../../assets/audio/body/pe.mp3'),
  'peci': require('../../assets/audio/body/peci.mp3'),
  'peya-min-diese': require('../../assets/audio/body/peya-min-diese.mp3'),
  'peya-xwe-bigire': require('../../assets/audio/body/peya-xwe-bigire.mp3'),
  'pist': require('../../assets/audio/body/pist.mp3'),
  'poz': require('../../assets/audio/body/poz.mp3'),
  'poze-xwe-bigire': require('../../assets/audio/body/poze-xwe-bigire.mp3'),
  'ser': require('../../assets/audio/body/ser.mp3'),
  'sere-min-diese': require('../../assets/audio/body/sere-min-diese.mp3'),
  'sere-xwe-hejine': require('../../assets/audio/body/sere-xwe-hejine.mp3'),
  'sere-xwe-livine': require('../../assets/audio/body/sere-xwe-livine.mp3'),
  'sing': require('../../assets/audio/body/sing.mp3'),
  'singa-xwe-bigire': require('../../assets/audio/body/singa-xwe-bigire.mp3'),
  'stu': require('../../assets/audio/body/stu.mp3'),
  'stuye-xwe-bigire': require('../../assets/audio/body/stuye-xwe-bigire.mp3'),
  'tili': require('../../assets/audio/body/tili.mp3'),
  'tiliyen-xwe-livine': require('../../assets/audio/body/tiliyen-xwe-livine.mp3'),
  'tu-bi-deve-xwe-dibeji': require('../../assets/audio/body/tu-bi-deve-xwe-dibeji.mp3'),
  'zendik': require('../../assets/audio/body/zendik.mp3'),
  'zik': require('../../assets/audio/body/zik.mp3'),
  'zika-min-diese': require('../../assets/audio/body/zika-min-diese.mp3'),
  'zika-xwe-bigire': require('../../assets/audio/body/zika-xwe-bigire.mp3'),
  'ziman': require('../../assets/audio/body/ziman.mp3'),
  'zimane-xwe-derxe': require('../../assets/audio/body/zimane-xwe-derxe.mp3')
};

export default function BodyPartsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  // Snapshot of played keys for dimming (updated when we play; restored from storage on mount)
  const [playedKeysSnapshot, setPlayedKeysSnapshot] = useState<string[]>(() => getLessonProgress(LESSON_ID).playedAudioKeys || []);

  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 24, // 18 body parts + 6 body actions
    hasPractice: false, // No practice section
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 2.08, // 50% / 24 audios ≈ 2.08% per audio
    timeMultiplier: 12.5, // 50% / 4 minutes = 12.5% per minute
  };
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID);
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set((storedProgress.playedAudioKeys || []) as string[]));
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);
  const previousUniqueAudiosCountRef = useRef<number>(0);

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
    console.log('🚀 Body-Parts page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      timeSpent: progress.timeSpent,
    });
    
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
    
    // Restore refs from stored progress (including persisted played audio keys)
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

      // Extract actual audio file name from audioKey (remove prefix like "body-", "action-", etc.)
      let audioFileToLookup = actualAudioFile || audioKey;
      if (audioKey.includes('-')) {
        // Try to extract the actual filename by removing common prefixes
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'body' || parts[0] === 'action')) {
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
      
      // Track unique audios played (only count new ones); persist keys for dimming and next session
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
    const totalAudios = progressConfig.totalAudios;
    const currentUniqueAudios = uniqueAudiosPlayedRef.current.size;
    // Progress = (played count / total) * 100 so count and % stay in sync with persisted keys
    return Math.min(100, Math.round((currentUniqueAudios / totalAudios) * 100));
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
    
    // Safeguard: ensure timeSpent is reasonable (max 1000 minutes = ~16 hours)
    const safeTimeSpent = Math.min(1000, totalTimeSpent);
    
    const progress = calculateProgress();
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS');
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  const totalExamples = bodyParts.length + bodyActions.length;
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
          <Text style={styles.headerTitle}>Body Parts</Text>
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
        {/* Body Parts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>👁️</Text>
            <Text style={styles.sectionTitle}>Body Parts</Text>
          </View>
          <View style={styles.bodyPartsGrid}>
            {bodyParts.map((part, index) => {
              const audioKey = `body-${part.audioFile}`;
              const alreadyPlayed = playedKeysSnapshot.includes(audioKey);
              return (
                <View key={index} style={[styles.bodyPartCard, alreadyPlayed && styles.playedCard]}>
                  <View style={styles.bodyPartTextContainer}>
                    <Text style={styles.bodyPartKurdish}>{part.ku}</Text>
                    <Text style={styles.bodyPartEnglish}>{part.en}</Text>
                  </View>
                  <View style={styles.bodyPartBottomRow}>
                    <Text style={styles.bodyPartIcon}>{part.icon}</Text>
                    <Pressable
                      onPress={() => playAudio(audioKey, part.ku, part.audioFile)}
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

        {/* Actions with Body Parts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🏃</Text>
            <Text style={styles.sectionTitle}>Actions with Body Parts</Text>
          </View>
          <View style={styles.actionsGrid}>
            {bodyActions.map((action, index) => {
              const audioKey = `action-${action.audioFile}`;
              const alreadyPlayed = playedKeysSnapshot.includes(audioKey);
              return (
                <View key={index} style={[styles.actionCard, alreadyPlayed && styles.playedCard]}>
                  <View style={styles.actionHeader}>
                    <Text style={styles.actionIcon}>{action.icon}</Text>
                    <View style={styles.actionTextContainer}>
                      <Text style={styles.actionKurdish}>{action.ku}</Text>
                      <Text style={styles.actionEnglish}>{action.en}</Text>
                    </View>
                  </View>
                  <View style={styles.actionExampleContainer}>
                    <Text style={styles.actionExampleKurdish}>{action.example}</Text>
                    <Text style={styles.actionExampleEnglish}>{action.exampleEn}</Text>
                  </View>
                  <View style={styles.actionBottomRow}>
                    <View style={styles.actionBottomSpacer} />
                    <Pressable
                      onPress={() => playAudio(audioKey, action.example, action.audioFile)}
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

        {/* Usage Notes */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Usage Notes</Text>
          </View>
          <View style={styles.usageNotesList}>
            {usageNotes.map((note, index) => (
              <View key={index} style={styles.usageNoteItem}>
                <Text style={styles.usageNoteText}>
                  <Text style={styles.usageNoteBold}>{note.text}</Text>
                  {' - '}
                  {note.note}
                </Text>
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
  bodyPartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bodyPartCard: {
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
  bodyPartTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  bodyPartKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  bodyPartEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  bodyPartBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bodyPartIcon: {
    fontSize: 28,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'space-between',
    minHeight: 180,
  },
  playedCard: {
    opacity: 0.65,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionKurdish: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  actionEnglish: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionExampleContainer: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flex: 1,
  },
  actionExampleKurdish: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionExampleEnglish: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionBottomSpacer: {
    flex: 1,
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  usageNotesList: {
    gap: 12,
  },
  usageNoteItem: {
    paddingVertical: 4,
  },
  usageNoteText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  usageNoteBold: {
    fontWeight: '700',
    color: '#111827',
  },
});

