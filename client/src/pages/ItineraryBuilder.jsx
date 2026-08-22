import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Plus, Trash2, MapPin, Wallet, CalendarRange, Eye,
  PlaneTakeoff, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import request from '../api/client';
import { useAuth } from '../context/AuthContext';
import CityPicker from '../components/CityPicker';
import ActivityPicker from '../components/ActivityPicker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CATEGORY_COLORS = {
  sightseeing: 'bg-[#7FA593]/20 text-[#16302B] border-[#7FA593]/40',
  food: 'bg-[#F2A93B]/20 text-[#8a5b0f] border-[#F2A93B]/40',
  adventure: 'bg-[#E15B4F]/15 text-[#E15B4F] border-[#E15B4F]/30',
  culture: 'bg-[#16302B]/10 text-[#16302B] border-[#16302B]/20',
  relaxation: 'bg-[#7FA593]/15 text-[#2d5244] border-[#7FA593]/30',
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
      toast.success('City stop added to route');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteStop(id) {
    await request(`/stops/${id}`, { method: 'DELETE', token });
    reload();
    toast.success('Stop removed from route');
  }

  async function handleAddActivity(stopId, activity) {
    const stop = trip.stops.find((s) => s.id === stopId);
    const body = activity.source === 'live'
      ? { liveActivity: activity, scheduledDate: stop.startDate.slice(0, 10) }
      : { activityId: activity.id, scheduledDate: stop.startDate.slice(0, 10) };
    await request(`/stops/${stopId}/activities`, { method: 'POST', token, body });
    setAddingActivityFor(null);
    reload();
    toast.success('Activity booked onto itinerary');
  }

  async function handleRemoveActivity(id) {
    await request(`/stop-activities/${id}`, { method: 'DELETE', token });
    reload();
    toast.success('Activity removed');
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FBF6ED]">
        <div className="text-center font-mono text-xs uppercase tracking-widest text-[#16302B]/60">
          Loading itinerary manifest...
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const tripDays = Math.ceil(
    (new Date(trip.endDate) - new Date(trip.startDate)) / 86400000
  ) + 1;

  return (
    <main className="relative min-h-svh overflow-x-clip bg-[#FBF6ED] text-[#16302B]">
      {/* Ledger-line texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(180deg, #16302B 0px, #16302B 1px, transparent 1px, transparent 34px)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 lg:px-8 space-y-8">
        
        {/* Header Manifest Card */}
        <div className="relative rounded-2xl border border-[#16302B]/12 bg-white/70 p-6 sm:p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#16302B]/50 mb-1">
                <Link to="/trips" className="hover:text-[#E15B4F]">My Trips</Link>
                <span>/</span>
                <span>Itinerary Builder</span>
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#16302B]">
                {trip.name}
              </h1>
              <p className="mt-1 font-mono text-xs text-[#16302B]/65 flex items-center gap-2">
                <CalendarRange className="size-3.5 text-[#E15B4F]" />
                {trip.startDate.slice(0, 10)} → {trip.endDate.slice(0, 10)} · {tripDays} days
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 self-start">
              <Link
                to={`/trips/${tripId}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#16302B]/20 bg-transparent px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[#16302B] transition-colors hover:bg-[#16302B]/5"
              >
                <Eye className="size-3.5" /> Timeline View
              </Link>
              <Link
                to={`/trips/${tripId}/budget`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#E15B4F] px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] shadow-sm transition-opacity hover:opacity-90"
              >
                <Wallet className="size-3.5" /> Budget Breakdown
              </Link>
            </div>
          </div>

          {/* Quick Stats strip inside Header */}
          {budget && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-dashed border-[#16302B]/15 pt-4">
              {[
                { label: 'Total Est. Cost', value: `$${budget.total}` },
                { label: 'Avg / Day', value: `$${budget.averagePerDay}` },
                { label: 'Total Days', value: budget.totalDays },
                { label: 'Destination Stops', value: trip.stops.length },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#16302B]/45">{s.label}</p>
                  <p className="font-serif text-lg font-semibold text-[#16302B]">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {budget?.overBudget && (
          <div className="flex items-center gap-2.5 rounded-xl border border-[#E15B4F]/30 bg-[#E15B4F]/10 px-4 py-3 text-xs text-[#E15B4F] font-medium">
            <AlertTriangle className="size-4 flex-shrink-0" />
            <span>Over budget! Estimated ${budget.total} exceeds your ${budget.totalBudget} limit.</span>
          </div>
        )}

        {/* Empty State */}
        {trip.stops.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#16302B]/20 bg-white/60 py-16 text-center shadow-sm">
            <span className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-[#16302B] text-[#F2A93B] mb-3">
              <PlaneTakeoff className="size-5" />
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#16302B]">No destination stops mapped yet</h3>
            <p className="mt-1 font-mono text-xs text-[#16302B]/50 max-w-sm mx-auto mb-6">
              Add your first destination to start building your daily schedule.
            </p>
            <button
              onClick={() => setAddingStop(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E15B4F] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] shadow-sm hover:opacity-90"
            >
              <Plus className="size-4" /> Add First City Stop
            </button>
          </div>
        )}

        {/* Route Stops list */}
        <div className="space-y-6">
          {trip.stops.map((stop, i) => {
            const sb = stopBudget(stop.id);
            const stopDays = Math.ceil(
              (new Date(stop.endDate) - new Date(stop.startDate)) / 86400000
            ) + 1;

            return (
              <div
                key={stop.id}
                className="group relative rounded-xl border border-[#16302B]/12 bg-white p-6 shadow-none transition-all hover:border-[#16302B]/25 hover:shadow-sm"
              >
                {/* Stop header */}
                <div className="flex items-center justify-between border-b border-dashed border-[#16302B]/12 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-[#16302B] text-[#FBF6ED] font-mono text-xs font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#16302B] flex items-center gap-2">
                        {stop.city.name}
                        <span className="font-mono text-xs font-normal text-[#16302B]/50">
                          {stop.city.country}
                        </span>
                      </h3>
                      <p className="font-mono text-[11px] text-[#16302B]/55">
                        {stop.startDate.slice(0, 10)} → {stop.endDate.slice(0, 10)} · {stopDays} day{stopDays !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sb && (
                      <span className="rounded border border-[#F2A93B]/40 bg-[#F2A93B]/15 px-2.5 py-1 font-mono text-xs font-semibold text-[#8a5b0f]">
                        ${sb.total} est.
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="rounded p-1.5 text-[#16302B]/35 transition-colors hover:bg-[#E15B4F]/10 hover:text-[#E15B4F]"
                      title="Remove city stop"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Stop Activities */}
                <div>
                  {stop.activities.length === 0 ? (
                    <p className="font-mono text-xs text-[#16302B]/45 italic py-1 mb-4">
                      No activities planned for {stop.city.name} yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-dashed divide-[#16302B]/10 mb-4">
                      {stop.activities.map((sa) => (
                        <li key={sa.id} className="flex items-center justify-between py-2.5">
                          <div className="flex items-center gap-3">
                            <span className={`rounded px-2 py-0.5 font-mono text-[10px] uppercase border font-semibold ${CATEGORY_COLORS[sa.activity.category] || 'bg-muted'}`}>
                              {sa.activity.category}
                            </span>
                            <div>
                              <p className="font-serif text-sm font-semibold text-[#16302B]">{sa.activity.name}</p>
                              <p className="font-mono text-[10px] text-[#16302B]/45">{sa.scheduledDate.slice(0, 10)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-semibold text-[#16302B]">
                              ${Number(sa.costOverride ?? sa.activity.cost)}
                            </span>
                            <button
                              onClick={() => handleRemoveActivity(sa.id)}
                              className="rounded p-1 text-[#16302B]/30 hover:text-[#E15B4F] transition-colors"
                              title="Remove activity"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setAddingActivityFor(stop.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#16302B]/20 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[#16302B]/75 transition-colors hover:border-[#16302B] hover:bg-[#FBF6ED]"
                  >
                    <Plus className="size-3.5 text-[#E15B4F]" /> Add Activity
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {trip.stops.length > 0 && (
          <button
            onClick={() => setAddingStop(true)}
            className="w-full rounded-xl border border-dashed border-[#16302B]/30 bg-white/40 py-4 font-mono text-xs uppercase tracking-widest text-[#16302B]/70 transition-all hover:bg-white hover:border-[#16302B]"
          >
            + Add Another Destination Stop
          </button>
        )}
      </div>

      {/* Activity Picker Modal */}
      <Dialog open={addingActivityFor != null} onOpenChange={(open) => !open && setAddingActivityFor(null)}>
        <DialogContent className="bg-[#FBF6ED] border border-[#16302B]/20 text-[#16302B] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="border-b border-dashed border-[#16302B]/15 pb-3">
            <DialogTitle className="font-serif text-lg font-semibold">
              Add Activity in {trip.stops.find((s) => s.id === addingActivityFor)?.city.name}
            </DialogTitle>
          </DialogHeader>
          {addingActivityFor && (
            <div className="pt-2">
              <ActivityPicker
                cityId={trip.stops.find((s) => s.id === addingActivityFor)?.cityId}
                onSelect={(a) => handleAddActivity(addingActivityFor, a)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Stop Modal */}
      <Dialog open={addingStop} onOpenChange={(open) => !open && closeAddStop()}>
        <DialogContent className="bg-[#FBF6ED] border border-[#16302B]/20 text-[#16302B] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="border-b border-dashed border-[#16302B]/15 pb-3">
            <DialogTitle className="font-serif text-lg font-semibold">
              Add Destination Stop
            </DialogTitle>
          </DialogHeader>

          {!pendingCity ? (
            <div className="pt-2">
              <p className="font-mono text-xs text-[#16302B]/50 mb-3">Select a city to add to your journey route:</p>
              <CityPicker onSelect={setPendingCity} />
            </div>
          ) : (
            <form onSubmit={handleAddStop} className="space-y-4 pt-2">
              {error && (
                <p className="rounded border border-[#E15B4F]/30 bg-[#E15B4F]/10 px-3 py-2 font-mono text-xs text-[#E15B4F]">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#16302B]/15 bg-white">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#16302B] text-[#F2A93B]">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="font-serif text-sm font-semibold">{pendingCity.name}</p>
                    <p className="font-mono text-[10px] text-[#16302B]/50">{pendingCity.country}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingCity(null)}
                  className="font-mono text-xs text-[#E15B4F] hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#16302B]/60">
                    Arrive Date
                  </label>
                  <input
                    type="date"
                    required
                    min={trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    value={stopDates.startDate}
                    onChange={(e) => setStopDates({ ...stopDates, startDate: e.target.value })}
                    className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none focus:border-[#16302B]"
                  />
                </div>
                <div className="grid gap-1">
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#16302B]/60">
                    Depart Date
                  </label>
                  <input
                    type="date"
                    required
                    min={stopDates.startDate || trip.startDate.slice(0, 10)}
                    max={trip.endDate.slice(0, 10)}
                    value={stopDates.endDate}
                    onChange={(e) => setStopDates({ ...stopDates, endDate: e.target.value })}
                    className="w-full rounded border border-[#16302B]/20 bg-white px-3 py-2 text-xs outline-none focus:border-[#16302B]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-[#E15B4F] py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#FBF6ED] hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Adding Stop...' : 'Confirm Stop'}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
