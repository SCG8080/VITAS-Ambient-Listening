import React from 'react';
import { View, Text } from 'react-native';
import { RecordingStatus } from '../../domain/entities/RecordingStatus';

export function RecordingStatusBadge({ status }: { status: RecordingStatus }) {
  if (status === 'idle') return null;

  const bgColors = {
    recording: 'bg-red-100',
    paused: 'bg-amber-100',
    stopped: 'bg-gray-100'
  };

  const textColors = {
    recording: 'text-red-600',
    paused: 'text-amber-700',
    stopped: 'text-gray-600'
  };

  const labels = {
    recording: 'Recording Active',
    paused: 'Paused',
    stopped: 'Stopped'
  };

  const activeStatus = status as Exclude<RecordingStatus, 'idle'>;

  return (
    <View className={`px-4 py-1.5 rounded-full self-center ${bgColors[activeStatus]}`}>
      <View className="flex-row items-center">
        {status === 'recording' && <View className="w-2 h-2 rounded-full bg-red-600 mr-2" />}
        <Text className={`font-semibold text-sm ${textColors[activeStatus]}`}>
          {labels[activeStatus]}
        </Text>
      </View>
    </View>
  );
}
