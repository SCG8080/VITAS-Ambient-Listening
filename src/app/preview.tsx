import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Play, Home, UploadCloud } from 'lucide-react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { VitasHeader } from '../presentation/components/VitasHeader';
import { UploadMockModal } from '../presentation/components/UploadMockModal';
import { TimelineSegmentCard } from '../presentation/components/TimelineSegmentCard';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import { useRecordingStore } from '../store/recordingStore';
import { formatDurationMs } from '../utils/duration';
import { formatDateTime } from '../utils/dateTime';

export default function PreviewScreen() {
  const router = useRouter();
  const currentSession = useRecordingStore((state) => state.currentSession);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(1);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  if (!currentSession) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text>No active recording to preview.</Text>
        <TouchableOpacity onPress={() => router.replace('/')} className="mt-4 px-4 py-2 bg-primary rounded-full">
          <Text className="text-white">Go Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    setPlaybackPosition(status.positionMillis);
    setPlaybackDuration(status.durationMillis || 1);
    
    if (status.didJustFinish) {
      setIsPlaying(false);
      sound?.setPositionAsync(0);
      setPlaybackPosition(0);
    }
  };

  const handlePlayPreview = async () => {
    if (!currentSession.audioUri) {
      Alert.alert("Error", "No audio file found.");
      return;
    }

    if (isPlaying && sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }

    try {
      if (sound) {
        await sound.playAsync();
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSession.audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }
      setIsPlaying(true);
    } catch (error) {
      Alert.alert("Playback Error", "Failed to play the recording.");
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPlaybackPosition(value);
    }
  };

  const handleUpload = async () => {
    setUploadModalVisible(true);
    await recordingSessionService.mockUpload(currentSession.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VitasHeader showLogo={false} title="Recording Saved" />
      
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="text-2xl font-bold text-text mb-1">{currentSession.title}</Text>
          <Text className="text-sm text-textSecondary mb-6">{formatDateTime(currentSession.startedAt)}</Text>
          
          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-xs text-textSecondary mb-1">Total Length</Text>
              <Text className="text-xl font-semibold text-primary">{formatDurationMs(currentSession.durationMs)}</Text>
            </View>
            <View>
              <Text className="text-xs text-textSecondary mb-1">Pauses</Text>
              <Text className="text-xl font-semibold text-text">{currentSession.pauseCount}</Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 flex-col justify-center">
            <View className="flex-row items-center mb-2">
              <TouchableOpacity onPress={handlePlayPreview} className="bg-primary/10 p-3 rounded-full mr-3">
                <Play color="#3e1f75" fill={isPlaying ? "#3e1f75" : "transparent"} size={20} />
              </TouchableOpacity>
              <View className="flex-1">
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={playbackDuration}
                  value={playbackPosition}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#3e1f75"
                  maximumTrackTintColor="#D1D5DB"
                  thumbTintColor="#3e1f75"
                />
              </View>
            </View>
            <View className="flex-row justify-between px-2">
              <Text className="text-xs text-textSecondary font-medium">{formatDurationMs(playbackPosition)}</Text>
              <Text className="text-xs text-textSecondary font-medium">{formatDurationMs(playbackDuration)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleUpload}
          disabled={currentSession.uploadStatus === 'uploaded' || currentSession.uploadStatus === 'uploading'}
          className={`flex-row justify-center items-center py-4 rounded-2xl shadow-sm mb-8 ${
            currentSession.uploadStatus === 'uploaded' ? 'bg-green-500' : 'bg-primary'
          }`}
        >
          <UploadCloud color="white" size={20} className="mr-2" />
          <Text className="text-white font-semibold text-lg">
            {currentSession.uploadStatus === 'uploaded' ? 'Uploaded' : 'Upload Recording'}
          </Text>
        </TouchableOpacity>

        <Text className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4 px-2">
          Segment Details
        </Text>
        <View>
          {currentSession.timelineSegments.map((segment) => (
            <TimelineSegmentCard key={segment.id} segment={segment} />
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 items-center">
        <TouchableOpacity 
          onPress={() => router.replace('/')}
          className="flex-row items-center justify-center p-3"
        >
          <Home color="#6B7280" size={20} className="mr-2" />
          <Text className="font-medium text-textSecondary">Back to Home</Text>
        </TouchableOpacity>
      </View>

      <UploadMockModal 
        visible={uploadModalVisible} 
        status={currentSession.uploadStatus || 'not_uploaded'} 
        onClose={() => setUploadModalVisible(false)} 
      />
    </SafeAreaView>
  );
}
