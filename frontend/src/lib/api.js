const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Autocomplete search
  searchApps: (query, platform = 'both', country = 'us') =>
    request('/api/app/search', {
      method: 'POST',
      body: JSON.stringify({ query, platform, country }),
    }),

  // Fetch full app data by ID + platform
  fetchApp: (appId, platform, country = 'us') =>
    request('/api/app/fetch', {
      method: 'POST',
      body: JSON.stringify({ appId, platform, country }),
    }),

  // Fetch by raw input (URL or name)
  fetchAppByInput: (input, country = 'us') =>
    request('/api/app/fetch', {
      method: 'POST',
      body: JSON.stringify({ input, country }),
    }),

  // Analyze apps (no userId)
  analyzeApps: (apps, country = 'us') =>
    request('/api/analyze/compare', {
      method: 'POST',
      body: JSON.stringify({ apps, country }),
    }),

  // Get countries list
  getCountries: () => request('/api/app/countries'),

  // History (shared, no userId)
  getHistory: (page = 1) =>
    request(`/api/history?page=${page}`),

  getHistoryEntry: (id) =>
    request(`/api/history/entry/${id}`),

  deleteHistoryEntry: (id) =>
    request(`/api/history/entry/${id}`, {
      method: 'DELETE',
    }),

  health: () => request('/api/health'),
};
