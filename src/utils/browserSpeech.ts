/**
 * Client-side Web Speech Synthesis Fallback
 * Provides instant audio playback using the browser's native speech synthesis engine
 * if the remote API is unreachable, offline, or returns an error.
 */

export function speakWithBrowser(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (error: any) => void;
  }
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any previous speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate || 0.95; // Slightly slower for clear Arabic-Indonesian articulation
    utterance.pitch = options?.pitch || 1.0;

    // Look for Indonesian voice, or Arabic voice, or fallback
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(
      (v) => v.lang.startsWith('id') || v.lang.startsWith('in')
    );
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));

    if (indonesianVoice) {
      utterance.voice = indonesianVoice;
      utterance.lang = indonesianVoice.lang;
    } else if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    } else {
      utterance.lang = 'id-ID';
    }

    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options?.onError) {
      utterance.onerror = options.onError;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Browser speech synthesis failed:', err);
    if (options?.onError) options.onError(err);
    return false;
  }
}

export function stopBrowserSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
