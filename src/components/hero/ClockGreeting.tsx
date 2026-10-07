import React, { useState, useEffect } from 'react';
import { ArrowDownRight, Sparkles, Palette, X, Check } from 'lucide-react';
import { useTime } from '../../hooks/useTime';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { HeroWorldClocks } from './HeroWorldClocks';
import { CLOCK_STYLES, ClockStyleDefinition } from './clockStyles';
import { storage } from '../../services/storage';

export const ClockGreeting: React.FC = () => {
  const { settings, activeSpace } = useWorkspace();
  const { timeString, dateString, greetingKey } = useTime(
    settings.clockFormat === '24h',
    settings.showSeconds,
    settings.language
  );
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';
  const subGreeting = isFa ? activeSpace.descriptionFa : activeSpace.description;

  const [activeStyleId, setActiveStyleId] = useState<string>('cyber-neon');
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [styleFilter, setStyleFilter] = useState<'all' | 'cyber' | 'minimal' | 'retro' | 'chrono' | 'scifi' | 'glow'>('all');

  useEffect(() => {
    storage.get<string>('pimxdash_clock_style', 'cyber-neon').then((id) => {
      if (id) setActiveStyleId(id);
    });
  }, []);

  const handleSelectStyle = (id: string) => {
    setActiveStyleId(id);
    void storage.set('pimxdash_clock_style', id);
  };

  const currentStyle: ClockStyleDefinition =
    CLOCK_STYLES.find((s) => s.id === activeStyleId) || CLOCK_STYLES[0];

  const filteredStyles = CLOCK_STYLES.filter(
    (s) => styleFilter === 'all' || s.category === styleFilter
  );

  return (
    <>
      <section
        className="pimx-hero w-full"
        aria-label={isFa ? 'صفحه آغاز' : 'Dashboard hero'}
        onPointerMove={(event) => {
          if (!settings.animationsEnabled || event.pointerType !== 'mouse') return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty('--hero-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 16}px`);
          event.currentTarget.style.setProperty('--hero-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 12}px`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--hero-x', '0px');
          event.currentTarget.style.setProperty('--hero-y', '0px');
        }}
      >
        <div className="pimx-hero-grid" aria-hidden="true" />
        <div className="pimx-hero-copy">
          <div className="flex items-center justify-between gap-3">
            <div className="pimx-eyebrow">
              <span className="pimx-live-dot" /> PIMXDASH <span className="pimx-eyebrow-rule" />{' '}
              {isFa ? 'سیستم آماده است' : 'SYSTEM READY'}
              {currentStyle.badge && (
                <span className="ms-2 px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider bg-accent/15 text-accent border border-accent/25">
                  {currentStyle.badge}
                </span>
              )}
            </div>

            <button
              onClick={() => setStyleModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono glass-card hover:bg-bg-hover text-text-secondary hover:text-accent border border-border-subtle hover:border-accent/40 transition-all shrink-0"
              title={isFa ? 'انتخاب از بین ۴۰ استایل ساعت' : 'Change Clock Style (40 styles)'}
            >
              <Palette className="w-3.5 h-3.5 text-accent" />
              <span>{isFa ? 'استایل ساعت' : 'Clock Style'}</span>
              <span className="text-[9px] px-1 rounded bg-accent/20 text-accent font-bold">40</span>
            </button>
          </div>

          <div className="pimx-clock-wrap group relative">
            <h1
              className={`pimx-clock ${settings.showSeconds ? 'pimx-clock-seconds' : ''} ${currentStyle.clockClass} transition-all duration-300`}
              dir="ltr"
            >
              {timeString}
            </h1>
            <button
              onClick={() => setStyleModalOpen(true)}
              className="pimx-clock-spark text-accent hover:scale-125 transition-transform"
              title={isFa ? 'تغییر استایل' : 'Customize style'}
            >
              <Sparkles size={22} />
            </button>
          </div>

          <div className="pimx-hero-date">{dateString}</div>
          {settings.showGreeting && (
            <div className="pimx-hero-greeting">
              <p>
                {t.greetings[greetingKey]}
                {settings.userName ? `, ${settings.userName}` : ''}
                <span className="pimx-hero-period">.</span>
              </p>
              <span>{subGreeting}</span>
            </div>
          )}
          <div className="pimx-hero-foot">
            <ArrowDownRight size={15} />
            <span>{isFa ? 'مرکز فرمان شما' : 'YOUR COMMAND CENTER'}</span>
          </div>
        </div>

        <HeroWorldClocks />
      </section>

      {/* 40+ Clock Style Selector Modal */}
      {styleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setStyleModalOpen(false);
          }}
        >
          <div className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl glass-panel border border-border-glass shadow-2xl overflow-hidden pimx-modal-enter">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-bg-surface/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent/20 text-accent">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-base">
                    {isFa ? 'انتخاب استایل ساعت (۴۰ مدل متنوع)' : 'Clock Style Engine (40 Unique Styles)'}
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    {isFa
                      ? 'سبک مورد علاقه خود را انتخاب کنید؛ ظاهر ساعت اصلی زنده بروزرسانی می‌شود.'
                      : 'Choose your preferred aesthetic. Instant live preview across dashboard.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStyleModalOpen(false)}
                className="pimx-action"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-border-subtle/60 overflow-x-auto no-scrollbar bg-bg-surface/40">
              {(
                [
                  ['all', 'All (40)', 'همه (۴۰)'],
                  ['cyber', 'Cyber & Hacker', 'سایبر و هکری'],
                  ['scifi', 'Sci-Fi & Space', 'فضایی و آینده‌نگر'],
                  ['glow', 'Glow & Neon', 'نئون و درخشان'],
                  ['retro', 'Retro & Vintage', 'رترو و نوستالژی'],
                  ['chrono', 'Chronograph', 'کرونوگراف و سرعت'],
                  ['minimal', 'Minimal & Clean', 'مینیمال و اداری'],
                ] as const
              ).map(([cat, en, fa]) => (
                <button
                  key={cat}
                  onClick={() => setStyleFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    styleFilter === cat
                      ? 'bg-accent/20 text-accent border border-accent/40 font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  {isFa ? fa : en}
                </button>
              ))}
            </div>

            {/* Styles Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pimx-scrollbar">
              {filteredStyles.map((style) => {
                const isSelected = activeStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleSelectStyle(style.id)}
                    className={`relative p-4 rounded-2xl border text-start flex flex-col justify-between h-32 transition-all duration-200 group overflow-hidden ${
                      isSelected
                        ? 'border-accent bg-accent/15 shadow-[0_0_30px_rgba(74,243,162,0.25)] ring-1 ring-accent'
                        : 'border-border-subtle bg-bg-glass hover:border-accent/40 hover:bg-bg-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-semibold text-text-primary group-hover:text-accent truncate">
                        {isFa ? style.nameFa : style.nameEn}
                      </span>
                      {isSelected ? (
                        <span className="p-1 rounded-full bg-accent text-bg-surface shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        style.badge && (
                          <span className="text-[9px] font-mono text-text-muted shrink-0 uppercase px-1.5 py-0.5 rounded bg-black/40">
                            {style.badge}
                          </span>
                        )
                      )}
                    </div>

                    {/* Clock Preview */}
                    <div className="my-auto py-1">
                      <div className={`text-2xl font-bold ${style.clockClass} truncate`} dir="ltr">
                        {timeString.slice(0, 5)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-text-muted capitalize">
                      <span>{style.category}</span>
                      <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                        {isFa ? 'اعمال استایل ←' : 'Apply →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-3 px-5 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted bg-bg-surface/80">
              <span>
                {isFa ? `سبک فعلی: ${currentStyle.nameFa}` : `Active: ${currentStyle.nameEn}`}
              </span>
              <button onClick={() => setStyleModalOpen(false)} className="pimx-primary px-4 py-1.5">
                {isFa ? 'تأیید و بستن' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
