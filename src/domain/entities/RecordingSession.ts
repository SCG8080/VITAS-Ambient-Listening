import { RecordingStatus } from "./RecordingStatus";
import { RecordingTimelineSegment } from "./RecordingTimelineSegment";

export interface RecordingSession {
  id: string;
  title: string;
  status: RecordingStatus;
  startedAt: string; // ISO 8601 date string
  endedAt?: string;
  durationMs: number;
  audioUri?: string;
  pauseCount: number;
  timelineSegments: RecordingTimelineSegment[];
  uploadStatus?: "not_uploaded" | "uploading" | "uploaded" | "failed";
    transcription?: {
    status: 'not_started' | 'downloading_model' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    text?: string;
    model?: 'tiny.en' | 'base.en';
    progress?: number;
    errorMessage?: string;
  };
}
