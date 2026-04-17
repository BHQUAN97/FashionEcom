'use client';

import { useState, useEffect } from 'react';

/**
 * Nut "Ve dau trang" — hien khi scroll xuong
 * Text doc: doc tu tren xuong duoi, mui ten huong len
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed right-0 bottom-1/3 z-[60] flex flex-col items-center border border-black border-r-0 bg-white px-2 py-3 shadow-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors duration-300"
      aria-label="Về đầu trang"
    >
      <svg className="w-3 h-3 mb-2" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span
        className="text-xs font-semibold tracking-wider whitespace-nowrap"
        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      >
        Về đầu trang
      </span>
    </button>
  );
}
