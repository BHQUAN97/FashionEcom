'use client';

import { useEffect, useState } from 'react';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useLayoutStore } from '@/features/layout-builder/stores/layout-store';
import { useLayoutPublish } from '@/features/layout-builder/hooks/use-layout-publish';
import { useLayoutHistory } from '@/features/layout-builder/hooks/use-layout-history';
import { getSectionDefinition } from '@/features/layout-builder/registry';
import { SectionPalette } from '@/features/layout-builder/components/section-palette';
import { SectionCanvas } from '@/features/layout-builder/components/section-canvas';
import { SectionEditorPanel } from '@/features/layout-builder/components/section-editor-panel';
import { PreviewWrapper } from '@/features/layout-builder/components/preview-wrapper';
import { Toolbar } from '@/features/layout-builder/components/toolbar';

/** Tabs trang — giong Shopee */
const PAGE_TABS = [
  { key: 'homepage', label: 'Trang chủ' },
  { key: 'category', label: 'Trang danh mục' },
  { key: 'featured', label: 'Top Sản phẩm nổi bật' },
] as const;

/**
 * Admin Layout Builder — Thiet lap trang chu (Shopee style)
 * 3-column: Palette | Canvas + Preview | Editor Panel
 */
export default function LayoutBuilderPage() {
  const [activePage, setActivePage] = useState<string>('homepage');
  const sections = useLayoutStore(s => s.sections);
  const addSection = useLayoutStore(s => s.addSection);
  const reorderSections = useLayoutStore(s => s.reorderSections);
  const activeId = useLayoutStore(s => s.activeId);
  const loading = useLayoutStore(s => s.loading);
  const { loadSections } = useLayoutPublish(activePage);

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Shift+Z
  useLayoutHistory();

  // Load sections khi doi tab page
  useEffect(() => {
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Drag tu Palette vao Canvas → them section moi
    if (active.data.current?.type === 'palette') {
      const sectionType = active.data.current.sectionType as string;
      const definition = getSectionDefinition(sectionType);
      if (!definition) return;

      // Check maxInstances
      if (definition.maxInstances) {
        const count = sections.filter(s => s.type === sectionType).length;
        if (count >= definition.maxInstances) return;
      }

      addSection({
        id: crypto.randomUUID(),
        type: sectionType,
        config: { ...definition.defaultConfig },
        sort: sections.length,
        visible: 1,
      });
      return;
    }

    // Reorder trong Canvas
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        reorderSections(newSections);
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header voi breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 shrink-0">
        <span>Trang chủ</span>
        <span>›</span>
        <span className="text-gray-800 font-medium">Thiet lap giao dien</span>
      </div>

      {/* Page Tabs — Shopee style */}
      <div className="flex items-center gap-6 border-b mb-4 shrink-0">
        {PAGE_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActivePage(tab.key)}
            className={`pb-2.5 text-sm font-medium border-b-2 transition ${
              activePage === tab.key
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="shrink-0">
        <Toolbar />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">Dang tai...</div>
      )}

      {/* Main builder area — fill remaining height, each column scrolls independently */}
      {!loading && (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-0 mt-4 flex-1 min-h-0">
            {/* Palette — sidebar trai, scroll doc lap */}
            <div className="w-52 shrink-0 overflow-y-auto bg-white border rounded-l-lg p-3">
              <SectionPalette />
            </div>

            {/* Canvas — khu vuc preview chinh, scroll doc lap */}
            <div className="flex-1 min-w-0 border-t border-b overflow-y-auto">
              <PreviewWrapper>
                <SectionCanvas />
              </PreviewWrapper>
            </div>
          </div>
        </DndContext>
      )}

      {/* Editor Panel — slide-in tu ben phai */}
      {activeId && <SectionEditorPanel />}
    </div>
  );
}
