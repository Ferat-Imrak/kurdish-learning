import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { LESSONS } from '../../lib/data/lessons';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { lessonProgress, getLessonProgress, getRecentLessons, initialize, isSyncing, clearProgress } = useProgressStore();
  const [isClearing, setIsClearing] = React.useState(false);
  const [, forceUpdate] = React.useState(0);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
    } else {
      initialize().then(() => {
        // Force re-render after sync completes
        forceUpdate(prev => prev + 1);
      });
    }
    // Don't redirect if already on index - this component is rendered by index.tsx
  }, [isAuthenticated, initialize]);

  // Calculate statistics from actual progress
  const stats = useMemo(() => {
    // Debug: Log current progress
    console.log('📊 Dashboard: Calculating stats from progress:', Object.keys(lessonProgress).length, 'lessons');
    if (lessonProgress['1']) {
      console.log('📊 Dashboard: Alphabet (lesson 1) progress:', lessonProgress['1']);
    }

    const completed = LESSONS.filter(lesson => {
      const progress = getLessonProgress(lesson.id);
      return progress.status === 'COMPLETED';
    }).length;

    const inProgress = LESSONS.filter(lesson => {
      const progress = getLessonProgress(lesson.id);
      return progress.status === 'IN_PROGRESS';
    }).length;

    // Calculate achievements based on completed lessons
    let achievements = 0;
    if (completed >= 10) achievements = 5;
    else if (completed >= 7) achievements = 4;
    else if (completed >= 5) achievements = 3;
    else if (completed >= 3) achievements = 2;
    else if (completed >= 1) achievements = 1;

    // Calculate day streak (simplified - count consecutive days with activity)
    // For now, we'll use a simple calculation based on recent activity
    const dayStreak = 0; // TODO: Implement proper streak calculation

    return {
      totalLessons: LESSONS.length,
      completed,
      inProgress,
      achievements,
      dayStreak,
    };
  }, [lessonProgress, getLessonProgress]);

  // Get recent lessons from progress store
  const recentLessons = useMemo(() => {
    const recent = getRecentLessons()
      .slice(0, 3)
      .map(progress => {
        const lesson = LESSONS.find(l => l.id === progress.lessonId);
        return {
          id: progress.lessonId,
          title: lesson?.title || 'Unknown Lesson',
          progress: progress.progress,
        };
      });

    // If we don't have enough recent lessons, show in-progress lessons
    if (recent.length < 3) {
      const inProgressLessons = LESSONS.filter(lesson => {
        const progress = getLessonProgress(lesson.id);
        return progress.status === 'IN_PROGRESS' && !recent.find(r => r.id === lesson.id);
      })
        .slice(0, 3 - recent.length)
        .map(lesson => {
          const progress = getLessonProgress(lesson.id);
          return {
            id: lesson.id,
            title: lesson.title,
            progress: progress.progress,
          };
        });
      return [...recent, ...inProgressLessons].slice(0, 3);
    }

    return recent;
  }, [lessonProgress, getRecentLessons, getLessonProgress]);

  const quickActions = [
    { icon: 'book-outline', title: 'Continue Learning', color: '#3b82f6', route: '/(tabs)/learn' },
    { icon: 'game-controller-outline', title: 'Play Games', color: '#10b981', route: '/(tabs)/games' },
  ];

  const displayName = (() => {
    const raw = user?.username || user?.name || 'Ready to learn?';
    if (!raw || raw === 'Ready to learn?') return raw;
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  })();

  const handleClearProgress = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    try {
      await clearProgress();
      // Re-initialize to refresh the UI
      await initialize();
      forceUpdate(prev => prev + 1);
      console.log('✅ Progress cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing progress:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={[SKY, SKY_DEEPER, SKY]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.contentWrap}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/peyvi-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.welcomeContainer} pointerEvents="none">
              <Text style={styles.greeting}>Welcome back!</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
            <View style={styles.headerSpacer} />
            <Pressable
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}
            >
              <Ionicons name="person-circle-outline" size={32} color="#2563eb" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="book" size={24} color="#2563eb" />
            <Text style={styles.statValue}>{stats.totalLessons}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.achievements}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Achievements</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#ef4444" />
            <Text style={styles.statValue}>{stats.dayStreak}</Text>
            <Text style={styles.statLabel} numberOfLines={1}>Day Streak</Text>
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
          {recentLessons.length > 0 ? (
            recentLessons.map((lesson) => (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [
                  styles.lessonCard,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  // Navigate to the lesson - we need to import getLessonRoute
                  const lessonData = LESSONS.find(l => l.id === lesson.id);
                  if (lessonData) {
                    // For now, navigate to learn screen - individual lesson navigation can be added later
                    router.push('/(tabs)/learn' as any);
                  }
                }}
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
                    <Text style={styles.progressText}>{Math.round(lesson.progress)}% Complete</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No lessons started yet</Text>
              <Text style={styles.emptyStateSubtext}>Start learning to see your progress here</Text>
            </View>
          )}
        </View>

        {/* Development: Clear Progress Button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing Tools</Text>
          <Pressable
            onPress={handleClearProgress}
            disabled={isClearing}
            style={({ pressed }) => [
              styles.clearButton,
              (pressed || isClearing) && styles.clearButtonPressed,
            ]}
          >
            <Ionicons name="trash-outline" size={20} color="#ffffff" />
            <Text style={styles.clearButtonText}>
              {isClearing ? 'Clearing...' : 'Clear All Progress'}
            </Text>
          </Pressable>
          <Text style={styles.clearButtonWarning}>
            ⚠️ This will delete all your progress. Use for testing only.
          </Text>
        </View>

          </ScrollView>
        </View>
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
  contentWrap: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 20,
    minHeight: 56,
    position: 'relative',
  },
  logoContainer: {
    alignSelf: 'center',
    marginLeft: -36,
  },
  logo: {
    width: 120,
    height: 40,
  },
  welcomeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  headerSpacer: {
    flex: 1,
    minWidth: 0,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
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
    fontSize: 11,
    color: '#6b7280',
  },
  section: {
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
    color: TEXT_PRIMARY,
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
    fontSize: 11,
    color: '#6b7280',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButtonWarning: {
    fontSize: 12,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
