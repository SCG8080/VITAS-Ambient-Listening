import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Download, Check, ChevronRight } from 'lucide-react-native';
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
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Select AI Model</Text>
              <Text style={styles.subtitle}>Higher quality = slower transcription. All run 100% on-device.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={16} color={C.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
            <SectionHeader title="English Only" subtitle="Higher accuracy for English than multilingual at same size" />
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

            <SectionHeader title="Multilingual · 99 Languages" subtitle="Use when patients speak languages other than English" />
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
    </Modal>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
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

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      {/* Top row: name + badges */}
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={[styles.modelName, isSelected && styles.modelNameSelected]}>{model.key}</Text>
            {model.isDefault && <Badge label="Default" color="#6D28D9" />}
            {isDownloaded && !isSelected && <Badge label="Downloaded" color="#059669" />}
            {isSelected && <Badge label="Active" color="#059669" />}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Text style={styles.modelMeta}>{model.speedLabel}</Text>
            <Text style={styles.metaDot}>·</Text>
            <QualityBar level={model.qualityLevel} />
            <Text style={styles.qualityLabel}>{QUALITY_LABELS[model.qualityLevel]}</Text>
          </View>
        </View>
        <View style={styles.sizeTag}>
          <Text style={styles.sizeText}>{model.sizeLabel}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>{model.description}</Text>

      {/* Download progress */}
      {isDownloading && (
        <View style={{ marginTop: 8, gap: 4 }}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressText}>Downloading… {progress}%</Text>
        </View>
      )}

      {/* Action button */}
      {!isDownloading && (
        <View style={styles.cardAction}>
          {isSelected ? (
            <View style={styles.activeBtn}>
              <Check size={11} color="#34D399" />
              <Text style={styles.activeBtnText}>Currently Active</Text>
            </View>
          ) : isDownloaded ? (
            <TouchableOpacity onPress={onSelect} style={styles.useBtn}>
              <Text style={styles.useBtnText}>Use This Model</Text>
              <ChevronRight size={12} color={C.violet} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onDownload} style={styles.downloadBtn}>
              <Download size={11} color={C.textSecondary} />
              <Text style={styles.downloadBtnText}>Download · {model.sizeLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '28', borderColor: color + '55' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function QualityBar({ level }: { level: 1 | 2 | 3 | 4 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          style={{
            width: 10,
            height: 4,
            borderRadius: 2,
            backgroundColor: i <= level ? C.violet : 'rgba(167,139,250,0.2)',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#120830',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
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
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: C.violet,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 9.5,
    color: C.textSecondary,
    marginTop: 1,
  },
  card: {
    marginHorizontal: S.md,
    marginBottom: S.sm,
    padding: S.md,
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderRadius: R.el,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardSelected: {
    backgroundColor: 'rgba(109,40,217,0.15)',
    borderColor: 'rgba(139,92,246,0.4)',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: S.sm,
    marginBottom: S.xs,
  },
  modelName: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  modelNameSelected: {
    color: C.violet,
  },
  modelMeta: {
    fontSize: 9.5,
    color: C.textSecondary,
  },
  metaDot: {
    fontSize: 9.5,
    color: C.textSecondary,
  },
  qualityLabel: {
    fontSize: 9.5,
    color: C.textSecondary,
  },
  sizeTag: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sizeText: {
    fontSize: 9,
    fontWeight: '600',
    color: C.textSecondary,
  },
  description: {
    fontSize: 10,
    color: C.textSecondary,
    lineHeight: 14,
    marginBottom: 2,
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
    fontSize: 9,
    color: C.textSecondary,
  },
  cardAction: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  activeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  activeBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#34D399',
  },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.chipBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.chipBorder,
  },
  useBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.violet,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  downloadBtnText: {
    fontSize: 10,
    fontWeight: '500',
    color: C.textSecondary,
  },
  badge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
});
