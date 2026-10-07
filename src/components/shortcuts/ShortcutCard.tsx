import React from 'react';
import { Trash2, ArrowUpRight } from 'lucide-react';
import { ShortcutItem } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { use3DTilt } from '../../hooks/use3DTilt';
import { SmartFavicon } from '../common/SmartFavicon';

interface ShortcutCardProps {
  shortcut: ShortcutItem;
}

const TILE_COLORS = ['#4af3a2', '#43d9e8', '#a78bfa', '#ffa5c7', '#f8c879', '#87e0c8', '#ff8b65', '#8fc6ff'];

export const ShortcutCard: React.FC<ShortcutCardProps> = ({ shortcut }) => {
  const { removeShortcut, recordShortcutClick, settings } = useWorkspace();

  const { ref, onPointerMove, onPointerLeave } = use3DTilt({
    maxRotation: 7,
    disabled: !settings.animationsEnabled,
  });

  const tileAccent = TILE_COLORS[[...shortcut.url].reduce((total, character) => total + character.charCodeAt(0), 0) % TILE_COLORS.length];

  let cleanDomain = '';
  try {
    cleanDomain = new URL(shortcut.url).hostname.replace(/^www\./, '');
  } catch {
    cleanDomain = shortcut.url;
  }

  const handleClick = () => {
    recordShortcutClick(shortcut.id);
    window.open(shortcut.url, '_blank', 'noopener,noreferrer');
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeShortcut(shortcut.id);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          handleClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`${shortcut.title} — ${cleanDomain}`}
      className="pimx-shortcut group relative flex flex-col items-start justify-end p-4 rounded-2xl glass-card cursor-pointer select-none transition-all duration-200 border border-border-subtle hover:border-accent/40 min-h-[146px]"
      style={{ '--tile-accent': tileAccent } as React.CSSProperties}
    >
      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-2 end-2 p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Remove Shortcut"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="mb-auto">
        <SmartFavicon url={shortcut.url} size={52} categoryColor={tileAccent} title={shortcut.title} />
      </div>

      <span className="pimx-shortcut-title text-[13px] font-bold text-text-primary text-start truncate w-full group-hover:text-accent transition-colors mt-3">
        {shortcut.title}
      </span>
      <span className="pimx-shortcut-domain text-[10px] text-text-muted text-start truncate w-full" dir="ltr">
        {cleanDomain}
      </span>
      {(shortcut.clicks || 0) > 0 && (
        <span className="absolute bottom-3 end-3 text-[9px] font-mono text-text-muted/60">
          {shortcut.clicks}×
        </span>
      )}
      <ArrowUpRight className="pimx-shortcut-arrow" size={13} aria-hidden="true" />
    </div>
  );
};
