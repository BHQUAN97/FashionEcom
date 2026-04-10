'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Analytics event types — dong bo voi backend enum
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'enter_shipping'
  | 'select_payment'
  | 'complete_order'
  | 'search'
  | 'wishlist_add'
  | 'review_submit';

interface AnalyticsEvent {
  type: AnalyticsEventType;
  data?: Record<string, unknown>;
  session_id: string;
  timestamp: string;
  device: string;
  source?: string;
}

/**
 * Detect device type tu user agent
 */
function detectDevice(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

/**
 * Lay/tao session ID — luu trong sessionStorage, tao moi khi tab moi
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
}

// Queue global — gom events de batch send
const eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

/**
 * Gui batch events den backend
 */
async function flushEvents() {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, eventQueue.length);

  try {
    const res = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: batch }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    retryCount = 0;
  } catch {
    // Retry: tra lai queue va thu lai
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      eventQueue.unshift(...batch);
      // Exponential backoff: 5s, 10s, 20s
      setTimeout(flushEvents, 5000 * Math.pow(2, retryCount - 1));
    }
    // Sau 3 lan, bo qua batch nay
  }
}

/**
 * Hook analytics — track events tu FE, batch send moi 5 giay
 *
 * Usage:
 * ```tsx
 * const { track } = useAnalytics();
 * track('product_view', { product_id: '...', price: 500000 });
 * ```
 */
export function useAnalytics() {
  const sessionId = useRef('');
  const device = useRef('desktop');

  useEffect(() => {
    sessionId.current = getSessionId();
    device.current = detectDevice();
  }, []);

  const track = useCallback((type: AnalyticsEventType, data?: Record<string, unknown>) => {
    eventQueue.push({
      type,
      data,
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      device: device.current,
    });

    // Batch: gui sau 5 giay
    if (!flushTimer) {
      flushTimer = setTimeout(() => {
        flushTimer = null;
        flushEvents();
      }, 5000);
    }
  }, []);

  // Flush khi unmount / truoc khi tat tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (eventQueue.length > 0) {
        // Dung sendBeacon de gui truoc khi tab dong
        const payload = JSON.stringify({ events: eventQueue.splice(0) });
        navigator.sendBeacon('/api/analytics/events', new Blob([payload], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return { track };
}
