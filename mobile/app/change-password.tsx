import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { apiClient, handleApiError } from '../lib/services/api';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errorField, setErrorField] = useState<'current' | 'new' | 'confirm' | null>(null);

  const handleChangePassword = async () => {
    setMessage(null);
    setErrorField(null);

    if (!currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Current password is required.' });
      setErrorField('current');
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      setErrorField('new');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setErrorField('confirm');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: currentPassword.trim(),
        newPassword,
      });
      setMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      const msg = handleApiError(err);
      setMessage({ type: 'error', text: msg });
      if (msg.toLowerCase().includes('current') && msg.toLowerCase().includes('incorrect')) {
        setErrorField('current');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              {message && (
                <View
                  style={[
                    styles.messageBox,
                    message.type === 'success' ? styles.messageSuccess : styles.messageError,
                  ]}
                >
                  <Ionicons
                    name={message.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                    size={20}
                    color={message.type === 'success' ? '#15803d' : '#b91c1c'}
                  />
                  <Text
                    style={[
                      styles.messageText,
                      message.type === 'success' ? styles.messageTextSuccess : styles.messageTextError,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              )}
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={[styles.input, errorField === 'current' && styles.inputError]}
                value={currentPassword}
                onChangeText={(t) => {
                  setCurrentPassword(t);
                  setErrorField((f) => (f === 'current' ? null : f));
                }}
                placeholder="Enter current password"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry
                editable={!saving}
              />
              <Text style={[styles.label, styles.labelTop]}>New Password</Text>
              <TextInput
                style={[styles.input, errorField === 'new' && styles.inputError]}
                value={newPassword}
                onChangeText={(t) => {
                  setNewPassword(t);
                  setErrorField((f) => (f === 'new' ? null : f));
                }}
                placeholder="At least 6 characters"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry
                editable={!saving}
              />
              <Text style={[styles.label, styles.labelTop]}>Confirm New Password</Text>
              <TextInput
                style={[styles.input, errorField === 'confirm' && styles.inputError]}
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  setErrorField((f) => (f === 'confirm' ? null : f));
                }}
                placeholder="Confirm new password"
                placeholderTextColor={TEXT_MUTED}
                secureTextEntry
                editable={!saving}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && styles.submitBtnPressed,
                  saving && styles.submitBtnDisabled,
                ]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                    <Text style={styles.submitBtnText}>Change Password</Text>
                  </>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  messageSuccess: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' },
  messageError: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  messageText: { fontSize: 14, flex: 1 },
  messageTextSuccess: { color: '#15803d', fontWeight: '500' },
  messageTextError: { color: '#b91c1c', fontWeight: '500' },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  labelTop: { marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_PRIMARY,
    backgroundColor: '#fff',
  },
  inputError: { borderColor: '#ef4444' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#475569',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  submitBtnPressed: { opacity: 0.9 },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
