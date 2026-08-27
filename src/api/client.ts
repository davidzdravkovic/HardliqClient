const API = import.meta.env.VITE_API_URL || 'http://localhost:5157';

export const AUTH_TOKEN_KEY : string = 'token';
export const AUTH_USERNAME_KEY : string = 'username';

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
}

function buildHeaders(useAuth: boolean): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (useAuth) {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

function logoutExpiredSession() {
  clearAuth();
  if (window.location.pathname !== '/login') {
    window.location.replace('/login?expired=1');
  }
}

type ErrorBody = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export async function request<T>(url: string, options: RequestInit = {},{ useAuth = true }: { useAuth?: boolean } = {}) 
  : Promise<T>
   {
  const token = useAuth ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const hadToken = Boolean(token);

  const extraHeaders = (options.headers ?? {}) as Record<string, string>;

  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: { ...buildHeaders(useAuth), ...extraHeaders },
  });

  if (res.status === 401 && useAuth && hadToken) {
    logoutExpiredSession();
    throw new Error('Session expired');
  }

  //Data is both types, for to be able to read the Error fields (never returned), always T is returned
  const data = (await res.json().catch(() => ({}))) as T & ErrorBody;

  if (!res.ok) {
    const msg = data.message || data.title || (data.errors
      ? Object.values(data.errors).flat().join(' ')
      : 'Request failed');
    throw new Error(typeof msg === 'string' ? msg : 'Request failed');
  }

  return data;
}
