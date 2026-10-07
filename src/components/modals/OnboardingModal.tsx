import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Globe,
  Palette,
  LayoutGrid,
  Shield,
  Sun,
  Compass,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';
import { ThemePreset, Language } from '../../types';

export const OnboardingModal: React.FC = () => {
  const { settings, updateSettings, widgets, toggleWidget } = useWorkspace();
  const [step, setStep] = useState(1);
  const t = getTranslations(settings.language);

  if (settings.onboardingCompleted) return null;

  const totalSteps = 6;

  const handleFinish = () => {
    updateSettings({ onboardingCompleted: true });
  };

  const themes: { id: ThemePreset; name: string; color: string }[] = [
    { id: 'obsidian', name: 'Obsidian Pure', color: '#6366f1' },
    { id: 'aurora', name: 'Aurora Borealis', color: '#14b8a6' },
    { id: 'cyberpunk', name: 'Cyberpunk', color: '#06b6d4' },
    { id: 'ocean', name: 'Oceanic Deep', color: '#3b82f6' },
    { id: 'sunset', name: 'Solar Sunset', color: '#f97316' },
    { id: 'forest', name: 'Nordic Forest', color: '#10b981' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" onMouseDown={(event) => { if (event.target === event.currentTarget) updateSettings({ onboardingCompleted: true }); }}>
      <div className="relative w-full max-w-lg rounded-3xl glass-panel shadow-2xl p-6 sm:p-8 border border-border-glass animate-in zoom-in-95 duration-200">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
              PIMXDASH Onboarding
            </span>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {step} / {totalSteps}
          </span>
        </div>

        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto shadow-glow">
              <Compass className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">
              Welcome to PIMXDASH
            </h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
              Your new Personal Digital Workspace & Internet Command Center. Let's tailor the experience to your workflow.
            </p>
          </div>
        )}

        {/* STEP 2: CHOOSE LANGUAGE */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-accent" />
              <h3 className="text-base font-semibold text-text-primary">Choose Your Language</h3>
            </div>
            <p className="text-xs text-text-muted">
              Select English (LTR) or Persian (RTL with native Vazirmatn typography).
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => updateSettings({ language: 'en' })}
                className={`p-4 rounded-2xl border text-sm font-medium transition-all ${
                  settings.language === 'en'
                    ? 'bg-accent/20 border-accent text-accent font-bold shadow-sm'
                    : 'bg-bg-glass border-border-subtle text-text-secondary hover:bg-bg-hover'
                }`}
              >
                English (LTR)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ language: 'fa' })}
                className={`p-4 rounded-2xl border text-sm font-medium font-persian transition-all ${
                  settings.language === 'fa'
                    ? 'bg-accent/20 border-accent text-accent font-bold shadow-sm'
                    : 'bg-bg-glass border-border-subtle text-text-secondary hover:bg-bg-hover'
                }`}
              >
                فارسی (RTL)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE THEME */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4 text-accent" />
              <h3 className="text-base font-semibold text-text-primary">Choose Your Theme</h3>
            </div>
            <p className="text-xs text-text-muted">
              Select a curated chromatic aesthetic for your command center.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {themes.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => updateSettings({ themePreset: th.id })}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    settings.themePreset === th.id
                      ? 'bg-bg-hover border-accent shadow-sm'
                      : 'bg-bg-glass border-border-subtle hover:bg-bg-hover'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: th.color }}
                  />
                  <span className="truncate text-text-primary">{th.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CHOOSE WIDGETS */}
        {step === 4 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="w-4 h-4 text-accent" />
              <h3 className="text-base font-semibold text-text-primary">Configure Widgets</h3>
            </div>
            <p className="text-xs text-text-muted">
              Select the initial modules to surface on your new tab.
            </p>
            <div className="max-h-52 overflow-y-auto space-y-1.5 pe-1">
              {widgets.slice(0, 6).map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggleWidget(w.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-bg-glass hover:bg-bg-hover border border-border-subtle text-xs transition-colors"
                >
                  <span className="capitalize text-text-primary font-medium">{w.id} Widget</span>
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      w.enabled ? 'bg-accent text-white' : 'border border-border-subtle'
                    }`}
                  >
                    {w.enabled && <Check className="w-3 h-3" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: PRIVACY & PERMISSIONS */}
        {step === 5 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Your data stays in your browser</h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
              PIMXDASH stores your workspace in browser storage. Weather, news, RSS and favicons use network requests when active.
            </p>
          </div>
        )}

        {/* STEP 6: FINISH */}
        {step === 6 && (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto text-accent shadow-glow">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Your Workspace is Ready</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              Step into your command center. Use <kbd className="px-1.5 py-0.5 rounded bg-bg-glass border border-border-subtle font-mono text-[10px]">Cmd + K</kbd> at any time to execute instant commands.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 mt-4 border-t border-border-subtle">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-accent text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-accent text-white shadow-glow hover:opacity-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Build My Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
