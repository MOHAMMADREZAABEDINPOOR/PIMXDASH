export type ThemeMode = 'dark' | 'light' | 'system';

export type ThemePreset =
  | 'obsidian'     // Pure dark OLED
  | 'aurora'       // Deep teal & amethyst
  | 'cyberpunk'    // Cyan & neon magenta
  | 'ocean'        // Midnight navy & cobalt
  | 'sunset'       // Twilight amber & terracotta
  | 'forest'       // Sage & pine
  | 'glass'        // Ultra-translucent frosted
  | 'monochrome';  // Grayscale minimal

export type Language = 'en' | 'fa';

export interface FlowSpace {
  id: string;
  name: string;
  nameFa: string;
  icon: string; // Lucide icon name
  accentColor: string;
  accentGlow: string;
  description: string;
  descriptionFa: string;
  pinnedShortcutIds: string[];
  customShortcuts?: boolean;
  activeWidgetIds: string[];
  customWidgets?: boolean;
}

export interface ShortcutItem {
  id: string;
  title: string;
  url: string;
  category: 'work' | 'social' | 'entertainment' | 'dev' | 'ai' | 'finance' | 'general';
  iconUrl?: string;
  customIcon?: string;
  pinned?: boolean;
  clicks?: number;
}

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  pinned?: boolean;
}

export interface WeatherData {
  temp: number;
  condition: string;
  conditionCode: number;
  city: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  isDay: boolean;
  forecast?: {
    day: string;
    tempMax: number;
    tempMin: number;
    conditionCode: number;
  }[];
  lastUpdated: number;
  source?: 'location' | 'city' | 'fallback';
  unavailable?: boolean;
}

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export type WidgetId =
  | 'tasks'
  | 'notes'
  | 'pomodoro'
  | 'bookmarks'
  | 'recent'
  | 'calendar'
  | 'worldclock'
  | 'zen'
  | 'quote'
  | 'habits'
  | 'aihub'
  | 'countdown'
  | 'sentinel'
  | 'weather'
  | 'snippets'
  | 'matrix'
  | 'processes'
  | 'netpulse'
  | 'tabs'
  | 'converter';

export interface WidgetLayoutItem {
  id: WidgetId;
  enabled: boolean;
  colSpan: number; // 1 to 12
  rowSpan?: number;
  order: number;
}

export interface SnippetItem {
  id: string;
  title: string;
  content: string;
  category: 'code' | 'terminal' | 'prompt' | 'text';
  language?: string;
  tags?: string[];
  createdAt: number;
}

export interface RssFeedItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet?: string;
  read?: boolean;
  starred?: boolean;
}

export interface RssFeedSource {
  id: string;
  name: string;
  url: string;
  category: string;
  icon?: string;
}

export interface FocusShieldConfig {
  enabled: boolean;
  blocklist: string[];
  redirectUrl?: string;
  strictMode?: boolean; // completely close tab or redirect
  pauseUntil?: number;
  autoOnPomodoro?: boolean;
  sessionUntil?: number;
}

export interface UserSettings {
  themeMode: ThemeMode;
  themePreset: ThemePreset;
  language: Language;
  searchEngine: 'google' | 'duckduckgo' | 'brave' | 'bing' | 'github' | 'chatgpt';
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  showGreeting: boolean;
  userName: string;
  weatherUnit: 'celsius' | 'fahrenheit';
  weatherLocation?: WeatherLocation | null;
  glassBlur: 'off' | 'subtle' | 'medium' | 'high';
  animationsEnabled: boolean;
  soundscapesEnabled: boolean;
  networkEnabled?: boolean;
  onboardingCompleted: boolean;
  activeFlowSpaceId: string;
  wallpaperType?: 'default' | 'cosmic' | 'aurora' | 'rain' | 'sunset' | 'forest' | 'oled' | 'custom';
  customWallpaperUrl?: string;
  layoutTemplate?: 'balanced' | 'developer' | 'zen' | 'productivity';
}

export interface WorkspaceExportData {
  version: string;
  timestamp: number;
  settings: UserSettings;
  flowSpaces: FlowSpace[];
  shortcuts: ShortcutItem[];
  tasks: TaskItem[];
  notes: NoteItem[];
  widgets: WidgetLayoutItem[];
  snippets?: SnippetItem[];
  focusShield?: FocusShieldConfig;
  extras?: Record<string, unknown>;
}
