// Progress tracking store with SecureStore persistence
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from './authStore';

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
}

const PROGRESS_KEY = 'lesson_progress';

// Helper function to sanitize email for SecureStore key
// SecureStore only allows alphanumeric, ".", "-", and "_"
const sanitizeEmailForKey = (email: string): string => {
  return email.replace(/[^a-zA-Z0-9._-]/g, '_');
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  lessonProgress: {},
  isLoading: true,

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
      const stored = await SecureStore.getItemAsync(key);
      
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
    
    const newProgress: LessonProgress = {
      lessonId,
      progress: clampedProgress,
      status,
      lastAccessed: new Date(),
      score,
      timeSpent: timeSpent || currentProgress?.timeSpent || 0,
    };

    set((state) => ({
      lessonProgress: {
        ...state.lessonProgress,
        [lessonId]: newProgress,
      },
    }));

    // Save to SecureStore
    try {
      const sanitizedEmail = sanitizeEmailForKey(user.email);
      const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
      const allProgress = get().lessonProgress;
      await SecureStore.setItemAsync(key, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
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
    if (user?.email) {
      try {
        const sanitizedEmail = sanitizeEmailForKey(user.email);
        const key = `${PROGRESS_KEY}_${sanitizedEmail}`;
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error('Error clearing progress:', error);
      }
    }
    set({ lessonProgress: {} });
  },
}));

