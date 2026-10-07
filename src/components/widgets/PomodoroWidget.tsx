import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Flame } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations, formatBilingualNumber } from '../../i18n/useTranslation';
import { storage } from '../../services/storage';

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';
interface PomodoroState { mode: PomodoroMode; timeLeft: number; endAt: number | null; completedSessions: number; }

export const PomodoroWidget: React.FC = () => {
  const { settings, toggleSoundscape, soundscapeState, focusShield, updateFocusShield } = useWorkspace();
  const [mode, setMode] = useState<PomodoroMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const t = getTranslations(settings.language);

  const totalTime = mode === 'work' ? 25 * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;

  useEffect(() => { storage.get<PomodoroState | null>('pomodoro_state', null).then((saved) => { if (saved) { setMode(saved.mode); setEndAt(saved.endAt); setTimeLeft(saved.endAt ? Math.max(0, Math.ceil((saved.endAt - Date.now()) / 1000)) : saved.timeLeft); setIsRunning(!!saved.endAt); setCompletedSessions(saved.completedSessions || 0); } setHydrated(true); }); }, []);
  useEffect(() => { if (hydrated) void storage.set<PomodoroState>('pomodoro_state', { mode, timeLeft, endAt, completedSessions }); }, [hydrated, mode, timeLeft, endAt, completedSessions]);
  useEffect(() => {
    if (!endAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setEndAt(null); setIsRunning(false);
        if (mode === 'work') { const nextCount = completedSessions + 1; setCompletedSessions(nextCount); const next = nextCount % 4 === 0 ? 'longBreak' : 'shortBreak'; setMode(next); setTimeLeft(next === 'longBreak' ? 15 * 60 : 5 * 60); }
        else { setMode('work'); setTimeLeft(25 * 60); }
      }
    };
    tick(); const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [endAt, mode, completedSessions]);

  const toggleTimer = () => {
    if (isRunning) { setTimeLeft(endAt ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000)) : timeLeft); setEndAt(null); setIsRunning(false); if (focusShield.autoOnPomodoro && mode === 'work') updateFocusShield({ sessionUntil: 0 }); }
    else { const deadline = Date.now() + timeLeft * 1000; setEndAt(deadline); setIsRunning(true); if (focusShield.autoOnPomodoro && mode === 'work') updateFocusShield({ sessionUntil: deadline }); }
    // Optional focus soundscape auto-activation
    if (!isRunning && mode === 'work' && !soundscapeState.isPlaying) {
      toggleSoundscape('rain');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setEndAt(null);
    if (focusShield.autoOnPomodoro) updateFocusShield({ sessionUntil: 0 });
    setTimeLeft(totalTime);
  };

  const switchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsRunning(false);
    setEndAt(null);
    if (focusShield.autoOnPomodoro) updateFocusShield({ sessionUntil: 0 });
    setTimeLeft(newMode === 'work' ? 25 * 60 : newMode === 'shortBreak' ? 5 * 60 : 15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="pimx-work-card pimx-timer-card flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold text-text-primary tracking-wide uppercase">
            {t.widgets.pomodoro}
          </h2>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
          <Flame className="w-3.5 h-3.5 fill-amber-400" />
          <span>{formatBilingualNumber(completedSessions, settings.language)}</span>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="pimx-timer-modes flex items-center justify-center gap-1 mb-3 bg-bg-glass p-1 rounded-xl border border-border-subtle/50">
        <button
          type="button"
          onClick={() => switchMode('work')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
            mode === 'work' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t.pomodoro.workSession}
        </button>
        <button
          type="button"
          onClick={() => switchMode('shortBreak')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
            mode === 'shortBreak' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          {t.pomodoro.shortBreak}
        </button>
        <button type="button" onClick={() => switchMode('longBreak')} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${mode === 'longBreak' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}>{settings.language === 'fa' ? 'استراحت بلند' : 'Long break'}</button>
      </div>

      {/* Circular Progress & Clock Display */}
      <div className="pimx-timer-stage flex-1 flex flex-col items-center justify-center my-1">
        <div className="pimx-timer-dial relative w-28 h-28 flex items-center justify-center">
          <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="56"
              cy="56"
              r="40"
              className="stroke-border-subtle fill-none"
              strokeWidth="5"
            />
            {/* Progress ring */}
            <circle
              cx="56"
              cy="56"
              r="40"
              className="stroke-accent fill-none transition-all duration-300"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold tracking-tight text-text-primary font-mono">
              {formatBilingualNumber(timeDisplay, settings.language)}
            </span>
            <span className="text-[10px] text-text-muted capitalize">
              {mode === 'work' ? 'Focus' : 'Break'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="pimx-timer-controls flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
            isRunning
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-accent text-white hover:opacity-90'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>{t.pomodoro.pause}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>{t.pomodoro.start}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-2 rounded-xl glass-card text-text-secondary hover:text-text-primary transition-colors"
          title={t.pomodoro.reset}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
