export type ApiOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
};

export async function api(path: string, opts: ApiOptions = {}) {
  const { method = 'GET', body, headers = {}, auth = true } = opts;
  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };

  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  if (auth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      (init.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`/api${path}`, init);
  if (!res.ok) {
    if (res.status === 401) {
      // optional: broadcast auth failure
      localStorage.removeItem('auth_token');
    }
    const errText = await res.text().catch(() => 'Request failed');
    throw new Error(errText || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}
