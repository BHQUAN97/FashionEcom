const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API client chuan — auto attach JWT, handle errors
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('fashionecom-auth') || '{}')?.state?.accessToken
      : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API Error: ${res.status}`);
  }

  return json;
}

// Shorthand methods
export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
