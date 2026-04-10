'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLayoutStore } from '../stores/layout-store';
import { getSectionDefinition } from '../registry';
import { type LayoutSection } from '../registry/types';

/**
 * 1 section trong canvas — sortable, co drag handle + action buttons
 */
function SortableSection({ section }: { section: LayoutSection }) {
  const setActiveId = useLayoutStore(s => s.setActiveId);
  const removeSection = useLayoutStore(s => s.removeSection);
  const toggleVisibility = useLayoutStore(s => s.toggleVisibility);
  const activeId = useLayoutStore(s => s.activeId);

  const definition = getSectionDefinition(section.type);
  const Renderer = definition?.RendererComponent;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded-lg overflow-hidden ${
        activeId === section.id ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
      } ${!section.visible ? 'opacity-40' : ''}`}
    >
      {/* Drag handle + Action bar */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          {...attributes}
          {...listeners}
          className="p-1 bg-white/90 rounded shadow text-gray-500 hover:text-gray-700 cursor-grab"
          title="Keo tha"
        >
          ⋮⋮
        </button>
        <button
          onClick={() => setActiveId(section.id)}
          className="p-1 bg-white/90 rounded shadow text-gray-500 hover:text-blue-600"
          title="Chinh sua"
        >
          ✎
        </button>
        <button
          onClick={() => toggleVisibility(section.id)}
          className="p-1 bg-white/90 rounded shadow text-gray-500 hover:text-yellow-600"
          title={section.visible ? 'An' : 'Hien'}
        >
          {section.visible ? '👁' : '🚫'}
        </button>
        <button
          onClick={() => removeSection(section.id)}
          className="p-1 bg-white/90 rounded shadow text-gray-500 hover:text-red-600"
          title="Xoa"
        >
          ✕
        </button>
      </div>

      {/* Section type label */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition">
        <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded">{definition?.label || section.type}</span>
      </div>

      {/* Renderer preview */}
      <div onClick={() => setActiveId(section.id)} className="cursor-pointer">
        {Renderer ? <Renderer config={section.config} preview /> : (
          <div className="py-8 text-center text-gray-400 text-sm">Section: {section.type}</div>
        )}
      </div>
    </div>
  );
}

/**
 * Section Canvas — khu vuc chinh hien thi sortable sections
 */
export function SectionCanvas() {
  const sections = useLayoutStore(s => s.sections);

  return (
    <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-2 min-h-[200px]">
        {sections.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg py-16 text-center text-gray-400">
            Keo section tu palette ben trai vao day
          </div>
        )}
        {sections.map(section => (
          <SortableSection key={section.id} section={section} />
        ))}
      </div>
    </SortableContext>
  );
}
