import React, { useState, useMemo } from 'react';
import { Plus, ArrowUpRight } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ShortcutCard } from './ShortcutCard';
import { AddShortcutModal } from './AddShortcutModal';
import { getTranslations } from '../../i18n/useTranslation';
import { ShortcutItem } from '../../types';

export const ShortcutsGrid: React.FC = () => {
  const { shortcuts, settings } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = getTranslations(settings.language);

  const filtered = useMemo(() => {
    return [...shortcuts].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.clicks || 0) - (a.clicks || 0));
  }, [shortcuts]);

  return (
    <section className="pimx-launchpad w-full mx-auto my-3 select-none z-10">
      {/* Launchpad */}
      <div className="pimx-section-heading pimx-section-heading-rich flex items-end justify-between gap-3 mb-3">
        <div><div className="pimx-section-kicker"><ArrowUpRight className="w-4 h-4 text-accent" /> {settings.language === 'fa' ? 'دسترسی سریع / ۰۱' : 'YOUR LINKS / 01'}</div><h2>{settings.language === 'fa' ? 'لانچ‌پد' : 'Launchpad'}</h2></div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="pimx-add-shortcut flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass-card hover:text-text-primary text-text-secondary transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span className="hidden sm:inline">{t.addShortcut}</span>
        </button>
      </div>

      {/* Grid of 3D Shortcut Cards */}
      <div className="pimx-shortcut-grid grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {filtered.map((shortcut) => (
          <ShortcutCard key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>

      <AddShortcutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
