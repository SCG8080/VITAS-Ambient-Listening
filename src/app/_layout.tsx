import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppInterruption } from '../application/services/AppInterruptionService';
import { useCallDetection } from '../application/services/useCallDetection';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import { SplashOverlay } from '../presentation/components/SplashOverlay';
import '../global.css';

export default function RootLayout() {
  useAppInterruption();
  useCallDetection();

  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
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
      {splashVisible && <SplashOverlay onDone={() => setSplashVisible(false)} />}
    </>
  );
}
