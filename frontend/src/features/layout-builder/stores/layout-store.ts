'use client';

import { create } from 'zustand';
import { type LayoutSection } from '../registry/types';

interface LayoutState {
  /** Sections hien tai (draft) */
  sections: LayoutSection[];
  /** Sections da published */
  publishedSections: LayoutSection[];
  /** Section dang duoc edit (activeId) */
  activeId: string | null;
  /** Dang loading tu API */
  loading: boolean;
  /** Co thay doi chua save */
  isDirty: boolean;
  /** History cho undo/redo */
  history: LayoutSection[][];
  historyIndex: number;

  // Actions
  setSections: (sections: LayoutSection[]) => void;
  setPublishedSections: (sections: LayoutSection[]) => void;
  setActiveId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  addSection: (section: LayoutSection) => void;
  updateSection: (id: string, config: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: LayoutSection[]) => void;
  toggleVisibility: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  resetDirty: () => void;
}

const MAX_HISTORY = 20;

/**
 * Zustand store cho Layout Builder
 * Quan ly sections, history (undo/redo), active section
 */
export const useLayoutStore = create<LayoutState>((set, get) => ({
  sections: [],
  publishedSections: [],
  activeId: null,
  loading: false,
  isDirty: false,
  history: [],
  historyIndex: -1,

  setSections: (sections) => set({ sections, isDirty: false, history: [sections], historyIndex: 0 }),
  setPublishedSections: (publishedSections) => set({ publishedSections }),
  setActiveId: (activeId) => set({ activeId }),
  setLoading: (loading) => set({ loading }),

  addSection: (section) => {
    const { sections } = get();
    const newSections = [...sections, section];
    set({ sections: newSections, isDirty: true });
    get().pushHistory();
  },

  updateSection: (id, config) => {
    const { sections } = get();
    const newSections = sections.map(s =>
      s.id === id ? { ...s, config } : s,
    );
    set({ sections: newSections, isDirty: true });
    get().pushHistory();
  },

  removeSection: (id) => {
    const { sections, activeId } = get();
    const newSections = sections.filter(s => s.id !== id);
    set({
      sections: newSections,
      isDirty: true,
      activeId: activeId === id ? null : activeId,
    });
    get().pushHistory();
  },

  reorderSections: (sections) => {
    const reordered = sections.map((s, i) => ({ ...s, sort: i }));
    set({ sections: reordered, isDirty: true });
    get().pushHistory();
  },

  toggleVisibility: (id) => {
    const { sections } = get();
    const newSections = sections.map(s =>
      s.id === id ? { ...s, visible: s.visible ? 0 : 1 } : s,
    );
    set({ sections: newSections, isDirty: true });
    get().pushHistory();
  },

  moveUp: (id) => {
    const { sections } = get();
    const idx = sections.findIndex(s => s.id === id);
    if (idx <= 0) return;
    const newSections = [...sections];
    [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
    const reordered = newSections.map((s, i) => ({ ...s, sort: i }));
    set({ sections: reordered, isDirty: true });
    get().pushHistory();
  },

  moveDown: (id) => {
    const { sections } = get();
    const idx = sections.findIndex(s => s.id === id);
    if (idx === -1 || idx >= sections.length - 1) return;
    const newSections = [...sections];
    [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
    const reordered = newSections.map((s, i) => ({ ...s, sort: i }));
    set({ sections: reordered, isDirty: true });
    get().pushHistory();
  },

  pushHistory: () => {
    const { sections, history, historyIndex } = get();
    // Cat bo history sau historyIndex (khi undo roi thay doi)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...sections]);
    // Gioi han MAX_HISTORY
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ sections: [...history[newIndex]], historyIndex: newIndex, isDirty: true });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ sections: [...history[newIndex]], historyIndex: newIndex, isDirty: true });
  },

  resetDirty: () => set({ isDirty: false }),
}));
