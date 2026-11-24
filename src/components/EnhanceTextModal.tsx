import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';

interface EnhanceTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (text: string) => void;
  initialText?: string;
}

export const EnhanceTextModal: React.FC<EnhanceTextModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
  initialText = '',
}) => {
  const [inputText, setInputText] = useState(
    initialText || 'Selamat pagi bapak dan ibu sekalian, semoga acara hari ini berjalan lancar dan penuh manfaat untuk kita semua.'
  );
  const [mode, setMode] = useState<'tausiyah' | 'doa' | 'percakapan' | 'sambutan'>('tausiyah');
  const [enhancedText, setEnhancedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      setError('Masukkan kalimat dasar yang ingin diperkaya.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim(),
          mode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperkaya teks.');
      }

      setEnhancedText(data.enhancedText);
    } catch (err: any) {
      console.error('Enhance error:', err);
      setError(err?.message || 'Terjadi kesalahan pada asisten AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseEnhanced = () => {
    if (enhancedText) {
      onApplyText(enhancedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-emerald-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Perkaya Nuansa Arab-Indonesia AI
              </h3>
              <p className="text-xs text-slate-500">
                Ubah kalimat biasa menjadi untaian kata islami yang santun & bertutur fasih
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Text */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Kalimat Dasar Anda (Bahasa Indonesia):
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Ketik kalimat santai atau formal..."
            className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
        </div>

        {/* Mode Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            Pilih Nada & Gaya Tutur:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'tausiyah', label: 'Tausiyah / Nasihat' },
              { id: 'doa', label: 'Doa Harian' },
              { id: 'percakapan', label: 'Percakapan Santri' },
              { id: 'sambutan', label: 'Sambutan Majelis' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as any)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  mode === item.id
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleEnhance}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyusun Kalimat Bernuansa Arab...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Buat Teks Bernuansa Arab AI</span>
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        {/* Enhanced Output Result */}
        {enhancedText && (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">
                ✨ Hasil Rekomendasi Teks AI:
              </span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed font-medium italic">
              "{enhancedText}"
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleUseEnhanced}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Gunakan Teks Ini di Audio</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
