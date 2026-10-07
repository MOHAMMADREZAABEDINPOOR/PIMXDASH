import React, { useEffect, useState } from 'react';
import { Cpu, MemoryStick, MonitorCog, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { readSystemSample, SystemSample } from '../../services/system-metrics';

export const ProcessMonitorWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const fa = settings.language === 'fa';
  const [sample, setSample] = useState<SystemSample | null>(null);
  useEffect(() => {
    let active = true;
    const update = () => { if (!document.hidden) void readSystemSample().then((value) => { if (active) setSample(value); }); };
    update();
    const timer = window.setInterval(update, 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const rows = [
    { icon: <Cpu size={15} />, label: fa ? 'پردازنده' : 'Processor', value: sample?.cpuPercent === null || !sample ? '—' : `${sample.cpuPercent}%`, detail: `${sample?.cores || '—'} cores` },
    { icon: <MemoryStick size={15} />, label: fa ? 'حافظه فیزیکی' : 'Physical memory', value: sample?.memoryPercent === null || !sample ? '—' : `${sample.memoryPercent}%`, detail: sample?.memoryTotalGb ? `${sample.memoryUsedGb} / ${sample.memoryTotalGb} GB` : '—' },
    { icon: <MonitorCog size={15} />, label: fa ? 'پردازنده گرافیکی' : 'Graphics adapter', value: '—', detail: sample?.gpuName || (fa ? 'در دسترس نیست' : 'Unavailable') },
  ];
  return <section className="h-full min-h-[260px] rounded-2xl border border-emerald-400/20 bg-bg-surface/85 p-4 shadow-glass">
    <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-3"><h3 className="text-xs font-mono font-bold text-emerald-300">{fa ? 'جزئیات سخت‌افزار' : 'HARDWARE / DETAIL'}</h3><RefreshCw size={13} className="text-text-muted" /></div>
    <div className="space-y-2">{rows.map((row) => <div key={row.label} className="flex gap-3 items-center rounded-xl border border-border-subtle bg-black/20 p-3 text-xs min-w-0"><span className="text-accent">{row.icon}</span><div className="min-w-0 flex-1"><div className="font-bold">{row.label}</div><div className="text-[10px] text-text-muted truncate" title={row.detail} dir="ltr">{row.detail}</div></div><strong className="font-mono text-emerald-300" dir="ltr">{row.value}</strong></div>)}</div>
    <p className="text-[10px] text-text-muted mt-3">{fa ? 'دادهٔ پردازش‌های سیستم و مصرف GPU از API اکستنشن قابل خواندن نیست.' : 'Chrome extension APIs do not expose OS process lists or GPU load.'}</p>
  </section>;
};
