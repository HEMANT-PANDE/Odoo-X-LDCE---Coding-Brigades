import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

function dayNumber(tripStart, date) {
  const ms = new Date(date) - new Date(tripStart);
  return Math.floor(ms / 86400000) + 1;
}

export default function ItineraryView() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);

  useEffect(() => { request(`/trips/${tripId}`, { token }).then(setTrip); }, [tripId]);

  if (!trip) return <div className="page">Loading...</div>;

  // Flatten all scheduled activities across stops, grouped by day number.
  const byDay = {};
  for (const stop of trip.stops) {
    for (const sa of stop.activities) {
      const day = dayNumber(trip.startDate, sa.scheduledDate);
      (byDay[day] ??= []).push({ ...sa, cityName: stop.city.name });
    }
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{trip.name}</h1>
        <Link to={`/trips/${trip.id}/budget`} className="button">View Budget Breakdown</Link>
      </div>

      {days.length === 0 && <p className="muted">No activities scheduled yet — add some in the Itinerary Builder.</p>}

      {days.map((day) => (
        <div key={day} className="card">
          <h3>Day {day}</h3>
          <ul className="itinerary-list">
            {byDay[day]
              .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
              .map((sa) => (
                <li key={sa.id} className="itinerary-row">
                  <span>{sa.activity.name} — {sa.cityName}</span>
                  <span>${Number(sa.costOverride ?? sa.activity.cost)}</span>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
