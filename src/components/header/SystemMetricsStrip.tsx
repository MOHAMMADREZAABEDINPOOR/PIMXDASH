import React, { useEffect, useState } from 'react';
import { Cpu, MemoryStick, MonitorCog } from 'lucide-react';
import { readSystemSample, SystemSample } from '../../services/system-metrics';

export const SystemMetricsStrip: React.FC = () => {
  const [sample, setSample] = useState<SystemSample | null>(null);
  useEffect(() => {
    let active = true;
    const update = () => { if (!document.hidden) void readSystemSample().then((value) => { if (active) setSample(value); }); };
    update();
    const timer = window.setInterval(update, 750);
    document.addEventListener('visibilitychange', update);
    return () => { active = false; window.clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  const metric = (value: number | null | undefined) => value == null ? '—' : `${value}%`;
  return <div className="pimx-header-metrics" aria-label="Live system metrics" title={sample?.source === 'chrome.system' ? 'Live Chrome system data' : 'Available in the installed Chrome extension'}>
    <span><Cpu size={13} /><b>CPU</b><strong>{metric(sample?.cpuPercent)}</strong></span>
    <span><MemoryStick size={13} /><b>RAM</b><strong>{metric(sample?.memoryPercent)}</strong></span>
    <span title={sample?.gpuName ? `${sample.gpuName} · Chrome does not expose GPU usage` : 'Chrome does not expose GPU usage'}><MonitorCog size={13} /><b>GPU</b><strong>—</strong></span>
    <i className={sample?.source === 'chrome.system' ? 'is-live' : ''} />
  </div>;
};
