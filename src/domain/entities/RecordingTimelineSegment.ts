export interface RecordingTimelineSegment {
  id: string;
  type: "recording" | "paused";
  startedAt: string; // ISO 8601 date string
  endedAt?: string;
  durationMs?: number;
  reason?: "manual" | "interruption" | "background";
}
