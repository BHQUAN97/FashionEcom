'use client';

import { useState } from 'react';

/**
 * Dropdown export CSV/Excel cho bao cao
 */
interface ExportButtonProps {
  onExport: (format: 'csv' | 'xlsx') => Promise<void>;
}

export function ExportButton({ onExport }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setLoading(true);
    setOpen(false);
    try {
      await onExport(format);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-3 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        Export
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
          <button
            onClick={() => handleExport('csv')}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
          >
            Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
