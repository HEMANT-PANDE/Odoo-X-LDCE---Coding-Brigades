import { useEffect, useState } from 'react';
import { Search as SearchIcon, Plus, MapPin, TrendingUp } from 'lucide-react';
import request from '../api/client';

const REGIONS = ['Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East'];

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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[140px]">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#16302B]/40" />
          <input
            id="city-search"
            placeholder="Search destination cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-[#16302B]/20 bg-white pl-9 pr-3 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
          />
        </div>
        <input
          id="city-country"
          placeholder="Filter country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="flex-1 min-w-[110px] rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
        />
        <select
          id="city-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
        >
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          id="city-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
        >
          <option value="">Sort: Popularity</option>
          <option value="cost_asc">Cost: Low to High</option>
          <option value="cost_desc">Cost: High to Low</option>
        </select>
      </div>

      {/* City list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="font-mono text-xs text-[#16302B]/50 uppercase tracking-wider">Searching destinations...</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-serif text-sm text-[#16302B]/60">No destinations found matching your criteria.</p>
        </div>
      ) : (
        <ul className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {cities.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 p-3 rounded-sm border border-[#16302B]/12 bg-white hover:border-[#16302B]/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#16302B] text-[#F2A93B] flex items-center justify-center text-sm flex-shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="font-serif font-semibold text-sm text-[#16302B]">{c.name}, {c.country}</p>
                  <p className="font-mono text-[10px] text-[#16302B]/50">
                    {c.region ? `${c.region} · ` : ''}Cost Index ${c.costIndex}/day
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {c.popularity && (
                  <span className="rounded border border-[#16302B]/15 bg-[#FBF6ED] px-2 py-0.5 font-mono text-[10px] text-[#16302B]/60 flex items-center gap-1">
                    <TrendingUp className="size-2.5 text-[#F2A93B]" /> {c.popularity}
                  </span>
                )}
                {onSelect && (
                  <button
                    id={`city-select-${c.id}`}
                    onClick={() => onSelect(c)}
                    className="inline-flex items-center gap-1 rounded bg-[#16302B] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors"
                  >
                    <Plus className="size-3" /> Select
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
