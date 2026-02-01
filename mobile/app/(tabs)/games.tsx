import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../lib/store/authStore';
import { useGamesProgressStore } from '../../lib/store/gamesProgressStore';
import GameCard from '../components/GameCard';

// Theme A: design spec tokens
const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

const gamesList = [
  { id: 'flashcards', title: 'Flashcards', description: 'Learn vocabulary with interactive flashcards', icon: '📚', iconBg: '#dcfce7', route: '/games/flashcards' as any },
  { id: 'matching', title: 'Word Matching', description: 'Learn vocabulary', icon: '🔗', iconBg: '#dbeafe', route: '/games/matching' as any },
  { id: 'memory-cards', title: 'Memory Cards', description: 'Learn vocabulary', icon: '🃏', iconBg: '#fee2e2', route: '/games/memory-cards' as any },
  { id: 'translation-quiz', title: 'Translation Quiz', description: 'Learn vocabulary', icon: '🧠', iconBg: '#fce7f3', route: '/games/translation-quiz' as any },
  { id: 'word-builder', title: 'Word Builder', description: 'Learn vocabulary', icon: '✏️', iconBg: '#ffedd5', route: '/games/word-builder' as any },
  { id: 'sentence-builder', title: 'Sentence Builder', description: 'Learn vocabulary', icon: '📝', iconBg: '#ede9fe', route: '/games/sentence-builder' as any },
];

export default function GamesScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialize = useGamesProgressStore((s) => s.initialize);

  useEffect(() => {
    if (isAuthenticated) initialize();
  }, [isAuthenticated, initialize]);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={[SKY, SKY_DEEPER, SKY]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Top bar: title only */}
        <View style={styles.topBar}>
          <Text style={styles.title}>Games</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle} numberOfLines={2}>
          Practice and learn Kurdish vocabulary through fun interactive games!
        </Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.list}>
            {gamesList.map((game) => (
              <View key={game.id} style={styles.gameCardWrap}>
                <GameCard
                  title={game.title}
                  description={game.description}
                  icon={game.icon}
                  iconBg={game.iconBg}
                  onPress={() => router.push(game.route)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 44,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  list: {
    gap: 12,
  },
  gameCardWrap: {
    marginBottom: 4,
  },
});
