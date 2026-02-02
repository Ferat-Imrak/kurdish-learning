import React, { useState, useEffect } from 'react';
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
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../lib/store/authStore';
import { apiClient, handleApiError } from '../lib/services/api';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.image ?? null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setAvatarUri(user.image ?? null);
    }
  }, [user?.id]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photos to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const base64 = asset.base64;
    if (!base64) {
      setMessage({ type: 'error', text: 'Could not get image data.' });
      return;
    }
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    if (dataUrl.length > 700_000) {
      setMessage({ type: 'error', text: 'Image too large. Choose a smaller photo.' });
      return;
    }
    setUploadingAvatar(true);
    setMessage(null);
    try {
      const { data } = await apiClient.put<{ user: { id: string; email: string; name: string; image?: string } }>(
        '/auth/me',
        { image: dataUrl }
      );
      if (data.user?.image !== undefined) {
        setAvatarUri(data.user.image ?? null);
        const current = useAuthStore.getState().user;
        if (current) {
          await setUser({
            ...current,
            image: data.user.image,
          });
        }
      }
      setMessage({ type: 'success', text: 'Profile picture updated.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setMessage({ type: 'error', text: handleApiError(err) });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name is required.' });
      return;
    }
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required.' });
      return;
    }
    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const { data } = await apiClient.put<{
        user: { id: string; email: string; name: string; image?: string };
      }>('/auth/me', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      if (data.user) {
        const current = useAuthStore.getState().user;
        if (current) {
          await setUser({
            ...current,
            name: data.user.name,
            email: data.user.email,
            username: data.user.name,
            image: data.user.image ?? current.image,
          });
        }
        setMessage({ type: 'success', text: 'Profile updated successfully.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: unknown) {
      setMessage({ type: 'error', text: handleApiError(err) });
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
          <Text style={styles.headerTitle}>Edit Profile</Text>
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
              {/* Profile picture */}
              <View style={styles.avatarSection}>
                <Pressable
                  style={({ pressed }) => [styles.avatarWrap, pressed && styles.avatarWrapPressed]}
                  onPress={uploadingAvatar ? undefined : pickAvatar}
                  disabled={uploadingAvatar}
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={40} color="#94a3b8" />
                    </View>
                  )}
                  {uploadingAvatar && (
                    <View style={styles.avatarOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  {!uploadingAvatar && (
                    <View style={styles.avatarBadge}>
                      <Ionicons name="camera" size={16} color="#fff" />
                    </View>
                  )}
                </Pressable>
                <Text style={styles.avatarHint}>Tap to change photo</Text>
              </View>
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
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={TEXT_MUTED}
                editable={!saving}
                autoCapitalize="words"
              />
              <Text style={[styles.label, styles.labelTop]}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={TEXT_MUTED}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveBtnText}>Save Changes</Text>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    position: 'relative',
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
  },
  avatarWrapPressed: { opacity: 0.9 },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 8,
  },
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
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  saveBtnPressed: { opacity: 0.9 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
