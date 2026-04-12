'use client';

import { Eye, Undo2, Redo2 } from 'lucide-react';
import { useLayoutStore } from '../stores/layout-store';
import { useLayoutHistory } from '../hooks/use-layout-history';
import { useLayoutPublish } from '../hooks/use-layout-publish';

/**
 * Toolbar — Shopee style
 * Trai: tieu de + trang thai
 * Phai: Xem truoc | Luu | Ap dung
 */
export function Toolbar() {
  const isDirty = useLayoutStore(s => s.isDirty);
  const { canUndo, canRedo, undo, redo } = useLayoutHistory();
  const { saveDraft, publishLayout, resetLayout, saving } = useLayoutPublish();

  return (
    <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-2.5">
      {/* Trai: Undo/Redo + trang thai */}
      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition"
          title="Hoan tac (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition"
          title="Lam lai (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4 text-gray-500" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        <button
          onClick={resetLayout}
          disabled={saving}
          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          Dat lai
        </button>

        {isDirty && (
          <span className="text-xs text-orange-500 font-medium ml-2">● Chua luu</span>
        )}
      </div>

      {/* Phai: Xem truoc / Luu / Ap dung */}
      <div className="flex items-center gap-2">
        <button
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <Eye className="w-4 h-4" />
          Xem truoc
        </button>

        <button
          onClick={saveDraft}
          disabled={saving || !isDirty}
          className="px-4 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition"
        >
          {saving ? 'Dang luu...' : 'Luu'}
        </button>

        <button
          onClick={publishLayout}
          disabled={saving}
          className="px-5 py-1.5 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 font-medium transition"
        >
          {saving ? 'Dang xu ly...' : 'Ap dung'}
        </button>
      </div>
    </div>
  );
}
