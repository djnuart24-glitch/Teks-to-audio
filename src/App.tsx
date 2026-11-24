/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TextToSpeechTab } from './components/TextToSpeechTab';
import { AudioToJsonTab } from './components/AudioToJsonTab';
import { DictionaryTab } from './components/DictionaryTab';
import { EnhanceTextModal } from './components/EnhanceTextModal';
import { GeneratedAudioHistoryItem } from './types';
import { Volume2, FileJson, BookOpen, Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'tts' | 'stt' | 'dictionary'>('tts');
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudioHistoryItem[]>([]);
  const [currentAudio, setCurrentAudio] = useState<GeneratedAudioHistoryItem | null>(null);
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [textToTransfer, setTextToTransfer] = useState<string>('');

  // Load audio history from localStorage on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sawtuna_audio_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGeneratedAudios(parsed);
          setCurrentAudio(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load audio history from localStorage:', e);
    }
  }, []);

  // Save audio history to localStorage
  useEffect(() => {
    try {
      // Keep only up to 10 most recent to avoid quota limits
      const toSave = generatedAudios.slice(0, 10);
      localStorage.setItem('sawtuna_audio_history', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save audio history to localStorage:', e);
    }
  }, [generatedAudios]);

  const handleUsePhraseInTts = (phrase: string) => {
    setTextToTransfer(phrase);
    setActiveTab('tts');
  };

  const handleApplyEnhancedText = (enhanced: string) => {
    setTextToTransfer(enhanced);
    setActiveTab('tts');
  };

  return (
    <div className="min-h-screen flex flex-col bg-islamic-pattern text-slate-800">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEnhancer={() => setIsEnhancerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'tts' && (
          <TextToSpeechTab
            onOpenEnhancer={() => setIsEnhancerOpen(true)}
            generatedAudios={generatedAudios}
            setGeneratedAudios={setGeneratedAudios}
            currentAudio={currentAudio}
            setCurrentAudio={setCurrentAudio}
            externalText={textToTransfer}
            onClearExternalText={() => setTextToTransfer('')}
          />
        )}

        {activeTab === 'stt' && <AudioToJsonTab />}

        {activeTab === 'dictionary' && (
          <DictionaryTab onUsePhraseInTts={handleUsePhraseInTts} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-100 bg-white/80 backdrop-blur-sm py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xs">
              ص
            </div>
            <span className="font-semibold text-slate-700">
              Sawtuna صوتنا
            </span>
            <span className="text-slate-400">•</span>
            <span>Konversi Teks ke Suara & Transkripsi Audio ke JSON (Arab-Indonesia)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Suara AI Fasih Bertajwid
            </span>
            <span>•</span>
            <span>Didukung Gemini Multi-Modal</span>
          </div>
        </div>
      </footer>

      {/* AI Text Enhancer Modal */}
      <EnhanceTextModal
        isOpen={isEnhancerOpen}
        onClose={() => setIsEnhancerOpen(false)}
        onApplyText={handleApplyEnhancedText}
      />
    </div>
  );
}
