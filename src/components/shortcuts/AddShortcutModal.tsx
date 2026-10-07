import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Globe, Sparkles, Tag, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { ShortcutItem } from '../../types';
import { SmartFavicon } from '../common/SmartFavicon';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_PRESETS: { title: string; url: string; category: ShortcutItem['category'] }[] = [
  { title: 'GitHub', url: 'https://github.com', category: 'dev' },
  { title: 'ChatGPT', url: 'https://chatgpt.com', category: 'ai' },
  { title: 'Claude', url: 'https://claude.ai', category: 'ai' },
  { title: 'YouTube', url: 'https://youtube.com', category: 'entertainment' },
  { title: 'X / Twitter', url: 'https://x.com', category: 'social' },
  { title: 'Figma', url: 'https://figma.com', category: 'work' },
  { title: 'Notion', url: 'https://notion.so', category: 'work' },
  { title: 'Dribbble', url: 'https://dribbble.com', category: 'work' },
];

export const AddShortcutModal: React.FC<AddShortcutModalProps> = ({ isOpen, onClose }) => {
  const { addShortcut, settings } = useWorkspace();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<ShortcutItem['category']>('general');
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute live preview values
  const previewUrl = useMemo(() => {
    let u = url.trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) {
      u = `https://${u}`;
    }
    try {
      new URL(u);
      return u;
    } catch {
      return '';
    }
  }, [url]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[0]) => {
    setTitle(preset.title);
    setUrl(preset.url);
    setCategory(preset.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = url.trim();
    if (!finalUrl) return;

    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      try {
        finalTitle = new URL(finalUrl).hostname.replace(/^www\./, '');
      } catch {
        finalTitle = finalUrl.replace(/^https?:\/\//, '');
      }
    }

    addShortcut({
      title: finalTitle,
      url: finalUrl,
      category,
    });

    setTitle('');
    setUrl('');
    setCategory('general');
    onClose();
  };

  const categories: { id: ShortcutItem['category']; label: string }[] = [
    { id: 'general', label: t.categories.general },
    { id: 'dev', label: t.categories.dev },
    { id: 'ai', label: t.categories.ai },
    { id: 'work', label: t.categories.work },
    { id: 'social', label: t.categories.social },
    { id: 'entertainment', label: t.categories.entertainment },
    { id: 'finance', label: t.categories.finance },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Body */}
      <div
        className="relative w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-7 border border-border-glass shadow-2xl z-10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary tracking-tight">
                {t.addShortcut}
              </h2>
              <p className="text-[11px] text-text-muted">
                {isFa
                  ? 'یک میانبر سریع برای دسترسی آسان به وب‌سایت‌های مورد علاقه‌تان بسازید'
                  : 'Pin a quick launcher card for your favorite website or web app'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass border border-transparent hover:border-border-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{isFa ? 'پیشنهادهای سریع و محبوب:' : 'Quick Presets:'}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {POPULAR_PRESETS.map((preset) => {
              const isActive = url.includes(preset.url.replace(/^https?:\/\//, ''));
              return (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-bg-glass text-text-muted hover:text-text-primary hover:bg-bg-hover border border-border-subtle'
                  }`}
                >
                  {preset.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Card Preview (if URL or title entered) */}
        {previewUrl && (
          <div className="mb-5 p-3 rounded-2xl bg-bg-glass border border-border-subtle flex items-center gap-3.5">
            <SmartFavicon url={previewUrl} size={48} categoryColor="#4af3a2" title={title} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-text-primary truncate">
                {title.trim() || previewUrl.replace(/^https?:\/\//, '').split('/')[0]}
              </div>
              <div className="text-[11px] text-text-muted font-mono truncate" dir="ltr">
                {previewUrl}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold bg-accent/15 text-accent border border-accent/20">
                  {categories.find((c) => c.id === category)?.label || category}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono">● auto logo ON</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {t.shortcutUrl} <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. github.com or https://..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-glass border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent font-mono placeholder:font-sans placeholder:text-text-muted/60 transition-all text-start"
                autoFocus
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              {t.shortcutTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isFa ? 'اختیاری — مثال: گیت‌هاب' : 'Optional — e.g. GitHub'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-bg-glass border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent placeholder:text-text-muted/60 transition-all"
            />
          </div>

          {/* Category Chips Selector */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>{t.shortcutCategory}</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent text-white shadow-sm font-semibold'
                        : 'bg-bg-glass text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-border-subtle'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-subtle mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover border border-transparent hover:border-border-subtle transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:opacity-95 disabled:opacity-40 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
