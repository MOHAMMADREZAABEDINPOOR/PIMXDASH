import React from 'react';
import {
  Bookmark,
  Wrench,
  TrendingUp,
  Headphones,
  Settings,
  SunMoon,
  Palette,
  Archive,
  LayoutGrid,
  Rss,
  Shield,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FloatingDockProps {
  onOpenBookmarks: () => void;
  onOpenDevTools: () => void;
  onOpenNews: () => void;
  onOpenThemeStudio: () => void;
  onOpenTabSessions: () => void;
  onOpenWidgetManager: () => void;
  onOpenRss: () => void;
  onOpenFocusShield: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  onOpenBookmarks,
  onOpenDevTools,
  onOpenNews,
  onOpenThemeStudio,
  onOpenTabSessions,
  onOpenWidgetManager,
  onOpenRss,
  onOpenFocusShield,
}) => {
  const {
    soundscapeState,
    toggleSoundscape,
    setSettingsOpen,
    settings,
    updateSettings,
  } = useWorkspace();

  const isFa = settings.language === 'fa';

  const toggleTheme = () => {
    updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' });
  };

  const dockItems = [
    {
      id: 'bookmarks',
      label: isFa ? 'دسته‌بندی هوشمند تمام نشانک‌ها' : 'Smart Bookmarks Hub',
      icon: Bookmark,
      color: '#6366f1',
      action: onOpenBookmarks,
    },
    {
      id: 'themes',
      label: isFa ? 'استودیوی قالب‌ها و والپیپرها' : 'Wallpapers & Theme Studio',
      icon: Palette,
      color: '#ec4899',
      action: onOpenThemeStudio,
    },
    {
      id: 'tab_sessions',
      label: isFa ? 'مدیر تب‌ها و آزادسازی رم' : 'Tab Stash & RAM Saver',
      icon: Archive,
      color: '#f59e0b',
      action: onOpenTabSessions,
    },
    {
      id: 'devtools',
      label: isFa ? 'جعبه‌ابزار توسعه‌دهنده' : 'Developer Toolbox',
      icon: Wrench,
      color: '#06b6d4',
      action: onOpenDevTools,
    },
    {
      id: 'widgets',
      label: isFa ? 'مدیریت و چینش ویجت‌ها' : 'Dashboard Builder',
      icon: LayoutGrid,
      color: '#a855f7',
      action: onOpenWidgetManager,
    },
    {
      id: 'rss',
      label: isFa ? 'فیدخوان و اخبار آفلاین RSS' : 'RSS Tech Feeds',
      icon: Rss,
      color: '#f97316',
      action: onOpenRss,
    },
    {
      id: 'shield',
      label: isFa ? 'سپر تمرکز و ضد حواس‌پرتی' : 'Focus Shield',
      icon: Shield,
      color: '#10b981',
      action: onOpenFocusShield,
    },
    {
      id: 'news',
      label: isFa ? 'داغ‌ترین اخبار فناوری' : 'Trending Tech News',
      icon: TrendingUp,
      color: '#10b981',
      action: onOpenNews,
    },
    {
      id: 'audio',
      label: soundscapeState.isPlaying ? (isFa ? 'قطع صدای تمرکز' : 'Mute Focus Audio') : (isFa ? 'پخش صدای تمرکز' : 'Ambient Focus Audio'),
      icon: Headphones,
      color: '#38bdf8',
      active: soundscapeState.isPlaying,
      action: () => toggleSoundscape('rain'),
    },
    {
      id: 'theme',
      label: isFa ? 'تغییر تم' : 'Toggle Theme',
      icon: SunMoon,
      color: '#fbbf24',
      action: toggleTheme,
    },
    {
      id: 'settings',
      label: isFa ? 'تنظیمات' : 'Settings',
      icon: Settings,
      color: '#94a3b8',
      action: () => setSettingsOpen(true),
    },
  ];

  return (
    <div className="pimx-dock-frame fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 select-none max-w-[calc(100vw-1rem)]">
      <div className="pimx-dock flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl glass-panel shadow-2xl border border-border-glass backdrop-blur-2xl max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar">
        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              aria-label={item.label}
              title={item.label}
              className={`pimx-dock-item group relative shrink-0 p-2.5 rounded-xl transition-all duration-200 ease-out hover:-translate-y-2 hover:scale-110 ${
                item.active
                  ? 'bg-accent text-white shadow-glow'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" style={{ color: item.active ? undefined : item.color }} />

              {/* Tooltip on Hover */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-bg-surface/95 text-text-primary border border-border-subtle shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                {item.label}
              </div>

              {/* Active Dot Indicator */}
              {item.active && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
