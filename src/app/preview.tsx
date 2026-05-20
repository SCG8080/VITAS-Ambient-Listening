import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Home, Upload } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ScreenBackground } from '../presentation/components/ScreenBackground';
import { GlassCard } from '../presentation/components/GlassCard';
import { TimelineSegmentCard, TimelineDivider } from '../presentation/components/TimelineSegmentCard';
import { UploadMockModal } from '../presentation/components/UploadMockModal';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import { useRecordingStore } from '../store/recordingStore';
import { formatDurationMs } from '../utils/duration';
import { formatDateTime } from '../utils/dateTime';
import { C, FS, G, R, S } from '../presentation/theme';
import { transcriptionService } from '../application/services/TranscriptionService';

export default function PreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentSession = useRecordingStore(s => s.currentSession);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => () => { sound?.unloadAsync(); }, [sound]);

  if (!currentSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ScreenBackground variant="preview" />
        <Text style={{ color: C.textSecondary, marginBottom: 16 }}>No active recording.</Text>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ backgroundColor: C.chipBg, borderRadius: R.chip, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ color: C.textAccent, fontWeight: '600' }}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onPlaybackStatus = (s: AVPlaybackStatus) => {
    if (!s.isLoaded) return;
    setPosition(s.positionMillis);
    setDuration(s.durationMillis || 1);
    if (s.didJustFinish) { setIsPlaying(false); sound?.setPositionAsync(0); setPosition(0); }
  };

  const handlePlay = async () => {
    if (!currentSession.audioUri) { Alert.alert('Error', 'No audio file found.'); return; }
    if (isPlaying && sound) { await sound.pauseAsync(); setIsPlaying(false); return; }
    try {
      if (sound) { await sound.playAsync(); }
      else {
        const { sound: ns } = await Audio.Sound.createAsync({ uri: currentSession.audioUri }, { shouldPlay: true });
        setSound(ns); ns.setOnPlaybackStatusUpdate(onPlaybackStatus);
      }
      setIsPlaying(true);
    } catch { Alert.alert('Playback Error', 'Failed to play the recording.'); }
  };

  const handleSeek = async (v: number) => { if (sound) { await sound.setPositionAsync(v); setPosition(v); } };

  const handleUpload = async () => {
    setModalVisible(true);
    await recordingSessionService.mockUpload(currentSession.id);
  };

  const isUploaded = currentSession.uploadStatus === 'uploaded';
  const isUploading = currentSession.uploadStatus === 'uploading';

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground variant="preview" />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: S.md, paddingBottom: insets.bottom + 80, gap: S.sm }}
      >
        {/* Title */}
        <Text style={{ fontSize: FS.body, fontWeight: '500', color: C.textSecondary, textAlign: 'center', paddingVertical: 2 }}>
          Recording Saved
        </Text>

        {/* Meta + Playback card */}
        <GlassCard padding={S.lg}>
          <Text style={{ fontSize: FS.h2, fontWeight: '700', letterSpacing: -0.2, color: C.textPrimary, marginBottom: 2 }}>
            {currentSession.title}
          </Text>
          <Text style={{ fontSize: 9, fontWeight: '500', color: C.textSecondary, letterSpacing: 0.2, marginBottom: S.md }}>
            {formatDateTime(currentSession.startedAt)}
          </Text>

          {/* Duration + Pauses inline — no sub-boxes */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.md }}>
            <View>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: C.violetDim, marginBottom: 2 }}>Duration</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: C.textAccent }}>{formatDurationMs(currentSession.durationMs)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: C.violetDim, marginBottom: 2 }}>Pauses</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: C.textPrimary }}>{currentSession.pauseCount}</Text>
            </View>
          </View>

          {/* Playback — directly on card surface, no inner box */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <TouchableOpacity
              onPress={handlePlay}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.chipBg, borderWidth: 1, borderColor: C.chipBorder, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {isPlaying
                ? <Pause size={12} color={C.violet} fill={C.violet} />
                : <Play size={12} color={C.violet} fill={C.violet} />}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Slider
                style={{ height: 32 }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor={C.purple}
                maximumTrackTintColor="rgba(255,255,255,0.12)"
                thumbTintColor={C.violet}
              />
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 }}>
            <Text style={{ fontSize: 8.5, fontWeight: '500', color: C.textSecondary }}>{formatDurationMs(position)}</Text>
            <Text style={{ fontSize: 8.5, fontWeight: '500', color: C.textSecondary }}>{formatDurationMs(duration)}</Text>
          </View>
        </GlassCard>

        {/* Transcription UI */}
        <GlassCard padding={S.lg}>
          <Text style={{ fontSize: FS.h3, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>Transcription</Text>
          
          {(!currentSession.transcription || currentSession.transcription.status === 'not_started' || currentSession.transcription.status === 'failed' || currentSession.transcription.status === 'cancelled') && (
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => transcriptionService.transcribe(currentSession.id)}
                activeOpacity={0.8}
                style={{ backgroundColor: C.chipBg, padding: 12, borderRadius: R.button, alignItems: 'center', borderWidth: 1, borderColor: C.chipBorder }}
              >
                <Text style={{ color: C.textAccent, fontWeight: '600' }}>
                  {currentSession.transcription?.status === 'failed' ? 'Retry Transcription' : 'Transcribe'}
                </Text>
              </TouchableOpacity>
              {currentSession.transcription?.status === 'failed' && !!currentSession.transcription.errorMessage && (
                <Text style={{ color: '#ff4d4d', fontSize: FS.small, textAlign: 'center', marginTop: 4 }}>
                  Error: {currentSession.transcription.errorMessage}
                </Text>
              )}
            </View>
          )}

          {(currentSession.transcription?.status === 'in_progress' || currentSession.transcription?.status === 'downloading_model') && (
            <View style={{ gap: 8 }}>
              <Text style={{ color: C.textSecondary, fontSize: FS.small }}>
                {currentSession.transcription.status === 'downloading_model'
                  ? `Downloading AI model (first time only)... ${Math.round(currentSession.transcription.progress || 0)}%`
                  : currentSession.transcription.text === 'Converting audio format...'
                    ? 'Converting audio to compatible format...'
                    : `Transcribing... ${Math.round(currentSession.transcription.progress || 0)}%`}
              </Text>
              <View style={{ height: 4, backgroundColor: C.chipBg, borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ width: `${Math.round(currentSession.transcription.progress || 0)}%`, height: '100%', backgroundColor: C.violet }} />
              </View>
              {!!currentSession.transcription.text && (
                <Text style={{ color: C.textPrimary, fontSize: FS.body, marginTop: 8 }} numberOfLines={2}>
                  {currentSession.transcription.text}
                </Text>
              )}
            </View>
          )}

          {currentSession.transcription?.status === 'completed' && (
            <View>
              <Text style={{ color: C.textPrimary, fontSize: FS.body, lineHeight: 22 }}>
                {currentSession.transcription.text || 'No speech detected.'}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Upload CTA */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploaded || isUploading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isUploaded ? ['#059669', '#047857'] : G.cta}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={{
              borderRadius: R.card,
              borderCurve: 'continuous',
              padding: S.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: S.sm,
              borderWidth: 1,
              borderColor: isUploaded ? 'rgba(5,150,105,0.4)' : 'rgba(139,92,246,0.3)',
              boxShadow: isUploaded ? '0 6px 20px rgba(5,150,105,0.35)' : '0 8px 28px rgba(124,58,237,0.5)',
              overflow: 'hidden',
              opacity: isUploading ? 0.7 : 1,
            } as any}
          >
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, backgroundColor: 'rgba(255,255,255,0.11)', borderTopLeftRadius: R.card, borderTopRightRadius: R.card }} pointerEvents="none" />
            {isUploaded
              ? <Text style={{ fontSize: 16, fontWeight: '700', color: 'white' }}>✓  Uploaded</Text>
              : <>
                  <Upload size={16} color="white" />
                  <Text style={{ fontSize: 15, fontWeight: '700', letterSpacing: -0.2, color: 'white' }}>
                    {isUploading ? 'Uploading…' : 'Upload Recording'}
                  </Text>
                </>
            }
          </LinearGradient>
        </TouchableOpacity>

        {/* Segments */}
        {currentSession.timelineSegments.length > 0 && (
          <>
            <Text style={{ fontSize: FS.micro, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: C.violetDim, paddingHorizontal: 2 }}>
              Segments
            </Text>
            <GlassCard paddingHorizontal={13} paddingVertical={4} padding={0}>
              {currentSession.timelineSegments.map((seg, idx) => (
                <React.Fragment key={seg.id}>
                  {idx > 0 && <TimelineDivider />}
                  <TimelineSegmentCard segment={seg} />
                </React.Fragment>
              ))}
            </GlassCard>
          </>
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(13,6,33,0.9)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingBottom: insets.bottom + 8, paddingTop: 12, alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Home size={16} color={C.textSecondary} />
          <Text style={{ fontSize: FS.body, fontWeight: '600', color: C.textSecondary }}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      <UploadMockModal visible={modalVisible} status={currentSession.uploadStatus || 'not_uploaded'} onClose={() => setModalVisible(false)} />
    </View>
  );
}
