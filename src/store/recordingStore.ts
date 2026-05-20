import { create } from 'zustand';
import { RecordingSession } from '../domain/entities/RecordingSession';
import { RecordingStatus } from '../domain/entities/RecordingStatus';
import { RecordingTimelineSegment } from '../domain/entities/RecordingTimelineSegment';

interface RecordingState {
  // Active Recording Session State
  currentSession: RecordingSession | null;
  elapsedTimeMs: number;
  
  // Actions for Active Session
  setCurrentSession: (session: RecordingSession | null) => void;
  updateCurrentSession: (updates: Partial<RecordingSession>) => void;
  setElapsedTimeMs: (time: number) => void;
  addTimelineSegment: (segment: RecordingTimelineSegment) => void;
  updateLastTimelineSegment: (updates: Partial<RecordingTimelineSegment>) => void;
  
  // Saved Recordings State
  recordings: RecordingSession[];
  setRecordings: (recordings: RecordingSession[]) => void;
  updateRecording: (id: string, updates: Partial<RecordingSession>) => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  currentSession: null,
  elapsedTimeMs: 0,
  
  setCurrentSession: (session) => set({ currentSession: session }),
  
  updateCurrentSession: (updates) => set((state) => ({
    currentSession: state.currentSession ? { ...state.currentSession, ...updates } : null
  })),
  
  setElapsedTimeMs: (time) => set({ elapsedTimeMs: time }),
  
  addTimelineSegment: (segment) => set((state) => {
    if (!state.currentSession) return state;
    return {
      currentSession: {
        ...state.currentSession,
        timelineSegments: [...state.currentSession.timelineSegments, segment]
      }
    };
  }),

  updateLastTimelineSegment: (updates) => set((state) => {
    if (!state.currentSession || state.currentSession.timelineSegments.length === 0) return state;
    
    const segments = [...state.currentSession.timelineSegments];
    const lastIndex = segments.length - 1;
    segments[lastIndex] = { ...segments[lastIndex], ...updates };
    
    return {
      currentSession: {
        ...state.currentSession,
        timelineSegments: segments
      }
    };
  }),
  
  recordings: [],
  setRecordings: (recordings) => set({ recordings }),
  updateRecording: (id, updates) => set((state) => {
    const recordings = state.recordings.map(r => r.id === id ? { ...r, ...updates } : r);
    const currentSession = state.currentSession?.id === id ? { ...state.currentSession, ...updates } : state.currentSession;
    return { recordings, currentSession };
  }),
}));
