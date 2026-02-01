import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComparisonCardProps {
  letter1: { glyph: string; word: string; meaning: string; audioFile: string };
  letter2: { glyph: string; word: string; meaning: string; audioFile: string };
  tip: string;
  audioAssets: Record<string, any>;
  onPlay?: (audioKey: string) => void;
  audioKey1?: string;
  audioKey2?: string;
}

export default function ComparisonCard({
  letter1,
  letter2,
  tip,
  audioAssets,
  onPlay,
  audioKey1,
  audioKey2,
}: ComparisonCardProps) {
  const [playing1, setPlaying1] = useState(false);
  const [playing2, setPlaying2] = useState(false);
  const [sound1, setSound1] = useState<any>(null);
  const [sound2, setSound2] = useState<any>(null);

  // Cleanup sounds on unmount
  useEffect(() => {
    return () => {
      if (sound1) {
        sound1.unloadAsync();
      }
      if (sound2) {
        sound2.unloadAsync();
      }
    };
  }, [sound1, sound2]);

  return (
    <View style={styles.card}>
      <View style={styles.comparisonRow}>
        <View style={styles.letterColumn}>
          <Text style={styles.glyph}>{letter1.glyph}</Text>
          <Text style={styles.label}>Short sound</Text>
          <View style={styles.wordContainer}>
            <Text style={styles.word}>{letter1.word}</Text>
            <Text style={styles.meaning}>{letter1.meaning}</Text>
          </View>
          <View style={styles.audioButtonContainer}>
            <Pressable
              onPress={async () => {
                // Play audio for letter1
                const { Audio } = await import('expo-av');
                const { Asset } = await import('expo-asset');
                try {
                  if (sound1) {
                    await sound1.unloadAsync();
                  }
                  
                  await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                  });
                  const audioAsset = audioAssets[letter1.audioFile];
                  if (audioAsset) {
                    await Asset.loadAsync(audioAsset);
                    const asset = Asset.fromModule(audioAsset);
                    const { sound } = await Audio.Sound.createAsync(
                      { uri: asset.localUri || asset.uri },
                      { shouldPlay: true, volume: 1.0 }
                    );
                    setSound1(sound);
                    setPlaying1(true);
                    sound.setOnPlaybackStatusUpdate((status) => {
                      if (status.isLoaded) {
                        if (status.isPlaying) {
                          setPlaying1(true);
                        } else if (status.didJustFinish) {
                          setPlaying1(false);
                          sound.unloadAsync();
                        }
                      } else {
                        setPlaying1(false);
                      }
                    });
                    onPlay?.(audioKey1 || `comparison-${letter1.glyph}-1`);
                  }
                } catch (error) {
                  console.error('Error playing audio:', error);
                  setPlaying1(false);
                }
              }}
              style={styles.audioButton}
            >
              <Ionicons 
                name={playing1 ? 'volume-high' : 'volume-low-outline'} 
                size={22} 
                color="#4b5563" 
              />
            </Pressable>
          </View>
        </View>

        <Text style={styles.vs}>vs</Text>

        <View style={styles.letterColumn}>
          <Text style={styles.glyph}>{letter2.glyph}</Text>
          <Text style={styles.label}>Long sound</Text>
          <View style={styles.wordContainer}>
            <Text style={styles.word}>{letter2.word}</Text>
            <Text style={styles.meaning}>{letter2.meaning}</Text>
          </View>
          <View style={styles.audioButtonContainer}>
            <Pressable
              onPress={async () => {
                // Play audio for letter2
                const { Audio } = await import('expo-av');
                const { Asset } = await import('expo-asset');
                try {
                  if (sound2) {
                    await sound2.unloadAsync();
                  }
                  
                  await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                  });
                  const audioAsset = audioAssets[letter2.audioFile];
                  if (audioAsset) {
                    await Asset.loadAsync(audioAsset);
                    const asset = Asset.fromModule(audioAsset);
                    const { sound } = await Audio.Sound.createAsync(
                      { uri: asset.localUri || asset.uri },
                      { shouldPlay: true, volume: 1.0 }
                    );
                    setSound2(sound);
                    setPlaying2(true);
                    sound.setOnPlaybackStatusUpdate((status) => {
                      if (status.isLoaded) {
                        if (status.isPlaying) {
                          setPlaying2(true);
                        } else if (status.didJustFinish) {
                          setPlaying2(false);
                          sound.unloadAsync();
                        }
                      } else {
                        setPlaying2(false);
                      }
                    });
                    onPlay?.(audioKey2 || `comparison-${letter2.glyph}-2`);
                  }
                } catch (error) {
                  console.error('Error playing audio:', error);
                  setPlaying2(false);
                }
              }}
              style={styles.audioButton}
            >
              <Ionicons 
                name={playing2 ? 'volume-high' : 'volume-low-outline'} 
                size={22} 
                color="#4b5563" 
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipText}>
          <Text style={styles.tipBold}>Tip:</Text> {tip}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  letterColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  glyph: {
    fontSize: 48,
    fontWeight: '700',
    color: '#3A86FF',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  wordContainer: {
    alignItems: 'center',
    gap: 4,
  },
  word: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  meaning: {
    fontSize: 13,
    color: '#6b7280',
  },
  audioButtonContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  audioButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vs: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginHorizontal: 12,
  },
  tipBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tipText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    textAlign: 'center',
  },
  tipBold: {
    fontWeight: '700',
    color: '#111827',
  },
});

