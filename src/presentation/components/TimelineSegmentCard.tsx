import React from 'react';
import { View, Text } from 'react-native';
import { RecordingTimelineSegment } from '../../domain/entities/RecordingTimelineSegment';
import { formatTimeOnly } from '../../utils/dateTime';
import { formatDurationMs } from '../../utils/duration';
import { C, FS } from '../theme';

export function TimelineSegmentCard({ segment }: { segment: RecordingTimelineSegment }) {
  const isRecording = segment.type === 'recording';
  const isActive = !segment.endedAt;

  const dotColor = isRecording ? C.violet : C.amber;
  const dotGlow  = isRecording
    ? '0 0 6px rgba(167,139,250,0.8)'
    : '0 0 5px rgba(245,158,11,0.7)';
  const durColor = isRecording ? C.textAccent : 'rgba(245,158,11,0.85)';

  const label = isRecording ? 'Recording' : 'Paused';
  const reasonSuffix =
    (segment.reason === 'interruption' || segment.reason === 'background') ? ' · auto' : '';

  const timeRange = isActive
    ? `${formatTimeOnly(segment.startedAt)} – now`
    : `${formatTimeOnly(segment.startedAt)} – ${formatTimeOnly(segment.endedAt!)}`;

  const durationText = isActive
    ? '…'
    : segment.durationMs !== undefined
      ? formatDurationMs(segment.durationMs)
      : '--:--';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
      {/* Colored dot */}
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

      {/* Label + time range */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Text style={{ fontSize: FS.small, fontWeight: '600', color: 'rgba(255,255,255,0.88)' }}>
            {label}
          </Text>
          {isActive && (
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: dotColor, opacity: 0.9 } as any} />
          )}
        </View>
        <Text style={{ fontSize: 9, fontWeight: '500', color: C.textSecondary, marginTop: 1, letterSpacing: 0.2 }}>
          {timeRange}{reasonSuffix}
        </Text>
      </View>

      {/* Duration */}
      <Text style={{ fontSize: FS.small, fontWeight: '700', color: isActive ? C.textSecondary : durColor, flexShrink: 0 }}>
        {durationText}
      </Text>
    </View>
  );
}

export function TimelineDivider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 2 }} />;
}
