'use client';

import { useLayoutStore } from '../stores/layout-store';
import { getSectionDefinition } from '../registry';

/**
 * Editor Panel — slide-in panel ben phai, render editor component
 * theo section type cua activeId
 */
export function SectionEditorPanel() {
  const activeId = useLayoutStore(s => s.activeId);
  const sections = useLayoutStore(s => s.sections);
  const updateSection = useLayoutStore(s => s.updateSection);
  const setActiveId = useLayoutStore(s => s.setActiveId);

  const activeSection = sections.find(s => s.id === activeId);
  if (!activeSection) return null;

  const definition = getSectionDefinition(activeSection.type);
  if (!definition) return null;

  const Editor = definition.EditorComponent;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-medium text-sm">{definition.label}</h3>
        <button onClick={() => setActiveId(null)} className="p-1 hover:bg-gray-100 rounded">✕</button>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Editor
          config={activeSection.config}
          onChange={(newConfig) => updateSection(activeSection.id, newConfig)}
        />
      </div>
    </div>
  );
}
