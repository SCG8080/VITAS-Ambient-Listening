import React from 'react';
import { View, Text } from 'react-native';
import { Mic, PauseCircle } from 'lucide-react-native';
import { RecordingTimelineSegment } from '../../domain/entities/RecordingTimelineSegment';
import { formatTimeOnly } from '../../utils/dateTime';
import { formatDurationMs } from '../../utils/duration';

export function TimelineSegmentCard({ segment }: { segment: RecordingTimelineSegment }) {
  const isRecording = segment.type === 'recording';
  const Icon = isRecording ? Mic : PauseCircle;
  const color = isRecording ? '#10B981' : '#F59E0B'; // success vs warning

  return (
    <View className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isRecording ? 'bg-green-100' : 'bg-amber-100'}`}>
        <Icon color={color} size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-text">
          {isRecording ? 'Recorded Segment' : 'Paused Gap'}
        </Text>
        <Text className="text-sm text-textSecondary mt-0.5">
          {formatTimeOnly(segment.startedAt)} {segment.endedAt ? `- ${formatTimeOnly(segment.endedAt)}` : '(Active)'}
        </Text>
        {segment.reason === 'interruption' && (
          <Text className="text-xs text-amber-600 mt-1">Auto-paused due to app interruption</Text>
        )}
        {segment.reason === 'background' && (
          <Text className="text-xs text-amber-600 mt-1">Auto-paused (app went to background)</Text>
        )}
      </View>
      <View>
        <Text className="text-base font-semibold text-text">
          {segment.durationMs !== undefined ? formatDurationMs(segment.durationMs) : '--:--'}
        </Text>
      </View>
    </View>
  );
}
