import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, MapPin, Wallet, CalendarRange } from 'lucide-react';
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

export default function ItineraryBuilder() {
  const { tripId } = useParams();
  const { token } = useAuth();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [addingStop, setAddingStop] = useState(false);
  const [pendingCity, setPendingCity] = useState(null);
  const [stopDates, setStopDates] = useState({ startDate: '', endDate: '' });
  const [addingActivityFor, setAddingActivityFor] = useState(null); // stop id
  const [error, setError] = useState('');

  async function reload() {
    const [t, b] = await Promise.all([
      request(`/trips/${tripId}`, { token }),
      request(`/trips/${tripId}/budget`, { token }),
    ]);
    setTrip(t);
    setBudget(b);
  }

  useEffect(() => { reload(); }, [tripId]);

  if (!trip) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <Skeleton className="mb-4 h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

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
    try {
      await request(`/trips/${tripId}/stops`, { method: 'POST', token, body: { cityId: pendingCity.id, ...stopDates } });
      closeAddStop();
      reload();
      toast.success('Section added');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteStop(id) {
    await request(`/stops/${id}`, { method: 'DELETE', token });
    reload();
    toast.success('Section removed');
  }

  async function handleAddActivity(stopId, activity) {
    const stop = trip.stops.find((s) => s.id === stopId);
    await request(`/stops/${stopId}/activities`, { method: 'POST', token, body: { activityId: activity.id, scheduledDate: stop.startDate.slice(0, 10) } });
    setAddingActivityFor(null);
    reload();
    toast.success('Activity added');
  }

  async function handleRemoveActivity(id) {
    await request(`/stop-activities/${id}`, { method: 'DELETE', token });
    reload();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <PageHeader title={`Build Itinerary — ${trip.name}`} description={`${trip.startDate.slice(0, 10)} → ${trip.endDate.slice(0, 10)}`} />

      <div className="flex flex-col gap-4">
        {trip.stops.map((stop, i) => (
          <Card key={stop.id} className="border-l-4 border-l-primary">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{i + 1}</span>
                  <MapPin className="size-4 text-muted-foreground" /> {stop.city.name}, {stop.city.country}
                </CardTitle>
                <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteStop(stop.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CalendarRange className="size-4" /> {stop.startDate.slice(0, 10)} to {stop.endDate.slice(0, 10)}</span>
                <span className="flex items-center gap-1.5"><Wallet className="size-4" /> ${stopBudget(stop.id)?.total ?? '—'} budget</span>
              </div>

              {stop.activities.length > 0 && (
                <ul className="mb-3 flex flex-col gap-2">
                  {stop.activities.map((sa) => (
                    <li key={sa.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                      <span>{sa.activity.name} <span className="text-muted-foreground">· {sa.scheduledDate.slice(0, 10)}</span></span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">${Number(sa.costOverride ?? sa.activity.cost)}</Badge>
                        <Button size="icon-sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveActivity(sa.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <Button size="sm" variant="outline" onClick={() => setAddingActivityFor(stop.id)}>
                <Plus className="size-4" /> Add Activity
              </Button>
            </CardContent>
          </Card>
        ))}

        <Button variant="secondary" className="self-start" onClick={() => setAddingStop(true)}>
          <Plus className="size-4" /> Add Another Section
        </Button>
      </div>

      <Dialog open={addingActivityFor != null} onOpenChange={(open) => !open && setAddingActivityFor(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Activity{addingActivityFor && ` in ${trip.stops.find((s) => s.id === addingActivityFor)?.city.name}`}</DialogTitle>
          </DialogHeader>
          {addingActivityFor && (
            <ActivityPicker cityId={trip.stops.find((s) => s.id === addingActivityFor)?.cityId} onSelect={(a) => handleAddActivity(addingActivityFor, a)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={addingStop} onOpenChange={(open) => !open && closeAddStop()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Stop</DialogTitle>
          </DialogHeader>
          {!pendingCity ? (
            <CityPicker onSelect={setPendingCity} />
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleAddStop}>
              {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <p className="text-sm">Selected: <strong>{pendingCity.name}, {pendingCity.country}</strong></p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="stopStart">Start Date</Label>
                  <Input id="stopStart" type="date" required value={stopDates.startDate} onChange={(e) => setStopDates({ ...stopDates, startDate: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="stopEnd">End Date</Label>
                  <Input id="stopEnd" type="date" required value={stopDates.endDate} onChange={(e) => setStopDates({ ...stopDates, endDate: e.target.value })} />
                </div>
              </div>
              <Button type="submit" className="self-start">Save Section</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
