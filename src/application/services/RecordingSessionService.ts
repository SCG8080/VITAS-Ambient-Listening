import { ExpoAudioRecorder } from '../../infrastructure/audio/ExpoAudioRecorder';
import { AsyncStorageRecordingRepository } from '../../infrastructure/storage/AsyncStorageRecordingRepository';
import { useRecordingStore } from '../../store/recordingStore';
import { RecordingSession } from '../../domain/entities/RecordingSession';
import { RecordingTimelineSegment } from '../../domain/entities/RecordingTimelineSegment';

class RecordingSessionService {
  private audioRecorder = new ExpoAudioRecorder();
  private repository = new AsyncStorageRecordingRepository();
  private timerInterval: NodeJS.Timeout | null = null;
  private startTimeMs: number = 0;
  private pausedTimeMs: number = 0; // Total time spent in paused state
  private lastResumeTimeMs: number = 0; // The timestamp when we last resumed

  async initialize() {
    const recordings = await this.repository.getAllRecordings();
    useRecordingStore.getState().setRecordings(recordings);
  }

  async startRecording(title: string = "New Ambient Recording") {
    const hasPermission = await this.audioRecorder.requestPermissions();
    if (!hasPermission) {
      throw new Error("Microphone permission denied");
    }

    await this.audioRecorder.startRecording();

    const now = new Date().toISOString();
    const sessionId = Date.now().toString();

    const initialSegment: RecordingTimelineSegment = {
      id: Date.now().toString(),
      type: "recording",
      startedAt: now,
      reason: "manual"
    };

    const session: RecordingSession = {
      id: sessionId,
      title,
      status: "recording",
      startedAt: now,
      durationMs: 0,
      pauseCount: 0,
      timelineSegments: [initialSegment],
      uploadStatus: "not_uploaded"
    };

    useRecordingStore.getState().setCurrentSession(session);
    
    this.startTimeMs = Date.now();
    this.pausedTimeMs = 0;
    this.lastResumeTimeMs = Date.now();
    this.startTimer();
  }

  async pauseRecording(reason: "manual" | "interruption" | "background" = "manual") {
    const state = useRecordingStore.getState();
    const currentSession = state.currentSession;
    
    if (!currentSession || currentSession.status !== "recording") return;

    await this.audioRecorder.pauseRecording();
    this.stopTimer();

    const now = new Date().toISOString();
    const nowMs = Date.now();

    // Close the current 'recording' segment
    const segmentDuration = nowMs - this.lastResumeTimeMs;
    state.updateLastTimelineSegment({
      endedAt: now,
      durationMs: segmentDuration
    });

    // Start a new 'paused' segment
    const pauseSegment: RecordingTimelineSegment = {
      id: Date.now().toString(),
      type: "paused",
      startedAt: now,
      reason
    };

    state.addTimelineSegment(pauseSegment);
    
    state.updateCurrentSession({ 
      status: "paused",
      pauseCount: currentSession.pauseCount + 1
    });
    
    this.lastResumeTimeMs = nowMs; // Track when we paused
  }

  async resumeRecording() {
    const state = useRecordingStore.getState();
    const currentSession = state.currentSession;
    
    if (!currentSession || currentSession.status !== "paused") return;

    await this.audioRecorder.resumeRecording();

    const now = new Date().toISOString();
    const nowMs = Date.now();

    // Close the current 'paused' segment
    const pauseDuration = nowMs - this.lastResumeTimeMs;
    this.pausedTimeMs += pauseDuration;
    
    state.updateLastTimelineSegment({
      endedAt: now,
      durationMs: pauseDuration
    });

    // Start a new 'recording' segment
    const recordSegment: RecordingTimelineSegment = {
      id: Date.now().toString(),
      type: "recording",
      startedAt: now,
      reason: "manual"
    };

    state.addTimelineSegment(recordSegment);
    state.updateCurrentSession({ status: "recording" });
    
    this.lastResumeTimeMs = nowMs;
    this.startTimer();
  }

  async stopRecording() {
    const state = useRecordingStore.getState();
    const currentSession = state.currentSession;
    
    if (!currentSession) return;

    const uri = await this.audioRecorder.stopRecording();
    this.stopTimer();
    useRecordingStore.getState().setElapsedTimeMs(0);

    const now = new Date().toISOString();
    const nowMs = Date.now();

    // Close the last segment
    const lastDuration = nowMs - this.lastResumeTimeMs;
    state.updateLastTimelineSegment({
      endedAt: now,
      durationMs: lastDuration
    });

    const finalDurationMs = (nowMs - this.startTimeMs) - this.pausedTimeMs;

    const finalSession: RecordingSession = {
      ...currentSession,
      status: "stopped",
      endedAt: now,
      audioUri: uri,
      durationMs: finalDurationMs
    };

    state.setCurrentSession(finalSession);
    await this.repository.saveRecording(finalSession);
    
    // Refresh the list of recordings
    await this.initialize();
  }
  
  async deleteRecording(id: string) {
    await this.repository.deleteRecording(id);
    await this.initialize();
  }

  async mockUpload(id: string) {
    const session = await this.repository.getRecordingById(id);
    if (!session) return;

    session.uploadStatus = "uploading";
    await this.repository.saveRecording(session);
    const state = useRecordingStore.getState();
    if (state.currentSession?.id === id) {
      state.updateCurrentSession({ uploadStatus: "uploading" });
    }
    await this.initialize();

    await new Promise(resolve => setTimeout(resolve, 2000));

    session.uploadStatus = "uploaded";
    await this.repository.saveRecording(session);
    const state2 = useRecordingStore.getState();
    if (state2.currentSession?.id === id) {
      state2.updateCurrentSession({ uploadStatus: "uploaded" });
    }
    await this.initialize();
  }

  private startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      const nowMs = Date.now();
      const elapsed = (nowMs - this.startTimeMs) - this.pausedTimeMs;
      useRecordingStore.getState().setElapsedTimeMs(elapsed);
    }, 100);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}

export const recordingSessionService = new RecordingSessionService();
