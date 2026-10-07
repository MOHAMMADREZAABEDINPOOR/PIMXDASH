import React, { useEffect, useState } from "react";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { AmbientBackground } from "./components/ambient/AmbientBackground";
import { CircadianHorizon } from "./components/ambient/CircadianHorizon";
import { Header } from "./components/header/Header";
import { ClockGreeting } from "./components/hero/ClockGreeting";
import { LuminaCommandBar } from "./components/hero/LuminaCommandBar";
import { ShortcutsGrid } from "./components/shortcuts/ShortcutsGrid";
import { WidgetGrid } from "./components/widgets/WidgetGrid";
import { OnboardingModal } from "./components/modals/OnboardingModal";
import { BookmarkSpotlight } from "./components/bookmarks/BookmarkSpotlight";
import { FloatingDock } from "./components/dock/FloatingDock";

const CommandPalette = React.lazy(() =>
  import("./components/hero/CommandPalette").then((module) => ({
    default: module.CommandPalette,
  })),
);
const SettingsModal = React.lazy(() =>
  import("./components/modals/SettingsModal").then((module) => ({
    default: module.SettingsModal,
  })),
);
const BookmarkCommandCenter = React.lazy(() =>
  import("./components/bookmarks/BookmarkCommandCenter").then((module) => ({
    default: module.BookmarkCommandCenter,
  })),
);
const DevToolsModal = React.lazy(() =>
  import("./components/tools/DevToolsModal").then((module) => ({
    default: module.DevToolsModal,
  })),
);
const TrendingFeedModal = React.lazy(() =>
  import("./components/news/TrendingFeedModal").then((module) => ({
    default: module.TrendingFeedModal,
  })),
);
const ThemeStudioModal = React.lazy(() =>
  import("./components/themes/ThemeStudioModal").then((module) => ({
    default: module.ThemeStudioModal,
  })),
);
const TabSessionsModal = React.lazy(() =>
  import("./components/tabs/TabSessionsModal").then((module) => ({
    default: module.TabSessionsModal,
  })),
);
const WidgetManagerModal = React.lazy(() =>
  import("./components/modals/WidgetManagerModal").then((module) => ({
    default: module.WidgetManagerModal,
  })),
);
const RssReaderModal = React.lazy(() =>
  import("./components/news/RssReaderModal").then((module) => ({
    default: module.RssReaderModal,
  })),
);
const FocusShieldModal = React.lazy(() =>
  import("./components/modals/FocusShieldModal").then((module) => ({
    default: module.FocusShieldModal,
  })),
);
const MainLayout: React.FC = () => {
  useKeyboardShortcuts();
  const { commandPaletteOpen, settingsOpen } = useWorkspace();

  const [bookmarksHubOpen, setBookmarksHubOpen] = useState(false);
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [trendingFeedOpen, setTrendingFeedOpen] = useState(false);
  const [themeStudioOpen, setThemeStudioOpen] = useState(false);
  const [tabSessionsOpen, setTabSessionsOpen] = useState(false);
  const [widgetManagerOpen, setWidgetManagerOpen] = useState(false);
  const [rssReaderOpen, setRssReaderOpen] = useState(false);
  const [focusShieldOpen, setFocusShieldOpen] = useState(false);
  useEffect(() => {
    const openFocusShield = () => setFocusShieldOpen(true);
    window.addEventListener('pimxdash:open-focus-shield', openFocusShield);
    return () => window.removeEventListener('pimxdash:open-focus-shield', openFocusShield);
  }, []);

  return (
    <div className="pimx-app pimx-compact relative min-h-screen flex flex-col justify-between text-text-primary overflow-x-hidden pb-24">
      {/* Ambient background with GPU-friendly chromatic layers & noise */}
      <AmbientBackground />

      {/* Circadian Solar Horizon Ribbon */}
      <CircadianHorizon />

      {/* Main Workspace Frame — Edge-to-edge Cybernetic Command Center */}
      <div className="relative flex-1 flex flex-col items-center z-10 w-full px-0">
        {/* Minimal Header */}
        <Header onOpenBookmarks={() => setBookmarksHubOpen(true)} />

        {/* Central Command & Hero Stage — full-bleed edge-to-edge */}
        <main className="pimx-main w-full flex-1 flex flex-col items-center justify-start">
          <div className="pimx-command-stage w-full">
            <ClockGreeting />
            <LuminaCommandBar />
          </div>
          <BookmarkSpotlight onOpen={() => setBookmarksHubOpen(true)} />
          <ShortcutsGrid />
          <WidgetGrid onOpenBookmarksHub={() => setBookmarksHubOpen(true)} />
        </main>

        {/* Minimal Subtle Footer */}
        <footer className="w-full mx-auto py-3 flex items-center justify-between text-[11px] text-text-muted/70 select-none z-10 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>PIMXDASH · Your data, your command</span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Press{" "}
              <kbd className="font-mono bg-bg-glass px-1.5 py-0.5 rounded border border-border-subtle">
                {navigator.platform.toUpperCase().includes("MAC")
                  ? "⌘K"
                  : "Ctrl K"}
              </kbd>{" "}
              for Command Center
            </span>
          </div>
        </footer>
      </div>

      {/* Spatial Floating Dock */}
      <FloatingDock
        onOpenBookmarks={() => setBookmarksHubOpen(true)}
        onOpenDevTools={() => setDevToolsOpen(true)}
        onOpenNews={() => setTrendingFeedOpen(true)}
        onOpenThemeStudio={() => setThemeStudioOpen(true)}
        onOpenTabSessions={() => setTabSessionsOpen(true)}
        onOpenWidgetManager={() => setWidgetManagerOpen(true)}
        onOpenRss={() => setRssReaderOpen(true)}
        onOpenFocusShield={() => setFocusShieldOpen(true)}
      />

      {/* Modals & Overlays */}
      <OnboardingModal />
      <React.Suspense
        fallback={
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        }
      >
        {commandPaletteOpen && <CommandPalette />}
        {settingsOpen && <SettingsModal />}
        {bookmarksHubOpen && (
          <BookmarkCommandCenter
            isOpen={bookmarksHubOpen}
            onClose={() => setBookmarksHubOpen(false)}
          />
        )}
        {devToolsOpen && (
          <DevToolsModal
            isOpen={devToolsOpen}
            onClose={() => setDevToolsOpen(false)}
          />
        )}
        {trendingFeedOpen && (
          <TrendingFeedModal
            isOpen={trendingFeedOpen}
            onClose={() => setTrendingFeedOpen(false)}
          />
        )}
        {themeStudioOpen && (
          <ThemeStudioModal
            isOpen={themeStudioOpen}
            onClose={() => setThemeStudioOpen(false)}
          />
        )}
        {tabSessionsOpen && (
          <TabSessionsModal
            isOpen={tabSessionsOpen}
            onClose={() => setTabSessionsOpen(false)}
          />
        )}
        {widgetManagerOpen && (
          <WidgetManagerModal
            isOpen={widgetManagerOpen}
            onClose={() => setWidgetManagerOpen(false)}
          />
        )}
        {rssReaderOpen && (
          <RssReaderModal
            isOpen={rssReaderOpen}
            onClose={() => setRssReaderOpen(false)}
          />
        )}
        {focusShieldOpen && (
          <FocusShieldModal
            isOpen={focusShieldOpen}
            onClose={() => setFocusShieldOpen(false)}
          />
        )}
      </React.Suspense>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WorkspaceProvider>
      <MainLayout />
    </WorkspaceProvider>
  );
};

export default App;
