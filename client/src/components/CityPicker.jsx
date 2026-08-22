import { useEffect, useState } from 'react';
import { Search, Plus, MapPin, TrendingUp } from 'lucide-react';
import request from '../api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/** List of cities with search/filter — used both as the standalone Search page and as a picker inside the Itinerary Builder. */
export default function CityPicker({ onSelect }) {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (country) params.set('country', country);
    request(`/cities?${params}`).then(setCities).catch(() => setCities([]));
  }, [search, country]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Input className="sm:max-w-48" placeholder="Filter by country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <ul className="flex flex-col gap-2">
        {cities.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <MapPin className="size-4" />
              </span>
              <div>
                <p className="text-sm font-medium">{c.name}, {c.country}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  Cost index {c.costIndex} <TrendingUp className="size-3" /> {c.popularity} popularity
                </p>
              </div>
            </div>
            {onSelect && (
              <Button size="sm" onClick={() => onSelect(c)}>
                <Plus className="size-4" /> Add
              </Button>
            )}
          </li>
        ))}
        {cities.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No cities found.</li>}
      </ul>
    </div>
  );
}
