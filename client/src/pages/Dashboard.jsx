import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [cities, setCities] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    request('/cities?sort=popularity').then((c) => setCities(c.slice(0, 5)));
    request('/trips').then((t) => setTrips(t.slice(0, 3)));
  }, []);

  return (
    <div className="page">
      <div className="banner">
        <h1>Welcome back, {user?.firstName}!</h1>
        <Link to="/trips/new" className="button">+ Plan a Trip</Link>
      </div>

      <section>
        <h2>Top Regional Selections</h2>
        <div className="grid">
          {cities.map((c) => (
            <div key={c.id} className="card city-card">
              <strong>{c.name}</strong>
              <span>{c.country}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Recent Trips</h2>
        <div className="grid">
          {trips.map((t) => <TripCard key={t.id} trip={t} />)}
          {trips.length === 0 && <p>No trips yet — plan your first one!</p>}
        </div>
      </section>
    </div>
  );
}
