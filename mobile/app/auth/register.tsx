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
import { register as registerService } from '../../lib/services/auth';
import { useAuthStore } from '../../lib/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const emailInputRef = useRef<TextInputType>(null);
  const passwordInputRef = useRef<TextInputType>(null);
  const confirmPasswordInputRef = useRef<TextInputType>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/' as any);
    }
  }, [isAuthenticated]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Min 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await registerService({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      if (response.success && response.user && response.token) {
        await login(response.user, response.token);
        router.replace('/(tabs)/' as any);
      } else {
        const errorMessage = response.error || 'Registration failed. Please check your connection and try again.';
        Alert.alert('Registration Failed', errorMessage);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.message || error.error || 'Something went wrong';
      Alert.alert('Registration Failed', errorMessage);
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join Peyvi and start learning</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a username"
                    placeholderTextColor="#9ca3af"
                    value={formData.username}
                    onChangeText={(text) => {
                      setFormData({ ...formData, username: text });
                      if (errors.username) {
                        setErrors({ ...errors, username: undefined });
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData({ ...formData, email: text });
                      if (errors.email) {
                        setErrors({ ...errors, email: undefined });
                      }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
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
                    placeholder="Create a password"
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
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                    blurOnSubmit={false}
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

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    ref={confirmPasswordInputRef}
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9ca3af"
                    value={formData.confirmPassword}
                    onChangeText={(text) => {
                      setFormData({ ...formData, confirmPassword: text });
                      if (errors.confirmPassword) {
                        setErrors({ ...errors, confirmPassword: undefined });
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#6b7280"
                    />
                  </Pressable>
                </View>
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Primary CTA - Fixed at bottom */}
        <View style={styles.ctaContainer}>
          <Pressable
            onPress={handleRegister}
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
                {isLoading ? 'Creating...' : 'Create Account'}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable
              onPress={() => router.push('/auth/login')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.loginLink}>Sign In</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
});
