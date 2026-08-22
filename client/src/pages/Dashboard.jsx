import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, TrendingUp } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Dashboard() {
  const { user, token } = useAuth();
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    request('/cities?sort=popularity').then((c) => setCities(c.slice(0, 5)));
    request('/trips', { token }).then((t) => setTrips(t.slice(0, 3)));
  }, [token]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[linear-gradient(120deg,var(--primary)_0%,#6b7bd6_55%,var(--chart-3)_100%)] p-8 text-primary-foreground sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.firstName}!</h1>
          <p className="mt-1 text-primary-foreground/80">Where to next? Plan your next adventure.</p>
        </div>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" render={<Link to="/trips/new" />}>
          <Plus className="size-4" /> Plan a Trip
        </Button>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Top Regional Selections</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cities.map((c) => (
            <Card key={c.id} className="items-center gap-1.5 p-4 text-center transition-shadow hover:shadow-md">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <MapPin className="size-5" />
              </span>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="size-3" />{c.country}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Trips</h2>
          <Link to="/trips" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          {trips.length === 0 && <p className="text-sm text-muted-foreground">No trips yet — plan your first one!</p>}
        </div>
      </section>
    </div>
  );
}
