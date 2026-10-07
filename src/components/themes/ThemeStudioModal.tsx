import React, { useState } from 'react';
import {
  X,
  Palette,
  Image,
  Sparkles,
  Check,
  Upload,
  Layout,
  Sliders,
  Laptop,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ThemePreset } from '../../types';

interface ThemeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeStudioModal: React.FC<ThemeStudioModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, reorderWidgets, widgets } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'wallpapers' | 'palettes' | 'layouts'>('wallpapers');
  const [customUrl, setCustomUrl] = useState(settings.customWallpaperUrl || '');

  const isFa = settings.language === 'fa';

  if (!isOpen) return null;

  const wallpapers = [
    { id: 'default', nameEn: 'PIMXDASH Dynamic Mesh', nameFa: 'شفق هوشمند پویا', color: '#6366f1' },
    { id: 'cosmic', nameEn: 'Cosmic Nebula & Stars', nameFa: 'سحابی کیهانی و ستارگان', color: '#a855f7' },
    { id: 'rain', nameEn: 'Tokyo Rain on Glass', nameFa: 'باران توکیو بر شیشه', color: '#0284c7' },
    { id: 'sunset', nameEn: 'Solar Sunset Horizon', nameFa: 'افق طلایی و غروب آفتاب', color: '#f97316' },
    { id: 'forest', nameEn: 'Nordic Deep Pine', nameFa: 'جنگل نوردیک مه‌آلود', color: '#10b981' },
    { id: 'oled', nameEn: 'OLED Pure Abyss', nameFa: 'سیاه مطلق OLED', color: '#0a0a0a' },
  ];

  const palettes: { id: ThemePreset; nameEn: string; nameFa: string; color: string }[] = [
    { id: 'obsidian', nameEn: 'Obsidian Pure', nameFa: 'ابسیدین تاریک', color: '#6366f1' },
    { id: 'aurora', nameEn: 'Aurora Borealis', nameFa: 'شفق شمالی', color: '#14b8a6' },
    { id: 'cyberpunk', nameEn: 'Cyberpunk Neon', nameFa: 'سایبرپانک نئونی', color: '#06b6d4' },
    { id: 'ocean', nameEn: 'Oceanic Deep', nameFa: 'اقیانوس عمیق', color: '#3b82f6' },
    { id: 'sunset', nameEn: 'Solar Sunset', nameFa: 'غروب پاییزی', color: '#f97316' },
    { id: 'forest', nameEn: 'Nordic Forest', nameFa: 'طبیعت سبز', color: '#10b981' },
    { id: 'glass', nameEn: 'Liquid Glass', nameFa: 'شیشه کریستالی', color: '#818cf8' },
    { id: 'monochrome', nameEn: 'Monochrome Grayscale', nameFa: 'سیاه و سفید مینیمال', color: '#94a3b8' },
  ];

  const applyLayoutTemplate = (template: 'balanced' | 'developer' | 'zen' | 'productivity') => {
    updateSettings({ layoutTemplate: template });

    if (template === 'zen') {
      // Disable most widgets, keep only clock & minimal
      const zenWidgets = widgets.map((w) => ({
        ...w,
        enabled: w.id === 'quote' || w.id === 'zen',
      }));
      reorderWidgets(zenWidgets);
    } else if (template === 'developer') {
      const devWidgets = widgets.map((w) => ({
        ...w,
        enabled: w.id === 'tasks' || w.id === 'notes' || w.id === 'bookmarks' || w.id === 'pomodoro' || w.id === 'aihub',
      }));
      reorderWidgets(devWidgets);
    } else if (template === 'productivity') {
      const prodWidgets = widgets.map((w) => ({
        ...w,
        enabled: w.id === 'tasks' || w.id === 'habits' || w.id === 'pomodoro' || w.id === 'notes' || w.id === 'calendar',
      }));
      reorderWidgets(prodWidgets);
    } else {
      // Balanced
      const allWidgets = widgets.map((w) => ({
        ...w,
        enabled: true,
      }));
      reorderWidgets(allWidgets);
    }
  };

  const handleCustomUrlSave = () => {
    if (customUrl.trim()) {
      updateSettings({
        wallpaperType: 'custom',
        customWallpaperUrl: customUrl.trim(),
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateSettings({
        wallpaperType: 'custom',
        customWallpaperUrl: base64,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel shadow-2xl border border-border-glass overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/20 border border-accent/40 text-accent shadow-glow">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {isFa ? 'استودیوی قالب‌ها و والپیپرهای فضایی' : 'PIMXDASH Theme & Wallpaper Studio'}
              </h3>
              <p className="text-[11px] text-text-muted">
                {isFa ? 'شخصی‌سازی اتمسفر بصری، پس‌زمینه‌های زنده و چیدمان' : 'Customize visual atmosphere, live wallpapers, and layouts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border-subtle/60">
          <button
            type="button"
            onClick={() => setActiveTab('wallpapers')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'wallpapers' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>{isFa ? 'پس‌زمینه‌های زنده' : 'Live Wallpapers'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('palettes')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'palettes' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isFa ? 'پالت‌های رنگی' : 'Color Palettes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layouts')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'layouts' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>{isFa ? 'قالب‌های چیدمان' : 'Layout Modes'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: WALLPAPERS */}
          {activeTab === 'wallpapers' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wallpapers.map((w) => {
                  const isSelected = settings.wallpaperType === w.id || (!settings.wallpaperType && w.id === 'default');
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => updateSettings({ wallpaperType: w.id as any })}
                      className={`relative flex flex-col items-start p-3.5 rounded-2xl border text-start transition-all ${
                        isSelected
                          ? 'border-accent bg-accent/15 shadow-glow'
                          : 'border-border-subtle bg-bg-glass hover:bg-bg-hover'
                      }`}
                    >
                      <span
                        className="w-full h-12 rounded-xl mb-2.5 opacity-80"
                        style={{
                          background: `linear-gradient(135deg, ${w.color} 0%, rgba(0,0,0,0.8) 100%)`,
                        }}
                      />
                      <span className="text-xs font-bold text-text-primary truncate w-full">
                        {isFa ? w.nameFa : w.nameEn}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2.5 end-2.5 p-1 rounded-full bg-accent text-white shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Image Upload & URL */}
              <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-primary">
                    {isFa ? 'استفاده از عکس دلخواه (آدرس وب یا آپلود)' : 'Custom Wallpaper (URL or Upload)'}
                  </span>
                  <label className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 cursor-pointer shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isFa ? 'آپلود عکس از کامپیوتر' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleCustomUrlSave}
                    className="px-3.5 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-secondary hover:text-text-primary hover:border-accent"
                  >
                    {isFa ? 'اعمال' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PALETTES */}
          {activeTab === 'palettes' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {palettes.map((p) => {
                const isSelected = settings.themePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateSettings({ themePreset: p.id })}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs text-start transition-all ${
                      isSelected
                        ? 'bg-bg-hover border-accent shadow-sm'
                        : 'bg-bg-glass border-border-subtle hover:bg-bg-hover'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate font-medium text-text-primary">
                      {isFa ? p.nameFa : p.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: LAYOUT TEMPLATES */}
          {activeTab === 'layouts' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'balanced',
                  nameEn: 'All-in-One Command Center',
                  nameFa: 'مرکز فرماندهی جامع (همه ویجت‌ها)',
                  descEn: 'Full 12-col dashboard with all productivity & dev modules active.',
                  descFa: 'داشبورد کامل با تمام ویجت‌ها، ابزارها و پنل‌های فعال.',
                },
                {
                  id: 'developer',
                  nameEn: 'Developer Beast Mode',
                  nameFa: 'میز کار مهندسی و برنامه‌نویس',
                  descEn: 'Focused on Dev tools, Bookmarks categorizer, Tasks, AI and Pomodoro.',
                  descFa: 'متمرکز بر ابزارهای برنامه‌نویسی، دسته‌بندی نشانک‌ها و هوش مصنوعی.',
                },
                {
                  id: 'productivity',
                  nameEn: 'Productivity & Habits Sprint',
                  nameFa: 'بهره‌وری، روتین‌ها و استمرار عادت',
                  descEn: 'Habits streak tracker, Pomodoro timer, Tasks, and Calendar agenda.',
                  descFa: 'استمرار عادت‌ها، تایمر پومودورو، تسک‌های اولویت‌دار و تقویم.',
                },
                {
                  id: 'zen',
                  nameEn: 'Minimalist Zen',
                  nameFa: 'آرامش و تمرکز مینیمال (Zen)',
                  descEn: 'Ultra clean space: Giant clock, search bar, and floating dock only.',
                  descFa: 'فضای فوق‌العاده خلوت: فقط ساعت بزرگ، سرچ‌بار و داک شناور پایین.',
                },
              ].map((template) => {
                const isSelected = settings.layoutTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyLayoutTemplate(template.id as any)}
                    className={`flex flex-col items-start p-4 rounded-2xl border text-start transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/15 shadow-glow'
                        : 'border-border-subtle bg-bg-glass hover:bg-bg-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-text-primary">
                        {isFa ? template.nameFa : template.nameEn}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {isFa ? template.descFa : template.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-border-subtle bg-bg-surface/60">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:opacity-90 shadow-sm"
          >
            {isFa ? 'تأیید و بستن' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
