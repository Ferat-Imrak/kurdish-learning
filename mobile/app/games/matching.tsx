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
} from '../../lib/data/game-data';

const BRAND_BLUE = '#3A86FF';

type Item = { id: string; left: string; right: string };

function getIcon(category: string, english: string): string {
  const iconMap: Record<string, Record<string, string>> = {
    colors: { Red: '🔴', Green: '🟢', Blue: '🔵', Yellow: '🟡', Orange: '🟠', Purple: '🟣', Black: '⚫', White: '⚪', Gray: '⬜', Gold: '🟨', Silver: '🔘' },
    animals: { Cat: '🐱', Dog: '🐶', Bird: '🐦', Cow: '🐮', Horse: '🐴', Fish: '🐟', Lion: '🦁', Rabbit: '🐰', Chicken: '🐔', Mouse: '🐭', Duck: '🦆', Pig: '🐷', Sheep: '🐑', Goat: '🐐', Elephant: '🐘', Monkey: '🐵', Wolf: '🐺', Snake: '🐍', Bear: '🐻', Fox: '🦊', Butterfly: '🦋', Owl: '🦉', Turkey: '🦃', Crow: '🐦‍⬛' },
    food: { Apple: '🍎', Bread: '🍞', Water: '💧', Tea: '🍵', Milk: '🥛', Egg: '🥚', Meat: '🥩', Rice: '🍚', Coffee: '☕', Cheese: '🧀', Fish: '🐟', Chicken: '🐔' },
    family: { Mother: '👩', Father: '👨', Sister: '👧', Brother: '👦', Family: '👨‍👩‍👧‍👦', Baby: '👶', Grandmother: '👵', Grandfather: '👴', Bride: '👰', Groom: '🤵' },
    nature: { Tree: '🌳', Flower: '🌸', Mountain: '🏔️', Sun: '☀️', Rain: '🌧️', Snow: '❄️', Wind: '💨', Cloud: '☁️' },
    time: {}, weather: {}, house: {}, numbers: {}, daysMonths: {}, questions: {}, pronouns: {}, bodyParts: {},
  };
  const map = iconMap[category];
  if (map && map[english]) return map[english];
  return CATEGORY_ICONS[category] || '📝';
}

function createItems(
  cards: Array<{ english: string; kurdish: string }>,
  category: string,
  prefix: string
): Item[] {
  return cards.map((card, i) => ({
    id: `${prefix}${i + 1}`,
    left: `${getIcon(category, card.english)} ${card.english}`,
    right: card.kurdish,
  }));
}

const categoryPools: Record<string, Item[]> = {};
MATCHING_CATEGORY_IDS.forEach((id, idx) => {
  const cards = cardsByCategoryId[id];
  if (cards?.length) {
    categoryPools[id] = createItems(cards, id, `${id.slice(0, 2)}`);
  }
});

const allItems: Item[] = MATCHING_CATEGORY_IDS.flatMap((id) => categoryPools[id] || []);

const categories = MATCHING_CATEGORY_IDS.map((id) => ({
  id,
  name: CATEGORY_DISPLAY_NAMES[id] || id,
  icon: CATEGORY_ICONS[id] || '📝',
}));

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const REQUIRED_ROUNDS = 10;
const MASTER_ROUNDS = 20;

const MATCHING_KEY = (id: string) => `matching-progress-${id}`;

export default function MatchingScreen() {
  const router = useRouter();
  const { getProgress: getGamesProgress, saveProgress: saveGamesProgress, data: gamesData } = useGamesProgressStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [deckIndex, setDeckIndex] = useState(0);
  const [leftList, setLeftList] = useState<Item[]>([]);
  const [rightList, setRightList] = useState<Item[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const getProgress = (categoryId: string): number => {
    const raw = getGamesProgress(MATCHING_KEY(categoryId));
    return typeof raw === 'number' ? raw : 0;
  };

  const saveProgress = async (categoryId: string, rounds: number) => {
    const cur = getProgress(categoryId);
    const best = Math.max(cur, rounds);
    await saveGamesProgress(MATCHING_KEY(categoryId), best);
    setProgressMap((prev) => ({ ...prev, [categoryId]: best }));
  };

  useEffect(() => {
    const map: Record<string, number> = {};
    for (const c of categories) map[c.id] = getProgress(c.id);
    map['master'] = getProgress('master');
    setProgressMap(map);
  }, [gamesData]);

  useEffect(() => {
    if (!selectedCategory) return;
    const items =
      selectedCategory === 'master'
        ? allItems
        : categoryPools[selectedCategory] || [];
    const size = Math.min(4, Math.max(2, items.length));
    const candidates = shuffle(items).slice(0, size);
    setLeftList(candidates);
    setRightList(shuffle(candidates));
    setMatched({});
    setSelectedLeft(null);
    setCompleted(false);
  }, [selectedCategory, deckIndex]);

  useEffect(() => {
    if (
      leftList.length > 0 &&
      leftList.every((it) => matched[it.id])
    ) {
      setCompleted(true);
      if (selectedCategory) {
        const id = selectedCategory === 'master' ? 'master' : selectedCategory;
        const rounds = deckIndex + 1;
        saveProgress(id, rounds);
        const required = selectedCategory === 'master' ? MASTER_ROUNDS : REQUIRED_ROUNDS;
        if (rounds < required) {
          setTimeout(() => setDeckIndex((i) => i + 1), 800);
        }
      }
    }
  }, [matched, leftList, selectedCategory, deckIndex]);

  const handleRight = (id: string) => {
    if (!selectedLeft) return;
    if (selectedLeft === id) {
      setMatched((m) => ({ ...m, [id]: true }));
      setSelectedLeft(null);
    } else {
      setSelectedLeft(null);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    const items =
      categoryId === 'master' ? allItems : categoryPools[categoryId] || [];
    if (items.length < 2) return;
    setSelectedCategory(categoryId);
    setDeckIndex(0);
  };

  const requiredRounds = selectedCategory === 'master' ? MASTER_ROUNDS : REQUIRED_ROUNDS;
  const roundComplete =
    selectedCategory && leftList.length > 0 && leftList.every((it) => matched[it.id]);

  if (!selectedCategory) {
    const list = [
      ...categories.map((c) => ({
        ...c,
        count: categoryPools[c.id]?.length ?? 0,
        progress: progressMap[c.id] ?? 0,
        required: REQUIRED_ROUNDS,
      })),
      {
        id: 'master',
        name: 'Master Challenge',
        icon: '🏆',
        count: allItems.length,
        progress: progressMap['master'] ?? 0,
        required: MASTER_ROUNDS,
      },
    ].filter((x) => x.count >= 2);

    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Word Matching</Text>
            <View style={styles.headerRight} />
          </View>
          <Text style={styles.description}>
          Choose a category to match Kurdish words with pictures!
        </Text>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isDone = item.progress >= item.required;
            const pct = Math.min(100, Math.round((item.progress / item.required) * 100));
            return (
              <CategoryCard
                title={item.name}
                subtitle={item.id === 'master' ? '20 rounds' : '10 rounds'}
                icon={item.icon}
                progressPercent={pct}
                isCompleted={isDone}
                onPress={() => handleCategorySelect(item.id)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
        />
        </SafeAreaView>
      </View>
    );
  }

  const currentCategory =
    selectedCategory === 'master'
      ? { name: 'Master Challenge', icon: '🏆' }
      : categories.find((c) => c.id === selectedCategory);

  const allRoundsDone = roundComplete && deckIndex + 1 >= requiredRounds;

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              setSelectedCategory(null);
              setDeckIndex(0);
            }}
            style={styles.backHit}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {currentCategory?.icon} {currentCategory?.name}
          </Text>
          <View style={styles.headerRight} />
        </View>

      <Text style={styles.roundText}>
        Round {deckIndex + 1} / {requiredRounds}
        {roundComplete ? ' • Great job!' : ''}
      </Text>

      {allRoundsDone ? (
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>Category complete!</Text>
          <Pressable
            style={styles.doneBtn}
            onPress={() => {
              setSelectedCategory(null);
              setDeckIndex(0);
            }}
          >
            <Text style={styles.doneBtnText}>Back to Categories</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.half}>
            <Text style={styles.halfTitle}>English & Picture</Text>
            {leftList.map((it) => (
              <Pressable
                key={it.id}
                onPress={() => !matched[it.id] && setSelectedLeft(it.id)}
                style={[
                  styles.option,
                  selectedLeft === it.id && styles.optionSelected,
                  matched[it.id] && styles.optionMatched,
                ]}
                disabled={matched[it.id]}
              >
                <Text style={styles.optionText}>{it.left}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.half}>
            <Text style={styles.halfTitle}>Kurdish</Text>
            {rightList.map((it) => (
              <Pressable
                key={it.id}
                onPress={() => handleRight(it.id)}
                style={[
                  styles.option,
                  styles.optionRight,
                  matched[it.id] && styles.optionCorrect,
                ]}
                disabled={matched[it.id]}
              >
                <Text style={styles.optionText}>{it.right}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
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
  roundText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginVertical: 12,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  half: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  halfTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: BRAND_BLUE,
    backgroundColor: 'rgba(58, 134, 255, 0.08)',
  },
  optionMatched: {
    opacity: 0.6,
  },
  optionRight: {},
  optionCorrect: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  optionText: {
    fontSize: 15,
    color: '#111827',
  },
  doneWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  doneEmoji: { fontSize: 56, marginBottom: 16 },
  doneTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  doneBtn: {
    backgroundColor: BRAND_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
