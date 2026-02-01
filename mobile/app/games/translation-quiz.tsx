import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
import { useGamesProgressStore } from '../../lib/store/gamesProgressStore';
import CategoryCard from '../components/CategoryCard';
import {
  cardsByCategoryId,
  MATCHING_CATEGORY_IDS,
  CATEGORY_ICONS,
  CATEGORY_DISPLAY_NAMES,
  allCards,
  type Card,
} from '../../lib/data/game-data';

const BRAND_BLUE = '#3A86FF';

type QuizItem = { kurdish: string; english: string; image: string };

function getIcon(category: string, english: string): string {
  const iconMap: Record<string, Record<string, string>> = {
    colors: { Red: '🔴', Green: '🟢', Blue: '🔵', Yellow: '🟡', Orange: '🟠', Purple: '🟣', Black: '⚫', White: '⚪', Gray: '⬜', Gold: '🟨', Silver: '🔘' },
    animals: { Cat: '🐱', Dog: '🐶', Bird: '🐦', Cow: '🐮', Horse: '🐴', Fish: '🐟', Lion: '🦁', Rabbit: '🐰', Chicken: '🐔', Mouse: '🐭', Duck: '🦆', Pig: '🐷' },
    food: { Apple: '🍎', Bread: '🍞', Water: '💧', Tea: '🍵', Milk: '🥛', Egg: '🥚', Meat: '🥩', Rice: '🍚', Coffee: '☕' },
    family: { Mother: '👩', Father: '👨', Sister: '👧', Brother: '👦', Family: '👨‍👩‍👧‍👦', Baby: '👶' },
    nature: { Tree: '🌳', Flower: '🌸', Mountain: '🏔️', Sun: '☀️', Rain: '🌧️', Snow: '❄️' },
    time: {}, weather: {}, house: {}, numbers: {}, daysMonths: {}, questions: {}, pronouns: {}, bodyParts: {},
  };
  const map = iconMap[category];
  if (map?.[english]) return map[english];
  return CATEGORY_ICONS[category] || '📝';
}

function createQuizItems(cards: Card[], category: string): QuizItem[] {
  return cards.map((c) => ({
    kurdish: c.kurdish,
    english: c.english.toLowerCase(),
    image: getIcon(category, c.english),
  }));
}

const categoryDecks = MATCHING_CATEGORY_IDS.map((id) => {
  const cards = cardsByCategoryId[id];
  const items = cards?.length ? createQuizItems(cards, id) : [];
  return {
    id,
    name: CATEGORY_DISPLAY_NAMES[id] || id,
    icon: CATEGORY_ICONS[id] || '📝',
    items,
  };
}).filter((d) => d.items.length >= 4);

const masterItems = createQuizItems(allCards, 'colors');

const decks = [
  ...categoryDecks,
  {
    id: 'master',
    name: CATEGORY_DISPLAY_NAMES.master,
    icon: CATEGORY_ICONS.master,
    items: masterItems.length >= 4 ? masterItems : categoryDecks.flatMap((d) => d.items),
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

const PICTUREQUIZ_KEY = (id: string) => `picturequiz-progress-${id}`;

export default function PictureQuizScreen() {
  const router = useRouter();
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress, data: gamesData } = useGamesProgressStore();
  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);
  const [items, setItems] = useState<QuizItem[]>([]);
  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, { score: number; total: number }>>({});

  const getProgress = (categoryId: string): { score: number; total: number } | null => {
    const raw = getGamesProgress(PICTUREQUIZ_KEY(categoryId));
    if (!raw || typeof raw !== 'object' || !('score' in (raw as object))) return null;
    return raw as { score: number; total: number };
  };

  const saveProgress = async (categoryId: string, score: number, total: number) => {
    const cur = getProgress(categoryId);
    if (!cur || score / total > cur.score / cur.total) {
      await saveGamesProgress(PICTUREQUIZ_KEY(categoryId), { score, total });
      setProgressMap((prev) => ({ ...prev, [categoryId]: { score, total } }));
    }
  };

  useEffect(() => {
    const map: Record<string, { score: number; total: number }> = {};
    for (const d of decks) {
      const p = getProgress(d.id);
      if (p) map[d.id] = p;
    }
    setProgressMap(map);
  }, [gamesData]);

  useEffect(() => {
    if (!selectedDeck) return;
    const questionCount = selectedDeck.id === 'master' ? 50 : 25;
    const shuffled = shuffle(selectedDeck.items);
    const sessionItems = shuffled.length >= questionCount
      ? shuffled.slice(0, questionCount)
      : shuffled;
    setItems(sessionItems);
    setIndex(0);
    setScore(0);
    setAnswered(false);
  }, [selectedDeck]);

  useEffect(() => {
    if (items.length === 0) return;
    const current = items[index];
    if (!current) return;
    const wrong = items
      .filter((x) => x.kurdish !== current.kurdish)
      .map((x) => x.kurdish);
    const opts = shuffle([
      current.kurdish,
      ...shuffle(wrong).slice(0, 3),
    ]).slice(0, 4);
    setOptions(opts);
    setAnswered(false);
    setSelectedChoice(null);
  }, [items, index]);

  const handleAnswer = (choice: string) => {
    if (answered) return;
    setSelectedChoice(choice);
    setAnswered(true);
    const correct = items[index]?.kurdish === choice;
    if (correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= items.length) {
      const total = items.length;
      if (selectedDeck) {
        saveProgress(selectedDeck.id, score, total).then(() => {
          setProgressMap((prev) => ({
            ...prev,
            [selectedDeck.id]: { score, total },
          }));
        });
      }
      setShowResult(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  if (!selectedDeck) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Translation Quiz</Text>
            <View style={styles.headerRight} />
          </View>
        <Text style={styles.description}>
          Choose a category and translate English words to Kurdish!
        </Text>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const p = progressMap[item.id];
            const pct = p ? Math.round((p.score / p.total) * 100) : 0;
            const isDone = p && p.score / p.total >= 0.8;
            return (
              <CategoryCard
                title={item.name}
                subtitle={item.id === 'master' ? '50 questions' : '25 questions'}
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

  const current = items[index];
  const isLast = index >= items.length - 1;

  if (showResult) {
    const total = items.length;
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Quiz complete!</Text>
          <Text style={styles.doneSub}>Score: {score} / {total}</Text>
          <Pressable
            style={styles.doneBtn}
            onPress={() => {
              setShowResult(false);
              setSelectedDeck(null);
            }}
          >
            <Text style={styles.doneBtnText}>Back to Categories</Text>
          </Pressable>
        </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Quiz complete!</Text>
          <Text style={styles.doneSub}>Score: {score} / {items.length}</Text>
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
        Question {index + 1} / {items.length} • Score: {score}
      </Text>
      <ScrollView contentContainerStyle={styles.quizContent}>
        <View style={styles.questionCard}>
          <Text style={styles.questionEmoji}>{current.image}</Text>
          <Text style={styles.questionText}>{current.english}</Text>
        </View>
        <Text style={styles.chooseLabel}>Choose the Kurdish word:</Text>
        {options.map((opt) => {
          const correctChoice = answered && opt === current.kurdish;
          const wrongChoice = answered && selectedChoice === opt && opt !== current.kurdish;
          return (
            <Pressable
              key={opt}
              style={[
                styles.optionBtn,
                correctChoice && styles.optionCorrect,
                wrongChoice && styles.optionWrong,
              ]}
              onPress={() => handleAnswer(opt)}
              disabled={answered}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          );
        })}
        {answered && (
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{isLast ? 'See Score' : 'Next'}</Text>
          </Pressable>
        )}
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
  quizContent: { padding: 16, paddingBottom: 40 },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  questionEmoji: { fontSize: 56, marginBottom: 12 },
  questionText: { fontSize: 22, fontWeight: '700', color: '#111827' },
  chooseLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  optionBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' },
  optionText: { fontSize: 16, color: '#111827' },
  nextBtn: {
    marginTop: 20,
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
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  doneSub: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  doneBtn: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
});
