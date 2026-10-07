import React, { useState } from 'react';
import { X, Wrench, Code, Binary, Hash, Palette, Copy, Check } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface DevToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevToolsModal: React.FC<DevToolsModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'json' | 'base64' | 'uuid' | 'color'>('json');
  const [copied, setCopied] = useState(false);

  // JSON State
  const [jsonInput, setJsonInput] = useState('{"name":"PIMXDASH","version":"1.0","speed":"instant"}');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Base64 State
  const [b64Input, setB64Input] = useState('Hello PIMXDASH!');
  const [b64Output, setB64Output] = useState('');

  // UUID State
  const [uuid, setUuid] = useState<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c9bf9e57-1685-4c89-bafb-ff5af830be8a'
  );

  // Color State
  const [colorInput, setColorInput] = useState('#6366f1');

  if (!isOpen) return null;

  const handleJsonFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleJsonMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const handleBase64Encode = () => {
    try {
      setB64Output(btoa(b64Input));
    } catch (e: any) {
      setB64Output(`Error: ${e.message}`);
    }
  };

  const handleBase64Decode = () => {
    try {
      setB64Output(atob(b64Input));
    } catch (e: any) {
      setB64Output(`Error: ${e.message}`);
    }
  };

  const generateUuid = () => {
    setUuid(crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-3xl glass-panel shadow-2xl border border-border-glass overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent/20 border border-accent/40 text-accent">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">PIMXDASH Developer Toolbox</h3>
              <p className="text-[11px] text-text-muted">Instant client-side developer utilities</p>
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

        {/* Tab Nav */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border-subtle/60 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'json' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Formatter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('base64')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'base64' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Base64</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uuid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'uuid' ? 'bg-accent text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>UUID Generator</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'json' && (
            <div className="space-y-3">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={10}
                className="w-full p-3 rounded-2xl bg-bg-glass border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent resize-none"
                placeholder="Paste raw JSON here..."
              />
              {jsonError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono">
                  {jsonError}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleJsonFormat}
                    className="px-3.5 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 shadow-sm"
                  >
                    Beautify
                  </button>
                  <button
                    type="button"
                    onClick={handleJsonMinify}
                    className="px-3.5 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-text-secondary text-xs hover:text-text-primary"
                  >
                    Minify
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => copyText(jsonInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-text-primary bg-bg-glass border border-border-subtle"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'base64' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Input Text / Encoded String</label>
                <textarea
                  value={b64Input}
                  onChange={(e) => setB64Input(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-2xl bg-bg-glass border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBase64Encode}
                  className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90"
                >
                  Encode to Base64
                </button>
                <button
                  type="button"
                  onClick={handleBase64Decode}
                  className="px-4 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-text-secondary text-xs hover:text-text-primary"
                >
                  Decode from Base64
                </button>
              </div>

              {b64Output && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-text-muted">Result</label>
                    <button
                      type="button"
                      onClick={() => copyText(b64Output)}
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-2xl bg-bg-surface border border-border-subtle font-mono text-xs text-text-primary break-all select-all">
                    {b64Output}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'uuid' && (
            <div className="space-y-4 text-center py-6">
              <div className="p-4 rounded-2xl bg-bg-surface border border-border-subtle font-mono text-sm sm:text-base text-accent font-semibold select-all">
                {uuid}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={generateUuid}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 shadow-sm"
                >
                  Generate New UUID v4
                </button>
                <button
                  type="button"
                  onClick={() => copyText(uuid)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-glass border border-border-subtle text-text-secondary text-xs hover:text-text-primary"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy UUID'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
