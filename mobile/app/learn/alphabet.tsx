import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { restoreRefsFromProgress } from '../../lib/utils/progressHelper';
import LetterCard from '../components/LetterCard';
import ComparisonCard from '../components/ComparisonCard';

const { width } = Dimensions.get('window');

const LESSON_ID = '1'; // Alphabet lesson ID

// Audio asset map - maps letter audio filenames to require() paths
const audioAssets: Record<string, any> = {
  'a': require('../../assets/audio/alphabet/a.mp3'),
  'b': require('../../assets/audio/alphabet/b.mp3'),
  'c': require('../../assets/audio/alphabet/c.mp3'),
  'cedilla-c': require('../../assets/audio/alphabet/cedilla-c.mp3'),
  'd': require('../../assets/audio/alphabet/d.mp3'),
  'e': require('../../assets/audio/alphabet/e.mp3'),
  'circumflex-e': require('../../assets/audio/alphabet/circumflex-e.mp3'),
  'f': require('../../assets/audio/alphabet/f.mp3'),
  'g': require('../../assets/audio/alphabet/g.mp3'),
  'h': require('../../assets/audio/alphabet/h.mp3'),
  'i': require('../../assets/audio/alphabet/i.mp3'),
  'circumflex-i': require('../../assets/audio/alphabet/circumflex-i.mp3'),
  'j': require('../../assets/audio/alphabet/j.mp3'),
  'k': require('../../assets/audio/alphabet/k.mp3'),
  'l': require('../../assets/audio/alphabet/l.mp3'),
  'm': require('../../assets/audio/alphabet/m.mp3'),
  'n': require('../../assets/audio/alphabet/n.mp3'),
  'o': require('../../assets/audio/alphabet/o.mp3'),
  'p': require('../../assets/audio/alphabet/p.mp3'),
  'q': require('../../assets/audio/alphabet/q.mp3'),
  'r': require('../../assets/audio/alphabet/r.mp3'),
  's': require('../../assets/audio/alphabet/s.mp3'),
  'cedilla-s': require('../../assets/audio/alphabet/cedilla-s.mp3'),
  't': require('../../assets/audio/alphabet/t.mp3'),
  'u': require('../../assets/audio/alphabet/u.mp3'),
  'circumflex-u': require('../../assets/audio/alphabet/circumflex-u.mp3'),
  'v': require('../../assets/audio/alphabet/v.mp3'),
  'w': require('../../assets/audio/alphabet/w.mp3'),
  'x': require('../../assets/audio/alphabet/x.mp3'),
  'y': require('../../assets/audio/alphabet/y.mp3'),
  'z': require('../../assets/audio/alphabet/z.mp3'),
};

// Helper function to get audio filename for each letter
function getLetterAudioFile(glyph: string): string {
  const letterMap: Record<string, string> = {
    'A': 'a',
    'B': 'b',
    'C': 'c',
    'Ç': 'cedilla-c',
    'D': 'd',
    'E': 'e',
    'Ê': 'circumflex-e',
    'F': 'f',
    'G': 'g',
    'H': 'h',
    'I': 'i',
    'Î': 'circumflex-i',
    'J': 'j',
    'K': 'k',
    'L': 'l',
    'M': 'm',
    'N': 'n',
    'O': 'o',
    'P': 'p',
    'Q': 'q',
    'R': 'r',
    'S': 's',
    'Ş': 'cedilla-s',
    'T': 't',
    'U': 'u',
    'Û': 'circumflex-u',
    'V': 'v',
    'W': 'w',
    'X': 'x',
    'Y': 'y',
    'Z': 'z'
  };
  return letterMap[glyph] || glyph.toLowerCase();
}

type Letter = {
  glyph: string;
  word: string;
  meaning: string;
};

const letters: Letter[] = [
  { glyph: "A", word: "av", meaning: "water" },
  { glyph: "B", word: "bav", meaning: "father" },
  { glyph: "C", word: "cîran", meaning: "neighbors" },
  { glyph: "Ç", word: "çav", meaning: "eyes" },
  { glyph: "D", word: "dest", meaning: "hand" },
  { glyph: "E", word: "ev", meaning: "this" },
  { glyph: "Ê", word: "êvar", meaning: "evening" },
  { glyph: "F", word: "fîl", meaning: "elephant" },
  { glyph: "G", word: "gur", meaning: "wolf" },
  { glyph: "H", word: "hesp", meaning: "horse" },
  { glyph: "I", word: "isal", meaning: "this year" },
  { glyph: "Î", word: "îro", meaning: "today" },
  { glyph: "J", word: "jin", meaning: "woman" },
  { glyph: "K", word: "kur", meaning: "son" },
  { glyph: "L", word: "ling", meaning: "leg" },
  { glyph: "M", word: "mal", meaning: "house" },
  { glyph: "N", word: "nav", meaning: "name" },
  { glyph: "O", word: "ode", meaning: "room" },
  { glyph: "P", word: "poz", meaning: "nose" },
  { glyph: "Q", word: "qel", meaning: "crow" },
  { glyph: "R", word: "roj", meaning: "sun" },
  { glyph: "S", word: "sor", meaning: "red" },
  { glyph: "Ş", word: "şêr", meaning: "lion" },
  { glyph: "T", word: "tili", meaning: "finger" },
  { glyph: "U", word: "usta", meaning: "master" },
  { glyph: "Û", word: "ûr", meaning: "fire" },
  { glyph: "V", word: "vexwarin", meaning: "to drink" },
  { glyph: "W", word: "welat", meaning: "country" },
  { glyph: "X", word: "xwişk", meaning: "sister" },
  { glyph: "Y", word: "yek", meaning: "one" },
  { glyph: "Z", word: "ziman", meaning: "tongue" },
];

export default function AlphabetPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { updateLessonProgress, getLessonProgress } = useProgressStore();
  
  // Progress tracking refs - will be restored from stored progress
  const progressConfig = {
    totalAudios: 37, // 31 letters + 6 comparison audios (3 cards × 2 letters each)
    hasPractice: false,
    audioWeight: 50,
    timeWeight: 50,
    audioMultiplier: 1.35, // 50% / 37 audios ≈ 1.35% per audio
  };
  
  // Initialize refs - will be restored in useEffect
  const storedProgress = getLessonProgress(LESSON_ID);
  const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(storedProgress, progressConfig);
  const startTimeRef = useRef<number>(estimatedStartTime);
  const uniqueAudiosPlayedRef = useRef<Set<string>>(new Set());
  // Base audio plays estimated from stored progress
  const baseAudioPlaysRef = useRef<number>(estimatedAudioPlays);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
      return;
    }

    const progress = getLessonProgress(LESSON_ID);
    console.log('🚀 Alphabet page mounted, initial progress:', {
      progress: progress.progress,
      status: progress.status,
      score: progress.score,
      timeSpent: progress.timeSpent,
    });
    
    // Mark lesson as in progress on mount
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
    
    // Restore refs from stored progress
    const currentProgress = getLessonProgress(LESSON_ID);
    const { estimatedAudioPlays, estimatedStartTime } = restoreRefsFromProgress(currentProgress, progressConfig);
    startTimeRef.current = estimatedStartTime;
    baseAudioPlaysRef.current = estimatedAudioPlays;
    
    console.log('🔄 Restored refs:', {
      estimatedAudioPlays,
      estimatedStartTime: new Date(estimatedStartTime).toISOString(),
      uniqueAudiosPlayed: uniqueAudiosPlayedRef.current.size,
    });
  }, [isAuthenticated]);

  const calculateProgress = () => {
    // Get current progress to access latest timeSpent
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress?.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
    
    // Calculate progress from ACTUAL STATE, not from stored baseProgress
    
    // 1. Audio progress: Calculate from total unique audios played (base + new)
    const totalUniqueAudios = baseAudioPlaysRef.current + uniqueAudiosPlayedRef.current.size;
    const effectiveUniqueAudios = Math.min(totalUniqueAudios, progressConfig.totalAudios);
    const audioProgress = Math.min(50, (effectiveUniqueAudios / progressConfig.totalAudios) * 50);
    
    // 2. Time progress: Calculate from total time spent (max 50%, 5 minutes = 50%)
    const timeProgress = Math.min(50, totalTimeSpent * 10);
    
    // 3. Total progress = audio + time (capped at 100%)
    const totalProgress = Math.min(100, audioProgress + timeProgress);
    
    console.log('📊 Progress calculation (from state):', {
      totalUniqueAudios,
      effectiveUniqueAudios,
      audioProgress: audioProgress.toFixed(2),
      totalTimeSpent,
      timeProgress: timeProgress.toFixed(2),
      totalProgress: totalProgress.toFixed(2),
    });
    
    return totalProgress;
  };

  const handleAudioPlay = (audioKey: string) => {
    // Track unique audios played (only count new ones) - check BEFORE adding
    if (uniqueAudiosPlayedRef.current.has(audioKey)) {
      // Already played this audio, don't update progress
      console.log('🔇 Audio already played, skipping:', audioKey);
      return;
    }
    
    console.log('🔊 New unique audio played:', audioKey, 'Total unique:', uniqueAudiosPlayedRef.current.size + 1);
    uniqueAudiosPlayedRef.current.add(audioKey);
    
    const currentProgress = getLessonProgress(LESSON_ID);
    
    // Calculate total time spent (base + session)
    const baseTimeSpent = currentProgress.timeSpent || 0;
    const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
    const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
    const safeTimeSpent = Math.min(1000, totalTimeSpent);
    
    const progress = calculateProgress();
    const status = currentProgress.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
    
    console.log('📊 Progress update:', {
      progress,
      uniqueAudios: uniqueAudiosPlayedRef.current.size,
      audioKey,
    });
    
    updateLessonProgress(LESSON_ID, progress, status, undefined, safeTimeSpent);
  };

  const progress = getLessonProgress(LESSON_ID);
  
  // Calculate learned count from actual unique audios (includes letters + comparisons)
  const estimatedBaseCount = Math.min(baseAudioPlaysRef.current, progressConfig.totalAudios);
  const newUniqueAudios = uniqueAudiosPlayedRef.current.size;
  const learnedCount = Math.min(estimatedBaseCount + newUniqueAudios, progressConfig.totalAudios);

  const renderLetter = ({ item }: { item: Letter }) => {
    const audioFile = getLetterAudioFile(item.glyph);
    // Use letter glyph as unique key for tracking
    const audioKey = `letter-${item.glyph}`;
    return (
      <LetterCard
        glyph={item.glyph}
        word={item.word}
        meaning={item.meaning}
        audioFile={audioFile}
        audioAssets={audioAssets}
        onPlay={() => handleAudioPlay(audioKey)}
      />
    );
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header: back + centered Alphabet (match Learn/Games style) */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Alphabet</Text>
          <View style={styles.headerRight} />
        </View>

      {/* Progress & Learn bar (white card, matches achievement bar style) */}
      <View style={styles.progressBarCard}>
        <View style={styles.progressBarSection}>
          <Text style={styles.progressBarLabel}>Progress</Text>
          <Text style={[
            styles.progressBarValue,
            progress.progress === 100 && styles.progressBarComplete
          ]}>
            {Math.round(progress.progress)}%
          </Text>
        </View>
        <View style={styles.progressBarDivider} />
        <View style={styles.progressBarSection}>
          <Text style={styles.progressBarLabel}>Learn</Text>
          <Text style={[
            styles.progressBarValue,
            learnedCount === progressConfig.totalAudios && styles.progressBarComplete
          ]}>
            {learnedCount}/{progressConfig.totalAudios}
          </Text>
        </View>
      </View>

      {/* Letters Grid with FlatList */}
      <FlatList
        data={letters}
        renderItem={renderLetter}
        keyExtractor={(item) => item.glyph}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        ListFooterComponent={(
          <>
            {/* Letter Comparison Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="swap-horizontal" size={24} color="#dc2626" />
                <Text style={styles.sectionTitle}>Letter Comparison</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Compare similar-looking letters with different sounds:
              </Text>

              {/* I vs Î */}
              <ComparisonCard
                letter1={{
                  glyph: 'I',
                  word: 'isal',
                  meaning: 'this year',
                  audioFile: 'i',
                }}
                letter2={{
                  glyph: 'Î',
                  word: 'îro',
                  meaning: 'today',
                  audioFile: 'circumflex-i',
                }}
                tip='I is short like "it", Î is long like "ee" in "see"'
                audioAssets={audioAssets}
                onPlay={handleAudioPlay}
                audioKey1="comparison-i-1"
                audioKey2="comparison-i-2"
              />

              {/* U vs Û */}
              <ComparisonCard
                letter1={{
                  glyph: 'U',
                  word: 'usta',
                  meaning: 'master',
                  audioFile: 'u',
                }}
                letter2={{
                  glyph: 'Û',
                  word: 'ûr',
                  meaning: 'fire',
                  audioFile: 'circumflex-u',
                }}
                tip='U is short like "put", Û is long like "oo" in "moon"'
                audioAssets={audioAssets}
                onPlay={handleAudioPlay}
                audioKey1="comparison-u-1"
                audioKey2="comparison-u-2"
              />

              {/* E vs Ê */}
              <ComparisonCard
                letter1={{
                  glyph: 'E',
                  word: 'ev',
                  meaning: 'this',
                  audioFile: 'e',
                }}
                letter2={{
                  glyph: 'Ê',
                  word: 'êvar',
                  meaning: 'evening',
                  audioFile: 'circumflex-e',
                }}
                tip='E is short like "pet", Ê is long like "ay" in "say"'
                audioAssets={audioAssets}
                onPlay={handleAudioPlay}
                audioKey1="comparison-e-1"
                audioKey2="comparison-e-2"
              />
            </View>

            {/* Pronunciation Tips Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Pronunciation Tips</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Special characters and their sounds:
              </Text>

              <View style={styles.tipsGrid}>
                <View style={styles.tipRow}>
                  <View style={styles.tipCard}>
                    <Text style={styles.tipGlyph}>Ç</Text>
                    <Text style={styles.tipTitle}>(cedilla C)</Text>
                    <Text style={styles.tipDescription}>
                      Sounds like "ch" in "chair"
                    </Text>
                    <Text style={styles.tipExample}>çav (eyes)</Text>
                  </View>

                  <View style={styles.tipCard}>
                    <Text style={styles.tipGlyph}>Ş</Text>
                    <Text style={styles.tipTitle}>(cedilla S)</Text>
                    <Text style={styles.tipDescription}>
                      Sounds like "sh" in "shoe"
                    </Text>
                    <Text style={styles.tipExample}>şêr (lion)</Text>
                  </View>
                </View>

                <View style={styles.tipRow}>
                  <View style={styles.tipCard}>
                    <Text style={styles.tipGlyph}>X</Text>
                    <Text style={styles.tipDescription}>
                      Sounds like "kh" (guttural sound)
                    </Text>
                    <Text style={styles.tipExample}>xwişk (sister)</Text>
                  </View>

                  <View style={styles.tipCard}>
                    <Text style={styles.tipGlyph}>Q</Text>
                    <Text style={styles.tipDescription}>
                      Sounds like "q" in Arabic
                    </Text>
                    <Text style={styles.tipExample}>qel (crow)</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
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
  headerRight: {
    width: 44,
  },
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
  progressBarComplete: {
    color: '#10b981',
  },
  progressBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Prevent stretching
  },
  section: {
    paddingHorizontal: 12,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  tipsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  tipCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  tipGlyph: {
    fontSize: 40,
    fontWeight: '700',
    color: '#3A86FF',
    marginBottom: 4,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  tipDescription: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  tipExample: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});
