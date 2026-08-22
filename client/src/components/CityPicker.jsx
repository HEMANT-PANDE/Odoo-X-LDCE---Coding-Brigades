import { useEffect, useState } from 'react';
import request from '../api/client';

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
      <div className="filters">
        <input placeholder="Search cities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <input placeholder="Filter by country" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>
      <ul className="picker-list">
        {cities.map((c) => (
          <li key={c.id}>
            <div>
              <strong>{c.name}</strong>, {c.country} — cost index {c.costIndex}, popularity {c.popularity}
            </div>
            {onSelect && <button onClick={() => onSelect(c)}>Add to Trip</button>}
          </li>
        ))}
        {cities.length === 0 && <li>No cities found.</li>}
      </ul>
    </div>
  );
}
