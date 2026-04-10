'use client';

import { useEffect } from 'react';
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

/**
 * Admin Layout Builder — Homepage Section Builder
 * DnD 16 section types, live preview, breakpoint toggle
 */
export default function LayoutBuilderPage() {
  const sections = useLayoutStore(s => s.sections);
  const addSection = useLayoutStore(s => s.addSection);
  const reorderSections = useLayoutStore(s => s.reorderSections);
  const activeId = useLayoutStore(s => s.activeId);
  const { loadSections } = useLayoutPublish();

  // Register keyboard shortcuts
  useLayoutHistory();

  useEffect(() => {
    loadSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Case 1: Drag tu Palette vao Canvas → them section moi
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

    // Case 2: Reorder trong Canvas
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Layout Builder</h1>
      </div>

      <Toolbar />

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4">
          {/* Palette — sidebar trai */}
          <div className="w-56 shrink-0">
            <div className="sticky top-20 bg-white border rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <SectionPalette />
            </div>
          </div>

          {/* Canvas — khu vuc chinh */}
          <div className="flex-1 min-w-0">
            <PreviewWrapper>
              <SectionCanvas />
            </PreviewWrapper>
          </div>
        </div>
      </DndContext>

      {/* Editor Panel — slide-in khi chon section */}
      {activeId && <SectionEditorPanel />}
    </div>
  );
}
