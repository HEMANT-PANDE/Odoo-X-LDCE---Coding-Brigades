import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PieChart, MapPin } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function dayNumber(tripStart, date) {
  const ms = new Date(date) - new Date(tripStart);
  return Math.floor(ms / 86400000) + 1;
}

export default function ItineraryView() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);

  useEffect(() => { request(`/trips/${tripId}`, { token }).then(setTrip); }, [tripId]);

  if (!trip) return <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8"><Skeleton className="h-40 w-full" /></div>;

  const byDay = {};
  for (const stop of trip.stops) {
    for (const sa of stop.activities) {
      const day = dayNumber(trip.startDate, sa.scheduledDate);
      (byDay[day] ??= []).push({ ...sa, cityName: stop.city.name });
    }
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
      <PageHeader title={trip.name} description="Your day-by-day itinerary.">
        <Button variant="outline" render={<Link to={`/trips/${trip.id}/budget`} />}>
          <PieChart className="size-4" /> View Budget
        </Button>
      </PageHeader>

      {days.length === 0 && <p className="text-sm text-muted-foreground">No activities scheduled yet — add some in the Itinerary Builder.</p>}

      <div className="flex flex-col gap-4">
        {days.map((day) => (
          <Card key={day}>
            <CardHeader><CardTitle className="text-base">Day {day}</CardTitle></CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {byDay[day]
                  .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
                  .map((sa) => (
                    <li key={sa.id} className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {sa.activity.name} <span className="text-muted-foreground">— {sa.cityName}</span>
                      </span>
                      <span className="font-medium">${Number(sa.costOverride ?? sa.activity.cost)}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
