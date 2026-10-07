import React, { useState, useEffect } from 'react';
import { Layers, Volume2, Copy, X, Check } from 'lucide-react';
import { ChromeApiService, TabInfo } from '../../services/chrome-api';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations, formatBilingualNumber } from '../../i18n/useTranslation';

export const TabRadarBadge: React.FC = () => {
  const { settings } = useWorkspace();
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [closedCount, setClosedCount] = useState<number | null>(null);
  const t = getTranslations(settings.language);

  const refreshTabs = async () => {
    const list = await ChromeApiService.getOpenTabs();
    setTabs(list);
  };

  useEffect(() => {
    refreshTabs();
    const interval = setInterval(refreshTabs, 10000); // lightweight 10s refresh
    return () => clearInterval(interval);
  }, []);

  const audibleTabs = tabs.filter((t) => t.audible);
  const urlCounts = tabs.reduce<Record<string, number>>((acc, t) => {
    if (t.url) acc[t.url] = (acc[t.url] || 0) + 1;
    return acc;
  }, {});
  const duplicateCount = Object.values(urlCounts).filter((c) => c > 1).length;

  const handleCloseDuplicates = async () => {
    const closed = await ChromeApiService.closeDuplicateTabs();
    setClosedCount(closed);
    await refreshTabs();
    setTimeout(() => setClosedCount(null), 3000);
  };

  return (
    <div className="relative select-none z-30">
      <button
        type="button"
        onClick={() => {
          setShowDrawer(!showDrawer);
          refreshTabs();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass-card hover:text-text-primary text-text-secondary transition-all"
        title={t.radar.activeTabs}
      >
        <Layers className="w-3.5 h-3.5 text-accent" />
        <span>{formatBilingualNumber(tabs.length, settings.language)}</span>

        {/* Audible indicator */}
        {audibleTabs.length > 0 && (
          <span className="flex items-center text-accent animate-pulse">
            <Volume2 className="w-3 h-3" />
          </span>
        )}

        {/* Duplicate badge */}
        {duplicateCount > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        )}
      </button>

      {/* Popover */}
      {showDrawer && (
        <div className="absolute top-full mt-2 end-0 w-80 max-h-96 flex flex-col p-3.5 rounded-2xl glass-panel shadow-glass z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-text-primary">
                {t.radar.activeTabs} ({formatBilingualNumber(tabs.length, settings.language)})
              </span>
            </div>
            {duplicateCount > 0 && (
              <button
                type="button"
                onClick={handleCloseDuplicates}
                className="flex items-center gap-1 text-[11px] font-medium text-accent hover:underline bg-accent/10 px-2 py-0.5 rounded-md"
              >
                {closedCount !== null ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{t.radar.cleanDuplicates}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Tab List */}
          <div className="overflow-y-auto space-y-1.5 pe-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  ChromeApiService.switchToTab(tab.id);
                  setShowDrawer(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-start text-xs transition-all ${
                  tab.active
                    ? 'bg-accent/15 border border-accent/30 text-text-primary'
                    : 'hover:bg-bg-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {tab.favIconUrl ? (
                    <img src={tab.favIconUrl} alt="" className="w-3.5 h-3.5 rounded shrink-0" />
                  ) : (
                    <Layers className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  )}
                  <span className="truncate">{tab.title}</span>
                </div>
                {tab.audible && <Volume2 className="w-3.5 h-3.5 text-accent shrink-0 ms-1" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
