import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../lib/store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  // Only subscribe to what we need - Zustand will only re-render when these change
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  // REMOVED: useFocusEffect redirect logic
  // Navigation is handled in handleLogout, so this was causing conflicts

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            console.log('🔴 Profile: Logout button pressed');
            
            // Logout FIRST
            console.log('🔴 Profile: Logging out');
            await logout();
            console.log('🔴 Profile: Logout complete');
            
            // THEN navigate to login page after logout completes
            // This avoids navigation conflicts
            console.log('🔴 Profile: Navigating to login AFTER logout');
            try {
              // @ts-ignore - getParent exists on navigation
              const parentNav = navigation.getParent();
              if (parentNav) {
                console.log('🔴 Profile: Using parent navigation to exit tabs');
                // @ts-ignore - navigate to auth/login
                parentNav.navigate('auth/login');
              } else {
                // Fallback: use router
                console.log('🔴 Profile: Parent nav not available, using router');
                router.replace('/auth/login');
              }
            } catch (e) {
              console.log('🔴 Profile: Navigation error, using router fallback:', e);
              router.replace('/auth/login');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={48} color="#2563eb" />
            )}
          </View>
          {isAuthenticated && user ? (
            <>
              <Text style={styles.userName}>{user.name || user.username || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email || ''}</Text>
              {user.subscriptionPlan && (
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionText}>
                    {user.subscriptionPlan === 'YEARLY' ? 'Yearly' : 'Monthly'} Plan
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>Sign in to sync your progress</Text>
            </>
          )}
        </View>

        <View style={styles.menuSection}>
          {isAuthenticated ? (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {}}
              >
                <Ionicons name="settings-outline" size={24} color="#111827" />
                <Text style={styles.menuText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {}}
              >
                <Ionicons name="card-outline" size={24} color="#111827" />
                <Text style={styles.menuText}>Subscription</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </>
          ) : (
            <>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.replace('/auth/login')}
                      >
                        <Ionicons name="log-in-outline" size={24} color="#111827" />
                        <Text style={styles.menuText}>Sign In</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.replace('/auth/register')}
                      >
                        <Ionicons name="person-add-outline" size={24} color="#111827" />
                        <Text style={styles.menuText}>Create Account</Text>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                      </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  logoutText: {
    color: '#ef4444',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  subscriptionBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
});


