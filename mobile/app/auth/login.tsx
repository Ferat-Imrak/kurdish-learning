import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { login as loginService } from '../../lib/services/auth';
import { checkConnection, API_URL } from '../../lib/services/api';
import { useAuthStore } from '../../lib/store/authStore';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const passwordInputRef = useRef<TextInputType>(null);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    usernameOrEmail?: string;
    password?: string;
  }>({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // No redirect logic - tabs layout handles it

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Required';
    }
    // Allow both email and username - backend handles both
    
    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    const connection = await checkConnection();
    if (!connection.ok) {
      setIsLoading(false);
      const base = API_URL.replace(/\/api\/?$/, '');
      Alert.alert(
        'Cannot reach server',
        `App is trying: ${API_URL}\n\n` +
        '1. Backend running? In backend folder: npm run dev\n' +
        '2. Use the URL from backend log ("Mobile access: http://...") in mobile/.env as EXPO_PUBLIC_API_URL, then restart Expo.\n' +
        '3. Same WiFi for phone and computer.\n' +
        '4. macOS: System Settings → Network → Firewall → allow Node/tsx incoming.\n\n' +
        `Test in phone browser: ${base}/api/health`,
        [
          { text: 'Try anyway', onPress: () => handleLoginSkipCheck() },
          { text: 'OK' },
        ]
      );
      return;
    }

    await doLogin();
  };

  const doLogin = async () => {
    try {
      console.log('🔐 Mobile: Attempting login with:', formData.usernameOrEmail);
      const response = await loginService({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      console.log('🔐 Mobile: Login response:', {
        success: response.success,
        hasUser: !!response.user,
        hasToken: !!response.token,
        error: response.error,
      });

      if (response.success && response.user && response.token) {
        console.log('🔐 Mobile: Calling authStore.login with user:', response.user.email);
        await login(response.user, response.token);
        console.log('🔐 Mobile: Login successful, user authenticated');
        router.replace('/(tabs)/');
      } else {
        const errorMessage = response.error || 'Invalid credentials';
        console.log('🔐 Mobile: Login failed:', errorMessage);
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('🔐 Mobile: Login error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSkipCheck = () => {
    setIsLoading(true);
    doLogin();
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={[SKY, SKY_DEEPER, SKY]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Header: back (left) + title (center) */}
              <View style={styles.header}>
                <Pressable
                  onPress={() => {
                  if (router.canGoBack()) router.back();
                  else router.replace('/');
                }}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
                </Pressable>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.title}>Welcome Back</Text>
                  <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>
                <View style={styles.headerSpacer} />
              </View>

              {/* Form */}
            <View style={styles.form}>
              {/* Username/Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={[styles.inputWrapper, errors.usernameOrEmail && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter username or email"
                    placeholderTextColor="#9ca3af"
                    value={formData.usernameOrEmail}
                    onChangeText={(text) => {
                      setFormData({ ...formData, usernameOrEmail: text });
                      if (errors.usernameOrEmail) {
                        setErrors({ ...errors, usernameOrEmail: undefined });
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                {errors.usernameOrEmail && (
                  <Text style={styles.errorText}>{errors.usernameOrEmail}</Text>
                )}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color={TEXT_MUTED} style={styles.inputIcon} />
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData({ ...formData, password: text });
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={TEXT_MUTED}
                    />
                  </Pressable>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              {/* Forgot Password */}
              <Pressable
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.forgotPasswordContainer,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Primary CTA - Fixed at bottom */}
        <View style={styles.ctaContainer}>
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.primaryButton,
              (isLoading || pressed) && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={['#2563eb', '#3b82f6']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable
              onPress={() => router.push('/auth/register')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPassword: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  ctaContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
  signupLink: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
});
