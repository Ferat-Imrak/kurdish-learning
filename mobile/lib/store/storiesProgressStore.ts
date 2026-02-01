// Stories read progress – AsyncStorage key "stories-read" (array of story ids). No backend sync in Phase 1.
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORIES_READ_KEY = 'stories-read';

interface StoriesProgressState {
  readIds: Set<string>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  isRead: (id: string) => boolean;
  markRead: (id: string) => Promise<void>;
  markUnread: (id: string) => Promise<void>;
  readCount: () => number;
}

export const useStoriesProgressStore = create<StoriesProgressState>((set, get) => ({
  readIds: new Set(),
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORIES_READ_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      set({ readIds: new Set(arr), hydrated: true });
    } catch {
      set({ readIds: new Set(), hydrated: true });
    }
  },

  isRead: (id: string) => get().readIds.has(id),

  markRead: async (id: string) => {
    const next = new Set(get().readIds);
    next.add(id);
    set({ readIds: next });
    try {
      await AsyncStorage.setItem(STORIES_READ_KEY, JSON.stringify(Array.from(next)));
    } catch {}
  },

  markUnread: async (id: string) => {
    const next = new Set(get().readIds);
    next.delete(id);
    set({ readIds: next });
    try {
      await AsyncStorage.setItem(STORIES_READ_KEY, JSON.stringify(Array.from(next)));
    } catch {}
  },

  readCount: () => get().readIds.size,
}));
