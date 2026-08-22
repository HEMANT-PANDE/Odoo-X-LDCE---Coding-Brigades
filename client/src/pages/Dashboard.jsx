import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, MapPin, CalendarRange, Compass, Wallet,
  PlaneTakeoff, ArrowRight, TrendingUp, Sparkles, Luggage,
} from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    request('/cities?sort=popularity').then((c) => setCities(c.slice(0, 5)));
    request('/trips', { token }).then((t) => setTrips(t.slice(0, 3)));
  }, [token]);

  const firstName = user?.firstName || user?.name || 'Traveler';

  return (
    <main className="relative min-h-svh overflow-x-clip bg-background text-foreground">
      {/* faint ledger-line texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, var(--foreground) 0px, var(--foreground) 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 lg:px-8 space-y-12">

        {/* ── HERO BANNER (Landing page styled light card) ── */}
        <section className="relative overflow-hidden rounded-2xl border border-[#16302B]/12 bg-white/70 p-8 sm:p-10 shadow-sm backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#16302B]/20 bg-[#FBF6ED] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#16302B]/70">
                <PlaneTakeoff className="size-3.5 text-[#E15B4F]" />
                <span>Travel Dashboard</span>
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl text-[#16302B]">
                Welcome back, {firstName}.
              </h1>
              <p className="text-base text-[#16302B]/70 leading-relaxed">
                Where to next? Structure your multi-city route, schedule activities, and keep your budget in check.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/trips/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E15B4F] px-5 py-2.5 text-sm font-semibold text-[#FBF6ED] shadow-sm transition-all hover:bg-[#E15B4F]/90"
                >
                  <Plus className="size-4" /> Plan a Trip
                </Link>
                <Link
                  to="/trips"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#16302B]/25 bg-transparent px-5 py-2.5 text-sm font-medium text-[#16302B] transition-colors hover:bg-[#16302B]/5"
                >
                  My Trips <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Stat Counters matching Landing Features cards */}
            <div className="grid grid-cols-2 gap-3 sm:w-60 flex-shrink-0">
              <div className="rounded-xl border border-[#16302B]/12 bg-[#FBF6ED] p-4 text-center">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#16302B] text-[#F2A93B] mb-2">
                  <Luggage className="size-4.5" />
                </span>
                <p className="font-serif text-2xl font-bold text-[#16302B]">{trips.length}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#16302B]/50">Saved Trips</p>
              </div>
              <div className="rounded-xl border border-[#16302B]/12 bg-[#FBF6ED] p-4 text-center">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#16302B] text-[#F2A93B] mb-2">
                  <Compass className="size-4.5" />
                </span>
                <p className="font-serif text-2xl font-bold text-[#16302B]">{cities.length}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#16302B]/50">Top Cities</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── TOP DESTINATIONS ── */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#16302B]/55">
                Departure Board
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#16302B]">
                Where planners are headed
              </h2>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#16302B]/60 transition-colors hover:text-[#E15B4F]"
            >
              Explore all destinations <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
            {cities.map((c, i) => (
              <Link
                to="/search"
                key={c.id}
                className="group relative flex flex-col items-center rounded-xl border border-[#16302B]/12 bg-[#FBF6ED] p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#16302B]/30 hover:bg-white shadow-none hover:shadow-sm"
              >
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-[#16302B] text-[#F2A93B] transition-transform duration-200 group-hover:scale-105">
                  <MapPin className="size-5" />
                </span>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/40">
                  Stop {String(i + 1).padStart(2, '0')}
                </p>
                <p className="font-serif text-sm font-semibold text-[#16302B] mt-0.5">{c.name}</p>
                <p className="font-mono text-[11px] text-[#16302B]/55 mt-0.5">{c.country}</p>
                <span className="mt-2.5 inline-flex items-center gap-1 rounded border border-[#16302B]/15 px-2 py-0.5 font-mono text-[10px] text-[#16302B]/60">
                  <TrendingUp className="size-3 text-[#E15B4F]" /> ${c.costIndex}/day
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── RECENT TRIPS ── */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#16302B]/55">
                Your Travel Ledger
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#16302B]">
                Recent Itineraries
              </h2>
            </div>
            <Link
              to="/trips"
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-[#16302B]/60 transition-colors hover:text-[#E15B4F]"
            >
              View all trips <ArrowRight className="size-3" />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#16302B]/20 bg-white/50 py-16 text-center">
              <span className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-[#16302B] text-[#F2A93B] mb-3">
                <PlaneTakeoff className="size-5" />
              </span>
              <p className="font-serif text-base font-semibold text-[#16302B]">No trips planned yet</p>
              <p className="mt-1 font-mono text-xs text-[#16302B]/50 max-w-sm mx-auto">
                Ready to explore? Create your first trip and start scheduling destinations & activities.
              </p>
              <Link
                to="/trips/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#E15B4F] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] shadow-sm transition-all hover:bg-[#E15B4F]/90"
              >
                <Plus className="size-4" /> Plan a Trip
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((t) => <TripCard key={t.id} trip={t} />)}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
