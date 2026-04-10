'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useLayoutStore } from '../stores/layout-store';
import { type LayoutSection } from '../registry/types';

/**
 * Hook: save/publish/schedule/reset layout API calls
 */
export function useLayoutPublish(page: string = 'homepage') {
  const [saving, setSaving] = useState(false);
  const sections = useLayoutStore(s => s.sections);
  const setSections = useLayoutStore(s => s.setSections);
  const setPublishedSections = useLayoutStore(s => s.setPublishedSections);
  const resetDirty = useLayoutStore(s => s.resetDirty);

  /** Load sections tu API */
  const loadSections = async () => {
    useLayoutStore.getState().setLoading(true);
    try {
      const res = await api.get<{ draft: LayoutSection[]; published: LayoutSection[] }>(`/admin/layout/sections?page=${page}`);
      const { draft, published } = res.data;

      // Map BE entity sang FE LayoutSection
      const mapSection = (s: Record<string, unknown>): LayoutSection => ({
        id: s.cmsLayoutSectionId as string,
        type: s.cmsLayoutSectionType as string,
        config: s.cmsLayoutSectionConfig as Record<string, unknown>,
        sort: Number(s.cmsLayoutSectionSort),
        visible: Number(s.cmsLayoutSectionVisible),
      });

      const draftSections = (draft as unknown as Record<string, unknown>[]).map(mapSection);
      const pubSections = (published as unknown as Record<string, unknown>[]).map(mapSection);

      setSections(draftSections.length > 0 ? draftSections : pubSections);
      setPublishedSections(pubSections);
    } catch {
      // Ignore — empty state
    } finally {
      useLayoutStore.getState().setLoading(false);
    }
  };

  /** Save draft */
  const saveDraft = async () => {
    setSaving(true);
    try {
      await api.put('/admin/layout/sections/draft', {
        page,
        sections: sections.map(s => ({
          id: s.id,
          type: s.type,
          config: s.config,
          sort: s.sort,
          visible: s.visible,
        })),
      });
      resetDirty();
    } finally {
      setSaving(false);
    }
  };

  /** Publish layout */
  const publishLayout = async () => {
    setSaving(true);
    try {
      await saveDraft();
      await api.post('/admin/layout/sections/publish', { page });
      setPublishedSections([...sections]);
      resetDirty();
    } finally {
      setSaving(false);
    }
  };

  /** Schedule publish */
  const scheduleLayout = async (publishAt: string) => {
    setSaving(true);
    try {
      await saveDraft();
      await api.post('/admin/layout/sections/schedule', { page, publishAt });
      resetDirty();
    } finally {
      setSaving(false);
    }
  };

  /** Reset: xoa draft, lay lai published */
  const resetLayout = async () => {
    setSaving(true);
    try {
      await api.post('/admin/layout/sections/reset', { page });
      await loadSections();
    } finally {
      setSaving(false);
    }
  };

  return { loadSections, saveDraft, publishLayout, scheduleLayout, resetLayout, saving };
}
