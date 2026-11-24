import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  Play,
  RotateCcw,
  History,
  Trash2,
  Check,
  ChevronRight,
  AlertCircle,
  Sliders,
  Flame,
  Layers,
} from 'lucide-react';
import { VOICES, TTS_PRESETS, QUICK_ARABIC_PHRASES } from '../data/presets';
import { VoiceOption, GeneratedAudioHistoryItem } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { safeFetchJson } from '../utils/api';
import { speakWithBrowser, stopBrowserSpeech } from '../utils/browserSpeech';

interface TextToSpeechTabProps {
  onOpenEnhancer: () => void;
  generatedAudios: GeneratedAudioHistoryItem[];
  setGeneratedAudios: React.Dispatch<React.SetStateAction<GeneratedAudioHistoryItem[]>>;
  currentAudio: GeneratedAudioHistoryItem | null;
  setCurrentAudio: (audio: GeneratedAudioHistoryItem | null) => void;
  externalText?: string;
  onClearExternalText?: () => void;
}

export const TextToSpeechTab: React.FC<TextToSpeechTabProps> = ({
  onOpenEnhancer,
  generatedAudios,
  setGeneratedAudios,
  currentAudio,
  setCurrentAudio,
  externalText,
  onClearExternalText,
}) => {
  const [text, setText] = useState<string>(
    TTS_PRESETS[0].text
  );

  React.useEffect(() => {
    if (externalText) {
      setText(externalText);
      if (onClearExternalText) onClearExternalText();
    }
  }, [externalText, onClearExternalText]);

  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [accentIntensity, setAccentIntensity] = useState<'light' | 'moderate' | 'strong'>('moderate');
  const [customStyle, setCustomStyle] = useState<string>('Santun, ramah, dan fasih bertajwid');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeakingBrowser, setIsSpeakingBrowser] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null);

  // Quick insert Arabic phrase into textarea
  const insertPhrase = (phrase: string) => {
    setText((prev) => {
      if (!prev.trim()) return phrase;
      return `${prev.trim()} ${phrase}`;
    });
  };

  // Apply a preset text
  const applyPreset = (presetText: string, title: string) => {
    setText(presetText);
    setCopiedPreset(title);
    setTimeout(() => setCopiedPreset(null), 1800);
  };

  // Browser speech fallback handler
  const handlePlayBrowserSpeech = () => {
    if (!text.trim()) return;
    setIsSpeakingBrowser(true);
    const success = speakWithBrowser(text, {
      rate: 0.9,
      onEnd: () => setIsSpeakingBrowser(false),
      onError: () => setIsSpeakingBrowser(false),
    });
    if (!success) {
      setIsSpeakingBrowser(false);
    }
  };

  // Call the server TTS endpoint safely
  const handleGenerateAudio = async () => {
    if (!text.trim()) {
      setError('Silakan masukkan teks yang ingin diubah menjadi audio.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await safeFetchJson<{
        success: boolean;
        audioBase64: string;
        mimeType?: string;
        error?: string;
      }>('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice.id,
          style: customStyle,
          accentIntensity,
        }),
      });

      if (!result.ok || !result.data?.success || !result.data?.audioBase64) {
        throw new Error(
          result.error ||
            result.data?.error ||
            'Gagal menghasilkan audio dari server. Pastikan API key aktif.'
        );
      }

      const newAudioItem: GeneratedAudioHistoryItem = {
        id: `audio_${Date.now()}`,
        text: text.trim(),
        audioBase64: result.data.audioBase64,
        voice: selectedVoice.id,
        voiceName: selectedVoice.name,
        mimeType: result.data.mimeType || 'audio/wav',
        timestamp: Date.now(),
      };

      setCurrentAudio(newAudioItem);
      setGeneratedAudios((prev) => [newAudioItem, ...prev.slice(0, 9)]);
    } catch (err: any) {
      console.error('TTS error:', err);
      const msg = err?.message || 'Terjadi gangguan saat memproses audio.';
      setError(
        msg === 'The string did not match the expected pattern.'
          ? 'Format data respons server tidak sesuai pola yang diharapkan. Silakan gunakan tombol putar browser di bawah ini atau coba beberapa saat lagi.'
          : msg
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratedAudios((prev) => prev.filter((item) => item.id !== id));
    if (currentAudio?.id === id) {
      setCurrentAudio(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Introduction Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Sintesis Suara Dwibahasa Berkarakter</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ubah Teks Indonesia Bernuansa Arab Menjadi Audio Fasih
          </h2>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Menghasilkan vokal berbahasa Indonesia yang alami dengan artikulasi makhraj
            huruf Arab yang fasih untuk doa, tausiyah, khutbah, salam, dan percakapan islami
            menggunakan kecerdasan buatan Gemini Voice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Text Input & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Text Editor Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <label className="text-sm font-bold text-slate-800">
                  Teks yang Ingin Diucapkan
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenEnhancer}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all hover:scale-105"
                  title="Perkaya teks Indonesia biasa menjadi bernuansa Islami/Arab dengan AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Perkaya Nuansa Arab AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setText('')}
                  className="text-xs text-slate-400 hover:text-red-500 font-medium px-2 py-1 rounded transition-colors"
                >
                  Bersihkan
                </button>
              </div>
            </div>

            {/* Presets Quick Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-600" />
                Pilih Contoh Teks Siap Pakai:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TTS_PRESETS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => applyPreset(preset.text, preset.title)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      copiedPreset === preset.title
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-200'
                    }`}
                  >
                    {copiedPreset === preset.title ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> Dipilih
                      </span>
                    ) : (
                      preset.title
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tuliskan kalimat berbahasa Indonesia di sini. Anda bisa memasukkan salam, bismillah, doa, atau istilah Arab lainnya..."
                rows={6}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all text-sm sm:text-base leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1 px-1">
                <span>Mendukung teks latin Indonesia & tulisan huruf Arab</span>
                <span>{text.length} karakter</span>
              </div>
            </div>

            {/* Quick Arabic Phrase Insertion Chips */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Sisipkan Frasa / Doa Arab Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ARABIC_PHRASES.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => insertPhrase(item.text)}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 hover:border-emerald-300 transition-all active:scale-95 flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Voice Personality & Accent Selection */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-100 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-800">
                  Pilih Karakter & Gaya Suara
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan pembawaan vokal, kefasihan lafaz, dan intensitas aksen Arab
              </p>
            </div>

            {/* Voice Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICES.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {voice.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">
                            {voice.name}
                          </h4>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            {voice.tone}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {voice.gender}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                      {voice.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        {voice.badge}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Aktif
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Accent Intensity Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Tingkat Nuansa & Aksen Arab:
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                  {accentIntensity === 'light'
                    ? 'Ringan (Indonesia Luwes)'
                    : accentIntensity === 'moderate'
                    ? 'Sedang (Harmonis & Fasih)'
                    : 'Kental (Tausiyah / Tartil Tajwid)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'light',
                    label: 'Ringan',
                    desc: 'Aksen halus, fokus pada keluwesan bahasa Indonesia',
                  },
                  {
                    id: 'moderate',
                    label: 'Sedang',
                    desc: 'Harmonis, lafaz doa/salam bertajwid makhraj tepat',
                  },
                  {
                    id: 'strong',
                    label: 'Kental',
                    desc: 'Gaya tausiyah/khutbah dengan artikulasi Arab penuh',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccentIntensity(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      accentIntensity === item.id
                        ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600'
                        : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleGenerateAudio}
                disabled={isLoading || !text.trim()}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isLoading || !text.trim()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white hover:scale-[1.01] active:scale-[0.99] shadow-emerald-700/25'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sedang Menyintesis Suara Arab-Indonesia...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>Konversi Teks Menjadi Audio</span>
                  </>
                )}
              </button>

              {/* Instant Browser Speech Quick Play Option */}
              <button
                type="button"
                onClick={handlePlayBrowserSpeech}
                disabled={!text.trim()}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/90 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isSpeakingBrowser
                    ? 'Sedang Membaca lewat Browser...'
                    : 'Putar Instan via Audio Peramban (Lokal)'}
                </span>
              </button>

              {error && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-amber-950">Catatan Koneksi Server</p>
                      <p className="mt-0.5 text-slate-700 leading-relaxed">{error}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-600">
                      Anda dapat tetap mendengarkan audio langsung di perangkat ini:
                    </span>
                    <button
                      type="button"
                      onClick={handlePlayBrowserSpeech}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeakingBrowser ? 'Sedang Membaca...' : 'Putar Audio Browser'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Output & History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Generated Audio Result Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Pemutar Audio Aktif
              </h3>
              {currentAudio && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {currentAudio.voiceName}
                </span>
              )}
            </div>

            {currentAudio ? (
              <div className="space-y-4">
                <AudioPlayer
                  audioBase64={currentAudio.audioBase64}
                  mimeType={currentAudio.mimeType}
                  title="Audio Suara Arab-Indonesia"
                  voiceName={currentAudio.voiceName}
                  autoPlay={true}
                />

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700 block">
                    Naskah Suara:
                  </span>
                  <p className="italic leading-relaxed line-clamp-4">
                    "{currentAudio.text}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  Belum Ada Audio yang Dibuat
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Ketik teks di samping lalu klik tombol <b>Konversi Teks Menjadi Audio</b> untuk mendengarkan hasilnya.
                </p>
              </div>
            )}
          </div>

          {/* History of Generated Audios */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">
                  Riwayat Audio Terakhir
                </h3>
              </div>
              {generatedAudios.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGeneratedAudios([])}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Hapus Semua
                </button>
              )}
            </div>

            {generatedAudios.length > 0 ? (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {generatedAudios.map((item) => {
                  const isActive = currentAudio?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setCurrentAudio(item)}
                      className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">
                            {item.voiceName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          {item.text}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => removeHistoryItem(item.id, e)}
                        className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
                        title="Hapus item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                Riwayat audio yang Anda hasilkan akan muncul di sini.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
