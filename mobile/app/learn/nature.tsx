import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
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
import { useLessonProgressTimer } from '../../lib/utils/useLessonProgressTimer';

const { width } = Dimensions.get('window');

const LESSON_ID = '11'; // Nature lesson ID

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

interface NatureItem {
  id: string;
  english: string;
  kurdish: string;
  category: string;
  icon: string;
}

const natureItems: NatureItem[] = [
  // Trees
  { id: 'tree1', kurdish: 'Dar', english: 'Tree', icon: '🌳', category: 'trees' },
  { id: 'tree2', kurdish: 'Berû', english: 'Oak', icon: '🌲', category: 'trees' },
  { id: 'tree3', kurdish: 'Sûs', english: 'Pine', icon: '🌲', category: 'trees' },
  { id: 'tree4', kurdish: 'Darê bejî', english: 'Palm', icon: '🌴', category: 'trees' },
  { id: 'tree5', kurdish: 'Darê çinar', english: 'Sycamore', icon: '🌳', category: 'trees' },
  
  // Flowers
  { id: 'flower1', kurdish: 'Gul', english: 'Flower', icon: '🌸', category: 'flowers' },
  { id: 'flower2', kurdish: 'Gulên sor', english: 'Rose', icon: '🌹', category: 'flowers' },
  { id: 'flower3', kurdish: 'Gulên rojê', english: 'Sunflower', icon: '🌻', category: 'flowers' },
  { id: 'flower4', kurdish: 'Gulên sîrî', english: 'Lily', icon: '🌺', category: 'flowers' },
  { id: 'flower5', kurdish: 'Gulên çîçek', english: 'Blossom', icon: '🌼', category: 'flowers' },
  
  // Landscapes
  { id: 'mountain1', kurdish: 'Çiya', english: 'Mountain', icon: '🏔️', category: 'landscapes' },
  { id: 'mountain2', kurdish: 'Newal', english: 'Valley', icon: '🏞️', category: 'landscapes' },
  { id: 'mountain3', kurdish: 'Daristan', english: 'Forest', icon: '🌲', category: 'landscapes' },
  { id: 'mountain4', kurdish: 'Çavkanî', english: 'Spring', icon: '💧', category: 'landscapes' },
  { id: 'mountain5', kurdish: 'Çol', english: 'Desert', icon: '🏜️', category: 'landscapes' },
  { id: 'mountain6', kurdish: 'Deşt', english: 'Plain', icon: '🌾', category: 'landscapes' },
  { id: 'mountain7', kurdish: 'Çem', english: 'River', icon: '🏞️', category: 'landscapes' },
  { id: 'mountain8', kurdish: 'Gol', english: 'Lake', icon: '🏞️', category: 'landscapes' },
  { id: 'mountain9', kurdish: 'Behr', english: 'Sea', icon: '🌊', category: 'landscapes' },
  
  // Weather
  { id: 'weather1', kurdish: 'Barîn', english: 'Rain', icon: '🌧️', category: 'weather' },
  { id: 'weather2', kurdish: 'Roj', english: 'Sun', icon: '☀️', category: 'weather' },
  { id: 'weather3', kurdish: 'Berf', english: 'Snow', icon: '❄️', category: 'weather' },
  { id: 'weather4', kurdish: 'Ba', english: 'Wind', icon: '💨', category: 'weather' },
  { id: 'weather5', kurdish: 'Ewr', english: 'Cloud', icon: '☁️', category: 'weather' },
  { id: 'weather6', kurdish: 'Bahoz', english: 'Storm', icon: '⛈️', category: 'weather' },
  { id: 'weather7', kurdish: 'Zîpik', english: 'Hail', icon: '🧊', category: 'weather' },
  
  // Plants
  { id: 'plant1', kurdish: 'Pel', english: 'Leaf', icon: '🍃', category: 'plants' },
  { id: 'plant2', kurdish: 'Kok', english: 'Root', icon: '🌱', category: 'plants' },
  { id: 'plant4', kurdish: 'Gîha', english: 'Grass', icon: '🌱', category: 'plants' },
  { id: 'plant5', kurdish: 'Tohum', english: 'Seed', icon: '🌰', category: 'plants' },
  { id: 'plant6', kurdish: 'Giyayê çavkanî', english: 'Moss', icon: '🌿', category: 'plants' },
  { id: 'plant7', kurdish: 'Herrî', english: 'Mud', icon: '🟤', category: 'plants' },
  { id: 'plant8', kurdish: 'Zevî', english: 'Land/Soil', icon: '🌾', category: 'plants' },
];

interface NaturePhrase {
  id: string;
  kurdish: string;
  english: string;
}

const naturePhrases: NaturePhrase[] = [
  { id: 'phrase1', kurdish: 'Dar bilind e', english: 'The tree is tall' },
  { id: 'phrase2', kurdish: 'Ez gulek dibînim', english: 'I see a flower' },
  { id: 'phrase3', kurdish: 'Çiya mezin e', english: 'The mountain is big' },
  { id: 'phrase4', kurdish: 'Baran dibare', english: 'It is raining' },
  { id: 'phrase5', kurdish: 'Roj tê derketin', english: 'The sun is rising' },
  { id: 'phrase6', kurdish: 'Daristan xweş e', english: 'The forest is beautiful' },
  { id: 'phrase7', kurdish: 'Çem mezin e', english: 'The river is big' },
  { id: 'phrase8', kurdish: 'Berf dibare', english: 'It is snowing' },
  { id: 'phrase9', kurdish: 'Gulên sor xweşik in', english: 'Red flowers are beautiful' },
  { id: 'phrase10', kurdish: 'Behr hêdî ye', english: 'The sea is calm' },
];

const categories = {
  trees: { label: 'Trees', color: '#10b981', icon: '🌳' },
  flowers: { label: 'Flowers', color: '#ec4899', icon: '🌸' },
  landscapes: { label: 'Landscapes', color: '#3b82f6', icon: '🏔️' },
  weather: { label: 'Weather', color: '#f59e0b', icon: '☀️' },
  plants: { label: 'Plants', color: '#14b8a6', icon: '🌿' },
};

// Audio assets mapping
const audioAssets: Record<string, any> = {
  // Nature items
  'dar': require('../../assets/audio/nature/dar.mp3'),
  'beru': require('../../assets/audio/nature/beru.mp3'),
  'sus': require('../../assets/audio/nature/sus.mp3'),
  'dare-beji': require('../../assets/audio/nature/dare-beji.mp3'),
  'dare-cinar': require('../../assets/audio/nature/dare-cinar.mp3'),
  'gul': require('../../assets/audio/nature/gul.mp3'),
  'gulen-sor': require('../../assets/audio/nature/gulen-sor.mp3'),
  'gulen-roje': require('../../assets/audio/nature/gulen-roje.mp3'),
  'gulen-siri': require('../../assets/audio/nature/gulen-siri.mp3'),
  'gulen-cicek': require('../../assets/audio/nature/gulen-cicek.mp3'),
  'ciya': require('../../assets/audio/nature/ciya.mp3'),
  'newal': require('../../assets/audio/nature/newal.mp3'),
  'daristan': require('../../assets/audio/nature/daristan.mp3'),
  'cavkani': require('../../assets/audio/nature/cavkani.mp3'),
  'col': require('../../assets/audio/nature/col.mp3'),
  'dest': require('../../assets/audio/nature/dest.mp3'), // Deşt (Plain)
  'cem': require('../../assets/audio/nature/cem.mp3'),
  'gol': require('../../assets/audio/nature/gol.mp3'),
  'behr': require('../../assets/audio/nature/behr.mp3'),
  'barin': require('../../assets/audio/nature/barin.mp3'),
  'roj': require('../../assets/audio/nature/roj.mp3'),
  'berf': require('../../assets/audio/nature/berf.mp3'),
  'ba': require('../../assets/audio/nature/ba.mp3'),
  'ewr': require('../../assets/audio/nature/ewr.mp3'),
  'bahoz': require('../../assets/audio/nature/bahoz.mp3'),
  'zipik': require('../../assets/audio/nature/zipik.mp3'),
  'pel': require('../../assets/audio/nature/pel.mp3'),
  'kok': require('../../assets/audio/nature/kok.mp3'),
  'giha': require('../../assets/audio/nature/giha.mp3'),
  'tohum': require('../../assets/audio/nature/tohum.mp3'),
  'giyaye-cavkani': require('../../assets/audio/nature/giyaye-cavkani.mp3'),
  'herri': require('../../assets/audio/nature/herri.mp3'),
  'zevi': require('../../assets/audio/nature/zevi.mp3'),
  // Nature phrases
  'dar-bilind-e': require('../../assets/audio/nature/dar-bilind-e.mp3'),
  'ez-gulek-dibinim': require('../../assets/audio/nature/ez-gulek-dibinim.mp3'),
  'ciya-mezin-e': require('../../assets/audio/nature/ciya-mezin-e.mp3'),
  'baran-dibare': require('../../assets/audio/nature/baran-dibare.mp3'),
  'roj-te-derketin': require('../../assets/audio/nature/roj-te-derketin.mp3'),
  'daristan-xwes-e': require('../../assets/audio/nature/daristan-xwes-e.mp3'),
  'cem-mezin-e': require('../../assets/audio/nature/cem-mezin-e.mp3'),
  'berf-dibare': require('../../assets/audio/nature/berf-dibare.mp3'),
  'gulen-sor-xwesik-in': require('../../assets/audio/nature/gulen-sor-xwesik-in.mp3'),
  'behr-hedi-ye': require('../../assets/audio/nature/behr-hedi-ye.mp3'),
};

export default function NaturePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAllItems, setShowAllItems] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Progress configuration (no practice section, 50% audio + 50% time)
  const progressConfig = {
    totalAudios: natureItems.length + naturePhrases.length, // 34 + 10 = 44
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 2.5, // 50% / 20 audios ≈ 2.5% per audio (capped at 50%)
    timeMultiplier: 10, // 50% / 5 minutes = 10% per minute
  };
  
  // Snapshot of played keys for dimming (restored from storage on mount)
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
    
    // Restore refs from stored progress (in case progress was updated after component mount)
    const currentProgress = getLessonProgress(LESSON_ID);
    const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig);
    startTimeRef.current = estimatedStartTime;
    baseAudioPlaysRef.current = estimatedAudioPlays;
    
    // Note: uniqueAudiosPlayedRef starts fresh each session, but we account for base progress
  }, [isAuthenticated]);

  const playAudio = async (audioKey: string, kurdishText: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const audioFilename = getAudioFilename(kurdishText);
      const audioAsset = audioAssets[audioFilename];

      if (!audioAsset) {
        console.warn(`Audio file not found: ${audioFilename}. Audio files will be generated/copied later.`);
        return;
      }

      await Asset.loadAsync(audioAsset);
      const asset = Asset.fromModule(audioAsset);

      setPlayingAudio(audioKey);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: asset.localUri || asset.uri },
        { shouldPlay: true }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudio(null);
          newSound.unloadAsync();
        }
      });

      if (!uniqueAudiosPlayedRef.current.has(audioKey)) {
        uniqueAudiosPlayedRef.current.add(audioKey);
        setPlayedKeysSnapshot(Array.from(uniqueAudiosPlayedRef.current));
        handleAudioPlay();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const { progress, timeSpent } = calculateProgress();
    const status = progress >= 100 ? 'COMPLETED' : (currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS');
    updateLessonProgress(LESSON_ID, progress, status, undefined, timeSpent, Array.from(uniqueAudiosPlayedRef.current));
  };

  const calculateProgress = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const safeBaseTimeSpent = baseTimeSpent > 10000 ? 0 : baseTimeSpent;
    const safeTotalTimeSpent = safeBaseTimeSpent + sessionTimeMinutes;

    const totalAudios = progressConfig.totalAudios;
    const currentUniqueAudiosCount = uniqueAudiosPlayedRef.current.size;
    const audioProgress = Math.min(50, (currentUniqueAudiosCount / totalAudios) * 50);
    const timeProgress = Math.min(50, safeTotalTimeSpent * progressConfig.timeMultiplier);
    const totalProgress = Math.min(100, audioProgress + timeProgress);

    return { progress: totalProgress, timeSpent: safeTotalTimeSpent };
  };

  useLessonProgressTimer({
    lessonId: LESSON_ID,
    startTimeRef,
    calculateProgress: () => calculateProgress().progress,
    getLessonProgress,
    updateLessonProgress,
  });

  const filteredItems = useMemo(() => {
    return selectedCategory === 'all'
      ? natureItems
      : natureItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const displayedItems = showAllItems ? filteredItems : filteredItems.slice(0, 12);

  const totalExamples = natureItems.length + naturePhrases.length;
  const learnedCount = Math.min(totalExamples, uniqueAudiosPlayedRef.current.size);

  const progress = getLessonProgress(LESSON_ID);

  // Category chips data with "All" first
  const categoryChips = useMemo(() => {
    return [
      { id: 'all', label: 'All', icon: null as string | null },
      ...Object.entries(categories).map(([id, cat]) => ({
        id,
        label: cat.label,
        icon: cat.icon,
      })),
    ];
  }, []);

  // Render category chip
  const renderCategoryChip = useCallback(({ item }: { item: { id: string; label: string; icon: string | null } }) => {
    const isActive = selectedCategory === item.id;
    const hasIcon = item.icon;

    return (
      <Pressable
        onPress={() => {
          setSelectedCategory(item.id);
          setShowAllItems(false);
        }}
        style={({ pressed }) => [
          styles.categoryChip,
          isActive && styles.categoryChipActive,
          pressed && styles.chipPressed,
        ]}
      >
        {hasIcon && <Text style={styles.categoryChipIcon}>{item.icon}</Text>}
        <Text style={[
          styles.categoryChipText,
          isActive && styles.categoryChipTextActive,
        ]}>
          {item.label}
        </Text>
      </Pressable>
    );
  }, [selectedCategory]);

  const categoryKeyExtractor = useCallback((item: { id: string; label: string; icon: string | null }) => item.id, []);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Nature</Text>
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
        {/* Category Filter - Compact Horizontal Chips */}
        <View style={styles.categorySection}>
          <FlatList
            data={categoryChips}
            renderItem={renderCategoryChip}
            keyExtractor={categoryKeyExtractor}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChipsContainer}
            ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          />
        </View>

        {/* Nature Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌿</Text>
            <Text style={styles.sectionTitle}>Nature Items</Text>
          </View>
          <View style={styles.natureGrid}>
            {displayedItems.map((item, index) => {
              const audioKey = `nature-${item.id}`;
              const alreadyPlayed = playedKeysSnapshot.includes(audioKey);
              return (
                <View key={item.id} style={[styles.natureCard, alreadyPlayed && styles.playedCard]}>
                  <View style={styles.natureTextContainer}>
                    <Text style={styles.natureKurdish}>{item.kurdish}</Text>
                    <Text style={styles.natureEnglish}>{item.english}</Text>
                  </View>
                  <View style={styles.natureBottomRow}>
                    <Text style={styles.natureIcon}>{item.icon}</Text>
                    <Pressable
                      onPress={() => playAudio(audioKey, item.kurdish)}
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

          {filteredItems.length > 12 && (
            <Pressable
              onPress={() => setShowAllItems(!showAllItems)}
              style={styles.showMoreButton}
            >
              <Text style={styles.showMoreButtonText}>
                {showAllItems
                  ? 'Show Less'
                  : `See More (${filteredItems.length - 12} more items)`}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Nature Phrases */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💬</Text>
            <Text style={styles.sectionTitle}>Nature Phrases</Text>
          </View>
          <Text style={styles.sectionText}>
            Learn how to use nature words in sentences
          </Text>
          <View style={styles.phrasesList}>
            {naturePhrases.map((phrase) => {
              const audioKey = `phrase-${phrase.id}`;
              const alreadyPlayed = playedKeysSnapshot.includes(audioKey);
              return (
                <View key={phrase.id} style={[styles.phraseCard, alreadyPlayed && styles.playedCard]}>
                  <View style={styles.phraseContent}>
                    <Text style={styles.phraseKurdish}>{phrase.kurdish}</Text>
                    <Text style={styles.phraseEnglish}>{phrase.english}</Text>
                  </View>
                  <Pressable
                    onPress={() => playAudio(audioKey, phrase.kurdish)}
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

        {/* Nature in Kurdistan */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌍</Text>
            <Text style={styles.sectionTitle}>Nature in Kurdistan</Text>
          </View>
          <View style={styles.factsGrid}>
            <View style={styles.factCard}>
              <Text style={[styles.factTitle, { color: '#10b981' }]}>Mountains</Text>
              <Text style={styles.factText}>
                Kurdistan is home to beautiful mountains like Mount Ararat and the Zagros range.
              </Text>
            </View>
            <View style={styles.factCard}>
              <Text style={[styles.factTitle, { color: '#3b82f6' }]}>Forests</Text>
              <Text style={styles.factText}>
                Rich forests with oak, pine, and other native trees cover much of the region.
              </Text>
            </View>
            <View style={styles.factCard}>
              <Text style={[styles.factTitle, { color: '#ec4899' }]}>Wildflowers</Text>
              <Text style={styles.factText}>
                Spring brings beautiful wildflowers including Kurdish roses and mountain blooms.
              </Text>
            </View>
            <View style={styles.factCard}>
              <Text style={[styles.factTitle, { color: '#f59e0b' }]}>Climate</Text>
              <Text style={styles.factText}>
                Kurdistan has diverse climates from mountain snow to warm valleys.
              </Text>
            </View>
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
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
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
  sectionText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  // Category Section - Compact Horizontal (Matching Daily Conversations)
  categorySection: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryChipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryChip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3A86FF',
  },
  categoryChipIcon: {
    fontSize: 16,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  chipPressed: {
    opacity: 0.7,
  },
  natureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  natureCard: {
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
  natureTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  natureKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  natureEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  natureBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  natureIcon: {
    fontSize: 28,
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  showMoreButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3A86FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  showMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  phrasesList: {
    gap: 12,
  },
  playedCard: { opacity: 0.65 },
  phraseCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  phraseContent: {
    flex: 1,
    flexDirection: 'column',
  },
  phraseKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  phraseEnglish: {
    fontSize: 14,
    color: '#6b7280',
  },
  factsGrid: {
    gap: 12,
  },
  factCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  factTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  factText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

