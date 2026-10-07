import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Copy, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const groups = {
  length: { m: 1, km: 1000, cm: .01, mi: 1609.344, ft: .3048, in: .0254 },
  mass: { kg: 1, g: .001, lb: .45359237, oz: .028349523125 },
  data: { B: 1, KB: 1000, MB: 1000000, GB: 1000000000, KiB: 1024, MiB: 1048576 },
  temp: { '°C': 1, '°F': 1, K: 1 },
} as const;
type Group = keyof typeof groups;
const labels: Record<Group, { en: string; fa: string }> = {
  length: { en: 'Length', fa: 'طول' }, mass: { en: 'Mass', fa: 'جرم' },
  data: { en: 'Data', fa: 'داده' }, temp: { en: 'Temperature', fa: 'دما' },
};
const defaults: Record<Group, [string, string]> = { length: ['km', 'mi'], mass: ['kg', 'lb'], data: ['GB', 'MiB'], temp: ['°C', '°F'] };
const temperature = (value: number, from: string, to: string) => {
  const c = from === '°F' ? (value - 32) * 5 / 9 : from === 'K' ? value - 273.15 : value;
  return to === '°F' ? c * 9 / 5 + 32 : to === 'K' ? c + 273.15 : c;
};

export const UnitConverterWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const fa = settings.language === 'fa';
  const [group, setGroup] = useState<Group>('length');
  const [from, setFrom] = useState('km');
  const [to, setTo] = useState('mi');
  const [amount, setAmount] = useState('1');
  const [copied, setCopied] = useState(false);
  const units = Object.keys(groups[group]);
  const result = useMemo(() => {
    const value = Number(amount);
    if (!amount.trim() || !Number.isFinite(value)) return '—';
    const converted = group === 'temp' ? temperature(value, from, to) : value * (groups[group] as Record<string, number>)[from] / (groups[group] as Record<string, number>)[to];
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(converted);
  }, [amount, group, from, to]);
  const chooseGroup = (next: Group) => { setGroup(next); setFrom(defaults[next][0]); setTo(defaults[next][1]); };
  return <section className="h-full min-h-[290px] rounded-2xl border border-border-subtle bg-bg-surface/85 p-4 shadow-glass flex flex-col">
    <header className="flex items-center gap-2 border-b border-border-subtle pb-3 text-xs font-bold font-mono text-accent"><ArrowLeftRight size={16} />{fa ? 'تبدیل واحد' : 'UNIT / CONVERTER'}</header>
    <div className="grid grid-cols-4 gap-1 mt-3">{(Object.keys(groups) as Group[]).map((key) => <button key={key} onClick={() => chooseGroup(key)} className={`rounded-lg border px-1 py-1.5 text-[10px] ${group === key ? 'border-accent bg-accent/15 text-accent' : 'border-border-subtle text-text-muted'}`}>{labels[key][fa ? 'fa' : 'en']}</button>)}</div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 mt-5"><div><input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg bg-bg-glass border border-border-subtle p-2 text-lg font-mono outline-none focus:border-accent" dir="ltr" aria-label="Amount" /><select value={from} onChange={(event) => setFrom(event.target.value)} className="w-full mt-2 rounded-lg bg-bg-surface border border-border-subtle p-1.5 text-xs" aria-label="From unit">{units.map((unit) => <option key={unit}>{unit}</option>)}</select></div><button onClick={() => { setFrom(to); setTo(from); }} className="p-2 rounded-lg border border-border-subtle text-accent" title={fa ? 'جابه‌جایی' : 'Swap'}><ArrowLeftRight size={15} /></button><div><output className="block w-full truncate rounded-lg bg-accent/10 border border-accent/25 p-2 text-lg font-mono text-accent" dir="ltr">{result}</output><select value={to} onChange={(event) => setTo(event.target.value)} className="w-full mt-2 rounded-lg bg-bg-surface border border-border-subtle p-1.5 text-xs" aria-label="To unit">{units.map((unit) => <option key={unit}>{unit}</option>)}</select></div></div>
    <button onClick={() => { if (result !== '—') void navigator.clipboard.writeText(result).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1500); }); }} className="flex items-center justify-center gap-2 mt-auto pt-5 text-xs text-text-muted hover:text-accent">{copied ? <Check size={14} /> : <Copy size={14} />}{fa ? 'کپی نتیجه' : 'Copy result'}</button>
  </section>;
};
