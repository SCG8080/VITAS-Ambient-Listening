import ExpoModulesCore
import AVFoundation

public class AudioConverterModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AudioConverter")

    AsyncFunction("convertToWav") { (inputPath: String, outputPath: String) throws in
      let src = inputPath.hasPrefix("file://") ? String(inputPath.dropFirst(7)) : inputPath
      let dst = outputPath.hasPrefix("file://") ? String(outputPath.dropFirst(7)) : outputPath
      try Self.convertToWav(from: URL(fileURLWithPath: src), to: URL(fileURLWithPath: dst))
    }
  }

  private static func convertToWav(from inputURL: URL, to outputURL: URL) throws {
    try? FileManager.default.removeItem(at: outputURL)

    let inputFile = try AVAudioFile(forReading: inputURL)
    let inputFormat = inputFile.processingFormat

    // Use Float32 for the processing buffer — AVAudioFile.processingFormat is always Float32,
    // so the buffer passed to write() must be Float32. AVAudioFile converts to Int16 on disk.
    guard let targetFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32, sampleRate: 16000.0, channels: 1, interleaved: false) else {
      throw NSError(domain: "AudioConverter", code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to create 16 kHz mono PCM format"])
    }

    // Write 16-bit PCM to disk (what whisper.rn expects); AVAudioFile handles Float32→Int16 encoding.
    let wavSettings: [String: Any] = [
      AVFormatIDKey: kAudioFormatLinearPCM,
      AVSampleRateKey: 16000.0,
      AVNumberOfChannelsKey: 1,
      AVLinearPCMBitDepthKey: 16,
      AVLinearPCMIsBigEndianKey: false,
      AVLinearPCMIsNonInterleaved: false
    ]
    let outputFile = try AVAudioFile(forWriting: outputURL, settings: wavSettings)

    guard let converter = AVAudioConverter(from: inputFormat, to: targetFormat) else {
      throw NSError(domain: "AudioConverter", code: 2,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to create AVAudioConverter"])
    }

    guard inputFormat.sampleRate > 0 else {
      throw NSError(domain: "AudioConverter", code: 4, userInfo: [NSLocalizedDescriptionKey: "Invalid input sample rate"])
    }

    let readFrameCount: AVAudioFrameCount = 8192
    let writeCapacity = AVAudioFrameCount(
      ceil(Double(readFrameCount) * 16000.0 / inputFormat.sampleRate)
    ) + 1024

    guard let inBuf = AVAudioPCMBuffer(pcmFormat: inputFormat, frameCapacity: readFrameCount),
          let outBuf = AVAudioPCMBuffer(pcmFormat: targetFormat, frameCapacity: writeCapacity) else {
      throw NSError(domain: "AudioConverter", code: 3,
                    userInfo: [NSLocalizedDescriptionKey: "Failed to allocate audio buffers"])
    }

    var reachedEnd = false
    var convError: NSError?

    while true {
      outBuf.frameLength = outBuf.frameCapacity

      let status = converter.convert(to: outBuf, error: &convError) { _, inputStatus in
        guard !reachedEnd else {
          inputStatus.pointee = .endOfStream
          return nil
        }
        do {
          try inputFile.read(into: inBuf, frameCount: readFrameCount)
          if inBuf.frameLength == 0 {
            reachedEnd = true
            inputStatus.pointee = .endOfStream
            return nil
          }
          inputStatus.pointee = .haveData
          return inBuf
        } catch {
          reachedEnd = true
          inputStatus.pointee = .endOfStream
          return nil
        }
      }

      if let err = convError { throw err }
      if outBuf.frameLength > 0 { try outputFile.write(from: outBuf) }
      if status == .endOfStream || reachedEnd { break }
    }
  }
}
