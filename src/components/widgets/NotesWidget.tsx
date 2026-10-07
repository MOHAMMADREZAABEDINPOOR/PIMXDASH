import React, { useState } from 'react';
import { FileText, Plus, Trash2, Eye, Edit3, Download, Bold, Code, CheckSquare, List } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations } from '../../i18n/useTranslation';

export const NotesWidget: React.FC = () => {
  const { notes, addNote, updateNote, removeNote, settings } = useWorkspace();
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [isPreview, setIsPreview] = useState(false);
  const t = getTranslations(settings.language);
  const isFa = settings.language === 'fa';

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleCreateNote = () => {
    addNote(isFa ? 'یادداشت جدید' : 'New Note', '');
    setIsPreview(false);
  };

  const handleExportMarkdown = () => {
    if (!activeNote) return;
    const blob = new Blob([`# ${activeNote.title}\n\n${activeNote.content}`], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeNote.title.replace(/[/\\?%*:|"<>]/g, '_') || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    if (!activeNote) return;
    const textarea = document.getElementById(`note-textarea-${activeNote.id}`) as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selection = text.substring(start, end);
    const replacement = `${prefix}${selection || 'text'}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    updateNote(activeNote.id, { content: newContent });
  };

  // Lightweight safe Markdown renderer
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-text-muted italic">{isFa ? 'یادداشت خالی است...' : 'Note is empty...'}</p>;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-bold text-text-primary mt-2 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-base font-bold text-accent mt-3 mb-1">{line.slice(3)}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-lg font-bold text-text-primary border-b border-border-subtle pb-1 mt-3 mb-2">{line.slice(2)}</h1>;
      }
      // Checkboxes
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const checked = line.startsWith('- [x] ');
        return (
          <div key={idx} className="flex items-center gap-2 my-0.5 text-xs">
            <input type="checkbox" checked={checked} readOnly className="rounded border-border-subtle accent-accent" />
            <span className={checked ? 'line-through text-text-muted' : 'text-text-primary'}>
              {line.slice(6)}
            </span>
          </div>
        );
      }
      // Unordered list
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-text-primary my-0.5">
            {line.slice(2)}
          </li>
        );
      }
      // Code block
      if (line.startsWith('```')) {
        return <div key={idx} className="font-mono text-[11px] bg-black/40 text-emerald-300 p-2 rounded-lg my-1 overflow-x-auto border border-border-subtle/50">{line.slice(3)}</div>;
      }
      // Plain line with inline code / bold
      const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      return (
        <p key={idx} className="text-xs text-text-secondary leading-relaxed min-h-[1.2rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className="bg-bg-glass px-1 py-0.5 rounded font-mono text-[10px] text-accent border border-border-subtle">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-semibold text-text-primary">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  const wordCount = activeNote?.content ? activeNote.content.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="pimx-work-card pimx-notes-card flex flex-col h-full p-4 rounded-2xl bg-bg-surface/80 backdrop-blur-xl border border-border-subtle hover:border-border-glow select-none transition-all shadow-glass">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-accent/10 text-accent">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-text-primary tracking-wide uppercase">
              {t.widgets.notes} <span className="text-[10px] text-accent/80 font-mono lowercase">.md</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {activeNote && (
            <>
              {/* Preview Toggle */}
              <button
                type="button"
                onClick={() => setIsPreview(!isPreview)}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 border ${
                  isPreview
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg-glass text-text-muted hover:text-text-primary border-border-subtle'
                }`}
                title={isPreview ? 'Edit mode' : 'Markdown preview'}
              >
                {isPreview ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-glass border border-border-subtle transition-colors"
                title={isFa ? 'خروجی فایل مارک‌داون' : 'Export as .md'}
              >
                <Download className="w-3 h-3" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCreateNote}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 text-xs font-medium transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>{t.notes.newNote}</span>
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-xs text-text-muted py-8">
          <p className="mb-2">{t.notes.emptyState}</p>
          <button
            type="button"
            onClick={handleCreateNote}
            className="px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-medium"
          >
            {t.notes.newNote}
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 gap-2">
          {/* Note Tab Switcher */}
          <div className="pimx-note-tabs flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setIsPreview(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium truncate max-w-[120px] transition-all ${
                  activeNote && activeNote.id === note.id
                    ? 'bg-accent/20 border border-accent/40 text-accent font-semibold shadow-sm'
                    : 'bg-bg-glass text-text-muted hover:text-text-primary border border-border-subtle'
                }`}
              >
                {note.title || 'Untitled'}
              </button>
            ))}
          </div>

          {/* Active Note Editor */}
          {activeNote && (
            <div className="flex-1 flex flex-col gap-2 min-h-[160px]">
              <div className="flex items-center justify-between gap-2 px-1">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  placeholder={t.notes.titlePlaceholder}
                  className="w-full bg-transparent font-semibold text-xs text-text-primary focus:outline-none placeholder:text-text-muted/60"
                />

                <button
                  type="button"
                  onClick={() => removeNote(activeNote.id)}
                  className="p-1 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Formatting Toolbar when in edit mode */}
              {!isPreview && (
                <div className="flex items-center gap-1 px-1 py-0.5 border-b border-border-subtle/40 text-text-muted">
                  <button
                    type="button"
                    onClick={() => insertSnippet('**', '**')}
                    title="Bold"
                    className="p-1 rounded hover:bg-bg-glass hover:text-text-primary"
                  >
                    <Bold className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('`', '`')}
                    title="Inline code"
                    className="p-1 rounded hover:bg-bg-glass hover:text-text-primary"
                  >
                    <Code className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('- ')}
                    title="Bullet List"
                    className="p-1 rounded hover:bg-bg-glass hover:text-text-primary"
                  >
                    <List className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertSnippet('- [ ] ')}
                    title="Task Checkbox"
                    className="p-1 rounded hover:bg-bg-glass hover:text-text-primary"
                  >
                    <CheckSquare className="w-3 h-3" />
                  </button>

                  <div className="ml-auto font-mono text-[10px] text-text-muted/60">
                    {wordCount} {isFa ? 'کلمه' : 'words'}
                  </div>
                </div>
              )}

              {/* Body: Edit vs Preview */}
              {isPreview ? (
                <div className="w-full flex-1 p-3 rounded-xl bg-bg-glass border border-border-subtle overflow-y-auto max-h-[190px] select-text">
                  {renderMarkdown(activeNote.content)}
                </div>
              ) : (
                <textarea
                  id={`note-textarea-${activeNote.id}`}
                  value={activeNote.content}
                  onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder={t.notes.contentPlaceholder}
                  className="pimx-note-editor w-full flex-1 p-2.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted/60 resize-none focus:outline-none focus:border-accent font-sans"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
