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

const LESSON_ID = '5'; // Weather & Seasons lesson ID

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

// Seasons data
const seasons = [
  { ku: "bihar", en: "spring", icon: "🌸", audioFile: "bihar" },
  { ku: "havîn", en: "summer", icon: "☀️", audioFile: "havin" },
  { ku: "payiz", en: "fall", icon: "🍂", audioFile: "payiz" },
  { ku: "zivistan", en: "winter", icon: "❄️", audioFile: "zivistan" },
];

// Weather types data
const weatherTypes = [
  { ku: "hewa", en: "weather", icon: "🌤️", audioFile: "hewa" },
  { ku: "roj", en: "sun", icon: "☀️", audioFile: "roj" },
  { ku: "ewr", en: "cloud", icon: "☁️", audioFile: "ewr" },
  { ku: "baran", en: "rain", icon: "🌧️", audioFile: "baran" },
  { ku: "berf", en: "snow", icon: "❄️", audioFile: "berf" },
  { ku: "ba", en: "wind", icon: "💨", audioFile: "ba" },
  { ku: "germ", en: "hot", icon: "🔥", audioFile: "germ" },
  { ku: "sar", en: "cold", icon: "🧊", audioFile: "sar" },
  { ku: "pir germ", en: "very hot", icon: "🔥", audioFile: "pir-germ" },
  { ku: "pir sar", en: "very cold", icon: "🧊", audioFile: "pir-sar" },
  { ku: "germik", en: "warm", icon: "🌡️", audioFile: "germik" },
];

// Weather descriptions data
const weatherDescriptions = [
  { ku: "Hewa baş e", en: "The weather is good", icon: "🌤️", audioFile: "hewa-bas-e" },
  { ku: "Roj derketiye", en: "The sun is out", icon: "☀️", audioFile: "roj-derketiye" },
  { ku: "Baran dibare", en: "It's raining", icon: "🌧️", audioFile: "baran-dibare" },
  { ku: "Berf dibare", en: "It's snowing", icon: "❄️", audioFile: "berf-dibare" },
  { ku: "Hewa germ e", en: "The weather is hot", icon: "🔥", audioFile: "hewa-germ-e" },
  { ku: "Hewa sar e", en: "The weather is cold", icon: "🧊", audioFile: "hewa-sar-e" },
  { ku: "Ba heye", en: "There is wind", icon: "💨", audioFile: "ba-heye" },
  { ku: "Ewr hene", en: "There are clouds", icon: "☁️", audioFile: "ewr-hene" },
  { ku: "Hewa xweş e", en: "The weather is nice", icon: "🌤️", audioFile: "hewa-xwes-e" },
  { ku: "Hewa nebaş e", en: "The weather is bad", icon: "🌩️", audioFile: "hewa-nebas-e" },
  { ku: "Hewa sar û baranî ye", en: "The weather is cold and rainy", icon: "🌧️", audioFile: "hewa-sar-u-barani-ye" },
  { ku: "Hewa germ û rojîn e", en: "The weather is hot and sunny", icon: "☀️", audioFile: "hewa-germ-u-rojin-e" },
];

// Weather questions data
const weatherQuestions = [
  { ku: "Hewa çawa ye?", en: "How is the weather?", audioFile: "hewa-cawa-ye" },
  { ku: "Îro hewa çawa ye?", en: "How is the weather today?", audioFile: "iro-hewa-cawa-ye" },
  { ku: "Tu hewa çawa hez dikî?", en: "What kind of weather do you like?", audioFile: "tu-hewa-cawa-hez-diki" },
  { ku: "Baran dibare?", en: "Is it raining?", audioFile: "baran-dibare" },
  { ku: "Roj derketiye?", en: "Is the sun out?", audioFile: "roj-derketiye" },
  { ku: "Hewa germ e?", en: "Is it hot?", audioFile: "hewa-germ-e" },
  { ku: "Hewa sar e?", en: "Is it cold?", audioFile: "hewa-sar-e" },
  { ku: "Ba heye?", en: "Is there wind?", audioFile: "ba-heye" },
  { ku: "Berf dibare?", en: "Is it snowing?", audioFile: "berf-dibare" },
  { ku: "Tu çi demê hez dikî?", en: "What season do you like?", audioFile: "tu-ci-deme-hez-diki" },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'ba-heye': require('../../assets/audio/weather/ba-heye.mp3'),
  'ba': require('../../assets/audio/weather/ba.mp3'),
  'baran-dibare': require('../../assets/audio/weather/baran-dibare.mp3'),
  'baran': require('../../assets/audio/weather/baran.mp3'),
  'berf-dibare': require('../../assets/audio/weather/berf-dibare.mp3'),
  'berf': require('../../assets/audio/weather/berf.mp3'),
  'bihar': require('../../assets/audio/weather/bihar.mp3'),
  'ewr-hene': require('../../assets/audio/weather/ewr-hene.mp3'),
  'ewr': require('../../assets/audio/weather/ewr.mp3'),
  'germ': require('../../assets/audio/weather/germ.mp3'),
  'germik': require('../../assets/audio/weather/germik.mp3'),
  'havin': require('../../assets/audio/weather/havin.mp3'),
  'hewa-bas-e': require('../../assets/audio/weather/hewa-bas-e.mp3'),
  'hewa-cawa-ye': require('../../assets/audio/weather/hewa-cawa-ye.mp3'),
  'hewa-germ-e': require('../../assets/audio/weather/hewa-germ-e.mp3'),
  'hewa-germ-u-rojin-e': require('../../assets/audio/weather/hewa-germ-u-rojin-e.mp3'),
  'hewa-nebas-e': require('../../assets/audio/weather/hewa-nebas-e.mp3'),
  'hewa-sar-e': require('../../assets/audio/weather/hewa-sar-e.mp3'),
  'hewa-sar-u-barani-ye': require('../../assets/audio/weather/hewa-sar-u-barani-ye.mp3'),
  'hewa-xwes-e': require('../../assets/audio/weather/hewa-xwes-e.mp3'),
  'hewa': require('../../assets/audio/weather/hewa.mp3'),
  'iro-hewa-cawa-ye': require('../../assets/audio/weather/iro-hewa-cawa-ye.mp3'),
  'payiz': require('../../assets/audio/weather/payiz.mp3'),
  'pir-germ': require('../../assets/audio/weather/pir-germ.mp3'),
  'pir-sar': require('../../assets/audio/weather/pir-sar.mp3'),
  'roj-derketiye': require('../../assets/audio/weather/roj-derketiye.mp3'),
  'roj': require('../../assets/audio/weather/roj.mp3'),
  'sar': require('../../assets/audio/weather/sar.mp3'),
  'tu-ci-deme-hez-diki': require('../../assets/audio/weather/tu-ci-deme-hez-diki.mp3'),
  'tu-hewa-cawa-hez-diki': require('../../assets/audio/weather/tu-hewa-cawa-hez-diki.mp3'),
  'zivistan': require('../../assets/audio/weather/zivistan.mp3')
};

export default function WeatherPage() {
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

      // Extract actual audio file name from audioKey (remove prefix like "season-", "weather-", etc.)
      let audioFileToLookup = actualAudioFile || audioKey;
      if (audioKey.includes('-')) {
        // Try to extract the actual filename by removing common prefixes
        const parts = audioKey.split('-');
        if (parts.length > 1 && (parts[0] === 'season' || parts[0] === 'weather' || parts[0] === 'description' || parts[0] === 'question')) {
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
    // Audio clicks: max 100% (4 seasons + 11 weather types + 12 descriptions + 10 questions = 37, so ~1 click = 2.7%)
    const audioProgress = Math.min(100, audioPlaysRef.current * 2.7);
    // Time spent: max 0% (no time requirement for vocabulary lessons)
    return Math.min(100, audioProgress);
  };

  const handleAudioPlay = () => {
    const progress = calculateProgress();
    const currentProgress = getLessonProgress(LESSON_ID);
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    updateLessonProgress(LESSON_ID, progress, status);
  };

  // Calculate total examples count for Learn progress
  const totalExamples = seasons.length + weatherTypes.length + weatherDescriptions.length + weatherQuestions.length;
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
        <Text style={styles.headerTitle}>Weather & Seasons</Text>
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
        {/* Seasons */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>☀️</Text>
            <Text style={styles.sectionTitle}>Seasons</Text>
          </View>
          <View style={styles.seasonsGrid}>
            {seasons.map((season, index) => {
              const audioKey = `season-${season.audioFile}`;
              return (
                <View key={index} style={styles.seasonCard}>
                  <View style={styles.seasonTextContainer}>
                    <Text style={styles.seasonKurdish}>{season.ku}</Text>
                    <Text style={styles.seasonEnglish}>{season.en}</Text>
                  </View>
                  <View style={styles.seasonBottomRow}>
                    <Text style={styles.seasonIcon}>{season.icon}</Text>
                    <Pressable
                      onPress={() => playAudio(audioKey, season.ku, season.audioFile)}
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

        {/* Weather Types */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>☀️</Text>
            <Text style={styles.sectionTitle}>Weather Types</Text>
          </View>
          <View style={styles.weatherTypesGrid}>
            {weatherTypes.map((item, index) => {
              const audioKey = `weather-${item.audioFile}`;
              return (
                <View key={index} style={styles.weatherTypeCard}>
                  <View style={styles.weatherTypeTextContainer}>
                    <Text style={styles.weatherTypeKurdish}>{item.ku}</Text>
                    <Text style={styles.weatherTypeEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.weatherTypeBottomRow}>
                    <Text style={styles.weatherTypeIcon}>{item.icon}</Text>
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

        {/* Describing Weather */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>☁️</Text>
            <Text style={styles.sectionTitle}>Describing Weather</Text>
          </View>
          <View style={styles.descriptionsList}>
            {weatherDescriptions.map((item, index) => {
              const audioKey = `description-${item.audioFile}`;
              return (
                <View key={index} style={styles.descriptionCard}>
                  <View style={styles.descriptionContent}>
                    <Text style={styles.descriptionIcon}>{item.icon}</Text>
                    <View style={styles.descriptionTextContainer}>
                      <Text style={styles.descriptionKurdish}>{item.ku}</Text>
                      <Text style={styles.descriptionEnglish}>{item.en}</Text>
                    </View>
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

        {/* Weather Questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌡️</Text>
            <Text style={styles.sectionTitle}>Weather Questions</Text>
          </View>
          <View style={styles.questionsList}>
            {weatherQuestions.map((item, index) => {
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
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seasonCard: {
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
  seasonTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  seasonKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  seasonEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  seasonBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  seasonIcon: {
    fontSize: 28,
  },
  weatherTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherTypeCard: {
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
  weatherTypeTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  weatherTypeKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  weatherTypeEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  weatherTypeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  weatherTypeIcon: {
    fontSize: 28,
  },
  descriptionsList: {
    gap: 12,
  },
  descriptionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  descriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  descriptionIcon: {
    fontSize: 24,
    marginRight: 12,
    flexShrink: 0,
  },
  descriptionTextContainer: {
    flex: 1,
  },
  descriptionKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  descriptionEnglish: {
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

