import React, { useState } from 'react';
import { Headphones, Volume2, VolumeX, CloudRain, Wind, Radio, Activity } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { SoundscapeType } from '../../services/soundscapes';

export const SoundscapesDock: React.FC = () => {
  const { soundscapeState, toggleSoundscape, setSoundscapeVolume, settings } = useWorkspace();
  const [expanded, setExpanded] = useState(false);
  const t = getTranslations(settings.language);

  const presets: { id: SoundscapeType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'rain', label: t.soundscapes.rain, icon: CloudRain },
    { id: 'binaural', label: t.soundscapes.binaural, icon: Activity },
    { id: 'brown', label: t.soundscapes.brown, icon: Radio },
    { id: 'wind', label: t.soundscapes.wind, icon: Wind },
  ];

  return (
    <div className="relative select-none z-30">
      {/* Floating pill button */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
          soundscapeState.isPlaying
            ? 'bg-accent/20 border border-accent/40 text-accent shadow-glow'
            : 'glass-card text-text-secondary hover:text-text-primary'
        }`}
        title={t.soundscapes.title}
      >
        <Headphones className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">
          {soundscapeState.isPlaying ? t.soundscapes.playing : t.soundscapes.title}
        </span>

        {/* Animated mini soundwave equalizer when playing */}
        {soundscapeState.isPlaying && (
          <div className="flex items-end gap-0.5 h-3 px-1">
            <span className="w-0.5 h-3 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-0.5 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-0.5 h-3.5 bg-accent rounded-full animate-bounce" />
          </div>
        )}
      </button>

      {/* Expanded Control Popover */}
      {expanded && (
        <div className="absolute top-full mt-2 end-0 w-64 p-3.5 rounded-2xl glass-panel shadow-glass z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-text-primary">{t.soundscapes.title}</span>
            </div>
            {soundscapeState.isPlaying && (
              <button
                type="button"
                onClick={() => toggleSoundscape(soundscapeState.type || 'rain')}
                className="text-[11px] text-accent hover:underline"
              >
                {t.soundscapes.paused}
              </button>
            )}
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isActive = soundscapeState.isPlaying && soundscapeState.type === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => toggleSoundscape(preset.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-start transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-glow'
                      : 'bg-bg-glass hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-border-subtle/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 pt-1 px-1">
            <button
              type="button"
              onClick={() => setSoundscapeVolume(soundscapeState.volume > 0 ? 0 : 0.35)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              {soundscapeState.volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={soundscapeState.volume}
              onChange={(e) => setSoundscapeVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-border-subtle rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
};
