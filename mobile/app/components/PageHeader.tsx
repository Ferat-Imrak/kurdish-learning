import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/store/authStore';

interface PageHeaderProps {
  variant?: 'default' | 'dashboard' | 'learn';
  stats?: {
    stars?: number;
    achievements?: number;
  };
}

export default function PageHeader({ variant = 'default', stats }: PageHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const showWelcome = variant === 'dashboard';
  const showStats = variant === 'learn';
  const showProfile = variant === 'dashboard';

  return (
    <View style={styles.header}>
      {/* Logo - Always on left, aligned with content */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/peyvi-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Dashboard: Welcome text centered */}
      {showWelcome && (
        <View style={styles.welcomeContainer}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.username || user?.name || 'Ready to learn?'}</Text>
        </View>
      )}

      {/* Learn: Stats on right */}
      {showStats && stats && (
        <View style={styles.statsContainer}>
          {stats.stars !== undefined && (
            <View style={styles.statBadge}>
              <Ionicons name="star" size={18} color="#fbbf24" />
              <Text style={styles.statText}>{stats.stars}</Text>
            </View>
          )}
          {stats.achievements !== undefined && (
            <View style={styles.statBadge}>
              <Ionicons name="trophy" size={18} color="#f59e0b" />
              <Text style={styles.statText}>{stats.achievements}</Text>
            </View>
          )}
        </View>
      )}

      {/* Dashboard: Profile button on right */}
      {showProfile && (
        <View style={styles.profileButtonContainer}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="person-circle-outline" size={32} color="#2563eb" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    position: 'relative',
  },
  logoContainer: {
    paddingLeft: 20,
    marginLeft: -43, // Aligns with content (matches Dashboard alignment)
  },
  logo: {
    width: 140,
    height: 44,
  },
  welcomeContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginRight: 20,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  profileButtonContainer: {
    position: 'absolute',
    right: 0,
    paddingRight: 20,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
