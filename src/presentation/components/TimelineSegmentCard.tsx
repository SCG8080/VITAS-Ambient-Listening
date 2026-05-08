import React from 'react';
import { View, Text } from 'react-native';
import { RecordingTimelineSegment } from '../../domain/entities/RecordingTimelineSegment';
import { formatTimeOnly } from '../../utils/dateTime';
import { formatDurationMs } from '../../utils/duration';
import { C, FS } from '../theme';

// Rendered as a bare row — parent wraps multiple rows in one GlassCard.
// Dividers between rows are the parent's responsibility.
export function TimelineSegmentCard({ segment }: { segment: RecordingTimelineSegment }) {
  const isRecording = segment.type === 'recording';
  const dotColor = isRecording ? C.violet : C.amber;
  const dotGlow = isRecording
    ? '0 0 6px rgba(167,139,250,0.8)'
    : '0 0 5px rgba(245,158,11,0.7)';
  const durColor = isRecording ? C.textAccent : 'rgba(245,158,11,0.8)';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
      <View
        style={{
          width: 7,
          height: 7,
          borderRadius: 3.5,
          backgroundColor: dotColor,
          flexShrink: 0,
          boxShadow: dotGlow,
        } as any}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: FS.small, fontWeight: '600', color: 'rgba(255,255,255,0.88)' }}>
          {isRecording ? 'Recording' : 'Paused'}
        </Text>
        <Text style={{ fontSize: 9, fontWeight: '500', color: C.textSecondary, marginTop: 1, letterSpacing: 0.2 }}>
          {formatTimeOnly(segment.startedAt)}
          {segment.endedAt ? ` – ${formatTimeOnly(segment.endedAt)}` : ' – now'}
          {(segment.reason === 'interruption' || segment.reason === 'background') && ' · auto'}
        </Text>
      </View>
      <Text style={{ fontSize: FS.small, fontWeight: '700', color: durColor, flexShrink: 0 }}>
        {segment.durationMs !== undefined ? formatDurationMs(segment.durationMs) : '--:--'}
      </Text>
    </View>
  );
}

// Thin separator between timeline rows inside one GlassCard
export function TimelineDivider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 2 }} />;
}
