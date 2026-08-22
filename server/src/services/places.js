const config = require('../config');

const CATEGORY_KINDS = {
  sightseeing: 'interesting_places,architecture,monuments_and_memorials',
  food: 'foods,cafes',
  adventure: 'sport,natural',
  culture: 'cultural,museums,theatres_and_entertainments',
  relaxation: 'natural,beaches',
};

// ponytail: in-memory TTL cache, single process. Swap for Redis if this runs multi-instance.
const CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();

function cacheKey(cityId, category) {
  return `${cityId}:${category || 'all'}`;
}

function estimateCost(costIndex, category) {
  const factor = { sightseeing: 0.15, food: 0.12, adventure: 0.25, culture: 0.1, relaxation: 0.2 }[category] || 0.15;
  return Math.round(Number(costIndex) * factor * 100) / 100;
}

function pickCategory(kindsStr) {
  const kinds = kindsStr.split(',');
  for (const [category, kindList] of Object.entries(CATEGORY_KINDS)) {
    if (kindList.split(',').some((k) => kinds.includes(k))) return category;
  }
  return 'sightseeing';
}

// Live "things to do" via OpenTripMap (free tier). Returns [] if no API key or city has no lat/lng.
async function fetchLiveActivities(city, { category } = {}) {
  if (!config.openTripMapKey || city.lat == null || city.lng == null) return [];

  const key = cacheKey(city.id, category);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const kinds = category ? CATEGORY_KINDS[category] : Object.values(CATEGORY_KINDS).join(',');
  const url = new URL('https://api.opentripmap.com/0.1/en/places/radius');
  url.searchParams.set('radius', '15000');
  url.searchParams.set('lon', String(city.lng));
  url.searchParams.set('lat', String(city.lat));
  url.searchParams.set('kinds', kinds);
  url.searchParams.set('limit', '20');
  url.searchParams.set('format', 'json');
  url.searchParams.set('apikey', config.openTripMapKey);

  let results = [];
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`OpenTripMap ${res.status}`);
    const places = await res.json();
    results = places
      .filter((p) => p.name)
      .map((p) => {
        const cat = pickCategory(p.kinds || '');
        return {
          id: `live-${p.xid}`,
          xid: p.xid,
          cityId: city.id,
          name: p.name,
          description: `${p.name} — a ${cat} spot in ${city.name}, ${Math.round(p.dist)}m from center.`,
          category: cat,
          cost: estimateCost(city.costIndex, cat),
          durationHours: 2,
          imageUrl: null,
          source: 'live',
        };
      });
  } catch (err) {
    // Live source is a nice-to-have — swallow and fall back to catalog-only.
    console.warn('OpenTripMap fetch failed:', err.message);
    results = [];
  }

  cache.set(key, { at: Date.now(), data: results });
  return results;
}

module.exports = { fetchLiveActivities };
