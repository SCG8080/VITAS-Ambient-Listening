import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { RecordingStatus } from '../../domain/entities/RecordingStatus';
import { C, R } from '../theme';

export function RecordingStatusBadge({ status }: { status: RecordingStatus }) {
  if (status === 'idle' || status === 'stopped') return null;

  const isRecording = status === 'recording';

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: isRecording ? C.redBg : 'rgba(245,158,11,0.13)',
        borderWidth: 1,
        borderColor: isRecording ? C.redBorder : 'rgba(245,158,11,0.28)',
        borderRadius: R.chip,
        borderCurve: 'continuous',
        paddingVertical: 4,
        paddingLeft: 8,
        paddingRight: 10,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: isRecording ? C.red : C.amber,
          boxShadow: isRecording
            ? '0 0 7px rgba(239,68,68,0.9)'
            : '0 0 5px rgba(245,158,11,0.8)',
        } as any}
      />
      <Text
        style={{
          fontSize: 9,
          fontWeight: '700',
          letterSpacing: 1,
          color: isRecording ? '#FCA5A5' : '#FCD34D',
        }}
      >
        {isRecording ? 'LIVE' : 'PAUSED'}
      </Text>
    </Animated.View>
  );
}
