import React, { useState } from 'react';
import { Code2, Copy, Check, ExternalLink, Terminal } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface SnippetsWidgetProps {
  onOpenModal?: () => void;
}

export const SnippetsWidget: React.FC<SnippetsWidgetProps> = ({ onOpenModal }) => {
  const { snippets, settings } = useWorkspace();
  const isFa = settings.language === 'fa';
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const displaySnippets = snippets.slice(0, 4);

  return (
    <div className="group relative bg-bg-surface/80 backdrop-blur-xl border border-border-subtle hover:border-border-glow rounded-2xl p-5 transition-all duration-300 shadow-glass flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {isFa ? 'کدهای سریع و اسنیپت‌ها' : 'Quick Snippets'}
            </h3>
            <span className="text-[10px] text-text-muted/70">
              {snippets.length} {isFa ? 'اسنیپت ذخیره شده' : 'saved snippets'}
            </span>
          </div>
        </div>

        {onOpenModal && (
          <button
            onClick={onOpenModal}
            className="flex items-center gap-1 text-[11px] text-accent hover:underline font-medium"
          >
            <span>{isFa ? 'صندوقچه کامل' : 'Open Vault'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Snippet Items */}
      <div className="space-y-2 my-3">
        {displaySnippets.map((snippet) => {
          const isCopied = copiedId === snippet.id;
          return (
            <div
              key={snippet.id}
              onClick={() => handleCopy(snippet.id, snippet.content)}
              className="group/item flex items-center justify-between p-2.5 rounded-xl bg-bg-glass/50 hover:bg-bg-glass border border-border-subtle/40 hover:border-border-glow cursor-pointer transition-all"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-semibold text-text-primary truncate">
                  {snippet.title}
                </div>
                <div className="font-mono text-[10px] text-text-muted truncate mt-0.5">
                  {snippet.content}
                </div>
              </div>

              <div
                className={`p-1.5 rounded-lg text-xs shrink-0 transition-all ${
                  isCopied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-text-muted group-hover/item:text-accent group-hover/item:bg-accent/10'
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border-subtle/30 text-[10px] text-text-muted flex items-center justify-between">
        <span>Click any row to copy</span>
        <span className="font-mono text-accent">1-click clipboard</span>
      </div>
    </div>
  );
};
