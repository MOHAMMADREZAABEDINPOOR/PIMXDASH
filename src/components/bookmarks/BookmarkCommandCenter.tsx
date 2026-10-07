import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowUp,
  Bookmark,
  CheckSquare2,
  Clock3,
  Copy,
  Check,
  Download,
  FolderPlus,
  Heart,
  LayoutGrid,
  List,
  Plus,
  Search,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
  X,
  Pencil,
  ExternalLink,
  Pin,
} from "lucide-react";
import { useWorkspace } from "../../context/WorkspaceContext";
import { storage } from "../../services/storage";
import {
  BOOKMARK_CATEGORIES,
  CategorizedBookmark,
} from "../../services/bookmark-categorizer";
import {
  BookmarkMetaMap,
  BookmarkSnapshot,
  BookmarkWorkspace,
  canonicalBookmarkUrl,
  cleanTrackingUrl,
  duplicateBookmarkIds,
} from "../../services/bookmark-workspace";
import { SmartFavicon } from "../common/SmartFavicon";

type ViewFilter =
  | "all"
  | "favorite"
  | "later"
  | "archive"
  | "duplicate"
  | "recent"
  | "stale"
  | "untagged";
type Sort = "newest" | "oldest" | "title" | "domain" | "folder";
const blank: BookmarkSnapshot = { items: [], folders: [], demo: false };
const validUrl = (value: string) => {
  try {
    return /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
};
const download = (name: string, body: string, mime: string) => {
  const href = URL.createObjectURL(new Blob([body], { type: mime }));
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
};

export const BookmarkCommandCenter: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { settings, addShortcut } = useWorkspace();
  const isFa = settings.language === "fa";
  const [data, setData] = useState<BookmarkSnapshot>(blank);
  const [meta, setMeta] = useState<BookmarkMetaMap>({});
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [visibleCount, setVisibleCount] = useState(80);
  const [filter, setFilter] = useState<ViewFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [folder, setFolder] = useState("all");
  const [domain, setDomain] = useState("all");
  const [category, setCategory] = useState("all");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    id?: string;
    title: string;
    url: string;
    parentId: string;
  } | null>(null);
  const [newFolder, setNewFolder] = useState("");
  const [moveTo, setMoveTo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);
  const pendingTimer = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1600);
  };

  const refresh = async () => {
    try {
      const [snapshot, saved] = await Promise.all([
        BookmarkWorkspace.snapshot(),
        storage.get<BookmarkMetaMap>("bookmark_meta", {}),
      ]);
      setData(snapshot);
      setMeta(saved);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load bookmarks",
      );
    }
  };
  useEffect(() => {
    if (isOpen) void refresh();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !BookmarkWorkspace.available()) return;
    const listener = () => {
      void refresh();
    };
    chrome.bookmarks.onCreated.addListener(listener);
    chrome.bookmarks.onRemoved.addListener(listener);
    chrome.bookmarks.onChanged.addListener(listener);
    chrome.bookmarks.onMoved.addListener(listener);
    return () => {
      chrome.bookmarks.onCreated.removeListener(listener);
      chrome.bookmarks.onRemoved.removeListener(listener);
      chrome.bookmarks.onChanged.removeListener(listener);
      chrome.bookmarks.onMoved.removeListener(listener);
    };
  }, [isOpen]);

  const duplicates = useMemo(
    () => duplicateBookmarkIds(data.items),
    [data.items],
  );
  const folders = useMemo(
    () => [...new Set(data.items.map((item) => item.folder))].sort(),
    [data.items],
  );
  const domains = useMemo(
    () => [...new Set(data.items.map((item) => item.domain))].sort(),
    [data.items],
  );

  const counts = useMemo(() => {
    const c: Record<ViewFilter, number> = {
      all: data.items.filter((i) => !meta[i.id]?.archived).length,
      favorite: 0,
      later: 0,
      archive: 0,
      duplicate: duplicates.size,
      recent: 0,
      stale: 0,
      untagged: 0,
    };
    const week = Date.now() - 7 * 86400000;
    const year = Date.now() - 365 * 86400000;
    for (const item of data.items) {
      const f = meta[item.id] || {};
      if (f.favorite && !f.archived) c.favorite++;
      if (f.readLater && !f.archived) c.later++;
      if (f.archived) c.archive++;
      if ((item.dateAdded || 0) >= week && !f.archived) c.recent++;
      if ((item.dateAdded || 0) < year && !f.archived) c.stale++;
      if (!f.tags?.length && !f.archived) c.untagged++;
    }
    return c;
  }, [data.items, meta, duplicates]);

  const matches = useMemo(() => {
    const q = deferredQuery.trim().toLocaleLowerCase();
    return data.items
      .filter((item) => {
        const flags = meta[item.id] || {};
        if (
          (folder !== "all" && folder !== item.folder) ||
          (domain !== "all" && domain !== item.domain) ||
          (category !== "all" && category !== item.category)
        )
          return false;
        if (
          (filter === "favorite" && !flags.favorite) ||
          (filter === "later" && !flags.readLater) ||
          (filter === "archive" && !flags.archived) ||
          (filter === "duplicate" && !duplicates.has(item.id)) ||
          (filter === "recent" &&
            (item.dateAdded || 0) < Date.now() - 7 * 86400000) ||
          (filter === "stale" &&
            (item.dateAdded || 0) >= Date.now() - 365 * 86400000) ||
          (filter === "untagged" && flags.tags?.length)
        )
          return false;
        if (filter !== "archive" && flags.archived) return false;
        return (
          !q ||
          [
            item.title,
            item.url,
            item.folder,
            item.domain,
            ...(flags.tags || []),
            flags.note || "",
          ].some((text) => text.toLocaleLowerCase().includes(q))
        );
      })
      .sort((a, b) =>
        sort === "title"
          ? a.title.localeCompare(b.title)
          : sort === "domain"
            ? a.domain.localeCompare(b.domain)
            : sort === "folder"
              ? a.folder.localeCompare(b.folder)
              : sort === "oldest"
                ? (a.dateAdded || 0) - (b.dateAdded || 0)
                : (b.dateAdded || 0) - (a.dateAdded || 0),
      );
  }, [
    data.items,
    meta,
    deferredQuery,
    filter,
    sort,
    folder,
    domain,
    category,
    duplicates,
  ]);

  useEffect(() => {
    setVisibleCount(80);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [deferredQuery, filter, sort, folder, domain, category]);

  // Infinite scroll
  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => (c < matches.length ? c + 80 : c));
        }
      },
      { root, rootMargin: "400px" }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [matches.length, visibleCount, isOpen]);

  const onScrollList = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowTop(el.scrollTop > 600);
  };

  const detail = data.items.find((item) => item.id === detailId);
  const chosen = data.items.filter((item) => selected.has(item.id));
  const scope = chosen.length ? chosen : matches;
  const mark = (id: string, patch: BookmarkMetaMap[string]) =>
    setMeta((previous) => {
      const next = { ...previous, [id]: { ...previous[id], ...patch } };
      void storage
        .set("bookmark_meta", next)
        .then(() => window.dispatchEvent(new Event("pimxdash:bookmarks")));
      return next;
    });
  const toggleSelect = (id: string) =>
    setSelected((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await refresh();
      setSelected(new Set());
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };
  const remove = (items: CategorizedBookmark[]) => {
    if (!items.length) return;
    if (
      !confirm(
        isFa
          ? `حذف ${items.length} نشانک؟`
          : `Delete ${items.length} bookmark(s)?`,
      )
    )
      return;
    void run(async () => {
      for (const item of items) await BookmarkWorkspace.remove(item.id);
      setDetailId(null);
    });
  };

  const quickDelete = (item: CategorizedBookmark) => {
    if (pendingDelete === item.id) {
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      setPendingDelete(null);
      void run(async () => {
        await BookmarkWorkspace.remove(item.id);
        if (detailId === item.id) setDetailId(null);
      });
      showToast(isFa ? "حذف شد" : "Deleted");
    } else {
      setPendingDelete(item.id);
      if (pendingTimer.current) window.clearTimeout(pendingTimer.current);
      pendingTimer.current = window.setTimeout(() => setPendingDelete(null), 2000);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(isFa ? "کپی شد!" : "Copied!");
    } catch {
      showToast("Copy failed");
    }
  };

  const save = () => {
    if (!form?.title.trim() || !validUrl(form.url)) {
      setError("Enter a title and a valid http(s) URL");
      return;
    }
    void run(async () => {
      if (form.id)
        await BookmarkWorkspace.update(form.id, {
          title: form.title.trim(),
          url: form.url.trim(),
        });
      else
        await BookmarkWorkspace.create(
          form.title.trim(),
          form.url.trim(),
          form.parentId || data.folders[0]?.id,
        );
      setForm(null);
    });
  };
  const exportRows = (format: "json" | "csv") => {
    const rows = scope.map((item) => ({
      title: item.title,
      url: item.url,
      folder: item.folder,
      category: item.category,
      tags: (meta[item.id]?.tags || []).join(";"),
      note: meta[item.id]?.note || "",
    }));
    if (format === "json")
      download(
        "pimxdash-bookmarks.json",
        JSON.stringify(rows, null, 2),
        "application/json",
      );
    else
      download(
        "pimxdash-bookmarks.csv",
        [
          "title,url,folder,category,tags,note",
          ...rows.map((row) =>
            Object.values(row)
              .map((value) => `"${value.replace(/"/g, '""')}"`)
              .join(","),
          ),
        ].join("\n"),
        "text/csv",
      );
  };
  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || parsed.length > 10000)
        throw new Error("Invalid bookmark JSON");
      const seen = new Set(
        data.items.map((item) => canonicalBookmarkUrl(item.url)),
      );
      const incoming: { title: string; url: string }[] = [];
      for (const entry of parsed) {
        if (
          !entry ||
          typeof entry.title !== "string" ||
          typeof entry.url !== "string" ||
          !validUrl(entry.url)
        )
          continue;
        const key = canonicalBookmarkUrl(entry.url);
        if (seen.has(key)) continue;
        seen.add(key);
        incoming.push({ title: entry.title, url: entry.url });
      }
      if (!incoming.length) {
        setError("No new valid bookmarks found");
        return;
      }
      if (
        !confirm(
          `Import ${incoming.length} new bookmarks? Existing URLs will be skipped.`,
        )
      )
        return;
      await run(async () => {
        for (const item of incoming)
          await BookmarkWorkspace.create(
            item.title,
            item.url,
            data.folders[0]?.id,
          );
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Invalid import file");
    }
  };
  const cleanLinks = () => {
    const candidates = scope.filter(
      (item) => cleanTrackingUrl(item.url) !== item.url,
    );
    if (
      candidates.length &&
      confirm(`Clean tracking parameters in ${candidates.length} bookmarks?`)
    )
      void run(async () => {
        for (const item of candidates)
          await BookmarkWorkspace.update(item.id, {
            url: cleanTrackingUrl(item.url),
          });
      });
  };
  const organize = () => {
    if (
      !scope.length ||
      !confirm(
        isFa
          ? `چینش ${scope.length} نشانک در پوشه‌های موضوعی PIMXDASH؟`
          : `Move ${scope.length} bookmarks into PIMXDASH topic folders?`,
      )
    )
      return;
    void run(async () => {
      const root =
        data.folders.find((entry) => entry.title === "PIMXDASH Organized") ||
        (await BookmarkWorkspace.createFolder(
          "PIMXDASH Organized",
          data.folders[0]?.id,
        ));
      const topicFolders = new Map<string, string>();
      for (const item of scope) {
        let target = topicFolders.get(item.category);
        if (!target) {
          const existing = data.folders.find(
            (entry) =>
              entry.parentId === root.id &&
              entry.title === BOOKMARK_CATEGORIES[item.category].nameEn,
          );
          const folder =
            existing ||
            (await BookmarkWorkspace.createFolder(
              BOOKMARK_CATEGORIES[item.category].nameEn,
              root.id,
            ));
          target = folder.id;
          topicFolders.set(item.category, target);
        }
        await BookmarkWorkspace.move(item.id, target);
      }
    });
  };
  const filters: [ViewFilter, string, string][] = [
    ["all", "Library", "کتابخانه"],
    ["favorite", "Favorites", "علاقه‌مندی"],
    ["later", "Read later", "بعداً بخوان"],
    ["archive", "Archive", "بایگانی"],
    ["duplicate", "Duplicates", "تکراری‌ها"],
    ["recent", "This week", "این هفته"],
    ["stale", "Older than year", "قدیمی‌ها"],
    ["untagged", "Needs tags", "بی‌برچسب"],
  ];
  if (!isOpen) return null;
  const visible = matches.slice(0, visibleCount);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/80 backdrop-blur-xl"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pimx-atlas w-full max-w-[1440px] h-[94vh] min-h-0 flex flex-col rounded-3xl glass-panel border border-border-glass overflow-hidden shadow-2xl pimx-modal-enter">
        <div className="pimx-atlas-header shrink-0 flex justify-between items-center gap-3 p-4 sm:px-6 border-b border-border-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-accent/20 text-accent shrink-0">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-text-primary truncate">
                PIMXDASH Bookmark Atlas
              </h2>
              <p className="text-[11px] text-text-muted">
                {data.items.length} {isFa ? "نشانک" : "bookmarks"} ·{" "}
                {duplicates.size} {isFa ? "تکراری" : "duplicates"}{" "}
                {data.demo ? "· Demo preview" : ""} · {matches.length}{" "}
                {isFa ? "نتیجه" : "results"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <label
              className="pimx-action cursor-pointer"
              title="Import bookmark JSON"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importJson(file);
                  event.target.value = "";
                }}
              />
            </label>
            <button
              onClick={() =>
                setForm({
                  title: "",
                  url: "",
                  parentId: data.folders[0]?.id || "",
                })
              }
              className="pimx-primary"
            >
              <Plus className="w-3.5 h-3.5 inline me-1" />
              {isFa ? "افزودن" : "Add bookmark"}
            </button>
            <button
              onClick={onClose}
              className="pimx-action"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {error && (
          <div className="mx-4 mt-2 shrink-0 rounded-xl p-2 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}
        <div className="pimx-atlas-grid flex-1 min-h-0 grid lg:grid-cols-[210px_minmax(0,1fr)_300px] min-h-0 overflow-hidden">
          <aside className="hidden lg:flex flex-col min-h-0 overflow-y-auto pimx-scrollbar p-3 border-e border-border-subtle">
            <p className="p-3 text-[10px] uppercase tracking-[.2em] text-text-muted">
              {isFa ? "نماها" : "Library views"}
            </p>
            {filters.map(([id, en, fa]) => (
              <button
                key={id}
                onClick={() => {
                  setFilter(id);
                  setSelected(new Set());
                }}
                className={`flex items-center justify-between w-full rounded-xl text-start px-3 py-2.5 text-xs transition-all ${filter === id ? "bg-accent/20 text-accent border border-accent/30" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent"}`}
              >
                <span>{isFa ? fa : en}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${filter === id ? "bg-accent/20" : "bg-bg-glass"}`}>
                  {counts[id]}
                </span>
              </button>
            ))}
            <div className="mt-5 border-t border-border-subtle pt-3 space-y-1">
              <button onClick={organize} className="pimx-side text-accent">
                <FolderPlus className="w-3 h-3 inline me-2" />
                {isFa ? "چینش در پوشه‌های موضوعی" : "Organize into folders"}
              </button>
              <button onClick={cleanLinks} className="pimx-side">
                <ShieldCheck className="w-3 h-3 inline me-2" />
                {isFa ? "پاک‌سازی لینک‌ها" : "Clean tracking links"}
              </button>
              <button
                onClick={() =>
                  remove(scope.filter((item) => duplicates.has(item.id)))
                }
                className="pimx-side"
              >
                <Trash2 className="w-3 h-3 inline me-2" />
                {isFa ? "حذف تکراری‌ها" : "Remove duplicates"}
              </button>
              <button onClick={() => exportRows("json")} className="pimx-side">
                <Download className="w-3 h-3 inline me-2" />
                Export JSON
              </button>
              <button onClick={() => exportRows("csv")} className="pimx-side">
                <Download className="w-3 h-3 inline me-2" />
                Export CSV
              </button>
            </div>
          </aside>
          <main className="min-w-0 min-h-0 flex flex-col overflow-hidden">
            <div className="shrink-0 p-3 space-y-2 border-b border-border-subtle">
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute start-3 top-2.5 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={
                      isFa
                        ? "جستجو در عنوان، آدرس، پوشه، برچسب و یادداشت…"
                        : "Search title, URL, folder, tag or note…"
                    }
                    className="pimx-input w-full ps-9 pe-9"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
                  className="pimx-action shrink-0"
                  title="Toggle layout"
                >
                  {layout === "grid" ? (
                    <List className="w-4 h-4" />
                  ) : (
                    <LayoutGrid className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as ViewFilter)
                  }
                  className="lg:hidden pimx-select"
                >
                  {filters.map(([id, en, fa]) => (
                    <option key={id} value={id}>
                      {isFa ? fa : en} ({counts[id]})
                    </option>
                  ))}
                </select>
                <select
                  value={folder}
                  onChange={(event) => setFolder(event.target.value)}
                  className="pimx-select"
                >
                  <option value="all">
                    {isFa ? "همهٔ پوشه‌ها" : "All folders"}
                  </option>
                  {folders.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <select
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  className="pimx-select"
                >
                  <option value="all">
                    {isFa ? "همهٔ دامنه‌ها" : "All domains"}
                  </option>
                  {domains.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="pimx-select"
                >
                  <option value="all">
                    {isFa ? "همهٔ موضوع‌ها" : "All topics"}
                  </option>
                  {Object.entries(BOOKMARK_CATEGORIES).map(([id, value]) => (
                    <option key={id} value={id}>
                      {isFa ? value.nameFa : value.nameEn}
                    </option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as Sort)}
                  className="pimx-select"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">A–Z</option>
                  <option value="domain">Domain</option>
                  <option value="folder">Folder</option>
                </select>
                <button
                  onClick={() =>
                    setSelected(new Set(matches.map((item) => item.id)))
                  }
                  className="pimx-select text-accent shrink-0"
                >
                  {isFa ? "انتخاب همه" : "Select all"}
                </button>
              </div>
            </div>
            {selected.size > 0 && (
              <div className="shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-accent/20 bg-accent/10 text-[11px] text-text-secondary backdrop-blur-md sticky top-0 z-10">
                <b className="text-accent">{selected.size} selected</b>
                <button
                  onClick={() =>
                    chosen
                      .slice(0, 20)
                      .forEach((item) =>
                        window.open(item.url, "_blank", "noopener,noreferrer"),
                      )
                  }
                  className="hover:text-accent"
                >
                  Open
                </button>
                <button
                  onClick={() => {
                    void copyUrl(chosen.map((item) => item.url).join("\n"));
                  }}
                  className="hover:text-accent"
                >
                  Copy URLs
                </button>
                <select
                  value={moveTo}
                  onChange={(event) => setMoveTo(event.target.value)}
                  className="pimx-select !py-1"
                >
                  <option value="">Move to…</option>
                  {data.folders.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.title}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!moveTo}
                  onClick={() =>
                    void run(async () => {
                      for (const item of chosen)
                        await BookmarkWorkspace.move(item.id, moveTo);
                    })
                  }
                  className="text-accent disabled:opacity-30"
                >
                  Move
                </button>
                <button
                  onClick={() => remove(chosen)}
                  className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 font-bold"
                >
                  {isFa ? `حذف ${selected.size} مورد` : `Delete ${selected.size} selected`}
                </button>
                <button onClick={() => setSelected(new Set())} className="ms-auto hover:text-text-primary">Clear</button>
              </div>
            )}
            <div
              ref={scrollRef}
              onScroll={onScrollList}
              className="flex-1 min-h-0 overflow-y-auto pimx-scrollbar p-3 relative"
            >
              <p className="text-[11px] text-text-muted mb-3 sticky top-0 bg-transparent">
                {matches.length} {isFa ? "نتیجه" : "results"}
                {query ? ` · "${query}"` : ""} · showing {visible.length}
              </p>
              {matches.length ? (
                <>
                  <div
                    className={
                      layout === "grid"
                        ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-2.5"
                        : "space-y-1"
                    }
                  >
                    {visible.map((item) => {
                      const catColor = BOOKMARK_CATEGORIES[item.category]?.color || "#4af3a2";
                      const fav = !!meta[item.id]?.favorite;
                      const later = !!meta[item.id]?.readLater;
                      const isPending = pendingDelete === item.id;
                      if (layout === "list") {
                        return (
                          <div
                            key={item.id}
                            className={`group flex items-center gap-2 px-2 py-1.5 rounded-xl border bg-bg-glass/60 hover:bg-bg-hover hover:border-accent/40 transition-all ${detailId === item.id ? "border-accent/60" : "border-border-subtle"}`}
                          >
                            <button
                              onClick={() => toggleSelect(item.id)}
                              className="text-text-muted hover:text-accent shrink-0"
                              aria-label="Select"
                            >
                              {selected.has(item.id) ? (
                                <CheckSquare2 className="w-4 h-4 text-accent" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <SmartFavicon url={item.url} size={32} categoryColor={catColor} title={item.title} />
                            <button
                              onClick={() => setDetailId(item.id)}
                              className="min-w-0 flex-1 text-start"
                            >
                              <span className="block text-xs font-semibold text-text-primary truncate group-hover:text-accent">
                                {item.title}
                              </span>
                              <span className="block text-[10px] text-text-muted truncate">
                                {item.domain} · {item.folder}
                              </span>
                            </button>
                            <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => mark(item.id, { favorite: !fav })} className={fav ? "p-1.5 text-rose-400" : "p-1.5 text-text-muted hover:text-rose-400"} title="Favorite">
                                <Heart className="w-3.5 h-3.5" fill={fav ? "currentColor" : "none"} />
                              </button>
                              <button onClick={() => mark(item.id, { readLater: !later })} className={later ? "p-1.5 text-sky-400" : "p-1.5 text-text-muted hover:text-sky-400"} title="Read later">
                                <Clock3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => void copyUrl(item.url)} className="p-1.5 text-text-muted hover:text-accent" title="Copy">
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setForm({ id: item.id, title: item.title, url: item.url, parentId: "" })} className="p-1.5 text-text-muted hover:text-accent" title="Quick edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-muted hover:text-accent" title="Open">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => quickDelete(item)}
                                className={`p-1.5 rounded-lg transition-all ${isPending ? "bg-rose-500 text-white animate-pulse px-2 text-[10px] font-bold" : "text-text-muted hover:text-rose-400 hover:bg-rose-500/10"}`}
                                title="Quick delete"
                              >
                                {isPending ? (isFa ? "تأیید؟" : "Sure?") : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={item.id}
                          className={`pimx-atlas-card group rounded-2xl border bg-bg-glass/60 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/40 ${detailId === item.id ? "border-accent/60" : "border-border-subtle"}`}
                        >
                          <div className="p-3 flex items-start gap-2">
                            <button
                              onClick={() => toggleSelect(item.id)}
                              className="text-text-muted hover:text-accent shrink-0 mt-0.5"
                              aria-label="Select bookmark"
                            >
                              {selected.has(item.id) ? (
                                <CheckSquare2 className="w-4 h-4 text-accent" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                            <SmartFavicon url={item.url} size={48} categoryColor={catColor} title={item.title} />
                            <button
                              onClick={() => setDetailId(item.id)}
                              className="min-w-0 flex-1 text-start"
                            >
                              <span className="block text-xs font-semibold text-text-primary truncate group-hover:text-accent leading-5">
                                {item.title}
                              </span>
                              <span className="block text-[10px] text-text-muted truncate mt-0.5" dir="ltr">
                                {item.domain} · {item.folder}
                              </span>
                            </button>
                            <button
                              onClick={() => quickDelete(item)}
                              className={`shrink-0 p-1.5 rounded-lg transition-all ${isPending ? "bg-rose-500 text-white text-[10px] font-bold px-2 animate-pulse" : "opacity-0 group-hover:opacity-100 text-text-muted hover:text-rose-400 hover:bg-rose-500/10"}`}
                              title={isFa ? "حذف سریع" : "Quick delete"}
                            >
                              {isPending ? (isFa ? "تأیید حذف؟" : "Confirm?") : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="px-3 pb-2 flex gap-1 items-center flex-wrap">
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}35` }}>
                              {isFa
                                ? BOOKMARK_CATEGORIES[item.category].nameFa
                                : BOOKMARK_CATEGORIES[item.category].nameEn}
                            </span>
                            {duplicates.has(item.id) && (
                              <span className="text-[9px] text-amber-400">
                                {isFa ? "تکراری" : "duplicate"}
                              </span>
                            )}
                            {later && (
                              <Clock3 className="w-3 h-3 text-sky-400" />
                            )}
                            <div className="ms-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => mark(item.id, { favorite: !fav })} className={fav ? "p-1 text-rose-400" : "p-1 text-text-muted hover:text-rose-400"} title="Favorite">
                                <Heart className="w-3.5 h-3.5" fill={fav ? "currentColor" : "none"} />
                              </button>
                              <button onClick={() => mark(item.id, { readLater: !later })} className="p-1 text-text-muted hover:text-sky-400" title="Read later">
                                <Clock3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => void copyUrl(item.url)} className="p-1 text-text-muted hover:text-accent" title={isFa ? "کپی لینک" : "Copy link"}>
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setForm({ id: item.id, title: item.title, url: item.url, parentId: "" })} className="p-1 text-text-muted hover:text-accent" title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 text-text-muted hover:text-accent"
                                title="Open in new tab"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </a>
                            </div>
                            {fav && (
                              <Heart className="w-3 h-3 text-rose-400" fill="currentColor" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div ref={sentinelRef} className="h-2" />
                  {visibleCount < matches.length && (
                    <button
                      onClick={() => setVisibleCount((count) => count + 80)}
                      className="pimx-action w-full mt-3"
                    >
                      {isFa
                        ? `نمایش بیشتر (${matches.length - visibleCount} باقی‌مانده)`
                        : `Load more (${matches.length - visibleCount})`}
                    </button>
                  )}
                </>
              ) : (
                <div className="py-20 text-center text-text-muted text-xs">
                  {isFa ? "موردی یافت نشد" : "No bookmarks in this view"}
                </div>
              )}
              {showTop && (
                <button
                  onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                  className="sticky bottom-4 float-end me-2 p-2.5 rounded-full bg-accent text-black shadow-lg hover:scale-110 transition-transform z-20"
                  title={isFa ? "بازگشت به بالا" : "Scroll to top"}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </main>
          <aside className="hidden lg:flex flex-col min-h-0 p-4 border-s border-border-subtle overflow-y-auto pimx-scrollbar">
            <p className="text-[10px] uppercase tracking-[.2em] text-text-muted mb-3">
              {isFa ? "جزئیات" : "Inspector"}
            </p>
            {detail ? (
              <div className="min-h-0 flex-1">
                <div className="flex items-start gap-3">
                  <SmartFavicon url={detail.url} size={64} categoryColor={BOOKMARK_CATEGORIES[detail.category]?.color} title={detail.title} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-text-primary break-words leading-6">
                      {detail.title}
                    </h3>
                    <p className="text-[10px] text-text-muted break-all mt-1" dir="ltr">
                      {detail.url}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-text-muted mt-2">
                  {detail.folder} ·{" "}
                  {detail.dateAdded
                    ? new Date(detail.dateAdded).toLocaleDateString()
                    : "Unknown date"}
                </p>
                <div className="grid grid-cols-2 gap-1.5 mt-4">
                  <button
                    onClick={() =>
                      mark(detail.id, {
                        readLater: !meta[detail.id]?.readLater,
                      })
                    }
                    className="pimx-action"
                  >
                    {meta[detail.id]?.readLater ? "✓ " : ""}
                    {isFa ? "بعداً بخوان" : "Read later"}
                  </button>
                  <button
                    onClick={() =>
                      mark(detail.id, { archived: !meta[detail.id]?.archived })
                    }
                    className="pimx-action"
                  >
                    {meta[detail.id]?.archived ? "✓ " : ""}
                    {isFa ? "بایگانی" : "Archive"}
                  </button>
                  <button
                    onClick={() => void copyUrl(detail.url)}
                    className="pimx-action"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() =>
                      addShortcut({
                        title: detail.title,
                        url: detail.url,
                        category: [
                          "ai",
                          "dev",
                          "work",
                          "social",
                          "finance",
                        ].includes(detail.category)
                          ? (detail.category as
                              "ai" | "dev" | "work" | "social" | "finance")
                          : "general",
                      })
                    }
                    className="pimx-action"
                  >
                    <Pin className="w-3 h-3 inline me-1" />
                    Pin home
                  </button>
                  <button
                    onClick={() =>
                      setForm({
                        id: detail.id,
                        title: detail.title,
                        url: detail.url,
                        parentId: "",
                      })
                    }
                    className="pimx-action"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove([detail])}
                    className="pimx-action !text-rose-300 !border-rose-500/30 hover:!bg-rose-500/15 font-bold"
                  >
                    <Trash2 className="w-3 h-3 inline me-1" />
                    Delete
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  <button onClick={() => mark(detail.id, { favorite: !meta[detail.id]?.favorite })} className={`pimx-action ${meta[detail.id]?.favorite ? "!text-rose-400 !border-rose-500/30" : ""}`}>
                    <Heart className="w-3.5 h-3.5 mx-auto" fill={meta[detail.id]?.favorite ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => window.open(detail.url, "_blank", "noopener")} className="pimx-action">
                    <ExternalLink className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button onClick={() => void copyUrl(detail.url)} className="pimx-action">
                    {toast ? <Check className="w-3.5 h-3.5 mx-auto text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mx-auto" />}
                  </button>
                </div>
                <label className="mt-5 block text-[11px] text-text-muted">
                  {isFa ? "برچسب‌ها (جدا با ویرگول)" : "Tags (comma separated)"}
                  <input
                    value={(meta[detail.id]?.tags || []).join(", ")}
                    onChange={(event) =>
                      mark(detail.id, {
                        tags: event.target.value
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      })
                    }
                    className="pimx-input w-full mt-1"
                  />
                </label>
                <label className="mt-3 block text-[11px] text-text-muted">
                  {isFa ? "یادداشت شخصی" : "Private note"}
                  <textarea
                    value={meta[detail.id]?.note || ""}
                    onChange={(event) =>
                      mark(detail.id, { note: event.target.value })
                    }
                    rows={4}
                    className="pimx-input w-full mt-1 resize-none"
                  />
                </label>
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                {isFa
                  ? "یک نشانک را برای ویرایش انتخاب کنید."
                  : "Select a bookmark to edit, tag or annotate."}
              </p>
            )}
            <div className="mt-auto pt-5 shrink-0">
              <p className="text-[10px] uppercase tracking-[.2em] text-text-muted mb-2">
                {isFa ? "پوشهٔ جدید" : "New folder"}
              </p>
              <div className="flex gap-1">
                <input
                  value={newFolder}
                  onChange={(event) => setNewFolder(event.target.value)}
                  placeholder="Folder name"
                  className="pimx-input w-full min-w-0"
                />
                <button
                  disabled={!newFolder.trim() || busy}
                  onClick={() =>
                    void run(async () => {
                      await BookmarkWorkspace.createFolder(
                        newFolder.trim(),
                        data.folders[0]?.id,
                      );
                      setNewFolder("");
                    })
                  }
                  className="pimx-action text-accent disabled:opacity-30"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
        {toast && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-xl animate-pulse">
            {toast}
          </div>
        )}
      </div>
      {form && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setForm(null);
          }}
        >
          <div className="w-full max-w-md glass-panel border border-border-glass rounded-2xl p-5 space-y-3 pimx-modal-enter">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-text-primary">
                {form.id ? (isFa ? "ویرایش سریع" : "Quick edit") : (isFa ? "افزودن" : "Add bookmark")}
              </h3>
              <button onClick={() => setForm(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            {form.url && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-bg-glass border border-border-subtle">
                <SmartFavicon url={form.url.startsWith("http") ? form.url : `https://${form.url}`} size={40} categoryColor="#4af3a2" />
                <span className="text-[11px] text-text-muted truncate" dir="ltr">{form.url}</span>
              </div>
            )}
            <input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              placeholder={isFa ? "عنوان" : "Title"}
              className="pimx-input w-full"
            />
            <input
              value={form.url}
              onChange={(event) =>
                setForm({ ...form, url: event.target.value })
              }
              placeholder="https://example.com"
              className="pimx-input w-full"
              dir="ltr"
            />
            {!form.id && (
              <select
                value={form.parentId}
                onChange={(event) =>
                  setForm({ ...form, parentId: event.target.value })
                }
                className="pimx-input w-full"
              >
                {data.folders.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.title}
                  </option>
                ))}
              </select>
            )}
            <button
              disabled={busy}
              onClick={save}
              className="pimx-primary w-full"
            >
              {isFa ? "ذخیره" : "Save bookmark"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
