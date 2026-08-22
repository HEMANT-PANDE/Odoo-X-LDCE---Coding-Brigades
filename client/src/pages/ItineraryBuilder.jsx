import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Trash2, MapPin, Wallet, CalendarRange, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';
import PageHeader from '../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORY_COLORS = {
  sightseeing: 'bg-blue-100 text-blue-700',
  food: 'bg-orange-100 text-orange-700',
  adventure: 'bg-green-100 text-green-700',
  culture: 'bg-purple-100 text-purple-700',
  relaxation: 'bg-pink-100 text-pink-700',
};

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [addingStop, setAddingStop] = useState(false);
  const [pendingCity, setPendingCity] = useState(null);
  const [stopDates, setStopDates] = useState({ startDate: '', endDate: '' });
  const [addingActivityFor, setAddingActivityFor] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function reload() {
    try {
      const [t, b] = await Promise.all([
        request(`/trips/${tripId}`, { token }),
        request(`/trips/${tripId}/budget`, { token }),
      ]);
      setTrip(t);
      setBudget(b);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, [tripId]);

  const stopBudget = (stopId) => budget?.perStop.find((s) => s.stopId === stopId);

  function closeAddStop() {
    setAddingStop(false);
    setPendingCity(null);
    setStopDates({ startDate: '', endDate: '' });
    setError('');
  }

  async function handleAddStop(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await request(`/trips/${tripId}/stops`, {
        method: 'POST',
        token,
        body: { cityId: pendingCity.id, ...stopDates },
      });
      closeAddStop();
      reload();
      toast.success('Stop added successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStop(id) {
    await request(`/stops/${id}`, { method: 'DELETE', token });
    reload();
    toast.success('Stop removed');
  }

  async function handleAddActivity(stopId, activity) {
    const stop = trip.stops.find((s) => s.id === stopId);
    await request(`/stops/${stopId}/activities`, {
      method: 'POST',
      token,
      body: { activityId: activity.id, scheduledDate: stop.startDate.slice(0, 10) },
    });
    setAddingActivityFor(null);
    reload();
    toast.success('Activity added');
  }

  async function handleRemoveActivity(id) {
    await request(`/stop-activities/${id}`, { method: 'DELETE', token });
    reload();
    toast.success('Activity removed');
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!trip) return null;

  const tripDays = Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / 86400000
  ) + 1;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Link to="/trips" className="hover:text-primary transition-colors">My Trips</Link>
            <span>/</span>
            <span>Build Itinerary</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            📅 {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)} &nbsp;·&nbsp; {tripDays} days
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/trips/${tripId}`}>
              <Eye className="size-4 mr-1" /> View Itinerary
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/trips/${tripId}/budget`}>
              <Wallet className="size-4 mr-1" /> Budget Breakdown
            </Link>
          </Button>
        </div>
      </div>

      {/* Budget summary cards */}
      {budget && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Cost', value: `$${budget.total}` },
            { label: 'Avg / Day', value: `$${budget.averagePerDay}` },
            { label: 'Total Days', value: budget.totalDays },
            { label: 'Stops', value: trip.stops.length },
          ].map((s) => (
            <Card key={s.label} className="p-3 text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-muted-foreground text-xs">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {budget?.overBudget && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
          ⚠️ Over budget! Estimated ${budget.total} exceeds your ${budget.totalBudget} limit.
        </div>
      )}

      {/* Empty State */}
      {trip.stops.length === 0 && (
        <Card className="text-center py-16 border-2 border-dashed">
          <div className="text-5xl mb-3">🗺️</div>
          <h3 className="text-lg font-semibold mb-1">No stops yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Add your first city stop to start building your itinerary.</p>
          <Button onClick={() => setAddingStop(true)}>
            <Plus className="size-4 mr-1" /> Add First Stop
          </Button>
        </Card>
      )}

      {/* Stop Cards */}
      <div className="space-y-4">
        {trip.stops.map((stop, i) => {
          const sb = stopBudget(stop.id);
          const stopDays = Math.ceil(
            (new Date(stop.endDate) - new Date(stop.startDate)) / 86400000
          ) + 1;

          return (
            <Card key={stop.id} className="border-l-4 border-l-primary overflow-hidden">
              <CardHeader className="bg-muted/40 py-3 px-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {stop.city.name}
                        <span className="text-muted-foreground font-normal text-xs">{stop.city.country}</span>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {stop.startDate.slice(0, 10)} → {stop.endDate.slice(0, 10)} &nbsp;·&nbsp; {stopDays} day{stopDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sb && (
                      <Badge variant="secondary" className="font-semibold">
                        ${sb.total} est.
                      </Badge>
                    )}
                    <Button size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStop(stop.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {stop.activities.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic py-1 mb-3">
                    No activities scheduled yet.
                  </p>
                ) : (
                  <ul className="divide-y divide-border mb-4">
                    {stop.activities.map((sa) => (
                      <li key={sa.id} className="flex items-center justify-between py-2.5 group">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[sa.activity.category] || 'bg-muted text-foreground'}`}>
                            {sa.activity.category}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{sa.activity.name}</p>
                            <p className="text-xs text-muted-foreground">{sa.scheduledDate.slice(0, 10)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">${Number(sa.costOverride ?? sa.activity.cost)}</span>
                          <Button size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveActivity(sa.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <Button size="sm" variant="outline" onClick={() => setAddingActivityFor(stop.id)}>
                  <Plus className="size-4 mr-1" /> Add Activity
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {trip.stops.length > 0 && (
        <Button variant="outline" className="w-full py-6 border-dashed" onClick={() => setAddingStop(true)}>
          <Plus className="size-4 mr-1" /> Add Another City Stop
        </Button>
      )}

      {/* Activity Dialog */}
      <Dialog open={addingActivityFor != null} onOpenChange={(open) => !open && setAddingActivityFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Activity{addingActivityFor && ` in ${trip.stops.find((s) => s.id === addingActivityFor)?.city.name}`}</DialogTitle>
          </DialogHeader>
          {addingActivityFor && (
            <ActivityPicker
              cityId={trip.stops.find((s) => s.id === addingActivityFor)?.cityId}
              onSelect={(a) => handleAddActivity(addingActivityFor, a)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stop Dialog */}
      <Dialog open={addingStop} onOpenChange={(open) => !open && closeAddStop()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add City Stop</DialogTitle>
          </DialogHeader>
          {!pendingCity ? (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Search and select a city to add to your trip.</p>
              <CityPicker onSelect={setPendingCity} />
            </div>
          ) : (
            <form onSubmit={handleAddStop} className="space-y-4">
              {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg">📍</div>
                <div>
                  <p className="font-semibold text-sm">{pendingCity.name}</p>
                  <p className="text-xs text-muted-foreground">{pendingCity.country}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setPendingCity(null)} className="ml-auto text-xs">
                  Change
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="stopStart">Start Date</Label>
                  <Input
                    id="stopStart"
                    type="date"
                    required
                    min={trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    value={stopDates.startDate}
                    onChange={(e) => setStopDates({ ...stopDates, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="stopEnd">End Date</Label>
                  <Input
                    id="stopEnd"
                    type="date"
                    required
                    min={stopDates.startDate || trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    value={stopDates.endDate}
                    onChange={(e) => setStopDates({ ...stopDates, endDate: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Stop'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
