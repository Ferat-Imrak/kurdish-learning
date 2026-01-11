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

const LESSON_ID = '23'; // Colors lesson ID

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

interface ColorExample {
  ku: string;
  en: string;
  icon: string;
}

interface ColorData {
  en: string;
  ku: string;
  hex: string;
  examples: ColorExample[];
}

const colors: ColorData[] = [
  { 
    en: "Red", 
    ku: "sor", 
    hex: "#E31E24",
    examples: [
      { ku: "pirtûkê sor", en: "red book", icon: "📕" },
      { ku: "gulê sor", en: "red flower", icon: "🌹" },
      { ku: "sêvê sor", en: "red apple", icon: "🍎" },
      { ku: "îsotê sor", en: "red pepper", icon: "🌶️" }
    ]
  },
  { 
    en: "Green", 
    ku: "kesk", 
    hex: "#00A651",
    examples: [
      { ku: "pelê kesk", en: "green leaf", icon: "🍃" },
      { ku: "giyayê kesk", en: "green grass", icon: "🌿" },
      { ku: "sêvê kesk", en: "green apple", icon: "🍏" },
      { ku: "pirtûkê kesk", en: "green book", icon: "📗" }
    ]
  },
  { 
    en: "Blue", 
    ku: "şîn", 
    hex: "#1E90FF",
    examples: [
      { ku: "avê şîn", en: "blue water", icon: "🌊" },
      { ku: "esmanê şîn", en: "blue sky", icon: "☁️" },
      { ku: "pirtûkê şîn", en: "blue book", icon: "📘" },
      { ku: "çavên şîn", en: "blue eyes", icon: "👀" }
    ]
  },
  { 
    en: "Yellow", 
    ku: "zer", 
    hex: "#FFD700",
    examples: [
      { ku: "tava zer", en: "yellow sun", icon: "☀️" },
      { ku: "gulê zer", en: "yellow flower", icon: "🌼" },
      { ku: "pirtûkê zer", en: "yellow book", icon: "📒" },
      { ku: "mûzê zer", en: "yellow banana", icon: "🍌" }
    ]
  },
  { 
    en: "Orange", 
    ku: "porteqalî", 
    hex: "#FF8C00",
    examples: [
      { ku: "gizêrê porteqalî", en: "orange carrot", icon: "🥕" },
      { ku: "kûndirê porteqalî", en: "orange pumpkin", icon: "🎃" },
      { ku: "şêrê porteqalî", en: "orange lion", icon: "🦁" },
      { ku: "pirtûkê porteqalî", en: "orange book", icon: "📙" }
    ]
  },
  { 
    en: "Purple", 
    ku: "mor", 
    hex: "#8A2BE2",
    examples: [
      { ku: "dilê mor", en: "purple heart", icon: "💜" },
      { ku: "çemberê mor", en: "purple circle", icon: "🟣" },
      { ku: "kirasê mor", en: "purple dress", icon: "👗" },
      { ku: "tirîyê mor", en: "purple grape", icon: "🍇" }
    ]
  },
  { 
    en: "Silver", 
    ku: "zîv", 
    hex: "#C0C0C0",
    examples: [
      { ku: "kevçiyê zîv", en: "silver spoon", icon: "🥄" },
      { ku: "çetelê zîv", en: "silver fork", icon: "🍴" },
      { ku: "guharê zîv", en: "silver earrings", icon: "💠" },
      { ku: "saetê zîv", en: "silver watch", icon: "⌚" }
    ]
  },
  { 
    en: "Orange-Red", 
    ku: "gevez", 
    hex: "#FF4500",
    examples: [
      { ku: "gulê gevez", en: "orange-red flower", icon: "🌺" },
      { ku: "rojê gevez", en: "orange-red sun", icon: "🌅" },
      { ku: "agirê gevez", en: "orange-red fire", icon: "🔥" },
      { ku: "gulê gevez", en: "orange-red rose", icon: "🌹" }
    ]
  },
  { 
    en: "Black", 
    ku: "reş", 
    hex: "#000000",
    examples: [
      { ku: "pisîkê reş", en: "black cat", icon: "🐈‍⬛" },
      { ku: "pirtûkê reş", en: "black book", icon: "📓" },
      { ku: "şevê reş", en: "black night", icon: "🌑" },
      { ku: "dilê reş", en: "black heart", icon: "🖤" }
    ]
  },
  { 
    en: "White", 
    ku: "spî", 
    hex: "#FFFFFF",
    examples: [
      { ku: "hêkê spî", en: "white egg", icon: "🥚" },
      { ku: "şîrê spî", en: "white milk", icon: "🥛" },
      { ku: "berfê spî", en: "white snow", icon: "❄️" },
      { ku: "birincê spî", en: "white rice", icon: "🍚" }
    ]
  },
  { 
    en: "Gray", 
    ku: "xwelî", 
    hex: "#808080",
    examples: [
      { ku: "ewrê xwelî", en: "gray cloud", icon: "☁️" },
      { ku: "kevirê xwelî", en: "gray stone", icon: "🪨" },
      { ku: "çiyayê xwelî", en: "gray mountain", icon: "🏔️" },
      { ku: "fîlê xwelî", en: "gray elephant", icon: "🐘" }
    ]
  },
  { 
    en: "Gold", 
    ku: "zêr", 
    hex: "#FFD700",
    examples: [
      { ku: "zêrê zêr", en: "gold metal", icon: "🥇" },
      { ku: "stêrkê zêr", en: "gold star", icon: "⭐" },
      { ku: "saetê zêr", en: "gold watch", icon: "⌚" }
    ]
  },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  // Color names
  'sor': require('../../assets/audio/colors/sor.mp3'),
  'kesk': require('../../assets/audio/colors/kesk.mp3'),
  'sin': require('../../assets/audio/colors/sin.mp3'),
  'zer': require('../../assets/audio/colors/zer.mp3'),
  'porteqali': require('../../assets/audio/colors/porteqali.mp3'),
  'mor': require('../../assets/audio/colors/mor.mp3'),
  'ziv': require('../../assets/audio/colors/ziv.mp3'),
  'gevez': require('../../assets/audio/colors/gevez.mp3'),
  'res': require('../../assets/audio/colors/res.mp3'),
  'spi': require('../../assets/audio/colors/spi.mp3'),
  'xweli': require('../../assets/audio/colors/xweli.mp3'),
  'zer-gold': require('../../assets/audio/colors/zer-gold.mp3'),
  // Example phrases - key examples
  'pirtuke-sor': require('../../assets/audio/colors/pirtuke-sor.mp3'),
  'gule-sor': require('../../assets/audio/colors/gule-sor.mp3'),
  'seve-sor': require('../../assets/audio/colors/seve-sor.mp3'),
  'isote-sor': require('../../assets/audio/colors/isote-sor.mp3'),
  'pele-kesk': require('../../assets/audio/colors/pele-kesk.mp3'),
  'giyaye-kesk': require('../../assets/audio/colors/giyaye-kesk.mp3'),
  'seve-kesk': require('../../assets/audio/colors/seve-kesk.mp3'),
  'pirtuke-kesk': require('../../assets/audio/colors/pirtuke-kesk.mp3'),
  'ave-sin': require('../../assets/audio/colors/ave-sin.mp3'),
  'esmane-sin': require('../../assets/audio/colors/esmane-sin.mp3'),
  'pirtuke-sin': require('../../assets/audio/colors/pirtuke-sin.mp3'),
  'caven-sin': require('../../assets/audio/colors/caven-sin.mp3'),
  'tava-zer': require('../../assets/audio/colors/tava-zer.mp3'),
  'gule-zer': require('../../assets/audio/colors/gule-zer.mp3'),
  'pirtuke-zer': require('../../assets/audio/colors/pirtuke-zer.mp3'),
  'muze-zer': require('../../assets/audio/colors/muze-zer.mp3'),
  'gizere-porteqali': require('../../assets/audio/colors/gizere-porteqali.mp3'),
  'kundire-porteqali': require('../../assets/audio/colors/kundire-porteqali.mp3'),
  'sere-porteqali': require('../../assets/audio/colors/sere-porteqali.mp3'),
  'pirtuke-porteqali': require('../../assets/audio/colors/pirtuke-porteqali.mp3'),
  'dile-mor': require('../../assets/audio/colors/dile-mor.mp3'),
  'cembere-mor': require('../../assets/audio/colors/cembere-mor.mp3'),
  'kirase-mor': require('../../assets/audio/colors/kirase-mor.mp3'),
  'tiriye-mor': require('../../assets/audio/colors/tiriye-mor.mp3'),
  'kevciye-ziv': require('../../assets/audio/colors/kevciye-ziv.mp3'),
  'cetele-ziv': require('../../assets/audio/colors/cetele-ziv.mp3'),
  'guhare-ziv': require('../../assets/audio/colors/guhare-ziv.mp3'),
  'saete-ziv': require('../../assets/audio/colors/saete-ziv.mp3'),
  'gule-gevez': require('../../assets/audio/colors/gule-gevez.mp3'),
  'roje-gevez': require('../../assets/audio/colors/roje-gevez.mp3'),
  'agire-gevez': require('../../assets/audio/colors/agire-gevez.mp3'),
  'pisike-res': require('../../assets/audio/colors/pisike-res.mp3'),
  'pirtuke-res': require('../../assets/audio/colors/pirtuke-res.mp3'),
  'seve-res': require('../../assets/audio/colors/seve-res.mp3'),
  'dile-res': require('../../assets/audio/colors/dile-res.mp3'),
  'heke-spi': require('../../assets/audio/colors/heke-spi.mp3'),
  'sire-spi': require('../../assets/audio/colors/sire-spi.mp3'),
  'berfe-spi': require('../../assets/audio/colors/berfe-spi.mp3'),
  'birince-spi': require('../../assets/audio/colors/birince-spi.mp3'),
  'ewre-xweli': require('../../assets/audio/colors/ewre-xweli.mp3'),
  'kevire-xweli': require('../../assets/audio/colors/kevire-xweli.mp3'),
  'ciyaye-xweli': require('../../assets/audio/colors/ciyaye-xweli.mp3'),
  'file-xweli': require('../../assets/audio/colors/file-xweli.mp3'),
  'zere-zer': require('../../assets/audio/colors/zere-zer.mp3'),
  'sterke-zer': require('../../assets/audio/colors/sterke-zer.mp3'),
  'saete-zer': require('../../assets/audio/colors/saete-zer.mp3'),
};

export default function ColorsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [expandedColor, setExpandedColor] = useState<string | null>(null);
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

  const calculateProgress = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // minutes
    // Audio clicks: max 30% (12 colors + ~45 examples = 57 total, so ~1 click = 0.53%)
    const audioProgress = Math.min(30, audioPlaysRef.current * 0.53);
    // Time spent: max 20% (4 minutes = 20%)
    const timeProgress = Math.min(20, timeSpent * 5);
    // No practice section, so 0%
    const practiceProgress = 0;
    return Math.min(100, audioProgress + timeProgress + practiceProgress);
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const progress = calculateProgress();
    updateLessonProgress(LESSON_ID, progress, 'IN_PROGRESS');
  };

  // Process colors to add audioFile paths
  const colorsWithAudio = colors.map(color => {
    // Handle filename collision for "zêr" (gold) vs "zer" (yellow)
    let filename;
    if (color.ku === "zêr") {
      filename = "zer-gold";
    } else {
      filename = getAudioFilename(color.ku);
    }
    
    return {
      ...color,
      audioFile: filename,
      examplesWithAudio: color.examples.map(example => ({
        ...example,
        audioFile: getAudioFilename(example.ku)
      }))
    };
  });

  const progress = getLessonProgress(LESSON_ID);
  // Calculate total examples count for Learn progress (12 colors + ~45 examples = 57)
  const totalExamples = colors.length + colors.reduce((sum, color) => sum + color.examples.length, 0);
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
        <Text style={styles.headerTitle}>Colors</Text>
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
        {colorsWithAudio.map((color) => {
          const isExpanded = expandedColor === color.ku;
          
          return (
            <View key={color.ku} style={styles.colorCard}>
              {/* Color header */}
              <View style={styles.colorHeader}>
                <View 
                  style={[styles.colorSwatch, { backgroundColor: color.hex }]}
                />
                <View style={styles.colorInfo}>
                  <Text style={styles.colorName}>
                    {color.ku.charAt(0).toUpperCase() + color.ku.slice(1)} • {color.en}
                  </Text>
                  <Pressable
                    onPress={() => playAudio(color.audioFile)}
                    style={styles.audioButtonContainer}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={playingAudio === color.audioFile ? 'volume-high' : 'volume-low-outline'}
                      size={22}
                      color="#4b5563"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Examples preview and expand button */}
              <Pressable
                onPress={() => setExpandedColor(isExpanded ? null : color.ku)}
                style={styles.expandButton}
              >
                <View style={styles.expandButtonContent}>
                  <View style={styles.examplesPreview}>
                    {color.examples.slice(0, 4).map((example, idx) => (
                      <Text key={idx} style={styles.previewIcon}>
                        {example.icon}
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Hide' : 'View'} {color.examples.length} examples
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#6b7280"
                  />
                </View>
              </Pressable>

              {/* Expanded examples */}
              {isExpanded && (
                <View style={styles.examplesContainer}>
                  <Text style={styles.examplesTitle}>Common Phrases</Text>
                  <View style={styles.examplesGrid}>
                    {color.examplesWithAudio.map((example, idx) => (
                      <View key={idx} style={styles.exampleCard}>
                        <View style={styles.exampleContent}>
                          <Text style={styles.exampleIcon}>{example.icon}</Text>
                          <View style={styles.exampleText}>
                            <Text style={styles.exampleKurdish}>{example.ku}</Text>
                            <Text style={styles.exampleEnglish}>{example.en}</Text>
                          </View>
                        </View>
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
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
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
  colorCard: {
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
  colorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  expandButton: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  expandButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examplesPreview: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 8,
  },
  previewIcon: {
    fontSize: 20,
  },
  expandButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  examplesContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    marginTop: 12,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  examplesTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  examplesGrid: {
    gap: 12,
  },
  exampleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  exampleIcon: {
    fontSize: 28,
    flexShrink: 0,
  },
  exampleText: {
    flex: 1,
    minWidth: 0,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
  },
});

