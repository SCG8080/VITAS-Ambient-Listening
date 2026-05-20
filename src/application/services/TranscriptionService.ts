import { initWhisper } from 'whisper.rn';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { AsyncStorageRecordingRepository } from '../../infrastructure/storage/AsyncStorageRecordingRepository';
import { useRecordingStore } from '../../store/recordingStore';
import { convertToWhisperWav } from '../../utils/wavConverter';

const MODEL_URL = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin';
const MODEL_FILE_NAME = 'ggml-tiny.en.bin';

class TranscriptionService {
  private repository = new AsyncStorageRecordingRepository();
  private whisperContext: any = null;
  private isDownloadingModel = false;
  
  async getModelPath(onProgress?: (progress: number) => void): Promise<string> {
    const modelPath = `${FileSystem.documentDirectory}${MODEL_FILE_NAME}`;
    const info = await FileSystem.getInfoAsync(modelPath);
    
    if (info.exists) {
      return modelPath;
    }
    
    if (this.isDownloadingModel) {
      throw new Error('Model is already downloading. Please wait.');
    }
    
    try {
      this.isDownloadingModel = true;
      const downloadResumable = FileSystem.createDownloadResumable(
        MODEL_URL,
        modelPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) onProgress(Math.round(progress * 100));
        }
      );
      
      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult) throw new Error('Download failed');
      return downloadResult.uri;
    } finally {
      this.isDownloadingModel = false;
    }
  }

  async initContext(onDownloadProgress?: (progress: number) => void) {
    if (this.whisperContext) return this.whisperContext;
    
    const modelPath = await this.getModelPath(onDownloadProgress);
    this.whisperContext = await initWhisper({ filePath: modelPath });
    return this.whisperContext;
  }
  
  async transcribe(recordingId: string) {
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
    
    await updateState({ status: 'downloading_model', model: 'tiny.en', progress: 0, text: '', errorMessage: undefined });
    
    let wavPath: string | null = null;

    try {
      // Step 1: Download / verify the Whisper model
      const context = await this.initContext((progress) => {
        updateState({ status: 'downloading_model', progress });
      });
      
      // Step 2: Convert audio to 16kHz mono WAV (whisper.rn only accepts WAV/PCM)
      await updateState({ status: 'in_progress', progress: 0, text: 'Converting audio format...' });
      console.log('[Transcription] Converting audio to WAV:', session.audioUri);
      wavPath = `${FileSystem.documentDirectory}whisper_input_${recordingId}.wav`;
      await convertToWhisperWav(session.audioUri, wavPath);
      console.log('[Transcription] WAV ready at:', wavPath);
      
      // Step 3: Run transcription
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
        }
      });
      
      const result = await promise;

      // Use final result text as source of truth (may have more than streamed segments)
      if (result && result.result) {
        transcribedText = result.result;
      }

      await updateState({ status: 'completed', progress: 100, text: transcribedText });
    } catch (error: any) {
      console.error('[Transcription] Error:', error);
      const errMsg = error?.message || String(error);
      await updateState({ status: 'failed', errorMessage: errMsg });
      Alert.alert('Transcription Error', errMsg);
    } finally {
      // Clean up temp WAV file to save disk space
      if (wavPath) {
        try {
          const wavInfo = await FileSystem.getInfoAsync(wavPath);
          if (wavInfo.exists) {
            await FileSystem.deleteAsync(wavPath, { idempotent: true });
          }
        } catch (_) {
          // Non-fatal
        }
      }
    }
  }
}

export const transcriptionService = new TranscriptionService();
