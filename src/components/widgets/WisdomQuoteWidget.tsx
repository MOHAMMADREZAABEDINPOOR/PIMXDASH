import React, { useEffect, useState } from 'react';
import { ExternalLink, Quote, RefreshCw, Shuffle, Copy, Check, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FALLBACK_QUOTES, QuoteFeed, QuoteService, WisdomQuote } from '../../services/quotes';

const PERSIAN_FAMOUS_QUOTES: WisdomQuote[] = [
  { text: 'ابر و باد و مه و خورشید و فلک در کارند، تا تو نانی به کف آریّ و به غفلت نخوری.', author: 'سعدی شیرازی' },
  { text: 'بزرگ‌ترین دشمن دانش، جهل نیست، بلکه توهم دانستن است.', author: 'استیون هاوکینگ' },
  { text: 'زمان شما محدود است، پس آن را با زندگی کردن در زندگی دیگران هدر ندهید.', author: 'استیو جابز' },
  { text: 'تخیل از علم مهم‌تر است؛ علم به آنچه می‌دانیم محدود است، اما تخیل تمام جهان را دربرمی‌گیرد.', author: 'آلبرت اینشتین' },
  { text: 'دلا خو کن به تنهایی که از تن‌ها بلا خیزد، سعادت آن کسی دارد که از تن‌ها بپرهیزد.', author: 'مولانا جلال‌الدین' },
  { text: 'هیچ مشکلی با همان سطح از آگاهی که آن را به وجود آورده، حل نمی‌شود.', author: 'آلبرت اینشتین' },
  { text: 'سادگی، نهایت کمال و پیچیدگی است.', author: 'لئوناردو داوینچی' },
  { text: 'گر بر سر نفس خود امیری، مردی. گر دست فتاده‌ای بگیری، مردی.', author: 'رودکی' },
  { text: 'آینده از آن کسانی است که به زیبایی رویاهایشان باور دارند.', author: 'النور روزولت' },
  { text: 'انسان همان چیزی است که مکرراً انجام می‌دهد؛ بنابراین برتری یک عمل نیست، بلکه یک عادت است.', author: 'ارسطو' },
];

export const WisdomQuoteWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const [feed, setFeed] = useState<QuoteFeed>({
    quotes: FALLBACK_QUOTES,
    index: Math.floor(Math.random() * FALLBACK_QUOTES.length),
    source: 'offline-famous',
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [quoteCategory, setQuoteCategory] = useState<'all' | 'persian' | 'world'>('all');
  const isPersian = settings.language === 'fa';

  useEffect(() => {
    let active = true;
    setLoading(true);
    QuoteService.load(settings.networkEnabled !== false, (cached) => {
      if (active) setFeed(cached);
    })
      .then((result) => {
        if (active) {
          const combined = isPersian
            ? [...PERSIAN_FAMOUS_QUOTES, ...result.quotes]
            : result.quotes;
          setFeed({ ...result, quotes: combined });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [settings.networkEnabled, isPersian]);

  const activeQuotes =
    quoteCategory === 'persian'
      ? PERSIAN_FAMOUS_QUOTES
      : quoteCategory === 'world'
      ? feed.quotes.filter((q) => !PERSIAN_FAMOUS_QUOTES.some((p) => p.text === q.text))
      : feed.quotes;

  const current = activeQuotes[feed.index % activeQuotes.length] || FALLBACK_QUOTES[0];

  const nextQuote = () => {
    const nextIdx = (feed.index + 1) % activeQuotes.length;
    setFeed((prev) => ({ ...prev, index: nextIdx }));
    void QuoteService.saveIndex(nextIdx);
  };

  const randomQuote = () => {
    const randIdx = Math.floor(Math.random() * activeQuotes.length);
    setFeed((prev) => ({ ...prev, index: randIdx }));
    void QuoteService.saveIndex(randIdx);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`“${current.text}” — ${current.author}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const isCurrentPersian = /[\u0600-\u06FF]/.test(current.text);

  return (
    <div
      className="pimx-wisdom glass-panel relative overflow-hidden p-4 sm:p-5 flex items-center justify-between gap-4 rounded-2xl border border-border-subtle shadow-glass"
      aria-live="polite"
    >
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

      <div className="p-3 rounded-2xl bg-accent/15 text-accent shrink-0 hidden sm:flex items-center justify-center">
        <Quote className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0" dir={isCurrentPersian ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-accent flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3" />
            {isPersian ? 'نقل‌قول ماندگار بزرگان' : 'VOICES OF WISDOM'}
          </span>
          {isPersian && (
            <div className="flex items-center gap-1 ms-auto">
              {(
                [
                  ['all', 'همه'],
                  ['persian', 'پارسی'],
                  ['world', 'جهان'],
                ] as const
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  onClick={() => {
                    setQuoteCategory(cat);
                    setFeed((prev) => ({ ...prev, index: 0 }));
                  }}
                  className={`text-[9px] px-1.5 py-0.5 rounded transition-all font-mono ${
                    quoteCategory === cat
                      ? 'bg-accent/20 text-accent font-bold border border-accent/30'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm sm:text-base font-medium text-text-primary leading-relaxed line-clamp-3">
          “{current.text}”
        </p>

        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
          <span className="font-bold text-accent font-mono">— {current.author}</span>
          <span className="text-[10px] text-text-muted/60 font-mono">
            · {activeQuotes.length} {isPersian ? 'گزیده' : 'quotes'}
          </span>
          {feed.source !== 'offline-famous' && feed.source !== 'cache' && <a className="text-[10px] text-accent/80 hover:underline" href={feed.source === 'zenquotes.io' ? 'https://zenquotes.io/' : feed.source === 'dummyjson.com' ? 'https://dummyjson.com/quotes' : 'https://api.quotable.io/'} target="_blank" rel="noreferrer">{feed.source} ↗</a>}
        </div>
      </div>

      <div className="flex sm:flex-col gap-1.5 shrink-0">
        <button
          type="button"
          onClick={copyToClipboard}
          className="p-2 rounded-xl bg-bg-glass hover:bg-bg-hover text-text-muted hover:text-text-primary border border-border-subtle transition-all"
          title={isPersian ? 'کپی متن نقل‌قول' : 'Copy quote'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onClick={nextQuote}
          className="p-2 rounded-xl bg-bg-glass hover:bg-bg-hover text-text-muted hover:text-accent border border-border-subtle transition-all"
          aria-label={isPersian ? 'نقل‌قول بعدی' : 'Next quote'}
          title={isPersian ? 'نقل‌قول بعدی' : 'Next quote'}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={loading ? 'animate-spin' : ''}
          />
        </button>
        <button
          type="button"
          onClick={randomQuote}
          className="p-2 rounded-xl bg-bg-glass hover:bg-bg-hover text-text-muted hover:text-accent border border-border-subtle transition-all"
          aria-label="Random"
          title={isPersian ? 'نقل‌قول تصادفی' : 'Random famous quote'}
          disabled={loading}
        >
          <Shuffle size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
