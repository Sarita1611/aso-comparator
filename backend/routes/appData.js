import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'google-play-store-scraper-api.p.rapidapi.com';
const RAPIDAPI_BASE = 'https://google-play-store-scraper-api.p.rapidapi.com';

export const COUNTRY_CODES = {
  'United States': 'us', 'United Kingdom': 'gb', 'India': 'in', 'Canada': 'ca',
  'Australia': 'au', 'Germany': 'de', 'France': 'fr', 'Japan': 'jp',
  'Brazil': 'br', 'UAE': 'ae', 'South Korea': 'kr', 'Mexico': 'mx',
  'Spain': 'es', 'Italy': 'it', 'Netherlands': 'nl', 'Russia': 'ru',
  'China': 'cn', 'Singapore': 'sg', 'Sweden': 'se', 'Norway': 'no',
  'Denmark': 'dk', 'Finland': 'fi', 'Switzerland': 'ch', 'Austria': 'at',
  'Belgium': 'be', 'Poland': 'pl', 'Portugal': 'pt', 'Turkey': 'tr',
  'Saudi Arabia': 'sa', 'Israel': 'il', 'South Africa': 'za', 'Nigeria': 'ng',
  'Egypt': 'eg', 'Argentina': 'ar', 'Chile': 'cl', 'Colombia': 'co',
  'Peru': 'pe', 'Indonesia': 'id', 'Malaysia': 'my', 'Thailand': 'th',
  'Philippines': 'ph', 'Vietnam': 'vn', 'Pakistan': 'pk', 'Bangladesh': 'bd',
  'New Zealand': 'nz', 'Ireland': 'ie', 'Czech Republic': 'cz', 'Hungary': 'hu',
  'Romania': 'ro', 'Ukraine': 'ua', 'Greece': 'gr', 'Taiwan': 'tw',
  'Hong Kong': 'hk', 'Kazakhstan': 'kz', 'Morocco': 'ma', 'Kenya': 'ke'
};

function detectPlatformFromUrl(input) {
  if (!input) return null;
  const lower = input.toLowerCase();
  if (lower.includes('apps.apple.com') || lower.includes('itunes.apple.com')) return 'ios';
  if (lower.includes('play.google.com')) return 'android';
  return null;
}

function extractiOSId(url) {
  const match = url.match(/id(\d+)/);
  return match ? match[1] : null;
}

function extractAndroidId(url) {
  const match = url.match(/id=([a-zA-Z0-9._]+)/);
  return match ? match[1] : null;
}

// ─── iOS functions ────────────────────────────────────────────────────────────

async function searchiOSMultiple(query, country = 'us', limit = 6) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=${limit}&country=${country}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results) return [];
    return data.results.map(app => ({
      appId: String(app.trackId),
      title: app.trackName,
      developer: app.artistName,
      icon: app.artworkUrl100,
      platform: 'ios',
      score: app.averageUserRating ? parseFloat(app.averageUserRating.toFixed(1)) : 0,
      ratingCount: app.userRatingCount || 0,
      category: app.primaryGenreName || '',
      free: app.formattedPrice === 'Free',
    }));
  } catch (err) {
    console.error('iOS autocomplete error:', err);
    return [];
  }
}

async function fetchiOSById(appId, country = 'us') {
  try {
    const url = `https://itunes.apple.com/lookup?id=${appId}&country=${country}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    return formatIOSApp(data.results[0], country);
  } catch (err) {
    console.error('iOS fetch error:', err);
    return null;
  }
}

function formatIOSApp(app, country = 'us') {
  const releaseDate = new Date(app.currentVersionReleaseDate || app.releaseDate);
  const daysSinceUpdate = Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
  return {
    platform: 'ios',
    country,
    name: app.trackName || '',
    developer: app.artistName || '',
    icon: app.artworkUrl512 || app.artworkUrl100 || '',
    rating: app.averageUserRating ? parseFloat(app.averageUserRating.toFixed(1)) : 0,
    ratingCount: app.userRatingCount || 0,
    category: app.primaryGenreName || '',
    description: app.description || '',
    title: app.trackName || '',
    subtitle: app.subtitle || '',
    price: app.formattedPrice || 'Free',
    screenshotCount: (app.screenshotUrls || []).length + (app.ipadScreenshotUrls || []).length,
    screenshots: app.screenshotUrls || [],
    version: app.version || '',
    lastUpdated: releaseDate.toISOString().split('T')[0],
    daysSinceUpdate,
    size: app.fileSizeBytes ? `${(parseInt(app.fileSizeBytes) / 1048576).toFixed(1)} MB` : 'N/A',
    url: app.trackViewUrl || '',
    bundleId: app.bundleId || '',
    hasVideo: false,
    minOsVersion: app.minimumOsVersion || '',
    languages: app.languageCodesISO2A || [],
    contentRating: app.contentAdvisoryRating || '',
    appId: String(app.trackId),
  };
}

// ─── Android via rockapis ─────────────────────────────────────────────────────

// rockapis has no direct score field — calculate weighted average from ratingsHistogram
function getRating(app) {
  const h = app.ratingsHistogram;
  if (h) {
    const s1 = h['1'] || 0;
    const s2 = h['2'] || 0;
    const s3 = h['3'] || 0;
    const s4 = h['4'] || 0;
    const s5 = h['5'] || 0;
    const total = s1 + s2 + s3 + s4 + s5;
    if (total > 0) {
      const weighted = s1 * 1 + s2 * 2 + s3 * 3 + s4 * 4 + s5 * 5;
      return parseFloat((weighted / total).toFixed(1));
    }
  }
  // fallback in case API adds a score field later
  const val = app.score ?? app.rating ?? null;
  if (val !== null && val !== undefined) return parseFloat(parseFloat(val).toFixed(1));
  return 0;
}

async function searchAndroidMultiple(query, country = 'us', limit = 6) {
  if (!RAPIDAPI_KEY) {
    console.error('[Android] RAPIDAPI_KEY not set');
    return [];
  }
  try {
    console.log(`[Android] Searching rockapis for: ${query}`);
    const res = await fetch(`${RAPIDAPI_BASE}/search-apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      body: JSON.stringify({ keyword: query, language: 'en', country }),
    });
    const data = await res.json();
    console.log('[Android] Search status:', res.status, '| result count:', (data.data || []).length);
    if (!res.ok) throw new Error(JSON.stringify(data));
    const results = data.data || [];
    return results.slice(0, limit).map(app => ({
      appId: app.id,
      title: app.title,
      developer: app.developer,
      icon: app.icon,
      platform: 'android',
      score: getRating(app),
      ratingCount: app.ratings || 0,
      category: app.genre || app.familyGenre || '',
      free: app.free ?? (app.price?.value === 0),
      installs: app.installs || '',
    }));
  } catch (err) {
    console.error('[Android] Search error:', err.message);
    return [];
  }
}

async function fetchAndroidById(appId, country = 'us') {
  if (!RAPIDAPI_KEY) {
    console.error('[Android] RAPIDAPI_KEY not set');
    return null;
  }
  try {
    console.log(`[Android] Fetching rockapis details for: ${appId}`);
    const res = await fetch(`${RAPIDAPI_BASE}/app-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
      body: JSON.stringify({ appID: appId, language: 'en', country }),
    });
    const data = await res.json();
    console.log('[Android] Details status:', res.status);
    if (!res.ok) throw new Error(JSON.stringify(data));
    const app = Array.isArray(data.data) ? data.data[0] : (data.data || data);
    if (!app) return null;
    return formatAndroidApp(app, country);
  } catch (err) {
    console.error('[Android] Fetch error:', err.message);
    return null;
  }
}

function formatAndroidApp(app, country = 'us') {
  let daysSinceUpdate = 0;
  if (app.released) {
    const releaseDate = new Date(app.released);
    daysSinceUpdate = Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  return {
    platform: 'android',
    country,
    name: app.title || '',
    developer: app.developer || '',
    icon: app.icon || '',
    rating: getRating(app),
    ratingCount: app.ratings || 0,
    category: app.genre || app.familyGenre || '',
    description: app.description || app.descriptionHTML || '',
    title: app.title || '',
    subtitle: '',
    price: app.free ? 'Free' : `$${app.price?.value || 0}`,
    screenshotCount: 0,
    screenshots: [],
    version: app.version || '',
    lastUpdated: app.released || '',
    daysSinceUpdate,
    size: 'N/A',
    url: `https://play.google.com/store/apps/details?id=${app.id}`,
    bundleId: app.id || '',
    hasVideo: false,
    installs: app.installs || '',
    contentRating: app.contentRating || '',
    recentChanges: app.recentChanges || '',
    appId: app.id || '',
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// AUTOCOMPLETE
router.post('/search', async (req, res) => {
  const { query, platform = 'both', country = 'us' } = req.body;
  if (!query || query.trim().length < 2) return res.json({ results: [] });

  try {
    let results = [];
    if (platform === 'ios') {
      results = await searchiOSMultiple(query, country, 7);
    } else if (platform === 'android') {
      results = await searchAndroidMultiple(query, country, 7);
    } else {
      const [iosRes, androidRes] = await Promise.allSettled([
        searchiOSMultiple(query, country, 4),
        searchAndroidMultiple(query, country, 4),
      ]);
      const ios = iosRes.status === 'fulfilled' ? iosRes.value : [];
      const android = androidRes.status === 'fulfilled' ? androidRes.value : [];
      const maxLen = Math.max(ios.length, android.length);
      for (let i = 0; i < maxLen; i++) {
        if (ios[i]) results.push(ios[i]);
        if (android[i]) results.push(android[i]);
      }
    }
    res.json({ results: results.slice(0, 8) });
  } catch (err) {
    console.error('Search error:', err);
    res.json({ results: [] });
  }
});

// FETCH FULL APP
router.post('/fetch', async (req, res) => {
  const { appId, platform, country = 'us', input } = req.body;

  try {
    let appData = null;

    if (appId && platform) {
      if (platform === 'ios') appData = await fetchiOSById(appId, country);
      else if (platform === 'android') appData = await fetchAndroidById(appId, country);
    } else if (input) {
      const detectedPlatform = detectPlatformFromUrl(input);
      if (detectedPlatform === 'ios') {
        const id = extractiOSId(input);
        appData = id ? await fetchiOSById(id, country) : null;
      } else if (detectedPlatform === 'android') {
        const id = extractAndroidId(input);
        appData = id ? await fetchAndroidById(id, country) : null;
      } else {
        const [iosRes, androidRes] = await Promise.allSettled([
          searchiOSMultiple(input, country, 1),
          searchAndroidMultiple(input, country, 1),
        ]);
        const iosFirst = iosRes.status === 'fulfilled' && iosRes.value[0];
        const androidFirst = androidRes.status === 'fulfilled' && androidRes.value[0];
        if (iosFirst) appData = await fetchiOSById(iosFirst.appId, country);
        else if (androidFirst) appData = await fetchAndroidById(androidFirst.appId, country);
      }
    }

    if (!appData) return res.status(404).json({ error: 'App not found. Try using a direct App Store or Play Store URL.' });
    res.json({ success: true, app: appData });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch app data.' });
  }
});

// COUNTRIES LIST
router.get('/countries', (req, res) => {
  const countries = Object.entries(COUNTRY_CODES)
    .map(([name, code]) => ({ name, code }))
    .sort((a, b) => a.name.localeCompare(b.name));
  res.json({ countries });
});

export default router;
