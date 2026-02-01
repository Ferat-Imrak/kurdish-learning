import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useGamesProgressStore } from '../../lib/store/gamesProgressStore';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryCard from '../components/CategoryCard';
import {
  cardsByCategoryId,
  MATCHING_CATEGORY_IDS,
  CATEGORY_ICONS,
  CATEGORY_DISPLAY_NAMES,
  allCards,
} from '../../lib/data/game-data';

const BRAND_BLUE = '#3A86FF';

type WordItem = { kurdish: string; english: string; letters: string[] };

function wordToLetters(w: string): string[] {
  return w.split('').filter((c) => c.trim());
}

function cardsToWords(cards: { english: string; kurdish: string }[]): WordItem[] {
  return cards.map((c) => ({
    english: c.english,
    kurdish: c.kurdish,
    letters: wordToLetters(c.kurdish),
  }));
}

const categoryDecks = MATCHING_CATEGORY_IDS.map((id) => {
  const cards = cardsByCategoryId[id];
  const words = cards?.length ? cardsToWords(cards) : [];
  return {
    id,
    name: CATEGORY_DISPLAY_NAMES[id] || id,
    icon: CATEGORY_ICONS[id] || '📝',
    words,
  };
}).filter((d) => d.words.length >= 1);

const masterWords = cardsToWords(allCards);

const decks = [
  ...categoryDecks,
  {
    id: 'master',
    name: CATEGORY_DISPLAY_NAMES.master,
    icon: CATEGORY_ICONS.master,
    words: masterWords.length >= 1 ? masterWords : categoryDecks.flatMap((d) => d.words),
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WORDBUILDER_KEY = (id: string) => `wordbuilder-progress-${id}`;

export default function WordBuilderScreen() {
  const router = useRouter();
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress, data: gamesData } = useGamesProgressStore();
  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const [built, setBuilt] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const getProgress = (categoryId: string): number => {
    const raw = getGamesProgress(WORDBUILDER_KEY(categoryId));
    if (raw == null) return 0;
    if (typeof raw === 'number') return raw;
    const o = raw as { uniqueWords?: number };
    return o.uniqueWords ?? 0;
  };

  const saveProgress = async (categoryId: string, uniqueWords: number) => {
    const cur = getProgress(categoryId);
    const best = Math.max(cur, uniqueWords);
    await saveGamesProgress(WORDBUILDER_KEY(categoryId), { uniqueWords: best });
    setProgressMap((prev) => ({ ...prev, [categoryId]: best }));
  };

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const d of decks) map[d.id] = getProgress(d.id);
    setProgressMap(map);
  }, [gamesData]);

  useEffect(() => {
    if (!selectedDeck) return;
    const targetWords = selectedDeck.id === 'master' ? 30 : 20;
    const pool = selectedDeck.words;
    let sessionPool: WordItem[];
    if (pool.length >= targetWords) {
      sessionPool = shuffle([...pool]).slice(0, targetWords);
    } else {
      const repeats = Math.ceil(targetWords / pool.length);
      let filled: WordItem[] = [];
      for (let i = 0; i < repeats; i++) filled = filled.concat(pool);
      sessionPool = shuffle(filled).slice(0, targetWords);
    }
    setWords(sessionPool);
    setWordIndex(0);
    setBuilt([]);
    setLetters([]);
  }, [selectedDeck]);

  useEffect(() => {
    if (words.length === 0) return;
    const w = words[wordIndex];
    if (!w) return;
    setLetters(shuffle([...w.letters]));
    setBuilt([]);
  }, [words, wordIndex]);

  const currentWord = words[wordIndex];
  const handleLetter = (letter: string, idx: number) => {
    if (!currentWord) return;
    const nextBuilt = [...built, letter];
    setBuilt(nextBuilt);
    setLetters((prev) => prev.filter((_, i) => i !== idx));
    if (nextBuilt.length === currentWord.letters.length) {
      const correct = nextBuilt.join('') === currentWord.letters.join('');
      if (correct && selectedDeck) {
        const completed = wordIndex + 1;
        saveProgress(selectedDeck.id, completed).then(() => {
          setProgressMap((prev) => ({ ...prev, [selectedDeck.id]: completed }));
        });
      }
    }
  };

  const handleUndo = () => {
    if (built.length === 0) return;
    const last = built[built.length - 1];
    setBuilt((prev) => prev.slice(0, -1));
    setLetters((prev) => [...prev, last]);
  };

  const isComplete = currentWord && built.length === currentWord.letters.length;
  const isCorrect = currentWord && built.join('') === currentWord.letters.join('');

  if (!selectedDeck) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Word Builder</Text>
            <View style={styles.headerRight} />
          </View>
        <Text style={styles.description}>
          Choose a category and build Kurdish words letter by letter!
        </Text>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const completed = progressMap[item.id] || 0;
            const targetWords = item.id === 'master' ? 30 : 20;
            const pct = targetWords ? Math.round((completed / targetWords) * 100) : 0;
            const isDone = completed >= targetWords;
            return (
              <CategoryCard
                title={item.name}
                subtitle={item.id === 'master' ? '30 words' : '20 words'}
                icon={item.icon}
                progressPercent={pct}
                isCompleted={!!isDone}
                onPress={() => setSelectedDeck(item)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
        </SafeAreaView>
      </View>
    );
  }

  if (!currentWord) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>All words built!</Text>
          <Pressable style={styles.doneBtn} onPress={() => setSelectedDeck(null)}>
            <Text style={styles.doneBtnText}>Back to Categories</Text>
          </Pressable>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => setSelectedDeck(null)} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {selectedDeck.icon} {selectedDeck.name}
          </Text>
          <View style={styles.headerRight} />
        </View>
      <Text style={styles.progressText}>
        Word {wordIndex + 1} / {words.length}
      </Text>
      <View style={styles.quizArea}>
        <Text style={styles.englishHint}>{currentWord.english}</Text>
        <View style={styles.builtRow}>
          {built.map((l, i) => (
            <View key={i} style={styles.builtCell}>
              <Text style={styles.builtLetter}>{l}</Text>
            </View>
          ))}
        </View>
        {isComplete && (
          <Text style={[styles.resultText, isCorrect ? styles.resultCorrect : styles.resultWrong]}>
            {isCorrect ? '✓ Correct!' : '✗ Try again'}
          </Text>
        )}
        <View style={styles.lettersRow}>
          {letters.map((l, i) => (
            <Pressable
              key={`${l}-${i}`}
              style={styles.letterBtn}
              onPress={() => handleLetter(l, i)}
            >
              <Text style={styles.letterBtnText}>{l}</Text>
            </Pressable>
          ))}
        </View>
        {built.length > 0 && !isComplete && (
          <Pressable style={styles.undoBtn} onPress={handleUndo}>
            <Text style={styles.undoBtnText}>Undo</Text>
          </Pressable>
        )}
        {isComplete && (
          <Pressable
            style={styles.nextBtn}
            onPress={() => setWordIndex((i) => i + 1)}
          >
            <Text style={styles.nextBtnText}>
              {wordIndex + 1 >= words.length ? 'Finish' : 'Next word'}
            </Text>
          </Pressable>
        )}
      </View>
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: TEXT_PRIMARY, letterSpacing: -0.5 },
  headerRight: { width: 44 },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: { paddingBottom: 40, paddingTop: 4 },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 12,
  },
  quizArea: { padding: 16, flex: 1 },
  englishHint: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  builtRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    minHeight: 48,
  },
  builtCell: {
    width: 40,
    height: 48,
    borderRadius: 8,
    backgroundColor: BRAND_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  builtLetter: { fontSize: 20, fontWeight: '700', color: '#ffffff' },
  resultText: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  resultCorrect: { color: '#10b981' },
  resultWrong: { color: '#ef4444' },
  lettersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  letterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBtnText: { fontSize: 18, fontWeight: '600', color: '#111827' },
  undoBtn: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  undoBtnText: { fontSize: 14, color: '#6b7280' },
  nextBtn: {
    marginTop: 24,
    backgroundColor: BRAND_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  doneWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  doneEmoji: { fontSize: 56, marginBottom: 16 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24 },
  doneBtn: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
