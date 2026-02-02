import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../lib/store/authStore';
import { apiClient, handleApiError } from '../lib/services/api';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const TEXT_MUTED = '#64748B';

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: [
    'Access to core lessons',
    'Basic vocabulary',
    'Progress tracking',
  ],
  MONTHLY: [
    'Everything in Free',
    'All lessons unlocked',
    'Stories & games',
    'Audio pronunciation',
    'Sync across devices',
  ],
  YEARLY: [
    'Everything in Monthly',
    'Best value (2 months free)',
    'Priority support',
  ],
};

type PlanKey = 'MONTHLY' | 'YEARLY';
type StatusKey = 'ACTIVE' | 'CANCELED' | 'EXPIRED';

export default function SubscriptionScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [subscriptionPlan, setSubscriptionPlan] = useState<PlanKey | null>(
    (user?.subscriptionPlan as PlanKey) ?? null
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState<StatusKey | null>(
    (user?.subscriptionStatus as StatusKey) ?? 'ACTIVE'
  );
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [planMessage, setPlanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancelMessage, setCancelMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSubscription = async () => {
    try {
      const { data } = await apiClient.get<{ plan: string; status: string; endDate: string | null }>(
        '/auth/subscription'
      );
      setSubscriptionPlan((data.plan ?? 'MONTHLY') as PlanKey);
      setSubscriptionStatus((data.status ?? 'ACTIVE') as StatusKey);
      setSubscriptionEndDate(data.endDate ? new Date(data.endDate) : null);
      const current = useAuthStore.getState().user;
      if (current) {
        await setUser({
          ...current,
          subscriptionPlan: data.plan ?? current.subscriptionPlan,
          subscriptionStatus: data.status ?? current.subscriptionStatus,
        });
      }
    } catch (err) {
      const current = useAuthStore.getState().user;
      if (current?.subscriptionPlan) {
        setSubscriptionPlan(current.subscriptionPlan as PlanKey);
        setSubscriptionStatus((current.subscriptionStatus as StatusKey) ?? 'ACTIVE');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const plan = subscriptionPlan ?? (user?.subscriptionPlan as PlanKey) ?? 'MONTHLY';
  const status = subscriptionStatus ?? (user?.subscriptionStatus as StatusKey) ?? 'ACTIVE';
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.MONTHLY;
  const isPaid = plan === 'YEARLY' || plan === 'MONTHLY';

  const handleChangePlan = async (newPlan: 'monthly' | 'yearly') => {
    const key = newPlan === 'yearly' ? 'YEARLY' : 'MONTHLY';
    if (key === plan) return;

    setChangingPlan(true);
    setPlanMessage(null);
    try {
      await apiClient.put('/auth/subscription/plan', { plan: newPlan });
      setSubscriptionPlan(key);
      setPlanMessage({ type: 'success', text: `Switched to ${newPlan} plan.` });
      const current = useAuthStore.getState().user;
      if (current) {
        await setUser({ ...current, subscriptionPlan: key });
      }
      setTimeout(() => setPlanMessage(null), 3000);
    } catch (err) {
      setPlanMessage({ type: 'error', text: handleApiError(err) });
    } finally {
      setChangingPlan(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel subscription',
      'Are you sure? You will have access until your subscription end date.',
      [
        { text: 'Keep subscription', style: 'cancel' },
        {
          text: 'Cancel subscription',
          style: 'destructive',
          onPress: async () => {
            setCanceling(true);
            setCancelMessage(null);
            try {
              const { data } = await apiClient.post<{ endDate: string | null }>('/auth/subscription/cancel');
              setSubscriptionStatus('CANCELED');
              if (data.endDate) setSubscriptionEndDate(new Date(data.endDate));
              setCancelMessage({
                type: 'success',
                text: 'Subscription canceled. You have access until the end date.',
              });
              const current = useAuthStore.getState().user;
              if (current) {
                await setUser({ ...current, subscriptionStatus: 'CANCELED' });
              }
              setTimeout(() => setCancelMessage(null), 5000);
            } catch (err) {
              setCancelMessage({ type: 'error', text: handleApiError(err) });
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Subscription</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current plan card */}
          <View style={[styles.planCard, isPaid && styles.planCardPaid]}>
            <View style={styles.planHeader}>
              <Ionicons
                name={isPaid ? 'checkmark-circle' : 'person-outline'}
                size={32}
                color={isPaid ? '#10b981' : TEXT_MUTED}
              />
              <View style={styles.planTitleRow}>
                <Text style={styles.planLabel}>Current plan</Text>
                <Text style={styles.planName}>
                  {plan === 'YEARLY' ? 'Yearly' : plan === 'MONTHLY' ? 'Monthly' : 'Free'}
                </Text>
              </View>
            </View>
            {isPaid && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {status === 'ACTIVE' ? 'Active' : status === 'CANCELED' ? 'Canceled' : 'Expired'}
                </Text>
              </View>
            )}
          </View>

          {/* Change plan: Monthly / Yearly (match frontend) */}
          {isPaid && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Switch plan</Text>
              {planMessage && (
                <View
                  style={[
                    styles.messageBox,
                    planMessage.type === 'success' ? styles.messageSuccess : styles.messageError,
                  ]}
                >
                  <Ionicons
                    name={planMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={planMessage.type === 'success' ? '#15803d' : '#b91c1c'}
                  />
                  <Text
                    style={[
                      styles.messageText,
                      planMessage.type === 'success' ? styles.messageTextSuccess : styles.messageTextError,
                    ]}
                  >
                    {planMessage.text}
                  </Text>
                </View>
              )}
              <View style={styles.planRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.planOption,
                    plan === 'MONTHLY' && styles.planOptionSelected,
                    (changingPlan || plan === 'MONTHLY') && styles.planOptionDisabled,
                    pressed && styles.planOptionPressed,
                  ]}
                  onPress={() => handleChangePlan('monthly')}
                  disabled={changingPlan || plan === 'MONTHLY'}
                >
                  <Text style={styles.planPrice}>$4.99</Text>
                  <Text style={styles.planPeriod}>per month</Text>
                  {plan === 'MONTHLY' && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" style={styles.planCheck} />
                  )}
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.planOption,
                    plan === 'YEARLY' && styles.planOptionSelected,
                    (changingPlan || plan === 'YEARLY') && styles.planOptionDisabled,
                    pressed && styles.planOptionPressed,
                  ]}
                  onPress={() => handleChangePlan('yearly')}
                  disabled={changingPlan || plan === 'YEARLY'}
                >
                  <Text style={styles.planPrice}>$49.99</Text>
                  <Text style={styles.planPeriod}>per year</Text>
                  <Text style={styles.planSave}>2 months free</Text>
                  {plan === 'YEARLY' && (
                    <Ionicons name="checkmark-circle" size={20} color="#2563eb" style={styles.planCheck} />
                  )}
                </Pressable>
              </View>
              {changingPlan && (
                <View style={styles.changingRow}>
                  <ActivityIndicator size="small" color={TEXT_MUTED} />
                  <Text style={styles.changingText}>Updating plan...</Text>
                </View>
              )}
            </View>
          )}

          {/* Cancel subscription */}
          {isPaid && status === 'ACTIVE' && (
            <View style={styles.card}>
              {cancelMessage && (
                <View
                  style={[
                    styles.messageBox,
                    cancelMessage.type === 'success' ? styles.messageSuccess : styles.messageError,
                  ]}
                >
                  <Ionicons
                    name={cancelMessage.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={cancelMessage.type === 'success' ? '#15803d' : '#b91c1c'}
                  />
                  <Text
                    style={[
                      styles.messageText,
                      cancelMessage.type === 'success' ? styles.messageTextSuccess : styles.messageTextError,
                    ]}
                  >
                    {cancelMessage.text}
                  </Text>
                </View>
              )}
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed, canceling && styles.cancelButtonDisabled]}
                onPress={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.cancelButtonText}>Cancel subscription</Text>
                  </>
                )}
              </Pressable>
              <Text style={styles.cancelHint}>You will have access until your subscription end date.</Text>
            </View>
          )}

          {/* Features */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What's included</Text>
            {features.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark" size={18} color="#10b981" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Upgrade (free users) */}
          {!isPaid && (
            <View style={styles.card}>
              <Text style={styles.upgradeTitle}>Upgrade to unlock all lessons, stories, and games.</Text>
              <Text style={styles.upgradeSub}>Subscribe from the website or create an account with a plan.</Text>
            </View>
          )}
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
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  planCardPaid: {
    borderColor: '#a7f3d0',
    backgroundColor: '#f0fdf4',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planTitleRow: { flex: 1 },
  planLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 2,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  messageSuccess: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' },
  messageError: { backgroundColor: '#fee2e2', borderWidth: 1, borderColor: '#fecaca' },
  messageText: { fontSize: 13, flex: 1 },
  messageTextSuccess: { color: '#15803d', fontWeight: '500' },
  messageTextError: { color: '#b91c1c', fontWeight: '500' },
  planRow: {
    flexDirection: 'row',
    gap: 12,
  },
  planOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  planOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  planOptionDisabled: { opacity: 0.8 },
  planOptionPressed: { opacity: 0.9 },
  planPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  planPeriod: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  planSave: { fontSize: 11, color: '#059669', fontWeight: '600', marginTop: 4 },
  planCheck: { position: 'absolute', top: 8, right: 8 },
  changingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  changingText: { fontSize: 14, color: TEXT_MUTED },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b91c1c',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonDisabled: { opacity: 0.6 },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelHint: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 10,
  },
  buttonPressed: { opacity: 0.8 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  upgradeSub: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
});
