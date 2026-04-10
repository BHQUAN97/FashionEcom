'use client';

import { useDraggable } from '@dnd-kit/core';
import { getAllSectionDefinitions } from '../registry';
import { type SectionDefinition } from '../registry/types';

/**
 * Palette item — drag source trong sidebar
 */
function PaletteItem({ definition }: { definition: SectionDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { type: 'palette', sectionType: definition.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-grab text-sm hover:bg-gray-50 transition ${isDragging ? 'opacity-50' : ''}`}
    >
      <span className="text-gray-400 text-xs">{definition.icon}</span>
      <span>{definition.label}</span>
    </div>
  );
}

/**
 * Section Palette — sidebar danh sach section types (grouped)
 */
export function SectionPalette() {
  const definitions = getAllSectionDefinitions();

  const groups = [
    { key: 'media', label: 'Media' },
    { key: 'product', label: 'San pham' },
    { key: 'content', label: 'Noi dung' },
    { key: 'utility', label: 'Tien ich' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm text-gray-700">Them section</h3>
      {groups.map(g => {
        const items = definitions.filter(d => d.group === g.key);
        if (items.length === 0) return null;
        return (
          <div key={g.key}>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">{g.label}</p>
            <div className="space-y-1">
              {items.map(def => (
                <PaletteItem key={def.type} definition={def} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
