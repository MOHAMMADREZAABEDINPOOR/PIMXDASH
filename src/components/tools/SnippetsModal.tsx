import React, { useState } from 'react';
import { X, Copy, Check, Plus, Trash2, Code2, Terminal, MessageSquare, Search, FileText } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SnippetItem } from '../../types';

interface SnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SnippetsModal: React.FC<SnippetsModalProps> = ({ isOpen, onClose }) => {
  const { snippets, addSnippet, removeSnippet, settings } = useWorkspace();
  const isFa = settings.language === 'fa';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Snippet Form
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'code' | 'terminal' | 'prompt' | 'text'>('code');
  const [newLanguage, setNewLanguage] = useState('bash');

  if (!isOpen) return null;

  const handleCopy = (snippet: SnippetItem) => {
    navigator.clipboard.writeText(snippet.content);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSaveSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addSnippet({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      language: newLanguage.trim() || 'text',
    });

    setNewTitle('');
    setNewContent('');
    setIsCreating(false);
  };

  const filteredSnippets = snippets.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.language && s.language.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'prompt':
        return <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
      case 'code':
        return <Code2 className="w-3.5 h-3.5 text-accent" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-bg-surface/95 border border-border-subtle rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/15 text-accent border border-accent/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                {isFa ? 'صندوقچه اسنیپت‌ها و کدهای سریع' : 'Smart Snippets & Command Vault'}
              </h2>
              <p className="text-xs text-text-muted">
                {isFa
                  ? 'دستورات ترمینال، پرامپت‌ها و کدهای پرکاربرد را با ۱ کلیک کپی کنید'
                  : 'Instant 1-click clipboard launcher for terminal commands, prompts & code'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white hover:bg-accent-hover text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isFa ? 'اسنیپت جدید' : 'New Snippet'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-glass transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Create Form Drawer */}
        {isCreating && (
          <form onSubmit={handleSaveSnippet} className="p-4 bg-bg-glass/80 border-b border-border-subtle flex flex-col gap-3 animate-slideDown">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  {isFa ? 'عنوان اسنیپت' : 'Snippet Title'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isFa ? 'مثال: دستور لغو کامیت گیت' : 'e.g., Git Undo Last Commit'}
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  {isFa ? 'دسته‌بندی' : 'Category'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-bg-surface border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent"
                >
                  <option value="code">Code</option>
                  <option value="terminal">Terminal / Bash</option>
                  <option value="prompt">AI Prompt</option>
                  <option value="text">General Text</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-muted block mb-1">
                {isFa ? 'محتوای اسنیپت (دستور یا کد)' : 'Snippet Content / Code'}
              </label>
              <textarea
                required
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="git reset --soft HEAD~1"
                className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-subtle font-mono text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-text-muted hover:text-text-primary hover:bg-bg-glass"
              >
                {isFa ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold shadow-glow"
              >
                {isFa ? 'ذخیره اسنیپت' : 'Save Snippet'}
              </button>
            </div>
          </form>
        )}

        {/* Search & Category Filter Pills */}
        <div className="px-6 py-3 border-b border-border-subtle/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در اسنیپت‌ها...' : 'Search snippets...'}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'terminal', 'prompt', 'code', 'text'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent/20 border border-accent/40 text-accent'
                    : 'bg-bg-glass text-text-muted hover:text-text-primary border border-border-subtle/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-xs">
              {isFa ? 'هیچ اسنیپتی پیدا نشد' : 'No snippets match your filter.'}
            </div>
          ) : (
            filteredSnippets.map((snippet) => {
              const isCopied = copiedId === snippet.id;
              return (
                <div
                  key={snippet.id}
                  className="group relative p-4 rounded-xl bg-bg-glass/50 hover:bg-bg-glass border border-border-subtle/60 hover:border-border-glow transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getCategoryIcon(snippet.category)}
                      <h4 className="text-xs font-semibold text-text-primary truncate">
                        {snippet.title}
                      </h4>
                      {snippet.language && (
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-surface border border-border-subtle text-text-muted">
                          {snippet.language}
                        </span>
                      )}
                    </div>
                    <pre className="font-mono text-[11px] text-text-secondary bg-black/30 p-2 rounded-lg border border-border-subtle/40 overflow-x-auto select-all">
                      {snippet.content}
                    </pre>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleCopy(snippet)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-accent/10 hover:bg-accent text-accent hover:text-white border-accent/20'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isFa ? 'کپی شد!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isFa ? 'کپی' : 'Copy'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => removeSnippet(snippet.id)}
                      className="p-1.5 rounded-xl text-text-muted/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
