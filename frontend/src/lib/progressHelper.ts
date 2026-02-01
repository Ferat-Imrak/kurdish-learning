// Progress calculation helper utility (Frontend version)
// Same logic as mobile but for frontend context

export interface LessonProgress {
  lessonId: string;
  progress: number; // 0-100
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastAccessed: Date;
  score?: number;
  timeSpent: number; // in minutes
}

export interface ProgressConfig {
  totalAudios: number; // Total number of unique audios in the lesson
  hasPractice: boolean; // Whether lesson has a practice section
  audioWeight: number; // Weight of audio plays (0-100, e.g., 30 means max 30% from audio)
  timeWeight: number; // Weight of time spent (0-100, e.g., 20 means max 20% from time)
  practiceWeight?: number; // Weight of practice score (0-100, e.g., 50 means max 50% from practice)
  audioMultiplier?: number; // Multiplier for audio progress (calculated automatically if not provided)
  timeMultiplier?: number; // Multiplier for time progress (calculated automatically if not provided)
}

export interface ProgressState {
  uniqueAudiosPlayed: Set<string>; // Track which specific audios were played
  sessionStartTime: number; // Session start timestamp
  baseProgress: number; // Progress from previous sessions (0-100)
  baseTimeSpent: number; // Time spent in previous sessions (minutes)
  practiceScore?: number; // Practice score from previous sessions (0-100)
}

/**
 * Calculate audio multiplier based on total audios and weight
 */
function calculateAudioMultiplier(totalAudios: number, audioWeight: number): number {
  if (totalAudios === 0) return 0;
  return audioWeight / totalAudios;
}

/**
 * Calculate time multiplier based on target time and weight
 */
function calculateTimeMultiplier(targetMinutes: number, timeWeight: number): number {
  if (targetMinutes === 0) return 0;
  return timeWeight / targetMinutes;
}

/**
 * Initialize progress state from stored progress
 */
export function initializeProgressState(
  storedProgress: LessonProgress | undefined,
  config: ProgressConfig
): ProgressState {
  const baseProgress = storedProgress?.progress || 0;
  const baseTimeSpent = storedProgress?.timeSpent || 0;
  const practiceScore = storedProgress?.score;

  return {
    uniqueAudiosPlayed: new Set(),
    sessionStartTime: Date.now(),
    baseProgress,
    baseTimeSpent,
    practiceScore
  };
}

/**
 * Calculate progress increment from new activity in current session
 */
export function calculateProgressIncrement(
  state: ProgressState,
  config: ProgressConfig,
  newUniqueAudios: number,
  sessionTimeMinutes: number,
  newPracticeScore?: number
): number {
  const audioMultiplier = config.audioMultiplier || 
    calculateAudioMultiplier(config.totalAudios, config.audioWeight);
  const timeMultiplier = config.timeMultiplier || 
    calculateTimeMultiplier(5, config.timeWeight);

  const newAudioProgress = Math.min(
    config.audioWeight,
    newUniqueAudios * audioMultiplier
  );
  
  const newTimeProgress = Math.min(
    config.timeWeight,
    sessionTimeMinutes * timeMultiplier
  );

  let newPracticeProgress = 0;
  if (config.hasPractice && newPracticeScore !== undefined) {
    newPracticeProgress = Math.min(
      config.practiceWeight || 50,
      newPracticeScore * ((config.practiceWeight || 50) / 100)
    );
  } else if (config.hasPractice && state.practiceScore !== undefined) {
    newPracticeProgress = Math.min(
      config.practiceWeight || 50,
      state.practiceScore * ((config.practiceWeight || 50) / 100)
    );
  }

  const sessionProgress = newAudioProgress + newTimeProgress + newPracticeProgress;
  const totalProgress = Math.min(100, state.baseProgress + sessionProgress);

  return totalProgress;
}

/**
 * Calculate total progress (base + session activity)
 */
export function calculateTotalProgress(
  state: ProgressState,
  config: ProgressConfig,
  currentPracticeScore?: number
): number {
  const sessionTimeMinutes = Math.floor((Date.now() - state.sessionStartTime) / 1000 / 60);
  const newUniqueAudios = state.uniqueAudiosPlayed.size;
  
  return calculateProgressIncrement(
    state,
    config,
    newUniqueAudios,
    sessionTimeMinutes,
    currentPracticeScore
  );
}

/**
 * Restore approximate refs from stored progress
 */
export function restoreRefsFromProgress(
  storedProgress: LessonProgress | undefined,
  config: ProgressConfig
): {
  estimatedAudioPlays: number;
  estimatedStartTime: number;
} {
  const baseProgress = storedProgress?.progress || 0;
  const baseTimeSpent = storedProgress?.timeSpent || 0;

  const audioMultiplier = config.audioMultiplier || 
    calculateAudioMultiplier(config.totalAudios, config.audioWeight);
  const estimatedAudioPlays = Math.floor(baseProgress / audioMultiplier);

  const estimatedStartTime = Date.now() - (baseTimeSpent * 60 * 1000);

  return {
    estimatedAudioPlays,
    estimatedStartTime
  };
}

/**
 * Get learned count for display
 */
export function getLearnedCount(
  state: ProgressState,
  totalAudios: number
): number {
  const baseCount = Math.floor((state.baseProgress / 100) * totalAudios);
  return Math.min(totalAudios, baseCount + state.uniqueAudiosPlayed.size);
}


