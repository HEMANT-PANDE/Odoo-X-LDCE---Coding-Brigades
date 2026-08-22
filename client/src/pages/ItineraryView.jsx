import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PieChart, MapPin, Edit3, Wallet } from 'lucide-react';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

function dayNumber(tripStart, date) {
  const ms = new Date(date) - new Date(tripStart);
  return Math.floor(ms / 86400000) + 1;
}

const CATEGORY_COLORS = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  relaxation: 'bg-pink-100 text-pink-700',
};

const CATEGORY_ICONS = {
  sightseeing: '🏛️', food: '🍜', adventure: '🧗', culture: '🎭', relaxation: '🧘',
};

export default function ItineraryView() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request(`/trips/${tripId}`, { token })
      .then(setTrip)
      .finally(() => setLoading(false));
  }, [tripId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!trip) return null;

  // Flatten all scheduled activities across stops, grouped by day number
  const byDay = {};
  for (const stop of trip.stops) {
    for (const sa of stop.activities) {
      const day = dayNumber(trip.startDate, sa.scheduledDate);
      (byDay[day] ??= []).push({ ...sa, cityName: stop.city.name });
    }
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);

  const totalCities = [...new Set(trip.stops.map((s) => s.city.name))];
  const totalActivities = trip.stops.reduce((sum, s) => sum + s.activities.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link to="/trips" className="hover:text-primary transition-colors">My Trips</Link>
            <span>/</span>
            <span>Itinerary</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            📅 {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/trips/${tripId}/builder`}>
              <Edit3 className="size-4 mr-1" /> Edit Builder
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/trips/${tripId}/budget`}>
              <Wallet className="size-4 mr-1" /> Budget
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Cities', value: totalCities.length, icon: '🌍' },
          { label: 'Activities', value: totalActivities, icon: '🎯' },
          { label: 'Days Planned', value: days.length, icon: '📅' },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {days.length === 0 ? (
        <Card className="text-center py-16 border-2 border-dashed">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="text-lg font-semibold mb-1">No activities scheduled yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Add some in the Itinerary Builder to see your day-by-day plan.</p>
          <Button asChild>
            <Link to={`/trips/${tripId}/builder`}>Open Itinerary Builder</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {days.map((day) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="bg-muted/40 py-3 px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {day}
                  </span>
                  <CardTitle className="text-base">Day {day}</CardTitle>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {byDay[day].length} {byDay[day].length === 1 ? 'activity' : 'activities'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {byDay[day]
                    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
                    .map((sa) => (
                      <li key={sa.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {CATEGORY_ICONS[sa.activity.category] || '📌'}
                          </span>
                          <div>
                            <p className="font-medium text-sm">{sa.activity.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="size-3" /> {sa.cityName}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[sa.activity.category] || 'bg-muted text-foreground'}`}>
                                {sa.activity.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold text-primary text-sm ml-4">
                          ${Number(sa.costOverride ?? sa.activity.cost)}
                        </span>
                      </li>
                    ))}
                </ul>

                <div className="px-6 py-2.5 bg-muted/20 border-t border-border flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Day {day} total</span>
                  <span className="font-bold text-foreground">
                    ${byDay[day].reduce((s, sa) => s + Number(sa.costOverride ?? sa.activity.cost), 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
