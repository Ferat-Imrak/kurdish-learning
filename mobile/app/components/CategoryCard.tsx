import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const H_PADDING = 16 * 2;
const NUM_COLUMNS = 2;
export const CARD_WIDTH = (width - H_PADDING - CARD_GAP) / NUM_COLUMNS;

const BRAND_BLUE = '#3A86FF';

export interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: string;
  progressPercent: number;
  isCompleted?: boolean;
  onPress: () => void;
}

export default function CategoryCard({
  title,
  subtitle,
  icon,
  progressPercent,
  isCompleted = false,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      android_ripple={{ color: 'rgba(58, 134, 255, 0.08)' }}
    >
      <View style={styles.iconBadge}>
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${isCompleted ? 100 : progressPercent}%`,
                backgroundColor: isCompleted ? '#10b981' : BRAND_BLUE,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressPercent, isCompleted && styles.progressPercentComplete]}>
          {isCompleted ? '100%' : `${progressPercent}%`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    height: 168,
  },
  pressed: {
    opacity: 0.9,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(58, 134, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconEmoji: {
    fontSize: 22,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 28,
    textAlign: 'right',
  },
  progressPercentComplete: {
    color: '#10b981',
  },
});
