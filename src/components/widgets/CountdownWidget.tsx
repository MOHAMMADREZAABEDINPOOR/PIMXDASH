import React, { useState, useEffect } from 'react';
import { Hourglass, Plus, Calendar, Trash2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';

interface CountdownItem {
  id: string;
  title: string;
  titleFa: string;
  targetDate: string; // ISO date string
}

export const CountdownWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const isFa = settings.language === 'fa';

  const [items, setItems] = useState<CountdownItem[]>([
    {
      id: 'c1',
      title: 'Nowruz / Persian New Year',
      titleFa: 'جشن باستانی نوروز و سال نو',
      targetDate: '2027-03-20T00:00:00',
    },
    {
      id: 'c2',
      title: 'Next Major Product Launch',
      titleFa: 'رونمایی از محصول جدید',
      targetDate: '2026-12-31T23:59:59',
    },
  ]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateRemaining = (targetStr: string) => {
    const diff = new Date(targetStr).getTime() - now;
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, mins, secs };
  };

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Hourglass className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold text-text-primary tracking-wide uppercase">
            {isFa ? 'شمارش معکوس رویدادها' : 'Event Countdowns'}
          </h2>
        </div>
      </div>

      {/* Countdowns List */}
      <div className="space-y-3 pe-1 overflow-y-auto min-h-[140px]">
        {items.map((item) => {
          const rem = calculateRemaining(item.targetDate);
          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-bg-glass border border-border-subtle/50 space-y-2"
            >
              <span className="text-xs font-bold text-text-primary block truncate">
                {isFa ? item.titleFa : item.title}
              </span>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="p-1.5 rounded-xl bg-bg-surface border border-border-subtle/40">
                  <span className="text-sm font-bold text-text-primary font-mono block">
                    {formatBilingualNumber(rem.days, settings.language)}
                  </span>
                  <span className="text-[9px] text-text-muted">{isFa ? 'روز' : 'Days'}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-bg-surface border border-border-subtle/40">
                  <span className="text-sm font-bold text-text-primary font-mono block">
                    {formatBilingualNumber(rem.hours, settings.language)}
                  </span>
                  <span className="text-[9px] text-text-muted">{isFa ? 'ساعت' : 'Hours'}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-bg-surface border border-border-subtle/40">
                  <span className="text-sm font-bold text-text-primary font-mono block">
                    {formatBilingualNumber(rem.mins, settings.language)}
                  </span>
                  <span className="text-[9px] text-text-muted">{isFa ? 'دقیقه' : 'Mins'}</span>
                </div>
                <div className="p-1.5 rounded-xl bg-bg-surface border border-border-subtle/40">
                  <span className="text-sm font-bold text-accent font-mono block">
                    {formatBilingualNumber(rem.secs, settings.language)}
                  </span>
                  <span className="text-[9px] text-text-muted">{isFa ? 'ثانیه' : 'Secs'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
