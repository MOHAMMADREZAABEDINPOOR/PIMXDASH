import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon,
  CloudRain, CloudSnow, CloudSun, Crosshair, Droplets, MapPin, MoonStar,
  RotateCw, Search, Sun, Wind, X,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';
import { WeatherService } from '../../services/weather';
import { WeatherLocation } from '../../types';

function weatherVisual(code: number, isDay: boolean) {
  if (code === 0) return { Icon: isDay ? Sun : MoonStar, mood: isDay ? 'sun' : 'night' };
  if (code >= 1 && code <= 3) return { Icon: isDay ? CloudSun : CloudMoon, mood: isDay ? 'sun' : 'night' };
  if (code === 45 || code === 48) return { Icon: CloudFog, mood: 'fog' };
  if (code >= 51 && code <= 55) return { Icon: CloudDrizzle, mood: 'rain' };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { Icon: CloudRain, mood: 'rain' };
  if (code >= 71 && code <= 77) return { Icon: CloudSnow, mood: 'snow' };
  if (code >= 95) return { Icon: CloudLightning, mood: 'storm' };
  return { Icon: Cloud, mood: 'fog' };
}

const faDays: Record<string, string> = { Sun: 'یکشنبه', Mon: 'دوشنبه', Tue: 'سه‌شنبه', Wed: 'چهارشنبه', Thu: 'پنجشنبه', Fri: 'جمعه', Sat: 'شنبه' };

export const WeatherBadge: React.FC = () => {
  const { weather, settings, updateSettings, refreshWeather } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<WeatherLocation[]>([]);
  const [cityError, setCityError] = useState('');
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFa = settings.language === 'fa';

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => { document.removeEventListener('pointerdown', onPointerDown); document.removeEventListener('keydown', onEscape); };
  }, [open]);

  useEffect(() => {
    if (!open || settings.networkEnabled === false || cityQuery.trim().length < 2) {
      setCityResults([]);
      setCityError('');
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(() => {
      WeatherService.searchCities(cityQuery.trim())
        .then((results) => {
          if (cancelled) return;
          setCityResults(results);
          setCityError('');
        })
        .catch(() => {
          if (cancelled) return;
          setCityResults([]);
          setCityError(isFa ? 'جست‌وجوی شهر در دسترس نیست' : 'City search unavailable');
        })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [cityQuery, open, settings.networkEnabled, isFa]);

  const selectCity = async (city: WeatherLocation) => {
    setBusy(true);
    try {
      await updateSettings({ weatherLocation: city });
      await refreshWeather(true, city);
      setCityQuery('');
      setCityResults([]);
    } finally { setBusy(false); }
  };

  const locate = async () => {
    setBusy(true);
    try {
      await updateSettings({ weatherLocation: null });
      await refreshWeather(true, null);
      setCityQuery('');
      setCityResults([]);
    } finally { setBusy(false); }
  };

  const refresh = async () => {
    setBusy(true);
    try { await refreshWeather(true); } finally { setBusy(false); }
  };

  if (!weather) {
    return <div className="pimx-weather-trigger pimx-weather-loading" aria-label={isFa ? 'در حال دریافت هواشناسی' : 'Loading weather'}><CloudSun size={18} /><span>--°</span></div>;
  }

  const { Icon, mood } = weatherVisual(weather.conditionCode, weather.isDay);
  const condition = weather.unavailable
    ? (isFa ? 'داده در دسترس نیست' : 'Weather unavailable')
    : (isFa ? WeatherService.getConditionDescriptionFa(weather.conditionCode) : weather.condition);
  const temp = weather.unavailable ? '—' : `${formatBilingualNumber(weather.temp, settings.language)}°`;
  const feels = weather.unavailable ? '—' : `${formatBilingualNumber(weather.feelsLike, settings.language)}°`;
  const source = weather.unavailable
    ? (isFa ? 'آفلاین' : 'Offline')
    : weather.source === 'location'
    ? (isFa ? `مکان‌یابی · ${weather.city}` : `GPS · ${weather.city}`)
    : weather.source === 'city'
      ? (isFa ? 'شهر انتخابی' : 'Selected city')
      : (isFa ? 'مکان پیش‌فرض' : 'Default location');

  return (
    <div ref={containerRef} className="pimx-weather" data-mood={weather.unavailable ? 'offline' : mood}>
      <button type="button" className="pimx-weather-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="pimx-weather-panel" aria-label={isFa ? `هواشناسی ${weather.city}، ${temp}` : `Weather in ${weather.city}, ${temp}`}>
        <span className="pimx-weather-trigger-icon"><Icon size={19} strokeWidth={1.8} /></span>
        <span className="pimx-weather-trigger-copy"><strong>{temp}</strong><small>{weather.city}</small></span>
        <ChevronDown size={13} className={open ? 'pimx-weather-chevron is-open' : 'pimx-weather-chevron'} />
      </button>

      {open && <>
        <section id="pimx-weather-panel" className="pimx-weather-panel" role="dialog" aria-label={isFa ? 'هواشناسی و انتخاب شهر' : 'Weather and city selection'}>
          <div className="pimx-weather-topline"><span><i /> {isFa ? 'گزارش زنده هوا' : 'LIVE WEATHER FEED'}</span><button type="button" onClick={() => setOpen(false)} aria-label={isFa ? 'بستن' : 'Close'}><X size={16} /></button></div>

          <div className="pimx-weather-current">
            <div className="pimx-weather-orb" aria-hidden="true"><span className="pimx-weather-orb-ring" /><Icon size={54} strokeWidth={1.25} /></div>
            <div className="pimx-weather-current-copy">
              <div className="pimx-weather-location"><MapPin size={14} /><span>{weather.city}</span></div>
              <div className="pimx-weather-temperature">{temp}</div>
              <div className="pimx-weather-condition">{condition}</div>
            </div>
          </div>

          <div className="pimx-weather-location-row"><span>{source}</span><span>{weather.isDay ? (isFa ? 'روز' : 'DAY MODE') : (isFa ? 'شب' : 'NIGHT MODE')}</span></div>

          <div className="pimx-weather-search">
            <label htmlFor="pimx-weather-city">{isFa ? 'تغییر شهر' : 'SEARCH LOCATION'}</label>
            <div className="pimx-weather-search-field"><Search size={17} /><input id="pimx-weather-city" value={cityQuery} onChange={(event) => setCityQuery(event.target.value)} placeholder={isFa ? 'نام شهر را وارد کنید…' : 'Type a city name…'} autoComplete="off" disabled={settings.networkEnabled === false} /></div>
            {settings.networkEnabled === false && <p className="pimx-weather-search-message">{isFa ? 'دسترسی آنلاین در تنظیمات غیرفعال است.' : 'Online weather is paused in Settings.'}</p>}
            {cityError && <p className="pimx-weather-search-message is-error">{cityError}</p>}
            {cityQuery.trim().length >= 2 && settings.networkEnabled !== false && <div className="pimx-weather-results" role="listbox" aria-label={isFa ? 'نتایج شهر' : 'City results'}>
              {searching ? <div className="pimx-weather-result-empty">{isFa ? 'در حال جست‌وجو…' : 'Searching…'}</div> : cityResults.length ? cityResults.map((city) => <button key={`${city.latitude}_${city.longitude}`} type="button" role="option" aria-selected={false} onClick={() => void selectCity(city)}><MapPin size={14} /><span>{city.name}<small>{city.country}</small></span></button>) : !cityError && <div className="pimx-weather-result-empty">{isFa ? 'شهری پیدا نشد' : 'No city found'}</div>}
            </div>}
          </div>

          <div className="pimx-weather-toolbar">
            <button type="button" onClick={() => void locate()} disabled={busy || settings.networkEnabled === false}><Crosshair size={15} /> {isFa ? 'مکان من' : 'My location'}</button>
            <button type="button" onClick={() => void updateSettings({ weatherUnit: settings.weatherUnit === 'celsius' ? 'fahrenheit' : 'celsius' })} aria-label={isFa ? 'تغییر واحد دما' : 'Change temperature unit'}>{settings.weatherUnit === 'celsius' ? '°C / °F' : '°F / °C'}</button>
            <button type="button" onClick={() => void refresh()} disabled={busy} aria-label={isFa ? 'به‌روزرسانی هواشناسی' : 'Refresh weather'} title={isFa ? 'به‌روزرسانی' : 'Refresh'}><RotateCw size={15} className={busy ? 'pimx-weather-spinning' : ''} /></button>
          </div>

          <div className="pimx-weather-metrics">
            <div><Droplets size={17} /><span>{isFa ? 'رطوبت' : 'HUMIDITY'}</span><strong>{weather.unavailable ? '—' : `${formatBilingualNumber(weather.humidity, settings.language)}%`}</strong></div>
            <div><Wind size={17} /><span>{isFa ? 'سرعت باد' : 'WIND'}</span><strong>{weather.unavailable ? '—' : `${formatBilingualNumber(weather.windSpeed, settings.language)} ${settings.weatherUnit === 'celsius' ? 'km/h' : 'mph'}`}</strong></div>
            <div><Icon size={17} /><span>{isFa ? 'حس واقعی' : 'FEELS LIKE'}</span><strong>{feels}</strong></div>
          </div>

          {!!weather.forecast?.length && <div className="pimx-weather-forecast"><div className="pimx-weather-section-title">{isFa ? 'سه روز آینده' : 'NEXT THREE DAYS'} <span>↗</span></div><div className="pimx-weather-days">{weather.forecast.map((day, index) => { const DayIcon = weatherVisual(day.conditionCode, true).Icon; return <div key={`${day.day}-${index}`} className="pimx-weather-day"><span>{isFa ? faDays[day.day] || day.day : day.day}</span><DayIcon size={24} strokeWidth={1.7} /><strong>{formatBilingualNumber(day.tempMax, settings.language)}° <em>/ {formatBilingualNumber(day.tempMin, settings.language)}°</em></strong></div>; })}</div></div>}
          <div className="pimx-weather-footer"><span>{isFa ? 'داده: Open-Meteo' : 'DATA: OPEN-METEO'}</span><span>{isFa ? 'به‌روزرسانی' : 'UPDATED'} {new Date(weather.lastUpdated).toLocaleTimeString(isFa ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
        </section>
      </>}
    </div>
  );
};
