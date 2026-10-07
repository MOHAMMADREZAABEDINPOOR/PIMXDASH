import { storage } from './storage';

export interface TechNewsItem {
  id: number | string;
  title: string;
  url: string;
  source: string;
  score?: number;
  commentsCount?: number;
  timeAgo: string;
}

const NEWS_CACHE_KEY = 'cached_tech_news';
const NEWS_CACHE_TTL = 20 * 60 * 1000; // 20 minutes

export class NewsService {
  static async getTopStories(allowNetwork: boolean = true): Promise<TechNewsItem[]> {
    let cached: { timestamp: number; items: TechNewsItem[] } | null = null;
    try {
      cached = await storage.get<{ timestamp: number; items: TechNewsItem[] } | null>(
        NEWS_CACHE_KEY,
        null
      );
      if (cached && Date.now() - cached.timestamp < NEWS_CACHE_TTL && cached.items.length > 0) {
        return cached.items;
      }
      if (!allowNetwork) return cached?.items || [];

      // Fetch top story IDs from Hacker News API (fast, open, public)
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=12&orderBy="$key"', {
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) throw new Error('HN fetch failed');
      const ids: number[] = await res.json();
      const topIds = ids.slice(0, 10);

      const itemPromises = topIds.map(async (id) => {
        try {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
            signal: AbortSignal.timeout(3000),
          });
          if (itemRes.ok) return await itemRes.json();
        } catch {
          return null;
        }
        return null;
      });

      const rawItems = await Promise.all(itemPromises);
      const items: TechNewsItem[] = rawItems
        .filter((it) => it && it.title && it.url)
        .map((it) => {
          const minsAgo = Math.floor((Date.now() / 1000 - it.time) / 60);
          const timeAgo = minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ago`;
          let domain = 'HackerNews';
          try {
            domain = new URL(it.url).hostname.replace(/^www\./, '');
          } catch {}

          return {
            id: it.id,
            title: it.title,
            url: it.url,
            source: domain,
            score: it.score || 1,
            commentsCount: it.descendants || 0,
            timeAgo,
          };
        });

      if (items.length > 0) {
        await storage.set(NEWS_CACHE_KEY, { timestamp: Date.now(), items });
        return items;
      }

      return cached?.items || [];
    } catch {
      return cached?.items || [];
    }
  }

}
