import { useEffect, useState } from 'react';
import { Search as SearchIcon, Plus, Clock, DollarSign } from 'lucide-react';
import request from '../api/client';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'relaxation'];

const CATEGORY_ICONS = {
  sightseeing: '🏛️',
  food: '🍜',
  adventure: '🧗',
  culture: '🎭',
  relaxation: '🧘',
};

const CATEGORY_BADGES = {
  sightseeing: 'bg-[#7FA593]/20 text-[#16302B] border-[#7FA593]/40',
  food: 'bg-[#F2A93B]/20 text-[#8a5b0f] border-[#F2A93B]/40',
  adventure: 'bg-[#E15B4F]/15 text-[#E15B4F] border-[#E15B4F]/30',
  culture: 'bg-[#16302B]/10 text-[#16302B] border-[#16302B]/20',
  relaxation: 'bg-[#7FA593]/15 text-[#2d5244] border-[#7FA593]/30',
};

export default function ActivityPicker({ cityId, onSelect }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cityId) params.set('cityId', cityId);
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (maxCost) params.set('maxCost', maxCost);
    if (maxDuration) params.set('maxDuration', maxDuration);
    request(`/activities?${params}`)
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, [cityId, search, category, maxCost, maxDuration]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[130px]">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#16302B]/40" />
          <input
            id="activity-search"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-[#16302B]/20 bg-white pl-9 pr-3 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
          />
        </div>
        <select
          id="activity-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <input
          id="activity-max-cost"
          placeholder="Max $"
          type="number"
          min="0"
          value={maxCost}
          onChange={(e) => setMaxCost(e.target.value)}
          className="w-20 rounded border border-[#16302B]/20 bg-white px-2.5 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
        />
        <input
          id="activity-max-duration"
          placeholder="Max hrs"
          type="number"
          min="0"
          value={maxDuration}
          onChange={(e) => setMaxDuration(e.target.value)}
          className="w-20 rounded border border-[#16302B]/20 bg-white px-2.5 py-2 text-xs text-[#16302B] outline-none focus:border-[#16302B]"
        />
      </div>

      {/* Category pill shortcuts */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setCategory('')}
          className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase font-semibold transition-colors ${category === '' ? 'bg-[#16302B] text-[#FBF6ED]' : 'bg-white border border-[#16302B]/15 text-[#16302B]/70 hover:bg-[#FBF6ED]'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? '' : c)}
            className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase font-semibold transition-colors ${category === c ? 'bg-[#16302B] text-[#FBF6ED]' : 'bg-white border border-[#16302B]/15 text-[#16302B]/70 hover:bg-[#FBF6ED]'}`}
          >
            {CATEGORY_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="font-mono text-xs text-[#16302B]/50 uppercase tracking-wider">Searching activities...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="font-serif text-sm text-[#16302B]/60">No activities found matching your criteria.</p>
        </div>
      ) : (
        <ul className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 p-3 rounded-sm border border-[#16302B]/12 bg-white hover:border-[#16302B]/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="size-8 rounded bg-[#FBF6ED] border border-[#16302B]/15 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                  {CATEGORY_ICONS[a.category] || '📌'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-serif font-semibold text-sm text-[#16302B]">{a.name}</p>
                    <span className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase border font-semibold ${CATEGORY_BADGES[a.category] || 'bg-gray-100'}`}>
                      {a.category}
                    </span>
                  </div>
                  {a.city?.name && (
                    <p className="font-mono text-[10px] text-[#16302B]/50 mt-0.5">📍 {a.city.name}</p>
                  )}
                  {a.description && (
                    <p className="text-xs text-[#16302B]/65 mt-1 line-clamp-2">{a.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 font-mono text-[10px] text-[#16302B]/60">
                    <span className="font-semibold text-[#16302B]">💰 ${a.cost}</span>
                    <span>⏱ {a.durationHours}h</span>
                  </div>
                </div>
              </div>
              {onSelect && (
                <button
                  id={`activity-select-${a.id}`}
                  onClick={() => onSelect(a)}
                  className="inline-flex items-center gap-1 rounded bg-[#16302B] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#FBF6ED] hover:bg-[#E15B4F] transition-colors flex-shrink-0 mt-0.5"
                >
                  <Plus className="size-3" /> Select
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
