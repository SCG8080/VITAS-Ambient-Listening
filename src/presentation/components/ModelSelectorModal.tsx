import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Download, Check } from 'lucide-react-native';
import { C, S, R } from '../theme';
import { WHISPER_MODELS, QUALITY_LABELS, WhisperModel } from '../../application/services/WhisperModels';
import { transcriptionService } from '../../application/services/TranscriptionService';

interface Props {
  visible: boolean;
  selectedKey: string;
  onSelectModel: (modelKey: string) => void;
  onClose: () => void;
}

interface DownloadState {
  downloading: boolean;
  progress: number;
}

export function ModelSelectorModal({ visible, selectedKey, onSelectModel, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [downloadedKeys, setDownloadedKeys] = useState<Set<string>>(new Set());
  const [downloadStates, setDownloadStates] = useState<Record<string, DownloadState>>({});

  const refreshDownloadedStatus = useCallback(async () => {
    const results = await Promise.all(
      WHISPER_MODELS.map(async m => ({ key: m.key, downloaded: await transcriptionService.isModelDownloaded(m.key) }))
    );
    setDownloadedKeys(new Set(results.filter(r => r.downloaded).map(r => r.key)));
  }, []);

  useEffect(() => {
    if (visible) refreshDownloadedStatus();
  }, [visible, refreshDownloadedStatus]);

  const handleDownload = async (model: WhisperModel) => {
    setDownloadStates(prev => ({ ...prev, [model.key]: { downloading: true, progress: 0 } }));
    try {
      await transcriptionService.downloadModel(model.key, (progress) => {
        setDownloadStates(prev => ({ ...prev, [model.key]: { downloading: true, progress } }));
      });
      setDownloadedKeys(prev => new Set([...prev, model.key]));
    } catch (err: any) {
      Alert.alert('Download Failed', err?.message || 'Could not download the model. Check your connection.');
    } finally {
      setDownloadStates(prev => ({ ...prev, [model.key]: { downloading: false, progress: 0 } }));
    }
  };

  const english = WHISPER_MODELS.filter(m => m.language === 'english');
  const multilingual = WHISPER_MODELS.filter(m => m.language === 'multilingual');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {/*
        TouchableWithoutFeedback on the backdrop closes the modal.
        The sheet View uses onStartShouldSetResponder to stop touches
        from bubbling up to the backdrop — this is the standard RN pattern
        that ensures buttons inside the sheet always receive their taps.
      */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Select AI Model</Text>
                <Text style={styles.subtitle}>Higher quality = slower transcription · All run 100% on-device</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={16} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              <SectionLabel text="ENGLISH ONLY" note="Higher accuracy for English than same-size multilingual" />
              {english.map(model => (
                <ModelCard
                  key={model.key}
                  model={model}
                  isSelected={selectedKey === model.key}
                  isDownloaded={downloadedKeys.has(model.key)}
                  downloadState={downloadStates[model.key]}
                  onSelect={() => { onSelectModel(model.key); onClose(); }}
                  onDownload={() => handleDownload(model)}
                />
              ))}

              <SectionLabel text="MULTILINGUAL · 99 LANGUAGES" note="Use when patients speak languages other than English" />
              {multilingual.map(model => (
                <ModelCard
                  key={model.key}
                  model={model}
                  isSelected={selectedKey === model.key}
                  isDownloaded={downloadedKeys.has(model.key)}
                  downloadState={downloadStates[model.key]}
                  onSelect={() => { onSelectModel(model.key); onClose(); }}
                  onDownload={() => handleDownload(model)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function SectionLabel({ text, note }: { text: string; note: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{text}</Text>
      <Text style={styles.sectionNote}>{note}</Text>
    </View>
  );
}

interface ModelCardProps {
  model: WhisperModel;
  isSelected: boolean;
  isDownloaded: boolean;
  downloadState?: DownloadState;
  onSelect: () => void;
  onDownload: () => void;
}

function ModelCard({ model, isSelected, isDownloaded, downloadState, onSelect, onDownload }: ModelCardProps) {
  const isDownloading = downloadState?.downloading ?? false;
  const progress = downloadState?.progress ?? 0;

  // Entire card is tappable when downloaded and not already selected
  const canSelect = isDownloaded && !isSelected && !isDownloading;
  const canDownload = !isDownloaded && !isDownloading;

  const cardContent = (
    <View style={[styles.card, isSelected && styles.cardSelected, isDownloading && styles.cardDownloading]}>
      {/* Name row */}
      <View style={styles.nameRow}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {isSelected
            ? <Check size={14} color="#34D399" />
            : <View style={[styles.radio, isDownloaded && styles.radioReady]} />}
          <Text style={[styles.modelName, isSelected && styles.modelNameActive]}>{model.key}</Text>
          {model.isDefault && <Pill label="Default" bg="rgba(109,40,217,0.25)" color="#A78BFA" />}
          {isSelected && <Pill label="Active" bg="rgba(52,211,153,0.15)" color="#34D399" />}
          {isDownloaded && !isSelected && <Pill label="Downloaded" bg="rgba(52,211,153,0.12)" color="#34D399" />}
        </View>
        <Text style={styles.sizeText}>{model.sizeLabel}</Text>
      </View>

      {/* Quality + speed row */}
      <View style={styles.metaRow}>
        <QualityBar level={model.qualityLevel} />
        <Text style={styles.metaText}>{QUALITY_LABELS[model.qualityLevel]}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{model.speedLabel}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{model.description}</Text>

      {/* Download progress bar */}
      {isDownloading && (
        <View style={{ marginTop: 10, gap: 4 }}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>Downloading… {progress}%</Text>
        </View>
      )}

      {/* Download button (only for not-downloaded models) */}
      {canDownload && (
        <View style={styles.downloadRow}>
          <Download size={11} color={C.textSecondary} />
          <Text style={styles.downloadText}>Tap to download · {model.sizeLabel}</Text>
        </View>
      )}
    </View>
  );

  if (canSelect) {
    return (
      <TouchableOpacity onPress={onSelect} activeOpacity={0.75}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  if (canDownload) {
    return (
      <TouchableOpacity onPress={onDownload} activeOpacity={0.75}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

function QualityBar({ level }: { level: 1 | 2 | 3 | 4 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: i <= level ? C.violet : 'rgba(167,139,250,0.2)' }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#120830',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '86%',
    borderTopWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    gap: S.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 10,
    color: C.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: S.lg,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: C.violet,
    letterSpacing: 1,
  },
  sectionNote: {
    fontSize: 9.5,
    color: C.textSecondary,
    marginTop: 1,
  },
  card: {
    marginHorizontal: S.md,
    marginBottom: S.sm,
    padding: S.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: R.el,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  cardSelected: {
    backgroundColor: 'rgba(109,40,217,0.18)',
    borderColor: 'rgba(139,92,246,0.45)',
  },
  cardDownloading: {
    borderColor: 'rgba(167,139,250,0.3)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    marginBottom: 6,
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  radioReady: {
    borderColor: '#34D399',
  },
  modelName: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textPrimary,
  },
  modelNameActive: {
    color: '#34D399',
  },
  sizeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  metaDot: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
  },
  description: {
    fontSize: 11,
    color: C.textSecondary,
    lineHeight: 15,
  },
  progressBg: {
    height: 3,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.violet,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  downloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    opacity: 0.7,
  },
  downloadText: {
    fontSize: 10,
    color: C.textSecondary,
  },
  pill: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
