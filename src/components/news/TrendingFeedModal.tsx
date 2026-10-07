import React, { useState, useEffect } from 'react';
import { X, TrendingUp, ExternalLink, ThumbsUp, MessageSquare, RefreshCw } from 'lucide-react';
import { NewsService, TechNewsItem } from '../../services/news-service';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';

interface TrendingFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrendingFeedModal: React.FC<TrendingFeedModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useWorkspace();
  const [stories, setStories] = useState<TechNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isFa = settings.language === 'fa';

  const fetchNews = async () => {
    setLoading(true);
    const items = await NewsService.getTopStories(settings.networkEnabled !== false);
    setStories(items);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews();
    }
  }, [isOpen, settings.networkEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel shadow-2xl border border-border-glass overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/20 border border-accent/40 text-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {isFa ? 'داغ‌ترین اخبار فناوری و برنامه‌نویسی' : 'Trending Tech & Hacker News'}
              </h3>
              <p className="text-[11px] text-text-muted">
                {isFa ? 'مهم‌ترین رویدادها و مقالات دنیای توسعه نرم‌افزار' : 'Live pulse from the software engineering community'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchNews}
              disabled={loading}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-40"
              title="Refresh Stories"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stories List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {stories.map((story) => (
            <a
              key={story.id}
              href={story.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col p-3.5 rounded-2xl glass-card border border-border-subtle hover:border-accent/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {story.title}
                </h4>
                <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>

              <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted">
                <span className="px-1.5 py-0.5 rounded bg-bg-glass border border-border-subtle/60 text-text-secondary font-medium">
                  {story.source}
                </span>

                {story.score && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <ThumbsUp className="w-3 h-3" />
                    <span>{formatBilingualNumber(story.score, settings.language)}</span>
                  </span>
                )}

                {story.commentsCount !== undefined && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{formatBilingualNumber(story.commentsCount, settings.language)}</span>
                  </span>
                )}

                <span>• {story.timeAgo}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
