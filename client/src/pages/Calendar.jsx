import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TRIP_COLORS = ['bg-primary', 'bg-[#5facd3]', 'bg-[#ffc349] text-[#3a2c05]', 'bg-[#8f4fd6]'];

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - first.getDay());
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
  const today = new Date();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <PageHeader title="Calendar" description="See all your trips at a glance." />

      <div className="mb-4 flex items-center justify-between">
        <Button size="icon-sm" variant="outline" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft className="size-4" /></Button>
        <h2 className="text-lg font-semibold">{cursor.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <Button size="icon-sm" variant="outline" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight className="size-4" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => <div key={w} className="pb-1 text-center text-xs font-semibold text-muted-foreground">{w}</div>)}
        {grid.map((day) => {
          const isToday = day.toDateString() === today.toDateString();
          const dayTrips = tripsOnDay(trips, day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-24 rounded-lg border border-border p-1.5 text-xs',
                day.getMonth() !== month && 'bg-muted/40 text-muted-foreground',
                isToday && 'border-primary'
              )}
            >
              <span className={cn('inline-flex size-5 items-center justify-center rounded-full', isToday && 'bg-primary text-primary-foreground')}>{day.getDate()}</span>
              <div className="mt-1 flex flex-col gap-0.5">
                {dayTrips.map((t, i) => (
                  <span key={t.id} className={cn('truncate rounded px-1 py-0.5 text-[10px] font-medium text-white', TRIP_COLORS[i % TRIP_COLORS.length])}>{t.name}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
