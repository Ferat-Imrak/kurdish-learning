import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../lib/store/authStore';

const SKY_TOP = '#E8F2FF';
const SKY_MID = '#D6E6FF';
const SKY_BOTTOM = '#E0EDFF';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';
const ACCENT = '#2563eb';
const CARD_BG = '#FFFFFF';
const MENU_ICON_BG = '#F1F5F9';

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

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
            await logout();
            try {
              const parentNav = navigation.getParent();
              if (parentNav) {
                (parentNav as any).navigate('auth/login');
              } else {
                router.replace('/auth/login');
              }
            } catch {
              router.replace('/auth/login');
            }
          },
        },
      ]
    );
  };

  const displayName = (() => {
    const raw = user?.name || user?.username || 'User';
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  })();

  const MenuRow = ({
    icon,
    label,
    onPress,
    danger,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <Pressable
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
      onPress={onPress}
    >
      <View style={[styles.menuIconWrap, danger && styles.menuIconWrapDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? '#dc2626' : TEXT_PRIMARY}
        />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={TEXT_MUTED} />
    </Pressable>
  );

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={[SKY_TOP, SKY_MID, SKY_BOTTOM]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page title */}
          <Text style={styles.pageTitle}>Profile</Text>

          {/* Profile hero card */}
          <View style={styles.heroCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                {user?.image ? (
                  <Image source={{ uri: user.image }} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={44} color={ACCENT} />
                )}
              </View>
            </View>
            {isAuthenticated && user ? (
              <>
                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                <View style={styles.emailRow}>
                  <Ionicons name="mail-outline" size={14} color={TEXT_MUTED} />
                  <Text style={styles.userEmail} numberOfLines={1}>{user.email || ''}</Text>
                </View>
                {user.subscriptionPlan && (
                  <View style={styles.planBadge}>
                    <Ionicons name="diamond-outline" size={14} color={ACCENT} />
                    <Text style={styles.planBadgeText}>
                      {user.subscriptionPlan === 'YEARLY' ? 'Yearly' : 'Monthly'} Plan
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.userName}>Guest</Text>
                <Text style={styles.userEmail}>Sign in to sync your progress</Text>
              </>
            )}
          </View>

          {/* Account section */}
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.menuCard}>
            {isAuthenticated ? (
              <>
                <MenuRow icon="person-outline" label="Edit Profile" onPress={() => router.push('/edit-profile' as any)} />
                <View style={styles.menuDivider} />
                <MenuRow icon="lock-closed-outline" label="Change Password" onPress={() => router.push('/change-password' as any)} />
                <View style={styles.menuDivider} />
                <MenuRow icon="card-outline" label="Subscription" onPress={() => router.push('/subscription' as any)} />
                <View style={styles.menuDivider} />
                <MenuRow icon="trash-outline" label="Delete Account" onPress={() => router.push('/delete-account' as any)} danger />
              </>
            ) : (
              <>
                <MenuRow icon="log-in-outline" label="Sign In" onPress={() => router.replace('/auth/login' as any)} />
                <View style={styles.menuDivider} />
                <MenuRow icon="person-add-outline" label="Create Account" onPress={() => router.replace('/auth/register' as any)} />
              </>
            )}
          </View>

          {/* Sign out – separate card for emphasis */}
          {isAuthenticated && (
            <Pressable
              style={({ pressed }) => [styles.signOutCard, pressed && styles.menuRowPressed]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 20,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuRowPressed: {
    opacity: 0.7,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: MENU_ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconWrapDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  menuLabelDanger: {
    color: '#dc2626',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 16 + 36 + 12,
  },
  signOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});
