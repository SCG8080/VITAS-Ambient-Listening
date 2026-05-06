import React from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Inbox } from 'lucide-react-native';
import { useRecordingStore } from '../../store/recordingStore';
import { RecordingListItem } from '../../presentation/components/RecordingListItem';
import { BrandLogo } from '../../presentation/components/BrandLogo';

export default function RecordingsListScreen() {
  const router = useRouter();
  const recordings = useRecordingStore((state) => state.recordings);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="bg-primary pt-14 pb-4 px-4 shadow-sm rounded-b-3xl flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <BrandLogo width={100} height={32} />
        <View className="w-11" />
      </View>

      <View className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-text mb-6 ml-2">My Recordings</Text>

        {recordings.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-20">
            <View className="bg-gray-100 p-6 rounded-full mb-4">
              <Inbox color="#9CA3AF" size={48} />
            </View>
            <Text className="text-lg font-medium text-textSecondary mb-2">No recordings yet</Text>
            <Text className="text-sm text-gray-400 text-center px-8">
              Start your first ambient recording from the home screen.
            </Text>
          </View>
        ) : (
          <FlatList
            data={[...recordings].reverse()} // Show newest first
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }) => (
              <RecordingListItem 
                session={item} 
                onPress={() => router.push(`/recordings/${item.id}`)} 
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
