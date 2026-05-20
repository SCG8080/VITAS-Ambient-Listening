const BASE = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/';

export interface WhisperModel {
  key: string;
  fileName: string;
  url: string;
  sizeLabel: string;
  sizeBytes: number;
  language: 'english' | 'multilingual';
  qualityLevel: 1 | 2 | 3 | 4;
  speedLabel: 'Fastest' | 'Fast' | 'Moderate' | 'Slow';
  description: string;
  isDefault?: boolean;
}

export const WHISPER_MODELS: WhisperModel[] = [
  {
    key: 'tiny.en',
    fileName: 'ggml-tiny.en.bin',
    url: BASE + 'ggml-tiny.en.bin',
    sizeLabel: '75 MB',
    sizeBytes: 75_000_000,
    language: 'english',
    qualityLevel: 1,
    speedLabel: 'Fastest',
    description: 'Smallest and fastest. Ideal for clear English speech in quiet environments.',
    isDefault: true,
  },
  {
    key: 'base.en',
    fileName: 'ggml-base.en.bin',
    url: BASE + 'ggml-base.en.bin',
    sizeLabel: '142 MB',
    sizeBytes: 142_000_000,
    language: 'english',
    qualityLevel: 2,
    speedLabel: 'Fast',
    description: 'Better accuracy for accented speech or mild background noise.',
  },
  {
    key: 'small.en',
    fileName: 'ggml-small.en.bin',
    url: BASE + 'ggml-small.en.bin',
    sizeLabel: '488 MB',
    sizeBytes: 488_000_000,
    language: 'english',
    qualityLevel: 3,
    speedLabel: 'Moderate',
    description: 'High accuracy. Handles medical terminology and complex conversation well.',
  },
  {
    key: 'medium.en',
    fileName: 'ggml-medium.en.bin',
    url: BASE + 'ggml-medium.en.bin',
    sizeLabel: '1.5 GB',
    sizeBytes: 1_500_000_000,
    language: 'english',
    qualityLevel: 4,
    speedLabel: 'Slow',
    description: 'Near-professional accuracy. Best for critical documentation. Requires ample free storage.',
  },
  {
    key: 'tiny',
    fileName: 'ggml-tiny.bin',
    url: BASE + 'ggml-tiny.bin',
    sizeLabel: '75 MB',
    sizeBytes: 75_000_000,
    language: 'multilingual',
    qualityLevel: 1,
    speedLabel: 'Fastest',
    description: 'Supports 99 languages. Use when patients speak non-English. Lower English accuracy than tiny.en.',
  },
  {
    key: 'base',
    fileName: 'ggml-base.bin',
    url: BASE + 'ggml-base.bin',
    sizeLabel: '142 MB',
    sizeBytes: 142_000_000,
    language: 'multilingual',
    qualityLevel: 2,
    speedLabel: 'Fast',
    description: 'Better multilingual accuracy. Good for non-English speaking patients.',
  },
  {
    key: 'small',
    fileName: 'ggml-small.bin',
    url: BASE + 'ggml-small.bin',
    sizeLabel: '488 MB',
    sizeBytes: 488_000_000,
    language: 'multilingual',
    qualityLevel: 3,
    speedLabel: 'Moderate',
    description: 'High accuracy across all languages. Recommended for multilingual clinical settings.',
  },
];

export const DEFAULT_MODEL_KEY = 'tiny.en';
export const MODEL_PREF_STORAGE_KEY = '@vitas/selected_model';

export const QUALITY_LABELS: Record<number, string> = {
  1: 'Basic',
  2: 'Good',
  3: 'High',
  4: 'Best',
};
