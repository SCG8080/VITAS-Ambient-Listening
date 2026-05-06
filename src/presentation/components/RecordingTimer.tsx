import React from 'react';
import { Text, View } from 'react-native';
import { formatDurationMs } from '../../utils/duration';

export function RecordingTimer({ durationMs }: { durationMs: number }) {
  return (
    <View className="items-center justify-center my-6">
      <Text className="text-6xl font-light text-text tabular-nums tracking-tight">
        {formatDurationMs(durationMs)}
      </Text>
    </View>
  );
}
