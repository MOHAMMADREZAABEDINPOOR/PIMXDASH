import React, { useEffect, useState } from 'react';
import { Globe2, Plus, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { storage } from '../../services/storage';
import { CLOCK_STYLES } from './clockStyles';

type Clock = { zone: string; styleId: string };
const KEY = 'hero_world_clocks_v1';
const CITIES = [
  ['Asia/Tehran', 'Tehran', 'تهران'], ['Europe/London', 'London', 'لندن'],
  ['America/New_York', 'New York', 'نیویورک'], ['Asia/Tokyo', 'Tokyo', 'توکیو'],
  ['Europe/Paris', 'Paris', 'پاریس'], ['Asia/Dubai', 'Dubai', 'دبی'],
  ['America/Los_Angeles', 'Los Angeles', 'لس‌آنجلس'], ['Europe/Berlin', 'Berlin', 'برلین'],
  ['Asia/Singapore', 'Singapore', 'سنگاپور'], ['Australia/Sydney', 'Sydney', 'سیدنی'],
  ['Asia/Shanghai', 'Shanghai', 'شانگهای'], ['Asia/Kolkata', 'Mumbai', 'بمبئی'],
  ['Europe/Istanbul', 'Istanbul', 'استانبول'], ['Europe/Moscow', 'Moscow', 'مسکو'],
  ['Asia/Seoul', 'Seoul', 'سئول'], ['America/Chicago', 'Chicago', 'شیکاگو'],
] as const;
const DEFAULT: Clock[] = [
  { zone: 'Europe/London', styleId: 'cyber-neon' },
  { zone: 'America/New_York', styleId: 'hacker-terminal' },
  { zone: 'Asia/Tokyo', styleId: 'sci-fi-hud' },
];

function cityTime(zone: string, now: Date, hour12: boolean) {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: hour12 ? 'h12' : 'h23' }).format(now);
  } catch { return '--:--'; }
}

export const HeroWorldClocks: React.FC = () => {
  const { settings } = useWorkspace();
  const fa = settings.language === 'fa';
  const [clocks, setClocks] = useState<Clock[]>(DEFAULT);
  const [now, setNow] = useState(() => new Date());
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    let active = true;
    void storage.get<Clock[]>(KEY, DEFAULT).then((saved) => {
      if (active && Array.isArray(saved)) setClocks(saved.filter((clock) => CITIES.some(([zone]) => zone === clock.zone)).slice(0, 6));
    });
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const save = (next: Clock[]) => { setClocks(next); void storage.set(KEY, next); };
  const add = (zone: string) => {
    if (!zone || clocks.some((clock) => clock.zone === zone) || clocks.length >= 6) return;
    save([...clocks, { zone, styleId: 'cyber-neon' }]);
    setAdding(false);
  };
  return <section className="pimx-world-deck" aria-label={fa ? 'ساعت‌های جهان' : 'World clocks'}>
    <div className="pimx-world-deck-head"><div><span className="pimx-world-kicker"><Globe2 size={13} /> WORLD TIME / LIVE</span><h2>{fa ? 'شهرهای من' : 'Your cities'}</h2></div><button type="button" onClick={() => setAdding((open) => !open)} disabled={clocks.length >= 6} className="pimx-world-add" title={fa ? 'افزودن ساعت' : 'Add city'}><Plus size={15} /></button></div>
    {adding && <select autoFocus value="" onChange={(event) => add(event.target.value)} className="pimx-world-picker" aria-label={fa ? 'انتخاب شهر' : 'Choose city'}><option value="">{fa ? 'یک شهر انتخاب کنید' : 'Choose a city'}</option>{CITIES.filter(([zone]) => !clocks.some((clock) => clock.zone === zone)).map(([zone, en, persian]) => <option key={zone} value={zone}>{fa ? persian : en}</option>)}</select>}
    <div className="pimx-world-list">
      {clocks.map((clock) => {
        const city = CITIES.find(([zone]) => zone === clock.zone);
        const style = CLOCK_STYLES.find((candidate) => candidate.id === clock.styleId) || CLOCK_STYLES[0];
        return <div className="pimx-world-card" key={clock.zone}>
          <div className="pimx-world-card-top"><span>{city ? (fa ? city[2] : city[1]) : clock.zone}</span><button type="button" onClick={() => save(clocks.filter((item) => item.zone !== clock.zone))} title={fa ? 'حذف ساعت' : 'Remove clock'}><X size={12} /></button></div>
          <div className={`pimx-world-time ${style.clockClass}`} dir="ltr">{cityTime(clock.zone, now, settings.clockFormat === '12h')}</div>
          <select aria-label={`${city?.[1] || clock.zone} style`} value={style.id} onChange={(event) => save(clocks.map((item) => item.zone === clock.zone ? { ...item, styleId: event.target.value } : item))} className="pimx-world-style">{CLOCK_STYLES.map((choice, index) => <option key={choice.id} value={choice.id}>{String(index + 1).padStart(2, '0')} · {fa ? choice.nameFa : choice.nameEn}</option>)}</select>
        </div>;
      })}
      {clocks.length === 0 && <p className="pimx-world-empty">{fa ? 'با + اولین شهر را اضافه کنید.' : 'Add your first city with +.'}</p>}
    </div>
    <div className="pimx-world-deck-foot">{fa ? 'تا ۶ شهر · ۴۰ استایل برای هر ساعت' : 'UP TO 6 CITIES · 40 STYLES EACH'}</div>
  </section>;
};
