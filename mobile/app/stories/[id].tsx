import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import {
  stories,
  vocabularyDict,
  getAudioFilename,
  extractVocabulary,
  type Story,
} from '../../lib/data/stories';
import { storyAudioAssets } from '../../lib/data/storyAudioAssets';
import { useStoriesProgressStore } from '../../lib/store/storiesProgressStore';

const SKY = '#EAF3FF';
const SKY_DEEPER = '#d6e8ff';
const TEXT_PRIMARY = '#0F172A';
const BRAND_BLUE = '#3A86FF';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || '';
const TTS_API_KEY = process.env.EXPO_PUBLIC_KURDISH_TTS_API_KEY || '8f183799c5a8be31514135110279812e7bc1229a';

function extractSpeechContent(text: string): string {
  if (text.includes(':')) {
    const afterColon = text.split(':').slice(1).join(':').trim();
    return afterColon.replace(/^["']|["']$/g, '').trim();
  }
  return text.replace(/^["']|["']$/g, '').trim();
}

const knownNames = new Set(['baran', 'dilan', 'dayik', 'rojin', 'hêvî', 'ava', 'dara', 'berîvan', 'rojda']);

function splitIntoWords(text: string): Array<{ text: string; isWord: boolean; isName?: boolean }> {
  const words: Array<{ text: string; isWord: boolean; isName?: boolean }> = [];
  const regex = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]+|[^\s])/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      words.push({ text: text.substring(lastIndex, match.index), isWord: false });
    }
    const isWord = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9]/.test(match[0]);
    if (isWord) {
      const cleanWord = match[0].toLowerCase().replace(/[.,!?";:]/g, '').trim();
      const beforeWord = text.substring(0, match.index).trim();
      const isNameWord = knownNames.has(cleanWord) && beforeWord.endsWith(':');
      words.push({ text: match[0], isWord: true, isName: isNameWord });
    } else {
      words.push({ text: match[0], isWord: false });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    words.push({ text: text.substring(lastIndex), isWord: false });
  }
  return words;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof globalThis.btoa !== 'undefined') {
    return globalThis.btoa(binary);
  }
  // Fallback for environments without btoa
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
    result += chars[a >> 2] + chars[((a & 3) << 4) | (b >> 4)] + chars[((b & 15) << 2) | (c >> 6)] + chars[c & 63];
  }
  const pad = binary.length % 3;
  if (pad === 1) result = result.slice(0, -2);
  else if (pad === 2) result = result.slice(0, -1);
  return result;
}

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const story: Story | undefined = id ? stories.find((s) => s.id === id) : undefined;

  const [showEnglish, setShowEnglish] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [selectedWord, setSelectedWord] = useState<{ word: string; translation: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const { width } = useWindowDimensions();

  const isRead = useStoriesProgressStore((s) => s.isRead)(id || '');
  const markRead = useStoriesProgressStore((s) => s.markRead);
  const markUnread = useStoriesProgressStore((s) => s.markUnread);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  }, []);

  const stopSpeaking = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentParagraphIndex(null);
  }, []);

  const playKurdishAudio = useCallback(
    async (text: string, paragraphIndex: number) => {
      const cleanText = extractSpeechContent(text);
      if (!cleanText) return;

      await stopSpeaking();
      setIsPlaying(true);
      setCurrentParagraphIndex(paragraphIndex);
      setAudioLoading(true);

      const filename = getAudioFilename(cleanText);

      // 1) Try local bundled story MP3 first (offline, fast)
      const localAsset = storyAudioAssets[filename];
      if (localAsset) {
        try {
          await Asset.loadAsync(localAsset);
          const asset = Asset.fromModule(localAsset);
          const uri = asset.localUri || asset.uri;
          if (uri) {
            const { sound } = await Audio.Sound.createAsync(
              { uri },
              { shouldPlay: true }
            );
            soundRef.current = sound;
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
                setCurrentParagraphIndex(null);
                sound.unloadAsync().catch(() => {});
                soundRef.current = null;
              }
            });
            setAudioLoading(false);
            return;
          }
        } catch {
          // Fall through to web or TTS
        }
      }

      // 2) Try pre-generated MP3 from web (EXPO_PUBLIC_WEB_URL)
      const mp3Url = WEB_URL ? `${WEB_URL.replace(/\/$/, '')}/audio/kurdish-tts-mp3/stories/${filename}.mp3` : '';
      if (mp3Url) {
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: mp3Url },
            { shouldPlay: true }
          );
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setCurrentParagraphIndex(null);
              sound.unloadAsync().catch(() => {});
              soundRef.current = null;
            }
          });
          setAudioLoading(false);
          return;
        } catch {
          // Fall through to TTS API
        }
      }

      try {
        const response = await fetch('https://www.kurdishtts.com/api/tts-proxy', {
          method: 'POST',
          headers: {
            'x-api-key': TTS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: cleanText, speaker_id: 'kurmanji_12' }),
        });
        if (!response.ok) {
          setIsPlaying(false);
          setCurrentParagraphIndex(null);
          setAudioLoading(false);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const base64 = arrayBufferToBase64(arrayBuffer);
        const cacheDir = FileSystem.cacheDirectory;
        if (cacheDir) {
          const fileUri = `${cacheDir}tts_${filename}.mp3`;
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const { sound } = await Audio.Sound.createAsync(
            { uri: fileUri },
            { shouldPlay: true }
          );
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setCurrentParagraphIndex(null);
              sound.unloadAsync().catch(() => {});
              FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
              soundRef.current = null;
            }
          });
        }
      } catch {
        setIsPlaying(false);
        setCurrentParagraphIndex(null);
      }
      setAudioLoading(false);
    },
    [stopSpeaking]
  );

  const handleWordPress = useCallback((word: string) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?";:]/g, '').trim();
    const translation = vocabularyDict[cleanWord];
    if (translation) setSelectedWord({ word: cleanWord, translation });
  }, []);

  const toggleMarkRead = useCallback(() => {
    if (!id) return;
    if (isRead) markUnread(id);
    else markRead(id);
  }, [id, isRead, markRead, markUnread]);

  if (!story) {
    return (
      <View style={styles.pageWrap}>
        <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </Pressable>
            <Text style={styles.headerTitle}>Story not found</Text>
            <View style={styles.headerRight} />
          </View>
          <View style={styles.centered}>
            <Text style={styles.notFoundText}>This story could not be loaded.</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const activeVocab = extractVocabulary(story);

  return (
    <View style={styles.pageWrap}>
      <LinearGradient colors={[SKY, SKY_DEEPER, SKY]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backHit} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>{story.title}</Text>
          <View style={styles.headerRight} />
        </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.controls}>
          <Pressable
            style={[styles.controlBtn, showEnglish && styles.controlBtnActive]}
            onPress={() => setShowEnglish(!showEnglish)}
          >
            <Ionicons name={showEnglish ? 'eye' : 'eye-off'} size={20} color={showEnglish ? '#fff' : '#374151'} />
            <Text style={[styles.controlBtnText, showEnglish && styles.controlBtnTextActive]}>
              {showEnglish ? 'English On' : 'English Off'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.controlBtn, showVocabulary && styles.controlBtnActiveLavender]}
            onPress={() => setShowVocabulary(!showVocabulary)}
          >
            <Ionicons name="book" size={20} color={showVocabulary ? '#fff' : '#374151'} />
            <Text style={[styles.controlBtnText, showVocabulary && styles.controlBtnTextActive]}>
              {showVocabulary ? 'Hide' : 'Show'} Vocab ({activeVocab.length})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.controlBtn, isRead && styles.controlBtnRead]}
            onPress={toggleMarkRead}
          >
            <Ionicons name={isRead ? 'checkmark-circle' : 'book-outline'} size={20} color={isRead ? '#fff' : '#374151'} />
            <Text style={[styles.controlBtnText, isRead && styles.controlBtnTextActive]}>
              {isRead ? 'Read' : 'Mark Read'}
            </Text>
          </Pressable>
        </View>

        {showVocabulary && (
          <View style={styles.vocabSection}>
            <Text style={styles.vocabTitle}>Vocabulary ({activeVocab.length} words)</Text>
            <View style={styles.vocabGrid}>
              {activeVocab.map((item, idx) => (
                <View key={idx} style={styles.vocabItem}>
                  <Text style={styles.vocabWord}>{item.word}</Text>
                  <Text style={styles.vocabTranslation}>{item.translation}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.paragraphs}>
          {story.paragraphs.map((p, i) => {
            const words = splitIntoWords(p.ku);
            const isCurrentPlaying = isPlaying && currentParagraphIndex === i;
            return (
              <View key={i} style={styles.paragraph}>
                <View style={styles.paragraphRow}>
                  <Text style={styles.paragraphKu} selectable>
                    {words.map((item, idx) => {
                      if (!item.isWord) return <Text key={idx}>{item.text}</Text>;
                      if (item.isName) return <Text key={idx}>{item.text}</Text>;
                      const cleanWord = item.text.toLowerCase().replace(/[.,!?";:]/g, '').trim();
                      const hasTranslation = vocabularyDict[cleanWord];
                      return (
                        <Text
                          key={idx}
                          onPress={() => hasTranslation && handleWordPress(item.text)}
                          style={hasTranslation ? styles.tappableWord : undefined}
                        >
                          {item.text}
                        </Text>
                      );
                    })}
                  </Text>
                  <Pressable
                    style={[styles.playBtn, isCurrentPlaying && styles.playBtnActive]}
                    onPress={() => {
                      if (isCurrentPlaying) stopSpeaking();
                      else playKurdishAudio(p.ku, i);
                    }}
                    disabled={audioLoading && !isCurrentPlaying}
                  >
                    {audioLoading && currentParagraphIndex === i ? (
                      <ActivityIndicator size="small" color={isCurrentPlaying ? '#fff' : BRAND_BLUE} />
                    ) : (
                      <Ionicons name={isCurrentPlaying ? 'stop' : 'volume-high'} size={22} color={isCurrentPlaying ? '#fff' : BRAND_BLUE} />
                    )}
                  </Pressable>
                </View>
                {showEnglish && <Text style={styles.paragraphEn}>{p.en}</Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedWord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedWord(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedWord(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.tooltip, { maxWidth: width - 32 }]}>
                {selectedWord && (
                  <>
                    <Text style={styles.tooltipWord}>{selectedWord.word}</Text>
                    <Text style={styles.tooltipTranslation}>{selectedWord.translation}</Text>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
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
  headerRight: {
    width: 44,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  controlBtnActive: {
    backgroundColor: BRAND_BLUE,
  },
  controlBtnActiveLavender: {
    backgroundColor: '#8b5cf6',
  },
  controlBtnRead: {
    backgroundColor: '#10b981',
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  controlBtnTextActive: {
    color: '#fff',
  },
  vocabSection: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  vocabTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  vocabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vocabItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  vocabWord: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  vocabTranslation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  paragraphs: {
    gap: 16,
  },
  paragraph: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paragraphRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  paragraphKu: {
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
    color: '#111827',
  },
  tappableWord: {
    color: BRAND_BLUE,
    textDecorationLine: 'underline',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${BRAND_BLUE}18`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: {
    backgroundColor: BRAND_BLUE,
  },
  paragraphEn: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: BRAND_BLUE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipWord: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_BLUE,
    marginBottom: 6,
  },
  tooltipTranslation: {
    fontSize: 14,
    color: '#374151',
  },
});
