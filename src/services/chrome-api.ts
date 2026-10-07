/**
 * Safe Chrome API Wrappers
 * Handles bookmarks, history, tabs and permissions with zero UI crashes.
 */

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
  dateAdded?: number;
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  lastVisitTime: number;
}

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  active: boolean;
  audible?: boolean;
}

export class ChromeApiService {
  static isExtension(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.id;
  }

  static async hasPermission(permission: string): Promise<boolean> {
    if (!this.isExtension() || !chrome.permissions) return false;
    return new Promise((resolve) => {
      try {
        chrome.permissions.contains({ permissions: [permission as any] }, (result) => {
          resolve(!!result);
        });
      } catch {
        resolve(false);
      }
    });
  }

  static async requestPermission(permission: string): Promise<boolean> {
    if (!this.isExtension() || !chrome.permissions) return false;
    return new Promise((resolve) => {
      try {
        chrome.permissions.request({ permissions: [permission as any] }, (granted) => {
          resolve(!!granted);
        });
      } catch {
        resolve(false);
      }
    });
  }

  // --- BOOKMARKS ---
  static async getBookmarks(): Promise<BookmarkNode[]> {
    if (this.isExtension() && chrome.bookmarks) {
      try {
        return await new Promise((resolve) => {
          chrome.bookmarks.getTree((tree) => {
            if (chrome.runtime?.lastError || !tree || !tree.length) {
              console.warn('[PIMXDASH] chrome.bookmarks error or empty:', chrome.runtime?.lastError);
              resolve(this.getMockBookmarks());
            } else {
              // Pass all root children (Bookmarks Bar, Other Bookmarks, Mobile Bookmarks)
              const allNodes = tree[0]?.children ? tree[0].children : tree;
              resolve(allNodes);
            }
          });
        });
      } catch (e) {
        console.warn('[PIMXDASH] Error fetching bookmarks:', e);
        return this.getMockBookmarks();
      }
    }
    return this.getMockBookmarks();
  }

  // --- HISTORY / RECENTLY VISITED ---
  static async getRecentlyVisited(limit: number = 10): Promise<HistoryItem[]> {
    if (this.isExtension() && chrome.history) {
      try {
        return await new Promise((resolve) => {
          chrome.history.search(
            { text: '', maxResults: limit, startTime: Date.now() - 7 * 24 * 60 * 60 * 1000 },
            (items) => {
              if (chrome.runtime?.lastError || !items) {
                resolve(this.getMockHistory());
              } else {
                resolve(
                  items
                    .filter((item) => !!item.url && !item.url.startsWith('chrome://'))
                    .map((item) => ({
                      id: item.id,
                      url: item.url || '',
                      title: item.title || item.url || 'Untitled',
                      lastVisitTime: item.lastVisitTime || Date.now(),
                    }))
                );
              }
            }
          );
        });
      } catch (e) {
        console.warn('[PIMXDASH] Error fetching history:', e);
        return this.getMockHistory();
      }
    }
    return this.getMockHistory();
  }

  // --- ACTIVE TABS RADAR ---
  static async getOpenTabs(): Promise<TabInfo[]> {
    if (this.isExtension() && chrome.tabs) {
      try {
        return await new Promise((resolve) => {
          chrome.tabs.query({}, (tabs) => {
            if (chrome.runtime?.lastError || !tabs) {
              resolve(this.getMockTabs());
            } else {
              resolve(
                tabs.map((t) => ({
                  id: t.id || Math.random(),
                  title: t.title || 'Tab',
                  url: t.url || '',
                  favIconUrl: t.url ? this.getFaviconUrl(t.url, 32) : undefined,
                  active: !!t.active,
                  audible: !!t.audible,
                }))
              );
            }
          });
        });
      } catch (e) {
        console.warn('[PIMXDASH] Error fetching tabs:', e);
        return this.getMockTabs();
      }
    }
    return this.getMockTabs();
  }

  static async switchToTab(tabId: number): Promise<void> {
    if (this.isExtension() && chrome.tabs) {
      try {
        chrome.tabs.update(tabId, { active: true }, (tab) => {
          if (!chrome.runtime.lastError && tab?.windowId !== undefined) chrome.windows.update(tab.windowId, { focused: true });
        });
      } catch (e) {
        console.warn('Cannot switch to tab', e);
      }
    }
  }

  static async closeDuplicateTabs(): Promise<number> {
    const tabs = await this.getOpenTabs();
    const seenUrls = new Set<string>();
    const toClose: number[] = [];

    for (const tab of tabs) {
      if (!tab.url || tab.url.startsWith('chrome://')) continue;
      if (seenUrls.has(tab.url)) {
        toClose.push(tab.id);
      } else {
        seenUrls.add(tab.url);
      }
    }

    if (this.isExtension() && chrome.tabs && toClose.length > 0) {
      chrome.tabs.remove(toClose);
    }
    return toClose.length;
  }

  // --- FAVICON RESOLVER ---
  // 3-stage: 1) Chrome internal _favicon, 2) Google S2 (handled by SmartFavicon), 3) letter badge
  static getFaviconUrl(url: string, size: number = 64): string {
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) return '';
      if (this.isExtension()) {
        try {
          const favicon = new URL(chrome.runtime.getURL('/_favicon/'));
          favicon.searchParams.set('pageUrl', url);
          favicon.searchParams.set('size', String(size));
          return favicon.toString();
        } catch {
          // fall through to google
        }
      }
      const domain = parsed.hostname.replace(/^www\./, '');
      if (!domain) return '';
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${Math.min(128, Math.max(16, size))}`;
    } catch {
      return '';
    }
  }

  static getDomainInitials(url: string): string {
    try {
      const parsed = new URL(url);
      const parts = parsed.hostname.replace(/^www\./, '').split('.');
      if (parts.length > 0 && parts[0]) {
        return parts[0].slice(0, 2).toUpperCase();
      }
    } catch {
      // fallback
    }
    return 'URL';
  }

  // --- MOCK FALLBACKS FOR DEV & UNGRANTED STATES ---
  private static getMockBookmarks(): BookmarkNode[] {
    return [
      {
        id: '1',
        title: 'Work & Development',
        children: [
          { id: '11', title: 'GitHub', url: 'https://github.com' },
          { id: '12', title: 'Vercel Dashboard', url: 'https://vercel.com' },
          { id: '13', title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com' },
          { id: '14', title: 'React Docs', url: 'https://react.dev' },
        ],
      },
      {
        id: '2',
        title: 'AI & Intelligence',
        children: [
          { id: '21', title: 'ChatGPT', url: 'https://chat.openai.com' },
          { id: '22', title: 'Claude AI', url: 'https://claude.ai' },
          { id: '23', title: 'Google Gemini', url: 'https://gemini.google.com' },
        ],
      },
      {
        id: '3',
        title: 'Design Inspiration',
        children: [
          { id: '31', title: 'Dribbble', url: 'https://dribbble.com' },
          { id: '32', title: 'Mobbin Design', url: 'https://mobbin.com' },
          { id: '33', title: 'Godly Websites', url: 'https://godly.website' },
        ],
      },
    ];
  }

  private static getMockHistory(): HistoryItem[] {
    const now = Date.now();
    return [
      { id: 'h1', title: 'GitHub: Where the world builds software', url: 'https://github.com', lastVisitTime: now - 1000 * 60 * 4 },
      { id: 'h2', title: 'Claude: Anthropic AI Workspace', url: 'https://claude.ai', lastVisitTime: now - 1000 * 60 * 18 },
      { id: 'h3', title: 'Figma: Collaborative Interface Design', url: 'https://figma.com', lastVisitTime: now - 1000 * 60 * 42 },
      { id: 'h4', title: 'YouTube: Music & Tech Streams', url: 'https://youtube.com', lastVisitTime: now - 1000 * 60 * 85 },
      { id: 'h5', title: 'Notion: All-in-one Connected Workspace', url: 'https://notion.so', lastVisitTime: now - 1000 * 60 * 140 },
    ];
  }

  private static getMockTabs(): TabInfo[] {
    return [
      { id: 1, title: 'GitHub - Pull Requests', url: 'https://github.com/pulls', active: true, audible: false },
      { id: 2, title: 'Lo-Fi Chill Beats Stream', url: 'https://youtube.com/watch', active: false, audible: true },
      { id: 3, title: 'Vercel Deployment Preview', url: 'https://vercel.com', active: false, audible: false },
      { id: 4, title: 'GitHub - Pull Requests (Duplicate)', url: 'https://github.com/pulls', active: false, audible: false },
    ];
  }
}
