import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../lib/store/authStore';

const { width } = Dimensions.get('window');

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

export default function LandingScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const initCalledRef = useRef(false);

  // Initialize auth ONCE - use getState to avoid subscriptions
  React.useEffect(() => {
    if (!initCalledRef.current) {
      initCalledRef.current = true;
      useAuthStore.getState().initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check auth and redirect - subscribe to auth changes
  const redirectAttemptedRef = React.useRef(false);
  const isNavigatingRef = React.useRef(false);
  const isLoggingOutRef = React.useRef(false);
  
  React.useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      // Track if logout is in progress
      if (state.isLoggingOut) {
        isLoggingOutRef.current = true;
      } else if (!state.isLoggingOut && isLoggingOutRef.current) {
        // Logout just completed - reset flag after a delay
        setTimeout(() => {
          isLoggingOutRef.current = false;
        }, 2000);
      }
      
      // Only redirect if authenticated AND not already redirected AND not currently navigating AND not logging out
      // IMPORTANT: Don't redirect if we just logged out (isLoggingOutRef is true)
      if (!state.isLoading && state.isAuthenticated && !redirectAttemptedRef.current && !isNavigatingRef.current && !isLoggingOutRef.current) {
        redirectAttemptedRef.current = true;
        isNavigatingRef.current = true;
        router.replace('/(tabs)/' as any);
        // Reset flags after delay
        setTimeout(() => {
          redirectAttemptedRef.current = false;
          isNavigatingRef.current = false;
        }, 1000);
      } else if (!state.isAuthenticated && !isLoggingOutRef.current) {
        // Reset flags when logged out - but only if not in the middle of logout
        // Don't reset flags if logout just happened (isLoggingOutRef is true)
        setTimeout(() => {
          redirectAttemptedRef.current = false;
          isNavigatingRef.current = false;
        }, 2000);
      }
    });

    // Also check initial state
    const state = useAuthStore.getState();
    if (!state.isLoading && state.isAuthenticated && !redirectAttemptedRef.current && !isNavigatingRef.current && !state.isLoggingOut) {
      redirectAttemptedRef.current = true;
      isNavigatingRef.current = true;
      router.replace('/(tabs)/' as any);
      setTimeout(() => {
        redirectAttemptedRef.current = false;
        isNavigatingRef.current = false;
      }, 1000);
    }

    return unsubscribe;
  }, [router]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    { 
      icon: 'volume-high-outline', 
      title: 'Audio Pronunciation',
      benefit: 'Learn from native speakers'
    },
    { 
      icon: 'game-controller-outline', 
      title: 'Fun Games',
      benefit: 'Practice daily in minutes'
    },
    { 
      icon: 'stats-chart-outline', 
      title: 'Progress Tracking',
      benefit: 'See improvement over time'
    },
  ];

  const whyItWorks = [
    { 
      icon: 'time-outline',
      title: '15-Minute Lessons',
      description: 'Learn in short bursts'
    },
    { 
      icon: 'repeat-outline',
      title: 'Spaced Repetition',
      description: 'Remember what you learn'
    },
    { 
      icon: 'calendar-outline',
      title: 'Daily Practice',
      description: 'Build consistent habits'
    },
    { 
      icon: 'school-outline',
      title: 'Structured Path',
      description: 'Progress step by step'
    },
  ];

  const reviews = [
    { 
      quote: 'I learned everyday phrases in a week. The games make it stick.',
      name: 'Morgan',
      rating: 5
    },
    { 
      quote: 'Short, fun sessions my kids actually ask for.',
      name: 'Dilan',
      rating: 5
    },
    { 
      quote: 'Clear pronunciation and simple steps helped me build confidence.',
      name: 'Sara',
      rating: 5
    },
  ];

  const renderReview = ({ item, index }: { item: typeof reviews[0]; index: number }) => (
    <View style={[styles.reviewCard, { width: width - 40 }]}>
      <View style={styles.reviewStars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons key={i} name="star" size={16} color="#fbbf24" />
        ))}
      </View>
      <Text style={styles.reviewQuote}>"{item.quote}"</Text>
      <Text style={styles.reviewName}>— {item.name}</Text>
    </View>
  );

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={[SKY, SKY_DEEPER, SKY]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo at top only - no title */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Image
              source={require('../assets/peyvi-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            {/* Primary CTA */}
            <Pressable
            onPress={() => router.push('/auth/register' as any)}
            style={({ pressed }) => [
              styles.primaryCTA,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={['#2563eb', '#3b82f6']}
              style={styles.primaryCTAGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryCTAText}>Start Free Trial</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Social Proof - Immediately under hero */}
        <View style={styles.socialProofSection}>
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons key={i} name="star" size={14} color="#fbbf24" />
              ))}
            </View>
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.ratingCount}>(2,500+ learners)</Text>
          </View>
        </View>

        {/* Pricing Section - Near the top */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingCards}>
            {/* Monthly Plan */}
            <Pressable
              style={({ pressed }) => [
                styles.pricingCard,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/auth/register?plan=monthly' as any)}
            >
              <Text style={styles.pricingLabel}>Monthly</Text>
              <Text style={styles.pricingPrice}>$4.99<Text style={styles.pricingPeriod}>/mo</Text></Text>
              <View style={styles.freeTrialBadge}>
                <Text style={styles.freeTrialText}>7 days free</Text>
              </View>
            </Pressable>

            {/* Yearly Plan */}
            <Pressable
              style={({ pressed }) => [
                styles.pricingCard,
                styles.pricingCardFeatured,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/auth/register?plan=yearly' as any)}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <Text style={styles.pricingLabel}>Yearly</Text>
              <Text style={styles.pricingPrice}>$49.99<Text style={styles.pricingPeriod}>/yr</Text></Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 2 months</Text>
              </View>
            </Pressable>
          </View>
          <Text style={styles.pricingNote}>7-day free trial · Cancel anytime</Text>
        </View>

        {/* Why Peyvi Works */}
        <View style={styles.whySection}>
          <Text style={styles.sectionTitle}>Why Peyvi Works</Text>
          <View style={styles.whyGrid}>
            {whyItWorks.map((item, index) => (
              <View key={index} style={styles.whyItem}>
                <View style={styles.whyIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#2563eb" />
                </View>
                <View style={styles.whyContent}>
                  <Text style={styles.whyTitle}>{item.title}</Text>
                  <Text style={styles.whyDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Compact Feature Rows */}
        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={20} color="#2563eb" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureBenefit}>{feature.benefit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Swipeable Review Cards */}
        <View style={styles.reviewsSection}>
          <Text style={styles.sectionTitle}>What Learners Say</Text>
          <FlatList
            data={reviews}
            renderItem={renderReview}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 40}
            snapToAlignment="center"
            decelerationRate="fast"
            contentContainerStyle={styles.reviewsList}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
              setCurrentReviewIndex(index);
            }}
          />
          <View style={styles.reviewIndicators}>
            {reviews.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.reviewIndicator,
                  index === currentReviewIndex && styles.reviewIndicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Final CTA */}
        <View style={styles.finalCTASection}>
          <Pressable
            onPress={() => router.push('/auth/register' as any)}
            style={({ pressed }) => [
              styles.finalCTA,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={['#2563eb', '#3b82f6']}
              style={styles.finalCTAGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.finalCTAText}>Start Free Trial</Text>
            </LinearGradient>
          </Pressable>
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 24,
  },
  primaryCTA: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryCTAGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  primaryCTAText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
  socialProofSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  pricingSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  pricingCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pricingCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    position: 'relative',
  },
  pricingCardFeatured: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  pricingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    marginTop: 8,
  },
  pricingPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  pricingPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
  },
  freeTrialBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeTrialText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  savingsBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
  pricingNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  whySection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  whyItem: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  whyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  whyContent: {
    alignItems: 'center',
  },
  whyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  whyDescription: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureBenefit: {
    fontSize: 13,
    color: '#6b7280',
  },
  reviewsSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  reviewsList: {
    paddingRight: 20,
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginRight: 20,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  reviewQuote: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  reviewIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  reviewIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  reviewIndicatorActive: {
    backgroundColor: '#2563eb',
    width: 24,
  },
  finalCTASection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  finalCTA: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finalCTAGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  finalCTAText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
