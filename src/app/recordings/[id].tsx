import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Play, Pause, Trash2, Upload } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { ScreenBackground } from '../../presentation/components/ScreenBackground';
import { GlassCard } from '../../presentation/components/GlassCard';
import { TimelineSegmentCard, TimelineDivider } from '../../presentation/components/TimelineSegmentCard';
import { UploadMockModal } from '../../presentation/components/UploadMockModal';
import { TranscriptionSection } from '../../presentation/components/TranscriptionSection';
import { useRecordingStore } from '../../store/recordingStore';
import { recordingSessionService } from '../../application/services/RecordingSessionService';
import { formatDurationMs } from '../../utils/duration';
import { formatDateTime } from '../../utils/dateTime';
import { C, FS, G, R, S } from '../../presentation/theme';

export default function RecordingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const recordings = useRecordingStore(s => s.recordings);
  const session = recordings.find(r => r.id === id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => () => { sound?.unloadAsync(); }, [sound]);

  if (!session) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.violet} />
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
    if (!session.audioUri) { Alert.alert('Error', 'No audio file found.'); return; }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (e) {
      console.warn('Failed to set audio mode for playback', e);
    }

    if (isPlaying && sound) { await sound.pauseAsync(); setIsPlaying(false); return; }
    try {
      if (sound) { await sound.playAsync(); }
      else {
        const { sound: ns } = await Audio.Sound.createAsync({ uri: session.audioUri }, { shouldPlay: true });
        setSound(ns); ns.setOnPlaybackStatusUpdate(onPlaybackStatus);
      }
      setIsPlaying(true);
    } catch { Alert.alert('Playback Error', 'Failed to play the recording.'); }
  };

  const handleSeek = async (v: number) => { if (sound) { await sound.setPositionAsync(v); setPosition(v); } };

  const handleUpload = async () => {
    setModalVisible(true);
    await recordingSessionService.mockUpload(session.id);
  };

  const handleDelete = () => {
    Alert.alert('Delete Recording', 'Are you sure you want to delete this recording?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await recordingSessionService.deleteRecording(session.id); router.back(); } },
    ]);
  };

  const isUploaded = session.uploadStatus === 'uploaded';
  const isUploading = session.uploadStatus === 'uploading';

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground variant="detail" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: S.md, paddingBottom: insets.bottom + 24, gap: S.sm }}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.chipBg, borderWidth: 1, borderColor: C.chipBorder, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={16} color={C.violet} />
          </TouchableOpacity>

          <Text style={{ flex: 1, fontSize: FS.body, fontWeight: '500', color: C.textSecondary }}>
            Recording Details
          </Text>

          <TouchableOpacity
            onPress={handleDelete}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBorder, alignItems: 'center', justifyContent: 'center' }}
          >
            <Trash2 size={13} color={C.red} />
          </TouchableOpacity>
        </View>

        {/* Meta + Playback card */}
        <GlassCard padding={S.lg}>
          <Text style={{ fontSize: FS.h2, fontWeight: '700', letterSpacing: -0.2, color: C.textPrimary, marginBottom: 2 }}>
            {session.title}
          </Text>
          <Text style={{ fontSize: 9, fontWeight: '500', color: C.textSecondary, letterSpacing: 0.2, marginBottom: S.md }}>
            {formatDateTime(session.startedAt)}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: S.md }}>
            <View>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: C.violetDim, marginBottom: 2 }}>Duration</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: C.textAccent }}>{formatDurationMs(session.durationMs)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 8.5, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: C.violetDim, marginBottom: 2 }}>Pauses</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: C.textPrimary }}>{session.pauseCount}</Text>
            </View>
          </View>

          {/* Playback */}
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
        <TranscriptionSection
          sessionId={session.id}
          transcription={session.transcription}
        />

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
        {session.timelineSegments.length > 0 && (
          <>
            <Text style={{ fontSize: FS.micro, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: C.violetDim, paddingHorizontal: 2 }}>
              Segments
            </Text>
            <GlassCard paddingHorizontal={13} paddingVertical={4} padding={0}>
              {session.timelineSegments.map((seg, idx) => (
                <React.Fragment key={seg.id}>
                  {idx > 0 && <TimelineDivider />}
                  <TimelineSegmentCard segment={seg} />
                </React.Fragment>
              ))}
            </GlassCard>
          </>
        )}
      </ScrollView>

      <UploadMockModal visible={modalVisible} status={session.uploadStatus || 'not_uploaded'} onClose={() => setModalVisible(false)} />
    </View>
  );
}
