'use client';

import { useEffect } from 'react';
import { useLayoutStore } from '../stores/layout-store';

/**
 * Hook: keyboard shortcuts cho Undo/Redo
 * Ctrl+Z = Undo, Ctrl+Shift+Z = Redo
 */
export function useLayoutHistory() {
  const undo = useLayoutStore(s => s.undo);
  const redo = useLayoutStore(s => s.redo);
  const historyIndex = useLayoutStore(s => s.historyIndex);
  const historyLength = useLayoutStore(s => s.history.length);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo: historyIndex > 0,
    canRedo: historyIndex < historyLength - 1,
    undo,
    redo,
  };
}
