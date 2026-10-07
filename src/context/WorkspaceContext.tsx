import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  UserSettings,
  FlowSpace,
  ShortcutItem,
  TaskItem,
  NoteItem,
  WidgetLayoutItem,
  WeatherData,
  WeatherLocation,
  WorkspaceExportData,
  SnippetItem,
  FocusShieldConfig,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_FLOW_SPACES,
  DEFAULT_SHORTCUTS,
  DEFAULT_TASKS,
  DEFAULT_NOTES,
  DEFAULT_WIDGETS,
  DEFAULT_SNIPPETS,
  DEFAULT_FOCUS_SHIELD,
} from './defaults';
import { storage } from '../services/storage';
import { WeatherService } from '../services/weather';
import { soundscapes, SoundscapeType } from '../services/soundscapes';

interface WorkspaceContextValue {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  flowSpaces: FlowSpace[];
  activeSpace: FlowSpace;
  setActiveSpaceId: (id: string) => Promise<void>;
  saveSpace: (space: FlowSpace) => Promise<void>;
  removeSpace: (id: string) => Promise<void>;
  reorderSpaces: (ids: string[]) => Promise<void>;
  shortcuts: ShortcutItem[];
  addShortcut: (shortcut: Omit<ShortcutItem, 'id'>) => Promise<void>;
  updateShortcut: (id: string, updates: Partial<ShortcutItem>) => Promise<void>;
  removeShortcut: (id: string) => Promise<void>;
  recordShortcutClick: (id: string) => Promise<void>;
  tasks: TaskItem[];
  addTask: (title: string, priority?: 'low' | 'medium' | 'high', category?: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  notes: NoteItem[];
  addNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<NoteItem>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  widgets: WidgetLayoutItem[];
  toggleWidget: (id: string) => Promise<void>;
  updateWidgetLayout: (id: string, updates: Partial<WidgetLayoutItem>) => Promise<void>;
  reorderWidgets: (newWidgets: WidgetLayoutItem[]) => Promise<void>;
  resetWidgetLayout: () => Promise<void>;
  snippets: SnippetItem[];
  addSnippet: (snippet: Omit<SnippetItem, 'id' | 'createdAt'>) => Promise<void>;
  updateSnippet: (id: string, updates: Partial<SnippetItem>) => Promise<void>;
  removeSnippet: (id: string) => Promise<void>;
  focusShield: FocusShieldConfig;
  updateFocusShield: (updates: Partial<FocusShieldConfig>) => Promise<void>;
  weather: WeatherData | null;
  refreshWeather: (forcePrompt?: boolean, locationOverride?: WeatherLocation | null) => Promise<void>;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  soundscapeState: { isPlaying: boolean; type: SoundscapeType | null; volume: number };
  toggleSoundscape: (type?: SoundscapeType) => void;
  setSoundscapeVolume: (volume: number) => void;
  exportWorkspace: () => Promise<string>;
  importWorkspace: (jsonStr: string) => Promise<boolean>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [flowSpaces, setFlowSpaces] = useState<FlowSpace[]>(DEFAULT_FLOW_SPACES);
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(DEFAULT_SHORTCUTS);
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_NOTES);
  const [widgets, setWidgets] = useState<WidgetLayoutItem[]>(DEFAULT_WIDGETS);
  const [snippets, setSnippets] = useState<SnippetItem[]>(DEFAULT_SNIPPETS);
  const [focusShield, setFocusShield] = useState<FocusShieldConfig>(DEFAULT_FOCUS_SHIELD);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [soundscapeState, setSoundscapeState] = useState<{
    isPlaying: boolean;
    type: SoundscapeType | null;
    volume: number;
  }>({
    isPlaying: false,
    type: null,
    volume: 0.35,
  });

  // 1. Initial Data Load from Storage
  useEffect(() => {
    async function loadData() {
      const [
        savedSettings,
        savedSpaces,
        savedShortcuts,
        savedTasks,
        savedNotes,
        savedWidgets,
        savedSnippets,
        savedShield,
      ] = await Promise.all([
        storage.get<UserSettings>('settings', DEFAULT_SETTINGS),
        storage.get<FlowSpace[]>('flow_spaces', DEFAULT_FLOW_SPACES),
        storage.get<ShortcutItem[]>('shortcuts', DEFAULT_SHORTCUTS),
        storage.get<TaskItem[]>('tasks', DEFAULT_TASKS),
        storage.get<NoteItem[]>('notes', DEFAULT_NOTES),
        storage.get<WidgetLayoutItem[]>('widgets', DEFAULT_WIDGETS),
        storage.get<SnippetItem[]>('snippets', DEFAULT_SNIPPETS),
        storage.get<FocusShieldConfig>('focus_shield', DEFAULT_FOCUS_SHIELD),
      ]);

      setSettings(savedSettings);
      setFlowSpaces(savedSpaces);
      setShortcuts(savedShortcuts);
      setTasks(savedTasks);
      const cleanedWidgets = savedWidgets.filter((w) => !['snippets', 'habits', 'worldclock', 'sentinel', 'processes'].includes(w.id));
      for (const widget of DEFAULT_WIDGETS) {
        if (!cleanedWidgets.some((saved) => saved.id === widget.id)) cleanedWidgets.push(widget);
      }
      const layoutMigrated = await storage.get<boolean>('editorial_layout_v1', false);
      if (!layoutMigrated) {
        for (const widget of cleanedWidgets) {
          const fresh = DEFAULT_WIDGETS.find((item) => item.id === widget.id);
          if (fresh) { widget.colSpan = fresh.colSpan; widget.order = fresh.order; }
        }
        void storage.set('editorial_layout_v1', true);
      }
      setWidgets(cleanedWidgets);
      setSnippets(savedSnippets);
      setFocusShield(savedShield);
      setHydrated(true);
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    WeatherService.getWeather(settings.weatherUnit === 'celsius', false, settings.weatherLocation, settings.networkEnabled !== false)
      .then((value) => { if (!cancelled) setWeather(value); })
      .catch((error) => console.warn('Weather error:', error));
    return () => { cancelled = true; };
  }, [hydrated, settings.weatherUnit, settings.weatherLocation, settings.networkEnabled]);

  // Keep a stable profile for older backups; the Spaces interface is retired.
  const activeSpace = DEFAULT_FLOW_SPACES[0];

  // 3. Dynamic DOM Attributes for Theme, Accent, RTL, and Blur
  useEffect(() => {
    const root = document.documentElement;

    // Direction & Language
    root.setAttribute('lang', settings.language);
    root.setAttribute('dir', settings.language === 'fa' ? 'rtl' : 'ltr');

    // Theme Mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark =
      settings.themeMode === 'dark' ||
      (settings.themeMode === 'system' && prefersDark);

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Theme Preset & Blur
    root.setAttribute('data-theme-preset', settings.themePreset);
    root.setAttribute('data-glass-blur', settings.glassBlur);
    root.setAttribute('data-motion', settings.animationsEnabled ? 'on' : 'off');

    // Active Flow Space dynamic accent variables
    root.style.setProperty('--accent-color', '#4af3a2');
    root.style.setProperty('--accent-glow', 'rgba(74, 243, 162, .32)');
    root.style.setProperty('--accent-subtle', 'rgba(74, 243, 162, .12)');
    root.style.setProperty('--accent-secondary', '#43d9e8');
  }, [settings, activeSpace]);

  // 4. Global Pointer Spotlight Coordinates (throttled)
  useEffect(() => {
    if (!settings.animationsEnabled) return;

    let rAF: number | null = null;
    const handlePointerMove = (e: PointerEvent) => {
      if (rAF) return;
      rAF = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        rAF = null;
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rAF) window.cancelAnimationFrame(rAF);
    };
  }, [settings.animationsEnabled]);

  // 5. Actions
  const updateSettings = useCallback(async (newPartial: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      storage.set('settings', updated);
      return updated;
    });
  }, []);

  const setActiveSpaceId = useCallback(async (id: string) => {
    await updateSettings({ activeFlowSpaceId: id });
  }, [updateSettings]);

  const saveSpace = useCallback(async (space: FlowSpace) => {
    setFlowSpaces((previous) => {
      const updated = previous.some((item) => item.id === space.id)
        ? previous.map((item) => item.id === space.id ? space : item)
        : [...previous, space];
      storage.set('flow_spaces', updated);
      return updated;
    });
  }, []);

  const removeSpace = useCallback(async (id: string) => {
    setFlowSpaces((previous) => {
      if (previous.length <= 1) return previous;
      const updated = previous.filter((item) => item.id !== id);
      storage.set('flow_spaces', updated);
      return updated;
    });
    if (settings.activeFlowSpaceId === id) await updateSettings({ activeFlowSpaceId: flowSpaces.find((space) => space.id !== id)?.id || 'coding' });
  }, [settings.activeFlowSpaceId, flowSpaces, updateSettings]);

  const reorderSpaces = useCallback(async (ids: string[]) => {
    setFlowSpaces((previous) => {
      const updated = [...previous].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      storage.set('flow_spaces', updated);
      return updated;
    });
  }, []);

  const addShortcut = useCallback(async (item: Omit<ShortcutItem, 'id'>) => {
    const newItem: ShortcutItem = {
      ...item,
      id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      clicks: 0,
    };
    setShortcuts((prev) => {
      const updated = [newItem, ...prev];
      storage.set('shortcuts', updated);
      return updated;
    });
    if (activeSpace.customShortcuts) await saveSpace({ ...activeSpace, pinnedShortcutIds: [...activeSpace.pinnedShortcutIds, newItem.id] });
  }, [activeSpace, saveSpace]);

  const updateShortcut = useCallback(async (id: string, updates: Partial<ShortcutItem>) => {
    setShortcuts((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      storage.set('shortcuts', updated);
      return updated;
    });
  }, []);

  const removeShortcut = useCallback(async (id: string) => {
    setShortcuts((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      storage.set('shortcuts', updated);
      return updated;
    });
  }, []);

  const recordShortcutClick = useCallback(async (id: string) => {
    setShortcuts((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, clicks: (s.clicks || 0) + 1 } : s));
      storage.set('shortcuts', updated);
      return updated;
    });
  }, []);

  const addTask = useCallback(async (title: string, priority: 'low' | 'medium' | 'high' = 'medium', category = 'General') => {
    const newTask: TaskItem = {
      id: `t_${Date.now()}`,
      title,
      completed: false,
      priority,
      category,
      createdAt: Date.now(),
    };
    setTasks((prev) => {
      const updated = [newTask, ...prev];
      storage.set('tasks', updated);
      return updated;
    });
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
      storage.set('tasks', updated);
      return updated;
    });
  }, []);

  const removeTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      storage.set('tasks', updated);
      return updated;
    });
  }, []);

  const addNote = useCallback(async (title: string, content: string) => {
    const newNote: NoteItem = {
      id: `n_${Date.now()}`,
      title: title || 'Untitled Note',
      content,
      updatedAt: Date.now(),
    };
    setNotes((prev) => {
      const updated = [newNote, ...prev];
      storage.set('notes', updated);
      return updated;
    });
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
      storage.set('notes', updated);
      return updated;
    });
  }, []);

  const removeNote = useCallback(async (id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      storage.set('notes', updated);
      return updated;
    });
  }, []);

  const toggleWidget = useCallback(async (id: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
      storage.set('widgets', updated);
      return updated;
    });
  }, []);

  const updateWidgetLayout = useCallback(async (id: string, updates: Partial<WidgetLayoutItem>) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, ...updates } : w));
      storage.set('widgets', updated);
      return updated;
    });
  }, []);

  const reorderWidgets = useCallback(async (newWidgets: WidgetLayoutItem[]) => {
    setWidgets(newWidgets);
    await storage.set('widgets', newWidgets);
  }, []);

  const resetWidgetLayout = useCallback(async () => {
    setWidgets(DEFAULT_WIDGETS);
    await storage.set('widgets', DEFAULT_WIDGETS);
  }, []);

  // Snippets Handlers
  const addSnippet = useCallback(async (item: Omit<SnippetItem, 'id' | 'createdAt'>) => {
    const newSnippet: SnippetItem = {
      ...item,
      id: `snip_${Date.now()}`,
      createdAt: Date.now(),
    };
    setSnippets((prev) => {
      const updated = [newSnippet, ...prev];
      storage.set('snippets', updated);
      return updated;
    });
  }, []);

  const updateSnippet = useCallback(async (id: string, updates: Partial<SnippetItem>) => {
    setSnippets((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      storage.set('snippets', updated);
      return updated;
    });
  }, []);

  const removeSnippet = useCallback(async (id: string) => {
    setSnippets((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      storage.set('snippets', updated);
      return updated;
    });
  }, []);

  // Focus Shield Handlers
  const updateFocusShield = useCallback(async (updates: Partial<FocusShieldConfig>) => {
    setFocusShield((prev) => {
      const updated = { ...prev, ...updates };
      storage.set('focus_shield', updated);
      return updated;
    });
  }, []);

  const refreshWeather = useCallback(async (forcePrompt: boolean = false, locationOverride?: WeatherLocation | null) => {
    const w = await WeatherService.getWeather(settings.weatherUnit === 'celsius', forcePrompt, locationOverride === undefined ? settings.weatherLocation : locationOverride, settings.networkEnabled !== false);
    setWeather(w);
  }, [settings.weatherUnit, settings.weatherLocation, settings.networkEnabled]);

  const toggleSoundscape = useCallback((type: SoundscapeType = 'rain') => {
    if (soundscapeState.isPlaying && soundscapeState.type === type) {
      soundscapes.stop();
      setSoundscapeState((s) => ({ ...s, isPlaying: false, type: null }));
    } else {
      soundscapes.play(type);
      setSoundscapeState((s) => ({ ...s, isPlaying: true, type }));
    }
  }, [soundscapeState]);

  const setSoundscapeVolume = useCallback((volume: number) => {
    soundscapes.setVolume(volume);
    setSoundscapeState((s) => ({ ...s, volume }));
  }, []);

  // Export / Import
  const exportWorkspace = useCallback(async (): Promise<string> => {
    const keys = ['rss_channels', 'rss_cached_articles', 'tab_sessions', 'bookmark_meta', 'pomodoro_state', 'habit_tracker'];
    const values = await Promise.all(keys.map((key) => storage.get<unknown>(key, null)));
    const extras = Object.fromEntries(keys.map((key, index) => [key, values[index]]));
    const exportData: WorkspaceExportData = {
      version: '2.0.0',
      timestamp: Date.now(),
      settings,
      flowSpaces,
      shortcuts,
      tasks,
      notes,
      widgets,
      snippets,
      focusShield,
      extras,
    };
    return JSON.stringify(exportData, null, 2);
  }, [settings, flowSpaces, shortcuts, tasks, notes, widgets, snippets, focusShield]);

  const importWorkspace = useCallback(async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed: WorkspaceExportData = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object' || !parsed.settings ||
          !['en', 'fa'].includes(parsed.settings.language) ||
          !Array.isArray(parsed.flowSpaces) || !Array.isArray(parsed.shortcuts) ||
          !Array.isArray(parsed.tasks) || !Array.isArray(parsed.notes) || !Array.isArray(parsed.widgets) ||
          parsed.flowSpaces.length > 100 || parsed.shortcuts.length > 10000 || parsed.widgets.length > 100 ||
          !parsed.flowSpaces.every((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && /^#[0-9a-f]{6}$/i.test(item.accentColor) && Array.isArray(item.activeWidgetIds) && Array.isArray(item.pinnedShortcutIds)) ||
          !parsed.shortcuts.every((item) => { try { return item && typeof item.id === 'string' && typeof item.title === 'string' && /^https?:$/.test(new URL(item.url).protocol); } catch { return false; } }) ||
          !parsed.widgets.every((item) => item && typeof item.id === 'string' && typeof item.enabled === 'boolean')) return false;

      if (parsed.settings) {
        setSettings(parsed.settings);
        await storage.set('settings', parsed.settings);
      }
      if (parsed.flowSpaces) {
        setFlowSpaces(parsed.flowSpaces);
        await storage.set('flow_spaces', parsed.flowSpaces);
      }
      if (parsed.shortcuts) {
        setShortcuts(parsed.shortcuts);
        await storage.set('shortcuts', parsed.shortcuts);
      }
      if (parsed.tasks) {
        setTasks(parsed.tasks);
        await storage.set('tasks', parsed.tasks);
      }
      if (parsed.notes) {
        setNotes(parsed.notes);
        await storage.set('notes', parsed.notes);
      }
      if (parsed.widgets) {
        setWidgets(parsed.widgets);
        await storage.set('widgets', parsed.widgets);
      }
      if (Array.isArray(parsed.snippets)) { setSnippets(parsed.snippets); await storage.set('snippets', parsed.snippets); }
      if (parsed.focusShield && Array.isArray(parsed.focusShield.blocklist)) { setFocusShield(parsed.focusShield); await storage.set('focus_shield', parsed.focusShield); }
      if (parsed.extras && typeof parsed.extras === 'object') {
        for (const key of ['rss_channels', 'rss_cached_articles', 'tab_sessions', 'bookmark_meta', 'pomodoro_state', 'habit_tracker']) {
          if (key in parsed.extras) await storage.set(key, parsed.extras[key]);
        }
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        settings,
        updateSettings,
        flowSpaces,
        activeSpace,
        setActiveSpaceId,
        saveSpace,
        removeSpace,
        reorderSpaces,
        shortcuts,
        addShortcut,
        updateShortcut,
        removeShortcut,
        recordShortcutClick,
        tasks,
        addTask,
        toggleTask,
        removeTask,
        notes,
        addNote,
        updateNote,
        removeNote,
        widgets,
        toggleWidget,
        updateWidgetLayout,
        reorderWidgets,
        resetWidgetLayout,
        snippets,
        addSnippet,
        updateSnippet,
        removeSnippet,
        focusShield,
        updateFocusShield,
        weather,
        refreshWeather,
        commandPaletteOpen,
        setCommandPaletteOpen,
        settingsOpen,
        setSettingsOpen,
        soundscapeState,
        toggleSoundscape,
        setSoundscapeVolume,
        exportWorkspace,
        importWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
};
