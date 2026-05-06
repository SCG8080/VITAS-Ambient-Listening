import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileAudio, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react-native';
import { RecordingSession } from '../../domain/entities/RecordingSession';
import { formatDateTime } from '../../utils/dateTime';
import { formatDurationMs } from '../../utils/duration';

interface RecordingListItemProps {
  session: RecordingSession;
  onPress: () => void;
}

export function RecordingListItem({ session, onPress }: RecordingListItemProps) {
  const renderUploadStatus = () => {
    switch (session.uploadStatus) {
      case 'uploaded':
        return <CheckCircle size={16} color="#10B981" />;
      case 'uploading':
        return <UploadCloud size={16} color="#3B82F6" />;
      case 'failed':
        return <AlertCircle size={16} color="#EF4444" />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center"
    >
      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4">
        <FileAudio color="#3e1f75" size={24} />
      </View>
      
      <View className="flex-1">
        <Text className="text-base font-semibold text-text mb-1" numberOfLines={1}>
          {session.title}
        </Text>
        <Text className="text-xs text-textSecondary">
          {formatDateTime(session.startedAt)}
        </Text>
        <View className="flex-row items-center mt-2 space-x-3">
          <Text className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {formatDurationMs(session.durationMs)}
          </Text>
          {session.pauseCount > 0 && (
            <Text className="text-xs text-textSecondary">
              {session.pauseCount} pause{session.pauseCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>
      
      <View className="ml-2 items-center justify-center">
        {renderUploadStatus()}
      </View>
    </TouchableOpacity>
  );
}
