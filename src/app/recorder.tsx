import React, { useState } from 'react';
import { View, Text, Alert, Modal, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../presentation/components/ScreenBackground';
import { GlassCard } from '../presentation/components/GlassCard';
import { RecorderControls } from '../presentation/components/RecorderControls';
import { RecordingWaveform } from '../presentation/components/RecordingWaveform';
import { RecordingTimer } from '../presentation/components/RecordingTimer';
import { RecordingStatusBadge } from '../presentation/components/RecordingStatusBadge';
import { TimelineSegmentCard, TimelineDivider } from '../presentation/components/TimelineSegmentCard';
import { recordingSessionService } from '../application/services/RecordingSessionService';
import { useRecordingStore } from '../store/recordingStore';
import { C, FS, G, R, S } from '../presentation/theme';

export default function RecorderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentSession = useRecordingStore(s => s.currentSession);
  const elapsedTimeMs = useRecordingStore(s => s.elapsedTimeMs);
  const isRecording = currentSession?.status === 'recording';

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [recordingName, setRecordingName] = useState('');

  const handleStartPress = () => {
    setRecordingName('');
    setNameModalVisible(true);
  };

  const handleStartConfirm = async () => {
    setNameModalVisible(false);
    const title = recordingName.trim() || 'Ambient Recording';
    try { await recordingSessionService.startRecording(title); }
    catch { Alert.alert('Error', 'Could not start recording. Check microphone permissions.'); }
  };

  const handlePause  = () => recordingSessionService.pauseRecording('manual');
  const handleResume = () => recordingSessionService.resumeRecording();
  const handleStop   = async () => { await recordingSessionService.stopRecording(); router.replace('/preview'); };

  const segments = [...(currentSession?.timelineSegments ?? [])].reverse();

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground variant="recorder" />

      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingHorizontal: S.md, paddingBottom: insets.bottom + 16, gap: S.sm }}>
        {/* Screen title */}
        <Text style={{ fontSize: FS.body, fontWeight: '500', color: C.textSecondary, textAlign: 'center', paddingVertical: 2 }}>
          Ambient Recorder
        </Text>

        {/* Live / Paused badge */}
        <RecordingStatusBadge status={currentSession?.status ?? 'idle'} />

        {/* Timer */}
        <RecordingTimer durationMs={elapsedTimeMs} />

        {/* Waveform */}
        <RecordingWaveform isRecording={isRecording} />

        {/* Controls */}
        <View style={{ alignItems: 'center', marginVertical: S.sm }}>
          <RecorderControls
            status={currentSession?.status ?? 'idle'}
            onStart={handleStartPress}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
          />
        </View>

        {/* Timeline — scrollable, all segments */}
        {segments.length > 0 && (
          <>
            <Text style={{ fontSize: FS.micro, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: C.violetDim, paddingHorizontal: 2 }}>
              Timeline
            </Text>
            <GlassCard paddingHorizontal={13} paddingVertical={4} padding={0} style={{ maxHeight: 180 }}>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                {segments.map((seg, idx) => (
                  <React.Fragment key={seg.id}>
                    {idx > 0 && <TimelineDivider />}
                    <TimelineSegmentCard segment={seg} />
                  </React.Fragment>
                ))}
              </ScrollView>
            </GlassCard>
          </>
        )}
      </View>

      {/* Name input modal */}
      <Modal
        transparent
        visible={nameModalVisible}
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: S.xxl }}
        >
          <View style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: '#1A0E2E',
            borderRadius: R.card,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: C.surfaceBorder,
            padding: S.xxl,
            gap: S.md,
          } as any}>
            <Text style={{ fontSize: FS.h2, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.2 }}>
              Name this recording
            </Text>
            <Text style={{ fontSize: FS.body, color: C.textSecondary, lineHeight: 16 }}>
              Give it a short title so you can find it later.
            </Text>

            <TextInput
              value={recordingName}
              onChangeText={setRecordingName}
              placeholder="e.g. Patient Consultation"
              placeholderTextColor={C.textSecondary}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleStartConfirm}
              style={{
                backgroundColor: 'rgba(255,255,255,0.07)',
                borderWidth: 1,
                borderColor: C.surfaceBorder,
                borderRadius: R.el,
                borderCurve: 'continuous',
                paddingHorizontal: S.md,
                paddingVertical: 11,
                fontSize: FS.h2,
                fontWeight: '500',
                color: C.textPrimary,
              } as any}
            />

            <View style={{ flexDirection: 'row', gap: S.sm }}>
              <TouchableOpacity
                onPress={() => setNameModalVisible(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: R.el, borderCurve: 'continuous', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.surfaceBorder, alignItems: 'center' } as any}
              >
                <Text style={{ fontSize: FS.body, fontWeight: '600', color: C.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleStartConfirm} activeOpacity={0.85} style={{ flex: 2 }}>
                <LinearGradient
                  colors={G.cta}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 0.9, y: 1 }}
                  style={{ paddingVertical: 12, borderRadius: R.el, borderCurve: 'continuous', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.35)' } as any}
                >
                  <Text style={{ fontSize: FS.body, fontWeight: '700', color: 'white' }}>Start Recording</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
