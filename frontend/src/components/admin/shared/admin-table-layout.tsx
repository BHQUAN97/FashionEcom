'use client';

import { ReactNode } from 'react';

interface AdminTableLayoutProps {
  title: string;
  /** Header actions (create button, export, etc) */
  actions?: ReactNode;
  /** Filter bar content */
  filters?: ReactNode;
  /** Dang tai du lieu */
  loading?: boolean;
  children: ReactNode;
}

export function AdminTableLayout({ title, actions, filters, loading, children }: AdminTableLayoutProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Filters */}
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Dang tai...</div>
      ) : (
        children
      )}
    </div>
  );
}
