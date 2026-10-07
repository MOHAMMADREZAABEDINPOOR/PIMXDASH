import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Radar, Wifi, WifiOff, Activity } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ChromeApiService } from '../../services/chrome-api';

interface Sample {
  rtt: number;
  t: number;
}

export const NetworkPulseWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const isFa = settings.language === 'fa';
  const [online, setOnline] = useState(navigator.onLine);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [busy, setBusy] = useState(false);
  const [downlink, setDownlink] = useState<number | null>(null);
  const [tabs, setTabs] = useState(1);
  const historyRef = useRef<Sample[]>([]);

  const probe = useCallback(async () => {
    if (!navigator.onLine || settings.networkEnabled === false) {
      setOnline(false);
      return;
    }
    setBusy(true);
    const start = performance.now();
    try {
      await fetch(`https://www.cloudflare.com/cdn-cgi/trace?_=${Date.now()}`, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
      const rtt = Math.round(performance.now() - start);
      setOnline(true);
      historyRef.current = [...historyRef.current, { rtt, t: Date.now() }].slice(-36);
      setSamples(historyRef.current);
    } catch {
      setOnline(false);
    } finally {
      setBusy(false);
    }
  }, [settings.networkEnabled]);

  useEffect(() => {
    const on = () => { setOnline(true); void probe(); };
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    void probe();
    const t = setInterval(probe, 4000);
    const conn = (navigator as unknown as { connection?: { downlink?: number } }).connection;
    if (conn?.downlink) setDownlink(conn.downlink);
    ChromeApiService.getOpenTabs().then((tb) => { if (tb?.length) setTabs(tb.length); });
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      clearInterval(t);
    };
  }, [probe]);

  const rtts = samples.map((s) => s.rtt);
  const avg = rtts.length ? Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length) : null;
  const max = rtts.length ? Math.max(...rtts) : null;
  const min = rtts.length ? Math.min(...rtts) : null;
  const last = rtts.length ? rtts[rtts.length - 1] : null;

  // Radial sweep angle for hacker radar
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    if (!settings.animationsEnabled) return;
    let raf = 0;
    const loop = () => {
      setAngle((a) => (a + 2) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [settings.animationsEnabled]);

  const w = 120;
  const h = 48;
  const pts = samples.length < 2
    ? `0,${h} ${w},${h}`
    : samples.map((s, i) => {
        const x = (i / Math.max(1, samples.length - 1)) * w;
        const y = h - Math.min(1, s.rtt / 400) * (h - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(' ');

  return (
    <div className="group relative flex flex-col h-full min-h-[260px] rounded-2xl border border-border-subtle hover:border-cyan-400/40 bg-bg-surface/80 backdrop-blur-xl p-4 overflow-hidden shadow-glass transition-all">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-70" />
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Radar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider font-mono pimx-hacker-label">
              {isFa ? 'رادار شبکه' : 'NET // PULSE RADAR'}
            </h3>
            <p className="text-[10px] font-mono text-text-muted flex items-center gap-1" dir="ltr">
              {online ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-rose-400" />}
              {online ? 'LINK UP' : 'LINK DOWN'} · {tabs} tabs
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void probe()}
          disabled={busy}
          className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15 disabled:opacity-50 transition-colors"
        >
          {busy ? '···' : 'PROBE'}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2">
        {/* Mini radar */}
        <div className="relative w-[74px] h-[74px] flex-none rounded-full border border-cyan-500/30 bg-black/40 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
          <div className="absolute inset-6 rounded-full border border-cyan-500/15" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-500/15" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/15" />
          <div
            className="absolute inset-0 origin-center"
            style={{
              background: 'conic-gradient(from 0deg, rgba(34,211,238,.45), transparent 70deg)',
              transform: `rotate(${angle}deg)`,
            }}
          />
          {samples.slice(-5).map((s, i, arr) => {
            const a = (i / arr.length) * Math.PI * 2 + angle * 0.02;
            const r = Math.min(28, 8 + (s.rtt / 400) * 22);
            const x = 37 + Math.cos(a) * r;
            const y = 37 + Math.sin(a) * r;
            return (
              <span
                key={s.t}
                className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
                style={{ left: x - 3, top: y - 3, opacity: 0.4 + (i / arr.length) * 0.6 }}
              />
            );
          })}
          <span className="absolute left-1/2 top-1/2 w-1 h-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        </div>

        <div className="min-w-0 flex-1 grid grid-cols-3 gap-1.5" dir="ltr">
          <div className="rounded-lg border border-white/10 bg-black/30 p-1.5 text-center">
            <div className="text-[9px] text-text-muted font-mono">LAST</div>
            <div className="text-sm font-black font-mono text-cyan-200">{last ?? '—'}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-1.5 text-center">
            <div className="text-[9px] text-text-muted font-mono">AVG</div>
            <div className="text-sm font-black font-mono text-emerald-300">{avg ?? '—'}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/30 p-1.5 text-center">
            <div className="text-[9px] text-text-muted font-mono">JIT</div>
            <div className="text-sm font-black font-mono text-amber-300">{min !== null && max !== null ? max - min : '—'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/15 bg-black/35 p-2" dir="ltr">
        <div className="flex items-center justify-between text-[9px] font-mono text-text-muted mb-1">
          <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-cyan-400" /> RTT HISTORY (ms)</span>
          <span>{samples.length}/36</span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
          <polyline points={pts} fill="none" stroke="#22d3ee" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
          <polygon points={`0,${h} ${pts} ${w},${h}`} fill="#22d3ee22" stroke="none" />
        </svg>
        <div className="text-[9px] font-mono text-text-muted mt-1 flex justify-between" dir="ltr">
          <span>downlink {downlink ?? '—'} Mb/s</span>
          <span className="text-cyan-400/80">TLS // CDN probe</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-auto border-t border-border-subtle/30 text-[10px] font-mono text-text-muted">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
          {online ? (isFa ? 'زنده' : 'SWEEP LIVE') : (isFa ? 'قطع' : 'NO LINK')}
        </span>
        <span>4s sweep</span>
      </div>
    </div>
  );
};
