import { RecordingSession } from "../entities/RecordingSession";

export interface RecordingRepository {
  getAllRecordings(): Promise<RecordingSession[]>;
  getRecordingById(id: string): Promise<RecordingSession | null>;
  saveRecording(session: RecordingSession): Promise<void>;
  deleteRecording(id: string): Promise<void>;
}
