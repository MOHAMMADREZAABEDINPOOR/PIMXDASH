import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Tag, Flag } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTranslations, formatBilingualNumber } from '../../i18n/useTranslation';

export const TasksWidget: React.FC = () => {
  const { tasks, addTask, toggleTask, removeTask, settings } = useWorkspace();
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const t = getTranslations(settings.language);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), priority);
    setNewTitle('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="pimx-work-card pimx-tasks-card flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-accent" />
          <h2 className="text-xs font-semibold text-text-primary tracking-wide uppercase">
            {t.widgets.tasks}
          </h2>
        </div>
        <span className="text-[11px] text-text-muted">
          {formatBilingualNumber(completedCount, settings.language)} / {formatBilingualNumber(tasks.length, settings.language)} {t.tasks.completedCount}
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAdd} className="pimx-task-form flex items-center gap-2 mb-3">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={t.tasks.newTaskPlaceholder}
          className="w-full px-3 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as any)}
          className="bg-bg-glass border border-border-subtle text-text-secondary text-xs rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="low" className="bg-bg-base">{t.tasks.priorityLow}</option>
          <option value="medium" className="bg-bg-base">{t.tasks.priorityMedium}</option>
          <option value="high" className="bg-bg-base">{t.tasks.priorityHigh}</option>
        </select>
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="p-1.5 rounded-xl bg-accent text-white hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </form>

      {/* Tasks List */}
      <div className="pimx-task-list flex-1 overflow-y-auto space-y-1.5 pe-1 min-h-[140px] max-h-[220px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-text-muted py-6 text-center">
            {t.tasks.emptyState}
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="pimx-task-row group flex items-center justify-between p-2 rounded-xl bg-bg-glass hover:bg-bg-hover border border-border-subtle transition-all"
            >
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2.5 flex-1 truncate text-start text-xs"
              >
                {task.completed ? (
                  <CheckSquare className="w-4 h-4 text-accent shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-text-muted hover:text-text-primary shrink-0" />
                )}
                <span
                  className={`truncate ${
                    task.completed
                      ? 'line-through text-text-muted'
                      : 'text-text-primary'
                  }`}
                >
                  {task.title}
                </span>
              </button>

              <div className="flex items-center gap-2 shrink-0 ms-2">
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                    task.priority === 'high'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {task.priority}
                </span>

                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="p-1 rounded text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
