import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import PageHeader from '../components/PageHeader';
import { Button } from '@/components/ui/button';

const GROUPS = [
  ['ongoing', 'Ongoing'],
  ['upcoming', 'Upcoming'],
  ['completed', 'Completed'],
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
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <PageHeader title="My Trips" description="All your travel plans in one place.">
        <Button render={<Link to="/trips/new" />}><Plus className="size-4" /> Plan a Trip</Button>
      </PageHeader>

      {GROUPS.map(([key, label]) => {
        const group = trips.filter((t) => t.status === key);
        return (
          <section key={key} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">{label}</h2>
            {group.length === 0 ? (
              <p className="text-sm text-muted-foreground">No {label.toLowerCase()} trips.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((t) => <TripCard key={t.id} trip={t} onDelete={handleDelete} />)}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
