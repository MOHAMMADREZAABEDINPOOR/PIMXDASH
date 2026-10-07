import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Video, Plus, Trash2, Bell, Clock, Check, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations, formatBilingualNumber } from '../../i18n/useTranslation';
import { storage } from '../../services/storage';

interface Reminder {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  category?: 'meeting' | 'deadline' | 'personal' | 'focus';
  done?: boolean;
}

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const CATEGORY_COLORS = {
  meeting: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', labelFa: 'جلسه', labelEn: 'Meet' },
  deadline: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', labelFa: 'ددلاین', labelEn: 'Due' },
  personal: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', labelFa: 'شخصی', labelEn: 'Personal' },
  focus: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', labelFa: 'تمرکز', labelEn: 'Focus' },
};

export const CalendarWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';

  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState(toKey(new Date()));
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('14:30');
  const [category, setCategory] = useState<'meeting' | 'deadline' | 'personal' | 'focus'>('meeting');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    storage.get<Reminder[]>('calendar_reminders', []).then((v) => {
      if (Array.isArray(v)) setReminders(v);
    });
  }, []);

  const save = (next: Reminder[]) => {
    setReminders(next);
    void storage.set('calendar_reminders', next);
  };

  const today = new Date();
  const todayKey = toKey(today);
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + (isFa ? 1 : 0)) % 7;
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    settings.language === 'fa' ? 'fa-IR-u-ca-gregory' : 'en-US',
    {
      month: 'long',
      year: 'numeric',
    }
  );

  // Persian Shamsi formatted date for today
  const persianTodayStr = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full',
  }).format(today);

  const weekDays = isFa
    ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const dayKey = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const addReminder = () => {
    if (!title.trim()) return;
    const r: Reminder = {
      id: `r_${Date.now()}`,
      date: selected,
      time,
      title: title.trim(),
      category,
    };
    save([r, ...reminders].slice(0, 250));
    setTitle('');
    setShowForm(false);
  };

  const selectedReminders = reminders
    .filter((r) => r.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));

  const upcoming = reminders
    .filter((r) => r.date >= todayKey && !r.done)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none min-h-[380px] shadow-glass">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide uppercase font-mono">
            {t.widgets.calendar}
          </h2>
          {reminders.filter((r) => !r.done && r.date >= todayKey).length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {reminders.filter((r) => !r.done && r.date >= todayKey).length} {isFa ? 'یادآور فعال' : 'active'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (viewMonth === 0) {
                setViewMonth(11);
                setViewYear(viewYear - 1);
              } else setViewMonth(viewMonth - 1);
            }}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
            title="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold min-w-[100px] text-center font-mono">{monthName}</span>
          <button
            onClick={() => {
              if (viewMonth === 11) {
                setViewMonth(0);
                setViewYear(viewYear + 1);
              } else setViewMonth(viewMonth + 1);
            }}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
            title="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isFa && (
        <div className="text-[10px] text-accent/80 font-mono mb-2 flex items-center justify-between px-1">
          <span>{persianTodayStr}</span>
          <button
            onClick={() => {
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
              setSelected(todayKey);
            }}
            className="text-[9px] px-1.5 py-0.5 rounded bg-bg-glass hover:text-text-primary text-text-muted border border-border-subtle"
          >
            برو به امروز
          </button>
        </div>
      )}

      {/* Upcoming Reminders Alert Banner */}
      {upcoming.length > 0 && (
        <div className="mb-2 space-y-1">
          {upcoming.map((r) => {
            const cat = CATEGORY_COLORS[r.category || 'meeting'];
            return (
              <div
                key={r.id}
                className="flex items-center justify-between p-2 rounded-xl bg-bg-surface/90 border border-border-subtle hover:border-accent/40 text-[11px] transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-text-primary truncate flex items-center gap-1.5">
                      <span className="truncate">{r.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${cat.bg} ${cat.text} ${cat.border} border`}>
                        {isFa ? cat.labelFa : cat.labelEn}
                      </span>
                    </div>
                    <div className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-accent" />
                      <span dir="ltr" className="font-mono text-accent">
                        {r.date === todayKey ? (isFa ? 'امروز' : 'Today') : r.date} · {r.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      save(
                        reminders.map((x) =>
                          x.id === r.id ? { ...x, done: !x.done } : x
                        )
                      )
                    }
                    className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title={isFa ? 'علامت انجام' : 'Mark done'}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => window.open('https://meet.google.com', '_blank')}
                    className="p-1.5 rounded-lg bg-accent/20 text-accent hover:bg-accent/30"
                    title="Google Meet"
                  >
                    <Video className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-[10px] font-bold text-text-muted mb-1 font-mono">
        {weekDays.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 text-center text-xs gap-y-1 mb-2 font-mono">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="p-1" />
        ))}
        {daysArray.map((day) => {
          const k = dayKey(day);
          const isToday = k === todayKey;
          const isSel = k === selected;
          const dayReminders = reminders.filter((r) => r.date === k && !r.done);
          return (
            <button
              key={day}
              onClick={() => setSelected(k)}
              className="flex items-center justify-center p-0.5 relative group"
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                  isSel
                    ? 'bg-accent text-bg-surface font-black shadow-[0_0_15px_rgba(74,243,162,0.6)]'
                    : isToday
                    ? 'border-2 border-accent text-accent font-bold bg-accent/10'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                {formatBilingualNumber(day, settings.language)}
              </span>
              {dayReminders.length > 0 && (
                <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Reminders Panel & Add Form */}
      <div className="mt-auto pt-2.5 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-accent" />
            <span dir="ltr" className="font-mono text-accent">
              {selected === todayKey ? (isFa ? 'امروز' : 'Today') : selected}
            </span>
            <span className="text-text-muted">
              · {selectedReminders.length} {isFa ? 'یادآور' : 'items'}
            </span>
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-accent text-bg-surface hover:brightness-110 text-[11px] font-bold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isFa ? 'افزودن یادآور' : 'Add Reminder'}</span>
          </button>
        </div>

        {/* Add Reminder Form */}
        {showForm && (
          <div className="p-2.5 rounded-xl bg-black/40 border border-accent/30 space-y-2 mb-2 animate-in fade-in duration-150">
            <label className="flex items-center gap-2 text-[11px] text-text-secondary">
              <span>{isFa ? 'روز یادآوری' : 'Reminder date'}</span>
              <input type="date" value={selected} onChange={(e) => setSelected(e.target.value)} className="pimx-input !py-1 text-xs" dir="ltr" />
            </label>
            <div className="flex gap-1.5">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addReminder();
                }}
                placeholder={isFa ? 'عنوان یادآور (مثال: تماس مهم)...' : 'Reminder title...'}
                className="pimx-input flex-1 min-w-0 !py-1 text-xs"
                autoFocus
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pimx-input !py-1 w-24 text-xs font-mono"
                dir="ltr"
                title="Exact reminder time"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(['meeting', 'deadline', 'personal', 'focus'] as const).map((catKey) => {
                  const cat = CATEGORY_COLORS[catKey];
                  const isSel = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                        isSel
                          ? `${cat.bg} ${cat.text} ${cat.border} font-bold`
                          : 'border-transparent text-text-muted hover:text-text-primary'
                      }`}
                    >
                      {isFa ? cat.labelFa : cat.labelEn}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={addReminder}
                disabled={!title.trim()}
                className="px-3 py-1 rounded-lg bg-accent text-bg-surface text-xs font-bold disabled:opacity-30"
              >
                {isFa ? 'ذخیره' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {/* Selected Day Reminders List */}
        <div className="space-y-1 max-h-28 overflow-y-auto pimx-scrollbar">
          {selectedReminders.length === 0 ? (
            <div className="text-[11px] text-text-muted text-center py-2 bg-bg-glass rounded-xl border border-dashed border-border-subtle">
              {isFa
                ? 'هیچ یادآوری برای این ساعت/روز نیست. با زدن + اضافه کنید.'
                : 'No reminders for this day. Click Add to schedule one.'}
            </div>
          ) : (
            selectedReminders.map((r) => {
              const cat = CATEGORY_COLORS[r.category || 'meeting'];
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] transition-all ${
                    r.done
                      ? 'opacity-40 line-through bg-black/20 border-transparent'
                      : 'bg-bg-glass border-border-subtle hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-accent font-bold" dir="ltr">
                      {r.time}
                    </span>
                    <span className="truncate text-text-primary">{r.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${cat.bg} ${cat.text} ${cat.border} border shrink-0`}>
                      {isFa ? cat.labelFa : cat.labelEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ms-2">
                    <button
                      onClick={() =>
                        save(
                          reminders.map((x) =>
                            x.id === r.id ? { ...x, done: !x.done } : x
                          )
                        )
                      }
                      className="p-1 text-emerald-400 hover:bg-emerald-500/20 rounded"
                      title={isFa ? 'تغییر وضعیت' : 'Toggle status'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => save(reminders.filter((x) => x.id !== r.id))}
                      className="p-1 text-text-muted hover:text-rose-400 hover:bg-rose-500/20 rounded"
                      title={isFa ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
