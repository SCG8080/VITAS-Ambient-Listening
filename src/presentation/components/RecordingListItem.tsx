import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music } from 'lucide-react-native';
import { RecordingSession } from '../../domain/entities/RecordingSession';
import { formatDateTime } from '../../utils/dateTime';
import { formatDurationMs } from '../../utils/duration';
import { GlassCard } from './GlassCard';
import { C, FS, G, R } from '../theme';

interface Props {
  session: RecordingSession;
  onPress: () => void;
}

export function RecordingListItem({ session, onPress }: Props) {
  const isUploaded = session.uploadStatus === 'uploaded';
  const isUploading = session.uploadStatus === 'uploading';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <GlassCard padding={0}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 }}>
          {/* Icon thumbnail */}
          <LinearGradient
            colors={G.icon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 34,
              height: 34,
              borderRadius: R.el,
              borderCurve: 'continuous',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(124,58,237,0.45)',
            } as any}
          >
            <Music size={14} color="rgba(255,255,255,0.9)" />
          </LinearGradient>

          {/* Meta */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{ fontSize: FS.small, fontWeight: '600', color: 'rgba(255,255,255,0.88)' }}
            >
              {session.title}
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '500', color: C.textSecondary, marginTop: 2, letterSpacing: 0.2 }}>
              {formatDateTime(session.startedAt)}
              {session.pauseCount > 0 ? ` · ${session.pauseCount} pause${session.pauseCount !== 1 ? 's' : ''}` : ''}
            </Text>
          </View>

          {/* Right side */}
          <View style={{ alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
            <Text style={{ fontSize: FS.small, fontWeight: '700', color: C.textAccent }}>
              {formatDurationMs(session.durationMs)}
            </Text>
            {session.transcription?.status === 'completed' && (
              <View style={{ backgroundColor: 'rgba(124, 58, 237, 0.14)', borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)', borderRadius: R.chip, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 7.5, fontWeight: '700', color: '#A78BFA' }}>Transcribed</Text>
              </View>
            )}
            {isUploaded && (
              <View style={{ backgroundColor: C.greenBg, borderWidth: 1, borderColor: C.greenBorder, borderRadius: R.chip, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 7.5, fontWeight: '700', color: '#34D399' }}>✓ Done</Text>
              </View>
            )}
            {isUploading && (
              <View style={{ backgroundColor: 'rgba(96,165,250,0.14)', borderWidth: 1, borderColor: 'rgba(96,165,250,0.25)', borderRadius: R.chip, paddingHorizontal: 7, paddingVertical: 2 }}>
                <Text style={{ fontSize: 7.5, fontWeight: '700', color: '#93C5FD' }}>Uploading…</Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}
