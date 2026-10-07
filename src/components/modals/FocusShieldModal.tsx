import React, { useState } from 'react';
import { X, Shield, ShieldAlert, Plus, Trash2, Globe, CheckCircle2, Lock } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FocusShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusShieldModal: React.FC<FocusShieldModalProps> = ({ isOpen, onClose }) => {
  const { focusShield, updateFocusShield, settings } = useWorkspace();
  const isFa = settings.language === 'fa';

  const [newDomain, setNewDomain] = useState('');

  if (!isOpen) return null;

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!/^(?=.{3,253}$)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(clean) || focusShield.blocklist.includes(clean)) return;

    updateFocusShield({
      blocklist: [...focusShield.blocklist, clean],
    });
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    updateFocusShield({
      blocklist: focusShield.blocklist.filter((d) => d !== domain),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-bg-surface/95 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              focusShield.enabled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
            }`}>
              {focusShield.enabled ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {isFa ? 'سپر تمرکز و ضد حواس‌پرتی' : 'Focus Shield & Distraction Guard'}
              </h2>
              <p className="text-xs text-text-muted">
                {isFa
                  ? 'مسدودسازی خودکار شبکه‌های اجتماعی و سایت‌های اتلاف وقت در حین کار عمیق'
                  : 'Guard your deep flow by blocking distracting websites and tab rabbit holes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Master Shield Toggle Banner */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
            focusShield.enabled
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-bg-glass border-border-subtle'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${focusShield.enabled ? 'bg-emerald-400 animate-ping' : 'bg-text-muted'}`} />
              <div>
                <h4 className="text-sm font-bold text-text-primary">
                  {focusShield.enabled
                    ? (isFa ? 'سپر محافظت تمرکز فعال است' : 'Focus Shield is Active')
                    : (isFa ? 'سپر تمرکز خاموش است' : 'Focus Shield is Disabled')}
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  {focusShield.enabled
                    ? (isFa ? `${focusShield.blocklist.length} دامنه در لیست مسدودسازی قرار دارند` : `${focusShield.blocklist.length} domains currently shielded`)
                    : (isFa ? 'برای جلوگیری از حواس‌پرتی سپر را روشن کنید' : 'Enable to block time-sink websites during focus sessions')}
                </p>
              </div>
            </div>

            <button
              onClick={() => updateFocusShield({ enabled: !focusShield.enabled })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                focusShield.enabled
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-accent text-white hover:bg-accent-hover'
              }`}
            >
              {focusShield.enabled ? (isFa ? 'روشن' : 'ENABLED') : (isFa ? 'خاموش' : 'DISABLED')}
            </button>
          </div>

          {/* Add Domain Input */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => updateFocusShield({ autoOnPomodoro: !focusShield.autoOnPomodoro })} className={`px-3 py-2 rounded-xl border ${focusShield.autoOnPomodoro ? 'border-accent text-accent bg-accent/10' : 'border-border-subtle text-text-secondary bg-bg-glass'}`}>{isFa ? 'فعال همراه با پومودورو' : 'Activate during Pomodoro'} {focusShield.autoOnPomodoro ? '✓' : ''}</button>
            <button type="button" onClick={() => updateFocusShield({ strictMode: !focusShield.strictMode })} className={`px-3 py-2 rounded-xl border ${focusShield.strictMode ? 'border-rose-400 text-rose-300 bg-rose-500/10' : 'border-border-subtle text-text-secondary bg-bg-glass'}`}>{isFa ? 'حالت سخت: بستن تب' : 'Strict mode: close tab'} {focusShield.strictMode ? '✓' : ''}</button>
            <button type="button" onClick={() => updateFocusShield({ pauseUntil: Date.now() + 15 * 60_000 })} className="px-3 py-2 rounded-xl border border-border-subtle text-text-secondary bg-bg-glass">{isFa ? 'توقف ۱۵ دقیقه‌ای' : 'Pause 15 min'}</button>
            {focusShield.pauseUntil && focusShield.pauseUntil > Date.now() && <button type="button" onClick={() => updateFocusShield({ pauseUntil: 0 })} className="px-3 py-2 rounded-xl bg-accent/15 text-accent">{isFa ? 'ادامهٔ محافظت' : 'Resume now'}</button>}
          </div>
          <form onSubmit={handleAddDomain} className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder={isFa ? 'نام دامنه (مثال: twitter.com یا instagram.com)' : 'Add domain (e.g. reddit.com, x.com)'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold shadow-glow shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isFa ? 'افزودن دامنه' : 'Add Domain'}</span>
            </button>
          </form>

          {/* Blocklist Domains Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {isFa ? 'دامنه‌های مسدود شده' : 'Shielded Blocklist'}
              </h5>
              <span className="text-[11px] text-text-muted font-mono">
                {focusShield.blocklist.length} {isFa ? 'مورد' : 'domains'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1">
              {focusShield.blocklist.map((domain) => (
                <div
                  key={domain}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-bg-glass/60 border border-border-subtle hover:border-border-glow transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="font-mono text-xs text-text-primary truncate">{domain}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDomain(domain)}
                    className="p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-glass/40 flex items-center justify-between text-xs text-text-muted">
          <span>Shield rules run locally on device with zero telemetry</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold shadow-glow"
          >
            {isFa ? 'بستن' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
