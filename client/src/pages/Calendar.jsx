import { useEffect, useState } from 'react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay()); // back up to the preceding Sunday
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function tripsOnDay(trips, day) {
  return trips.filter((t) => new Date(t.startDate) <= day && day <= new Date(t.endDate));
}

export default function Calendar() {
  const { token } = useAuth();
  const [trips, setTrips] = useState([]);
  const [cursor, setCursor] = useState(new Date());

  useEffect(() => { request('/trips', { token }).then(setTrips); }, [token]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const grid = buildGrid(year, month);

  return (
    <div className="page">
      <h1>Calendar</h1>
      <div className="page-header">
        <button onClick={() => setCursor(new Date(year, month - 1, 1))}>&larr;</button>
        <h2>{cursor.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => setCursor(new Date(year, month + 1, 1))}>&rarr;</button>
      </div>
      <div className="calendar-grid">
        {WEEKDAYS.map((w) => <div key={w} className="calendar-weekday">{w}</div>)}
        {grid.map((day) => (
          <div key={day.toISOString()} className={`calendar-cell ${day.getMonth() !== month ? 'muted' : ''}`}>
            <span>{day.getDate()}</span>
            {tripsOnDay(trips, day).map((t) => <div key={t.id} className="calendar-trip">{t.name}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}
