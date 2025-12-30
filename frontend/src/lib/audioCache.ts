/**
 * Audio Cache System
 * Downloads and caches Kurdish audio files locally for instant playback
 */

import { kurdishAudioUrls } from './kurdishAudioUrls'

interface AudioCache {
  [key: string]: string; // word -> audio URL
}

class AudioCacheManager {
  private cache: AudioCache = {};
  private downloading: Set<string> = new Set();
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  // Known Kurdish audio files from Lingua Libre
  private readonly knownAudio: Record<string, string> = kurdishAudioUrls;

  constructor() {
    this.loadCacheFromStorage();
  }

  /**
   * Get cached audio URL for a word
   */
  getCachedAudio(word: string): string | null {
    return this.cache[word] || null;
  }

  /**
   * Check if we have known audio for a word
   */
  hasKnownAudio(word: string): boolean {
    return word in this.knownAudio;
  }

  /**
   * Get known audio URL for a word
   */
  getKnownAudio(word: string): string | null {
    return this.knownAudio[word] || null;
  }

  /**
   * Cache audio URL for a word
   */
  cacheAudio(word: string, url: string): void {
    this.cache[word] = url;
    this.saveCacheToStorage();
  }

  /**
   * Preload audio file for instant playback
   */
  async preloadAudio(word: string): Promise<void> {
    if (this.downloading.has(word)) {
      return; // Already downloading
    }

    const url = this.getKnownAudio(word);
    if (!url) {
      return; // No known audio for this word
    }

    this.downloading.add(word);

    try {
      // Create audio element for preloading
      const audio = new Audio();
      audio.preload = 'auto';
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Audio preload timeout'));
        }, 10000); // 10 second timeout

        audio.addEventListener('canplaythrough', () => {
          clearTimeout(timeout);
          this.audioElements.set(word, audio);
          this.cacheAudio(word, url);
          resolve();
        });

        audio.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(e);
        });

        audio.src = url;
        audio.load();
      });
    } finally {
      this.downloading.delete(word);
    }
  }

  /**
   * Play cached audio instantly
   */
  async playAudio(word: string): Promise<void> {
    // Try to use preloaded audio element first
    const preloadedAudio = this.audioElements.get(word);
    if (preloadedAudio) {
      try {
        preloadedAudio.currentTime = 0;
        await preloadedAudio.play();
        return;
      } catch (error) {
        // Fall through to regular audio creation
      }
    }

    // Fallback to creating new audio element
    const url = this.getCachedAudio(word) || this.getKnownAudio(word);
    if (!url) {
      throw new Error(`No audio available for: ${word}`);
    }

    const audio = new Audio(url);
    audio.preload = 'auto';
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Audio playback timeout'));
      }, 15000); // 15 second timeout

      audio.addEventListener('canplaythrough', async () => {
        clearTimeout(timeout);
        try {
          await audio.play();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      audio.addEventListener('error', (e) => {
        clearTimeout(timeout);
        reject(e);
      });

      audio.load();
    });
  }

  /**
   * Preload all known audio files
   */
  async preloadAllKnownAudio(): Promise<void> {
    const preloadPromises = Object.keys(this.knownAudio).map(word => 
      this.preloadAudio(word).catch(() => {})
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('kurdish_audio_cache');
      if (stored) {
        this.cache = JSON.parse(stored);
        console.log('📦 Loaded audio cache from storage');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load audio cache from storage:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('kurdish_audio_cache', JSON.stringify(this.cache));
    } catch (error) {
      // Failed to save cache
    }
  }

  /**
   * Get statistics about cached audio
   */
  getCacheStats(): { totalKnown: number; cached: number; preloaded: number } {
    return {
      totalKnown: Object.keys(this.knownAudio).length,
      cached: Object.keys(this.cache).length,
      preloaded: this.audioElements.size
    };
  }

  /**
   * List all known audio words
   */
  getKnownWords(): string[] {
    return Object.keys(this.knownAudio);
  }

  /**
   * Clear all cached audio
   */
  clearCache(): void {
    this.cache = {};
    this.audioElements.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kurdish_audio_cache');
    }
  }
}

// Export singleton instance
export const audioCache = new AudioCacheManager();

// Auto-preload known audio files when module loads (in browser only)
if (typeof window !== 'undefined') {
  // Preload after a short delay to not block page load
  setTimeout(() => {
    audioCache.preloadAllKnownAudio();
  }, 1000);
}
