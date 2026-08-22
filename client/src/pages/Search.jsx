import { useState } from 'react';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';

export default function Search() {
  const [tab, setTab] = useState('cities');

  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* Ledger texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-10 lg:px-8 space-y-8">
        {/* Header */}
        <div className="border-b border-dashed border-[#16302B]/20 pb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/45">
            Destination & Experience Scouting
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
            Explore & Search
          </h1>
          <p className="mt-1 text-sm text-[#16302B]/60">
            Browse world cities and curated activities for your upcoming trips.
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 border-b border-dashed border-[#16302B]/15 pb-4">
          <button
            onClick={() => setTab('cities')}
            className={`rounded-full px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              tab === 'cities'
                ? 'bg-[#16302B] text-[#FBF6ED] shadow-sm'
                : 'border border-[#16302B]/20 bg-white/60 text-[#16302B]/70 hover:bg-white'
            }`}
          >
            🌍 Destination Cities
          </button>
          <button
            onClick={() => setTab('activities')}
            className={`rounded-full px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
              tab === 'activities'
                ? 'bg-[#16302B] text-[#FBF6ED] shadow-sm'
                : 'border border-[#16302B]/20 bg-white/60 text-[#16302B]/70 hover:bg-white'
            }`}
          >
            🎯 Experiences & Activities
          </button>
        </div>

        {/* Card Content */}
        <div className="rounded-sm border border-[#16302B]/15 bg-white p-6 shadow-[0_4px_16px_rgba(22,48,43,0.04)]">
          {tab === 'cities' ? <CityPicker /> : <ActivityPicker />}
        </div>
      </div>
    </main>
  );
}
