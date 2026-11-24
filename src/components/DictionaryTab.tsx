import React, { useState } from 'react';
import { Search, BookOpen, Copy, Check, ArrowRight, Volume2 } from 'lucide-react';
import { ARABIC_INDO_DICTIONARY } from '../data/presets';

interface DictionaryTabProps {
  onUsePhraseInTts: (text: string) => void;
}

export const DictionaryTab: React.FC<DictionaryTabProps> = ({ onUsePhraseInTts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const categories = [
    'Semua',
    ...Array.from(new Set(ARABIC_INDO_DICTIONARY.map((item) => item.category))),
  ];

  const filteredItems = ARABIC_INDO_DICTIONARY.filter((item) => {
    const matchesCategory =
      selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch =
      item.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.arabic.includes(searchTerm) ||
      item.usage.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-400/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kamus Frasa, Doa & Sapaan Populer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Perbendaharaan Istilah Arab dalam Tutur Indonesia
          </h2>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Daftar ungkapan doa, salam, dan istilah adab berbahasa Arab yang lazim digunakan
            masyarakat Indonesia. Anda dapat menyalin atau langsung mengirimkannya ke editor
            suara untuk disuarakan.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari lafaz, transliterasi, atau arti..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Dictionary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {item.category}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.transliteration, idx)}
                  className="text-slate-400 hover:text-emerald-700 p-1 rounded-lg transition-colors"
                  title="Salin transliterasi"
                >
                  {copiedIndex === idx ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Tersalin
                    </span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Arabic Script Calligraphy */}
              <div className="text-right font-arabic text-2xl sm:text-3xl text-emerald-950 font-semibold leading-relaxed py-1">
                {item.arabic}
              </div>

              {/* Transliteration and Meaning */}
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {item.transliteration}
                </h4>
                <p className="text-xs text-slate-600 italic mt-1 leading-relaxed">
                  "{item.meaning}"
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Konteks: </span>
                {item.usage}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onUsePhraseInTts(item.transliteration)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gunakan di Suara Teks</span>
                <ArrowRight className="w-3 h-3 text-emerald-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
