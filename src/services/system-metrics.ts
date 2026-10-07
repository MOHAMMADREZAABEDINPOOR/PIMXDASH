/** Metrics exposed by Chrome's system APIs. Unsupported fields stay null. */
export interface SystemSample {
  cpuPercent: number | null;
  memoryPercent: number | null;
  memoryUsedGb: number | null;
  memoryTotalGb: number | null;
  cores: number;
  gpuName: string | null;
  source: 'chrome.system' | 'unavailable';
}

let previous: chrome.system.cpu.CpuInfo | null = null;
let latest: SystemSample | null = null;
let latestAt = 0;
let pending: Promise<SystemSample> | null = null;
const gb = (bytes: number) => Math.round(bytes / 1073741824 * 10) / 10;

async function collectSystemSample(): Promise<SystemSample> {
  const sample: SystemSample = { cpuPercent: null, memoryPercent: null, memoryUsedGb: null, memoryTotalGb: null, cores: navigator.hardwareConcurrency || 0, gpuName: null, source: 'unavailable' };
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const extension = gl?.getExtension('WEBGL_debug_renderer_info');
    if (gl && extension) sample.gpuName = String(gl.getParameter(extension.UNMASKED_RENDERER_WEBGL));
  } catch { /* renderer information is optional */ }
  if (typeof chrome === 'undefined' || !chrome.system?.cpu || !chrome.system?.memory) return sample;
  try {
    const [cpu, memory] = await Promise.all([chrome.system.cpu.getInfo(), chrome.system.memory.getInfo()]);
    sample.source = 'chrome.system';
    sample.cores = cpu.numOfProcessors;
    sample.memoryTotalGb = gb(memory.capacity);
    sample.memoryUsedGb = gb(memory.capacity - memory.availableCapacity);
    sample.memoryPercent = Math.round((1 - memory.availableCapacity / memory.capacity) * 100);
    if (previous && previous.processors.length === cpu.processors.length) {
      let busy = 0;
      let total = 0;
      cpu.processors.forEach((processor, index) => {
        const old = previous!.processors[index].usage;
        const current = processor.usage;
        total += current.total - old.total;
        busy += current.total - old.total - (current.idle - old.idle);
      });
      if (total > 0) sample.cpuPercent = Math.max(0, Math.min(100, Math.round(busy / total * 100)));
    }
    previous = cpu;
  } catch { sample.source = 'unavailable'; }
  return sample;
}

export function readSystemSample(): Promise<SystemSample> {
  if (latest && Date.now() - latestAt < 400) return Promise.resolve(latest);
  if (pending) return pending;
  pending = collectSystemSample().then((sample) => {
    latest = sample;
    latestAt = Date.now();
    return sample;
  }).finally(() => { pending = null; });
  return pending;
}
