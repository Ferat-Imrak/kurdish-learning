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

const LESSON_ID = '7'; // Food & Meals lesson ID

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

// Food items data
const foodItems = [
  // Fruits (12 items)
  { ku: "sêv", en: "apple", icon: "🍎", category: "fruit" },
  { ku: "pirteqal", en: "orange", icon: "🍊", category: "fruit" },
  { ku: "mûz", en: "banana", icon: "🍌", category: "fruit" },
  { ku: "tû", en: "mulberry", icon: "🫐", category: "fruit" },
  { ku: "hinar", en: "pomegranate", icon: "🔴", category: "fruit" },
  { ku: "xox", en: "peach", icon: "🍑", category: "fruit" },
  { ku: "hêjîr", en: "fig", icon: "🟤", category: "fruit" },
  { ku: "zeytûn", en: "olive", icon: "🫒", category: "fruit" },
  { ku: "tirî", en: "grape", icon: "🍇", category: "fruit" },
  { ku: "leymûn", en: "lemon", icon: "🍋", category: "fruit" },
  { ku: "zebeş", en: "watermelon", icon: "🍉", category: "fruit" },
  { ku: "şeftalî", en: "peach", icon: "🍑", category: "fruit" },
  
  // Vegetables (12 items)
  { ku: "gizêr", en: "carrot", icon: "🥕", category: "vegetable" },
  { ku: "kartol", en: "potato", icon: "🥔", category: "vegetable" },
  { ku: "pîvaz", en: "onion", icon: "🧅", category: "vegetable" },
  { ku: "sîr", en: "garlic", icon: "🧄", category: "vegetable" },
  { ku: "bacansor", en: "tomato", icon: "🍅", category: "vegetable" },
  { ku: "xiyar", en: "cucumber", icon: "🥒", category: "vegetable" },
  { ku: "kelem", en: "cabbage", icon: "🥬", category: "vegetable" },
  { ku: "îspenax", en: "spinach", icon: "🥬", category: "vegetable" },
  { ku: "bacanreş", en: "eggplant", icon: "🍆", category: "vegetable" },
  { ku: "îsot", en: "pepper", icon: "🫑", category: "vegetable" },
  { ku: "kivark", en: "mushroom", icon: "🍄", category: "vegetable" },
  { ku: "garis", en: "corn", icon: "🌽", category: "vegetable" },
  
  // Proteins (10 items)
  { ku: "masî", en: "fish", icon: "🐟", category: "protein" },
  { ku: "hêk", en: "egg", icon: "🥚", category: "protein" },
  { ku: "goşt", en: "meat", icon: "🥩", category: "protein" },
  { ku: "mirîşk", en: "chicken", icon: "🐔", category: "protein" },
  { ku: "berx", en: "lamb", icon: "🐑", category: "protein" },
  { ku: "nok", en: "beans", icon: "🫘", category: "protein" },
  { ku: "nîsk", en: "lentils", icon: "🫘", category: "protein" },
  { ku: "elok", en: "turkey", icon: "🦃", category: "protein" },
  { ku: "fistîq", en: "pistachios", icon: "🥜", category: "protein" },
  { ku: "behîv", en: "almonds", icon: "🥜", category: "protein" },
  
  // Dairy (6 items)
  { ku: "şîr", en: "milk", icon: "🥛", category: "dairy" },
  { ku: "mast", en: "yogurt", icon: "🍶", category: "dairy" },
  { ku: "penîr", en: "cheese", icon: "🧀", category: "dairy" },
  { ku: "rûn", en: "butter", icon: "🧈", category: "dairy" },
  { ku: "qeymax", en: "cream", icon: "🥛", category: "dairy" },
  { ku: "dew", en: "yogurt drink", icon: "🥛", category: "dairy" },
  
  // Grains (8 items)
  { ku: "nan", en: "bread", icon: "🍞", category: "grain" },
  { ku: "birinc", en: "rice", icon: "🍚", category: "grain" },
  { ku: "genim", en: "wheat", icon: "🌾", category: "grain" },
  { ku: "ceh", en: "barley", icon: "🌾", category: "grain" },
  { ku: "bulgur", en: "bulgur", icon: "🌾", category: "grain" },
  { ku: "makarna", en: "pasta", icon: "🍝", category: "grain" },
  { ku: "kek", en: "cake", icon: "🍰", category: "grain" },
  { ku: "kurabiye", en: "cookie", icon: "🍪", category: "grain" },
  
  // Drinks (5 items)
  { ku: "qehwe", en: "coffee", icon: "☕", category: "drink" },
  { ku: "çay", en: "tea", icon: "🍵", category: "drink" },
  { ku: "av", en: "water", icon: "💧", category: "drink" },
  { ku: "şerbet", en: "sherbet", icon: "🧃", category: "drink" },
  { ku: "limonata", en: "lemonade", icon: "🍋", category: "drink" },
];

// Meal times
const mealTimes = [
  { ku: "taştê", en: "breakfast", icon: "🌅" },
  { ku: "firavîn", en: "lunch", icon: "☀️" },
  { ku: "şîv", en: "dinner", icon: "🌙" },
];

// Food questions
const foodQuestions = [
  { ku: "Tu çi dixwazî ji bo taştê?", en: "What do you want for breakfast?" },
  { ku: "Tu taştê hez dikî?", en: "Do you like breakfast?" },
  { ku: "Tu çi dixwazî ji bo şîvê?", en: "What do you want for dinner?" },
  { ku: "Tu çi xwarin hez dikî?", en: "What food do you like?" },
  { ku: "Tu çi vexwarin hez dikî?", en: "What drink do you like?" },
  { ku: "Tu masî hez dikî?", en: "Do you like fish?" },
  { ku: "Tu goşt hez dikî?", en: "Do you like meat?" },
  { ku: "Tu sêv hez dikî?", en: "Do you like apples?" },
];

// Common responses
const responses = [
  { ku: "Erê, ez hez dikim", en: "Yes, I like it" },
  { ku: "Na, ez hez nakim", en: "No, I don't like it" },
  { ku: "Ez hez dikim", en: "I like it" },
  { ku: "Ez hez nakim", en: "I don't like it" },
  { ku: "Ez pir hez dikim", en: "I really like it" },
  { ku: "Xweş e", en: "It's good" },
  { ku: "Xweş nîne", en: "It's not good" },
  { ku: "Pir xweş e", en: "It's very good" },
  { ku: "Ez birçî me", en: "I'm hungry" },
  { ku: "Ez tî me", en: "I'm thirsty" },
  { ku: "Ez têr im", en: "I'm full" },
  { ku: "Spas", en: "Thank you" },
  { ku: "Rica dikim", en: "You're welcome" },
  { ku: "Ez dixwazim", en: "I want" },
  { ku: "Ez naxwazim", en: "I don't want" },
  { ku: "Çend e?", en: "How much is it?" },
  { ku: "Ev çi ye?", en: "What is this?" },
  { ku: "Ez ji te re dixwazim", en: "I want it for you" },
  { ku: "Ez ji xwe re dixwazim", en: "I want it for myself" },
];

// Audio assets mapping
const audioAssets: Record<string, any> = {
  'av': require('../../assets/audio/food/av.mp3'),
  'bacanres': require('../../assets/audio/food/bacanres.mp3'),
  'bacansor': require('../../assets/audio/food/bacansor.mp3'),
  'behiv': require('../../assets/audio/food/behiv.mp3'),
  'berx': require('../../assets/audio/food/berx.mp3'),
  'birinc': require('../../assets/audio/food/birinc.mp3'),
  'bulgur': require('../../assets/audio/food/bulgur.mp3'),
  'cay': require('../../assets/audio/food/cay.mp3'),
  'ceh': require('../../assets/audio/food/ceh.mp3'),
  'cend-e': require('../../assets/audio/food/cend-e.mp3'),
  'dew': require('../../assets/audio/food/dew.mp3'),
  'elok': require('../../assets/audio/food/elok.mp3'),
  'ere-ez-hez-dikim': require('../../assets/audio/food/ere-ez-hez-dikim.mp3'),
  'ev-ci-ye': require('../../assets/audio/food/ev-ci-ye.mp3'),
  'ez-birci-me': require('../../assets/audio/food/ez-birci-me.mp3'),
  'ez-dixwazim': require('../../assets/audio/food/ez-dixwazim.mp3'),
  'ez-hez-dikim': require('../../assets/audio/food/ez-hez-dikim.mp3'),
  'ez-hez-nakim': require('../../assets/audio/food/ez-hez-nakim.mp3'),
  'ez-ji-te-re-dixwazim': require('../../assets/audio/food/ez-ji-te-re-dixwazim.mp3'),
  'ez-ji-xwe-re-dixwazim': require('../../assets/audio/food/ez-ji-xwe-re-dixwazim.mp3'),
  'ez-naxwazim': require('../../assets/audio/food/ez-naxwazim.mp3'),
  'ez-pir-hez-dikim': require('../../assets/audio/food/ez-pir-hez-dikim.mp3'),
  'ez-ter-im': require('../../assets/audio/food/ez-ter-im.mp3'),
  'ez-ti-me': require('../../assets/audio/food/ez-ti-me.mp3'),
  'firavin': require('../../assets/audio/food/firavin.mp3'),
  'fistiq': require('../../assets/audio/food/fistiq.mp3'),
  'garis': require('../../assets/audio/food/garis.mp3'),
  'genim': require('../../assets/audio/food/genim.mp3'),
  'gizer': require('../../assets/audio/food/gizer.mp3'),
  'gost': require('../../assets/audio/food/gost.mp3'),
  'hejir': require('../../assets/audio/food/hejir.mp3'),
  'hek': require('../../assets/audio/food/hek.mp3'),
  'hinar': require('../../assets/audio/food/hinar.mp3'),
  'isot': require('../../assets/audio/food/isot.mp3'),
  'ispenax': require('../../assets/audio/food/ispenax.mp3'),
  'kartol': require('../../assets/audio/food/kartol.mp3'),
  'kek': require('../../assets/audio/food/kek.mp3'),
  'kelem': require('../../assets/audio/food/kelem.mp3'),
  'kivark': require('../../assets/audio/food/kivark.mp3'),
  'kurabiye': require('../../assets/audio/food/kurabiye.mp3'),
  'leymun': require('../../assets/audio/food/leymun.mp3'),
  'limonata': require('../../assets/audio/food/limonata.mp3'),
  'makarna': require('../../assets/audio/food/makarna.mp3'),
  'masi': require('../../assets/audio/food/masi.mp3'),
  'mast': require('../../assets/audio/food/mast.mp3'),
  'mirisk': require('../../assets/audio/food/mirisk.mp3'),
  'muz': require('../../assets/audio/food/muz.mp3'),
  'na-ez-hez-nakim': require('../../assets/audio/food/na-ez-hez-nakim.mp3'),
  'nan': require('../../assets/audio/food/nan.mp3'),
  'nisk': require('../../assets/audio/food/nisk.mp3'),
  'nok': require('../../assets/audio/food/nok.mp3'),
  'penir': require('../../assets/audio/food/penir.mp3'),
  'pir-xwes-e': require('../../assets/audio/food/pir-xwes-e.mp3'),
  'pirteqal': require('../../assets/audio/food/pirteqal.mp3'),
  'pivaz': require('../../assets/audio/food/pivaz.mp3'),
  'qehwe': require('../../assets/audio/food/qehwe.mp3'),
  'qeymax': require('../../assets/audio/food/qeymax.mp3'),
  'rica-dikim': require('../../assets/audio/food/rica-dikim.mp3'),
  'run': require('../../assets/audio/food/run.mp3'),
  'seftali': require('../../assets/audio/food/seftali.mp3'),
  'serbet': require('../../assets/audio/food/serbet.mp3'),
  'sev': require('../../assets/audio/food/sev.mp3'),
  'shir-milk': require('../../assets/audio/food/shir-milk.mp3'),
  'sir': require('../../assets/audio/food/sir.mp3'),
  'shiv': require('../../assets/audio/food/shiv.mp3'),
  'spas': require('../../assets/audio/food/spas.mp3'),
  'taste': require('../../assets/audio/food/taste.mp3'),
  'tiri': require('../../assets/audio/food/tiri.mp3'),
  'tu': require('../../assets/audio/food/tu.mp3'),
  'tu-ci-dixwazi-ji-bo-shive': require('../../assets/audio/food/tu-ci-dixwazi-ji-bo-shive.mp3'),
  'tu-ci-dixwazi-ji-bo-taste': require('../../assets/audio/food/tu-ci-dixwazi-ji-bo-taste.mp3'),
  'tu-ci-vexwarin-hez-diki': require('../../assets/audio/food/tu-ci-vexwarin-hez-diki.mp3'),
  'tu-ci-xwarin-hez-diki': require('../../assets/audio/food/tu-ci-xwarin-hez-diki.mp3'),
  'tu-gost-hez-diki': require('../../assets/audio/food/tu-gost-hez-diki.mp3'),
  'tu-masi-hez-diki': require('../../assets/audio/food/tu-masi-hez-diki.mp3'),
  'tu-sev-hez-diki': require('../../assets/audio/food/tu-sev-hez-diki.mp3'),
  'tu-taste-hez-diki': require('../../assets/audio/food/tu-taste-hez-diki.mp3'),
  'xiyar': require('../../assets/audio/food/xiyar.mp3'),
  'xox': require('../../assets/audio/food/xox.mp3'),
  'xwarina-evare': require('../../assets/audio/food/xwarina-evare.mp3'),
  'xwarina-nivro': require('../../assets/audio/food/xwarina-nivro.mp3'),
  'xwes-e': require('../../assets/audio/food/xwes-e.mp3'),
  'xwes-nine': require('../../assets/audio/food/xwes-nine.mp3'),
  'zebes': require('../../assets/audio/food/zebes.mp3'),
  'zeytun': require('../../assets/audio/food/zeytun.mp3'),
};

export default function FoodPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAllFoods, setShowAllFoods] = useState(false);
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

  const playAudio = async (audioFile: string, audioText: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      // Special cases for filename mapping
      let filename = getAudioFilename(audioText);
      if (audioText === "şîr") {
        filename = "shir-milk";
      } else if (audioText === "şîv") {
        filename = "shiv";
      } else if (audioText === "Tu çi dixwazî ji bo şîvê?") {
        filename = "tu-ci-dixwazi-ji-bo-shive";
      }

      const audioAsset = audioAssets[filename];
      if (!audioAsset) {
        console.warn(`Audio file not found: ${filename}. Audio files will be generated later.`);
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

  const categories = ['all', 'fruit', 'vegetable', 'protein', 'dairy', 'grain', 'drink'];
  
  const filteredFoods = selectedCategory === 'all' 
    ? foodItems
    : foodItems.filter(food => food.category === selectedCategory);
  
  const displayedFoods = showAllFoods ? filteredFoods : filteredFoods.slice(0, 12);

  // Calculate total examples count for Learn progress
  const totalExamples = foodItems.length + mealTimes.length + foodQuestions.length + responses.length;
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
        <Text style={styles.headerTitle}>Food & Meals</Text>
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
        {/* Food Categories Filter */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🍎</Text>
            <Text style={styles.sectionTitle}>Food Categories</Text>
          </View>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <Pressable
                key={category}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowAllFoods(false);
                }}
                style={({ pressed }) => [
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Food Items */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🍎</Text>
            <Text style={styles.sectionTitle}>Food Items</Text>
          </View>
          <View style={styles.foodGrid}>
            {displayedFoods.map((item, index) => {
              const audioKey = `food-${item.ku}`;
              return (
                <View key={index} style={styles.foodCard}>
                  <View style={styles.foodTextContainer}>
                    <Text style={styles.foodKurdish}>{item.ku}</Text>
                    <Text style={styles.foodEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.foodBottomRow}>
                    <Text style={styles.foodIcon}>{item.icon}</Text>
                    <Pressable
                      onPress={() => playAudio(audioKey, item.ku)}
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
          
          {filteredFoods.length > 12 && (
            <Pressable
              onPress={() => setShowAllFoods(!showAllFoods)}
              style={({ pressed }) => [
                styles.showMoreButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.showMoreButtonText}>
                {showAllFoods ? 'Show Less' : `See More (${filteredFoods.length - 12} more items)`}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Meal Times */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🍽️</Text>
            <Text style={styles.sectionTitle}>Meal Times</Text>
          </View>
          <View style={styles.mealTimesGrid}>
            {mealTimes.map((item, index) => {
              const audioKey = `meal-${item.ku}`;
              return (
                <View key={index} style={styles.mealTimeCard}>
                  <View style={styles.mealTimeTextContainer}>
                    <Text style={styles.mealTimeKurdish}>{item.ku}</Text>
                    <Text style={styles.mealTimeEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.mealTimeBottomRow}>
                    <Text style={styles.mealTimeIcon}>{item.icon}</Text>
                    <Pressable
                      onPress={() => playAudio(audioKey, item.ku)}
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

        {/* Food Questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>❓</Text>
            <Text style={styles.sectionTitle}>Food Questions</Text>
          </View>
          <View style={styles.questionsList}>
            {foodQuestions.map((item, index) => {
              const audioKey = `question-${item.ku}`;
              return (
                <View key={index} style={styles.questionCard}>
                  <View style={styles.questionTextContainer}>
                    <Text style={styles.questionKurdish}>{item.ku}</Text>
                    <Text style={styles.questionEnglish}>{item.en}</Text>
                  </View>
                  <Pressable
                    onPress={() => playAudio(audioKey, item.ku)}
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

        {/* Common Responses */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>💬</Text>
            <Text style={styles.sectionTitle}>Common Responses</Text>
          </View>
          <View style={styles.responsesGrid}>
            {responses.map((item, index) => {
              const audioKey = `response-${item.ku}`;
              return (
                <View key={index} style={styles.responseCard}>
                  <View style={styles.responseTextContainer}>
                    <Text style={styles.responseKurdish}>{item.ku}</Text>
                    <Text style={styles.responseEnglish}>{item.en}</Text>
                  </View>
                  <View style={styles.responseBottomRow}>
                    <Pressable
                      onPress={() => playAudio(audioKey, item.ku)}
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
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
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
  foodTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  foodKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  foodEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  foodBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  foodIcon: {
    fontSize: 28,
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
  mealTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mealTimeCard: {
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
  mealTimeTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  mealTimeKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  mealTimeEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  mealTimeBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  mealTimeIcon: {
    fontSize: 28,
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
  responsesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  responseCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  responseTextContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  responseKurdish: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  responseEnglish: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  responseBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  audioButtonContainer: {
    width: ICON_CONTAINER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});

