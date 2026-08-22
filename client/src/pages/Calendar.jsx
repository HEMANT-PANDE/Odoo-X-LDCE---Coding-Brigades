import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';

// Matches the --chart-1..5 tokens in index.css — cycled per trip for visual variety.
const TRIP_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d;
}

export default function Calendar() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);

  useEffect(() => { request('/trips', { token }).then(setTrips); }, [token]);

  const events = trips.map((t, i) => ({
    id: String(t.id),
    title: t.name,
    start: t.startDate.slice(0, 10),
    end: addDays(t.endDate, 1).toISOString().slice(0, 10), // FullCalendar's `end` is exclusive
    color: TRIP_COLORS[i % TRIP_COLORS.length],
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <PageHeader title="Calendar" description="See all your trips at a glance." />

      <div className="gt-calendar rounded-xl border border-border bg-card p-3 shadow-sm sm:p-5">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' }}
          height="auto"
          events={events}
          eventClick={(info) => navigate(`/trips/${info.event.id}`)}
          dayMaxEvents={3}
        />
      </div>
    </div>
  );
}
