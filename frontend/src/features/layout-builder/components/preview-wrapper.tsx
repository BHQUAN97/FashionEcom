'use client';

import { useState, type ReactNode } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

type DeviceMode = 'mobile' | 'desktop';

/**
 * Preview Wrapper — Shopee style
 * Tabs: Phien ban di dong / Phien ban may tinh
 * Canvas gioi han width theo device mode
 */
export function PreviewWrapper({ children }: { children: ReactNode }) {
  const [device, setDevice] = useState<DeviceMode>('mobile');

  return (
    <div>
      {/* Device mode tabs — Shopee style */}
      <div className="flex items-center gap-4 mb-3 border-b">
        <button
          onClick={() => setDevice('mobile')}
          className={`flex items-center gap-1.5 pb-2 text-sm font-medium border-b-2 transition ${
            device === 'mobile'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Phien ban di dong
        </button>
        <button
          onClick={() => setDevice('desktop')}
          className={`flex items-center gap-1.5 pb-2 text-sm font-medium border-b-2 transition ${
            device === 'desktop'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Phien ban may tinh
        </button>
      </div>

      {/* Preview container */}
      <div
        className="mx-auto transition-all duration-300"
        style={{ maxWidth: device === 'mobile' ? '375px' : '100%' }}
      >
        {children}
      </div>
    </div>
  );
}
