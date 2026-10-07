import {
  BookmarkCategorizer,
  CategorizedBookmark,
} from "./bookmark-categorizer";
import { ChromeApiService } from "./chrome-api";

export interface BookmarkFolder {
  id: string;
  title: string;
  depth: number;
  parentId?: string;
}
export interface BookmarkSnapshot {
  items: CategorizedBookmark[];
  folders: BookmarkFolder[];
  demo: boolean;
}
export interface BookmarkMeta {
  favorite?: boolean;
  readLater?: boolean;
  archived?: boolean;
  tags?: string[];
  note?: string;
  openedAt?: number;
}
export type BookmarkMetaMap = Record<string, BookmarkMeta>;

export function cleanTrackingUrl(value: string): string {
  try {
    const url = new URL(value);
    let changed = false;
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    return changed ? url.toString() : value;
  } catch {
    return value.trim().toLowerCase();
  }
}

export function canonicalBookmarkUrl(value: string): string {
  try {
    const url = new URL(cleanTrackingUrl(value));
    url.hash = "";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return `${url.origin}${url.pathname.replace(/\/$/, "")}${url.search}`;
  } catch {
    return value.trim().toLowerCase();
  }
}

export function duplicateBookmarkIds(
  items: CategorizedBookmark[],
): Set<string> {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const item of items) {
    const key = canonicalBookmarkUrl(item.url);
    if (seen.has(key)) duplicate.add(item.id);
    else seen.add(key);
  }
  return duplicate;
}

export class BookmarkWorkspace {
  static available(): boolean {
    return ChromeApiService.isExtension() && !!chrome.bookmarks;
  }

  static async snapshot(): Promise<BookmarkSnapshot> {
    if (!this.available())
      return {
        items: BookmarkCategorizer.processBookmarkTree(
          await ChromeApiService.getBookmarks(),
        ),
        folders: [],
        demo: true,
      };
    const tree = await new Promise<chrome.bookmarks.BookmarkTreeNode[]>(
      (resolve, reject) =>
        chrome.bookmarks.getTree((nodes) =>
          chrome.runtime.lastError
            ? reject(new Error(chrome.runtime.lastError.message))
            : resolve(nodes),
        ),
    );
    const folders: BookmarkFolder[] = [];
    const walk = (
      nodes: chrome.bookmarks.BookmarkTreeNode[],
      depth: number,
    ) => {
      for (const node of nodes) {
        if (!node.url && node.id !== "0")
          folders.push({
            id: node.id,
            title: node.title || "Bookmarks",
            depth,
            parentId: node.parentId,
          });
        if (node.children) walk(node.children, depth + 1);
      }
    };
    walk(tree, 0);
    return {
      items: BookmarkCategorizer.processBookmarkTree(tree),
      folders,
      demo: false,
    };
  }

  private static async call<T>(
    invoke: (done: (value: T) => void) => void,
  ): Promise<T> {
    if (!this.available())
      throw new Error("Bookmark editing requires the installed extension");
    return new Promise((resolve, reject) =>
      invoke((value) =>
        chrome.runtime.lastError
          ? reject(new Error(chrome.runtime.lastError.message))
          : resolve(value),
      ),
    );
  }
  static create(title: string, url: string, parentId?: string) {
    return this.call<chrome.bookmarks.BookmarkTreeNode>((done) =>
      chrome.bookmarks.create({ title, url, parentId }, done),
    );
  }
  static createFolder(title: string, parentId?: string) {
    return this.call<chrome.bookmarks.BookmarkTreeNode>((done) =>
      chrome.bookmarks.create({ title, parentId }, done),
    );
  }
  static update(id: string, changes: { title?: string; url?: string }) {
    return this.call<chrome.bookmarks.BookmarkTreeNode>((done) =>
      chrome.bookmarks.update(id, changes, done),
    );
  }
  static move(id: string, parentId: string) {
    return this.call<chrome.bookmarks.BookmarkTreeNode>((done) =>
      chrome.bookmarks.move(id, { parentId }, done),
    );
  }
  static remove(id: string) {
    return this.call<void>((done) => chrome.bookmarks.remove(id, () => done()));
  }
  static removeFolder(id: string) {
    return this.call<void>((done) =>
      chrome.bookmarks.removeTree(id, () => done()),
    );
  }
}
