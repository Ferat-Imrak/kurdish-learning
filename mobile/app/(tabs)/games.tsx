import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const games = [
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Learn vocabulary with interactive flashcards',
    icon: '📚',
    color: '#3A86FF',
    route: '/games/flashcards' as any,
  },
  // More games will be added here
];

export default function GamesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Games</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Practice and learn Kurdish vocabulary through fun interactive games!
        </Text>

        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <Pressable
              key={game.id}
              onPress={() => router.push(game.route)}
              style={({ pressed }) => [
                styles.gameCard,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.gameIcon}>{game.icon}</Text>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              <View style={[styles.gameArrow, { backgroundColor: game.color }]}>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>More Games Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            We're working on adding more fun games to help you learn Kurdish.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  gamesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  pressed: {
    opacity: 0.7,
  },
  gameIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  gameArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});


