import { useEffect, useState } from 'react';
import { Search, Plus, Clock, DollarSign } from 'lucide-react';
import request from '../api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'relaxation'];

/** List of activities with filters — used both as the standalone Search page and as a picker inside the Itinerary Builder. */
export default function ActivityPicker({ cityId, onSelect }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (maxCost) params.set('maxCost', maxCost);
    request(`/activities?${params}`).then(setActivities).catch(() => setActivities([]));
  }, [cityId, search, category, maxCost]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="sm:w-40"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input className="sm:w-28" placeholder="Max $" type="number" value={maxCost} onChange={(e) => setMaxCost(e.target.value)} />
      </div>
      <ul className="flex flex-col gap-2">
        {activities.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{a.name}</p>
                <Badge variant="secondary" className="capitalize">{a.category}</Badge>
              </div>
              {a.description && <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>}
              <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><DollarSign className="size-3" />{a.cost}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{a.durationHours}h</span>
                {a.city?.name && <span>{a.city.name}</span>}
              </p>
            </div>
            {onSelect && (
              <Button size="sm" onClick={() => onSelect(a)}>
                <Plus className="size-4" /> Add
              </Button>
            )}
          </li>
        ))}
        {activities.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No activities found.</li>}
      </ul>
    </div>
  );
}
