import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppInterruption } from '../application/services/AppInterruptionService';
import { useCallDetection } from '../application/services/useCallDetection';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import '../global.css';

export default function RootLayout() {
  // Initialize interruption handling at the root level
  useAppInterruption();
  useCallDetection();

  useEffect(() => {
    // Load saved recordings on startup
    recordingSessionService.initialize();
  }, []);

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0621' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="recorder" options={{ gestureEnabled: false }} />
      <Stack.Screen name="preview" options={{ gestureEnabled: false }} />
      <Stack.Screen name="recordings/index" />
      <Stack.Screen name="recordings/[id]" />
    </Stack>
    </>
  );
}
