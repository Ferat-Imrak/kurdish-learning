import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

interface DayCardProps {
  day: { ku: string; en: string; description: string; order: number };
  audioFile: string;
  audioAssets: Record<string, any>;
  onPlay?: () => void;
  /** Optional style for dimming when already played */
  style?: ViewStyle;
}

export default function DayCard({
  day,
  audioFile,
  audioAssets,
  onPlay,
  style,
}: DayCardProps) {
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = () => {
    playSound();
  };

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.pressable, style ?? undefined]}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.dayKurdish} numberOfLines={1}>
              {day.ku.charAt(0).toUpperCase() + day.ku.slice(1)}
            </Text>
            <Text style={styles.dayEnglish} numberOfLines={1}>
              {day.en}
            </Text>
          </View>
        </View>
        <View style={styles.speakerContainer}>
          <Ionicons
            name={playing ? 'volume-high' : 'volume-low-outline'}
            size={22}
            color="#4b5563"
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    margin: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 100,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  textContainer: {
    flex: 1,
    paddingRight: 32,
  },
  dayKurdish: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A86FF',
    marginBottom: 6,
  },
  dayEnglish: {
    fontSize: 14,
    color: '#6b7280',
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


