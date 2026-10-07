import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Bookmark,
  ExternalLink,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Upload,
  Pin,
  Check,
  Folder,
} from 'lucide-react';
import { ChromeApiService } from '../../services/chrome-api';
import {
  BookmarkCategorizer,
  CategorizedBookmark,
  BOOKMARK_CATEGORIES,
  BookmarkCategoryKey,
} from '../../services/bookmark-categorizer';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations, formatBilingualNumber } from '../../i18n/useTranslation';
import { SmartFavicon } from '../common/SmartFavicon';

interface BookmarksWidgetProps {
  onOpenHub?: () => void;
}

export const BookmarksWidget: React.FC<BookmarksWidgetProps> = ({ onOpenHub }) => {
  const { settings, addShortcut } = useWorkspace();
  const [bookmarks, setBookmarks] = useState<CategorizedBookmark[]>([]);
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<BookmarkCategoryKey | 'all'>('all');
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';

  const loadBookmarks = async () => {
    const has = await ChromeApiService.hasPermission('bookmarks');
    setHasPermission(has || !ChromeApiService.isExtension());

    const tree = await ChromeApiService.getBookmarks();
    const processed = BookmarkCategorizer.processBookmarkTree(tree);
    setBookmarks(processed);
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleGrantPermission = async () => {
    const granted = await ChromeApiService.requestPermission('bookmarks');
    setHasPermission(granted);
    if (granted) {
      loadBookmarks();
    }
  };

  const handleImportHtml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const html = event.target?.result as string;
      const imported = BookmarkCategorizer.parseHtmlBookmarks(html);
      if (imported.length > 0) {
        setBookmarks((prev) => [...imported, ...prev]);
      }
    };
    reader.readAsText(file);
  };

  const handlePin = (b: CategorizedBookmark) => {
    addShortcut({
      title: b.title,
      url: b.url,
      category: (b.category === 'other' ? 'general' : b.category) as any,
    });
    setPinnedId(b.id);
    setTimeout(() => setPinnedId(null), 2000);
  };

  // Group counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookmarks.length };
    for (const b of bookmarks) {
      counts[b.category] = (counts[b.category] || 0) + 1;
    }
    return counts;
  }, [bookmarks]);

  const filtered = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
      const q = filter.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.domain.toLowerCase().includes(q) ||
        b.folder.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [bookmarks, activeCategory, filter]);

  const displayedBookmarks = isExpanded ? filtered : filtered.slice(0, 6);
  const categoriesList = Object.keys(BOOKMARK_CATEGORIES) as BookmarkCategoryKey[];

  return (
    <div className="pimx-work-card pimx-bookmarks-card flex flex-col h-full p-4 sm:p-5 rounded-3xl glass-panel border border-border-subtle select-none transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-accent/20 text-accent">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-text-primary tracking-wide uppercase">
                {isFa ? 'نشانک‌های هوشمند مرورگر' : 'Smart Chrome Bookmarks'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/30">
                {formatBilingualNumber(bookmarks.length, settings.language)} {isFa ? 'نشانک' : 'items'}
              </span>
            </div>
            <p className="text-[10px] text-text-muted">
              {isFa ? 'دسته‌بندی هوشمند خودکار' : 'Automatically organized & categorized'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Import file button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-xl glass-card text-text-muted hover:text-text-primary transition-colors"
            title={isFa ? 'ایمپورت فایل HTML بوک‌مارک‌ها' : 'Import Bookmarks HTML file'}
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.json"
            onChange={handleImportHtml}
            className="hidden"
          />

          {onOpenHub && (
            <button
              type="button"
              onClick={onOpenHub}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-white transition-all text-xs font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isFa ? 'مرکز کامل' : 'Full Hub'}</span>
            </button>
          )}
        </div>
      </div>

      {!hasPermission ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Bookmark className="w-10 h-10 text-accent/50 mb-3 animate-pulse" />
          <p className="text-xs text-text-muted mb-4 max-w-xs">{t.bookmarks.permissionNeeded}</p>
          <button
            type="button"
            onClick={handleGrantPermission}
            className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-glow"
          >
            {t.bookmarks.grantPermission}
          </button>
        </div>
      ) : (
        <>
          {/* Search Filter */}
          <div className="relative mb-2.5">
            <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={isFa ? 'جستجو در تمام نشانک‌ها...' : 'Search all bookmarks by title, URL or folder...'}
              className="w-full ps-9 pe-3 py-2 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {/* All 10 Category Filter Pills with Live Counts */}
          <div className="pimx-bookmark-filters flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-accent text-white font-bold shadow-sm'
                  : 'bg-bg-glass text-text-secondary hover:text-text-primary border border-border-subtle/60'
              }`}
            >
              <span>{isFa ? 'همه' : 'All'}</span>
              <span className="ms-1 text-[10px] opacity-80">
                ({formatBilingualNumber(bookmarks.length, settings.language)})
              </span>
            </button>

            {categoriesList.map((catKey) => {
              const count = categoryCounts[catKey] || 0;
              if (count === 0 && activeCategory !== catKey) return null;
              const cat = BOOKMARK_CATEGORIES[catKey];
              const isSelected = activeCategory === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'text-white font-bold shadow-sm'
                      : 'bg-bg-glass text-text-secondary hover:text-text-primary border border-border-subtle/60'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cat.color : undefined,
                  }}
                >
                  <span>{isFa ? cat.nameFa : cat.nameEn}</span>
                  <span className="text-[10px] opacity-80">
                    ({formatBilingualNumber(count, settings.language)})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bookmarks List with Scroll & Expand */}
          <div
            className={`flex-1 overflow-y-auto space-y-1.5 pe-1 transition-all duration-300 ${
              isExpanded ? 'max-h-[500px]' : 'max-h-[260px] min-h-[160px]'
            }`}
          >
            {displayedBookmarks.length === 0 ? (
              <div className="py-10 text-center text-xs text-text-muted">
                {t.bookmarks.emptyState}
              </div>
            ) : (
              displayedBookmarks.map((item) => (
                <div
                  key={item.id}
                  className="pimx-bookmark-row group flex items-center justify-between p-2 rounded-xl bg-bg-glass hover:bg-bg-hover border border-border-subtle/50 text-xs transition-all"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 truncate flex-1 text-text-secondary hover:text-text-primary min-w-0"
                  >
                    <SmartFavicon url={item.url} size={30} categoryColor={BOOKMARK_CATEGORIES[item.category]?.color || '#4af3a2'} title={item.title} />
                    <div className="truncate min-w-0">
                      <span className="truncate block font-medium text-text-primary group-hover:text-accent transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-text-muted truncate block">
                        {item.domain} {item.folder && item.folder !== 'Bookmarks' ? `• ${item.folder}` : ''}
                      </span>
                    </div>
                  </a>

                  <div className="flex items-center gap-1.5 shrink-0 ms-2">
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-md font-semibold"
                      style={{
                        backgroundColor: `${BOOKMARK_CATEGORIES[item.category].color}18`,
                        color: BOOKMARK_CATEGORIES[item.category].color,
                        border: `1px solid ${BOOKMARK_CATEGORIES[item.category].color}35`,
                      }}
                    >
                      {isFa ? BOOKMARK_CATEGORIES[item.category].nameFa : BOOKMARK_CATEGORIES[item.category].nameEn}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePin(item)}
                      className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                      title={isFa ? 'پین به صفحه اصلی' : 'Pin to Home Shortcuts'}
                    >
                      {pinnedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Pin className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded-md text-text-muted hover:text-accent hover:bg-bg-hover transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Show More / Show Less Button */}
          {filtered.length > 6 && (
            <div className="pt-2 border-t border-border-subtle/50 flex items-center justify-between mt-2">
              <span className="text-[11px] text-text-muted">
                {isFa
                  ? `نمایش ${formatBilingualNumber(displayedBookmarks.length, settings.language)} از ${formatBilingualNumber(filtered.length, settings.language)} نشانک`
                  : `Showing ${displayedBookmarks.length} of ${filtered.length} bookmarks`}
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <span>{isExpanded ? (isFa ? 'نمایش کمتر' : 'Show Less') : (isFa ? `نمایش همه (${formatBilingualNumber(filtered.length, settings.language)})` : `Show All (${filtered.length})`)}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
