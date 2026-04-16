const API_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}, timeoutMs = 180000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. The analysis is taking longer than expected — please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
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

  // Analyze apps (no userId needed)
  analyzeApps: (apps, country = 'us') =>
    request('/api/analyze/compare', {
      method: 'POST',
      body: JSON.stringify({ apps, country }),
    }),

  // Get countries list
  getCountries: () => request('/api/app/countries'),

  // History (global, no userId)
  getHistory: (page = 1) =>
    request(`/api/history/all?page=${page}`),

  getHistoryEntry: (id) =>
    request(`/api/history/entry/${id}`),

  deleteHistoryEntry: (id) =>
    request(`/api/history/entry/${id}`, { method: 'DELETE' }),

  health: () => request('/api/health'),
};
