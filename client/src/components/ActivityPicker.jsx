import { useEffect, useState } from 'react';
import request from '../api/client';

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
      <div className="filters">
        <input placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Max cost" type="number" value={maxCost} onChange={(e) => setMaxCost(e.target.value)} />
      </div>
      <ul className="picker-list">
        {activities.map((a) => (
          <li key={a.id}>
            <div>
              <strong>{a.name}</strong> ({a.category}) — {a.city?.name ? `${a.city.name}, ` : ''}${a.cost}, {a.durationHours}h
              {a.description && <p className="muted">{a.description}</p>}
            </div>
            {onSelect && <button onClick={() => onSelect(a)}>Add</button>}
          </li>
        ))}
        {activities.length === 0 && <li>No activities found.</li>}
      </ul>
    </div>
  );
}
