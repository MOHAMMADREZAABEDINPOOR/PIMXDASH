import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ArrowRight, Sparkles, Copy, Check, ChevronDown, Github, Globe2, Bot, Images, Video, Newspaper } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { QueryRunner, EvaluationResult } from '../../services/math-runner';
import type { UserSettings } from '../../types';

type EngineId = UserSettings['searchEngine'];
const ENGINES: { id: EngineId; name: string; url: string; icon: 'google' | 'duck' | 'brave' | 'github' | 'chatgpt' | 'bing' }[] = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: 'google' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'bing' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'duck' },
  { id: 'brave', name: 'Brave', url: 'https://search.brave.com/search?q=', icon: 'brave' },
  { id: 'github', name: 'GitHub', url: 'https://github.com/search?q=', icon: 'github' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chat.openai.com/?q=', icon: 'chatgpt' },
];

const EngineIcon: React.FC<{ icon: typeof ENGINES[number]['icon'] }> = ({ icon }) => (
  <span className={`pimx-engine-icon pimx-engine-icon-${icon}`} aria-hidden="true">
    {icon === 'google' ? 'G' : icon === 'duck' ? 'D' : icon === 'brave' ? 'B' : icon === 'github' ? <Github size={15} /> : <Bot size={15} />}
  </span>
);

export const LuminaCommandBar: React.FC = () => {
  const { settings, updateSettings } = useWorkspace();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [engineMenuOpen, setEngineMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const engineMenuRef = useRef<HTMLDivElement | null>(null);
  const engineTriggerRef = useRef<HTMLButtonElement | null>(null);
  const engineOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const t = getTranslations(settings.language);

  const selectedEngine = useMemo(() => {
    return ENGINES.find((e) => e.id === settings.searchEngine) || ENGINES[0];
  }, [settings.searchEngine]);

  useEffect(() => {
    if (!engineMenuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (engineMenuRef.current && !engineMenuRef.current.contains(event.target as Node)) setEngineMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    engineOptionRefs.current[ENGINES.findIndex((engine) => engine.id === selectedEngine.id)]?.focus();
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [engineMenuOpen, selectedEngine.id]);

  const chooseEngine = (id: EngineId) => {
    updateSettings({ searchEngine: id });
    setEngineMenuOpen(false);
    inputRef.current?.focus();
  };

  const handleEngineKeys = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = engineOptionRefs.current.findIndex((option) => option === document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      setEngineMenuOpen(false);
      engineTriggerRef.current?.focus();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const offset = event.key === 'ArrowDown' ? 1 : -1;
      engineOptionRefs.current[(index + offset + ENGINES.length) % ENGINES.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      engineOptionRefs.current[event.key === 'Home' ? 0 : ENGINES.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      setEngineMenuOpen(false);
    }
  };

  // Live Inline Evaluation (Math, Colors, Units, Time)
  const evalResult: EvaluationResult | null = useMemo(() => {
    return QueryRunner.evaluate(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }

    // Check for shortcuts: /youtube, /gh, /reddit, /chatgpt
    if (trimmed.startsWith('/youtube ') || trimmed.startsWith('/yt ')) {
      const q = trimmed.replace(/^\/(youtube|yt)\s+/, '');
      window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      return;
    }
    if (trimmed.startsWith('/github ') || trimmed.startsWith('/gh ')) {
      const q = trimmed.replace(/^\/(github|gh)\s+/, '');
      window.location.href = `https://github.com/search?q=${encodeURIComponent(q)}`;
      return;
    }
    if (trimmed.startsWith('/chatgpt ')) {
      const q = trimmed.replace(/^\/chatgpt\s+/, '');
      window.location.href = `https://chat.openai.com/?q=${encodeURIComponent(q)}`;
      return;
    }

    if (/^(https?:\/\/)?(?:localhost|[a-z\d-]+(?:\.[a-z\d-]+)+)(?::\d+)?(?:[/?#]\S*)?$/i.test(trimmed)) {
      window.location.href = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).href;
      return;
    }
    window.location.href = `${selectedEngine.url}${encodeURIComponent(trimmed)}`;
  };

  const searchGoogleMode = (mode: 'images' | 'videos' | 'news') => {
    const q = query.trim();
    if (!q) { inputRef.current?.focus(); return; }
    const tbm = { images: 'isch', videos: 'vid', news: 'nws' }[mode];
    window.location.href = `https://www.google.com/search?tbm=${tbm}&q=${encodeURIComponent(q)}`;
  };

  const copyResult = () => {
    if (!evalResult) return;
    navigator.clipboard.writeText(evalResult.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pimx-search relative w-full mx-auto z-20">
      <div className="pimx-search-heading"><span className="pimx-search-google">Google</span><span>{settings.language === 'fa' ? 'جست‌وجو در وب یا وارد کردن نشانی سایت' : 'Search the web or enter a website'}</span><kbd>/</kbd></div>

      <div
        className={`pimx-search-surface relative flex flex-col rounded-2xl glass-panel shadow-glass border transition-all duration-300 ${
          isFocused
            ? 'border-accent/60 shadow-glow bg-bg-surface'
            : 'border-border-subtle hover:border-border-glass'
        }`}
      >
        <form onSubmit={handleSearch} className="flex items-center px-4 py-3 gap-3">
          <Search className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-accent' : 'text-text-muted'}`} />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={settings.language === 'fa' ? 'در گوگل جست‌وجو کنید یا نشانی سایت را بنویسید' : 'Search Google or type a website address'}
            aria-label={settings.language === 'fa' ? 'جست‌وجو در وب یا نشانی سایت' : 'Search the web or type a website address'}
            className="w-full bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-muted/60 focus:outline-none"
          />

          {/* Search engine menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="pimx-engine-select" ref={engineMenuRef}>
              <button
                ref={engineTriggerRef}
                type="button"
                className="pimx-engine-trigger"
                aria-label={settings.language === 'fa' ? `موتور جست‌وجو: ${selectedEngine.name}` : `Search engine: ${selectedEngine.name}`}
                aria-haspopup="menu"
                aria-expanded={engineMenuOpen}
                aria-controls="pimx-engine-menu"
                onClick={() => setEngineMenuOpen((open) => !open)}
              >
                <EngineIcon icon={selectedEngine.icon} />
                <span className="pimx-engine-name">{selectedEngine.name}</span>
                <ChevronDown className="pimx-engine-chevron" size={14} aria-hidden="true" />
              </button>
              {engineMenuOpen && (
                <div id="pimx-engine-menu" className="pimx-engine-menu" role="menu" aria-label={settings.language === 'fa' ? 'موتورهای جست‌وجو' : 'Search engines'} onKeyDown={handleEngineKeys}>
                  <div className="pimx-engine-menu-heading"><Globe2 size={12} aria-hidden="true" />{settings.language === 'fa' ? 'موتور جست‌وجو' : 'SEARCH ENGINE'}</div>
                  {ENGINES.map((engine, index) => (
                    <button
                      key={engine.id}
                      ref={(node) => { engineOptionRefs.current[index] = node; }}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selectedEngine.id === engine.id}
                      className="pimx-engine-option"
                      onClick={() => chooseEngine(engine.id)}
                    >
                      <EngineIcon icon={engine.icon} />
                      <span>{engine.name}</span>
                      {selectedEngine.id === engine.id && <Check size={14} className="pimx-engine-check" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

              <button
                type="submit"
                className="pimx-search-submit"
                title={t.pressToSearch}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
          </div>
        </form>

        {/* Live Evaluation Card Dropdown */}
        {evalResult && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-border-subtle/80 bg-accent/5 rounded-b-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
              <div>
                <div className="text-sm font-semibold text-text-primary">{evalResult.result}</div>
                {evalResult.subtext && (
                  <div className="text-[11px] text-text-muted font-mono">{evalResult.subtext}</div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={copyResult}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-bg-glass hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copyResult}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="pimx-search-shortcuts" aria-label="Google search types">
        <button type="button" onClick={() => inputRef.current?.focus()}><Search size={13} /> {settings.language === 'fa' ? 'جست‌وجوی وب' : 'Web search'}</button>
        <button type="button" onClick={() => searchGoogleMode('images')}><Images size={13} /> {settings.language === 'fa' ? 'تصاویر' : 'Images'}</button>
        <button type="button" onClick={() => searchGoogleMode('videos')}><Video size={13} /> {settings.language === 'fa' ? 'ویدیوها' : 'Videos'}</button>
        <button type="button" onClick={() => searchGoogleMode('news')}><Newspaper size={13} /> {settings.language === 'fa' ? 'اخبار' : 'News'}</button>
      </div>
    </div>
  );
};
