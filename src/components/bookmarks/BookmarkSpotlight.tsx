import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, Copy, Heart, Sparkles } from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  BookmarkMetaMap,
  BookmarkWorkspace,
  duplicateBookmarkIds,
} from "../../services/bookmark-workspace";
import { CategorizedBookmark } from "../../services/bookmark-categorizer";
import { storage } from "../../services/storage";

export const BookmarkSpotlight: React.FC<{ onOpen: () => void }> = ({
  onOpen,
}) => {
  const { settings } = useWorkspace();
  const [items, setItems] = useState<CategorizedBookmark[]>([]);
  const [meta, setMeta] = useState<BookmarkMetaMap>({});
  const [demo, setDemo] = useState(false);
  const isFa = settings.language === "fa";
  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      Promise.all([
        BookmarkWorkspace.snapshot(),
        storage.get<BookmarkMetaMap>("bookmark_meta", {}),
      ])
        .then(([snapshot, saved]) => {
          if (mounted) {
            setItems(snapshot.items);
            setMeta(saved);
            setDemo(snapshot.demo);
          }
        })
        .catch(() => {});
    };
    refresh();
    window.addEventListener("pimxdash:bookmarks", refresh);
    if (BookmarkWorkspace.available()) {
      chrome.bookmarks.onCreated.addListener(refresh);
      chrome.bookmarks.onRemoved.addListener(refresh);
      chrome.bookmarks.onChanged.addListener(refresh);
      chrome.bookmarks.onMoved.addListener(refresh);
    }
    return () => {
      mounted = false;
      window.removeEventListener("pimxdash:bookmarks", refresh);
      if (BookmarkWorkspace.available()) {
        chrome.bookmarks.onCreated.removeListener(refresh);
        chrome.bookmarks.onRemoved.removeListener(refresh);
        chrome.bookmarks.onChanged.removeListener(refresh);
        chrome.bookmarks.onMoved.removeListener(refresh);
      }
    };
  }, []);
  const duplicates = useMemo(() => duplicateBookmarkIds(items).size, [items]);
  const favorites = useMemo(
    () => items.filter((item) => meta[item.id]?.favorite),
    [items, meta],
  );
  const preview = useMemo(
    () =>
      (favorites.length
        ? favorites
        : [...items].sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
      ).slice(0, 3),
    [items, favorites],
  );
  return (
    <section className="pimx-bookmark-section w-full mx-auto mt-6 z-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-accent/25 glass-panel pimx-spotlight p-5 flex items-center">
          <div className="max-w-sm">
            <div className="pimx-spotlight-kicker flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.25em] text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              {isFa ? "هستهٔ فرمان" : "The heart of your browser"}
              {demo && (
                <span className="text-text-muted normal-case tracking-normal">
                  · Demo
                </span>
              )}
            </div>
            <h2 className="pimx-spotlight-title text-xl sm:text-2xl font-bold text-text-primary mt-2">
              {isFa ? "نشانک‌ها، زیر کنترل تو" : "Your bookmarks, in orbit."}
            </h2>
            <p className="text-xs leading-relaxed text-text-secondary mt-2">
              {isFa
                ? "جستجو، مرتب‌سازی و پاک‌سازی نشانک‌ها در یک فضای قدرتمند."
                : "Find the right link instantly. Organize, clean and revisit everything you saved."}
            </p>
            <button onClick={onOpen} className="mt-4 pimx-primary px-4 py-2.5">
              <Bookmark className="inline w-4 h-4 me-2" />
              {isFa ? "بازکردن اطلس نشانک‌ها" : "Open Bookmark Atlas"}
              <ArrowUpRight className="inline w-3.5 h-3.5 ms-2" />
            </button>
          </div>
        </div>
          <div className="pimx-stats-grid glass-panel rounded-2xl border border-accent/20 p-3 grid grid-cols-3 xl:grid-cols-1 xl:grid-rows-3 gap-2 min-w-0">
            <div className="pimx-stat">
              <Bookmark className="w-4 h-4 text-accent mb-4" />
              <b>{items.length}</b>
              <span>{isFa ? "همه" : "Saved"}</span>
            </div>
            <div className="pimx-stat">
              <Heart className="w-4 h-4 text-rose-400 mb-4" />
              <b>{favorites.length}</b>
              <span>{isFa ? "علاقه‌مندی" : "Favorites"}</span>
            </div>
            <div className="pimx-stat">
              <Copy className="w-4 h-4 text-amber-400 mb-4" />
              <b>{duplicates}</b>
              <span>{isFa ? "تکراری" : "Duplicates"}</span>
            </div>
          </div>
          <div className="pimx-bookmark-preview glass-panel rounded-2xl border border-accent/20 p-3 grid grid-cols-1 gap-2 content-center min-w-0">
            <div className="text-[10px] font-mono text-accent uppercase tracking-widest px-1">{isFa ? 'بازگشت سریع به نشانک‌ها' : 'QUICK REVISIT'}</div>
            {preview.length === 0 && <p className="text-xs text-text-muted px-1">{isFa ? 'هنوز نشانکی برای نمایش نیست.' : 'No bookmarks to revisit yet.'}</p>}
            {preview.map((item) => (
              <a
                href={item.url}
                key={item.id}
                className="flex items-center justify-between min-w-0 px-3 py-2.5 rounded-xl border border-border-subtle bg-bg-glass/70 hover:border-accent/50 hover:-translate-y-0.5 transition-all text-xs text-text-secondary hover:text-text-primary"
              >
                <span className="truncate">{item.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 ms-2 text-accent" />
              </a>
            ))}
          </div>
      </div>
    </section>
  );
};
