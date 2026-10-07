import { useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export function useKeyboardShortcuts() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    settingsOpen,
    setSettingsOpen,
    toggleSoundscape,
  } = useWorkspace();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an active input or textarea (unless Escape or Cmd+K)
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. Cmd/Ctrl + K or "/" (when not typing in an input) -> Toggle Command Palette
      if ((cmdOrCtrl && e.key.toLowerCase() === 'k') || (!isInput && e.key === '/')) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // 2. Escape -> Close Modals / Command Palette
      if (e.key === 'Escape') {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
          return;
        }
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
      }

      // 3. Cmd/Ctrl + Shift + F -> Open focus controls
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        window.dispatchEvent(new Event('pimxdash:open-focus-shield'));
        return;
      }

      // 4. Cmd/Ctrl + Shift + M -> Toggle Focus Audio Soundscape
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleSoundscape('rain');
        return;
      }

      // 5. Cmd/Ctrl + "," -> Open Settings
      if (cmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(!settingsOpen);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    commandPaletteOpen,
    setCommandPaletteOpen,
    settingsOpen,
    setSettingsOpen,
    toggleSoundscape,
  ]);
}
