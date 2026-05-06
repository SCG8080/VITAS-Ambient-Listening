import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { recordingSessionService } from './RecordingSessionService';
import { useRecordingStore } from '../../store/recordingStore';

export function useAppInterruption() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const state = useRecordingStore.getState();
      const currentSession = state.currentSession;
      
      // We only care about interruptions if we are currently recording
      if (currentSession?.status === 'recording') {
        if (nextAppState === 'inactive' || nextAppState === 'background') {
          // Pause the recording automatically
          const reason = nextAppState === 'background' ? 'background' : 'interruption';
          recordingSessionService.pauseRecording(reason).catch(console.error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
