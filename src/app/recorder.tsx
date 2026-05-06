import React, { useEffect } from 'react';
import { View, SafeAreaView, Text, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { VitasHeader } from '../presentation/components/VitasHeader';
import { RecorderControls } from '../presentation/components/RecorderControls';
import { RecordingWaveform } from '../presentation/components/RecordingWaveform';
import { RecordingTimer } from '../presentation/components/RecordingTimer';
import { RecordingStatusBadge } from '../presentation/components/RecordingStatusBadge';
import { TimelineSegmentCard } from '../presentation/components/TimelineSegmentCard';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import { useRecordingStore } from '../store/recordingStore';

export default function RecorderScreen() {
  const router = useRouter();
  const currentSession = useRecordingStore((state) => state.currentSession);
  const elapsedTimeMs = useRecordingStore((state) => state.elapsedTimeMs);

  useEffect(() => {
    // Show banner if paused by interruption/backgrounding
    if (currentSession?.status === 'paused') {
      const lastSegment = currentSession.timelineSegments[currentSession.timelineSegments.length - 1];
      if (lastSegment && (lastSegment.reason === 'interruption' || lastSegment.reason === 'background')) {
        Alert.alert(
          "Recording Paused",
          "Recording was automatically paused because the app was interrupted or sent to the background. Tap Resume to continue.",
          [{ text: "OK" }]
        );
      }
    }
  }, [currentSession?.status]);

  const handleStart = async () => {
    try {
      await recordingSessionService.startRecording();
    } catch (error) {
      Alert.alert("Error", "Could not start recording. Please check microphone permissions.");
    }
  };

  const handlePause = async () => {
    await recordingSessionService.pauseRecording('manual');
  };

  const handleResume = async () => {
    await recordingSessionService.resumeRecording();
  };

  const handleStop = async () => {
    await recordingSessionService.stopRecording();
    router.replace('/preview');
  };

  const isRecording = currentSession?.status === 'recording';

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VitasHeader showLogo={false} title="Ambient Recorder" />
      
      <View className="flex-1 px-4 pt-8">
        <RecordingStatusBadge status={currentSession?.status || 'idle'} />
        <RecordingTimer durationMs={elapsedTimeMs} />
        
        <View className="my-8">
          <RecordingWaveform isRecording={isRecording} />
        </View>

        <View className="items-center mb-8">
          <RecorderControls 
            status={currentSession?.status || 'idle'}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        </View>

        {currentSession && currentSession.timelineSegments.length > 0 && (
          <View className="flex-1">
            <Text className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4 px-2">
              Timeline Activity
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {[...currentSession.timelineSegments].reverse().map((segment) => (
                <TimelineSegmentCard key={segment.id} segment={segment} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
