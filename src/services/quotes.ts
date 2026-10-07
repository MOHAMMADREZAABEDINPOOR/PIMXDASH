import { storage } from './storage';

export interface WisdomQuote {
  text: string;
  author: string;
}

interface QuoteCache {
  quotes: WisdomQuote[];
  index: number;
  fetchedAt: number;
  source?: string;
}

const CACHE_KEY = 'wisdom_quotes_v2';
const CACHE_LIFETIME = 12 * 60 * 60 * 1000;

export const FALLBACK_QUOTES: WisdomQuote[] = [
  { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'A man who dares to waste one hour of time has not discovered the value of life.', author: 'Charles Darwin' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Code is like humor. When you have to explain it, it’s bad.', author: 'Cory House' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'What we think, we become.', author: 'Buddha' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Be yourself; everyone else is already taken.', author: 'Oscar Wilde' },
  { text: 'Two things are infinite: the universe and human stupidity.', author: 'Albert Einstein' },
  { text: 'I have not failed. I have just found 10,000 ways that will not work.', author: 'Thomas Edison' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Think different.', author: 'Apple' },
  { text: 'Move fast and break things.', author: 'Mark Zuckerberg' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
];

export interface QuoteFeed {
  quotes: WisdomQuote[];
  index: number;
  source: string;
}

const isQuote = (value: unknown): value is WisdomQuote => {
  if (!value || typeof value !== 'object') return false;
  const quote = value as Partial<WisdomQuote>;
  return typeof quote.text === 'string' && quote.text.trim().length > 0 && quote.text.length <= 600
    && typeof quote.author === 'string' && quote.author.trim().length > 0 && quote.author.length <= 120;
};

const readCache = async (): Promise<QuoteCache | null> => {
  const saved = await storage.get<unknown>(CACHE_KEY, null);
  if (!saved || typeof saved !== 'object') return null;
  const cache = saved as Partial<QuoteCache>;
  if (!Array.isArray(cache.quotes) || cache.quotes.length === 0 || !cache.quotes.every(isQuote)) return null;
  if (typeof cache.fetchedAt !== 'number' || !Number.isFinite(cache.fetchedAt)) return null;
  return {
    quotes: cache.quotes,
    index: typeof cache.index === 'number' && Number.isInteger(cache.index) && cache.index >= 0
      ? cache.index % cache.quotes.length : 0,
    fetchedAt: cache.fetchedAt,
    source: typeof cache.source === 'string' ? cache.source : 'cache',
  };
};

const fetchZenQuotes = async (): Promise<WisdomQuote[]> => {
  const res = await fetch('https://zenquotes.io/api/quotes', { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`zen ${res.status}`);
  const payload: unknown = await res.json();
  if (!Array.isArray(payload)) throw new Error('bad zen');
  const out = payload.map((item): WisdomQuote | null => {
    const e = item as { q?: unknown; a?: unknown };
    const q = { text: e.q, author: e.a };
    return isQuote(q) ? q : null;
  }).filter((q): q is WisdomQuote => q !== null);
  if (!out.length) throw new Error('empty zen');
  return out;
};

const fetchQuotable = async (): Promise<WisdomQuote[]> => {
  // quotable.io — famous people quotes
  const res = await fetch('https://api.quotable.io/quotes/random?limit=20', { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`quotable ${res.status}`);
  const payload: unknown = await res.json();
  const arr = Array.isArray(payload) ? payload : (payload as { results?: unknown }).results;
  if (!Array.isArray(arr)) throw new Error('bad quotable');
  const out = arr.map((item): WisdomQuote | null => {
    const e = item as { content?: unknown; author?: unknown };
    const q = { text: e.content, author: e.author };
    return isQuote(q) ? q : null;
  }).filter((q): q is WisdomQuote => q !== null);
  if (!out.length) throw new Error('empty quotable');
  return out;
};

const fetchDummyJson = async (): Promise<WisdomQuote[]> => {
  const res = await fetch('https://dummyjson.com/quotes?limit=30', { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`dummy ${res.status}`);
  const payload = (await res.json()) as { quotes?: { quote?: unknown; author?: unknown }[] };
  if (!Array.isArray(payload.quotes)) throw new Error('bad dummy');
  const out = payload.quotes.map((e): WisdomQuote | null => {
    const q = { text: e.quote, author: e.author };
    return isQuote(q) ? q : null;
  }).filter((q): q is WisdomQuote => q !== null);
  if (!out.length) throw new Error('empty dummy');
  return out;
};

let pending: Promise<{ quotes: WisdomQuote[]; source: string }> | null = null;

const fetchBest = (): Promise<{ quotes: WisdomQuote[]; source: string }> => {
  if (!pending) {
    pending = (async () => {
      const errors: string[] = [];
      for (const [fn, name] of [[fetchZenQuotes, 'zenquotes.io'], [fetchDummyJson, 'dummyjson.com'], [fetchQuotable, 'quotable.io']] as const) {
        try {
          const quotes = await fn();
          return { quotes, source: name };
        } catch (e) {
          errors.push(`${name}: ${e instanceof Error ? e.message : 'fail'}`);
        }
      }
      throw new Error(errors.join(' | '));
    })().finally(() => { pending = null; });
  }
  return pending;
};

export const QuoteService = {
  async load(networkEnabled: boolean, onCached?: (feed: QuoteFeed) => void): Promise<QuoteFeed> {
    const cached = await readCache();
    if (cached) onCached?.({ quotes: cached.quotes, index: cached.index, source: cached.source || 'cache' });
    if (networkEnabled && (!cached || Date.now() - cached.fetchedAt >= CACHE_LIFETIME)) {
      try {
        const { quotes, source } = await fetchBest();
        const next: QuoteCache = { quotes, index: 0, fetchedAt: Date.now(), source };
        await storage.set(CACHE_KEY, next);
        return { quotes, index: 0, source };
      } catch {
        // keep cache
      }
    }
    return cached
      ? { quotes: cached.quotes, index: cached.index, source: cached.source || 'cache' }
      : { quotes: FALLBACK_QUOTES, index: 0, source: 'offline-famous' };
  },

  async saveIndex(index: number): Promise<void> {
    const cached = await readCache();
    if (cached) await storage.set(CACHE_KEY, { ...cached, index: index % cached.quotes.length });
  },
};
