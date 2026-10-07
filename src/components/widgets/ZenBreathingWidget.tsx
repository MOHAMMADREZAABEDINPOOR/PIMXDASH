import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, RotateCcw, Settings2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { storage } from '../../services/storage';

type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

const PATTERNS = [
  { id: 'box-4', name: 'Box 4-4-4-4', nameFa: 'جعبه‌ای ۴-۴-۴-۴', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: 'relax-478', name: 'Relax 4-7-8', nameFa: 'آرامش ۴-۷-۸', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: 'energy-446', name: 'Energy 4-4-6', nameFa: 'انرژی ۴-۴-۶', inhale: 4, hold1: 4, exhale: 6, hold2: 0 },
  { id: 'calm-555', name: 'Calm 5-5-5', nameFa: 'آرام ۵-۵-۵', inhale: 5, hold1: 5, exhale: 5, hold2: 0 },
  { id: 'deep-6666', name: 'Deep 6-6-6-6', nameFa: 'عمیق ۶-۶-۶-۶', inhale: 6, hold1: 6, exhale: 6, hold2: 6 },
];

export const ZenBreathingWidget: React.FC = () => {
  const { settings } = useWorkspace();
  // IMPORTANT: never auto-start — user must press Start explicitly
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [patternId, setPatternId] = useState('box-4');
  const [cycles, setCycles] = useState(0);
  const [targetCycles, setTargetCycles] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';
  const phaseRef = useRef<BreathPhase>('inhale');

  const pattern = PATTERNS.find((p) => p.id === patternId) || PATTERNS[0];

  useEffect(() => {
    storage.get<string>('zen_pattern', 'box-4').then((v) => {
      if (typeof v === 'string' && PATTERNS.some((p) => p.id === v)) {
        setPatternId(v);
        const p = PATTERNS.find((pp) => pp.id === v)!;
        setSecondsRemaining(p.inhale);
      }
    });
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (cycles >= targetCycles && isActive) setIsActive(false);
  }, [cycles, targetCycles, isActive]);

  useEffect(() => {
    if (!isActive) return;
    const durations: Record<BreathPhase, number> = {
      inhale: pattern.inhale,
      hold1: pattern.hold1,
      exhale: pattern.exhale,
      hold2: pattern.hold2,
    };
    // skip zero-length phases
    let cur: BreathPhase = phaseRef.current;
    while (durations[cur] === 0) {
      cur = cur === 'inhale' ? 'hold1' : cur === 'hold1' ? 'exhale' : cur === 'exhale' ? 'hold2' : 'inhale';
    }
    if (cur !== phaseRef.current) setPhase(cur);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          const order: BreathPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
          let idx = order.indexOf(phaseRef.current);
          for (let k = 0; k < 4; k++) {
            idx = (idx + 1) % 4;
            const nxt = order[idx];
            if (durations[nxt] > 0) {
              setPhase(nxt);
              if (nxt === 'inhale') setCycles((c) => c + 1);
              return durations[nxt];
            }
          }
          return durations.inhale;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, pattern]);

  const start = () => {
    setCycles(0);
    setPhase('inhale');
    setSecondsRemaining(pattern.inhale);
    setIsActive(true);
  };
  const resume = () => setIsActive(true);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return isFa ? 'دم عمیق…' : t.zen.inhale;
      case 'hold1': return isFa ? 'حبس نفس…' : t.zen.hold;
      case 'exhale': return isFa ? 'بازدم آرام…' : t.zen.exhale;
      case 'hold2': return isFa ? 'استراحت…' : t.zen.rest;
    }
  };

  const pickPattern = (id: string) => {
    setPatternId(id);
    void storage.set('zen_pattern', id);
    const p = PATTERNS.find((pp) => pp.id === id)!;
    setPhase('inhale');
    setSecondsRemaining(p.inhale);
  };

  const isExpanding = phase === 'inhale' || phase === 'hold1';
  const progress = (() => {
    const total = phase === 'inhale' ? pattern.inhale : phase === 'hold1' ? pattern.hold1 : phase === 'exhale' ? pattern.exhale : pattern.hold2;
    if (!total) return 0;
    return ((total - secondsRemaining) / total) * 100;
  })();

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none items-center text-center min-h-[300px] relative overflow-hidden">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">
            {t.widgets.zen}
          </h2>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-accent/30 text-accent">{pattern.name} · {cycles} cycles</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setShowSettings(!showSettings)} className="p-1 rounded-md text-text-muted hover:text-text-primary" title="Breathing patterns">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          {isActive ? (
            <button type="button" onClick={() => setIsActive(false)} className="p-1 rounded-md text-amber-300 hover:text-amber-200" title="Pause">
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={cycles > 0 ? resume : start} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:brightness-110" title="Start session">
              <Play className="w-3.5 h-3.5" /> {cycles > 0 ? (isFa ? 'ادامه' : 'Resume') : (isFa ? 'شروع' : 'Start')}
            </button>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="w-full mb-2 p-2 rounded-xl border border-border-subtle bg-black/30 grid grid-cols-1 gap-1 max-h-32 overflow-y-auto pimx-scrollbar">
          <label className="flex items-center justify-between text-[11px] text-text-secondary px-2">{isFa ? 'تعداد چرخه تا پایان خودکار' : 'Cycles until automatic stop'}<select value={targetCycles} onChange={(e) => setTargetCycles(Number(e.target.value))} className="bg-bg-surface border border-border-subtle rounded px-2 py-1" dir="ltr">{[3,5,8,10,15,20].map((count) => <option key={count} value={count}>{count}</option>)}</select></label>
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => pickPattern(p.id)}
              className={`text-start text-[11px] px-2 py-1.5 rounded-lg border ${p.id === patternId ? 'border-accent text-accent font-bold bg-accent/10' : 'border-transparent text-text-secondary hover:bg-bg-hover'}`}
            >
              {isFa ? p.nameFa : p.name}
              <span className="ms-2 font-mono text-[10px] opacity-70" dir="ltr">{p.inhale}-{p.hold1}-{p.exhale}-{p.hold2}</span>
            </button>
          ))}
        </div>
      )}

      {!isActive && cycles === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-20 h-20 rounded-full border border-accent/20 bg-accent/5 grid place-items-center">
            <Sparkles className="w-6 h-6 text-accent/60" />
          </div>
          <p className="text-xs text-text-secondary max-w-[220px] leading-5">
            {isFa ? 'برای شروع تمرین تنفس، دکمه شروع را بزن. خودکار فعال نمی‌شود تا حواست پرت نشود.' : 'Press Start to begin. It never auto-plays so it won’t distract you.'}
          </p>
          <button onClick={start} className="mt-1 px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:brightness-110">
            <Play className="w-3.5 h-3.5" /> {isFa ? 'شروع تمرین' : 'Begin session'}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center my-2 w-full">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out ${isExpanding ? 'scale-110 opacity-60' : 'scale-75 opacity-20'}`}
              style={{ background: `radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)`, filter: 'blur(16px)' }}
            />
            <div
              className={`w-20 h-20 rounded-full border border-accent/40 bg-accent/15 backdrop-blur-md flex flex-col items-center justify-center transition-all duration-1000 ease-in-out shadow-glow ${isExpanding ? 'scale-105' : 'scale-90'}`}
            >
              <span className="text-lg font-bold font-mono">{isActive ? secondsRemaining : '❚❚'}</span>
              <span className="text-[10px] text-text-muted font-medium">sec</span>
            </div>
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent-color)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress * 2.89} 289`} className="transition-all duration-1000" />
            </svg>
          </div>
          <span className="mt-3 text-xs font-semibold animate-in fade-in duration-300">
            {isActive ? getPhaseText() : (isFa ? 'متوقف شده — برای ادامه شروع را بزن' : 'Paused — press Start to resume')}
          </span>
          <span className="text-[10px] text-text-muted mt-0.5">{isFa ? pattern.nameFa : pattern.name} · {cycles} {isFa ? 'چرخه' : 'cycles'}</span>
          <button onClick={() => { setIsActive(false); setCycles(0); setPhase('inhale'); setSecondsRemaining(pattern.inhale); }} className="mt-2 flex items-center gap-1 text-[10px] text-text-muted hover:text-text-primary">
            <RotateCcw className="w-3 h-3" /> {isFa ? 'ریست' : 'Reset'}
          </button>
        </div>
      )}
    </div>
  );
};
