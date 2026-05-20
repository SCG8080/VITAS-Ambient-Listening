import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight } from 'lucide-react-native';
import { GlassCard } from './GlassCard';
import { ModelSelectorModal } from './ModelSelectorModal';
import { C, FS, S, R } from '../theme';
import { DEFAULT_MODEL_KEY, MODEL_PREF_STORAGE_KEY } from '../../application/services/WhisperModels';
import { transcriptionService } from '../../application/services/TranscriptionService';

interface TranscriptionState {
  status?: string;
  progress?: number;
  text?: string;
  errorMessage?: string;
  model?: string;
}

interface Props {
  sessionId: string;
  transcription?: TranscriptionState;
}

export function TranscriptionSection({ sessionId, transcription }: Props) {
  const [selectedModelKey, setSelectedModelKey] = useState(DEFAULT_MODEL_KEY);
  const [modelModalVisible, setModelModalVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(MODEL_PREF_STORAGE_KEY).then(saved => {
      if (saved) setSelectedModelKey(saved);
    });
  }, []);

  const handleSelectModel = useCallback(async (key: string) => {
    setSelectedModelKey(key);
    await AsyncStorage.setItem(MODEL_PREF_STORAGE_KEY, key);
  }, []);

  const handleTranscribe = useCallback(() => {
    transcriptionService.transcribe(sessionId, selectedModelKey);
  }, [sessionId, selectedModelKey]);

  const isIdle =
    !transcription ||
    transcription.status === 'not_started' ||
    transcription.status === 'failed' ||
    transcription.status === 'cancelled';

  const isRunning =
    transcription?.status === 'in_progress' || transcription?.status === 'downloading_model';

  const isComplete = transcription?.status === 'completed';

  return (
    <>
      <GlassCard padding={S.lg}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.textPrimary, marginBottom: 8 }}>
          Transcription
        </Text>

        {isIdle && (
          <View style={{ gap: 8 }}>
            {/* Model selector row */}
            <TouchableOpacity
              onPress={() => setModelModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: R.el,
                paddingHorizontal: S.md,
                paddingVertical: 9,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <View style={{ gap: 1 }}>
                <Text style={{ fontSize: 9, fontWeight: '600', color: C.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  AI Model
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.violet }}>
                  {selectedModelKey}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 9.5, color: C.textSecondary }}>Change</Text>
                <ChevronRight size={13} color={C.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Transcribe button */}
            <TouchableOpacity
              onPress={handleTranscribe}
              activeOpacity={0.8}
              style={{
                backgroundColor: C.chipBg,
                padding: 12,
                borderRadius: R.el,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: C.chipBorder,
              }}
            >
              <Text style={{ color: C.textAccent, fontWeight: '600', fontSize: FS.body }}>
                {transcription?.status === 'failed' ? 'Retry Transcription' : 'Transcribe'}
              </Text>
            </TouchableOpacity>

            {transcription?.status === 'failed' && !!transcription.errorMessage && (
              <Text style={{ color: '#ff4d4d', fontSize: FS.small, textAlign: 'center' }}>
                Error: {transcription.errorMessage}
              </Text>
            )}
          </View>
        )}

        {isRunning && (
          <View style={{ gap: 8 }}>
            <Text style={{ color: C.textSecondary, fontSize: FS.small }}>
              {transcription?.status === 'downloading_model'
                ? `Downloading model (first time only)… ${Math.round(transcription.progress || 0)}%`
                : transcription?.text === 'Converting audio format...'
                ? 'Converting audio to compatible format…'
                : `Transcribing… ${Math.round(transcription?.progress || 0)}%`}
            </Text>
            <View style={{ height: 4, backgroundColor: C.chipBg, borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ width: `${Math.round(transcription?.progress || 0)}%` as any, height: '100%', backgroundColor: C.violet }} />
            </View>
            {!!transcription?.text && transcription.text !== 'Converting audio format...' && (
              <Text style={{ color: C.textPrimary, fontSize: FS.body, marginTop: 4 }} numberOfLines={2}>
                {transcription.text}
              </Text>
            )}
          </View>
        )}

        {isComplete && (
          <View>
            <Text style={{ color: C.textPrimary, fontSize: FS.body, lineHeight: 22 }}>
              {transcription?.text || 'No speech detected.'}
            </Text>
          </View>
        )}
      </GlassCard>

      <ModelSelectorModal
        visible={modelModalVisible}
        selectedKey={selectedModelKey}
        onSelectModel={handleSelectModel}
        onClose={() => setModelModalVisible(false)}
      />
    </>
  );
}
