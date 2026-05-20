package expo.modules.audioconverter

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder

class AudioConverterModule : Module() {

  override fun definition() = ModuleDefinition {
    Name("AudioConverter")

    AsyncFunction("convertToWav") { inputPath: String, outputPath: String ->
      convertAudioToWav(inputPath, outputPath)
    }
  }

  // ─── Core conversion ─────────────────────────────────────────────────────

  private fun convertAudioToWav(inputPath: String, outputPath: String) {
    val cleanInput = inputPath.removePrefix("file://")
    val extractor = MediaExtractor()
    extractor.setDataSource(cleanInput)

    // Locate the first audio track
    var audioTrackIndex = -1
    var format: MediaFormat? = null
    for (i in 0 until extractor.trackCount) {
      val trackFormat = extractor.getTrackFormat(i)
      val mime = trackFormat.getString(MediaFormat.KEY_MIME) ?: continue
      if (mime.startsWith("audio/")) {
        audioTrackIndex = i
        format = trackFormat
        break
      }
    }

    if (audioTrackIndex < 0 || format == null) {
      extractor.release()
      throw Exception("No audio track found in: $cleanInput")
    }

    extractor.selectTrack(audioTrackIndex)

    val mime         = format.getString(MediaFormat.KEY_MIME)!!
    val srcRate      = format.getInteger(MediaFormat.KEY_SAMPLE_RATE)
    val srcChannels  = format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
    val targetRate   = 16_000
    val targetCh     = 1

    // Decode AAC → PCM
    val codec = MediaCodec.createDecoderByType(mime)
    codec.configure(format, null, null, 0)
    codec.start()

    val allPcm   = mutableListOf<ByteArray>()
    var totalLen = 0L

    var inputDone  = false
    var outputDone = false

    while (!outputDone) {
      // Feed compressed data to decoder
      if (!inputDone) {
        val idx = codec.dequeueInputBuffer(10_000L)
        if (idx >= 0) {
          val buf  = codec.getInputBuffer(idx)!!
          val size = extractor.readSampleData(buf, 0)
          if (size < 0) {
            codec.queueInputBuffer(idx, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
            inputDone = true
          } else {
            codec.queueInputBuffer(idx, 0, size, extractor.sampleTime, 0)
            extractor.advance()
          }
        }
      }

      // Pull decoded PCM frames
      val info = MediaCodec.BufferInfo()
      val outIdx = codec.dequeueOutputBuffer(info, 10_000L)
      if (outIdx >= 0) {
        val buf   = codec.getOutputBuffer(outIdx)!!
        val chunk = ByteArray(info.size)
        buf.get(chunk)

        val processed = resampleMono(chunk, srcRate, srcChannels, targetRate, targetCh)
        allPcm.add(processed)
        totalLen += processed.size

        codec.releaseOutputBuffer(outIdx, false)

        if (info.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
          outputDone = true
        }
      }
    }

    codec.stop()
    codec.release()
    extractor.release()

    writeWav(File(outputPath), allPcm, totalLen, targetRate)
  }

  // ─── DSP helpers ─────────────────────────────────────────────────────────

  /**
   * Mix-down to mono and linearly resample interleaved 16-bit PCM bytes.
   */
  private fun resampleMono(
    bytes:       ByteArray,
    srcRate:     Int,
    srcChannels: Int,
    dstRate:     Int,
    dstChannels: Int,
  ): ByteArray {
    // Bytes → Shorts
    val srcShorts = ShortArray(bytes.size / 2)
    ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(srcShorts)

    // Mix channels → mono
    val mono: ShortArray = if (srcChannels == 1) {
      srcShorts
    } else {
      val len = srcShorts.size / srcChannels
      ShortArray(len) { i ->
        var sum = 0L
        for (c in 0 until srcChannels) sum += srcShorts[i * srcChannels + c]
        (sum / srcChannels).toShort()
      }
    }

    // Resample
    val resampled: ShortArray = if (srcRate == dstRate) {
      mono
    } else {
      val ratio  = srcRate.toDouble() / dstRate
      val outLen = (mono.size / ratio).toInt()
      ShortArray(outLen) { i ->
        val pos = i * ratio
        val lo  = pos.toInt().coerceIn(0, mono.size - 1)
        val hi  = (lo + 1).coerceIn(0, mono.size - 1)
        val frac = pos - lo
        ((mono[lo] * (1.0 - frac)) + (mono[hi] * frac)).toInt()
          .coerceIn(Short.MIN_VALUE.toInt(), Short.MAX_VALUE.toInt())
          .toShort()
      }
    }

    // Shorts → Bytes
    val out = ByteArray(resampled.size * 2)
    ByteBuffer.wrap(out).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().put(resampled)
    return out
  }

  // ─── WAV writer ──────────────────────────────────────────────────────────

  /**
   * Writes a standard RIFF WAV header followed by the concatenated PCM chunks.
   * Assumes 16-bit mono output.
   */
  private fun writeWav(file: File, chunks: List<ByteArray>, dataBytes: Long, sampleRate: Int) {
    FileOutputStream(file).use { fos ->
      val header = ByteBuffer.allocate(44).order(ByteOrder.LITTLE_ENDIAN)

      // RIFF chunk
      header.put("RIFF".toByteArray())
      header.putInt((36 + dataBytes).coerceAtMost(Int.MAX_VALUE.toLong()).toInt())
      header.put("WAVE".toByteArray())

      // fmt  sub-chunk (16 bytes, PCM)
      header.put("fmt ".toByteArray())
      header.putInt(16)                    // chunk size
      header.putShort(1)                   // PCM = 1
      header.putShort(1)                   // channels = 1 (mono)
      header.putInt(sampleRate)
      header.putInt(sampleRate * 2)        // byteRate = sampleRate * 1 ch * 2 bytes
      header.putShort(2)                   // blockAlign
      header.putShort(16)                  // bitsPerSample

      // data sub-chunk
      header.put("data".toByteArray())
      header.putInt(dataBytes.coerceAtMost(Int.MAX_VALUE.toLong()).toInt())

      fos.write(header.array())
      for (chunk in chunks) fos.write(chunk)
    }
  }
}
