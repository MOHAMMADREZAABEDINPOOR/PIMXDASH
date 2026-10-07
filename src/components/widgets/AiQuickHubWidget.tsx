import React, { useState } from 'react';
import { Sparkles, ArrowRight, Bot, Zap, Code, FileText } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AiQuickHubWidget: React.FC = () => {
  const { settings } = useWorkspace();
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<'chatgpt' | 'claude' | 'gemini'>('chatgpt');
  const isFa = settings.language === 'fa';

  const quickPrompts = [
    {
      title: isFa ? 'توضیح و تحلیل کد' : 'Explain code snippet',
      prompt: 'Explain how this code works step-by-step and highlight potential edge cases:\n\n',
      icon: Code,
    },
    {
      title: isFa ? 'خلاصه‌سازی متن و نکات کلیدی' : 'Summarize key takeaways',
      prompt: 'Summarize the following text into bullet points with actionable takeaways:\n\n',
      icon: FileText,
    },
    {
      title: isFa ? 'بهینه‌سازی و بازنویسی کد' : 'Refactor & optimize function',
      prompt: 'Refactor and optimize this function for clean architecture, type safety, and performance:\n\n',
      icon: Zap,
    },
  ];

  const handleLaunch = (promptText: string) => {
    const text = promptText || customPrompt;
    if (!text.trim()) return;

    if (selectedEngine === 'chatgpt') {
      window.open(`https://chat.openai.com/?q=${encodeURIComponent(text)}`, '_blank');
    } else if (selectedEngine === 'claude') {
      window.open(`https://claude.ai/new?q=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`https://gemini.google.com/app?q=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full p-4 rounded-2xl glass-panel border border-border-subtle select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <h2 className="text-xs font-semibold text-text-primary tracking-wide uppercase">
            {isFa ? 'مرکز پرامپت و ابزارهای هوش مصنوعی' : 'AI Prompt & Intelligence Hub'}
          </h2>
        </div>

        {/* Engine switcher */}
        <select
          value={selectedEngine}
          onChange={(e) => setSelectedEngine(e.target.value as any)}
          className="bg-bg-glass border border-border-subtle text-[11px] rounded-lg px-2 py-0.5 text-text-secondary focus:outline-none"
        >
          <option value="chatgpt" className="bg-bg-base">ChatGPT</option>
          <option value="claude" className="bg-bg-base">Claude</option>
          <option value="gemini" className="bg-bg-base">Gemini</option>
        </select>
      </div>

      {/* Quick Action Prompt Chips */}
      <div className="space-y-1.5 mb-3">
        {quickPrompts.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleLaunch(item.prompt)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-bg-glass hover:bg-bg-hover border border-border-subtle/50 text-xs text-text-secondary hover:text-text-primary transition-all text-start group"
            >
              <div className="flex items-center gap-2 truncate">
                <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate font-medium">{item.title}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Custom Prompt Input */}
      <div className="flex items-center gap-2 pt-1 border-t border-border-subtle/50">
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLaunch(customPrompt);
          }}
          placeholder={isFa ? 'پرامپت دلخواه برای ارسال به هوش مصنوعی...' : 'Ask AI anything or prompt...'}
          className="w-full px-3 py-1.5 rounded-xl bg-bg-glass border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={() => handleLaunch(customPrompt)}
          disabled={!customPrompt.trim()}
          className="p-1.5 rounded-xl bg-accent text-white hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
