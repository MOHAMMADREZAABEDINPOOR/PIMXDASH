import React, { useState, useEffect } from 'react';
import { X, Layers, Archive, RefreshCw, Trash2, ExternalLink, Play, Plus, Clock } from 'lucide-react';
import { ChromeApiService, TabInfo } from '../../services/chrome-api';
import { storage } from '../../services/storage';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatBilingualNumber } from '../../i18n/useTranslation';

export interface TabSession {
  id: string;
  name: string;
  timestamp: number;
  tabs: { title: string; url: string; favIconUrl?: string }[];
}

interface TabSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TabSessionsModal: React.FC<TabSessionsModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useWorkspace();
  const [sessions, setSessions] = useState<TabSession[]>([]);
  const [currentTabs, setCurrentTabs] = useState<TabInfo[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [sessionQuery, setSessionQuery] = useState('');
  const [closeAfterSave, setCloseAfterSave] = useState(false);
  const isFa = settings.language === 'fa';

  const loadSessions = async () => {
    const saved = await storage.get<TabSession[]>('tab_sessions', []);
    setSessions(saved);
  };

  const loadCurrentTabs = async () => {
    const tabs = ChromeApiService.isExtension()
      ? await new Promise<TabInfo[]>((resolve) => {
          chrome.tabs.query({ currentWindow: true }, (list) => {
            resolve(list.map((tab) => ({ id: tab.id || 0, title: tab.title || 'Tab', url: tab.url || '', favIconUrl: tab.url ? ChromeApiService.getFaviconUrl(tab.url, 32) : undefined, active: !!tab.active, audible: !!tab.audible })));
          });
        })
      : await ChromeApiService.getOpenTabs();
    setCurrentTabs(tabs);
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
      loadCurrentTabs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStashCurrentTabs = async () => {
    const validTabs = currentTabs.filter((t) => /^https?:\/\//.test(t.url));
    if (validTabs.length === 0) return;

    const newSession: TabSession = {
      id: `sess_${Date.now()}`,
      name: sessionName.trim() || `Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      timestamp: Date.now(),
      tabs: validTabs.map((t) => ({ title: t.title, url: t.url, favIconUrl: t.favIconUrl })),
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);
    await storage.set('tab_sessions', updated);
    setSessionName('');

    // Optional: close tabs in extension if supported
    if (closeAfterSave && ChromeApiService.isExtension() && chrome.tabs) {
      const tabIds = validTabs.map((t) => t.id).filter((id) => typeof id === 'number');
      if (tabIds.length > 0) {
        chrome.tabs.remove(tabIds);
      }
    }
  };

  const handleRestoreSession = (session: TabSession) => {
    session.tabs.forEach((tab) => {
      if (ChromeApiService.isExtension()) chrome.tabs.create({ url: tab.url, active: false });
      else window.open(tab.url, '_blank', 'noopener,noreferrer');
    });
  };

  const renameSession = async (session: TabSession) => {
    const name = window.prompt(isFa ? 'نام جدید نشست' : 'New session name', session.name)?.trim();
    if (!name) return;
    const updated = sessions.map((item) => item.id === session.id ? { ...item, name } : item);
    setSessions(updated); await storage.set('tab_sessions', updated);
  };

  const handleDeleteSession = async (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    await storage.set('tab_sessions', updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel shadow-2xl border border-border-glass overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/20 border border-accent/40 text-accent shadow-glow">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {isFa ? 'مدیر نشست‌ها و ذخیره تب‌های باز (Tab Stash)' : 'Tab Sessions & RAM Stash'}
              </h3>
              <p className="text-[11px] text-text-muted">
                {isFa
                  ? 'ذخیره تب‌های باز در یک کلیک برای آزادسازی رم و بازگردانی سریع'
                  : 'Save and restore a named set of tabs at any time'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stash Current Window Action */}
        <div className="p-4 mx-6 my-4 rounded-2xl bg-accent/10 border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-primary font-medium w-full sm:w-auto">
            <Layers className="w-4 h-4 text-accent" />
            <span>
              {isFa
                ? `${formatBilingualNumber(currentTabs.length, settings.language)} تب باز در پنجره فعلی`
                : `${currentTabs.length} open tabs currently in window`}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder={isFa ? 'نام نشست (اختیاری)...' : 'Session name (optional)...'}
              className="px-3 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent w-full sm:w-44"
            />
            <button
              type="button"
              onClick={handleStashCurrentTabs}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 transition-all shrink-0 shadow-sm"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isFa ? 'ذخیرهٔ تب‌ها' : 'Save tabs'}</span>
            </button>
          </div>
        </div>
        <label className="mx-6 mb-3 text-[11px] text-text-muted flex items-center gap-2"><input type="checkbox" checked={closeAfterSave} onChange={(event) => setCloseAfterSave(event.target.checked)} />{isFa ? 'پس از ذخیره، تب‌ها را ببند' : 'Close tabs after saving'}</label>

        {/* Saved Sessions List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          <input value={sessionQuery} onChange={(event) => setSessionQuery(event.target.value)} placeholder={isFa ? 'جستجوی نشست‌ها…' : 'Search sessions…'} className="pimx-input w-full mb-3" />
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            {isFa ? 'نشست‌های ذخیره شده' : 'Saved Sessions'} ({formatBilingualNumber(sessions.length, settings.language)})
          </div>

          {sessions.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              {isFa ? 'هنوز نشستی ذخیره نشده است.' : 'No saved tab sessions yet.'}
            </div>
          ) : (
            sessions.filter((session) => `${session.name} ${session.tabs.map((tab) => tab.title + tab.url).join(' ')}`.toLowerCase().includes(sessionQuery.toLowerCase())).map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl glass-card border border-border-subtle space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-primary">{session.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-glass text-text-muted">
                      {formatBilingualNumber(session.tabs.length, settings.language)} {isFa ? 'تب' : 'tabs'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => renameSession(session)}
                      className="p-1 text-[11px] text-text-muted hover:text-accent"
                      title="Rename session"
                    >
                      {isFa ? 'تغییر نام' : 'Rename'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRestoreSession(session)}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-accent/20 border border-accent/40 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isFa ? 'بازگردانی همه' : 'Restore All'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tabs Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {session.tabs.slice(0, 6).map((tab, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-bg-glass text-[10px] text-text-secondary truncate max-w-[160px]"
                    >
                      <img src={ChromeApiService.getFaviconUrl(tab.url, 16)} alt="" className="w-3 h-3 rounded" />
                      <span className="truncate">{tab.title}</span>
                    </span>
                  ))}
                  {session.tabs.length > 6 && (
                    <span className="px-1.5 py-1 text-[10px] text-text-muted">
                      +{session.tabs.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
