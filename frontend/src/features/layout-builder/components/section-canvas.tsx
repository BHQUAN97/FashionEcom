'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { useLayoutStore } from '../stores/layout-store';
import { getSectionDefinition } from '../registry';
import { type LayoutSection } from '../registry/types';

/**
 * 1 section trong canvas — Shopee style
 * Ben trai: label, ben phai: up/down/delete, giua: renderer preview
 */
function SortableSection({ section, index, total }: { section: LayoutSection; index: number; total: number }) {
  const setActiveId = useLayoutStore(s => s.setActiveId);
  const removeSection = useLayoutStore(s => s.removeSection);
  const moveUp = useLayoutStore(s => s.moveUp);
  const moveDown = useLayoutStore(s => s.moveDown);
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

  const isActive = activeId === section.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex group ${!section.visible ? 'opacity-40' : ''}`}
    >
      {/* Ben trai: Label section type (Shopee style) */}
      <div
        className={`w-24 shrink-0 flex items-center justify-center border-r cursor-grab ${
          isActive ? 'bg-orange-50' : 'bg-gray-50 hover:bg-gray-100'
        }`}
        {...attributes}
        {...listeners}
      >
        <span className="text-[11px] text-gray-500 text-center leading-tight px-1 select-none">
          {definition?.label || section.type}
        </span>
      </div>

      {/* Giua: Preview renderer — overflow-hidden de ngan tran layout */}
      <div
        className={`flex-1 min-w-0 min-h-[60px] border-2 transition cursor-pointer overflow-hidden ${
          isActive ? 'border-orange-400 bg-orange-50/30' : 'border-transparent hover:border-gray-300'
        }`}
        onClick={() => setActiveId(section.id)}
      >
        {Renderer ? (
          <div className="pointer-events-none [&_a]:pointer-events-none [&_button]:pointer-events-none">
            <Renderer config={section.config} preview />
          </div>
        ) : (
          <div className="py-6 text-center text-gray-400 text-sm">
            {definition?.label || section.type}
          </div>
        )}
      </div>

      {/* Ben phai: Action buttons (Shopee style — up/down/delete) */}
      <div className="w-8 shrink-0 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={() => moveUp(section.id)}
          disabled={index === 0}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:hover:bg-transparent"
          title="Di chuyển lên"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => moveDown(section.id)}
          disabled={index === total - 1}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:hover:bg-transparent"
          title="Di chuyển xuống"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => removeSection(section.id)}
          className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
          title="Xóa section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Section Canvas — khu vuc preview chinh, Shopee style
 * Co left labels, action buttons, empty state
 */
export function SectionCanvas() {
  const sections = useLayoutStore(s => s.sections);

  return (
    <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
      <div className="border rounded-lg overflow-hidden bg-white min-h-[400px]">
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm">Keo section tu palette ben trai vao day</p>
            <p className="text-xs mt-1">hoac click section de them</p>
          </div>
        ) : (
          <div className="divide-y">
            {sections.map((section, index) => (
              <SortableSection
                key={section.id}
                section={section}
                index={index}
                total={sections.length}
              />
            ))}
          </div>
        )}
      </div>
    </SortableContext>
  );
}
