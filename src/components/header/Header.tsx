import React from 'react';
import { Settings, Command, Sun, Moon, Bookmark } from 'lucide-react';
import { BrandMark } from '../brand/BrandMark';
import { TabRadarBadge } from './TabRadarBadge';
import { SoundscapesDock } from '../ambient/SoundscapesDock';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SystemMetricsStrip } from './SystemMetricsStrip';

export const Header: React.FC<{ onOpenBookmarks: () => void }> = ({ onOpenBookmarks }) => {
  const {
    settings,
    updateSettings,
    setSettingsOpen,
    setCommandPaletteOpen,
  } = useWorkspace();

  const toggleTheme = () => {
    const next = settings.themeMode === 'dark' ? 'light' : 'dark';
    updateSettings({ themeMode: next });
  };
  const commandKey = navigator.platform.toUpperCase().includes('MAC') ? '⌘K' : 'Ctrl K';

  return (
    <header className="pimx-header relative w-full mx-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 z-30 select-none">
      <div className="pimx-nav-identity flex items-center gap-4">
        <BrandMark />
        <div className="pimx-nav-divider hidden md:block" />
      </div>

      <SystemMetricsStrip />

      {/* End: Utilities (Radar, Soundscapes, Theme, Settings, Cmd+K) — weather lives in grid now */}
      <nav aria-label={settings.language === 'fa' ? 'ناوبری اصلی' : 'Main navigation'} className="pimx-nav-actions w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1 sm:gap-2">
        <button type="button" onClick={onOpenBookmarks} className="pimx-nav-bookmarks flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-all"><Bookmark className="w-4 h-4" /><span className="hidden sm:inline">{settings.language === 'fa' ? 'نشانک‌ها' : 'Bookmarks'}</span></button>
        <TabRadarBadge />
        <SoundscapesDock />

        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium glass-card hover:text-text-primary text-text-secondary transition-all"
          title={`Command Palette (${commandKey})`}
        >
          <Command className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono text-[10px] text-text-muted">{commandKey}</span>
        </button>

        {/* Quick Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full glass-card hover:text-text-primary text-text-secondary transition-all"
          title="Toggle Light / Dark Mode"
        >
          {settings.themeMode === 'dark' ? (
            <Sun className="w-3.5 h-3.5 hover:text-amber-400 transition-colors" />
          ) : (
            <Moon className="w-3.5 h-3.5 hover:text-indigo-400 transition-colors" />
          )}
        </button>

        {/* Settings Modal Trigger */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full glass-card hover:text-text-primary text-text-secondary transition-all"
          title="Workspace Settings"
        >
          <Settings className="w-3.5 h-3.5 hover:rotate-45 transition-transform duration-300" />
        </button>
      </nav>
    </header>
  );
};
