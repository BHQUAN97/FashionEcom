import DOMPurify from 'dompurify';

/** Whitelist tags + attributes cho DOMPurify — chong XSS */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'a', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'img', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  ],
  // BAO MAT: KHONG cho phep 'style' attr — chong CSS-based data exfiltration
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class'],
};

/**
 * Sanitize HTML string — chong XSS ca server-side lan client-side
 * SSR fallback: strip ALL HTML tags (an toan tuyet doi khi khong co DOMPurify)
 * Client: dung DOMPurify voi whitelist restrictive
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // SSR: strip ALL HTML tags de chong XSS — DOMPurify chi chay tren client
    return dirty.replace(/<[^>]*>/g, '');
  }
  return DOMPurify.sanitize(dirty, SANITIZE_CONFIG);
}
