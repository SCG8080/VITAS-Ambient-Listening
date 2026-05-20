/**
 * wavConverter.ts
 *
 * Converts any audio format (m4a, aac, mp4, etc.) into a 16kHz 16-bit mono WAV
 * file that whisper.rn can consume.
 *
 * Uses the local `audio-converter` Expo module which wraps Android's built-in
 * MediaExtractor + MediaCodec APIs — no CMake, no third-party native binaries.
 */

import { convertToWav as nativeConvertToWav } from 'audio-converter';

/**
 * Converts an audio file (any format supported by the device) to a
 * 16kHz 16-bit mono WAV file. Returns the path to the output WAV file.
 *
 * @param inputUri  file:// URI of the source audio (e.g. the recorded .m4a)
 * @param outputUri file:// URI where the .wav will be written
 */
export async function convertToWhisperWav(inputUri: string, outputUri: string): Promise<string> {
  // Strip file:// for the native module (it accepts both forms)
  const inputPath  = inputUri.startsWith('file://') ? inputUri.slice(7) : inputUri;
  const outputPath = outputUri.startsWith('file://') ? outputUri.slice(7) : outputUri;

  await nativeConvertToWav(inputPath, outputPath);
  return outputUri;
}
