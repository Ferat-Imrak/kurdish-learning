// Progress tracking store with AsyncStorage persistence and backend sync
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { apiClient } from '../services/api';

export interface LessonProgress {
  lessonId: string;
  progress: number; // 0-100
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastAccessed: Date;
  score?: number;
  timeSpent: number; // in minutes
}

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>;
  isLoading: boolean;
  isSyncing: boolean;
  updateLessonProgress: (
    lessonId: string,
    progress: number,
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    score?: number,
    timeSpent?: number
  ) => Promise<void>;
  getLessonProgress: (lessonId: string) => LessonProgress;
  getTotalTimeSpent: () => number;
  getRecentLessons: () => LessonProgress[];
  initialize: () => Promise<void>;
  clearProgress: () => Promise<void>;
  syncFromBackend: () => Promise<void>;
}

// Helper to merge progress (take highest progress, latest timestamp, accumulate time)
function mergeProgress(local: LessonProgress, remote: LessonProgress): LessonProgress {
  const localTime = local.lastAccessed.getTime();
  const remoteTime = remote.lastAccessed.getTime();
  
  // Take highest progress
  const mergedProgress = Math.max(local.progress, remote.progress);
  
  // Take latest timestamp
  const mergedLastAccessed = localTime > remoteTime ? local.lastAccessed : remote.lastAccessed;
  
  // Accumulate time spent
  const mergedTimeSpent = local.timeSpent + remote.timeSpent;
  
  // Take highest score
  const mergedScore = Math.max(local.score || 0, remote.score || 0);
  
  // Status: if either is COMPLETED, use COMPLETED, else use the one with higher progress
  const mergedStatus = local.status === 'COMPLETED' || remote.status === 'COMPLETED'
    ? 'COMPLETED'
    : mergedProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
  
  return {
    lessonId: local.lessonId,
    progress: mergedProgress,
    status: mergedStatus,
    lastAccessed: mergedLastAccessed,
    score: mergedScore > 0 ? mergedScore : undefined,
    timeSpent: mergedTimeSpent
  };
}

const PROGRESS_KEY = 'lesson_progress';

// Helper function to sanitize email for storage key
const sanitizeEmailForKey = (email: string): string => {
  return email.replace(/[^a-zA-Z0-9._-]/g, '_');
};

let syncTimeout: NodeJS.Timeout | null = null;

export const useProgressStore = create<ProgressState>((set, get) => ({
  lessonProgress: {},
  isLoading: true,
  isSyncing: false,

  syncFromBackend: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.email) {
      console.log('⚠️ Cannot sync: user not authenticated');
      console.log('📊 Auth state:', { user: user, hasEmail: !!user?.email });
      return;
    }

    try {
      set({ isSyncing: true });
      console.log('🔄 Syncing progress from backend...');
      console.log('📊 User email:', user.email);
      
      // Check if token exists
      const { tokenService } = await import('../services/api');
      const token = await tokenService.getToken();
      console.log('🔑 Token exists:', !!token, token ? `${token.substring(0, 20)}...` : 'none');
      
      const response = await apiClient.get('/progress/user');
      console.log('📡 Backend response status:', response.status);
      console.log('📡 Backend response data:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        console.warn('⚠️ Backend returned empty response');
        set({ isSyncing: false });
        return;
      }
      
      const remoteProgress = response.data.progress || {};
      console.log(`✅ Synced ${Object.keys(remoteProgress).length} lessons from backend`);
      
      // Debug: Log Alphabet lesson progress specifically
      if (remoteProgress['1']) {
        console.log('📊 Backend: Alphabet (lesson 1) progress:', remoteProgress['1']);
      }

      // Convert remote progress to our format
      const remoteProgressFormatted: Record<string, LessonProgress> = {};
      for (const [lessonId, progress] of Object.entries(remoteProgress)) {
        const p = progress as any;
        // Safeguard: if timeSpent is unreasonably large (> 10000 minutes), reset it
        // This prevents corrupted values from breaking the calculation
        const safeTimeSpent = (p.timeSpent && p.timeSpent > 10000) ? 0 : (p.timeSpent || 0);
        remoteProgressFormatted[lessonId] = {
          lessonId,
          progress: p.progress || 0,
          status: p.status || 'NOT_STARTED',
          lastAccessed: new Date(p.lastAccessed),
          // CRITICAL: Ignore score from backend - it's overall progress, not practice
          // Only set score when practice is explicitly completed
          score: undefined,
          timeSpent: safeTimeSpent
        };
        
        // Debug: Log Alphabet lesson after formatting
        if (lessonId === '1') {
          console.log('📊 Backend: Alphabet formatted progress:', remoteProgressFormatted[lessonId]);
        }
      }

      // Merge with local progress
      const current = get().lessonProgress;
      const merged: Record<string, LessonProgress> = {};
      
      // Get all unique lesson IDs
      const allLessonIds = new Set([
        ...Object.keys(current),
        ...Object.keys(remoteProgressFormatted)
      ]);

      for (const lessonId of allLessonIds) {
        const local = current[lessonId];
        const remote = remoteProgressFormatted[lessonId];

        if (local && remote) {
          // Merge both
          merged[lessonId] = mergeProgress(local, remote);
        } else if (local) {
          // Only local
          merged[lessonId] = local;
        } else if (remote) {
          // Only remote
          merged[lessonId] = remote;
        }
      }

      // Debug: Log merged progress for Alphabet
      if (merged['1']) {
        console.log('📊 Merged: Alphabet (lesson 1) final progress:', merged['1']);
      }
      
      set({ lessonProgress: merged, isSyncing: false });

      // Save merged progress to AsyncStorage
      const sanitizedEmail = sanitizeEmailForKey(user.email);
      const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
      await AsyncStorage.setItem(key, JSON.stringify(merged));
      
      // Debug: Verify what was saved
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['1']) {
          console.log('💾 Saved to AsyncStorage: Alphabet progress:', parsed['1']);
        }
      }
    } catch (error: any) {
      // Handle 404 specifically (route not found)
      if (error.response?.status === 404) {
        console.error('❌ Progress endpoint not found (404). Check:');
        console.error('   1. Backend server is running');
        console.error('   2. API URL:', process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api');
        console.error('   3. Full URL attempted:', error.config?.url || 'unknown');
        console.error('   4. Restart backend server after route changes');
      } else if (error.response?.status === 401) {
        console.warn('⚠️ Not authenticated, skipping sync');
      } else {
        const errorMessage = error.message || String(error);
        console.error('❌ Failed to sync progress from backend:', errorMessage);
        
        // Provide helpful diagnostics for network errors
        if (errorMessage.includes('Network Error') || errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED')) {
          console.error('📡 Network connectivity issue. Troubleshooting:');
          console.error('   1. Check if backend is running: lsof -i :8080');
          console.error('   2. Verify EXPO_PUBLIC_API_URL in mobile/.env matches backend IP (e.g. http://10.0.0.45:8080/api)');
          console.error('   3. Ensure phone and computer are on same WiFi network');
          console.error('   4. Check firewall allows port 8080');
          console.error('   5. Try restarting backend server');
          console.error('   6. Verify backend listens on 0.0.0.0 (not just localhost)');
        }
        
        if (error.response) {
          console.error('   Status:', error.response.status);
          console.error('   Data:', error.response.data);
        } else if (error.code) {
          console.error('   Error code:', error.code);
        }
      }
      // Continue with local progress on error
      set({ isSyncing: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const user = useAuthStore.getState().user;
      if (!user?.email) {
        set({ isLoading: false, lessonProgress: {} });
        return;
      }

      const sanitizedEmail = sanitizeEmailForKey(user.email);
      const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
      const stored = await AsyncStorage.getItem(key);
      
      // Load from AsyncStorage first (for immediate display)
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Convert lastAccessed strings back to Date objects
          const progressWithDates = Object.keys(parsed).reduce((acc, key) => {
            acc[key] = {
              ...parsed[key],
              lastAccessed: new Date(parsed[key].lastAccessed),
            };
            return acc;
          }, {} as Record<string, LessonProgress>);
          set({ lessonProgress: progressWithDates, isLoading: false });
        } catch (error) {
          console.error('Error parsing progress:', error);
          set({ lessonProgress: {}, isLoading: false });
        }
      } else {
        set({ lessonProgress: {}, isLoading: false });
      }

      // Then sync from backend (will merge with local)
      await get().syncFromBackend();
    } catch (error) {
      console.error('Error initializing progress:', error);
      set({ lessonProgress: {}, isLoading: false });
    }
  },

  updateLessonProgress: async (
    lessonId: string,
    progress: number,
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS',
    score?: number,
    timeSpent?: number
  ) => {
    const user = useAuthStore.getState().user;
    if (!user?.email) return;

    const clampedProgress = Math.max(0, Math.min(100, progress));
    const currentProgress = get().lessonProgress[lessonId];
    const currentTimeSpent = currentProgress?.timeSpent || 0;
    
    // Accumulate time spent if provided, otherwise keep existing
    const newTimeSpent = timeSpent !== undefined 
      ? currentTimeSpent + timeSpent  // Add to existing time
      : currentTimeSpent;  // Keep existing time
    
    const newProgress: LessonProgress = {
      lessonId,
      progress: clampedProgress,
      status,
      lastAccessed: new Date(),
      score: score !== undefined ? score : currentProgress?.score,
      timeSpent: newTimeSpent,
    };

    const updatedProgress = {
      ...get().lessonProgress,
      [lessonId]: newProgress,
    };

    set({ lessonProgress: updatedProgress });

    // Save to AsyncStorage immediately
    try {
      const sanitizedEmail = sanitizeEmailForKey(user.email);
      const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }

    // Sync to backend (debounced)
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    syncTimeout = setTimeout(async () => {
      try {
        // Convert to backend format
        const backendProgress: Record<string, any> = {};
        const allProgress = get().lessonProgress;
        for (const [id, p] of Object.entries(allProgress)) {
          backendProgress[id] = {
            progress: p.progress,
            status: p.status,
            score: p.score,
            timeSpent: p.timeSpent,
            lastAccessed: p.lastAccessed.toISOString()
          };
        }

        const response = await apiClient.post('/progress/user/sync', {
          progress: backendProgress
        });

        // Update with merged data from backend
        if (response.data.progress) {
          const mergedProgress: Record<string, LessonProgress> = {};
          for (const [id, p] of Object.entries(response.data.progress)) {
            const progressData = p as any;
            // Safeguard: if timeSpent is unreasonably large (> 10000 minutes), reset it
            // This prevents corrupted values from breaking the calculation
            const safeTimeSpent = (progressData.timeSpent && progressData.timeSpent > 10000) ? 0 : (progressData.timeSpent || 0);
            mergedProgress[id] = {
              lessonId: id,
              progress: progressData.progress || 0,
              status: progressData.status || 'NOT_STARTED',
              lastAccessed: new Date(progressData.lastAccessed),
              // CRITICAL: Ignore score from backend - it's overall progress, not practice
              // Only set score when practice is explicitly completed
              score: undefined,
              timeSpent: safeTimeSpent
            };
          }
          
          const current = get().lessonProgress;
          const final: Record<string, LessonProgress> = {};
          for (const id of Object.keys({ ...current, ...mergedProgress })) {
            if (current[id] && mergedProgress[id]) {
              final[id] = mergeProgress(current[id], mergedProgress[id]);
            } else {
              final[id] = current[id] || mergedProgress[id];
            }
          }
          
          set({ lessonProgress: final });
          
          // Save merged to AsyncStorage
          const sanitizedEmail = sanitizeEmailForKey(user.email);
          const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
          await AsyncStorage.setItem(key, JSON.stringify(final));
        }
        console.log(`✅ Synced ${Object.keys(response.data.progress || {}).length} lessons to backend`);
      } catch (error: any) {
        // Handle 404 specifically
        if (error.response?.status === 404) {
          console.error('❌ Progress sync endpoint not found (404). Check backend routes.');
        } else if (error.response?.status === 401) {
          console.warn('⚠️ Not authenticated, skipping sync');
        } else {
          console.error('❌ Failed to sync progress to backend:', error.message || error);
        }
        // Continue with local progress on error
      }
    }, 2000); // 2 second debounce
  },

  getLessonProgress: (lessonId: string): LessonProgress => {
    const progress = get().lessonProgress[lessonId];
    if (progress) return progress;

    // Return default
    return {
      lessonId,
      progress: 0,
      status: 'NOT_STARTED',
      lastAccessed: new Date(),
      timeSpent: 0,
    };
  },

  getTotalTimeSpent: (): number => {
    const progress = get().lessonProgress;
    return Object.values(progress).reduce((total, lesson) => total + lesson.timeSpent, 0);
  },

  getRecentLessons: (): LessonProgress[] => {
    const progress = get().lessonProgress;
    return Object.values(progress)
      .filter((lesson) => lesson.status !== 'NOT_STARTED')
      .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
      .slice(0, 3);
  },

  clearProgress: async () => {
    const user = useAuthStore.getState().user;
    if (!user?.email) {
      console.warn('⚠️ Cannot clear progress: user not authenticated');
      return;
    }

    try {
      // Clear local storage
      const sanitizedEmail = sanitizeEmailForKey(user.email);
      const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
      await AsyncStorage.removeItem(key);
      console.log('✅ Cleared local progress from AsyncStorage');

      // Clear backend progress
      try {
        console.log('🔄 Attempting to clear backend progress...');
        const response = await apiClient.delete('/progress/user');
        if (response.status === 200) {
          console.log('✅ Cleared progress from backend');
        }
      } catch (error: any) {
        // If backend clear fails, log but don't fail the whole operation
        if (error.response?.status === 401) {
          console.warn('⚠️ Not authenticated, skipping backend clear');
        } else if (error.response?.status === 404) {
          console.warn('⚠️ DELETE endpoint not found (404). Backend may need restart. Progress cleared locally only.');
        } else {
          console.error('❌ Failed to clear progress from backend:', error.message || error);
          console.error('   Response status:', error.response?.status);
          console.error('   Response data:', error.response?.data);
        }
      }

      // Clear local state
      set({ lessonProgress: {} });
      console.log('✅ Progress cleared successfully');
    } catch (error) {
      console.error('Error clearing progress:', error);
      throw error;
    }
  },
}));

