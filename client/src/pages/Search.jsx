import { useState } from 'react';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';

const TABS = [
  { id: 'cities', label: '🌍 Cities', desc: 'Discover destinations worldwide' },
  { id: 'activities', label: '🎯 Activities', desc: 'Explore experiences by category' },
];

export default function Search() {
  const [tab, setTab] = useState('cities');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-sky-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
          <p className="text-indigo-200 mt-1 text-sm">
            {tab === 'cities' ? 'Find your next destination' : 'Discover activities for your trip'}
          </p>

          {/* Tab pills */}
          <div className="flex gap-3 mt-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`search-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  tab === t.id
                    ? 'bg-white text-indigo-700 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {tab === 'cities'
            ? <CityPicker />
            : <ActivityPicker />
          }
        </div>
      </div>
    </div>
  );
}
