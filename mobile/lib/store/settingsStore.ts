import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@kurdish_learning_settings';

export interface SettingsState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  setSoundEnabled: (value: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
}

const defaultSettings = {
  notificationsEnabled: true,
  soundEnabled: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notificationsEnabled: true,
  soundEnabled: true,

  setNotificationsEnabled: async (value: boolean) => {
    set({ notificationsEnabled: value });
    try {
      const state = get();
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          notificationsEnabled: state.notificationsEnabled,
          soundEnabled: state.soundEnabled,
        })
      );
    } catch (e) {
      console.warn('Failed to persist settings', e);
    }
  },

  setSoundEnabled: async (value: boolean) => {
    set({ soundEnabled: value });
    try {
      const state = get();
      await AsyncStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          notificationsEnabled: state.notificationsEnabled,
          soundEnabled: state.soundEnabled,
        })
      );
    } catch (e) {
      console.warn('Failed to persist settings', e);
    }
  },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          notificationsEnabled: parsed.notificationsEnabled ?? defaultSettings.notificationsEnabled,
          soundEnabled: parsed.soundEnabled ?? defaultSettings.soundEnabled,
        });
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  },
}));
