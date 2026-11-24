export interface ArabicPhraseExtracted {
  phrase: string;
  arabic_script?: string;
  transliteration?: string;
  indonesian_meaning?: string;
  category?: string;
}

export interface AudioSegment {
  id: number;
  time_range: string;
  speaker?: string;
  text: string;
  language_tag?: 'id' | 'ar' | 'id-ar' | string;
  arabic_terms?: string[];
  sentiment?: string;
}

export interface AudioMetadata {
  title?: string;
  detected_languages?: string[];
  primary_language?: string;
  estimated_tone?: string;
  arabic_presence_level?: 'Rendah' | 'Sedang' | 'Tinggi' | string;
}

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export interface StructuredTranscriptJson {
  metadata?: AudioMetadata;
  summary?: string;
  full_transcript: string;
  segments?: AudioSegment[];
  arabic_phrases_extracted?: ArabicPhraseExtracted[];
  key_points?: string[];
  glossary?: GlossaryItem[];
}

export interface VoiceOption {
  id: string; // Puck, Charon, Kore, Fenrir, Zephyr
  name: string;
  gender: 'Pria' | 'Wanita';
  description: string;
  tone: string;
  badge: string;
}

export interface GeneratedAudioHistoryItem {
  id: string;
  text: string;
  audioBase64: string;
  voice: string;
  voiceName: string;
  mimeType: string;
  timestamp: number;
  duration?: number;
}
