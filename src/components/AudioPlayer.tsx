import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  audioBase64: string;
  mimeType?: string;
  title?: string;
  voiceName?: string;
  autoPlay?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  title = 'Hasil Rekaman Audio',
  voiceName,
  autoPlay = true,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioSrc = `data:${mimeType};base64,${audioBase64}`;

  // Handle autoPlay on new audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented by browser:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [audioBase64, autoPlay]);

  // Audio event listeners
  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Play error:', err));
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const downloadAudio = () => {
    const link = document.createElement('a');
    link.href = audioSrc;
    const sanitizedTitle = (title || 'sawtuna-audio')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    link.download = `${sanitizedTitle}-${Date.now()}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Waveform visualization animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const barCount = 42;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight: number;
        if (isPlaying) {
          // Dynamic animated wave with rhythmic variation
          const wavePhase = (frame * 0.08) + (i * 0.35);
          const baseHeight = 0.25 + 0.65 * Math.abs(Math.sin(wavePhase));
          // add subtle secondary harmonic
          const harmonic = 0.2 * Math.cos(frame * 0.05 + i * 0.1);
          barHeight = Math.max(0.15, Math.min(0.95, baseHeight + harmonic)) * height;
        } else {
          // Resting waveform static view
          const progress = duration > 0 ? currentTime / duration : 0;
          const barPos = i / barCount;
          const isPassed = barPos <= progress;
          const staticWave = Math.sin(i * 0.3) * 0.3 + 0.4;
          barHeight = staticWave * height * (isPassed ? 0.75 : 0.5);
        }

        const x = i * (barWidth + 2);
        const y = (height - barHeight) / 2;

        const progress = duration > 0 ? currentTime / duration : 0;
        const isPassed = i / barCount <= progress;

        // Gradient color for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPassed || isPlaying) {
          gradient.addColorStop(0, '#f59e0b'); // amber-500
          gradient.addColorStop(1, '#059669'); // emerald-600
        } else {
          gradient.addColorStop(0, '#94a3b8'); // slate-400
          gradient.addColorStop(1, '#cbd5e1'); // slate-300
        }

        ctx.fillStyle = gradient;
        // Rounded bar ends
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        frame++;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-emerald-800/80">
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
            Audio Siap Diputar
          </span>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
            {title}
          </h3>
          {voiceName && (
            <p className="text-xs text-emerald-300">
              Karakter Suara: <span className="text-amber-300 font-medium">{voiceName}</span>
            </p>
          )}
        </div>

        <button
          onClick={downloadAudio}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 rounded-xl text-xs font-semibold border border-emerald-700 transition-all hover:scale-105 shadow"
          title="Unduh File Audio (.WAV)"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Unduh WAV</span>
        </button>
      </div>

      {/* Waveform Canvas */}
      <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-800/40 mb-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={520}
          height={64}
          className="w-full h-16 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (duration > 0 && audioRef.current) {
              const newTime = clickPos * duration;
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }}
        />
      </div>

      {/* Progress Bar & Timestamps */}
      <div className="space-y-1 mb-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />
        <div className="flex justify-between text-xs text-emerald-300/80 font-mono-code">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-emerald-800/50">
        <div className="flex items-center gap-2">
          {/* Main Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-emerald-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg font-bold"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Restart */}
          <button
            onClick={restartAudio}
            className="w-9 h-9 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 flex items-center justify-center transition-all"
            title="Putar Ulang dari Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={toggleMute}
              className="text-emerald-300 hover:text-white p-1"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* Playback speed buttons */}
        <div className="flex items-center gap-1 bg-emerald-900/60 p-1 rounded-lg border border-emerald-800/60">
          {[0.8, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                playbackRate === rate
                  ? 'bg-amber-400 text-emerald-950'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
