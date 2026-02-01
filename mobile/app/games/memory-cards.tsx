import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
  Dimensions,
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
  MEMORY_CARD_CATEGORY_IDS,
  CATEGORY_ICONS,
  CATEGORY_DISPLAY_NAMES,
  allCards,
  type Card,
} from '../../lib/data/game-data';

const BRAND_BLUE = '#3A86FF';
const { width } = Dimensions.get('window');
const CARD_GAP = 5;
const PADDING = 12;
const COLS = 4;
const CARD_SIZE = (width - PADDING * 2 - CARD_GAP * (COLS + 1)) / COLS;

type CardPair = { kurdish: string; english: string; image: string };
type GameCard = CardPair & { id: string; pairId: number; type: 'kurdish' | 'image' };

function getIcon(category: string, english: string): string {
  const iconMap: Record<string, Record<string, string>> = {
    colors: { Red: '🔴', Green: '🟢', Blue: '🔵', Yellow: '🟡', Orange: '🟠', Purple: '🟣', Black: '⚫', White: '⚪', Gray: '⬜', Gold: '🟨', Silver: '🔘' },
    animals: { Cat: '🐱', Dog: '🐶', Bird: '🐦', Cow: '🐮', Horse: '🐴', Fish: '🐟', Lion: '🦁', Rabbit: '🐰', Chicken: '🐔', Mouse: '🐭', Duck: '🦆', Pig: '🐷' },
    food: { Apple: '🍎', Bread: '🍞', Water: '💧', Tea: '🍵', Milk: '🥛', Egg: '🥚', Meat: '🥩', Rice: '🍚', Coffee: '☕' },
    nature: { Tree: '🌳', Flower: '🌸', Mountain: '🏔️', Sun: '☀️', Rain: '🌧️', Snow: '❄️' },
    weather: { Weather: '🌤️', Sun: '☀️', Rain: '🌧️', Snow: '❄️', Wind: '💨', Hot: '🌡️', Cold: '🧊' },
    house: { House: '🏠', Room: '🚪', Door: '🚪', Window: '🪟', Bed: '🛏️', Chair: '🪑' },
    numbers: { One: '1️⃣', Two: '2️⃣', Three: '3️⃣', Four: '4️⃣', Five: '5️⃣', Six: '6️⃣', Seven: '7️⃣', Eight: '8️⃣', Nine: '9️⃣', Ten: '🔟' },
    bodyParts: { Head: '👤', Eye: '👁️', Ear: '👂', Nose: '👃', Mouth: '👄', Hand: '✋', Leg: '🦵', Foot: '🦶' },
  };
  const map = iconMap[category];
  if (map?.[english]) return map[english];
  return CATEGORY_ICONS[category] || '📝';
}

function createCardPairs(cards: Card[], category: string): CardPair[] {
  return cards.map((c) => ({
    kurdish: c.kurdish,
    english: c.english.toLowerCase(),
    image: getIcon(category, c.english),
  }));
}

const categoryDecks = MEMORY_CARD_CATEGORY_IDS.map((id) => {
  const cards = cardsByCategoryId[id];
  const pairs = cards?.length ? createCardPairs(cards, id) : [];
  return {
    id,
    name: CATEGORY_DISPLAY_NAMES[id] || id,
    icon: CATEGORY_ICONS[id] || '📝',
    pairs,
  };
}).filter((d) => d.pairs.length >= 2);

const masterPairs = createCardPairs(allCards, 'colors');

const decks: { id: string; name: string; icon: string; pairs: CardPair[] }[] = [
  ...categoryDecks,
  {
    id: 'master',
    name: CATEGORY_DISPLAY_NAMES.master,
    icon: CATEGORY_ICONS.master,
    pairs: masterPairs.length >= 2 ? masterPairs : categoryDecks.flatMap((d) => d.pairs),
  },
];

const MAX_PAIRS_PER_GAME = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildGameCards(pairs: CardPair[]): GameCard[] {
  const cards: GameCard[] = [];
  pairs.forEach((p, i) => {
    cards.push({
      ...p,
      id: `k-${i}`,
      pairId: i,
      type: 'kurdish',
    });
    cards.push({
      ...p,
      id: `i-${i}`,
      pairId: i,
      type: 'image',
    });
  });
  return shuffle(cards);
}

const getProgress = async (categoryId: string): Promise<boolean> => {
  try {
    const s = await AsyncStorage.getItem(`memorycards-progress-${categoryId}`);
    return s ? JSON.parse(s) : false;
  } catch {
    return false;
  }
};

const saveProgress = async (categoryId: string) => {
  try {
    await AsyncStorage.setItem(
      `memorycards-progress-${categoryId}`,
      JSON.stringify(true)
    );
  } catch {}
};

export default function MemoryCardsScreen() {
  const router = useRouter();
  const [selectedDeck, setSelectedDeck] = useState<typeof decks[0] | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [lastTwo, setLastTwo] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const map: Record<string, boolean> = {};
      for (const d of decks) {
        map[d.id] = await getProgress(d.id);
      }
      setProgressMap(map);
    })();
  }, []);

  useEffect(() => {
    if (!selectedDeck) return;
    const pairs = selectedDeck.pairs;
    const pairsToUse =
      pairs.length <= MAX_PAIRS_PER_GAME
        ? pairs
        : shuffle([...pairs]).slice(0, MAX_PAIRS_PER_GAME);
    setCards(buildGameCards(pairsToUse));
    setFlipped(new Set());
    setMatched(new Set());
    setLastTwo([]);
  }, [selectedDeck]);

  const handlePress = (id: string, pairId: number) => {
    if (flipped.has(id) || matched.has(pairId) || lastTwo.length >= 2) return;
    const next = [...lastTwo, id];
    setLastTwo(next);
    setFlipped((prev) => new Set([...prev, id]));

    if (next.length === 2) {
      const [id1, id2] = next;
      const c1 = cards.find((c) => c.id === id1);
      const c2 = cards.find((c) => c.id === id2);
      if (c1 && c2 && c1.pairId === c2.pairId) {
        setMatched((prev) => new Set([...prev, c1.pairId]));
        setLastTwo([]);
        return;
      }
      setTimeout(() => {
        setFlipped((prev) => {
          const s = new Set(prev);
          s.delete(id1);
          s.delete(id2);
          return s;
        });
        setLastTwo([]);
      }, 600);
    }
  };

  const allMatched = selectedDeck && cards.length > 0 && matched.size === cards.length / 2;
  useEffect(() => {
    if (allMatched && selectedDeck) {
      saveProgress(selectedDeck.name);
    }
  }, [allMatched, selectedDeck]);

  if (!selectedDeck) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Memory Cards</Text>
            <View style={styles.headerRight} />
          </View>
        <Text style={styles.description}>
          Choose a category and match pairs of Kurdish words and pictures!
        </Text>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isDone = progressMap[item.id];
            return (
              <CategoryCard
                title={item.name}
                subtitle={`${Math.min(MAX_PAIRS_PER_GAME, item.pairs.length)} pairs`}
                icon={item.icon}
                progressPercent={isDone ? 100 : 0}
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

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => setSelectedDeck(null)}
            style={styles.backHit}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {selectedDeck.icon} {selectedDeck.name}
          </Text>
          <View style={styles.headerRight} />
        </View>

      {allMatched ? (
        <View style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>All pairs matched!</Text>
          <Pressable
            style={styles.doneBtn}
            onPress={() => setSelectedDeck(null)}
          >
            <Text style={styles.doneBtnText}>Back to Categories</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.gridScrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.grid}>
            {cards.map((card) => {
              const isFlipped = flipped.has(card.id) || matched.has(card.pairId);
              return (
                <Pressable
                  key={card.id}
                  style={[styles.card, { width: CARD_SIZE, height: CARD_SIZE }]}
                  onPress={() => handlePress(card.id, card.pairId)}
                >
                  {isFlipped ? (
                    <View style={styles.cardFace}>
                      <Text style={styles.cardText} numberOfLines={2}>
                        {card.type === 'image' ? card.image : card.kurdish}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.cardBack}>
                      <Text style={styles.cardBackText}>?</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
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
  scrollView: {
    flex: 1,
  },
  gridScrollContent: {
    padding: PADDING,
    paddingBottom: 40,
    flexGrow: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFace: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 134, 255, 0.08)',
  },
  cardBack: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_BLUE,
  },
  cardText: { fontSize: 11, fontWeight: '600', color: '#111827', textAlign: 'center' },
  cardBackText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
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
