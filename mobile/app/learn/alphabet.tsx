import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
      return;
    }

    // Mark lesson as in progress on mount
    const progress = getLessonProgress(LESSON_ID);
    if (progress.status === 'NOT_STARTED') {
      updateLessonProgress(LESSON_ID, 0, 'IN_PROGRESS');
    }
  }, [isAuthenticated]);

  const handleAudioPlay = () => {
    const progress = getLessonProgress(LESSON_ID);
    const newProgress = Math.min(100, progress.progress + 2);
    const newStatus = newProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
    updateLessonProgress(LESSON_ID, newProgress, newStatus);
  };

  const progress = getLessonProgress(LESSON_ID);
  const completedCount = Math.floor((progress.progress / 100) * letters.length);
  const progressText = `${completedCount}/${letters.length}`;

  const renderLetter = ({ item }: { item: Letter }) => (
    <LetterCard
      glyph={item.glyph}
      word={item.word}
      meaning={item.meaning}
      audioFile={getLetterAudioFile(item.glyph)}
      audioAssets={audioAssets}
      onPlay={handleAudioPlay}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Alphabet</Text>
          <View style={styles.progressPill}>
            <Text style={styles.progressText}>{progressText}</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <Text style={styles.description}>
        Learn all 31 letters of the Kurdish alphabet
      </Text>

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
        ListFooterComponent={
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
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
  },
  pressed: {
    backgroundColor: '#f3f4f6',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  progressPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  headerSpacer: {
    width: 40,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
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
