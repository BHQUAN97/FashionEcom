'use client';

import { ReactNode } from 'react';

interface AdminFormLayoutProps {
  title: string;
  /** Main form content */
  children: ReactNode;
  /** Sidebar content (status, publish, metadata) */
  sidebar?: ReactNode;
  /** Action buttons at bottom or top */
  actions?: ReactNode;
  loading?: boolean;
}

export function AdminFormLayout({ title, children, sidebar, actions, loading }: AdminFormLayoutProps) {
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Dang tai...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className={sidebar ? 'grid lg:grid-cols-[1fr_320px] gap-6' : ''}>
        <div className="space-y-6">{children}</div>
        {sidebar && <div className="space-y-4">{sidebar}</div>}
      </div>
    </div>
  );
}
