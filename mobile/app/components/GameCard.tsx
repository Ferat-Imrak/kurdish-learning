import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme A: Friendly Sky
const BLUE_50 = '#eff6ff';
const BLUE_100 = '#dbeafe'; // for icon badge default / compatibility
const SLATE_100 = '#f1f5f9';
const SLATE_400 = '#94a3b8';
const SLATE_800 = '#1e293b';
const CHEVRON_BLUE = '#1e40af';

export interface GameCardProps {
  title: string;
  description?: string;
  icon: string;
  color?: string;
  iconBg?: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function GameCard({
  title,
  description,
  icon,
  iconBg = '#dbeafe',
  onPress,
  disabled = false,
}: GameCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        disabled && styles.cardDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      android_ripple={!disabled ? { color: BLUE_50 } : undefined}
    >
      <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
        <Text style={styles.iconEmoji}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {description ? <Text style={styles.description} numberOfLines={1}>{description}</Text> : null}
      </View>
      <View style={[styles.chevronWrap, disabled && styles.chevronDisabled]}>
        <Ionicons name="chevron-forward" size={20} color={disabled ? '#9ca3af' : CHEVRON_BLUE} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: SLATE_100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.7,
  },
  pressed: {
    backgroundColor: BLUE_50,
    transform: [{ scale: 0.97 }],
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconEmoji: {
    fontSize: 26,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: SLATE_800,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
  },
  chevronWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SLATE_100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronDisabled: {},
});
