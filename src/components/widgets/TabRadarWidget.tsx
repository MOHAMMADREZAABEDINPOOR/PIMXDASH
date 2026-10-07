import React, { useEffect, useMemo, useState } from 'react';
import { Radio, Search, X, Volume2 } from 'lucide-react';
import { ChromeApiService, TabInfo } from '../../services/chrome-api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SmartFavicon } from '../common/SmartFavicon';

export const TabRadarWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const fa = settings.language === 'fa';
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [query, setQuery] = useState('');
  const extension = ChromeApiService.isExtension();
  useEffect(() => {
    let active = true;
    const update = () => { void ChromeApiService.getOpenTabs().then((items) => { if (active) setTabs(items.filter((item) => /^https?:/.test(item.url))); }); };
    update();
    const timer = window.setInterval(update, 3000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const shown = useMemo(() => tabs.filter((tab) => `${tab.title} ${tab.url}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [tabs, query]);
  const activate = (tab: TabInfo) => {
    if (extension) void chrome.tabs.update(tab.id, { active: true });
    else window.open(tab.url, '_blank', 'noopener,noreferrer');
  };
  const close = (tab: TabInfo) => {
    if (!extension) return;
    void chrome.tabs.remove(tab.id).then(() => setTabs((current) => current.filter((item) => item.id !== tab.id)));
  };
  return <section className="h-full min-h-[290px] rounded-2xl border border-border-subtle bg-bg-surface/85 p-4 shadow-glass flex flex-col">
    <header className="flex items-center justify-between pb-3 border-b border-border-subtle"><h3 className="text-xs font-bold font-mono text-accent flex items-center gap-2"><Radio size={16} />{fa ? 'رادار تب‌ها' : 'TAB / RADAR'}</h3><span className="text-[10px] font-mono text-text-muted">{tabs.length} {fa ? 'تب' : 'TABS'}</span></header>
    <div className="relative my-3"><Search size={14} className="absolute start-2 top-2 text-text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={fa ? 'جستجوی تب‌های باز' : 'Search open tabs'} className="w-full bg-bg-glass border border-border-subtle rounded-lg py-1.5 ps-8 pe-2 text-xs outline-none focus:border-accent" /></div>
    <div className="flex-1 max-h-52 overflow-y-auto space-y-1 pimx-scrollbar">{shown.map((tab) => <div key={tab.id} className="group flex items-center gap-2 rounded-lg border border-border-subtle bg-black/15 px-2 py-1.5"><SmartFavicon url={tab.url} size={24} title={tab.title} /><button onClick={() => activate(tab)} className="flex-1 min-w-0 text-start"><span className="block truncate text-xs font-medium group-hover:text-accent">{tab.title}</span><span className="block truncate text-[10px] text-text-muted" dir="ltr">{new URL(tab.url).hostname}</span></button>{tab.audible && <Volume2 size={12} className="text-amber-300" />}{extension && <button onClick={() => close(tab)} title={fa ? 'بستن تب' : 'Close tab'} className="p-1 text-text-muted hover:text-rose-400"><X size={13} /></button>}</div>)}</div>
    {!extension && <p className="text-[10px] text-text-muted mt-2">{fa ? 'نمایش نمونه؛ برای کنترل تب‌ها اکستنشن را نصب کنید.' : 'Preview data; install the extension to control tabs.'}</p>}
  </section>;
};
