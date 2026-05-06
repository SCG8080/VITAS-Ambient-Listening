import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecordingSession } from '../../domain/entities/RecordingSession';
import { RecordingRepository } from '../../domain/repositories/RecordingRepository';

const RECORDINGS_KEY = '@vitas_recordings';

export class AsyncStorageRecordingRepository implements RecordingRepository {
  async getAllRecordings(): Promise<RecordingSession[]> {
    try {
      const data = await AsyncStorage.getItem(RECORDINGS_KEY);
      if (data) {
        return JSON.parse(data) as RecordingSession[];
      }
      return [];
    } catch (error) {
      console.error('Failed to get recordings from AsyncStorage', error);
      return [];
    }
  }

  async getRecordingById(id: string): Promise<RecordingSession | null> {
    const recordings = await this.getAllRecordings();
    return recordings.find(r => r.id === id) || null;
  }

  async saveRecording(session: RecordingSession): Promise<void> {
    try {
      const recordings = await this.getAllRecordings();
      const index = recordings.findIndex(r => r.id === session.id);
      
      if (index >= 0) {
        recordings[index] = session;
      } else {
        recordings.push(session);
      }
      
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
    } catch (error) {
      console.error('Failed to save recording to AsyncStorage', error);
      throw error;
    }
  }

  async deleteRecording(id: string): Promise<void> {
    try {
      const recordings = await this.getAllRecordings();
      const filtered = recordings.filter(r => r.id !== id);
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete recording from AsyncStorage', error);
      throw error;
    }
  }
}
