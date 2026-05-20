import React from 'react';
import { Platform, Text } from 'react-native';
import { formatDurationMs } from '../../utils/duration';
import { C, FS } from '../theme';

export function RecordingTimer({ durationMs }: { durationMs: number }) {
  return (
    <Text
      style={{
        fontSize: FS.hero,
        fontWeight: '200',
        letterSpacing: -3,
        lineHeight: 52,
        color: C.textPrimary,
        textAlign: 'center',
        ...(Platform.OS === 'ios' ? { fontVariant: ['tabular-nums'] as const } : {}),
        textShadowColor: 'rgba(167,139,250,0.22)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 40,
      }}
    >
      {formatDurationMs(durationMs)}
    </Text>
  );
}
