import React, { useEffect, useState } from 'react';
import { Target, Check, Flame, Plus, Trash2, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';
import { storage } from '../../services/storage';

interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  history: boolean[];
}

const KEY = 'habit_tracker_v2';

export const HabitTrackerWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const isFa = settings.language === 'fa';

  const [habits, setHabits] = useState<Habit[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    storage.get<Habit[]>(KEY, []).then((v) => {
      if (Array.isArray(v) && v.length) setHabits(v);
      else {
        const seed: Habit[] = [
          { id: 'h1', title: isFa ? 'جلسه کدنویسی عمیق (۲ ساعت)' : 'Deep Coding Session (2h)', streak: 8, completedToday: true, history: [true, true, true, false, true, true, true] },
          { id: 'h2', title: isFa ? 'مطالعه مستندات فنی' : 'Read Tech Articles / Docs', streak: 5, completedToday: false, history: [true, false, true, true, true, true, false] },
        ];
        setHabits(seed);
      }
    });
  }, []);

  const persist = (next: Habit[]) => {
    setHabits(next);
    void storage.set(KEY, next);
  };

  const toggleHabit = (id: string) => {
    persist(habits.map((h) => {
      if (h.id !== id) return h;
      const nextState = !h.completedToday;
      return {
        ...h,
        completedToday: nextState,
        streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
        history: [...h.history.slice(-6), nextState],
      };
    }));
  };

  const addHabit = () => {
    const t = newTitle.trim();
    if (!t) return;
    persist([...habits, { id: `h_${Date.now()}`, title: t, streak: 0, completedToday: false, history: [false, false, false, false, false, false, false] }].slice(0, 20));
    setNewTitle('');
    setShowAdd(false);
  };

  const removeHabit = (id: string) => persist(habits.filter((h) => h.id !== id));

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none min-h-[220px]">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">
            {isFa ? 'عادت‌ها و روتین روزانه' : 'Daily Habits & Streaks'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
            <Flame className="w-3.5 h-3.5 fill-amber-400" />
            <span>{isFa ? 'استمرار فعال' : 'Active Streak'}</span>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-white transition-colors" title={isFa ? 'افزودن عادت' : 'Add habit'}>
            {showAdd ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="flex gap-1.5 mb-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addHabit(); }}
            placeholder={isFa ? 'عادت جدید… مثلاً ورزش ۲۰ دقیقه' : 'New habit… e.g. 20min workout'}
            className="pimx-input flex-1 min-w-0"
            autoFocus
          />
          <button onClick={addHabit} disabled={!newTitle.trim()} className="px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold disabled:opacity-40">+</button>
        </div>
      )}

      <div className="flex-1 space-y-2 pe-1 overflow-y-auto pimx-scrollbar min-h-[100px]">
        {habits.length === 0 && (
          <div className="text-center text-xs text-text-muted py-6">
            {isFa ? 'عادتی نیست — با + اضافه کن' : 'No habits — press + to add your first streak'}
          </div>
        )}
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="group flex items-center justify-between p-2.5 rounded-xl bg-bg-glass border border-border-subtle/50 hover:bg-bg-hover transition-all"
          >
            <button
              type="button"
              onClick={() => toggleHabit(habit.id)}
              className="flex items-center gap-2.5 flex-1 truncate text-start min-w-0"
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                  habit.completedToday
                    ? 'bg-accent text-white shadow-sm'
                    : 'border border-border-subtle text-transparent hover:border-accent'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="truncate min-w-0">
                <span
                  className={`text-xs font-medium truncate block ${
                    habit.completedToday ? 'line-through text-text-muted' : 'text-text-primary'
                  }`}
                >
                  {habit.title}
                </span>
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" />
                  <span>
                    {formatBilingualNumber(habit.streak, settings.language)} {isFa ? 'روز پیاپی' : 'day streak'}
                  </span>
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0 ms-2">
              {habit.history.map((done, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    done ? 'bg-accent/80 shadow-[0_0_6px_var(--accent-color)]' : 'bg-border-subtle/60'
                  }`}
                />
              ))}
              <button onClick={() => removeHabit(habit.id)} className="ms-1 p-1 rounded-md text-text-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
