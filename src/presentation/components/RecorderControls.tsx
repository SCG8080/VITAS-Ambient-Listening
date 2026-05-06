import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Play, Pause, Square, Circle } from 'lucide-react-native';
import { RecordingStatus } from '../../domain/entities/RecordingStatus';

interface RecorderControlsProps {
  status: RecordingStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function RecorderControls({ status, onStart, onPause, onResume, onStop }: RecorderControlsProps) {
  if (status === 'idle' || status === 'stopped') {
    return (
      <TouchableOpacity 
        onPress={onStart}
        className="w-24 h-24 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30"
        activeOpacity={0.8}
      >
        <Circle fill="white" color="white" size={32} />
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center space-x-8">
      {status === 'recording' ? (
        <TouchableOpacity 
          onPress={onPause}
          className="w-16 h-16 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Pause color="#3e1f75" fill="#3e1f75" size={24} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          onPress={onResume}
          className="w-16 h-16 rounded-full bg-white border border-gray-200 items-center justify-center shadow-sm"
          activeOpacity={0.7}
        >
          <Play color="#3e1f75" fill="#3e1f75" size={24} className="ml-1" />
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        onPress={onStop}
        className="w-20 h-20 rounded-full bg-danger items-center justify-center shadow-lg shadow-danger/30"
        activeOpacity={0.8}
      >
        <Square color="white" fill="white" size={28} />
      </TouchableOpacity>
    </View>
  );
}
