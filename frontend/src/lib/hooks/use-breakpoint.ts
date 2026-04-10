'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** Hook phat hien breakpoint responsive — mobile-first */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('mobile');

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w >= 1280) setBp('desktop');
      else if (w >= 768) setBp('tablet');
      else setBp('mobile');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return bp;
}

export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}
