import React, { useState, useEffect, useMemo } from 'react';
import { Globe2, Sun, Moon, Palette, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { storage } from '../../services/storage';

interface CityTime { name: string; nameFa: string; tz: string; }

const ALL_CITIES: CityTime[] = [
  { name: 'Tehran', nameFa: 'تهران', tz: 'Asia/Tehran' },
  { name: 'London', nameFa: 'لندن', tz: 'Europe/London' },
  { name: 'Tokyo', nameFa: 'توکیو', tz: 'Asia/Tokyo' },
  { name: 'New York', nameFa: 'نیویورک', tz: 'America/New_York' },
  { name: 'San Francisco', nameFa: 'سان فرانسیسکو', tz: 'America/Los_Angeles' },
  { name: 'Paris', nameFa: 'پاریس', tz: 'Europe/Paris' },
  { name: 'Dubai', nameFa: 'دبی', tz: 'Asia/Dubai' },
  { name: 'Berlin', nameFa: 'برلین', tz: 'Europe/Berlin' },
  { name: 'Moscow', nameFa: 'مسکو', tz: 'Europe/Moscow' },
  { name: 'Beijing', nameFa: 'پکن', tz: 'Asia/Shanghai' },
  { name: 'Seoul', nameFa: 'سئول', tz: 'Asia/Seoul' },
  { name: 'Sydney', nameFa: 'سیدنی', tz: 'Australia/Sydney' },
  { name: 'Istanbul', nameFa: 'استانبول', tz: 'Europe/Istanbul' },
  { name: 'Singapore', nameFa: 'سنگاپور', tz: 'Asia/Singapore' },
];

const STYLE_NAMES = [
  'Neon Analog', 'Classic Wall', 'Dot Analog', 'Roman Vintage', 'Pilot Chrono', 'Skeleton Dark', 'Orbit Rings', 'Pocket Gold', 'Minimal Hands', 'Gradient Glow',
  'LED Huge', 'Split Flap', '7-Segment Red', 'Terminal Green', 'Outline Stroke', 'Block Stack', 'Dot Matrix', 'Thin Modern', 'Retro LCD', 'Hex Hacker',
  'Word EN', 'Word Minimal', 'Sentence Clock', 'Persian Digital', ' condensed Mono',
  'Binary Dots', 'Binary Bars', 'Bit Columns', 'Morse Dots', 'Progress Bars',
  'Ring Progress', 'Arc Gauge', 'Vertical Bars', 'Timeline Day', 'Sun Arc',
  'Hybrid A+D', 'Midnight Countdown', 'Airport Board', 'Glass Big', 'Matrix Rain',
];

function getParts(tz: string, now: Date, hour12: boolean) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: hour12 ? 'h12' : 'h23' });
    const parts = fmt.formatToParts(now);
    const g = (t: string) => parts.find((p) => p.type === t)?.value || '00';
    return { h: g('hour'), m: g('minute'), s: g('second'), ap: parts.find((p) => p.type === 'dayPeriod')?.value || '' };
  } catch {
    return { h: '00', m: '00', s: '00', ap: '' };
  }
}
function getNum(tz: string, now: Date) {
  const p = getParts(tz, now, false);
  return { h: parseInt(p.h, 10) || 0, m: parseInt(p.m, 10) || 0, s: parseInt(p.s, 10) || 0 };
}

const AnalogFace: React.FC<{ h: number; m: number; s: number; variant: number }> = ({ h, m, s, variant }) => {
  const ha = ((h % 12) + m / 60) * 30;
  const ma = (m + s / 60) * 6;
  const sa = s * 6;
  const nums = variant === 3
    ? ['XII', 'III', 'VI', 'IX']
    : variant === 1 ? ['12', '3', '6', '9'] : [];
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28">
      <circle cx="50" cy="50" r="46" fill={variant === 5 ? '#0a0f0d' : 'rgba(0,0,0,.45)'} stroke={variant === 7 ? '#4af3a2' : variant === 1 ? '#e8c87a' : 'rgba(255,255,255,.18)'} strokeWidth={variant === 1 ? 4 : 1.5} />
      {variant === 1 && <circle cx="50" cy="50" r="40" fill="none" stroke="#e8c87a" strokeWidth="0.6" strokeDasharray="2 2" />}
      {Array.from({ length: variant === 2 ? 12 : 60 }, (_, i) => {
        const a = (i * (variant === 2 ? 30 : 6) * Math.PI) / 180;
        const big = variant === 2 || i % 5 === 0;
        const r1 = big ? 38 : 41;
        const r2 = 43;
        return <line key={i} x1={50 + r1 * Math.sin(a)} y1={50 - r1 * Math.cos(a)} x2={50 + r2 * Math.sin(a)} y2={50 - r2 * Math.cos(a)} stroke={big ? '#4af3a2' : 'rgba(255,255,255,.25)'} strokeWidth={big ? 2 : 0.8} />;
      })}
      {nums.map((n, i) => {
        const pos = [[50, 14], [86, 52], [50, 88], [14, 52]][i];
        return <text key={n} x={pos[0]} y={pos[1]} textAnchor="middle" dominantBaseline="middle" fontSize={variant === 3 ? 9 : 10} fill={variant === 1 ? '#f5d78e' : '#e9fff3'} fontFamily="serif">{n}</text>;
      })}
      <line x1="50" y1="50" x2={50 + 24 * Math.sin((ha * Math.PI) / 180)} y2={50 - 24 * Math.cos((ha * Math.PI) / 180)} stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="50" y1="50" x2={50 + 34 * Math.sin((ma * Math.PI) / 180)} y2={50 - 34 * Math.cos((ma * Math.PI) / 180)} stroke="#4af3a2" strokeWidth="2.2" strokeLinecap="round" />
      {variant !== 8 && <line x1="50" y1="56" x2={50 + 36 * Math.sin((sa * Math.PI) / 180)} y2={50 - 36 * Math.cos((sa * Math.PI) / 180)} stroke="#fb7185" strokeWidth="1" strokeLinecap="round" />}
      <circle cx="50" cy="50" r="3" fill="#4af3a2" />
      {variant === 6 && <circle cx="50" cy="50" r="30" fill="none" stroke="#22d3ee55" strokeWidth="6" strokeDasharray={`${(m / 60) * 188} 188`} transform="rotate(-90 50 50)" />}
    </svg>
  );
};

const BigClock: React.FC<{ styleId: number; tz: string; now: Date; hour12: boolean; cityName: string }> = ({ styleId, tz, now, hour12, cityName }) => {
  const p = getParts(tz, now, hour12);
  const n = getNum(tz, now);
  const pad = (v: number) => String(v).padStart(2, '0');
  const mono = { fontFamily: 'ui-monospace, Cascadia Code, Consolas, monospace' } as React.CSSProperties;

  // --- ANALOG 0-9 ---
  if (styleId <= 9) {
    return (
      <div className="flex flex-col items-center gap-1 py-1">
        <AnalogFace h={n.h} m={n.m} s={n.s} variant={styleId} />
        <div className="text-[11px] font-mono text-text-secondary" dir="ltr">{p.h}:{p.m}:{p.s} {p.ap}</div>
        <div className="text-xs font-bold">{cityName}</div>
      </div>
    );
  }
  // --- DIGITAL VARIANTS 10-19 ---
  if (styleId === 10) return <div className="text-center py-3"><div className="font-black tracking-tighter" dir="ltr" style={{ fontSize: 44, color: '#eafff1', textShadow: '0 0 30px rgba(74,243,162,.4)', ...mono }}>{p.h}:{p.m}<span className="text-emerald-400">:{p.s}</span></div><div className="text-xs font-bold mt-1">{cityName} · LED</div></div>;
  if (styleId === 11) return <div className="flex flex-col items-center py-3" dir="ltr"><div className="flex items-center justify-center gap-1">{[p.h, p.m, p.s].map((v, i) => <React.Fragment key={i}>{i > 0 && <span className="font-black text-xl">:</span>}<div className="px-2 py-3 rounded-lg bg-black border border-white/15 font-mono font-black text-2xl" style={{ boxShadow: 'inset 0 -12px 0 rgba(255,255,255,.06)' }}>{v}</div></React.Fragment>)}</div><div className="text-center text-[11px] mt-2">{cityName}</div></div>;
  if (styleId === 12) return <div className="text-center py-4 bg-black rounded-xl border border-red-500/30 my-2"><div className="font-mono font-black text-4xl text-red-500" dir="ltr" style={{ textShadow: '0 0 18px #ef4444' }}>{p.h}:{p.m}:{p.s}</div><div className="text-[10px] font-mono text-red-400/70 mt-1">7-SEG · {cityName}</div></div>;
  if (styleId === 13) return <div className="py-3 font-mono text-sm bg-black rounded-xl p-3 border border-emerald-500/30" dir="ltr"><div className="text-emerald-400">$ time --zone {tz}</div><div className="text-3xl font-black text-emerald-300 mt-1">{p.h}:{p.m}:{p.s}</div><div className="text-emerald-600 text-[11px]">▊ {cityName}</div></div>;
  if (styleId === 14) return <div className="text-center py-4"><div className="font-black text-5xl" dir="ltr" style={{ WebkitTextStroke: '1.5px #4af3a2', color: 'transparent' }}>{p.h}:{p.m}</div><div className="font-mono text-xs mt-1">:{p.s} · {cityName}</div></div>;
  if (styleId === 15) return <div className="grid grid-cols-3 gap-1.5 py-3" dir="ltr">{[{ l: 'H', v: p.h, c: '#4af3a2' }, { l: 'M', v: p.m, c: '#22d3ee' }, { l: 'S', v: p.s, c: '#a78bfa' }].map((b) => <div key={b.l} className="rounded-xl p-2 text-center border" style={{ borderColor: `${b.c}44`, background: `${b.c}11` }}><div className="text-[10px] font-mono opacity-70">{b.l}</div><div className="font-black text-2xl font-mono" style={{ color: b.c }}>{b.v}</div></div>)}<div className="col-span-3 text-center text-[11px] font-bold">{cityName}</div></div>;
  if (styleId === 16) return <div className="py-3 text-center"><div className="font-mono font-black tracking-[.2em] text-2xl" dir="ltr" style={{ color: '#4af3a2', textShadow: '0 0 12px rgba(74,243,162,.6)' }}>{[...`${p.h}:${p.m}:${p.s}`].map((ch, i) => <span key={i} className={ch === ':' ? 'opacity-40' : 'bg-emerald-500/10 px-0.5 rounded'}>{ch}</span>)}</div><div className="text-[11px] mt-1">DOT MATRIX · {cityName}</div></div>;
  if (styleId === 17) return <div className="text-center py-4"><div className="font-extralight text-5xl tracking-tight" dir="ltr">{p.h}<span className="animate-pulse">:</span>{p.m}</div><div className="font-mono text-xs text-text-muted" dir="ltr">{p.s}s · {cityName}</div></div>;
  if (styleId === 18) return <div className="mx-2 my-3 rounded-lg bg-[#9fb89f] text-black p-3 font-mono border-4 border-[#2a332a]" dir="ltr"><div className="text-[10px]">CASIO · {cityName}</div><div className="text-3xl font-black tracking-widest">{p.h}:{p.m}:{p.s}</div></div>;
  if (styleId === 19) {
    const hex = Math.floor(now.getTime() / 1000).toString(16).toUpperCase().padStart(8, '0');
    return <div className="text-center py-4 font-mono" dir="ltr"><div className="text-[10px] text-text-muted">UNIX HEX</div><div className="text-2xl font-black text-cyan-300">0x{hex}</div><div className="text-sm mt-1">{p.h}:{p.m}:{p.s} · {cityName}</div></div>;
  }
  // --- WORD 20-24 ---
  if (styleId === 20 || styleId === 21 || styleId === 22) {
    const words = ['TWELVE', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN'];
    const hh = words[n.h % 12];
    const mm = n.m === 0 ? "O'CLOCK" : n.m < 10 ? `O-${words[n.m % 12] || n.m}` : `${pad(n.m)} MIN`;
    if (styleId === 20) return <div className="text-center py-4 px-2"><div className="font-black text-xl leading-7 tracking-wide">IT IS<br /><span className="text-emerald-300">{hh}</span><br />{mm}</div><div className="text-[11px] font-mono mt-2 text-text-muted">{cityName} · {p.h}:{p.m}</div></div>;
    if (styleId === 21) return <div className="p-4 text-start"><div className="text-[10px] uppercase tracking-[.3em] text-text-muted">{cityName}</div><div className="text-2xl font-light leading-tight mt-2">{hh.toLowerCase()} <span className="text-accent">{mm.toLowerCase()}</span></div><div className="h-px bg-accent/40 mt-3" /><div className="text-[10px] mt-2 font-mono" dir="ltr">{p.h}:{p.m}:{p.s}</div></div>;
    return <div className="p-3 my-2 rounded-lg border border-amber-400/25 bg-amber-400/5 font-serif text-center"><div className="text-[10px] text-amber-300 uppercase tracking-widest">A moment in {cityName}</div><div className="text-xl italic mt-2">The hour is <strong>{hh.toLowerCase()}</strong>.</div><div className="text-sm italic text-text-secondary">{mm.toLowerCase()} past the hour.</div><div className="text-[10px] font-mono mt-2" dir="ltr">{p.h}:{p.m}:{p.s}</div></div>;
  }
  if (styleId === 23) return <div className="text-center py-4"><div className="text-3xl font-black font-mono" dir="ltr">{p.h}:{p.m}:{p.s}</div><div className="text-[11px] mt-1 opacity-70">{cityName} · FA DIGITAL</div><div className="mt-1 text-xs">{n.h >= 6 && n.h < 18 ? '☀️ روز' : '🌙 شب'}</div></div>;
  if (styleId === 24) return <div className="py-4 font-mono text-center" dir="ltr"><div className="text-4xl font-black tracking-tighter">{p.h}<span className="text-text-muted font-light">/</span>{p.m}<span className="text-text-muted font-light">/</span>{p.s}</div><div className="text-[10px] mt-1 tracking-[.3em]">{cityName.toUpperCase()}</div></div>;
  // --- BINARY 25-29 ---
  if (styleId === 25 || styleId === 26 || styleId === 27) {
    const bits = (v: number) => pad(v).split('').map((d) => parseInt(d, 10).toString(2).padStart(4, '0')).join('');
    const str = bits(n.h) + bits(n.m) + bits(n.s);
    if (styleId === 25) return <div className="py-3"><div className="flex flex-wrap gap-1 justify-center" dir="ltr">{[...str].map((b, i) => <span key={i} className="w-3 h-3 rounded-full" style={{ background: b === '1' ? '#4af3a2' : 'rgba(255,255,255,.1)', boxShadow: b === '1' ? '0 0 8px #4af3a2' : undefined }} />)}</div><div className="text-center font-mono text-xs mt-2" dir="ltr">{p.h}:{p.m}:{p.s} · {cityName}</div></div>;
    if (styleId === 26) return <div className="py-3 flex flex-col items-center gap-2" dir="ltr"><div className="flex gap-3">{[n.h, n.m, n.s].map((value, i) => <div key={i} className="flex items-end gap-0.5 h-14">{[5,4,3,2,1,0].map((bit) => <span key={bit} className="w-1.5 rounded-sm" style={{ height: `${((value >> bit) & 1) ? 48 : 8}px`, background: ['#4af3a2','#22d3ee','#a78bfa'][i] }} />)}</div>)}</div><div className="font-mono text-xs">{p.h}:{p.m}:{p.s} · {cityName}</div></div>;
    return <div className="p-3 my-2 bg-black/40 rounded-xl font-mono" dir="ltr"><div className="grid grid-cols-3 gap-2 text-center">{[n.h, n.m, n.s].map((value, i) => <div key={i}><div className="text-[9px] text-text-muted">{['HOUR','MIN','SEC'][i]}</div><div className="text-xs text-accent tracking-[.25em]">{value.toString(2).padStart(6, '0')}</div></div>)}</div><div className="text-center text-[10px] mt-3">{cityName} · {p.h}:{p.m}:{p.s}</div></div>;
  }
  if (styleId === 28) return <div className="py-3 space-y-2 text-center font-mono" dir="ltr">{[n.h, n.m, n.s].map((value, i) => <div key={i} className="flex items-center justify-center gap-1"><span className="w-5 text-[10px] text-text-muted">{['H','M','S'][i]}</span>{[...value.toString(2).padStart(6, '0')].map((bit, j) => <span key={j} className={bit === '1' ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-3 h-0.5 bg-emerald-400/30'} />)}</div>)}<div className="text-xs">{p.h}:{p.m}:{p.s} · {cityName}</div></div>;
  if (styleId === 29) return <div className="py-4 space-y-2" dir="ltr">{[{ l: 'HOUR', v: n.h / 24 }, { l: 'MIN', v: n.m / 60 }, { l: 'SEC', v: n.s / 60 }].map((r) => <div key={r.l} className="flex items-center gap-2"><span className="text-[9px] font-mono w-8">{r.l}</span><div className="flex-1 h-2.5 rounded bg-white/10 overflow-hidden"><div className="h-full rounded" style={{ width: `${r.v * 100}%`, background: '#4af3a2', boxShadow: '0 0 10px #4af3a2' }} /></div></div>)}<div className="text-center font-mono text-sm">{p.h}:{p.m}:{p.s}</div></div>;
  // --- GAUGES 30-34 ---
  if (styleId === 30) {
    const R = 40;
    const C = 2 * Math.PI * R;
    return <div className="flex items-center justify-center gap-2 py-2"><svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90"><circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" /><circle cx="50" cy="50" r={R} fill="none" stroke="#4af3a2" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(n.s / 60) * C} ${C}`} /><circle cx="50" cy="50" r={R - 14} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" /><circle cx="50" cy="50" r={R - 14} fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(n.m / 60) * (C - 88)} ${C}`} /></svg><div className="font-mono font-black text-xl" dir="ltr">{p.h}:{p.m}<br /><span className="text-emerald-400">:{p.s}</span><div className="text-[10px] font-sans font-bold">{cityName}</div></div></div>;
  }
  if (styleId === 31) return <div className="py-4 text-center"><svg viewBox="0 0 120 60" className="w-full h-16"><path d="M10 50 A50 50 0 0 1 110 50" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="5" strokeLinecap="round" /><path d="M10 50 A50 50 0 0 1 110 50" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${(n.h / 24) * 157} 157`} /></svg><div className="font-mono font-black text-2xl -mt-4" dir="ltr">{p.h}:{p.m}</div><div className="text-[11px]">{cityName}</div></div>;
  if (styleId === 32) return <div className="relative flex items-end justify-center gap-1.5 pt-3 pb-6 h-32" dir="ltr">{[n.h, n.m, n.s].map((v, i) => <div key={i} className="w-10 rounded-t-lg border border-white/10 bg-white/5 relative overflow-hidden" style={{ height: 90 }}><div className="absolute bottom-0 inset-x-0 rounded-t-lg" style={{ height: `${(v / (i === 0 ? 24 : 60)) * 100}%`, background: ['#4af3a2', '#22d3ee', '#a78bfa'][i] }} /><span className="absolute top-1 inset-x-0 text-center font-mono font-black text-sm">{pad(v)}</span></div>)}<div className="w-full text-center text-[11px] absolute bottom-1">{cityName}</div></div>;
  if (styleId === 33) {
    const dayPct = ((n.h * 60 + n.m) / 1440) * 100;
    return <div className="py-4" dir="ltr"><div className="flex justify-between text-[10px] font-mono"><span>00:00</span><span>{cityName}</span><span>24:00</span></div><div className="h-3 rounded-full bg-white/10 relative mt-1"><div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400" style={{ width: `${dayPct}%` }} /><div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow" style={{ left: `calc(${dayPct}% - 6px)` }} /></div><div className="text-center font-mono font-black text-xl mt-2">{p.h}:{p.m}:{p.s}</div></div>;
  }
  if (styleId === 34) {
    const isDay = n.h >= 6 && n.h < 18;
    return <div className="text-center py-3"><div className="text-2xl">{isDay ? '☀️' : '🌙'}</div><div className="font-mono font-black text-3xl" dir="ltr">{p.h}:{p.m}</div><div className="text-[11px]">{cityName} · {isDay ? 'DAY' : 'NIGHT'} · {p.s}s</div></div>;
  }
  // --- SPECIAL 35-39 ---
  if (styleId === 35) return <div className="flex items-center gap-3 py-3"><AnalogFace h={n.h} m={n.m} s={n.s} variant={0} /><div className="font-mono font-black text-2xl" dir="ltr">{p.h}:{p.m}<div className="text-sm text-emerald-400">:{p.s} {p.ap}</div><div className="text-[11px] font-sans">{cityName}</div></div></div>;
  if (styleId === 36) {
    const toMid = (23 - n.h) * 3600 + (59 - n.m) * 60 + (60 - n.s);
    const hh = Math.floor(toMid / 3600);
    const mm = Math.floor((toMid % 3600) / 60);
    return <div className="text-center py-3 font-mono" dir="ltr"><div className="text-3xl font-black">{p.h}:{p.m}:{p.s}</div><div className="text-[11px] text-amber-300 mt-1">−{pad(hh)}:{pad(mm)} to midnight</div><div className="text-[11px] font-sans font-bold mt-1">{cityName}</div></div>;
  }
  if (styleId === 37) return <div className="bg-black rounded-xl border border-amber-400/30 p-3 my-2 font-mono" dir="ltr"><div className="text-[10px] text-amber-400 tracking-[.25em]">✈ DEPARTURES · {cityName.toUpperCase()}</div><div className="text-3xl font-black tracking-[.15em] text-amber-200 mt-1">{p.h} {p.m} {p.s}</div><div className="flex gap-1 mt-2">{[...p.h + p.m].map((c, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-200 text-xs font-black">{c}</span>)}</div></div>;
  if (styleId === 38) return <div className="rounded-2xl border border-white/10 p-4 text-center backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,.1), transparent)' }}><div className="text-[10px] font-mono tracking-[.2em] opacity-60">GLASS · {cityName.toUpperCase()}</div><div className="font-black text-4xl mt-1" dir="ltr">{p.h}:{p.m}<span className="text-lg opacity-60">:{p.s}</span></div></div>;
  return <div className="rounded-xl bg-black border border-emerald-500/30 p-3 my-2 font-mono overflow-hidden relative" dir="ltr"><div className="absolute inset-0 opacity-20 text-[9px] leading-3 text-emerald-500 overflow-hidden select-none">{'01'.repeat(80)}</div><div className="relative text-center"><div className="text-3xl font-black text-emerald-300" style={{ textShadow: '0 0 14px #4af3a2' }}>{p.h}:{p.m}:{p.s}</div><div className="text-[10px] text-emerald-500">{cityName} // MATRIX</div></div></div>;
};

export const WorldClockWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const [now, setNow] = useState(new Date());
  const [styleId, setStyleId] = useState(0);
  const [cities, setCities] = useState<string[]>(['Asia/Tehran', 'Europe/London', 'Asia/Tokyo']);
  const [showPicker, setShowPicker] = useState(false);
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';

  useEffect(() => {
    storage.get<number>('worldclock_style_v2', 10).then((v) => setStyleId(typeof v === 'number' ? v % 40 : 10));
    storage.get<string[]>('worldclock_cities', []).then((v) => {
      if (Array.isArray(v) && v.length) setCities(v.slice(0, 6));
    });
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const setStyle = (id: number) => {
    const nid = ((id % 40) + 40) % 40;
    setStyleId(nid);
    void storage.set('worldclock_style_v2', nid);
  };

  const toggleCity = (tz: string) => {
    setCities((prev) => {
      const next = prev.includes(tz) ? prev.filter((c) => c !== tz) : [...prev, tz].slice(0, 6);
      void storage.set('worldclock_cities', next);
      return next;
    });
  };

  const visibleCities = useMemo(() => ALL_CITIES.filter((c) => cities.includes(c.tz)), [cities]);
  const primary = visibleCities[0] || ALL_CITIES[0];
  const rest = visibleCities.slice(1);

  return (
    <div className="flex flex-col h-full p-3 rounded-2xl glass-panel border border-border-subtle select-none min-h-[300px] relative overflow-hidden">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-border-subtle">
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe2 className="w-4 h-4 text-accent shrink-0" />
          <h2 className="text-[11px] font-bold tracking-wide uppercase truncate">{t.widgets.worldclock}</h2>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md border border-accent/30 text-accent shrink-0" dir="ltr">{styleId + 1}/40</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setStyle(styleId - 1)} className="p-1 rounded-md text-text-muted hover:text-text-primary"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button onClick={() => setShowPicker(!showPicker)} className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${showPicker ? 'bg-accent text-white border-accent' : 'text-accent border-accent/30 hover:bg-accent/10'}`}><Palette className="w-3 h-3" /> 40</button>
          <button onClick={() => setStyle(styleId + 1)} className="p-1 rounded-md text-text-muted hover:text-text-primary"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="text-[10px] font-mono text-accent/80 truncate mb-1" dir="ltr">{STYLE_NAMES[styleId]} · {(primary.tz).split('/')[1]}</div>

      <div className="rounded-xl border border-white/10 bg-black/20 min-h-[150px]">
        <BigClock styleId={styleId} tz={primary.tz} now={now} hour12={settings.clockFormat !== '24h'} cityName={isFa ? primary.nameFa : primary.name} />
      </div>

      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mt-1.5">
          {rest.map((c) => {
            const p = getParts(c.tz, now, settings.clockFormat !== '24h');
            let hh = 12;
            try { hh = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: c.tz, hour: 'numeric', hour12: false }).format(now), 10); } catch { /* noop */ }
            const isDay = hh >= 6 && hh < 18;
            return (
              <div key={c.tz} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[.03] border border-white/10">
                <span className="text-[11px] font-bold truncate flex items-center gap-1">{isDay ? <Sun className="w-3 h-3 text-amber-400 shrink-0" /> : <Moon className="w-3 h-3 text-indigo-400 shrink-0" />}{isFa ? c.nameFa : c.name}</span>
                <span className="text-[11px] font-mono font-bold" dir="ltr">{p.h}:{p.m}</span>
              </div>
            );
          })}
        </div>
      )}

      {showPicker && (
        <div className="mt-2 p-2 rounded-xl border border-accent/25 bg-black/50 max-h-52 overflow-y-auto pimx-scrollbar">
          <div className="text-[10px] font-mono text-accent mb-1.5">40 REAL DESIGNS — tap to preview:</div>
          <div className="grid grid-cols-2 gap-1">
            {STYLE_NAMES.map((n, i) => (
              <button key={i} onClick={() => setStyle(i)} className={`text-start text-[10px] px-2 py-1.5 rounded-lg border truncate ${i === styleId ? 'border-accent text-accent font-black bg-accent/10' : 'border-white/10 opacity-70 hover:opacity-100'}`}>
                {i + 1}. {n}
              </button>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="text-[10px] font-mono text-text-muted mb-1">CITIES (max 6):</div>
            <div className="flex flex-wrap gap-1">
              {ALL_CITIES.map((c) => (
                <button key={c.tz} onClick={() => toggleCity(c.tz)} className={`text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1 ${cities.includes(c.tz) ? 'border-accent text-accent font-bold' : 'opacity-50 border-white/10'}`}>
                  {cities.includes(c.tz) ? <X className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}{isFa ? c.nameFa : c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
