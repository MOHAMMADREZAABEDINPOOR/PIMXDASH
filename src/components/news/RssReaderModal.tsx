import React, { useState, useEffect, useCallback } from 'react';
import { X, Rss, ExternalLink, RefreshCw, Plus, Search, Bookmark, Check, BookOpen } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { storage } from '../../services/storage';

interface RssItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
  read?: boolean;
  starred?: boolean;
}

interface FeedChannel {
  id: string;
  name: string;
  url: string;
  category: string;
}

const DEFAULT_CHANNELS: FeedChannel[] = [
  { id: 'hn', name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'Tech & Startups' },
  { id: 'devto', name: 'Dev.to Community', url: 'https://dev.to/feed', category: 'Coding' },
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Venture & AI' },
  { id: 'verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Gadgets & Culture' },
];

export const RssReaderModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { settings } = useWorkspace();
  const isFa = settings.language === 'fa';

  const [channels, setChannels] = useState<FeedChannel[]>(DEFAULT_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [articles, setArticles] = useState<RssItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [feedError, setFeedError] = useState('');

  // Add Custom Feed
  const [isAddingFeed, setIsAddingFeed] = useState(false);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');

  // 1. Load Channels & Cached Articles
  useEffect(() => {
    storage.get<FeedChannel[]>('rss_channels', DEFAULT_CHANNELS).then((saved) => {
      setChannels(saved);
    });

    storage.get<RssItem[]>('rss_cached_articles', []).then((cached) => {
      if (cached && cached.length > 0) {
        setArticles(cached);
      } else {
        fetchFeeds();
      }
    });
  }, []);

  // Fetch every configured source; preserve local reading state across refreshes.
  const fetchFeeds = useCallback(async (sourceFeeds: FeedChannel[] = channels) => {
    setIsLoading(true);
    const stored = await storage.get<RssItem[]>('rss_cached_articles', []);
    if (settings.networkEnabled === false) { setArticles(stored); setFeedError(isFa ? 'دریافت آنلاین غیرفعال است.' : 'Online content is paused.'); setIsLoading(false); return; }
    const states = new Map(stored.map((item) => [item.id, item]));
    const batches = await Promise.all(sourceFeeds.map(async (feed) => {
      try {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`, { signal: AbortSignal.timeout(7000) });
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items)) {
            return data.items.slice(0, 8).map((item: any, i: number) => ({
              id: `${feed.id}_${item.guid || item.link || i}`,
              title: item.title || 'Untitled',
              link: item.link || '#',
              source: feed.name,
              pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent',
              snippet: item.description ? item.description.replace(/<[^>]*>?/gm, '').slice(0, 140) + '...' : '',
              read: states.get(`${feed.id}_${item.guid || item.link || i}`)?.read || false,
              starred: states.get(`${feed.id}_${item.guid || item.link || i}`)?.starred || false,
            }));
          }
        }
      } catch (e) {
        console.warn(`Could not fetch feed: ${feed.name}`, e);
      }
      return [];
    }));
    const fetchedItems = batches.flat();

    if (fetchedItems.length > 0) {
      setArticles(fetchedItems);
      await storage.set('rss_cached_articles', fetchedItems);
      setFeedError('');
    } else {
      setArticles(stored);
      setFeedError(isFa ? 'دریافت فیدها ممکن نشد؛ آخرین نسخهٔ ذخیره‌شده نمایش داده می‌شود.' : 'Feeds are unavailable; showing saved articles.');
    }
    setIsLoading(false);
  }, [channels, isFa, settings.networkEnabled]);

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedName.trim() || !/^https:\/\//i.test(newFeedUrl.trim())) return;

    const newChannel: FeedChannel = {
      id: `custom_${Date.now()}`,
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      category: 'Custom',
    };

    const updated = [...channels, newChannel];
    setChannels(updated);
    storage.set('rss_channels', updated);
    setNewFeedName('');
    setNewFeedUrl('');
    setIsAddingFeed(false);
    void fetchFeeds(updated);
  };

  const markAsRead = (id: string) => {
    setArticles((prev) => { const next = prev.map((a) => (a.id === id ? { ...a, read: true } : a)); void storage.set('rss_cached_articles', next); return next; });
  };

  const filteredArticles = articles.filter((item) => {
    const matchesChannel =
      selectedChannelId === 'all' ||
      item.source.toLowerCase().includes(selectedChannelId.toLowerCase());
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch && (!unreadOnly || !item.read);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-bg-surface/95 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {isFa ? 'فیدخوان و اخبار آفلاین RSS' : 'Offline RSS Feed & Tech Radar'}
              </h2>
              <p className="text-xs text-text-muted">
                {isFa
                  ? 'برترین اخبار دنیای نرم‌افزار، مقالات و منابع با قابلیت کش محلی و اضافه کردن منبع دلخواه'
                  : 'Curated developer updates, engineering feeds & custom RSS channels'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchFeeds()}
              disabled={isLoading}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass transition-colors border border-border-subtle/50"
              title="Refresh Feeds"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-accent' : ''}`} />
            </button>

            <button
              onClick={() => setIsAddingFeed(!isAddingFeed)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>{isFa ? 'منبع جدید' : 'Add Feed'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Feed Drawer */}
        {isAddingFeed && (
          <form onSubmit={handleAddFeed} className="p-4 bg-bg-glass/80 border-b border-border-subtle flex flex-col sm:flex-row gap-3 items-end animate-slideDown">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isFa ? 'نام منبع' : 'Channel Name'}
              </label>
              <input
                type="text"
                required
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
                placeholder="e.g., Ars Technica"
                className="w-full px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex-[2] w-full">
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isFa ? 'آدرس URL فید RSS' : 'RSS Feed URL (XML / RSS)'}
              </label>
              <input
                type="url"
                required
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="w-full px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddingFeed(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-text-primary"
              >
                {isFa ? 'لغو' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold"
              >
                {isFa ? 'افزودن' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="px-6 py-3 border-b border-border-subtle/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در اخبار...' : 'Filter stories...'}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setSelectedChannelId('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedChannelId === 'all'
                  ? 'bg-accent/20 border border-accent/40 text-accent'
                  : 'bg-bg-glass text-text-muted hover:text-text-primary border border-border-subtle/50'
              }`}
            >
              {isFa ? 'همه منابع' : 'All Feeds'}
            </button>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.name)}
                className={`px-3 py-1 rounded-lg text-xs font-medium truncate max-w-[140px] transition-all ${
                  selectedChannelId === ch.name
                    ? 'bg-accent/20 border border-accent/40 text-accent'
                    : 'bg-bg-glass text-text-muted hover:text-text-primary border border-border-subtle/50'
                }`}
              >
                {ch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between"><button type="button" onClick={() => setUnreadOnly(!unreadOnly)} className={`text-xs rounded-lg px-2.5 py-1.5 ${unreadOnly ? 'bg-accent/20 text-accent' : 'bg-bg-glass text-text-muted'}`}>{isFa ? 'فقط خوانده‌نشده‌ها' : 'Unread only'}</button>{selectedChannelId !== 'all' && <button type="button" onClick={() => { const next = channels.filter((feed) => feed.name !== selectedChannelId); setChannels(next); void storage.set('rss_channels', next); setSelectedChannelId('all'); }} className="text-xs text-rose-400">{isFa ? 'حذف منبع' : 'Remove source'}</button>}</div>
          {feedError && <p className="text-xs text-amber-300">{feedError}</p>}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs">
              {isLoading
                ? (isFa ? 'در حال همگام‌سازی فیدها...' : 'Syncing feeds...')
                : (isFa ? 'موردی یافت نشد.' : 'No stories found.')}
            </div>
          ) : (
            filteredArticles.map((article) => (
              <a
                key={article.id}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => markAsRead(article.id)}
                className={`group block p-4 rounded-xl border transition-all ${
                  article.read
                    ? 'bg-bg-glass/30 border-border-subtle/40 opacity-75'
                    : 'bg-bg-glass/70 hover:bg-bg-glass border-border-subtle/70 hover:border-border-glow'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/20">
                        {article.source}
                      </span>
                      <span className="text-[11px] text-text-muted font-mono">
                        {article.pubDate}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                      {article.title}
                    </h4>

                    {article.snippet && (
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 leading-relaxed">
                        {article.snippet}
                      </p>
                    )}
                  </div>

                  <div className="p-2 rounded-xl text-text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors shrink-0">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
