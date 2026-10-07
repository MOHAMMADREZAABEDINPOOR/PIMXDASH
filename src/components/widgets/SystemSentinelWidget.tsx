import React, { useEffect, useState } from 'react';
import { Activity, Cpu, MemoryStick, MonitorCog } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { readSystemSample, SystemSample } from '../../services/system-metrics';

const Meter: React.FC<{ label: string; value: number | null; detail: string; color: string; icon: React.ReactNode }> = ({ label, value, detail, color, icon }) => (
  <div className="rounded-xl border border-border-subtle bg-black/25 p-3 min-w-0">
    <div className="flex justify-between items-center text-xs font-mono"><span className="flex items-center gap-1.5 text-text-secondary">{icon}{label}</span><strong style={{ color }}>{value === null ? '—' : `${value}%`}</strong></div>
    <div className="h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden"><div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value ?? 0}%`, background: color }} /></div>
    <div className="text-[10px] text-text-muted mt-2 truncate" title={detail}>{detail}</div>
  </div>
);

export const SystemSentinelWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const fa = settings.language === 'fa';
  const [sample, setSample] = useState<SystemSample | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  useEffect(() => {
    let active = true;
    let busy = false;
    const update = async () => {
      if (busy || document.hidden) return;
      busy = true;
      const next = await readSystemSample();
      busy = false;
      if (!active) return;
      setSample(next);
      if (next.cpuPercent !== null) setHistory((old) => [...old.slice(-29), next.cpuPercent!]);
    };
    void update();
    const timer = window.setInterval(update, 500);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const cpu = sample?.cpuPercent ?? null;
  const ram = sample?.memoryPercent ?? null;
  const points = history.map((v, i) => `${i * 100 / Math.max(1, history.length - 1)},${30 - v * .28}`).join(' ');
  return <section className="h-full min-h-[270px] rounded-2xl border border-emerald-400/25 bg-bg-surface/85 p-4 font-mono shadow-glass relative overflow-hidden">
    <div className="absolute inset-0 pimx-scanlines" aria-hidden="true" />
    <div className="relative flex items-center justify-between border-b border-border-subtle pb-3 mb-3">
      <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-2"><Activity size={16} />{fa ? 'وضعیت زنده سیستم' : 'SYSTEM / LIVE'}</h3>
      <span className="text-[10px] text-text-muted">{sample?.source === 'chrome.system' ? 'CHROME SYSTEM API · 0.5s' : fa ? 'داده سیستم در دسترس نیست' : 'SYSTEM API UNAVAILABLE'}</span>
    </div>
    <div className="relative grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3 gap-2">
      <Meter label="CPU" value={cpu} detail={`${sample?.cores || '—'} ${fa ? 'هسته منطقی' : 'logical cores'}`} color="#4af3a2" icon={<Cpu size={13} />} />
      <Meter label="RAM" value={ram} detail={sample?.memoryTotalGb ? `${sample.memoryUsedGb} / ${sample.memoryTotalGb} GB` : fa ? 'در دسترس نیست' : 'Unavailable'} color="#22d3ee" icon={<MemoryStick size={13} />} />
      <Meter label="GPU" value={null} detail={sample?.gpuName || (fa ? 'نام کارت گرافیک در دسترس نیست' : 'Renderer unavailable')} color="#a78bfa" icon={<MonitorCog size={13} />} />
    </div>
    <svg className="relative w-full h-12 mt-4 rounded-lg bg-black/20" viewBox="0 0 100 30" preserveAspectRatio="none" aria-label="CPU history"><polyline points={points} fill="none" stroke="#4af3a2" strokeWidth="1.2" vectorEffect="non-scaling-stroke" /></svg>
    <p className="relative text-[10px] text-text-muted mt-2">{fa ? 'نمودار مصرف CPU · مرورگر به درصد مصرف GPU دسترسی ندارد.' : 'CPU history · Chrome does not expose GPU utilization.'}</p>
  </section>;
};
