// Vite provides import.meta.env at runtime; cast to any to satisfy TS in all setups
const VITE = (import.meta as any)?.env || {};
export const API_BASE = VITE.VITE_API_BASE_URL || '/api';

export async function api<T=any>(path: string, opts: { method?: string; body?: any; headers?: Record<string,string> } = {}): Promise<T> {
  const token = localStorage.getItem('auth_token') || '';
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path.startsWith('/') ? path : '/'+path}` , {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(()=> '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  // @ts-ignore
  return res.text();
}
