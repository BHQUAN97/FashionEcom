'use client';

import { useLayoutStore } from '../stores/layout-store';
import { useLayoutHistory } from '../hooks/use-layout-history';
import { useLayoutPublish } from '../hooks/use-layout-publish';

/**
 * Toolbar — Save Draft / Publish / Schedule / Reset / Undo / Redo
 */
export function Toolbar() {
  const isDirty = useLayoutStore(s => s.isDirty);
  const { canUndo, canRedo, undo, redo } = useLayoutHistory();
  const { saveDraft, publishLayout, resetLayout, saving } = useLayoutPublish();

  return (
    <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2">
      {/* Left: Undo/Redo */}
      <div className="flex items-center gap-1">
        <button onClick={undo} disabled={!canUndo} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Undo (Ctrl+Z)">
          ↩
        </button>
        <button onClick={redo} disabled={!canRedo} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Redo (Ctrl+Shift+Z)">
          ↪
        </button>
        {isDirty && <span className="text-xs text-yellow-600 ml-2">● Chua luu</span>}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button onClick={resetLayout} disabled={saving} className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-50">
          Reset
        </button>
        <button onClick={saveDraft} disabled={saving || !isDirty} className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 disabled:opacity-50">
          {saving ? 'Dang luu...' : 'Luu nhap'}
        </button>
        <button onClick={publishLayout} disabled={saving} className="px-4 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">
          {saving ? 'Dang xu ly...' : 'Publish'}
        </button>
      </div>
    </div>
  );
}
