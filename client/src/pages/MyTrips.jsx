import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import PageHeader from '../components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const GROUPS = [
  ['ongoing', 'Ongoing Trips', 'Currently in progress'],
  ['upcoming', 'Upcoming Trips', 'Planned for the future'],
  ['completed', 'Past Journeys', 'Completed adventures'],
];

export default function MyTrips() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { request('/trips', { token }).then(setTrips); }, [token]);

  async function handleDelete(id) {
    await request(`/trips/${id}`, { method: 'DELETE', token });
    setTrips(trips.filter((t) => t.id !== id));
    toast.success('Trip deleted');
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8 space-y-8">
      <PageHeader title="My Trips" description="All your created itineraries, schedules, and destination stops in one place.">
        <Button asChild>
          <Link to="/trips/new"><Plus className="size-4" /> Plan a New Trip</Link>
        </Button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search your trips by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {GROUPS.map(([key, label, subtitle]) => {
        const group = trips
          .filter((t) => (t.status || 'upcoming') === key)
          .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
        return (
          <section key={key} className="space-y-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>

            {group.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-xs font-medium text-muted-foreground">No {key} trips found.</p>
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
  );
}
