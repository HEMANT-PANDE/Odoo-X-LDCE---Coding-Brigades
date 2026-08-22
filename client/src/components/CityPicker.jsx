import { useEffect, useState } from 'react';
import request from '../api/client';

const REGIONS = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'];

/** Polished city list with search/filter — used in ItineraryBuilder (picker) and Search page (browse). */
export default function CityPicker({ onSelect }) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [sort, setSort] = useState('');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (country) params.set('country', country);
    if (region) params.set('region', region);
    if (sort) params.set('sort', sort);
    request(`/cities?${params}`)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLoading(false));
  }, [search, country, region, sort]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          id="city-search"
          placeholder="Search cities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          id="city-country"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="flex-1 min-w-[120px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          id="city-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-600"
        >
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          id="city-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-600"
        >
          <option value="">Sort: Default</option>
          <option value="popularity">Sort: Popularity</option>
          <option value="cost_asc">Sort: Cost ↑</option>
          <option value="cost_desc">Sort: Cost ↓</option>
        </select>
      </div>

      {/* City list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🌍</p>
          <p className="text-gray-400 text-sm">No cities found. Try different filters.</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {cities.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                {/* City initial avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {c.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.country}{c.region ? ` · ${c.region}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-400">Cost index</p>
                  <p className="text-sm font-semibold text-amber-600">${c.costIndex}/day</p>
                </div>
                {c.popularity && (
                  <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                    ⭐ {c.popularity}
                  </span>
                )}
                {onSelect && (
                  <button
                    id={`city-select-${c.id}`}
                    onClick={() => onSelect(c)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors opacity-80 group-hover:opacity-100"
                  >
                    Add
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
