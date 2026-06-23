const API = import.meta.env.VITE_API_URL || 'http://localhost:5157';

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USERNAME_KEY = 'username';

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USERNAME_KEY);
}

function buildHeaders(useAuth) {
  const headers = { 'Content-Type': 'application/json' };

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

async function request(url, options = {}, { useAuth = true } = {}) {
  const token = useAuth ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  const hadToken = Boolean(token);

  const res = await fetch(`${API}${url}`, {
    ...options,
    headers: { ...buildHeaders(useAuth), ...options.headers },
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && useAuth && hadToken) {
    logoutExpiredSession();
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const msg = data.message || data.title || data.errors
      ? Object.values(data.errors || {}).flat().join(' ')
      : 'Request failed';
    throw new Error(typeof msg === 'string' ? msg : 'Request failed');
  }

  return data;
}

export function register(username, email, password) {
  return request(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    },
    { useAuth: false }
  );
}

export function login(username, password) {
  return request(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    },
    { useAuth: false }
  );
}

export function getTopics(parentId) {
  const query = parentId != null ? `?parentId=${parentId}` : '';
  return request(`/topics${query}`);
}

export function getTaskStats(topicId, since) {
  const params = new URLSearchParams();
  if (topicId != null) params.set('topicId', String(topicId));
  if (since) params.set('since', since);
  const query = params.toString();
  return request(`/topics/stats${query ? `?${query}` : ''}`);
}

export function searchTopics(q, page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    q,
    page: String(page),
    pageSize: String(pageSize),
  });
  return request(`/topics/search?${params}`);
}

export function createTopic(name, parentId) {
  return request('/topics', {
    method: 'POST',
    body: JSON.stringify({ name, parentId: parentId ?? null }),
  });
}

export function createTask(parentId, name, description) {
  return request(`/topics/${parentId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
}

export function patchTask(topicId, { description, status } = {}) {
  const body = {};
  if (description !== undefined) body.description = description;
  if (status !== undefined) body.status = status;
  return request(`/topics/${topicId}/task`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteTask(topicId) {
  return request(`/topics/${topicId}/task`, {
    method: 'DELETE',
  });
}

export function getTopicDeleteSummary(topicId) {
  return request(`/topics/${topicId}/delete-summary`);
}

export function deleteTopic(topicId) {
  return request(`/topics/${topicId}`, {
    method: 'DELETE',
  });
}
