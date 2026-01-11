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
  trees: { label: 'Trees', color: '#10b981' },
  flowers: { label: 'Flowers', color: '#ec4899' },
  landscapes: { label: 'Landscapes', color: '#3b82f6' },
  weather: { label: 'Weather', color: '#f59e0b' },
  plants: { label: 'Plants', color: '#14b8a6' },
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

      // Track audio play for progress
      audioPlaysRef.current += 1;
      handleAudioPlay();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  };

  const handleAudioPlay = () => {
    const currentProgress = getLessonProgress(LESSON_ID);
    const progress = calculateProgress();
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    updateLessonProgress(LESSON_ID, progress, status);
  };

  const calculateProgress = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // minutes
    // Audio clicks: max 50% (20 clicks = 50%)
    const audioProgress = Math.min(50, audioPlaysRef.current * 2.5);
    // Time spent: max 50% (5 minutes = 50%)
    const timeProgress = Math.min(50, timeSpent * 10);
    return Math.min(100, audioProgress + timeProgress);
  };

  const filteredItems = selectedCategory === 'all'
    ? natureItems
    : natureItems.filter(item => item.category === selectedCategory);

  const displayedItems = showAllItems ? filteredItems : filteredItems.slice(0, 12);

  // Calculate total examples count for Learn progress
  const totalExamples = natureItems.length + naturePhrases.length;
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
        <Text style={styles.headerTitle}>Nature</Text>
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
        {/* Category Filter */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌿</Text>
            <Text style={styles.sectionTitle}>Nature Categories</Text>
          </View>
          <View style={styles.categoryContainer}>
            <Pressable
              onPress={() => {
                setSelectedCategory('all');
                setShowAllItems(false);
              }}
              style={({ pressed }) => [
                styles.categoryButton,
                selectedCategory === 'all' && styles.categoryButtonActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.categoryButtonTextActive,
              ]}>
                All
              </Text>
            </Pressable>
            {Object.entries(categories).map(([key, category]) => (
              <Pressable
                key={key}
                onPress={() => {
                  setSelectedCategory(key);
                  setShowAllItems(false);
                }}
                style={({ pressed }) => [
                  styles.categoryButton,
                  selectedCategory === key && styles.categoryButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === key && styles.categoryButtonTextActive,
                ]}>
                  {category.label}
                </Text>
              </Pressable>
            ))}
          </View>
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
              return (
                <View key={item.id} style={styles.natureCard}>
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
              return (
                <View key={phrase.id} style={styles.phraseCard}>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
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
    width: 32,
  },
  progressInfoContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
  },
  progressInfoText: {
    fontSize: 14,
    color: '#6b7280',
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
    marginHorizontal: 4,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#3A86FF',
    borderColor: '#3A86FF',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
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

