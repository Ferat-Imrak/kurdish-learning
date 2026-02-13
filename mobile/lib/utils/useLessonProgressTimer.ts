import { useCallback } from 'react';
import type { MutableRefObject } from 'react';
import { useFocusEffect } from '@react-navigation/native';

interface LessonProgress {
  lessonId: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  timeSpent: number;
  score?: number;
}

interface UseLessonProgressTimerOptions {
  lessonId: string;
  startTimeRef: MutableRefObject<number>;
  intervalMs?: number;
  calculateProgress: () => number;
  getLessonProgress: (lessonId: string) => LessonProgress;
  updateLessonProgress: (
    lessonId: string,
    progress: number,
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED',
    score?: number,
    timeSpent?: number
  ) => Promise<void>;
}

export function useLessonProgressTimer({
  lessonId,
  startTimeRef,
  intervalMs = 30000,
  calculateProgress,
  getLessonProgress,
  updateLessonProgress,
}: UseLessonProgressTimerOptions) {
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const tick = async () => {
        if (cancelled) return;
        const currentProgress = getLessonProgress(lessonId);
        if (currentProgress.status === 'COMPLETED') return;

        const baseTimeSpent = currentProgress.timeSpent || 0;
        const sessionTimeMinutes = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
        const totalTimeSpent = baseTimeSpent + sessionTimeMinutes;
        const safeTimeSpent = Math.min(1000, totalTimeSpent);

        const progress = calculateProgress();
        const status =
          progress >= 100
            ? 'COMPLETED'
            : currentProgress.status === 'COMPLETED'
            ? 'COMPLETED'
            : 'IN_PROGRESS';

        try {
          await updateLessonProgress(
            lessonId,
            progress,
            status,
            currentProgress.score,
            safeTimeSpent
          );
        } catch {
          // Ignore timer sync errors; regular interactions will retry.
        }
      };

      const intervalId = setInterval(tick, intervalMs);

      return () => {
        cancelled = true;
        clearInterval(intervalId);
      };
    }, [lessonId, intervalMs, calculateProgress, getLessonProgress, updateLessonProgress, startTimeRef])
  );
}
