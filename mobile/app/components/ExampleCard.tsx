import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

interface ExampleCardProps {
  kurdish: string;
  english: string;
  audioFile: string;
  audioAssets: Record<string, any>;
  onPlay?: () => void;
}

export default function ExampleCard({
  kurdish,
  english,
  audioFile,
  audioAssets,
  onPlay,
}: ExampleCardProps) {
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
    <View style={styles.exampleCardPressable}>
      <View style={styles.exampleCard}>
        <View style={styles.exampleTextContainer}>
          <Text style={styles.exampleKurdish}>{kurdish}</Text>
          <Text style={styles.exampleEnglish}>{english}</Text>
        </View>
        {/* Only the speaker icon is pressable */}
        <Pressable
          onPress={handleButtonPress}
          style={styles.exampleSpeakerContainer}
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
  exampleCardPressable: {
    width: '100%',
  },
  exampleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 80,
    position: 'relative',
  },
  exampleTextContainer: {
    flex: 1,
    paddingRight: 32,
  },
  exampleKurdish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  exampleEnglish: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  exampleSpeakerContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
