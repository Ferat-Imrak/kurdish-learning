import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

interface PhraseCardProps {
  kurdish: string;
  english: string;
  audioFile: string;
  audioAssets: Record<string, any>;
  onPlay?: () => void;
}

export default function PhraseCard({
  kurdish,
  english,
  audioFile,
  audioAssets,
  onPlay,
}: PhraseCardProps) {
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

  return (
    <View style={styles.phraseCard}>
      <Pressable
        onPress={playSound}
        style={({ pressed }) => [
          styles.phraseContent,
          pressed && styles.phrasePressed,
        ]}
      >
        <View style={styles.phraseTextContainer}>
          <Text style={styles.phraseKurdish}>{kurdish}</Text>
          <Text style={styles.phraseEnglish}>{english}</Text>
        </View>
        <View style={styles.phraseSpeakerContainer}>
          <Ionicons
            name={playing ? 'volume-high' : 'volume-low-outline'}
            size={20}
            color="#4b5563"
          />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  phraseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  phraseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phrasePressed: {
    opacity: 0.7,
  },
  phraseTextContainer: {
    flex: 1,
    paddingRight: 32,
  },
  phraseKurdish: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  phraseEnglish: {
    fontSize: 14,
    color: '#6b7280',
  },
  phraseSpeakerContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


