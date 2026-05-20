import { requireOptionalNativeModule } from 'expo-modules-core';

const AudioConverterNative = requireOptionalNativeModule('AudioConverter');

/**
 * Converts any audio file (m4a, aac, mp4, etc.) supported by the Android
 * MediaExtractor to a 16kHz 16-bit mono WAV file.
 *
 * @param inputPath  Absolute file path (with or without file:// prefix)
 * @param outputPath Absolute file path where the .wav will be written
 */
export async function convertToWav(inputPath: string, outputPath: string): Promise<void> {
  if (!AudioConverterNative) {
    throw new Error('[AudioConverter] Native module not available. Rebuild the app to include the audio-converter module.');
  }
  return AudioConverterNative.convertToWav(inputPath, outputPath);
}
