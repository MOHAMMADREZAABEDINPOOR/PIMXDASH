import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import {
  Search,
  BookOpen,
  CheckSquare,
  FileText,
  Clock,
  Settings,
  SunMoon,
  Download,
  ExternalLink,
  Command,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { ChromeApiService, HistoryItem, TabInfo } from '../../services/chrome-api';
import { BookmarkCategorizer, CategorizedBookmark } from '../../services/bookmark-categorizer';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setSettingsOpen,
    shortcuts,
    notes,
    tasks,
    settings,
    updateSettings,
    exportWorkspace,
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bookmarks, setBookmarks] = useState<CategorizedBookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const deferredQuery = useDeferredValue(query);
  const t = getTranslations(settings.language);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    let cancelled = false;
    Promise.all([ChromeApiService.getBookmarks(), ChromeApiService.getRecentlyVisited(30), ChromeApiService.getOpenTabs()]).then(([tree, recent, opened]) => {
      if (cancelled) return;
      setBookmarks(BookmarkCategorizer.processBookmarkTree(tree));
      setHistory(recent); setTabs(opened);
    });
    return () => { cancelled = true; };
  }, [commandPaletteOpen]);

  // Build command items
  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [
      // System Actions
      {
        id: 'act-settings',
        title: t.commands.openSettings,
        category: 'System',
        icon: Settings,
        action: () => setSettingsOpen(true),
        shortcut: '⌘,',
      },
      {
        id: 'act-theme',
        title: t.commands.toggleTheme,
        category: 'System',
        icon: SunMoon,
        action: () => updateSettings({ themeMode: settings.themeMode === 'dark' ? 'light' : 'dark' }),
      },
      {
        id: 'act-export',
        title: t.commands.exportWorkspace,
        category: 'Data',
        icon: Download,
        action: async () => {
          const json = await exportWorkspace();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pimxdash-backup-${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        },
      },
    ];

    // Add website shortcuts
    shortcuts.forEach((sc) => {
      list.push({
        id: `sc-${sc.id}`,
        title: `${sc.title} (${sc.url.replace(/^https?:\/\//, '')})`,
        category: 'Websites',
        icon: ExternalLink,
        action: () => window.open(sc.url, '_blank'),
      });
    });

    bookmarks.forEach((item) => list.push({ id: `bm-${item.id}`, title: `${item.title} · ${item.domain}`, category: 'Bookmarks', icon: BookOpen, action: () => window.open(item.url, '_blank', 'noopener,noreferrer') }));
    tabs.forEach((tab) => list.push({ id: `tab-${tab.id}`, title: `${tab.title} · ${tab.url}`, category: 'Open tabs', icon: ExternalLink, action: () => ChromeApiService.switchToTab(tab.id) }));
    history.forEach((entry) => list.push({ id: `history-${entry.id}`, title: `${entry.title} · ${entry.url}`, category: 'History', icon: Clock, action: () => window.open(entry.url, '_blank', 'noopener,noreferrer') }));
    notes.forEach((note) => list.push({ id: `note-${note.id}`, title: `${note.title} · ${note.content.slice(0, 80)}`, category: 'Notes · copy', icon: FileText, action: () => navigator.clipboard.writeText(note.content) }));
    tasks.forEach((task) => list.push({ id: `task-${task.id}`, title: task.title, category: 'Tasks', icon: CheckSquare, action: () => navigator.clipboard.writeText(task.title) }));

    return list;
  }, [
    t,
    setSettingsOpen,
    updateSettings,
    settings.themeMode,
    exportWorkspace,
    shortcuts,
    settings.language,
    bookmarks,
    tabs,
    history,
    notes,
    tasks,
  ]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim();
    if (!q) return items.filter((item) => !['Bookmarks', 'History', 'Notes · copy', 'Tasks'].includes(item.category)).slice(0, 24);
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    ).slice(0, 60);
  }, [items, deferredQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        setCommandPaletteOpen(false);
      }
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={() => setCommandPaletteOpen(false)} />

      <div
        className="relative w-full max-w-xl rounded-2xl glass-panel shadow-2xl border border-border-glass overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle gap-3">
          <Command className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={t.commandPalettePlaceholder}
            className="w-full bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-text-muted bg-bg-glass rounded border border-border-subtle">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-text-muted">
              No matching commands or websites found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-start transition-all ${
                    isSelected
                      ? 'bg-accent text-white shadow-glow'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-accent'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ms-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-bg-glass text-text-muted'
                      }`}
                    >
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-bg-glass text-text-muted'
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
