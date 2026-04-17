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
  /** Loi fetch du lieu — hien banner do o tren table (backward compat: optional) */
  error?: Error | string | null;
  children: ReactNode;
}

export function AdminTableLayout({ title, actions, filters, loading, error, children }: AdminTableLayoutProps) {
  // Chuan hoa error message — ho tro ca string va Error instance
  const errorMessage = error ? (typeof error === 'string' ? error : error.message) : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Filters */}
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}

      {/* Banner loi — hien truoc content de user biet du lieu khong load duoc */}
      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          Khong tai duoc du lieu: {errorMessage}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Dang tai...</div>
      ) : (
        children
      )}
    </div>
  );
}
