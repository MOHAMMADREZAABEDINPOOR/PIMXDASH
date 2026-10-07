import React, { useState } from 'react';
import { CloudSun, Droplets, Wind, MapPin, Search, RotateCw, Thermometer } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';
import { WeatherService } from '../../services/weather';
import { WeatherLocation } from '../../types';

export const WeatherWidget: React.FC = () => {
  const { weather, settings, updateSettings, refreshWeather } = useWorkspace();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [busy, setBusy] = useState(false);
  const isFa = settings.language === 'fa';

  const search = async (v: string) => {
    setQ(v);
    if (v.trim().length < 2) { setResults([]); return; }
    try {
      setResults(await WeatherService.searchCities(v.trim()));
    } catch { setResults([]); }
  };

  const pick = async (c: WeatherLocation) => {
    setBusy(true);
    try {
      await updateSettings({ weatherLocation: c });
      await refreshWeather(true, c);
      setQ(''); setResults([]);
    } finally { setBusy(false); }
  };

  if (!weather) return <div className="p-4 rounded-2xl glass-panel border border-border-subtle text-xs">…</div>;

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none relative overflow-hidden min-h-[280px]">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-60" />
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-sky-300" />
          <h2 className="text-[11px] font-bold uppercase">{isFa ? 'آب‌وهوا' : 'Weather'}</h2>
        </div>
        <button onClick={() => void refreshWeather(true).finally(() => {})} className="p-1 rounded-md text-text-muted hover:text-text-primary"><RotateCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} /></button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-4xl font-black tracking-tighter" dir="ltr">{formatBilingualNumber(weather.temp, settings.language)}°</div>
        <div className="min-w-0">
          <div className="text-xs font-bold flex items-center gap-1 truncate"><MapPin className="w-3 h-3 text-sky-300 shrink-0" />{weather.city}</div>
          <div className="text-[11px] text-text-muted">{isFa ? WeatherService.getConditionDescriptionFa(weather.conditionCode) : weather.condition}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        <div className="rounded-xl bg-white/[.04] border border-white/10 p-2 text-center"><Droplets className="w-3.5 h-3.5 mx-auto text-sky-300" /><div className="text-sm font-black font-mono mt-1" dir="ltr">{weather.humidity}%</div><div className="text-[9px] text-text-muted">{isFa ? 'رطوبت' : 'HUM'}</div></div>
        <div className="rounded-xl bg-white/[.04] border border-white/10 p-2 text-center"><Wind className="w-3.5 h-3.5 mx-auto text-emerald-300" /><div className="text-sm font-black font-mono mt-1" dir="ltr">{weather.windSpeed}</div><div className="text-[9px] text-text-muted">{isFa ? 'باد' : 'WIND'}</div></div>
        <div className="rounded-xl bg-white/[.04] border border-white/10 p-2 text-center"><Thermometer className="w-3.5 h-3.5 mx-auto text-amber-300" /><div className="text-sm font-black font-mono mt-1" dir="ltr">{formatBilingualNumber(weather.feelsLike, settings.language)}°</div><div className="text-[9px] text-text-muted">{isFa ? 'حسی' : 'FEELS'}</div></div>
      </div>
      {!!weather.forecast?.length && (
        <div className="grid grid-cols-3 gap-1.5 mt-1.5">
          {weather.forecast.map((d, i) => (
            <div key={i} className="rounded-xl bg-white/[.03] border border-white/10 p-2 text-center">
              <div className="text-[10px] font-bold">{d.day}</div>
              <div className="text-[11px] font-mono font-black mt-0.5" dir="ltr">{d.tempMax}°/{d.tempMin}°</div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-auto pt-2">
        <div className="relative">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input value={q} onChange={(e) => void search(e.target.value)} placeholder={isFa ? 'جستجوی شهر…' : 'Search city…'} className="w-full ps-8 pe-2 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs focus:outline-none focus:border-sky-400" />
        </div>
        {results.length > 0 && (
          <div className="mt-1 max-h-24 overflow-y-auto pimx-scrollbar rounded-xl border border-white/10 bg-black/60">
            {results.map((c) => (
              <button key={`${c.latitude}_${c.longitude}`} onClick={() => void pick(c)} className="w-full text-start px-2.5 py-1.5 text-[11px] hover:bg-white/5 truncate">{c.name} <span className="opacity-50">· {c.country}</span></button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
