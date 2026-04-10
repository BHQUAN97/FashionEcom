'use client';

import { useState, type ReactNode } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINT_WIDTHS: Record<Breakpoint, number | null> = {
  mobile: 375,
  tablet: 768,
  desktop: null, // full width
};

/**
 * Preview Wrapper — breakpoint toggle + container width simulation
 */
export function PreviewWrapper({ children }: { children: ReactNode }) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  const maxWidth = BREAKPOINT_WIDTHS[breakpoint];

  return (
    <div>
      {/* Breakpoint toggle */}
      <div className="flex items-center gap-2 mb-4 justify-center">
        {(['mobile', 'tablet', 'desktop'] as Breakpoint[]).map((bp) => (
          <button
            key={bp}
            onClick={() => setBreakpoint(bp)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              breakpoint === bp ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {bp === 'mobile' ? '📱 375px' : bp === 'tablet' ? '📱 768px' : '🖥 Desktop'}
          </button>
        ))}
      </div>

      {/* Preview container */}
      <div
        className="mx-auto transition-all duration-300 border rounded-lg overflow-hidden bg-white"
        style={{ maxWidth: maxWidth ? `${maxWidth}px` : '100%' }}
      >
        {children}
      </div>
    </div>
  );
}
