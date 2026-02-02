import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

interface NumberCardProps {
  number: number;
  kurdish: string;
  english: string;
  audioFile: string;
  audioAssets: Record<string, any>;
  onPlay?: () => void;
  /** Optional style for dimming when already played */
  style?: ViewStyle;
}

export default function NumberCard({
  number,
  kurdish,
  english,
  audioFile,
  audioAssets,
  onPlay,
  style,
}: NumberCardProps) {
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
    <View style={[styles.pressable, style ?? undefined]}>
      <View style={styles.card}>
        <View style={styles.content}>
          {/* Number on left */}
          <View style={styles.numberContainer}>
            <Text style={styles.number}>{number}</Text>
          </View>

          {/* Kurdish and English on right */}
          <View style={styles.textContainer}>
            <Text 
              style={styles.kurdish} 
              numberOfLines={2} 
              ellipsizeMode="tail"
              adjustsFontSizeToFit={false}
            >
              {kurdish}
            </Text>
            <Text 
              style={styles.english} 
              numberOfLines={2} 
              ellipsizeMode="tail"
              adjustsFontSizeToFit={false}
            >
              {english}
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
    gap: 5,
    flex: 1,
    minWidth: 0, // Allow content to shrink properly
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexShrink: 0, // Don't shrink the number
    width: 50, // Fixed width for number to give more space for text
  },
  number: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3A86FF',
    lineHeight: 32,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 28, // Space for speaker icon
    minWidth: 0, // Allow text to shrink properly
  },
  kurdish: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
    flexShrink: 1, // Allow text to shrink
    flexWrap: 'wrap', // Allow wrapping for multi-word phrases
  },
  english: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 17,
    flexShrink: 1, // Allow text to shrink
    flexWrap: 'wrap', // Allow wrapping for multi-word phrases
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


