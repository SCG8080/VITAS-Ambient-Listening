import { Audio } from 'expo-av';

export class ExpoAudioRecorder {
  private recording: Audio.Recording | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      return permission.status === 'granted';
    } catch (error) {
      console.error('Failed to request audio permissions', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
    } catch (err) {
      console.error('Failed to start recording', err);
      throw err;
    }
  }

  async pauseRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.pauseAsync();
      }
    } catch (err) {
      console.error('Failed to pause recording', err);
      throw err;
    }
  }

  async resumeRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.startAsync();
      }
    } catch (err) {
      console.error('Failed to resume recording', err);
      throw err;
    }
  }

  async stopRecording(): Promise<string | undefined> {
    try {
      if (!this.recording) {
        return undefined;
      }
      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = this.recording.getURI();
      this.recording = null;
      return uri || undefined;
    } catch (err) {
      console.error('Failed to stop recording', err);
      throw err;
    }
  }
}
