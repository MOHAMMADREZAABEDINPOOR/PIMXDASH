import React, { useEffect, useState } from 'react';
import { X, LayoutGrid, Check, RotateCcw, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { WidgetId, WidgetLayoutItem } from '../../types';
import { storage } from '../../services/storage';
import { WIDGET_STYLES, WIDGET_STYLES_KEY, WIDGET_STYLE_EVENT } from '../widgets/widgetStyles';

interface WidgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WidgetMeta {
  id: WidgetId;
  name: string;
  nameFa: string;
  category: string;
  defaultColSpan: number;
}

const ALL_WIDGET_METAS: WidgetMeta[] = [
  { id: 'tasks', name: 'Tasks & Priorities', nameFa: 'وظایف و اولویت‌ها', category: 'Productivity', defaultColSpan: 6 },
  { id: 'notes', name: 'Markdown Scratchpad', nameFa: 'یادداشت‌بردار مارک‌داون', category: 'Productivity', defaultColSpan: 6 },
  { id: 'pomodoro', name: 'Focus Pomodoro', nameFa: 'زمان‌سنج تمرکز پومودورو', category: 'Focus', defaultColSpan: 4 },
  { id: 'bookmarks', name: 'Chrome Bookmarks Hub', nameFa: 'بوک‌مارک‌های هوشمند کروم', category: 'Navigation', defaultColSpan: 4 },
  { id: 'recent', name: 'Recently Visited', nameFa: 'سایت‌های اخیراً بازدید شده', category: 'Navigation', defaultColSpan: 4 },
  { id: 'aihub', name: 'AI Prompt Quick Hub', nameFa: 'هاب سریع هوش مصنوعی', category: 'AI Tools', defaultColSpan: 6 },
  { id: 'countdown', name: 'Event Countdown Timers', nameFa: 'شمارش معکوس رویدادها', category: 'Time', defaultColSpan: 4 },
  { id: 'calendar', name: 'Circadian Calendar', nameFa: 'تقویم تقارن خورشیدی', category: 'Time', defaultColSpan: 6 },
  { id: 'zen', name: 'Zen Breath Guide', nameFa: 'راهنمای تنفس ذن و آرامش', category: 'Wellness', defaultColSpan: 4 },
  { id: 'quote', name: 'Wisdom & Philosophy Quote', nameFa: 'نقل‌قول و فلسفه روز', category: 'Wellness', defaultColSpan: 12 },
  { id: 'weather', name: 'Weather Observatory', nameFa: 'رصدخانه آب‌وهوا', category: 'System', defaultColSpan: 4 },
  { id: 'matrix', name: 'Matrix Digital Rain', nameFa: 'باران دیجیتال ماتریکس', category: 'Hacker', defaultColSpan: 4 },
  { id: 'netpulse', name: 'Network Pulse Radar', nameFa: 'رادار پالس شبکه', category: 'System', defaultColSpan: 4 },
  { id: 'tabs', name: 'Live Tab Radar', nameFa: 'رادار تب‌های زنده', category: 'Navigation', defaultColSpan: 4 },
  { id: 'converter', name: 'Unit Converter', nameFa: 'تبدیل واحدها', category: 'Tools', defaultColSpan: 4 },
];

export const WidgetManagerModal: React.FC<WidgetManagerModalProps> = ({ isOpen, onClose }) => {
  const { widgets, toggleWidget, updateWidgetLayout, reorderWidgets, resetWidgetLayout, settings } = useWorkspace();
  const isFa = settings.language === 'fa';
  const [widgetStyles, setWidgetStyles] = useState<Record<string, number>>({});
  useEffect(() => { void storage.get<Record<string, number>>(WIDGET_STYLES_KEY, {}).then(setWidgetStyles); }, []);
  const setWidgetStyle = (id: WidgetId, styleId: number) => {
    const next = { ...widgetStyles, [id]: styleId };
    setWidgetStyles(next);
    void storage.set(WIDGET_STYLES_KEY, next).then(() => window.dispatchEvent(new Event(WIDGET_STYLE_EVENT)));
  };

  if (!isOpen) return null;

  // Build ordered list
  const orderedWidgets = widgets.filter((w) => !['snippets', 'habits', 'worldclock', 'sentinel', 'processes'].includes(w.id)).sort((a, b) => a.order - b.order);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedWidgets.length) return;

    const newArr = [...orderedWidgets];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // update order numbers
    const updated = newArr.map((item, idx) => ({ ...item, order: idx + 1 }));
    reorderWidgets(updated);
  };

  const getMeta = (id: WidgetId): WidgetMeta => {
    return ALL_WIDGET_METAS.find((m) => m.id === id) || {
      id,
      name: id,
      nameFa: id,
      category: 'General',
      defaultColSpan: 6,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-bg-surface/95 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/20">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {isFa ? 'مدیریت و چینش ویجت‌های داشبورد' : 'Dashboard Builder & Widget Layout'}
              </h2>
              <p className="text-xs text-text-muted">
                {isFa
                  ? 'نمایش، عرض، ترتیب و یکی از ۴۰ استایل هر ویجت را انتخاب کنید'
                  : 'Choose visibility, width, order and one of 40 styles for each widget'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetWidgetLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-glass text-text-muted hover:text-text-primary border border-border-subtle text-xs transition-colors"
              title="Reset layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFa ? 'بازنشانی پیش‌فرض' : 'Reset Defaults'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Widgets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {orderedWidgets.map((w, index) => {
            const meta = getMeta(w.id);
            return (
              <div
                key={w.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  w.enabled
                    ? 'bg-bg-glass/80 border-border-subtle/80 hover:border-border-glow'
                    : 'bg-bg-glass/20 border-border-subtle/30 opacity-60'
                }`}
              >
                {/* Left: Toggle & Info */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleWidget(w.id)}
                    className={`p-2 rounded-xl transition-all border ${
                      w.enabled
                        ? 'bg-accent text-white border-accent shadow-sm'
                        : 'bg-bg-surface text-text-muted border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {w.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-text-primary">
                        {isFa ? meta.nameFa : meta.name}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-glass border border-border-subtle text-text-muted font-medium">
                        {meta.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono mt-0.5 block">{isFa ? `عرض: ${w.colSpan} از ۱۲` : `Width: ${w.colSpan} / 12`}</span>
                  </div>
                </div>

                {/* Right: Width Controls & Reordering */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select aria-label={`${meta.name} style`} value={widgetStyles[w.id] ?? 0} onChange={(event) => setWidgetStyle(w.id, Number(event.target.value))} className="bg-bg-surface border border-border-subtle rounded-lg text-[10px] p-1.5 max-w-36 text-text-primary">
                    {WIDGET_STYLES.map((style) => <option key={style.id} value={style.id}>{String(style.id + 1).padStart(2, '0')} · {style.name}</option>)}
                  </select>
                  <select aria-label={`${meta.name} width`} value={w.colSpan} onChange={(event) => updateWidgetLayout(w.id, { colSpan: Number(event.target.value) })} className="bg-bg-surface border border-border-subtle rounded-lg text-[10px] p-1.5 text-text-primary">
                    {[4, 5, 6, 7, 8, 12].map((span) => <option key={span} value={span}>{span}/12</option>)}
                  </select>
                  {/* Reorder Arrows */}
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-glass disabled:opacity-25 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === orderedWidgets.length - 1}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-glass disabled:opacity-25 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-glass/40 flex items-center justify-between text-xs text-text-muted">
          <span>Changes are saved instantly</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold shadow-glow"
          >
            {isFa ? 'تأیید و بستن' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
