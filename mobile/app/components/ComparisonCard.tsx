import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ComparisonCardProps {
  letter1: { glyph: string; word: string; meaning: string; audioFile: string };
  letter2: { glyph: string; word: string; meaning: string; audioFile: string };
  tip: string;
  audioAssets: Record<string, any>;
  onPlay?: () => void;
}

export default function ComparisonCard({
  letter1,
  letter2,
  tip,
  audioAssets,
  onPlay,
}: ComparisonCardProps) {
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
          <Pressable
            onPress={async () => {
              // Play audio for letter1
              const { Audio } = await import('expo-av');
              const { Asset } = await import('expo-asset');
              try {
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
                  sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                      sound.unloadAsync();
                    }
                  });
                  onPlay?.();
                }
              } catch (error) {
                console.error('Error playing audio:', error);
              }
            }}
            style={styles.audioButton}
          >
            <Ionicons name="volume-high" size={18} color="#2563eb" />
          </Pressable>
        </View>

        <Text style={styles.vs}>vs</Text>

        <View style={styles.letterColumn}>
          <Text style={styles.glyph}>{letter2.glyph}</Text>
          <Text style={styles.label}>Long sound</Text>
          <View style={styles.wordContainer}>
            <Text style={styles.word}>{letter2.word}</Text>
            <Text style={styles.meaning}>{letter2.meaning}</Text>
          </View>
          <Pressable
            onPress={async () => {
              // Play audio for letter2
              const { Audio } = await import('expo-av');
              const { Asset } = await import('expo-asset');
              try {
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
                  sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                      sound.unloadAsync();
                    }
                  });
                  onPlay?.();
                }
              } catch (error) {
                console.error('Error playing audio:', error);
              }
            }}
            style={styles.audioButton}
          >
            <Ionicons name="volume-high" size={18} color="#2563eb" />
          </Pressable>
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
  audioButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
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

