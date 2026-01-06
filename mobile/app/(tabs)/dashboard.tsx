import React from 'react';
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
import { useAuthStore } from '../../lib/store/authStore';
import PageHeader from '../components/PageHeader';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
    }
    // Don't redirect if already on index - this component is rendered by index.tsx
  }, [isAuthenticated]);

  const quickActions = [
    { icon: 'book-outline', title: 'Continue Learning', color: '#3b82f6', route: '/(tabs)/learn' },
    { icon: 'game-controller-outline', title: 'Play Games', color: '#10b981', route: '/(tabs)/games' },
  ];

  const recentLessons = [
    { id: '1', title: 'Alphabet', progress: 75 },
    { id: '2', title: 'Numbers', progress: 50 },
    { id: '3', title: 'Days of the Week', progress: 100 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <PageHeader variant="dashboard" />

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#2563eb" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#ef4444" />
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Lessons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/learn' as any)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {recentLessons.map((lesson) => (
            <Pressable
              key={lesson.id}
              style={({ pressed }) => [
                styles.lessonCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.lessonContent}>
                <View style={styles.lessonIcon}>
                  <Ionicons name="book-outline" size={24} color="#2563eb" />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${lesson.progress}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{lesson.progress}% Complete</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
