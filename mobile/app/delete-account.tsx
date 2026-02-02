import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../lib/store/authStore';
import { apiClient, handleApiError } from '../lib/services/api';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

const CONFIRM_TEXT = 'DELETE';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const logout = useAuthStore((s) => s.logout);

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      setError('Type DELETE to confirm.');
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      await apiClient.delete('/auth/me');
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
    } catch (err: unknown) {
      setError(handleApiError(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    if (deleting) return;
    router.back();
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.dangerHeader}>
              <Ionicons name="trash-outline" size={24} color="#b91c1c" />
              <Text style={styles.dangerTitle}>Danger Zone</Text>
            </View>
            <Text style={styles.warning}>
              Once you delete your account, there is no going back. All your progress and data will
              be permanently removed. Please be certain.
            </Text>
            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#b91c1c" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Text style={styles.confirmLabel}>
              Type <Text style={styles.confirmMono}>{CONFIRM_TEXT}</Text> to confirm:
            </Text>
            <TextInput
              style={styles.input}
              value={confirmText}
              onChangeText={(t) => {
                setConfirmText(t);
                if (error) setError(null);
              }}
              placeholder={`Type ${CONFIRM_TEXT} to confirm`}
              placeholderTextColor={TEXT_MUTED}
              editable={!deleting}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <View style={styles.buttons}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  pressed && styles.confirmBtnPressed,
                  (deleting || confirmText !== CONFIRM_TEXT) && styles.confirmBtnDisabled,
                ]}
                onPress={handleDelete}
                disabled={deleting || confirmText !== CONFIRM_TEXT}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={18} color="#fff" />
                    <Text style={styles.confirmBtnText}>Confirm Delete</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelBtnPressed]}
                onPress={handleCancel}
                disabled={deleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    minHeight: 44,
  },
  backHit: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerRight: { width: 44 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#fecaca',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#b91c1c',
  },
  warning: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#b91c1c',
    fontWeight: '500',
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  confirmMono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  buttons: {
    gap: 12,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b91c1c',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmBtnPressed: { opacity: 0.9 },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  cancelBtnPressed: { opacity: 0.8 },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
});
