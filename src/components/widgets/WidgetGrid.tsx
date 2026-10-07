import React, { useEffect, useState } from 'react';
import { PanelsTopLeft } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TasksWidget } from './TasksWidget';
import { NotesWidget } from './NotesWidget';
import { PomodoroWidget } from './PomodoroWidget';
import { BookmarksWidget } from './BookmarksWidget';
import { RecentlyVisitedWidget } from './RecentlyVisitedWidget';
import { CalendarWidget } from './CalendarWidget';
import { ZenBreathingWidget } from './ZenBreathingWidget';
import { WisdomQuoteWidget } from './WisdomQuoteWidget';
import { AiQuickHubWidget } from './AiQuickHubWidget';
import { CountdownWidget } from './CountdownWidget';
import { WeatherWidget } from './WeatherWidget';
import { MatrixRainWidget } from './MatrixRainWidget';
import { NetworkPulseWidget } from './NetworkPulseWidget';
import { TabRadarWidget } from './TabRadarWidget';
import { UnitConverterWidget } from './UnitConverterWidget';
import { WidgetId } from '../../types';
import { storage } from '../../services/storage';
import { WIDGET_STYLES, WIDGET_STYLES_KEY, WIDGET_STYLE_EVENT } from './widgetStyles';

interface WidgetGridProps {
  onOpenBookmarksHub?: () => void;
}

const WIDGET_COMPONENTS: Partial<Record<WidgetId, React.ComponentType<any>>> = {
  tasks: TasksWidget,
  notes: NotesWidget,
  pomodoro: PomodoroWidget,
  bookmarks: BookmarksWidget,
  recent: RecentlyVisitedWidget,
  calendar: CalendarWidget,
  zen: ZenBreathingWidget,
  quote: WisdomQuoteWidget,
  aihub: AiQuickHubWidget,
  countdown: CountdownWidget,
  weather: WeatherWidget,
  matrix: MatrixRainWidget,
  netpulse: NetworkPulseWidget,
  tabs: TabRadarWidget,
  converter: UnitConverterWidget,
};

export const WidgetGrid: React.FC<WidgetGridProps> = ({ onOpenBookmarksHub }) => {
  const { widgets, settings } = useWorkspace();
  const [styles, setStyles] = useState<Record<string, number>>({});
  useEffect(() => {
    const refresh = () => { void storage.get<Record<string, number>>(WIDGET_STYLES_KEY, {}).then(setStyles); };
    refresh();
    window.addEventListener(WIDGET_STYLE_EVENT, refresh);
    return () => window.removeEventListener(WIDGET_STYLE_EVENT, refresh);
  }, []);

  // Active enabled widgets: sorted by order
  // Filter only widgets that are enabled; snippets and habits are removed by user request
  const activeWidgets = widgets
    .filter((w) => w.enabled && !['snippets', 'habits', 'worldclock', 'sentinel', 'processes'].includes(w.id))
    .sort((a, b) => a.order - b.order);

  if (activeWidgets.length === 0) return null;

  return (
    <section className="pimx-widgets w-full mx-auto my-4 z-10">
      <div className="pimx-section-heading pimx-section-heading-rich flex items-end justify-between gap-3 mb-4">
        <div><div className="pimx-section-kicker"><PanelsTopLeft className="w-4 h-4 text-accent" /> {settings.language === 'fa' ? 'فضای کاری' : 'WORKSPACE / 02'}</div><h2>{settings.language === 'fa' ? 'اتاق کنترل تو' : 'Your control room'}</h2></div>
        <p>{settings.language === 'fa' ? 'ابزارهایی که هر روز به آن‌ها نیاز داری' : 'Your essentials, all in one place.'}</p>
      </div>
      <div className="pimx-editorial-grid">
        {activeWidgets.map((widget) => {
          const Component = WIDGET_COMPONENTS[widget.id];
          if (!Component) return null;
          const style = WIDGET_STYLES[styles[widget.id] ?? 0] || WIDGET_STYLES[0];

          return (
            <div
              key={widget.id}
              data-widget={widget.id}
              className="pimx-widget-shell min-w-0 w-full transition-all duration-300"
              data-surface={style.surface}
              data-span={widget.colSpan}
              style={{ '--widget-tone': style.color } as React.CSSProperties}
            >
              <Component
                onOpenHub={widget.id === 'bookmarks' ? onOpenBookmarksHub : undefined}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
