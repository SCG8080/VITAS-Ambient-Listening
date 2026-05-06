import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAppInterruption } from '../application/services/AppInterruptionService';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import '../global.css';

export default function RootLayout() {
  // Initialize interruption handling at the root level
  useAppInterruption();

  useEffect(() => {
    // Load saved recordings on startup
    recordingSessionService.initialize();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F9FAFB' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recorder" options={{ gestureEnabled: false }} />
      <Stack.Screen name="preview" options={{ gestureEnabled: false }} />
      <Stack.Screen name="recordings/index" />
      <Stack.Screen name="recordings/[id]" />
    </Stack>
  );
}
