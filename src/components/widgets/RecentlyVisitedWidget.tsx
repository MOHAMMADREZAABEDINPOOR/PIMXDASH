import React, { useState, useEffect, useMemo } from 'react';
import { History, Search, X, ExternalLink, Trash2, Copy, Check, Globe } from 'lucide-react';
import { ChromeApiService, HistoryItem } from '../../services/chrome-api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations, formatBilingualNumber } from '../../i18n/useTranslation';
import { SmartFavicon } from '../common/SmartFavicon';

export const RecentlyVisitedWidget: React.FC = () => {
  const { settings, addShortcut } = useWorkspace();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';

  useEffect(() => {
    ChromeApiService.hasPermission('history').then((has) => {
      setHasPermission(has || !ChromeApiService.isExtension());
    });
    ChromeApiService.getRecentlyVisited(30).then((res) => {
      setHistory(res);
    });
  }, []);

  const handleGrant = async () => {
    const granted = await ChromeApiService.requestPermission('history');
    setHasPermission(granted);
    if (granted) {
      const res = await ChromeApiService.getRecentlyVisited(30);
      setHistory(res);
    }
  };

  const refresh = async () => {
    const res = await ChromeApiService.getRecentlyVisited(30);
    setHistory(res);
  };

  const clearOne = (id: string) => setHistory((prev) => prev.filter((h) => h.id !== id));

  const copy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 1200);
    } catch { /* noop */ }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return isFa ? 'الان' : 'just now';
    if (diffMins < 60) return `${formatBilingualNumber(diffMins, settings.language)}m ${t.recent.timeAgo}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${formatBilingualNumber(diffHours, settings.language)}h ${t.recent.timeAgo}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${formatBilingualNumber(diffDays, settings.language)}d ${t.recent.timeAgo}`;
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return history;
    return history.filter((h) => h.title.toLowerCase().includes(s) || h.url.toLowerCase().includes(s));
  }, [history, q]);

  const grouped = useMemo(() => {
    const now = Date.now();
    const buckets: { label: string; items: HistoryItem[] }[] = [
      { label: isFa ? 'امروز' : 'Today', items: [] },
      { label: isFa ? 'دیروز' : 'Yesterday', items: [] },
      { label: isFa ? 'قدیمی‌تر' : 'Earlier', items: [] },
    ];
    for (const h of filtered) {
      const age = now - h.lastVisitTime;
      if (age < 24 * 3600 * 1000) buckets[0].items.push(h);
      else if (age < 48 * 3600 * 1000) buckets[1].items.push(h);
      else buckets[2].items.push(h);
    }
    return buckets.filter((b) => b.items.length);
  }, [filtered, isFa]);

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none min-h-[280px] relative overflow-hidden">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50" />
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold tracking-wide uppercase">
            {t.widgets.recent}
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20" dir="ltr">{history.length}</span>
        </div>
        <button onClick={() => void refresh()} className="text-[10px] font-mono text-text-muted hover:text-accent">↻ {isFa ? 'تازه‌سازی' : 'REFRESH'}</button>
      </div>

      {!hasPermission ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <History className="w-8 h-8 text-accent/50 mb-2" />
          <p className="text-xs text-text-muted mb-3 max-w-xs">{t.recent.permissionNeeded}</p>
          <button
            type="button"
            onClick={handleGrant}
            className="px-3.5 py-1.5 rounded-xl bg-accent text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            {t.recent.grantPermission}
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-2">
            <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={isFa ? 'جستجو در تاریخچه…' : 'Search history…'} className="w-full ps-8 pe-7 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs focus:outline-none focus:border-accent" />
            {q && (
              <button onClick={() => setQ('')} className="absolute end-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X className="w-3.5 h-3.5" /></button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto pimx-scrollbar space-y-2 pe-1 min-h-[140px] max-h-[260px]">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-text-muted">
                {t.recent.emptyState}
              </div>
            ) : (
              grouped.map((g) => (
                <div key={g.label}>
                  <div className="text-[10px] font-mono text-accent/80 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Globe className="w-2.5 h-2.5" /> {g.label} · {g.items.length}
                  </div>
                  <div className="space-y-1">
                    {g.items.map((item) => {
                      let domain = '';
                      try {
                        domain = new URL(item.url).hostname.replace(/^www\./, '');
                      } catch {
                        domain = item.url;
                      }
                      return (
                        <div
                          key={item.id}
                          className="group flex items-center gap-2 p-1.5 rounded-xl bg-bg-glass hover:bg-bg-hover border border-border-subtle/50 hover:border-accent/30 transition-all"
                        >
                          <SmartFavicon url={item.url} size={28} categoryColor="#4af3a2" title={item.title} />
                          <a href={item.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0">
                            <span className="truncate text-xs text-text-primary font-medium block group-hover:text-accent">{item.title}</span>
                            <span className="text-[10px] text-text-muted truncate block font-mono" dir="ltr">{domain}</span>
                          </a>
                          <span className="text-[10px] text-text-muted shrink-0 font-mono">
                            {formatRelativeTime(item.lastVisitTime)}
                          </span>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => { addShortcut({ title: item.title || domain, url: item.url, category: 'general' }); setPinned(item.id); }} className="p-1 rounded-md text-text-muted hover:text-accent" title={isFa ? 'افزودن به لانچ‌پد' : 'Add to launchpad'}>{pinned === item.id ? <Check className="w-3 h-3" /> : <span className="font-bold text-xs">+</span>}</button>
                            <button onClick={() => void copy(item.id, item.url)} className="p-1 rounded-md text-text-muted hover:text-accent" title="Copy">
                              {copied === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <a href={item.url} target="_blank" rel="noreferrer" className="p-1 rounded-md text-text-muted hover:text-accent"><ExternalLink className="w-3 h-3" /></a>
                            <button onClick={() => clearOne(item.id)} className="p-1 rounded-md text-text-muted hover:text-rose-400" title="Hide"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-2 mt-1 border-t border-border-subtle/40 flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span dir="ltr">{filtered.length}/{history.length} shown</span>
            <button onClick={() => setHistory([])} className="hover:text-rose-400 flex items-center gap-1"><Trash2 className="w-3 h-3" /> {isFa ? 'پاک کردن لیست' : 'Clear list'}</button>
          </div>
        </>
      )}
    </div>
  );
};
