import React, { useState } from 'react';
import {
  X,
  Palette,
  LayoutGrid,
  Search,
  ShieldCheck,
  Download,
  Upload,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { ThemePreset, ThemeMode, Language } from '../../types';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    settingsOpen,
    setSettingsOpen,
    widgets,
    toggleWidget,
    reorderWidgets,
    exportWorkspace,
    importWorkspace,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'appearance' | 'widgets' | 'search' | 'privacy'>('appearance');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState('');
  const t = getTranslations(settings.language);

  if (!settingsOpen) return null;

  const themePresets: { id: ThemePreset; name: string; color: string }[] = [
    { id: 'obsidian', name: 'Obsidian Pure', color: '#6366f1' },
    { id: 'aurora', name: 'Aurora Borealis', color: '#14b8a6' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#06b6d4' },
    { id: 'ocean', name: 'Oceanic Deep', color: '#3b82f6' },
    { id: 'sunset', name: 'Solar Sunset', color: '#f97316' },
    { id: 'forest', name: 'Nordic Forest', color: '#10b981' },
    { id: 'glass', name: 'Liquid Glass', color: '#818cf8' },
    { id: 'monochrome', name: 'Monochrome', color: '#94a3b8' },
  ];

  const handleExport = async () => {
    const jsonStr = await exportWorkspace();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pimxdash-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const parsed = JSON.parse(content);
        if (!parsed || !Array.isArray(parsed.shortcuts) || !Array.isArray(parsed.flowSpaces) || !Array.isArray(parsed.widgets)) throw new Error('Invalid backup');
        setImportSummary(`${parsed.shortcuts.length} shortcuts · ${parsed.notes?.length || 0} notes · ${parsed.tasks?.length || 0} tasks`);
        setPendingImport(content);
        setImportStatus(null);
      } catch { setImportStatus('Invalid backup file.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
      if (!pendingImport) return;
      const success = await importWorkspace(pendingImport);
      if (success) {
        setImportStatus('Workspace restored successfully!');
        setPendingImport(null);
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid backup file.');
        setTimeout(() => setImportStatus(null), 3000);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl glass-panel shadow-2xl border border-border-glass overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
          <h2 className="text-base font-semibold text-text-primary tracking-wide">
            {t.settings.title}
          </h2>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border-subtle/60 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'appearance'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{t.settings.tabs.appearance}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('widgets')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'widgets'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t.settings.tabs.widgets}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.settings.tabs.search}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'privacy'
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.settings.tabs.privacy}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-5">
              {/* Theme Mode */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.settings.themeMode}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => updateSettings({ themeMode: mode })}
                      className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                        settings.themeMode === mode
                          ? 'bg-accent/20 border-accent text-accent font-semibold'
                          : 'bg-bg-glass border-border-subtle text-text-secondary hover:bg-bg-hover'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Preset Palettes */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.settings.themePreset}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {themePresets.map((tp) => {
                    const isSelected = settings.themePreset === tp.id;
                    return (
                      <button
                        key={tp.id}
                        type="button"
                        onClick={() => updateSettings({ themePreset: tp.id })}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs text-start transition-all ${
                          isSelected
                            ? 'bg-bg-hover border-accent shadow-sm'
                            : 'bg-bg-glass border-border-subtle hover:bg-bg-hover'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                          style={{ backgroundColor: tp.color }}
                        />
                        <span className="truncate font-medium text-text-primary">{tp.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.settings.language}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ language: 'en' })}
                    className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                      settings.language === 'en'
                        ? 'bg-accent/20 border-accent text-accent font-semibold'
                        : 'bg-bg-glass border-border-subtle text-text-secondary'
                    }`}
                  >
                    English (LTR)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ language: 'fa' })}
                    className={`p-3 rounded-xl border text-xs font-medium font-persian transition-all ${
                      settings.language === 'fa'
                        ? 'bg-accent/20 border-accent text-accent font-semibold'
                        : 'bg-bg-glass border-border-subtle text-text-secondary'
                    }`}
                  >
                    فارسی (Persian RTL)
                  </button>
                </div>
              </div>

              {/* Glass Blur Depth */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.settings.glassBlur}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['off', 'subtle', 'medium', 'high'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => updateSettings({ glassBlur: b })}
                      className={`py-2 px-2.5 rounded-xl text-xs capitalize border transition-all ${
                        settings.glassBlur === b
                          ? 'bg-accent/20 border-accent text-accent font-semibold'
                          : 'bg-bg-glass border-border-subtle text-text-secondary'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations & 3D Tilt */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-glass border border-border-subtle">
                <span className="text-xs font-medium text-text-primary">
                  {t.settings.animations}
                </span>
                <input
                  type="checkbox"
                  checked={settings.animationsEnabled}
                  onChange={(e) => updateSettings({ animationsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-accent cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB: WIDGETS */}
          {activeTab === 'widgets' && (
            <div className="space-y-3">
              <p className="text-xs text-text-muted mb-2">
                Enable or disable modular widgets. Enabled widgets display automatically across your workspace.
              </p>
              {widgets.map((widget) => {
                const widgetName = (t.widgets as Record<string, string>)[widget.id] || widget.id;
                return (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg-glass border border-border-subtle hover:bg-bg-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-text-primary">{widgetName}</span>
                      <span className="text-[10px] text-text-muted">
                        ({widget.colSpan} cols)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={widget.colSpan}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const updated = widgets.map((w) =>
                            w.id === widget.id ? { ...w, colSpan: val } : w
                          );
                          reorderWidgets(updated);
                        }}
                        className="bg-bg-surface border border-border-subtle text-[11px] rounded-lg px-2 py-1 text-text-secondary"
                      >
                        <option value="4" className="bg-bg-base">1/3 Width</option>
                        <option value="6" className="bg-bg-base">1/2 Width</option>
                        <option value="12" className="bg-bg-base">Full Width</option>
                      </select>

                      <input
                        type="checkbox"
                        checked={widget.enabled}
                        onChange={() => toggleWidget(widget.id)}
                        className="w-4 h-4 rounded accent-accent cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: SEARCH & CLOCK */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.settings.userName}
                </label>
                <input
                  type="text"
                  value={settings.userName}
                  onChange={(e) => updateSettings({ userName: e.target.value })}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-2 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  {t.settings.clockFormat}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ clockFormat: '24h' })}
                    className={`p-2.5 rounded-xl border text-xs font-medium ${
                      settings.clockFormat === '24h'
                        ? 'bg-accent/20 border-accent text-accent font-semibold'
                        : 'bg-bg-glass border-border-subtle text-text-secondary'
                    }`}
                  >
                    24-Hour (14:30)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ clockFormat: '12h' })}
                    className={`p-2.5 rounded-xl border text-xs font-medium ${
                      settings.clockFormat === '12h'
                        ? 'bg-accent/20 border-accent text-accent font-semibold'
                        : 'bg-bg-glass border-border-subtle text-text-secondary'
                    }`}
                  >
                    12-Hour (02:30 PM)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-glass border border-border-subtle">
                <span className="text-xs font-medium text-text-primary">
                  {t.settings.showSeconds}
                </span>
                <input
                  type="checkbox"
                  checked={settings.showSeconds}
                  onChange={(e) => updateSettings({ showSeconds: e.target.checked })}
                  className="w-4 h-4 rounded accent-accent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-glass border border-border-subtle">
                <span className="text-xs font-medium text-text-primary">
                  {t.settings.weatherUnit}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateSettings({ weatherUnit: 'celsius' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      settings.weatherUnit === 'celsius'
                        ? 'bg-accent text-white'
                        : 'bg-bg-glass text-text-muted'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ weatherUnit: 'fahrenheit' })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      settings.weatherUnit === 'fahrenheit'
                        ? 'bg-accent text-white'
                        : 'bg-bg-glass text-text-muted'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRIVACY & DATA BACKUP */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <label className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-bg-glass border border-border-subtle cursor-pointer"><span><strong className="block text-xs text-text-primary">{settings.language === 'fa' ? 'محتوای آنلاین' : 'Online content'}</strong><span className="block text-[11px] text-text-muted mt-1">{settings.language === 'fa' ? 'آب‌وهوا، RSS، اخبار و آزمون اتصال را متوقف کنید.' : 'Pause weather, RSS, news and connection checks.'}</span></span><input type="checkbox" checked={settings.networkEnabled !== false} onChange={(event) => updateSettings({ networkEnabled: event.target.checked })} className="accent-accent" /></label>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{settings.language === 'fa' ? 'کنترل داده' : 'Data controls'}</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                  {t.settings.privacyStatement}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Backup & Migration
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl glass-card text-xs font-medium text-text-primary hover:border-accent"
                  >
                    <Download className="w-4 h-4 text-accent" />
                    <span>{t.settings.exportBackup}</span>
                  </button>

                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl glass-card text-xs font-medium text-text-primary hover:border-accent cursor-pointer">
                    <Upload className="w-4 h-4 text-accent" />
                    <span>{t.settings.importBackup}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
                {importStatus && (
                  <p className="text-xs text-center text-accent mt-2 font-medium">
                    {importStatus}
                  </p>
                )}
                {pendingImport && <div className="mt-3 p-3 rounded-xl bg-accent/10 border border-accent/30 text-xs text-text-secondary"><strong className="block text-text-primary mb-1">{settings.language === 'fa' ? 'پیش‌نمایش پشتیبان' : 'Backup preview'}</strong><p>{importSummary}</p><p className="mt-1 text-text-muted">{settings.language === 'fa' ? 'داده‌های فضای کاری فعلی با این فایل جایگزین می‌شوند.' : 'This replaces your current workspace data.'}</p><div className="flex gap-2 mt-3"><button onClick={confirmImport} className="pimx-primary">{settings.language === 'fa' ? 'بازیابی' : 'Restore'}</button><button onClick={() => setPendingImport(null)} className="pimx-action">{settings.language === 'fa' ? 'لغو' : 'Cancel'}</button></div></div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-border-subtle bg-bg-surface/50">
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:opacity-90 transition-opacity shadow-sm"
          >
            {t.settings.close}
          </button>
        </div>
      </div>
    </div>
  );
};
