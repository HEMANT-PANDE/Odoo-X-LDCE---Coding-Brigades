import { useEffect, useState } from 'react';
import { Search, Plus, Clock, DollarSign } from 'lucide-react';
import request from '../api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['sightseeing', 'food', 'adventure', 'culture', 'relaxation'];

const CATEGORY_ICONS = {
  sightseeing: '🏛️',
  food: '🍜',
  adventure: '🧗',
  culture: '🎭',
  relaxation: '🧘',
};

const CATEGORY_COLORS = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  relaxation: 'bg-pink-100 text-pink-700',
};

/** Polished activity list with filters — used in ItineraryBuilder (picker) and Search page (browse). */
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
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          id="activity-search"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          id="activity-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-gray-600"
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
          placeholder="Max cost $"
          type="number"
          min="0"
          value={maxCost}
          onChange={(e) => setMaxCost(e.target.value)}
          className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          id="activity-max-duration"
          placeholder="Max hrs"
          type="number"
          min="0"
          value={maxDuration}
          onChange={(e) => setMaxDuration(e.target.value)}
          className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* Category pill shortcuts */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setCategory('')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${category === '' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? '' : c)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${category === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-gray-400 text-sm">No activities found. Try different filters.</p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {activities.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${CATEGORY_COLORS[a.category] || 'bg-gray-100'}`}>
                  {CATEGORY_ICONS[a.category] || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{a.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[a.category] || 'bg-gray-100 text-gray-600'}`}>
                      {a.category}
                    </span>
                  </div>
                  {a.city?.name && (
                    <p className="text-xs text-gray-400 mt-0.5">📍 {a.city.name}</p>
                  )}
                  {a.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-semibold text-amber-600">💰 ${a.cost}</span>
                    <span className="text-xs text-gray-400">⏱ {a.durationHours}h</span>
                  </div>
                </div>
              </div>
              {onSelect && (
                <button
                  id={`activity-select-${a.id}`}
                  onClick={() => onSelect(a)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors opacity-80 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                >
                  Add
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
