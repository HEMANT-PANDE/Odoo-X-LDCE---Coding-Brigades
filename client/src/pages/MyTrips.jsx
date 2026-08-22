import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PlaneTakeoff } from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

const GROUPS = [
  ['ongoing', 'Ongoing Trips', 'Currently in progress'],
  ['upcoming', 'Upcoming Trips', 'Planned for the future'],
  ['completed', 'Past Journeys', 'Completed adventures'],
];

export default function MyTrips() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);

  useEffect(() => { request('/trips', { token }).then(setTrips); }, [token]);

  async function handleDelete(id) {
    await request(`/trips/${id}`, { method: 'DELETE', token });
    setTrips(trips.filter((t) => t.id !== id));
    toast.success('Trip deleted');
  }

  return (
    <main className="relative min-h-svh overflow-x-clip bg-background text-foreground">
      {/* Ledger texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, var(--foreground) 0px, var(--foreground) 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50 mb-1">
              Your Travel Ledger
            </p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">
              My Trips
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All your created itineraries, schedules, and destination stops in one place.
            </p>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="size-4" /> Plan a New Trip
          </Link>
        </div>

        {/* Groups */}
        {GROUPS.map(([key, label, subtitle]) => {
          const group = trips.filter((t) => (t.status || 'upcoming') === key);
          return (
            <section key={key} className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/50">{subtitle}</p>
                <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight">
                  {label}
                </h2>
              </div>

              {group.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-background/50 p-8 text-center">
                  <span className="mx-auto inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground mb-3">
                    <PlaneTakeoff className="size-4" />
                  </span>
                  <p className="font-mono text-xs text-muted-foreground">
                    No {key} trips found.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((t) => <TripCard key={t.id} trip={t} onDelete={handleDelete} />)}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
