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

const LESSON_ID = '12'; // Time & Daily Schedule lesson ID

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

// Helper function to convert number to Kurdish
function numberToKurdish(num: number): string {
  const ones: { [key: number]: string } = {
    0: "sifir", 1: "yek", 2: "du", 3: "sê", 4: "çar", 5: "pênc",
    6: "şeş", 7: "heft", 8: "heşt", 9: "neh"
  };
  
  if (num === 0) return "sifir";
  if (num < 10) return ones[num];
  if (num === 10) return "deh";
  if (num === 11) return "yanzdeh";
  if (num === 12) return "dazdeh";
  if (num === 13) return "sêzdeh";
  if (num === 14) return "çardeh";
  if (num === 15) return "pênzdeh";
  if (num === 16) return "şanzdeh";
  if (num === 17) return "hevdeh";
  if (num === 18) return "hejdeh";
  if (num === 19) return "nozdeh";
  if (num === 20) return "bîst";
  if (num === 30) return "sî";
  if (num === 40) return "çil";
  if (num === 50) return "pêncî";
  
  const tensDigit = Math.floor(num / 10);
  const onesDigit = num % 10;
  
  let tensName = "";
  if (tensDigit === 2) tensName = "bîst";
  else if (tensDigit === 3) tensName = "sî";
  else if (tensDigit === 4) tensName = "çil";
  else if (tensDigit === 5) tensName = "pêncî";
  
  if (onesDigit === 0) {
    return tensName;
  } else {
    return `${tensName} û ${ones[onesDigit]}`;
  }
}


// Basic Times
const basicTimes = [
  { ku: "sibê", en: "morning", icon: "🌅", audioFile: "sibe-morning" },
  { ku: "nîvro", en: "noon", icon: "☀️", audioFile: "nivro" },
  { ku: "êvar", en: "evening", icon: "🌆", audioFile: "evar" },
  { ku: "şev", en: "night", icon: "🌙", audioFile: "sev" },
  { ku: "îro", en: "today", icon: "📅", audioFile: "iro" },
  { ku: "duh", en: "yesterday", icon: "📅", audioFile: "duh" },
  { ku: "sibê", en: "tomorrow", icon: "📅", audioFile: "sibe-tomorrow" },
];

// More Time Expressions
const moreTimeExpressions = [
  { ku: "niha", en: "now", icon: "⏰", audioFile: "niha" },
  { ku: "paşê", en: "later", icon: "⏭️", audioFile: "pase" },
  { ku: "berê", en: "earlier", icon: "⏮️", audioFile: "bere" },
  { ku: "pênc deqe", en: "five minutes", icon: "⏱️", audioFile: "penc-deqe" },
  { ku: "nîv saet", en: "half hour", icon: "⏰", audioFile: "niv-saet" },
  { ku: "nêzîkê", en: "around", icon: "🕐", audioFile: "nezike" },
  { ku: "piştî", en: "after", icon: "➡️", audioFile: "pisti" },
  { ku: "berî", en: "before", icon: "⬅️", audioFile: "beri" },
];

// Telling Time
const clockTimes = [
  { time: "08:00", ku: "saet heştê sibê", en: "eight o'clock in the morning", audioFile: "saet-heste-sibe" },
  { time: "12:00", ku: "saet dazdeh", en: "twelve o'clock", audioFile: "saet-dazdeh" },
  { time: "15:30", ku: "sê û nîv", en: "three thirty", audioFile: "se-u-niv" },
  { time: "20:00", ku: "saet heştê şevê", en: "eight o'clock at night", audioFile: "saet-heste-seve" },
  { time: "09:15", ku: "neh û panzdeh", en: "nine fifteen", audioFile: "neh-u-panzdeh" },
  { time: "14:45", ku: "du û çil û pênc deqe", en: "two forty-five", audioFile: "du-u-cil-u-penc-deqe" },
  { time: "06:00", ku: "saet şeş", en: "six o'clock", audioFile: "saet-ses" },
  { time: "18:30", ku: "şeş û nîv", en: "six thirty", audioFile: "ses-u-niv" },
  { time: "22:00", ku: "saet deh", en: "ten o'clock", audioFile: "saet-deh" },
  { time: "11:05", ku: "yanzdeh û pênc deqe", en: "eleven five", audioFile: "yanzdeh-u-penc-deqe" },
];

// Time Questions
const timeQuestions = [
  { ku: "Saet çend e?", en: "What time is it?", audioFile: "saet-cend-e" },
  { ku: "Tu çi demê şiyar dibî?", en: "What time do you wake up?", audioFile: "tu-ci-deme-siyar-dibi-wakeup" },
  { ku: "Tu çi demê dixwî?", en: "What time do you eat?", audioFile: "tu-ci-deme-dixwi" },
  { ku: "Tu çi demê şiyar dibî?", en: "What time do you sleep?", audioFile: "tu-ci-deme-siyar-dibi-sleep" },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'bere': require('../../assets/audio/time/bere.mp3'),
  'beri': require('../../assets/audio/time/beri.mp3'),
  'cardeh-u-cil-u-penc-deqe': require('../../assets/audio/time/cardeh-u-cil-u-penc-deqe.mp3'),
  'du-u-cil-u-penc-deqe': require('../../assets/audio/time/du-u-cil-u-penc-deqe.mp3'),
  'duh': require('../../assets/audio/time/duh.mp3'),
  'evar': require('../../assets/audio/time/evar.mp3'),
  'ez-evare-xwarina-evare-dixwim': require('../../assets/audio/time/ez-evare-xwarina-evare-dixwim.mp3'),
  'ez-nivro-xwarina-nivro-dixwim': require('../../assets/audio/time/ez-nivro-xwarina-nivro-dixwim.mp3'),
  'ez-saet-bist-radizim': require('../../assets/audio/time/ez-saet-bist-radizim.mp3'),
  'ez-saet-hest-siyar-dibim': require('../../assets/audio/time/ez-saet-hest-siyar-dibim.mp3'),
  'ez-saet-hestan-siyar-dibim': require('../../assets/audio/time/ez-saet-hestan-siyar-dibim.mp3'),
  'ez-saet-navine-dixwim': require('../../assets/audio/time/ez-saet-navine-dixwim.mp3'),
  'ez-sibe-xwarina-taste-dixwim': require('../../assets/audio/time/ez-sibe-xwarina-taste-dixwim.mp3'),
  'hejdeh-u-niv': require('../../assets/audio/time/hejdeh-u-niv.mp3'),
  'iro': require('../../assets/audio/time/iro.mp3'),
  'neh-u-panzdeh': require('../../assets/audio/time/neh-u-panzdeh.mp3'),
  'neh-u-penc-deqe': require('../../assets/audio/time/neh-u-penc-deqe.mp3'),
  'neh-u-pencdeh': require('../../assets/audio/time/neh-u-pencdeh.mp3'),
  'neh-u-penzdeh': require('../../assets/audio/time/neh-u-penzdeh.mp3'),
  'nezike': require('../../assets/audio/time/nezike.mp3'),
  'niha': require('../../assets/audio/time/niha.mp3'),
  'niv-saet': require('../../assets/audio/time/niv-saet.mp3'),
  'nivro': require('../../assets/audio/time/nivro.mp3'),
  'pase': require('../../assets/audio/time/pase.mp3'),
  'penc-deqe': require('../../assets/audio/time/penc-deqe.mp3'),
  'pisti': require('../../assets/audio/time/pisti.mp3'),
  'saet-bist': require('../../assets/audio/time/saet-bist.mp3'),
  'saet-bist-u-du': require('../../assets/audio/time/saet-bist-u-du.mp3'),
  'saet-cend-e': require('../../assets/audio/time/saet-cend-e.mp3'),
  'saet-dazdeh': require('../../assets/audio/time/saet-dazdeh.mp3'),
  'saet-deh': require('../../assets/audio/time/saet-deh.mp3'),
  'saet-heste-seve': require('../../assets/audio/time/saet-heste-seve.mp3'),
  'saet-heste-sibe': require('../../assets/audio/time/saet-heste-sibe.mp3'),
  'saet-hest': require('../../assets/audio/time/saet-hest.mp3'),
  'saet-ses': require('../../assets/audio/time/saet-ses.mp3'),
  'se-u-niv': require('../../assets/audio/time/se-u-niv.mp3'),
  'ses-u-niv': require('../../assets/audio/time/ses-u-niv.mp3'),
  'sev': require('../../assets/audio/time/sev.mp3'),
  'sibe-morning': require('../../assets/audio/time/sibe-morning.mp3'),
  'sibe-tomorrow': require('../../assets/audio/time/sibe-tomorrow.mp3'),
  'tu-ci-deme-dixwi': require('../../assets/audio/time/tu-ci-deme-dixwi.mp3'),
  'tu-ci-deme-radizi-sleep': require('../../assets/audio/time/tu-ci-deme-radizi-sleep.mp3'),
  'tu-ci-deme-radizi-wakeup': require('../../assets/audio/time/tu-ci-deme-radizi-wakeup.mp3'),
  'tu-ci-deme-siyar-dibi-sleep': require('../../assets/audio/time/tu-ci-deme-siyar-dibi-sleep.mp3'),
  'tu-ci-deme-siyar-dibi-wakeup': require('../../assets/audio/time/tu-ci-deme-siyar-dibi-wakeup.mp3'),
  'yanzdeh-u-penc-deqe': require('../../assets/audio/time/yanzdeh-u-penc-deqe.mp3'),
};

export default function TimePage() {
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

  const playAudio = async (audioKey: string, audioText: string, actualAudioFile?: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Extract actual audio file name from audioKey (remove prefix like "basic-", "expression-", etc.)
      let audioFileToLookup = actualAudioFile || audioKey;
      if (audioKey.includes('-')) {
        // Try to extract the actual filename by removing common prefixes
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'basic' || parts[0] === 'expression' || parts[0] === 'clock' || parts[0] === 'question')) {
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

  const calculateProgress = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // minutes
    // Audio clicks: max 50% (many items, so ~1 click = 0.5%)
    const audioProgress = Math.min(50, audioPlaysRef.current * 0.5);
    // Time spent: max 50% (5 minutes = 50%)
    const timeProgress = Math.min(50, timeSpent * 10);
    return Math.min(100, audioProgress + timeProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const progress = calculateProgress();
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    updateLessonProgress(LESSON_ID, progress, status);
  };

  // Calculate total examples count for Learn progress
  const totalExamples = basicTimes.length + moreTimeExpressions.length + clockTimes.length + timeQuestions.length;
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
        <Text style={styles.headerTitle}>Time & Daily Schedule</Text>
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
        {/* Basic Times */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌅</Text>
            <Text style={styles.sectionTitle}>Basic Times</Text>
          </View>
          <View style={styles.timesGrid}>
            {basicTimes.map((item, index) => {
              const audioKey = `basic-${item.audioFile}`;
              return (
                <View key={index} style={styles.timeCard}>
                  <View style={styles.timeTextContainer}>
                    <Text style={styles.timeKurdish}>{item.ku}</Text>
                    <Text style={styles.timeEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.timeBottomRow}>
                    <Text style={styles.timeIcon}>{item.icon}</Text>
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

        {/* More Time Expressions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⏰</Text>
            <Text style={styles.sectionTitle}>More Time Expressions</Text>
          </View>
          <View style={styles.timesGrid}>
            {moreTimeExpressions.map((item, index) => {
              const audioKey = `expression-${item.audioFile}`;
              return (
                <View key={index} style={styles.timeCard}>
                  <View style={styles.timeTextContainer}>
                    <Text style={styles.timeKurdish}>{item.ku}</Text>
                    <Text style={styles.timeEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.timeBottomRow}>
                    <Text style={styles.timeIcon}>{item.icon}</Text>
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

        {/* Telling Time */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🕐</Text>
            <Text style={styles.sectionTitle}>Telling Time</Text>
          </View>
          <View style={styles.clockTimesList}>
            {clockTimes.map((item, index) => {
              const audioKey = `clock-${item.audioFile}`;
              return (
                <View key={index} style={styles.clockTimeCard}>
                  <View style={styles.clockTimeTextContainer}>
                    <Text style={styles.clockTime}>{item.time}</Text>
                    <Text style={styles.clockTimeKurdish}>{item.ku}</Text>
                    <Text style={styles.clockTimeEnglish}>{item.en}</Text>
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

        {/* Time Questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❓</Text>
            <Text style={styles.sectionTitle}>Common Time Questions</Text>
          </View>
          <View style={styles.questionsList}>
            {timeQuestions.map((item, index) => {
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
  timeTextContainer: {
    marginBottom: 8,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeCard: {
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
  timeKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  timeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeIcon: {
    fontSize: 28,
  },
  clockTimesList: {
    gap: 12,
  },
  clockTimeCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clockTimeTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  clockTime: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 4,
  },
  clockTimeKurdish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  clockTimeEnglish: {
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

