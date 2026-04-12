'use client';

import { X, Eye, EyeOff } from 'lucide-react';
import { useLayoutStore } from '../stores/layout-store';
import { getSectionDefinition } from '../registry';

/**
 * Editor Panel — Shopee style slide-in panel ben phai
 * Header voi ten section + toggle visibility + close
 * Body: render EditorComponent tuong ung
 * Footer: nut Luu
 */
export function SectionEditorPanel() {
  const activeId = useLayoutStore(s => s.activeId);
  const sections = useLayoutStore(s => s.sections);
  const updateSection = useLayoutStore(s => s.updateSection);
  const toggleVisibility = useLayoutStore(s => s.toggleVisibility);
  const setActiveId = useLayoutStore(s => s.setActiveId);

  const activeSection = sections.find(s => s.id === activeId);
  if (!activeSection) return null;

  const definition = getSectionDefinition(activeSection.type);
  if (!definition) return null;

  const Editor = definition.EditorComponent;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => setActiveId(null)}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[360px] bg-white border-l shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm text-gray-800">{definition.label}</h3>
            <button
              onClick={() => toggleVisibility(activeSection.id)}
              className="p-1 rounded hover:bg-gray-200 transition"
              title={activeSection.visible ? 'An section' : 'Hien section'}
            >
              {activeSection.visible ? (
                <Eye className="w-4 h-4 text-gray-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-orange-500" />
              )}
            </button>
          </div>
          <button
            onClick={() => setActiveId(null)}
            className="p-1 rounded hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto p-4">
          <Editor
            config={activeSection.config}
            onChange={(newConfig) => updateSection(activeSection.id, newConfig)}
          />
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 bg-gray-50">
          <button
            onClick={() => setActiveId(null)}
            className="w-full py-2 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 transition"
          >
            Luu
          </button>
        </div>
      </div>
    </>
  );
}
