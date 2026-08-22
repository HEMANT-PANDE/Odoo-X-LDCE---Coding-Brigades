import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Luggage, PlaneTakeoff } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Trips
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              All your created itineraries, schedules, and destination stops in one place.
            </p>
          </div>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] self-start sm:self-auto"
          >
            <Plus className="size-4" /> Plan a New Trip
          </Link>
        </div>

        {/* Groups */}
        {GROUPS.map(([key, label, subtitle]) => {
          const group = trips.filter((t) => (t.status || 'upcoming') === key);
          return (
            <section key={key} className="space-y-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  {label}
                </h2>
                <p className="text-xs text-slate-500">{subtitle}</p>
              </div>

              {group.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-xs font-medium text-slate-400">
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
    </div>
  );
}
