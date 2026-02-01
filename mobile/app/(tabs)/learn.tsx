import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';
import { useProgressStore } from '../../lib/store/progressStore';
import { LESSONS, getLessonRoute, getLessonIcon, Lesson } from '../../lib/data/lessons';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';

// Standard color for all lessons: blue when in progress, green when completed
const getLessonColor = (completed: boolean): string => {
  return completed ? '#10b981' : '#2563eb'; // Green when completed, blue otherwise
};

export default function LearnScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    lessonProgress, 
    isLoading, 
    getLessonProgress, 
    initialize 
  } = useProgressStore();

  useEffect(() => {
    if (isAuthenticated) {
      initialize();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/' as any);
    }
  }, [isAuthenticated]);

  // Calculate progress statistics
  const progressStats = useMemo(() => {
    return LESSONS.reduce(
      (acc, lesson) => {
        const progress = getLessonProgress(lesson.id);
        if (progress.status === 'COMPLETED') {
          acc.completed++;
        } else if (progress.status === 'IN_PROGRESS') {
          acc.inProgress++;
        } else {
          acc.notStarted++;
        }
        return acc;
      },
      { completed: 0, inProgress: 0, notStarted: 0 }
    );
  }, [lessonProgress, getLessonProgress]);

  // Calculate stars and achievements
  const totalStars = useMemo(() => {
    return progressStats.completed * 100 + progressStats.inProgress * 50;
  }, [progressStats]);

  const totalAchievements = useMemo(() => {
    if (progressStats.completed >= 3) return 3;
    if (progressStats.completed >= 2) return 2;
    if (progressStats.completed >= 1) return 1;
    return 0;
  }, [progressStats]);

  // Check if lesson is locked
  // TEMPORARILY DISABLED - All lessons unlocked for testing
  // TODO: Re-enable locking later
  const isLessonLocked = (lessonIndex: number): boolean => {
    // if (lessonIndex === 0) return false;
    // 
    // const previousLesson = LESSONS[lessonIndex - 1];
    // const previousProgress = getLessonProgress(previousLesson.id);
    // 
    // // Lesson is unlocked if previous lesson has 100% progress
    // // (Status should be COMPLETED, but we also unlock at 100% progress as fallback)
    // const isUnlocked = previousProgress.progress === 100;
    // 
    // return !isUnlocked;
    return false; // All lessons unlocked temporarily
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    const progress = getLessonProgress(lessonId);
    return progress.progress === 100 && progress.status === 'COMPLETED';
  };

  const handleLessonPress = (lesson: Lesson, isLocked: boolean) => {
    if (isLocked) return;
    
    const route = getLessonRoute(lesson);
    router.push(route as any);
  };

  if (isLoading) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top bar: centered Learn (no back on main Learn page) */}
          <View style={styles.topBar}>
            <Text style={styles.title}>Learn</Text>
          </View>

          {/* Achievement bar: star, trophy (centered, no arrow) */}
          <View style={styles.achievementBar}>
            <View style={styles.achievementLeft}>
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text style={styles.achievementNum}>{totalStars}</Text>
            </View>
            <View style={styles.achievementDivider} />
            <View style={styles.achievementRight}>
              <Ionicons name="trophy" size={20} color="#eab308" />
              <Text style={styles.achievementNum}>{totalAchievements}</Text>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.progressOverview}>
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#d1fae5' }]}>
              <Text style={[styles.progressNumber, { color: '#10b981' }]}>
                {progressStats.completed}
              </Text>
            </View>
            <Text style={styles.progressLabel}>Completed</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#fef3c7' }]}>
              <Text style={[styles.progressNumber, { color: '#f59e0b' }]}>
                {progressStats.inProgress}
              </Text>
            </View>
            <Text style={styles.progressLabel}>In Progress</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <View style={[styles.progressNumberContainer, { backgroundColor: '#f3f4f6' }]}>
              <Text style={[styles.progressNumber, { color: '#6b7280' }]}>
                {progressStats.notStarted}
              </Text>
            </View>
            <Text style={styles.progressLabel}>Not Started</Text>
          </View>
        </View>

          {/* Lessons List */}
          <View style={styles.lessonsSection}>
          {LESSONS.map((lesson, index) => {
            const locked = isLessonLocked(index);
            const completed = isLessonCompleted(lesson.id);
            const progress = getLessonProgress(lesson.id);
            const color = getLessonColor(completed);
            const icon = getLessonIcon(lesson);

            return (
              <Pressable
                key={lesson.id}
                onPress={() => handleLessonPress(lesson, locked)}
                disabled={locked}
                style={({ pressed }) => [
                  styles.lessonCard,
                  locked && styles.lessonCardLocked,
                  pressed && !locked && styles.lessonCardPressed,
                ]}
              >
                {/* Content */}
                <View style={styles.lessonContent}>
                  <View style={styles.lessonHeader}>
                    <View style={styles.lessonTitleRow}>
                      <Text style={styles.lessonTitle} numberOfLines={1}>
                        {lesson.title}
                      </Text>
                      <View style={styles.lessonIconBadge}>
                        <Text style={styles.lessonIconBadgeText} numberOfLines={1}>
                          {icon}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar (no percentage text) */}
                  {!locked && progress.progress > 0 && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <LinearGradient
                          colors={[color, color + 'DD']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.progressFill, { width: `${progress.progress}%` }]}
                        />
                      </View>
                    </View>
                  )}

                  {/* Action Button */}
                  <View style={styles.actionButton}>
                    {locked ? (
                      <View style={styles.actionButtonLocked}>
                        <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                        <Text style={styles.actionButtonLockedText}>Locked</Text>
                      </View>
                    ) : (
                      <LinearGradient
                        colors={completed ? ['#10b981', '#059669'] : ['#2563eb', '#1d4ed8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButtonGradient}
                      >
                        <Ionicons
                          name={
                            completed
                              ? 'checkmark-circle'
                              : progress.status === 'IN_PROGRESS'
                              ? 'play-circle'
                              : 'play'
                          }
                          size={18}
                          color="#ffffff"
                        />
                        <Text style={styles.actionButtonText}>
                          {completed
                            ? 'Completed'
                            : progress.status === 'IN_PROGRESS'
                            ? 'Continue'
                            : 'Start'}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  // Top bar: back + Learn
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
  // Achievement bar (centered, no arrow)
  achievementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementNum: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  achievementDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
  },
  achievementRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Progress Overview
  progressOverview: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 4,
    paddingVertical: 24,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressNumberContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    height: 60,
    alignSelf: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Lessons Section
  lessonsSection: {
    paddingHorizontal: 20,
  },
  // Lesson Card
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  lessonCardLocked: {
    opacity: 0.6,
    backgroundColor: '#f9fafb',
  },
  lessonCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    marginBottom: 8,
  },
  lessonTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  lessonIconBadge: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconBadgeText: {
    fontSize: 22,
  },
  lessonDescription: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionButton: {
    marginTop: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonLockedText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
});
