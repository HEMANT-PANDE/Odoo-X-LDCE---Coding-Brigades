import { useEffect, useState } from 'react';
import { Search, Plus, MapPin, TrendingUp } from 'lucide-react';
import request from '../api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
        <div className="relative flex-1 min-w-[140px]">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="city-search"
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Input
          id="city-country"
          placeholder="Filter country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="flex-1 min-w-[120px]"
        />
        <select
          id="city-region"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
        >
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          id="city-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🌍</p>
          <p className="text-muted-foreground text-sm">No cities found. Try different filters.</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {cities.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.name}, {c.country}</p>
                  <p className="text-xs text-muted-foreground">{c.region ? `${c.region} · ` : ''}Cost index ${c.costIndex}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {c.popularity && (
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <TrendingUp className="size-3" /> {c.popularity}
                  </span>
                )}
                {onSelect && (
                  <Button
                    size="sm"
                    id={`city-select-${c.id}`}
                    onClick={() => onSelect(c)}
                  >
                    <Plus className="size-4 mr-1" /> Add
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
