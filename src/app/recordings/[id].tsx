import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Play, UploadCloud, Trash2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useRecordingStore } from '../../store/recordingStore';
import { recordingSessionService } from '../../application/services/RecordingSessionService';
import { TimelineSegmentCard } from '../../presentation/components/TimelineSegmentCard';
import { UploadMockModal } from '../../presentation/components/UploadMockModal';
import { formatDurationMs } from '../../utils/duration';
import { formatDateTime } from '../../utils/dateTime';

export default function RecordingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const recordings = useRecordingStore((state) => state.recordings);
  const session = recordings.find(r => r.id === id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3e1f75" />
      </SafeAreaView>
    );
  }

  const handlePlay = async () => {
    if (!session.audioUri) {
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
          { uri: session.audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
          }
        });
      }
      setIsPlaying(true);
    } catch (error) {
      Alert.alert("Playback Error", "Failed to play the recording.");
    }
  };

  const handleUpload = async () => {
    setUploadModalVisible(true);
    await recordingSessionService.mockUpload(session.id);
  };

  const handleDelete = () => {
    Alert.alert("Delete Recording", "Are you sure you want to delete this recording?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: async () => {
          await recordingSessionService.deleteRecording(session.id);
          router.back();
        }
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="bg-primary pt-14 pb-4 px-4 shadow-sm rounded-b-3xl flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Details</Text>
        <TouchableOpacity onPress={handleDelete} className="p-2">
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <Text className="text-2xl font-bold text-text mb-1">{session.title}</Text>
          <Text className="text-sm text-textSecondary mb-6">{formatDateTime(session.startedAt)}</Text>
          
          <View className="flex-row justify-between mb-6">
            <View>
              <Text className="text-xs text-textSecondary mb-1">Total Length</Text>
              <Text className="text-xl font-semibold text-primary">{formatDurationMs(session.durationMs)}</Text>
            </View>
            <View>
              <Text className="text-xs text-textSecondary mb-1">Pauses</Text>
              <Text className="text-xl font-semibold text-text">{session.pauseCount}</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handlePlay}
            className="bg-gray-100 rounded-2xl p-4 flex-row justify-center items-center"
          >
            <Play color="#3e1f75" fill={isPlaying ? "#3e1f75" : "transparent"} size={20} className="mr-2" />
            <Text className="font-semibold text-primary">{isPlaying ? "Pause Playback" : "Play Recording"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleUpload}
          disabled={session.uploadStatus === 'uploaded' || session.uploadStatus === 'uploading'}
          className={`flex-row justify-center items-center py-4 rounded-2xl shadow-sm mb-8 ${
            session.uploadStatus === 'uploaded' ? 'bg-green-500' : 'bg-primary'
          }`}
        >
          <UploadCloud color="white" size={20} className="mr-2" />
          <Text className="text-white font-semibold text-lg">
            {session.uploadStatus === 'uploaded' ? 'Uploaded' : 'Upload Recording'}
          </Text>
        </TouchableOpacity>

        <Text className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4 px-2">
          Segment Details
        </Text>
        <View>
          {session.timelineSegments.map((segment) => (
            <TimelineSegmentCard key={segment.id} segment={segment} />
          ))}
        </View>
      </ScrollView>

      <UploadMockModal 
        visible={uploadModalVisible} 
        status={session.uploadStatus || 'not_uploaded'} 
        onClose={() => setUploadModalVisible(false)} 
      />
    </SafeAreaView>
  );
}
