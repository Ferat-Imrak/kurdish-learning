import { Stack } from 'expo-router';

export default function StoriesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
