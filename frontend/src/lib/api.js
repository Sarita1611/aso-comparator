const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  analyzeApps: (apps, country = 'us') =>
    request('/api/analyze/compare', {
      method: 'POST',
      body: JSON.stringify({ apps, country }),
    }),

  getHistory: (page = 1) =>
    request(`/api/history/all?page=${page}`),

  getHistoryEntry: (id) =>
    request(`/api/history/entry/${id}`),

  deleteHistoryEntry: (id) =>
    request(`/api/history/entry/${id}`, { method: 'DELETE' }),

  getCountries: () =>
    request('/api/app/countries'),
};
