// Games progress (flashcards, matching, word builder, etc.) with AsyncStorage + backend sync
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { apiClient } from '../services/api';

const GAMES_PROGRESS_PREFIXES = [
  'flashcards-progress-',
  'matching-progress-',
  'wordbuilder-progress-',
  'picturequiz-progress-',
  'sentence-builder-progress-',
  'memorycards-progress-',
];

async function getAllLocalGamesProgress(): Promise<Record<string, unknown>> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      if (!GAMES_PROGRESS_PREFIXES.some((p) => key.startsWith(p))) continue;
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        try {
          out[key] = JSON.parse(raw);
        } catch {
          // ignore
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

function takeBest(key: string, a: unknown, b: unknown): unknown {
  if (a == null) return b;
  if (b == null) return a;
  if (typeof a === 'number' && typeof b === 'number') return Math.max(a, b);
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    if ('score' in ao && 'total' in ao && 'score' in bo && 'total' in bo) {
      const ra = (ao.total as number) > 0 ? (ao.score as number) / (ao.total as number) : 0;
      const rb = (bo.total as number) > 0 ? (bo.score as number) / (bo.total as number) : 0;
      return ra >= rb ? a : b;
    }
    if ('correct' in ao && 'total' in ao && 'correct' in bo && 'total' in bo) {
      const ca = (ao.correct as number) >= (ao.total as number) ? 1 : 0;
      const cb = (bo.correct as number) >= (bo.total as number) ? 1 : 0;
      if (ca !== cb) return ca > cb ? a : b;
      return (ao.correct as number) >= (bo.correct as number) ? a : b;
    }
    if ('completed' in ao && 'total' in ao && 'completed' in bo && 'total' in bo) {
      const pa = (ao.total as number) > 0 ? (ao.completed as number) / (ao.total as number) : 0;
      const pb = (bo.total as number) > 0 ? (bo.completed as number) / (bo.total as number) : 0;
      return pa >= pb ? a : b;
    }
    if ('uniqueWords' in ao && 'uniqueWords' in bo) {
      return (ao.uniqueWords as number) >= (bo.uniqueWords as number) ? a : b;
    }
    if ('completed' in ao && typeof ao.completed === 'boolean' && 'completed' in bo && typeof bo.completed === 'boolean') {
      return ao.completed === true || bo.completed === true ? { ...ao, completed: true } : a;
    }
  }
  return b;
}

function merge(remote: Record<string, unknown>, local: Record<string, unknown>): Record<string, unknown> {
  const merged = { ...remote };
  for (const [k, localVal] of Object.entries(local)) {
    if (localVal === undefined) continue;
    merged[k] = takeBest(k, merged[k], localVal);
  }
  return merged;
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

interface GamesProgressState {
  data: Record<string, unknown>;
  isSyncing: boolean;
  getProgress: (key: string) => unknown;
  saveProgress: (key: string, value: unknown) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useGamesProgressStore = create<GamesProgressState>((set, get) => ({
  data: {},
  isSyncing: false,

  getProgress: (key: string) => get().data[key] ?? null,

  saveProgress: async (key: string, value: unknown) => {
    const next = { ...get().data, [key]: value };
    set({ data: next });
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Games progress save to AsyncStorage:', e);
    }
    const user = useAuthStore.getState().user;
    if (!user?.email) return;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      try {
        const res = await apiClient.post('/progress/games/sync', { data: next });
        if (res.data?.data) set({ data: res.data.data as Record<string, unknown> });
      } catch (e: any) {
        if (e?.response?.status !== 401) console.error('Games progress sync to backend:', e?.message || e);
      }
    }, 2000);
  },

  initialize: async () => {
    const user = useAuthStore.getState().user;
    const local = await getAllLocalGamesProgress();
    set({ data: local });
    if (!user?.email) return;
    try {
      set({ isSyncing: true });
      const res = await apiClient.get('/progress/games');
      const remote = (res.data?.data || {}) as Record<string, unknown>;
      const merged = merge(remote, local);
      set({ data: merged, isSyncing: false });
      for (const [key, value] of Object.entries(merged)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e: any) {
      if (e?.response?.status === 401) {
        set({ isSyncing: false });
        return;
      }
      console.error('Games progress sync from backend:', e?.message || e);
      set({ isSyncing: false });
    }
  },
}));
