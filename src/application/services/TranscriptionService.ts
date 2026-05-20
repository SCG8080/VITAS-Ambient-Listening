import { initWhisper } from 'whisper.rn';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { AsyncStorageRecordingRepository } from '../../infrastructure/storage/AsyncStorageRecordingRepository';
import { useRecordingStore } from '../../store/recordingStore';
import { convertToWhisperWav } from '../../utils/wavConverter';
import { WHISPER_MODELS, DEFAULT_MODEL_KEY } from './WhisperModels';

class TranscriptionService {
  private repository = new AsyncStorageRecordingRepository();
  private whisperContext: any = null;
  private loadedModelKey: string | null = null;
  private downloadingModels = new Set<string>();

  private getModelInfo(modelKey: string) {
    const model = WHISPER_MODELS.find(m => m.key === modelKey);
    if (!model) throw new Error(`Unknown model: ${modelKey}`);
    return model;
  }

  async isModelDownloaded(modelKey: string): Promise<boolean> {
    const model = this.getModelInfo(modelKey);
    const path = `${FileSystem.documentDirectory}${model.fileName}`;
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  }

  async downloadModel(modelKey: string, onProgress?: (progress: number) => void): Promise<string> {
    const model = this.getModelInfo(modelKey);
    const modelPath = `${FileSystem.documentDirectory}${model.fileName}`;
    const info = await FileSystem.getInfoAsync(modelPath);
    if (info.exists) return modelPath;

    if (this.downloadingModels.has(modelKey)) {
      throw new Error('This model is already downloading. Please wait.');
    }

    try {
      this.downloadingModels.add(modelKey);
      const downloadResumable = FileSystem.createDownloadResumable(
        model.url,
        modelPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress?.(Math.round(progress * 100));
        }
      );
      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult) throw new Error('Download failed');
      return downloadResult.uri;
    } finally {
      this.downloadingModels.delete(modelKey);
    }
  }

  async initContext(modelKey: string, onDownloadProgress?: (progress: number) => void) {
    if (this.whisperContext && this.loadedModelKey === modelKey) return this.whisperContext;
    this.whisperContext = null;
    this.loadedModelKey = null;
    const modelPath = await this.downloadModel(modelKey, onDownloadProgress);
    this.whisperContext = await initWhisper({ filePath: modelPath });
    this.loadedModelKey = modelKey;
    return this.whisperContext;
  }

  async transcribe(recordingId: string, modelKey: string = DEFAULT_MODEL_KEY) {
    const session = await this.repository.getRecordingById(recordingId);
    if (!session || !session.audioUri) throw new Error('Recording or audio not found');

    const store = useRecordingStore.getState();

    const updateState = async (updates: any) => {
      const currentSession = await this.repository.getRecordingById(recordingId);
      if (currentSession) {
        currentSession.transcription = { ...currentSession.transcription, ...updates };
        await this.repository.saveRecording(currentSession);
        store.updateRecording(recordingId, { transcription: currentSession.transcription });
      }
    };

    await updateState({ status: 'downloading_model', model: modelKey, progress: 0, text: '', errorMessage: undefined });

    let wavPath: string | null = null;

    try {
      const context = await this.initContext(modelKey, (progress) => {
        updateState({ status: 'downloading_model', progress });
      });

      await updateState({ status: 'in_progress', progress: 0, text: 'Converting audio format...' });
      wavPath = `${FileSystem.documentDirectory}whisper_input_${recordingId}.wav`;
      await convertToWhisperWav(session.audioUri, wavPath);

      await updateState({ status: 'in_progress', progress: 0, text: '' });
      let transcribedText = '';

      const { promise } = context.transcribe(wavPath, {
        language: 'en',
        maxLen: 1,
        tokenTimestamps: true,
        onProgress: (progress: number) => {
          updateState({ progress });
        },
        onNewSegments: (result: any) => {
          if (result && result.segments) {
            transcribedText = result.segments.map((s: any) => s.text).join('');
            updateState({ text: transcribedText });
          }
        },
      });

      const result = await promise;
      if (result && result.result) transcribedText = result.result;
      await updateState({ status: 'completed', progress: 100, text: transcribedText });
    } catch (error: any) {
      console.error('[Transcription] Error:', error);
      const errMsg = error?.message || String(error);
      await updateState({ status: 'failed', errorMessage: errMsg });
      Alert.alert('Transcription Error', errMsg);
    } finally {
      if (wavPath) {
        try {
          const wavInfo = await FileSystem.getInfoAsync(wavPath);
          if (wavInfo.exists) await FileSystem.deleteAsync(wavPath, { idempotent: true });
        } catch (_) {}
      }
    }
  }
}

export const transcriptionService = new TranscriptionService();
