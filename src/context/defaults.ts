import { FlowSpace, ShortcutItem, TaskItem, NoteItem, WidgetLayoutItem, UserSettings, SnippetItem, FocusShieldConfig } from '../types';

export const DEFAULT_FLOW_SPACES: FlowSpace[] = [
  {
    id: 'coding',
    name: 'Coding',
    nameFa: 'برنامه‌نویسی',
    icon: 'Code2',
    accentColor: '#4af3a2',
    accentGlow: 'rgba(74, 243, 162, 0.32)',
    description: 'Your links, tools and ideas in one command center',
    descriptionFa: 'لینک‌ها، ابزارها و ایده‌ها در یک مرکز فرمان',
    pinnedShortcutIds: ['s1', 's2', 's7', 's9'],
    activeWidgetIds: ['tasks', 'notes', 'pomodoro', 'bookmarks'],
  },
  {
    id: 'research',
    name: 'Research',
    nameFa: 'تحقیق و مطالعه',
    icon: 'BookOpen',
    accentColor: '#10b981',
    accentGlow: 'rgba(16, 185, 129, 0.45)',
    description: 'Literature, AI reasoning & knowledge',
    descriptionFa: 'مطالعه، ابزارهای هوش مصنوعی و یادداشت‌ها',
    pinnedShortcutIds: ['s2', 's3', 's5'],
    activeWidgetIds: ['notes', 'tasks', 'quote'],
  },
  {
    id: 'personal',
    name: 'Personal',
    nameFa: 'شخصی',
    icon: 'Coffee',
    accentColor: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    description: 'Media, community, relaxation',
    descriptionFa: 'رسانه، شبکه‌های اجتماعی و اوقات فراغت',
    pinnedShortcutIds: ['s4', 's8', 's6'],
    activeWidgetIds: ['zen', 'calendar', 'recent'],
  },
  {
    id: 'focus',
    name: 'Deep Focus',
    nameFa: 'تمرکز عمیق',
    icon: 'Zap',
    accentColor: '#ec4899',
    accentGlow: 'rgba(236, 72, 153, 0.45)',
    description: 'Zero distractions, pure output',
    descriptionFa: 'بدون حواس‌پرتی، خروجی خالص و تمرکز',
    pinnedShortcutIds: ['s1', 's5'],
    activeWidgetIds: ['pomodoro', 'tasks'],
  },
];

export const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  { id: 's1', title: 'GitHub', url: 'https://github.com', category: 'dev', clicks: 42 },
  { id: 's2', title: 'Claude', url: 'https://claude.ai', category: 'ai', clicks: 35 },
  { id: 's3', title: 'ChatGPT', url: 'https://chat.openai.com', category: 'ai', clicks: 28 },
  { id: 's4', title: 'YouTube', url: 'https://youtube.com', category: 'entertainment', clicks: 50 },
  { id: 's5', title: 'Notion', url: 'https://notion.so', category: 'work', clicks: 22 },
  { id: 's6', title: 'Figma', url: 'https://figma.com', category: 'work', clicks: 18 },
  { id: 's7', title: 'Vercel', url: 'https://vercel.com', category: 'dev', clicks: 15 },
  { id: 's8', title: 'Reddit', url: 'https://reddit.com', category: 'social', clicks: 14 },
  { id: 's9', title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'dev', clicks: 12 },
  { id: 's10', title: 'Google Drive', url: 'https://drive.google.com', category: 'work', clicks: 9 },
];

export const DEFAULT_TASKS: TaskItem[] = [
  { id: 't1', title: 'Review Chrome extension pull requests', completed: false, priority: 'high', category: 'Work', createdAt: Date.now() - 3600000 },
  { id: 't2', title: 'Ship PIMXDASH Command Center v1.0', completed: false, priority: 'high', category: 'Project', createdAt: Date.now() - 7200000 },
  { id: 't3', title: 'Explore modern spatial UI techniques', completed: true, priority: 'medium', category: 'Learning', createdAt: Date.now() - 86400000 },
];

export const DEFAULT_NOTES: NoteItem[] = [
  {
    id: 'n1',
    title: 'Architecture Ideas',
    content: '1. PIMXDASH Prism Core\n2. Bookmark Atlas\n3. Search across your browser',
    updatedAt: Date.now(),
    pinned: true,
  },
  {
    id: 'n2',
    title: 'Quick Snippet',
    content: 'const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;',
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
];

export const DEFAULT_WIDGETS: WidgetLayoutItem[] = [
  { id: 'tasks', enabled: true, colSpan: 5, order: 1 },
  { id: 'notes', enabled: true, colSpan: 7, order: 2 },
  { id: 'pomodoro', enabled: true, colSpan: 4, order: 3 },
  { id: 'weather', enabled: true, colSpan: 4, order: 4 },
  { id: 'bookmarks', enabled: true, colSpan: 4, order: 5 },
  { id: 'recent', enabled: true, colSpan: 5, order: 6 },
  { id: 'calendar', enabled: true, colSpan: 7, order: 7 },
  { id: 'zen', enabled: true, colSpan: 4, order: 8 },
  { id: 'countdown', enabled: true, colSpan: 4, order: 9 },
  { id: 'quote', enabled: true, colSpan: 4, order: 10 },
  { id: 'aihub', enabled: true, colSpan: 6, order: 11 },
  { id: 'netpulse', enabled: true, colSpan: 6, order: 12 },
  { id: 'matrix', enabled: true, colSpan: 4, order: 13 },
  { id: 'tabs', enabled: true, colSpan: 4, order: 14 },
  { id: 'converter', enabled: true, colSpan: 4, order: 15 },
];

export const DEFAULT_SNIPPETS: SnippetItem[] = [
  {
    id: 's1',
    title: 'Git Undo Last Commit (Keep Changes)',
    content: 'git reset --soft HEAD~1',
    category: 'terminal',
    language: 'bash',
    tags: ['git', 'cli'],
    createdAt: Date.now(),
  },
  {
    id: 's2',
    title: 'Deep Work Prompt Template',
    content: 'You are an elite expert in this topic. Analyze this codebase, identify bottlenecks, and propose the cleanest implementation following production standards.',
    category: 'prompt',
    language: 'markdown',
    tags: ['ai', 'prompt'],
    createdAt: Date.now(),
  },
  {
    id: 's3',
    title: 'CSS Glassmorphism Backdrop',
    content: 'background: rgba(255, 255, 255, 0.05);\nbackdrop-filter: blur(16px);\nborder: 1px solid rgba(255, 255, 255, 0.1);',
    category: 'code',
    language: 'css',
    tags: ['ui', 'css'],
    createdAt: Date.now(),
  },
  {
    id: 's4',
    title: 'Kill Port (Windows PowerShell)',
    content: 'Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force',
    category: 'terminal',
    language: 'powershell',
    tags: ['windows', 'dev'],
    createdAt: Date.now(),
  },
];

export const DEFAULT_FOCUS_SHIELD: FocusShieldConfig = {
  enabled: false,
  blocklist: ['twitter.com', 'x.com', 'instagram.com', 'reddit.com', 'tiktok.com'],
  strictMode: false,
};

export const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'dark',
  themePreset: 'obsidian',
  language: 'en',
  searchEngine: 'google',
  clockFormat: '24h',
  showSeconds: false,
  showGreeting: true,
  userName: 'Creator',
  weatherUnit: 'celsius',
  glassBlur: 'medium',
  animationsEnabled: true,
  soundscapesEnabled: false,
  networkEnabled: true,
  onboardingCompleted: true,
  activeFlowSpaceId: 'coding',
};
