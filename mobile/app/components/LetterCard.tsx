import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

interface LetterCardProps {
  glyph: string;
  word: string;
  meaning: string;
  audioFile: string;
  audioAssets: Record<string, any>;
  onPlay?: () => void;
  /** Optional style for dimming when already played */
  style?: ViewStyle;
}

export default function LetterCard({
  glyph,
  word,
  meaning,
  audioFile,
  audioAssets,
  onPlay,
  style,
}: LetterCardProps) {
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      if (sound) {
        await sound.unloadAsync();
      }

      const audioAsset = audioAssets[audioFile];
      if (!audioAsset) {
        setPlaying(false);
        return;
      }

      await Asset.loadAsync(audioAsset);
      const asset = Asset.fromModule(audioAsset);

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: asset.localUri || asset.uri },
        { shouldPlay: true, volume: 1.0 }
      );

      setSound(newSound);
      setPlaying(true);
      onPlay?.();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.isPlaying) {
            setPlaying(true);
          } else if (status.didJustFinish) {
            setPlaying(false);
          }
        } else {
          setPlaying(false);
        }
      });
    } catch (error) {
      setPlaying(false);
    }
  };

  const handleButtonPress = () => {
    playSound();
  };

  return (
    <View style={[styles.pressable, style]}>
      <View style={styles.card}>
        <View style={styles.content}>
          {/* Letter on left */}
          <View style={styles.letterContainer}>
            <Text style={styles.letter}>{glyph}</Text>
          </View>

          {/* Word and meaning on right */}
          <View style={styles.textContainer}>
            <Text style={styles.word} numberOfLines={2}>
              {word}
            </Text>
            <Text style={styles.meaning} numberOfLines={2}>
              {meaning}
            </Text>
          </View>
        </View>

        {/* Small speaker icon in bottom-right - only this is pressable */}
        <Pressable
          onPress={handleButtonPress}
          style={styles.speakerContainer}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={playing ? 'volume-high' : 'volume-low-outline'}
            size={22}
            color="#4b5563"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    margin: 6,
    maxWidth: '48%', // Prevent stretching when alone in last row
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 110,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  letterContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  letter: {
    fontSize: 40,
    fontWeight: '700',
    color: '#3A86FF',
    lineHeight: 46,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 20,
  },
  word: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 22,
  },
  meaning: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  speakerContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


