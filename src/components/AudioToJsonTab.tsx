import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  UploadCloud,
  FileAudio,
  FileJson,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  MessageSquare,
  Layers,
  Code2,
  Eye,
  RefreshCw,
  Search,
  Volume2,
} from 'lucide-react';
import { StructuredTranscriptJson } from '../types';

export const AudioToJsonTab: React.FC = () => {
  const [activeInputMode, setActiveInputMode] = useState<'record' | 'upload' | 'sample'>('record');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingBase64, setRecordingBase64] = useState<string | null>(null);
  const [recordingMimeType, setRecordingMimeType] = useState<string>('audio/webm');
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

  // Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('audio/wav');

  // Transcription states
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptResult, setTranscriptResult] = useState<StructuredTranscriptJson | null>(null);
  const [activeResultView, setActiveResultView] = useState<'interactive' | 'json'>('interactive');
  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState('');

  // Refs for media recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
    };
  }, [previewAudioUrl]);

  // Start Voice Recording
  const startRecording = async () => {
    setError(null);
    setRecordingBlob(null);
    setRecordingBase64(null);
    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Prefer standard supported mime types
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordingBlob(fullBlob);
        setRecordingMimeType(mimeType);

        const url = URL.createObjectURL(fullBlob);
        setPreviewAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Extract pure base64 (without data:audio/xxx;base64,)
          const base64Str = result.split(',')[1];
          setRecordingBase64(base64Str);
        };
        reader.readAsDataURL(fullBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      setError(
        'Gagal mengakses mikrofon. Pastikan Anda telah memberikan izin mikrofon di peramban Anda.'
      );
    }
  };

  // Stop Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Handle Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|webm|ogg|aac|flac)$/i)) {
      setError('Harap pilih file audio yang valid (MP3, WAV, M4A, WEBM, OGG).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('Ukuran file maksimal adalah 25MB.');
      return;
    }

    setUploadedFile(file);
    setUploadedMimeType(file.type || 'audio/mp3');

    if (previewAudioUrl) {
      URL.revokeObjectURL(previewAudioUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewAudioUrl(url);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Str = result.split(',')[1];
      setUploadedBase64(base64Str);
    };
    reader.readAsDataURL(file);
  };

  // Load a Pre-configured Sample for Instant Testing
  const loadSampleAudio = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // Generate sample audio on the fly with TTS so the user has an actual live audio file to transcribe
      const sampleText =
        "Bismillaahir-rahmaanir-rahiim. Alhamdulillahi rabbil 'alamin. Assalamu'alaikum warahmatullahi wabarakatuh sahabat sekalian. Semoga Allah Subhanahu wa Ta'ala melimpahkan berkah dan meridhai ikhtiar kita hari ini. Jazakallahu khairan atas kebersamaan kita.";

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voice: 'Puck',
          style: 'Fasih, tenang, tausiyah bertajwid',
        }),
      });

      const ttsData = await ttsRes.json();
      if (!ttsRes.ok || !ttsData.audioBase64) {
        throw new Error(ttsData.error || 'Gagal memuat sampel audio.');
      }

      setUploadedBase64(ttsData.audioBase64);
      setUploadedMimeType('audio/wav');
      setUploadedFile(new File([], 'sampel-tausiyah-arab-indo.wav', { type: 'audio/wav' }));

      // Immediately transcribe the sample
      await processTranscription(ttsData.audioBase64, 'audio/wav', 'Sampel Audio Tausiyah Arab-Indonesia');
    } catch (err: any) {
      console.error('Sample loading error:', err);
      setError(err?.message || 'Gagal memuat sampel audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Transcription API Call
  const handleTranscribe = async () => {
    const audioData =
      activeInputMode === 'record' ? recordingBase64 : uploadedBase64;
    const mime =
      activeInputMode === 'record' ? recordingMimeType : uploadedMimeType;

    if (!audioData) {
      setError('Silakan rekam suara Anda atau unggah file audio terlebih dahulu.');
      return;
    }

    await processTranscription(audioData, mime);
  };

  const processTranscription = async (
    audioBase64: string,
    mimeType: string,
    contextHint?: string
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/transcribe-to-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          contextHint,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah audio menjadi teks JSON.');
      }

      setTranscriptResult(data.data);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setError(err?.message || 'Terjadi kesalahan saat memproses transkripsi audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format mm:ss for recording timer
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Copy JSON to clipboard
  const copyJsonToClipboard = () => {
    if (!transcriptResult) return;
    navigator.clipboard.writeText(JSON.stringify(transcriptResult, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Download JSON file
  const downloadJsonFile = () => {
    if (!transcriptResult) return;
    const jsonStr = JSON.stringify(transcriptResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sawtuna-transkripsi-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter json string for search
  const jsonString = transcriptResult ? JSON.stringify(transcriptResult, null, 2) : '';

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <FileJson className="w-3.5 h-3.5" />
            <span>Transkripsi Suara Cerdas ke Data JSON</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ubah Audio Suara Menjadi Teks JSON Terstruktur Lengkap
          </h2>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Rekam langsung atau unggah rekaman audio berbahasa Indonesia & Arab. Sistem
            mengekstrak ucapan menjadi data JSON rapi berisikan metadata bahasa, ringkasan,
            transkrip penuh, pengenalan doa/lafaz Arab beserta artinya, dan lini masa segmen waktu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Audio Input (Mic or Upload) (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-100 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                Pilih Sumber Audio
              </h3>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveInputMode('record')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeInputMode === 'record'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rekam Mic</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputMode('upload')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeInputMode === 'upload'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unggah File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveInputMode('sample');
                  loadSampleAudio();
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeInputMode === 'sample'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tes Sampel</span>
              </button>
            </div>

            {/* MODE 1: Microphone Recording */}
            {activeInputMode === 'record' && (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-50 to-emerald-50/30 border border-emerald-100 text-center space-y-4">
                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="relative inline-flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/20 animate-ping absolute"></div>
                        <div className="w-20 h-20 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                          <Mic className="w-8 h-8" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-2xl font-mono-code font-bold text-red-600">
                          {formatSeconds(recordingDuration)}
                        </div>
                        <p className="text-xs text-slate-500 animate-pulse">
                          Sedang merekam suara... Silakan berbicara dalam bahasa Indonesia & Arab
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Selesai & Simpan Rekaman</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={startRecording}
                        className="w-20 h-20 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Mic className="w-8 h-8" />
                      </button>

                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Tekan untuk Memulai Rekam Suara
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
                          Ucapkan salam, doa, kalimat bahasa Indonesia, atau istilah Arab apa saja.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Recorded Audio */}
                {previewAudioUrl && !isRecording && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <FileAudio className="w-4 h-4 text-emerald-700" />
                        Hasil Rekaman Suara Anda
                      </span>
                      <span className="font-mono-code text-slate-500">
                        {formatSeconds(recordingDuration)}
                      </span>
                    </div>
                    <audio
                      src={previewAudioUrl}
                      controls
                      className="w-full h-10 accent-emerald-600"
                    />
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: File Upload */}
            {activeInputMode === 'upload' && (
              <div className="space-y-4">
                <label className="block p-6 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 cursor-pointer transition-all text-center">
                  <input
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <span className="text-sm font-bold text-slate-700 block">
                    Klik untuk Memilih File Audio
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Mendukung MP3, WAV, M4A, WEBM, OGG (Maks 25MB)
                  </span>
                </label>

                {uploadedFile && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900 truncate max-w-[200px]">
                        {uploadedFile.name}
                      </span>
                      <span className="text-slate-500 font-mono-code">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    {previewAudioUrl && (
                      <audio
                        src={previewAudioUrl}
                        controls
                        className="w-full h-10 accent-emerald-600"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: Sample Test */}
            {activeInputMode === 'sample' && (
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950">
                    Sampel Suara Arab-Indonesia
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 max-w-xs mx-auto leading-relaxed">
                    Audio simulasi tausiyah singkat berlafaz Bismillah, salam, tahmid, dan doa telah dimuat otomatis untuk Anda uji coba.
                  </p>
                </div>

                {previewAudioUrl && (
                  <audio
                    src={previewAudioUrl}
                    controls
                    className="w-full h-10 accent-amber-600"
                  />
                )}
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              type="button"
              onClick={handleTranscribe}
              disabled={
                isProcessing ||
                (activeInputMode === 'record' && !recordingBase64) ||
                (activeInputMode === 'upload' && !uploadedBase64) ||
                (activeInputMode === 'sample' && !uploadedBase64)
              }
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                isProcessing ||
                (activeInputMode === 'record' && !recordingBase64) ||
                (activeInputMode === 'upload' && !uploadedBase64) ||
                (activeInputMode === 'sample' && !uploadedBase64)
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white hover:scale-[1.01] active:scale-[0.99] shadow-emerald-700/25'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sedang Menganalisis Suara & Membentuk JSON...</span>
                </>
              ) : (
                <>
                  <FileJson className="w-5 h-5" />
                  <span>Konversi Audio Menjadi Teks JSON</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured JSON & Visual Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-100 min-h-[500px] flex flex-col">
            {/* Header & View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Hasil Transkripsi JSON Terstruktur
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Metadata dwibahasa, teks lengkap, dan ekstraksi doa Arab
                </p>
              </div>

              {transcriptResult && (
                <div className="flex items-center gap-2">
                  {/* Toggle between Interactive Visual View and Raw JSON */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveResultView('interactive')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeResultView === 'interactive'
                          ? 'bg-white text-emerald-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visual Interaktif</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultView('json')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeResultView === 'json'
                          ? 'bg-white text-emerald-900 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>JSON Baku</span>
                    </button>
                  </div>

                  {/* Copy JSON */}
                  <button
                    type="button"
                    onClick={copyJsonToClipboard}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Salin JSON ke Papan Klip"
                  >
                    {copiedJson ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Download JSON */}
                  <button
                    type="button"
                    onClick={downloadJsonFile}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                    title="Unduh File .json"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {transcriptResult ? (
              <div className="flex-1 py-4 space-y-6">
                {/* Meta Badges Ribbon */}
                {transcriptResult.metadata && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {transcriptResult.metadata.title && (
                      <span className="font-semibold text-emerald-900 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                        📌 {transcriptResult.metadata.title}
                      </span>
                    )}
                    {transcriptResult.metadata.primary_language && (
                      <span className="font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                        🌐 {transcriptResult.metadata.primary_language}
                      </span>
                    )}
                    {transcriptResult.metadata.estimated_tone && (
                      <span className="font-medium text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        🎙️ {transcriptResult.metadata.estimated_tone}
                      </span>
                    )}
                    {transcriptResult.metadata.arabic_presence_level && (
                      <span className="font-medium text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                        ✨ Unsur Arab: {transcriptResult.metadata.arabic_presence_level}
                      </span>
                    )}
                  </div>
                )}

                {/* VIEW 1: INTERACTIVE SMART CARDS */}
                {activeResultView === 'interactive' && (
                  <div className="space-y-6">
                    {/* Summary Card */}
                    {transcriptResult.summary && (
                      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                          Ringkasan Isi Audio
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {transcriptResult.summary}
                        </p>
                      </div>
                    )}

                    {/* Full Transcript Card */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Transkrip Lengkap Teks
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {transcriptResult.full_transcript.length} karakter
                        </span>
                      </div>
                      <p className="text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {transcriptResult.full_transcript}
                      </p>
                    </div>

                    {/* Arabic Phrases Extracted Cards */}
                    {transcriptResult.arabic_phrases_extracted &&
                      transcriptResult.arabic_phrases_extracted.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <h4 className="text-sm font-bold text-slate-800">
                              Lafaz & Doa Bahasa Arab yang Terdeteksi
                            </h4>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {transcriptResult.arabic_phrases_extracted.map(
                              (phrase, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-emerald-50/30 border border-amber-200/60 shadow-xs space-y-2"
                                >
                                  {phrase.arabic_script && (
                                    <div className="text-right font-arabic text-xl sm:text-2xl text-emerald-950 font-semibold leading-relaxed">
                                      {phrase.arabic_script}
                                    </div>
                                  )}

                                  <div>
                                    <div className="text-xs font-bold text-slate-800">
                                      {phrase.transliteration || phrase.phrase}
                                    </div>
                                    {phrase.indonesian_meaning && (
                                      <p className="text-xs text-slate-600 italic mt-1 leading-normal">
                                        "{phrase.indonesian_meaning}"
                                      </p>
                                    )}
                                  </div>

                                  {phrase.category && (
                                    <div className="pt-2 border-t border-amber-200/40 flex justify-between items-center text-[10px]">
                                      <span className="font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                                        {phrase.category}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Segmented Timeline */}
                    {transcriptResult.segments && transcriptResult.segments.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-emerald-700" />
                          <h4 className="text-sm font-bold text-slate-800">
                            Penggalan Waktu & Segmen Suara
                          </h4>
                        </div>

                        <div className="space-y-2">
                          {transcriptResult.segments.map((seg) => (
                            <div
                              key={seg.id}
                              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50/50 transition-all flex items-start gap-3"
                            >
                              <span className="font-mono-code text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-md shrink-0 mt-0.5">
                                {seg.time_range}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                                  {seg.text}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px]">
                                  {seg.sentiment && (
                                    <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                      Tone: {seg.sentiment}
                                    </span>
                                  )}
                                  {seg.language_tag && (
                                    <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-mono">
                                      {seg.language_tag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Takeaways & Glossary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {transcriptResult.key_points &&
                        transcriptResult.key_points.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Poin-Poin Utama
                            </span>
                            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                              {transcriptResult.key_points.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {transcriptResult.glossary &&
                        transcriptResult.glossary.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Glosarium Istilah
                            </span>
                            <div className="text-xs space-y-2">
                              {transcriptResult.glossary.map((item, i) => (
                                <div key={i}>
                                  <span className="font-bold text-emerald-800">
                                    {item.term}:
                                  </span>{' '}
                                  <span className="text-slate-600">
                                    {item.meaning}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* VIEW 2: RAW SYNTAX HIGHLIGHTED JSON */}
                {activeResultView === 'json' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Representasi Format JSON Standar:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={copyJsonToClipboard}
                          className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          {copiedJson ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Tersalin!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Salin JSON
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="relative rounded-2xl bg-slate-900 text-emerald-300 p-4 font-mono-code text-xs max-h-[550px] overflow-auto border border-slate-800">
                      <pre className="whitespace-pre-wrap leading-relaxed">
                        {jsonString}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <FileJson className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-700">
                  Data JSON Akan Ditampilkan di Sini
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                  Pilih mikrofon atau unggah file rekaman suara Anda di sebelah kiri, kemudian klik tombol konversi untuk menghasilkan struktur JSON lengkap.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
