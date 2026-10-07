import { BookmarkNode, ChromeApiService } from './chrome-api';

export interface CategorizedBookmark {
  id: string;
  title: string;
  url: string;
  category: BookmarkCategoryKey;
  domain: string;
  folder: string;
  dateAdded?: number;
  faviconUrl: string;
  tags: string[];
}

export type BookmarkCategoryKey =
  | 'ai'
  | 'dev'
  | 'media'
  | 'tools'
  | 'work'
  | 'social'
  | 'reading'
  | 'finance'
  | 'shopping'
  | 'other';

export interface BookmarkCategoryInfo {
  key: BookmarkCategoryKey;
  nameEn: string;
  nameFa: string;
  icon: string;
  color: string;
  glow: string;
  descriptionEn: string;
  descriptionFa: string;
}

export const BOOKMARK_CATEGORIES: Record<BookmarkCategoryKey, BookmarkCategoryInfo> = {
  ai: {
    key: 'ai',
    nameEn: 'AI & Intelligence',
    nameFa: 'هوش مصنوعی و یادگیری ماشین',
    icon: 'Sparkles',
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    descriptionEn: 'ChatGPT, Claude, Gemini, HuggingFace, Perplexity, Voice AI',
    descriptionFa: 'چت‌جی‌پی‌تی، کلود، جمینای، تولید تصویر، صدا و هوش مصنوعی',
  },
  dev: {
    key: 'dev',
    nameEn: 'Development & Engineering',
    nameFa: 'توسعه و برنامه‌نویسی',
    icon: 'Code2',
    color: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.4)',
    descriptionEn: 'GitHub, StackOverflow, Documentation, Frameworks',
    descriptionFa: 'گیت‌هاب، مستندات، فریم‌ورک‌ها و ابزارهای کدنویسی',
  },
  tools: {
    key: 'tools',
    nameEn: 'Online Utilities & Tools',
    nameFa: 'ابزارهای آنلاین و کاربردی',
    icon: 'Wrench',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    descriptionEn: 'Downloaders, Regex101, CanIUse, Speedtest, Converters',
    descriptionFa: 'دانلودرها، تست رگکس، فشرده‌سازی، مبدل‌ها و ابزارها',
  },
  media: {
    key: 'media',
    nameEn: 'Media & Entertainment',
    nameFa: 'رسانه، صوت و تصویر',
    icon: 'Film',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    descriptionEn: 'YouTube, Spotify, Netflix, Twitch, Audio, Video',
    descriptionFa: 'یوتیوب، اسپاتیفای، فیلم، پادکست، موسیقی و ویدیو',
  },
  work: {
    key: 'work',
    nameEn: 'Work & Productivity',
    nameFa: 'کار و بهره‌وری',
    icon: 'Briefcase',
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    descriptionEn: 'Notion, Slack, Email, Google Drive, Linear, Figma',
    descriptionFa: 'نوشن، ایمیل، درایو گوگل، فیگما و مدیریت پروژه',
  },
  social: {
    key: 'social',
    nameEn: 'Social & Community',
    nameFa: 'شبکه‌های اجتماعی و ارتباطات',
    icon: 'Users',
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.4)',
    descriptionEn: 'Twitter/X, LinkedIn, Reddit, Discord, Telegram',
    descriptionFa: 'توییتر، لینکدین، ردیت، دیسکورد و پیام‌رسان‌ها',
  },
  reading: {
    key: 'reading',
    nameEn: 'Articles & Publications',
    nameFa: 'مطالعه و نشریات',
    icon: 'BookOpen',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.4)',
    descriptionEn: 'Medium, Substack, Arxiv, Wikipedia, Technical Blogs',
    descriptionFa: 'مدیوم، وبلاگ‌های تخصصی، مقالات علمی و دانشنامه‌ها',
  },
  finance: {
    key: 'finance',
    nameEn: 'Finance & Crypto',
    nameFa: 'مالی و ارز دیجیتال',
    icon: 'Coins',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    descriptionEn: 'TradingView, Binance, CoinMarketCap, Banks',
    descriptionFa: 'تریدینگ‌ویو، صرافی‌ها، ارزهای دیجیتال و بانک',
  },
  shopping: {
    key: 'shopping',
    nameEn: 'Shopping & Commerce',
    nameFa: 'خرید اینترنتی و فروشگاه',
    icon: 'ShoppingBag',
    color: '#14b8a6',
    glow: 'rgba(20, 184, 166, 0.4)',
    descriptionEn: 'Amazon, Digikala, eBay, Torob',
    descriptionFa: 'فروشگاه‌های آنلاین، دیجی‌کالا، آمازون و ترب',
  },
  other: {
    key: 'other',
    nameEn: 'General Bookmarks',
    nameFa: 'سایر نشانک‌ها',
    icon: 'Folder',
    color: '#64748b',
    glow: 'rgba(100, 116, 139, 0.4)',
    descriptionEn: 'Other websites and links',
    descriptionFa: 'سایر سایت‌ها و لینک‌های عمومی',
  },
};

export class BookmarkCategorizer {
  private static readonly RULES: {
    category: BookmarkCategoryKey;
    domains: string[];
    keywords: string[];
  }[] = [
    {
      category: 'ai',
      domains: [
        'openai.com', 'chatgpt.com', 'chat.openai.com', 'claude.ai', 'anthropic.com',
        'gemini.google.com', 'huggingface.co', 'midjourney.com', 'perplexity.ai',
        'runwayml.com', 'replicate.com', 'stability.ai', 'deepseek.com', 'groq.com',
        'mistral.ai', 'elevenlabs.io', 'suno.ai', 'udio.com', 'rork.app', 'rork.com',
        'cohere.com', 'weightsandbiases.com', 'wandb.ai', 'kaggle.com', 'poe.com'
      ],
      keywords: [
        'ai', 'gpt', 'llm', 'claude', 'gemini', 'chatgpt', 'artificial intelligence',
        'machine learning', 'deep learning', 'neural', 'prompt', 'model', 'chatbot',
        'voice clone', 'clone voice', 'text to speech', 'speech to text', 'tts',
        'image generation', 'art generator', 'art gen', 'diffusion', 'midjourney',
        'generator', 'generate', 'rork', 'moji', 'avatar'
      ],
    },
    {
      category: 'tools',
      domains: [
        'regex101.com', 'caniuse.com', 'speedtest.net', 'tinypng.com', 'squoosh.app',
        'jsonformatter.org', 'jsonlint.com', 'base64encode.org', 'transform.tools',
        'smallpdf.com', 'ilovepdf.com', 'remove.bg', 'wolframalpha.com', 'diffchecker.com',
        'y2mate.com', 'savefrom.net', 'ytmp3.cc', 'ssyoutube.com', 'snapsave.app',
        'cobalt.tools', '10downloader.com', 'en.savefrom.net'
      ],
      keywords: [
        'downloader', 'download', 'converter', 'convert', 'tool', 'utility', 'calculator',
        'formatter', 'minifier', 'tester', 'validator', 'checker', 'extractor',
        'compressor', 'compress', 'resize', 'editor'
      ],
    },
    {
      category: 'media',
      domains: [
        'youtube.com', 'youtu.be', 'spotify.com', 'netflix.com', 'twitch.tv',
        'soundcloud.com', 'vimeo.com', 'dailymotion.com', 'disneyplus.com',
        'music.apple.com', 'podcasts.google.com', 'castbox.fm', 'aparat.com',
        'filimo.com', 'namava.ir', 'telewebion.com'
      ],
      keywords: [
        'youtube', 'video', 'music', 'song', 'audio', 'stream', 'streaming',
        'podcast', 'playlist', 'album', 'movie', 'film', 'series', 'watch', 'clip'
      ],
    },
    {
      category: 'dev',
      domains: [
        'github.com', 'gitlab.com', 'stackoverflow.com', 'stackexchange.com',
        'npmjs.com', 'yarnpkg.com', 'pypi.org', 'crates.io', 'golang.org',
        'react.dev', 'vuejs.org', 'angular.io', 'nextjs.org', 'svelte.dev',
        'tailwindcss.com', 'vercel.com', 'netlify.com', 'docker.com',
        'kubernetes.io', 'aws.amazon.com', 'azure.microsoft.com', 'digitalocean.com',
        'developer.mozilla.org', 'w3schools.com', 'css-tricks.com', 'codepen.io',
        'jsfiddle.net', 'leetcode.com', 'hackerrank.com', 'typescriptlang.org'
      ],
      keywords: [
        'github', 'git', 'coding', 'programming', 'developer', 'frontend', 'backend',
        'fullstack', 'api', 'sdk', 'repository', 'docs', 'documentation', 'react',
        'typescript', 'javascript', 'python', 'rust', 'golang', 'docker', 'css', 'html'
      ],
    },
    {
      category: 'work',
      domains: [
        'notion.so', 'notion.site', 'slack.com', 'jira.atlassian.com', 'trello.com',
        'linear.app', 'figma.com', 'miro.com', 'asana.com', 'clickup.com',
        'monday.com', 'docs.google.com', 'drive.google.com', 'sheets.google.com',
        'dropbox.com', 'zoom.us', 'meet.google.com', 'teams.microsoft.com',
        'loom.com', 'airtable.com', 'coda.io', 'mail.google.com', 'outlook.com',
        'gmail.com', 'jmail.cc', 'proton.me', 'protonmail.com'
      ],
      keywords: [
        'workspace', 'project', 'board', 'sprint', 'task', 'collaborate', 'design',
        'document', 'spreadsheet', 'presentation', 'meeting', 'mail', 'email', 'inbox', 'calendar'
      ],
    },
    {
      category: 'social',
      domains: [
        'twitter.com', 'x.com', 'linkedin.com', 'reddit.com', 'discord.com',
        'telegram.org', 't.me', 'instagram.com', 'facebook.com', 'threads.net',
        'mastodon.social', 'bsky.app', 'bluesky.web', 'whatsapp.com', 'eitaa.com', 'bale.ai'
      ],
      keywords: [
        'social', 'community', 'forum', 'chat', 'feed', 'profile', 'network',
        'discussion', 'messages', 'channel', 'group'
      ],
    },
    {
      category: 'reading',
      domains: [
        'medium.com', 'substack.com', 'dev.to', 'arxiv.org', 'wikipedia.org',
        'hashnode.dev', 'news.ycombinator.com', 'theverge.com', 'techcrunch.com',
        'wired.com', 'smashingmagazine.com', 'freecodecamp.org', 'virgool.io'
      ],
      keywords: [
        'article', 'blog', 'newspaper', 'research paper', 'newsletter', 'journal', 'essay', 'wiki'
      ],
    },
    {
      category: 'finance',
      domains: [
        'tradingview.com', 'binance.com', 'coinmarketcap.com', 'coingecko.com',
        'coinbase.com', 'stripe.com', 'paypal.com', 'wise.com', 'bloomberg.com',
        'reuters.com', 'investing.com', 'yahoo.com/finance', 'nobitex.ir', 'wallex.ir'
      ],
      keywords: [
        'crypto', 'bitcoin', 'eth', 'trading', 'stock', 'finance', 'wallet',
        'market', 'exchange', 'currency', 'investment', 'bank', 'price'
      ],
    },
    {
      category: 'shopping',
      domains: [
        'amazon.com', 'digikala.com', 'ebay.com', 'aliexpress.com', 'walmart.com',
        'target.com', 'torob.com', 'divar.ir', 'emalls.ir', 'etsy.com', 'shopify.com'
      ],
      keywords: [
        'shop', 'store', 'buy', 'cart', 'order', 'deal', 'product', 'discount', 'digikala', 'torob'
      ],
    },
  ];

  static isGenericFolderName(name: string): boolean {
    const n = name.toLowerCase().trim();
    return (
      n === 'bookmarks bar' ||
      n === 'bookmarks' ||
      n === 'other bookmarks' ||
      n === 'mobile bookmarks' ||
      n === 'نوار نشانک‌ها' ||
      n === 'سایر نشانک‌ها' ||
      n === 'نشانک‌های دیگر' ||
      n === 'imported' ||
      n === 'root' ||
      n === ''
    );
  }

  static categorize(url: string, title: string = '', folderName: string = ''): BookmarkCategoryKey {
    let domain = '';
    try {
      domain = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      domain = url.toLowerCase();
    }

    const titleLower = title.toLowerCase();
    const urlLower = url.toLowerCase();
    const cleanFolder = this.isGenericFolderName(folderName) ? '' : folderName.toLowerCase();

    // 1. Direct domain matching (Highest Priority)
    for (const rule of this.RULES) {
      if (rule.domains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
        return rule.category;
      }
    }

    // 2. Meaningful folder name match
    if (cleanFolder) {
      for (const rule of this.RULES) {
        if (rule.keywords.some((k) => cleanFolder.includes(k))) {
          return rule.category;
        }
      }
    }

    // 3. Title & URL keyword matching
    for (const rule of this.RULES) {
      if (rule.keywords.some((k) => titleLower.includes(k) || urlLower.includes(k))) {
        return rule.category;
      }
    }

    return 'other';
  }

  static processBookmarkTree(nodes: BookmarkNode[], currentFolder: string = ''): CategorizedBookmark[] {
    let list: CategorizedBookmark[] = [];

    for (const node of nodes) {
      if (node.url && !node.url.startsWith('chrome://') && !node.url.startsWith('javascript:')) {
        const category = this.categorize(node.url, node.title || '', currentFolder);
        let domain = '';
        try {
          domain = new URL(node.url).hostname.replace(/^www\./, '');
        } catch {
          domain = node.url;
        }

        list.push({
          id: node.id || `bm_${Math.random().toString(36).slice(2)}`,
          title: node.title || domain || 'Untitled',
          url: node.url,
          category,
          domain,
          folder: currentFolder || 'Bookmarks',
          dateAdded: node.dateAdded,
          faviconUrl: ChromeApiService.getFaviconUrl(node.url),
          tags: [category, currentFolder].filter(Boolean),
        });
      }

      if (node.children && node.children.length > 0) {
        const folderTitle = this.isGenericFolderName(node.title || '')
          ? currentFolder
          : node.title || currentFolder;
        list = list.concat(this.processBookmarkTree(node.children, folderTitle));
      }
    }

    return list;
  }

  static parseHtmlBookmarks(htmlString: string): CategorizedBookmark[] {
    const list: CategorizedBookmark[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach((a, index) => {
      const url = a.getAttribute('href');
      const title = a.textContent?.trim() || '';
      if (!url || url.startsWith('chrome://') || url.startsWith('javascript:')) return;

      const parentDl = a.closest('dl');
      let folder = '';
      if (parentDl && parentDl.previousElementSibling?.tagName === 'H3') {
        folder = parentDl.previousElementSibling.textContent || '';
      }

      const category = this.categorize(url, title, folder);
      let domain = '';
      try {
        domain = new URL(url).hostname.replace(/^www\./, '');
      } catch {
        domain = url;
      }

      list.push({
        id: `imported_${index}_${Date.now()}`,
        title: title || domain,
        url,
        category,
        domain,
        folder: folder || 'Imported',
        faviconUrl: ChromeApiService.getFaviconUrl(url),
        tags: [category, folder].filter(Boolean),
      });
    });

    return list;
  }

  static groupByCategory(bookmarks: CategorizedBookmark[]): Record<BookmarkCategoryKey, CategorizedBookmark[]> {
    const groups: Record<BookmarkCategoryKey, CategorizedBookmark[]> = {
      ai: [],
      dev: [],
      tools: [],
      media: [],
      work: [],
      social: [],
      reading: [],
      finance: [],
      shopping: [],
      other: [],
    };

    for (const bm of bookmarks) {
      if (groups[bm.category]) {
        groups[bm.category].push(bm);
      } else {
        groups.other.push(bm);
      }
    }

    return groups;
  }
}
