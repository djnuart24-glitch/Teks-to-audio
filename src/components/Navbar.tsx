import React from 'react';
import { Volume2, FileJson, BookOpen, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'tts' | 'stt' | 'dictionary';
  setActiveTab: (tab: 'tts' | 'stt' | 'dictionary') => void;
  onOpenEnhancer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEnhancer,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-950/95 text-emerald-50 backdrop-blur-md border-b border-emerald-800/60 shadow-lg shadow-emerald-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-emerald-900 rounded-[14px] flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Sawtuna</span>
                  <span className="font-arabic text-amber-300 text-lg sm:text-xl font-normal">
                    صَوْتُنَا
                  </span>
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Arab-Indo AI
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 hidden sm:block">
                Studio Konversi Teks ke Suara & Transkripsi Audio ke JSON
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 p-1 bg-emerald-900/60 rounded-xl border border-emerald-800/80">
            <button
              onClick={() => setActiveTab('tts')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'tts'
                  ? 'bg-amber-500 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Teks ➔ Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('stt')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'stt'
                  ? 'bg-amber-500 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <FileJson className="w-4 h-4" />
              <span>Audio ➔ JSON</span>
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'dictionary'
                  ? 'bg-amber-500 text-emerald-950 font-semibold shadow-sm'
                  : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kamus Frasa</span>
            </button>
          </nav>

          {/* Action button: AI Text Enhancer */}
          {onOpenEnhancer && (
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={onOpenEnhancer}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-800/60 hover:bg-emerald-800 text-amber-200 border border-amber-400/30 transition-all hover:scale-[1.02] shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Perkaya Nuansa Arab AI</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
