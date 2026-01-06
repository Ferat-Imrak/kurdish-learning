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
import { useAuthStore } from '../../lib/store/authStore';

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
    
    try {
      const response = await loginService({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });
      
      if (response.success && response.user && response.token) {
        await login(response.user, response.token);
        // No navigation - tabs layout will handle redirect
      } else {
        const errorMessage = response.error || 'Invalid credentials';
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={() => router.replace('/')}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={24} color="#111827" />
              </Pressable>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Username/Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username or Email</Text>
                <View style={[styles.inputWrapper, errors.usernameOrEmail && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
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
                  <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
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
                      color="#6b7280"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
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
    color: '#111827',
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
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
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
    color: '#6b7280',
  },
  signupLink: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
});
