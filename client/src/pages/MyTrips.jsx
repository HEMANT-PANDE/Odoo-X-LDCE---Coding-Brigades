import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';

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
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Trips</h1>
        <Link to="/trips/new" className="button">+ Plan a Trip</Link>
      </div>
      {GROUPS.map(([key, label]) => {
        const group = trips.filter((t) => t.status === key);
        return (
          <section key={key}>
            <h2>{label}</h2>
            <div className="grid">
              {group.map((t) => <TripCard key={t.id} trip={t} onDelete={handleDelete} />)}
              {group.length === 0 && <p className="muted">No {label.toLowerCase()} trips.</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}
