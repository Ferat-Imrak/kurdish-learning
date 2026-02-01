import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { stories } from '../../lib/data/stories';
import { useStoriesProgressStore } from '../../lib/store/storiesProgressStore';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';
const BRAND_BLUE = '#3A86FF';

export default function StoriesScreen() {
  const router = useRouter();
  const hydrate = useStoriesProgressStore((s) => s.hydrate);
  const isRead = useStoriesProgressStore((s) => s.isRead);
  const readCount = useStoriesProgressStore((s) => s.readCount);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const totalRead = readCount();

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={[SKY, SKY_DEEPER, SKY]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Stories</Text>
        </View>
        <Text style={styles.subtitle} numberOfLines={2}>
          {totalRead > 0
            ? `${totalRead}/${stories.length} read`
            : 'Read short stories to practice Kurdish.'}
        </Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.section}>
          {stories.map((story) => {
            const read = isRead(story.id);
            return (
              <Pressable
                key={story.id}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                onPress={() => router.push(`/stories/${story.id}` as any)}
                android_ripple={{ color: 'rgba(58, 134, 255, 0.1)' }}
              >
                <View style={styles.iconBadge}>
                  <Ionicons name="book" size={24} color={BRAND_BLUE} />
                </View>
                <View style={styles.content}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {story.title}
                  </Text>
                  <Text style={styles.summary} numberOfLines={2}>
                    {story.summary}
                  </Text>
                  {read && (
                    <View style={styles.readBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                      <Text style={styles.readText}>Read</Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={BRAND_BLUE} />
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
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.85,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${BRAND_BLUE}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  summary: {
    fontSize: 13,
    color: '#6b7280',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  readText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
});
